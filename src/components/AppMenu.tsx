import React from 'react';
import { MessageCircle, PlusCircle, Settings, User, Search } from 'lucide-react';

interface AppMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreate: () => void;
}

export function AppMenu({ activeTab, setActiveTab, onOpenCreate }: AppMenuProps) {
  return (
    <div className="w-full md:w-[68px] h-[60px] md:h-full flex-shrink-0 bg-[#FFF0F5] border-t md:border-t-0 md:border-r border-[#FAD4E6] flex flex-row md:flex-col items-center justify-around md:justify-start py-2 md:py-4 md:gap-6 z-20">
      <div className="hidden md:flex w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 items-center justify-center shadow-lg mb-2">
        <span className="text-white font-bold text-xl">S</span>
      </div>
      
      <div className="flex flex-row md:flex-col gap-2 md:gap-3 w-full items-center justify-around md:justify-start px-4 md:px-0">
        <MenuButton icon={<MessageCircle />} label="Chat" isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
        <MenuButton icon={<Search />} label="Tìm Bot" isActive={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
        <MenuButton icon={<PlusCircle />} label="Tạo Bot" isActive={false} onClick={onOpenCreate} />
        <MenuButton icon={<User />} label="Cá nhân" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        <div className="md:hidden">
          <MenuButton icon={<Settings />} label="Cài đặt" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
      </div>

      <div className="hidden md:flex mt-auto flex-col gap-3 w-full items-center">
        <MenuButton icon={<Settings />} label="Cài đặt" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>
    </div>
  );
}

function MenuButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all group relative ${isActive ? 'bg-[#FF6B9E] text-white' : 'text-[#8E7A86] hover:bg-[#FFE4F0] hover:text-[#5D4055]'}`}
      title={label}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 22 })}
    </button>
  );
}
