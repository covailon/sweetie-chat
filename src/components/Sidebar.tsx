import React, { useState } from 'react';
import { Search, MoreHorizontal } from 'lucide-react';
import { Character, Message } from '../types';

interface SidebarProps {
  characters: Character[];
  activeCharId: string | null;
  onSelectChar: (id: string) => void;
  messages: Message[];
}

export function Sidebar({ characters, activeCharId, onSelectChar, messages }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChars = characters.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLastMessage = (charId: string) => {
    const charMsgs = messages.filter(m => m.characterId === charId);
    if (charMsgs.length === 0) return 'Bắt đầu trò chuyện...';
    return charMsgs[charMsgs.length - 1].text;
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#FFF5F8] border-r border-[#FAD4E6]">
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#5D4055]">Đoạn chat</h1>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full bg-[#FFE4F0] flex items-center justify-center hover:bg-[#FFD1E3] transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-[#A897A0]" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFE4F0] text-[#5D4055] text-sm rounded-full py-1.5 pl-9 pr-4 focus:outline-none placeholder-[#A897A0]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-2">
        {filteredChars.map(char => (
          <div 
            key={char.id}
            onClick={() => onSelectChar(char.id)}
            className={`flex items-center gap-3 px-2 py-2 mx-2 rounded-lg cursor-pointer transition-colors ${
              activeCharId === char.id ? 'bg-[#FFE4F0]' : 'hover:bg-[#FFE4F0]'
            }`}
          >
            <img src={char.avatar} alt={char.name} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-medium text-[#5D4055] truncate">{char.name}</h3>
              <p className={`text-[12px] truncate ${activeCharId === char.id ? 'text-[#FF6B9E]' : 'text-[#A897A0]'}`}>
                {getLastMessage(char.id)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
