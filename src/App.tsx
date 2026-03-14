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
import { db } from './firebase';
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

  useEffect(() => {
    if (!userProfile) return;

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
  }, [userProfile]);

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

  if (!userProfile) {
    return <GuestLogin onLogin={setUserProfile} />;
  }

  const activeCharacter = characters.find(c => c.id === activeCharId) || null;

  const handleCreateBot = async (newChar: Character) => {
    if (!userProfile) return;
    
    const charToSave: Character = {
      ...newChar,
      creatorId: userProfile.uid || 'anonymous',
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
      const charMessages = currentMessages.filter(m => m.characterId === charId);

      // Build transcript
      const transcript = charMessages.map(m => {
        let msgContent = m.text;
        if (m.imageUrl) msgContent += ' [Đã gửi một hình ảnh]';
        if (m.stickerUrl) msgContent += ' [Đã gửi một nhãn dán]';
        return `${m.sender === 'user' ? userProfile.name : character.name}: ${msgContent}`;
      }).join('\n');

      // Extract image data if present
      let imageData: { base64: string; mimeType: string } | undefined;
      if (imageUrl) {
        const match = imageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          imageData = { mimeType: match[1], base64: match[2] };
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: character.name,
          systemPrompt: character.systemPrompt,
          userName: userProfile.name,
          transcript,
          imageData,
          allowNsfw: appSettings.allowNsfw,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.text || '...';

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
