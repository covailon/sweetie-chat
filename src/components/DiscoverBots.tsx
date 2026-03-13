import React, { useState } from 'react';
import { Search, PlusCircle, MessageCircle } from 'lucide-react';
import { Character } from '../types';
import { RECOMMENDED_BOTS } from '../constants';

interface DiscoverBotsProps {
  userCharacters: Character[];
  allBots?: Character[];
  onAddCharacter: (char: Character) => void;
  onChatWithCharacter: (charId: string) => void;
}

export function DiscoverBots({ userCharacters, allBots = [], onAddCharacter, onChatWithCharacter }: DiscoverBotsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Combine recommended bots with user-created bots from Firestore
  const combinedBots = [
    ...RECOMMENDED_BOTS,
    ...allBots.map(bot => ({
      ...bot,
      tags: ['Cộng đồng'] // Add a default tag for community bots
    }))
  ];

  // Remove duplicates by ID (in case a recommended bot is also in allBots)
  const uniqueBots = Array.from(new Map(combinedBots.map(bot => [bot.id, bot])).values());

  const filteredBots = uniqueBots.filter(bot => 
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (bot.tags && bot.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleAction = (bot: any) => {
    const isAlreadyAdded = userCharacters.some(c => c.id === bot.id);
    if (isAlreadyAdded) {
      onChatWithCharacter(bot.id);
    } else {
      const newChar: Character = {
        id: bot.id,
        name: bot.name,
        avatar: bot.avatar,
        description: bot.description,
        systemPrompt: bot.systemPrompt,
        affection: 0,
        firstMessage: bot.firstMessage,
      };
      onAddCharacter(newChar);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFF0F5] overflow-hidden">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#FAD4E6] bg-[#FFFFFF] shadow-sm z-10 flex-shrink-0">
        <h2 className="text-xl font-bold text-[#5D4055]">Tìm kiếm Bot</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-[#A897A0]" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm bot theo tên, mô tả, hoặc tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFFFF] text-[#5D4055] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#FF6B9E] border border-[#FAD4E6] shadow-sm text-lg"
            />
          </div>

          <h3 className="text-lg font-semibold text-[#5D4055] mb-4">Bot Đề Xuất</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBots.map(bot => {
              const isAdded = userCharacters.some(c => c.id === bot.id);
              return (
                <div key={bot.id} className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#FAD4E6] flex flex-col hover:border-[#FFD1E3] transition-colors shadow-sm">
                  <div className="flex items-start gap-4 mb-3">
                    <img src={bot.avatar} alt={bot.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#FAD4E6]" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <h4 className="font-bold text-[#5D4055] text-lg">{bot.name}</h4>
                      <p className="text-sm text-[#A897A0] line-clamp-2 mt-1">{bot.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                    {bot.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-[#FFE4F0] text-[#8E7A86] text-xs rounded-lg font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleAction(bot)}
                    className={`w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                      isAdded 
                        ? 'bg-[#FFE4F0] text-[#5D4055] hover:bg-[#FFD1E3]' 
                        : 'bg-[#FF6B9E] text-white hover:bg-[#E65A8D]'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <MessageCircle size={18} />
                        Nhắn tin
                      </>
                    ) : (
                      <>
                        <PlusCircle size={18} />
                        Thêm Bot
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {filteredBots.length === 0 && (
            <div className="text-center text-[#A897A0] py-12">
              <p className="text-lg">Không tìm thấy bot nào phù hợp với "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
