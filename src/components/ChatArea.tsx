import React, { useState, useRef, useEffect } from 'react';
import { Phone, Video, Info, PlusCircle, Image as ImageIcon, Sticker, ThumbsUp, Send, Heart, ChevronLeft, Smile } from 'lucide-react';
import { Character, Message } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface ChatAreaProps {
  character: Character;
  messages: Message[];
  onSendMessage: (text: string, imageUrl?: string, stickerUrl?: string) => void;
  onBack?: () => void;
  sendOnEnter?: boolean;
  isTyping?: boolean;
}

const STICKERS = [
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=1',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=2',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=3',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=4',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=5',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=6',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=7',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=8',
];

export function ChatArea({ character, messages, onSendMessage, onBack, sendOnEnter = true, isTyping = false }: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      setShowEmojiPicker(false);
      setShowStickerPicker(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (sendOnEnter) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputText(prev => prev + emojiData.emoji);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onSendMessage(inputText.trim(), base64String);
        setInputText('');
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendSticker = (stickerUrl: string) => {
    onSendMessage('', undefined, stickerUrl);
    setShowStickerPicker(false);
  };

  const handleSendThumbsUp = () => {
    onSendMessage('👍');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#FFFFFF] relative">
      {/* Header */}
      <div className="h-14 px-2 md:px-4 flex items-center justify-between border-b border-[#FAD4E6] bg-[#FFFFFF] shadow-sm z-10">
        <div className="flex items-center gap-1 md:gap-3">
          {onBack && (
            <button onClick={onBack} className="md:hidden p-2 text-[#FF6B9E] hover:bg-[#FFE4F0] rounded-full transition-colors mr-1">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="flex items-center gap-3 cursor-pointer hover:bg-[#FFE4F0] p-1.5 rounded-lg transition-colors">
            <div className="relative">
              <img src={character.avatar} alt={character.name} className="w-9 h-9 rounded-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#31A24C] rounded-full border-2 border-[#FFFFFF]"></div>
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-[#5D4055]">{character.name}</h2>
              <div className="flex items-center gap-1 text-[11px] text-[#A897A0]">
                <span>Đang hoạt động</span>
                <span>•</span>
                <div className="flex items-center gap-1" title="Chỉ số tình cảm">
                  <Heart size={10} className={character.affection > 50 ? "text-[#FF4D4D] fill-[#FF4D4D]" : "text-[#FF4D4D]"} />
                  <span>{character.affection}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[#FF6B9E]">
          <Phone size={18} className="cursor-pointer" />
          <Video size={20} className="cursor-pointer" />
          <Info size={20} className="cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 relative z-0">
        <div className="flex flex-col items-center justify-center py-6">
          <img src={character.avatar} alt={character.name} className="w-20 h-20 rounded-full object-cover mb-3" referrerPolicy="no-referrer" />
          <h2 className="text-lg font-semibold text-[#5D4055]">{character.name}</h2>
          <p className="text-[#A897A0] text-xs mt-1 max-w-md text-center">{character.description}</p>
          <p className="text-[#A897A0] text-[11px] mt-3">Bạn đã kết nối với AI này trên SweetieChat</p>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            const showAvatar = !isUser && (index === messages.length - 1 || messages[index + 1]?.sender === 'user');
            
            return (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1`}
              >
                {!isUser && (
                  <div className="w-6 h-6 mr-2 flex-shrink-0 flex items-end">
                    {showAvatar && <img src={character.avatar} alt="" className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />}
                  </div>
                )}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Uploaded" className="max-w-full rounded-2xl mb-1 object-contain max-h-60" />
                  )}
                  {msg.stickerUrl && (
                    <img src={msg.stickerUrl} alt="Sticker" className="w-24 h-24 object-contain mb-1" />
                  )}
                  {msg.text && (
                    <div 
                      className={`px-3 py-1.5 text-[14px] ${
                        isUser 
                          ? 'bg-gradient-to-r from-[#FF7EB3] to-[#FF65A3] text-white rounded-2xl rounded-br-sm shadow-sm' 
                          : 'bg-[#FFFFFF] text-[#5D4055] rounded-2xl rounded-bl-sm shadow-sm border border-[#FAD4E6]'
                      }`}
                      style={{ wordBreak: 'break-word' }}
                    >
                      {msg.text}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex justify-start mb-1"
            >
              <div className="w-6 h-6 mr-2 flex-shrink-0 flex items-end">
                <img src={character.avatar} alt="AI is typing" className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="bg-[#FFFFFF] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 h-[38px] shadow-sm border border-[#FAD4E6]">
                <motion.div
                  className="w-1.5 h-1.5 bg-gradient-to-r from-[#FF6B9E] to-[#00C6FF] rounded-full"
                  animate={{ y: [0, -4, 0], scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                />
                <motion.div
                  className="w-1.5 h-1.5 bg-gradient-to-r from-[#FF6B9E] to-[#00C6FF] rounded-full"
                  animate={{ y: [0, -4, 0], scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                />
                <motion.div
                  className="w-1.5 h-1.5 bg-gradient-to-r from-[#FF6B9E] to-[#00C6FF] rounded-full"
                  animate={{ y: [0, -4, 0], scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Popovers */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 right-4 z-50"
          >
            <EmojiPicker 
              onEmojiClick={handleEmojiClick} 
              theme={'dark' as any} 
              searchDisabled 
              skinTonesDisabled 
              height={350}
            />
          </motion.div>
        )}
        {showStickerPicker && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 left-4 z-50 bg-[#FFFFFF] border border-[#FAD4E6] rounded-xl p-4 shadow-xl w-72"
          >
            <div className="grid grid-cols-4 gap-2">
              {STICKERS.map((sticker, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSendSticker(sticker)}
                  className="p-1 hover:bg-[#FFE4F0] rounded-lg"
                >
                  <img src={sticker} alt="Sticker" className="w-full h-auto" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-3 bg-[#FFFFFF] flex items-end gap-2 z-20 relative">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <div className="flex items-center gap-2 text-[#FF6B9E] pb-1.5">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-1 hover:bg-[#FFE4F0] rounded-full transition-colors">
            <PlusCircle size={20} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }} 
            onClick={() => fileInputRef.current?.click()}
            className="p-1 hover:bg-[#FFE4F0] rounded-full transition-colors"
          >
            <ImageIcon size={20} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }} 
            onClick={() => {
              setShowStickerPicker(!showStickerPicker);
              setShowEmojiPicker(false);
            }}
            className={`p-1 rounded-full transition-colors ${showStickerPicker ? 'bg-[#FFE4F0]' : 'hover:bg-[#FFE4F0]'}`}
          >
            <Sticker size={20} />
          </motion.button>
        </div>
        
        <div className="flex-1 relative bg-[#FFE4F0] rounded-3xl flex items-center min-h-[36px] pr-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Aa"
            className="w-full bg-transparent text-[#5D4055] text-[14px] px-3 py-1.5 focus:outline-none resize-none max-h-24"
            rows={1}
            style={{ minHeight: '36px' }}
          />
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }} 
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowStickerPicker(false);
            }}
            className={`p-1.5 text-[#FF6B9E] rounded-full transition-colors ${showEmojiPicker ? 'bg-[#FFD1E3]' : 'hover:bg-[#FFD1E3]'}`}
          >
            <Smile size={20} />
          </motion.button>
        </div>
        
        <div className="pb-1">
          {inputText.trim() ? (
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={handleSend} 
              className="text-[#FF6B9E] p-1 hover:bg-[#FFE4F0] rounded-full transition-colors"
            >
              <Send size={20} />
            </motion.button>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={handleSendThumbsUp}
              className="text-[#FF6B9E] p-1 hover:bg-[#FFE4F0] rounded-full transition-colors"
            >
              <ThumbsUp size={20} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
