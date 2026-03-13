import React from 'react';
import { AppSettings } from '../types';
import { Moon, Bell, Keyboard, Globe, ShieldAlert } from 'lucide-react';

interface SystemSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export function SystemSettings({ settings, onUpdateSettings }: SystemSettingsProps) {
  const updateSetting = (key: keyof AppSettings, value: any) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFFFFF] p-4 md:p-8 overflow-y-auto w-full">
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#5D4055] mb-8">Cài đặt hệ thống</h2>
        
        <div className="bg-[#FFF0F5] rounded-2xl p-6 border border-[#FAD4E6] mb-6">
          <h3 className="text-lg font-semibold text-[#5D4055] mb-4">Tùy chỉnh ứng dụng</h3>
          
          <div className="flex flex-col">
            <Toggle 
              icon={<Moon size={20} />}
              label="Giao diện tối"
              description="Mặc định cho SweetieChat"
              checked={settings.theme === 'dark'}
              onChange={() => {}}
              disabled={true}
            />
            <Toggle 
              icon={<Bell size={20} />}
              label="Âm thanh thông báo"
              description="Phát âm thanh khi có tin nhắn mới"
              checked={settings.notifications}
              onChange={(v) => updateSetting('notifications', v)}
            />
            <Toggle 
              icon={<Keyboard size={20} />}
              label="Gửi bằng Enter"
              description="Nhấn Enter để gửi, Shift+Enter để xuống dòng"
              checked={settings.sendOnEnter}
              onChange={(v) => updateSetting('sendOnEnter', v)}
            />
            <Toggle 
              icon={<ShieldAlert size={20} className="text-[#FF4D4D]" />}
              label="Chế độ 18+ (NSFW)"
              description="Tắt bộ lọc an toàn của AI. Cảnh báo: Có thể xuất hiện nội dung nhạy cảm."
              checked={settings.allowNsfw}
              onChange={(v) => updateSetting('allowNsfw', v)}
            />
            <div className="flex items-center justify-between py-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="text-[#8E7A86]"><Globe size={20} /></div>
                <div>
                  <div className="font-medium text-[#5D4055]">Ngôn ngữ</div>
                </div>
              </div>
              <select 
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value as 'vi' | 'en')}
                className="bg-[#FFE4F0] text-[#5D4055] rounded-lg px-3 py-1.5 outline-none border border-[#FAD4E6] focus:border-[#FF6B9E]"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, icon, checked, onChange, disabled = false, description = '' }: { label: string, icon: React.ReactNode, checked: boolean, onChange: (v: boolean) => void, disabled?: boolean, description?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#FAD4E6] last:border-0">
      <div className="flex items-center gap-3">
        <div className="text-[#8E7A86]">{icon}</div>
        <div>
          <div className={`font-medium ${disabled ? 'text-[#A897A0]' : 'text-[#5D4055]'}`}>{label}</div>
          {description && <div className="text-xs text-[#A897A0] mt-0.5">{description}</div>}
        </div>
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-[#FF6B9E]' : 'bg-[#FFE4F0]'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}
