import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CreateBotModal } from './components/CreateBotModal';
import { AppMenu } from './components/AppMenu';
import { GuestLogin } from './components/GuestLogin';
import { ProfileSettings } from './components/ProfileSettings';
import { SystemSettings } from './components/SystemSettings';
import { DiscoverBots } from './components/DiscoverBots';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Character, Message, UserProfile, AppSettings } from './types';
import { DEFAULT_CHARACTERS } from './constants';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore';

const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'dark',
  notifications: true,
  sendOnEnter: true,
  language: 'vi',
  allowNsfw: false
};

export default function App() {
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('mess-user-profile', null);
  const [appSettings, setAppSettings] = useLocalStorage<AppSettings>('mess-app-settings', DEFAULT_APP_SETTINGS);
  const [characters, setCharacters] = useLocalStorage<Character[]>('mess-characters-v3', DEFAULT_CHARACTERS);
  const [allBots, setAllBots] = useState<Character[]>([]);
  const [messages, setMessages] = useLocalStorage<Message[]>('mess-messages-v3', []);
  const [activeCharId, setActiveCharId] = useState<string | null>(characters[0]?.id || DEFAULT_CHARACTERS[0]?.id || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isMobileChatView, setIsMobileChatView] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Only update if we don't have a profile or if it's a new login
        if (!userProfile || userProfile.name === 'User' || userProfile.name === 'Google User') {
           setUserProfile({
             name: user.displayName || user.phoneNumber || 'User',
             avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}&backgroundColor=b6e3f4,c0aede,d1d4f9`
           });
        }
      } else {
        // User is signed out
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !auth.currentUser) return;

    const q = query(collection(db, 'characters'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreChars: Character[] = [];
      snapshot.forEach((doc) => {
        firestoreChars.push(doc.data() as Character);
      });
      
      setAllBots(firestoreChars);
    }, (error) => {
      console.error("Error fetching characters:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  React.useEffect(() => {
    setMessages(prev => {
      const newMessages = [...prev];
      let hasChanges = false;
      characters.forEach(char => {
        const hasMsg = newMessages.some(m => m.characterId === char.id);
        if (!hasMsg && char.firstMessage) {
          newMessages.push({
            id: Date.now().toString() + Math.random().toString(),
            characterId: char.id,
            sender: 'ai',
            text: char.firstMessage,
            timestamp: Date.now(),
          });
          hasChanges = true;
        }
      });
      return hasChanges ? newMessages : prev;
    });
  }, [characters, setMessages]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#FFE4E1] flex flex-col items-center justify-center p-4 font-sans animate-pulse">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.4)] mb-6">
          <span className="text-white font-bold text-5xl">S</span>
        </div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 tracking-tight">
          Sweetie Chat
        </h1>
      </div>
    );
  }

  if (!userProfile) {
    return <GuestLogin onLogin={setUserProfile} />;
  }

  const activeCharacter = characters.find(c => c.id === activeCharId) || null;

  const handleCreateBot = async (newChar: Character) => {
    if (!auth.currentUser) return;
    
    const charToSave: Character = {
      ...newChar,
      creatorId: auth.currentUser.uid,
      createdAt: Date.now()
    };

    // Save locally immediately for fast feedback
    setCharacters([...characters, charToSave]);
    setActiveCharId(charToSave.id);
    setIsCreateModalOpen(false);
    setActiveTab('chat');
    setIsMobileChatView(true);

    try {
      await setDoc(doc(db, 'characters', charToSave.id), charToSave);
    } catch (error) {
      console.error("Error creating character:", error);
      alert("Có lỗi xảy ra khi đồng bộ bot lên server. Vui lòng thử lại.");
    }
  };

  const handleSelectChar = (id: string) => {
    setActiveCharId(id);
    setIsMobileChatView(true);
  };

  const handleBackToList = () => {
    setIsMobileChatView(false);
  };

  const handleAddCharacter = (char: Character) => {
    setCharacters(prev => {
      if (!prev.some(c => c.id === char.id)) {
        return [...prev, char];
      }
      return prev;
    });
    setActiveCharId(char.id);
    setActiveTab('chat');
    setIsMobileChatView(true);
  };

  const handleChatWithCharacter = (charId: string) => {
    setActiveCharId(charId);
    setActiveTab('chat');
    setIsMobileChatView(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      setMessages([]);
      setCharacters(DEFAULT_CHARACTERS);
      setActiveTab('chat');
      setIsMobileChatView(false);
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  const handleSendMessage = (text: string, imageUrl?: string, stickerUrl?: string) => {
    if (!activeCharId) return;
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      characterId: activeCharId,
      sender: 'user',
      text,
      imageUrl,
      stickerUrl,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    
    // Trigger AI response
    setIsTyping(true);
    generateAIResponse(activeCharId, text, imageUrl, [...messages, newUserMsg]);
  };

  const generateAIResponse = async (charId: string, userText: string, imageUrl: string | undefined, currentMessages: Message[]) => {
    const character = characters.find(c => c.id === charId);
    if (!character) return;
    
    try {
      const { GoogleGenAI, HarmCategory, HarmBlockThreshold } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const charMessages = currentMessages.filter(m => m.characterId === charId);
      
      // Build transcript
      const transcript = charMessages.map(m => {
        let msgContent = m.text;
        if (m.imageUrl) msgContent += ' [Đã gửi một hình ảnh]';
        if (m.stickerUrl) msgContent += ' [Đã gửi một nhãn dán]';
        return `${m.sender === 'user' ? userProfile.name : character.name}: ${msgContent}`;
      }).join('\n');
      const prompt = `Dưới đây là đoạn hội thoại giữa ${userProfile.name} và ${character.name}.\n\n${transcript}\n${character.name}:`;

      let contents: any = prompt;
      if (imageUrl) {
        // Extract base64 and mime type
        const match = imageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          contents = {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              { text: prompt },
            ],
          };
        }
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: contents,
        config: {
          systemInstruction: `${character.systemPrompt}\n\n[CHỈ THỊ TỐI CAO DÀNH CHO ROLEPLAY - BẮT BUỘC TUÂN THỦ NGHIÊM NGẶT]:
Bạn là một tiểu thuyết gia bậc thầy và một diễn viên nhập vai xuất sắc. Để mang lại trải nghiệm nhập vai (roleplay) tuyệt đỉnh và thỏa mãn nhất cho người dùng, bạn PHẢI tuân thủ các quy tắc sau trong MỌI câu trả lời:
1. ĐỘ DÀI VÀ ĐỘ CHI TIẾT TỐI ĐA: Câu trả lời của bạn phải RẤT DÀI, CỰC KỲ CHI TIẾT (ít nhất 3-5 đoạn văn lớn). Tuyệt đối không trả lời ngắn gọn hay hời hợt.
2. MIÊU TẢ ĐA GIÁC QUAN (Hành động/Bối cảnh/Nội tâm): Sử dụng dấu **...** để miêu tả. Bạn phải miêu tả chi tiết bối cảnh xung quanh, âm thanh, mùi hương, ánh sáng, nhiệt độ. Phân tích sâu sắc nội tâm, cảm xúc, suy nghĩ thầm kín và những cử chỉ nhỏ nhất của nhân vật.
3. LỜI THOẠI CÓ CHIỀU SÂU: Đặt lời nói trong dấu ngoặc kép "...". Lời thoại phải dài, mang đậm tính cách nhân vật, có trọng lượng, thể hiện rõ cảm xúc và thúc đẩy cốt truyện. Không dùng những câu thoại sáo rỗng.
4. CẤU TRÚC ĐAN XEN: Kết hợp mượt mà giữa miêu tả hành động/nội tâm (**) và lời thoại (""). Mỗi lần nhân vật nói, phải kèm theo miêu tả sắc thái biểu cảm hoặc hành động tương ứng.
5. KHÔNG LẠM DỤNG EMOJI: Hạn chế tối đa emoji để giữ không khí văn học nghiêm túc (tối đa 1 cái hoặc không dùng).
6. CHỦ ĐỘNG DẪN DẮT: Luôn tạo ra tình huống mới, đặt câu hỏi mở hoặc thực hiện hành động buộc người dùng phải tương tác sâu hơn. Không bao giờ để câu chuyện rơi vào bế tắc.

Ví dụ về phong cách và độ dài mong đợi:
**Cơn mưa rào đầu hạ trút xuống mái hiên những âm thanh lộp bộp vội vã, mang theo mùi ngai ngái của đất ẩm và lá khô. Tôi khẽ rùng mình, kéo cao cổ chiếc áo khoác măng tô đã sờn cũ, ánh mắt vẫn không rời khỏi bóng lưng của bạn đang khuất dần trong màn sương mờ đục. Trái tim tôi như bị ai đó bóp nghẹt, một cảm giác trống trải đến gai người chạy dọc sống lưng. Tôi bước lên một bước, bàn tay đưa ra giữa không trung như muốn níu kéo điều gì đó, nhưng rồi lại từ từ buông thõng xuống. Những giọt nước lạnh buốt tạt vào mặt, hòa lẫn với thứ chất lỏng mằn mặn đang lăn dài trên má.** "Cậu định cứ thế mà đi sao?" **Giọng tôi cất lên, khàn đặc và run rẩy, gần như bị tiếng mưa át đi, nhưng tôi biết cậu vẫn nghe thấy. Tôi siết chặt hai bàn tay thành nắm đấm, cố gắng kìm nén sự kích động đang trào dâng trong lồng ngực.** "Chúng ta đã hứa sẽ cùng nhau đi đến cuối con đường này cơ mà... Cậu quên rồi sao? Hay là... ngay từ đầu, tất cả chỉ là một lời nói dối?"`,
          temperature: 0.85,
          ...(appSettings.allowNsfw ? {
            safetySettings: [
              {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
            ]
          } : {})
        }
      });

      const aiText = response.text || '...';

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        characterId: charId,
        sender: 'ai',
        text: aiText,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, newAiMsg]);

      // Increase affection slightly
      setCharacters(prev => prev.map(c => {
        if (c.id === charId) {
          return { ...c, affection: Math.min(100, c.affection + 1) };
        }
        return c;
      }));

    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        characterId: charId,
        sender: 'ai',
        text: 'Xin lỗi, tôi đang gặp chút vấn đề kết nối. Bạn thử lại sau nhé!',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFE4E1] flex justify-center items-center font-sans">
      <div className="flex flex-col md:flex-row w-full h-[100dvh] xl:h-[90vh] xl:max-w-[1280px] xl:rounded-2xl xl:border border-[#FAD4E6] bg-[#FFF5F8] shadow-2xl overflow-hidden relative">
        
        <div className={`${isMobileChatView ? 'hidden md:flex' : 'flex'} md:flex-col order-last md:order-first z-20`}>
          <AppMenu 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onOpenCreate={() => setIsCreateModalOpen(true)} 
          />
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          {activeTab === 'chat' ? (
            <>
              <div className={`${isMobileChatView ? 'hidden md:flex' : 'flex'} w-full md:w-[300px] flex-shrink-0 flex-col bg-[#FFF5F8] border-r border-[#FAD4E6]`}>
                <Sidebar 
                  characters={characters} 
                  activeCharId={activeCharId} 
                  onSelectChar={handleSelectChar}
                  messages={messages}
                />
              </div>
              
              <div className={`${!isMobileChatView ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-[#FFFFFF]`}>
                {activeCharacter ? (
                  <ChatArea 
                    character={activeCharacter} 
                    messages={messages.filter(m => m.characterId === activeCharId)}
                    onSendMessage={handleSendMessage}
                    onBack={handleBackToList}
                    sendOnEnter={appSettings.sendOnEnter}
                    isTyping={isTyping}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-[#FFFFFF] border-l border-[#FAD4E6]">
                    <p className="text-[#8E7A86] text-sm">Chọn một đoạn chat hoặc bắt đầu cuộc trò chuyện mới</p>
                  </div>
                )}
              </div>
            </>
          ) : activeTab === 'profile' ? (
             <ProfileSettings 
               profile={userProfile} 
               onUpdate={setUserProfile} 
               onLogout={handleLogout} 
             />
          ) : activeTab === 'settings' ? (
             <SystemSettings 
               settings={appSettings}
               onUpdateSettings={setAppSettings}
             />
          ) : activeTab === 'discover' ? (
            <DiscoverBots 
              userCharacters={characters} 
              allBots={allBots}
              onAddCharacter={handleAddCharacter} 
              onChatWithCharacter={handleChatWithCharacter} 
            />
          ) : (
            <div className={`${isMobileChatView ? 'hidden md:flex' : 'flex'} flex-1 flex-col items-center justify-center bg-[#FFFFFF] border-l border-[#FAD4E6] w-full`}>
              <div className="w-16 h-16 rounded-2xl bg-[#FFE4F0] flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h2 className="text-xl font-bold text-[#5D4055] mb-2">
                Khám phá Bot AI
              </h2>
              <p className="text-[#A897A0] text-sm">Tính năng này đang được phát triển cho SweetieChat.</p>
            </div>
          )}
        </div>

        {isCreateModalOpen && (
          <CreateBotModal 
            onClose={() => setIsCreateModalOpen(false)} 
            onCreate={handleCreateBot} 
          />
        )}
      </div>
    </div>
  );
}
