import React, { useState } from 'react';
import { UserProfile } from '../types';
import { RefreshCw, Save, LogOut } from 'lucide-react';

interface ProfileSettingsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onLogout: () => void;
}

export function ProfileSettings({ profile, onUpdate, onLogout }: ProfileSettingsProps) {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (name.trim()) {
      onUpdate({ name: name.trim(), avatar });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFFFFF] p-4 md:p-8 overflow-y-auto w-full">
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#5D4055] mb-8">Trang cá nhân</h2>
        
        <div className="bg-[#FFF0F5] rounded-2xl p-6 border border-[#FAD4E6] mb-6">
          <h3 className="text-lg font-semibold text-[#5D4055] mb-4">Hồ sơ của bạn</h3>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            <div className="relative group">
              <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full bg-[#FFE4F0] object-cover border-2 border-[#FAD4E6]" referrerPolicy="no-referrer" />
              <button 
                onClick={handleRandomizeAvatar} 
                className="absolute bottom-0 right-0 p-2 bg-[#FFE4F0] text-[#5D4055] rounded-full hover:bg-[#FFD1E3] transition-colors shadow-lg border border-[#FAD4E6]"
                title="Đổi avatar ngẫu nhiên"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            
            <div className="flex-1 w-full">
              <div className="mb-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm bg-[#FFE4F0] hover:bg-[#FFD1E3] text-[#5D4055] px-4 py-2 rounded-lg transition-colors border border-[#FFD1E3]"
                >
                  Tải ảnh từ máy
                </button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <label className="block text-[#A897A0] mb-2 text-sm font-medium">Tên hiển thị</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-[#FFE4F0] text-[#5D4055] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B9E] transition-all" 
              />
            </div>
          </div>
          
          <div className="flex justify-end border-t border-[#FAD4E6] pt-4">
            <button 
              onClick={handleSave} 
              disabled={!name.trim() || (name === profile.name && avatar === profile.avatar)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B9E] text-white rounded-xl font-medium hover:bg-[#E65A8D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              Lưu thay đổi
            </button>
          </div>
        </div>

        <div className="bg-[#FFF0F5] rounded-2xl p-6 border border-[#FAD4E6]">
          <h3 className="text-lg font-semibold text-[#FF4D4D] mb-2">Vùng nguy hiểm</h3>
          <p className="text-[#A897A0] text-sm mb-4">Đăng xuất sẽ xóa toàn bộ dữ liệu tài khoản khách và lịch sử trò chuyện trên trình duyệt này.</p>
          
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 text-[#FF4D4D] rounded-xl font-medium hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={18} />
            Đăng xuất & Xóa dữ liệu
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] rounded-xl w-full max-w-sm shadow-2xl border border-[#FAD4E6] flex flex-col p-6">
            <h3 className="text-xl font-bold text-[#5D4055] mb-2">Xác nhận đăng xuất</h3>
            <p className="text-[#A897A0] mb-6">Bạn có chắc chắn muốn đăng xuất? Toàn bộ dữ liệu tài khoản khách và lịch sử trò chuyện sẽ bị xóa.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg font-medium text-[#5D4055] bg-[#FFE4F0] hover:bg-[#FFD1E3] transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="px-4 py-2 rounded-lg font-medium bg-[#FF4D4D] text-white hover:bg-red-600 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
