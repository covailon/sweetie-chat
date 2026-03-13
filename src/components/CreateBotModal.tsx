import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { Character } from '../types';

interface CreateBotModalProps {
  onClose: () => void;
  onCreate: (char: Character) => void;
}

export function CreateBotModal({ onClose, onCreate }: CreateBotModalProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim()) return;

    const newChar: Character = {
      id: Date.now().toString(),
      name: name.trim(),
      avatar: avatar.trim() || `https://picsum.photos/seed/${name.trim()}/200/200`,
      description: description.trim(),
      systemPrompt: systemPrompt.trim(),
      affection: 0,
    };
    
    if (firstMessage.trim()) {
      newChar.firstMessage = firstMessage.trim();
    }

    onCreate(newChar);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFFFF] rounded-xl w-full max-w-md shadow-2xl border border-[#FAD4E6] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-[#FAD4E6]">
          <h2 className="text-xl font-bold text-[#5D4055]">Tạo Bot AI Mới</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#FFE4F0] flex items-center justify-center hover:bg-[#FFD1E3] transition-colors">
            <X size={20} className="text-[#8E7A86]" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#8E7A86] mb-1">Tên nhân vật *</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#FFE4F0] text-[#5D4055] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B9E]"
              placeholder="VD: Sơn Tùng M-TP, Bạn gái ảo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8E7A86] mb-1">Mô tả ngắn</label>
            <input 
              type="text" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#FFE4F0] text-[#5D4055] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B9E]"
              placeholder="VD: Idol âm nhạc, luôn truyền cảm hứng..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8E7A86] mb-1">Link Ảnh đại diện (Tuỳ chọn)</label>
            <div className="flex gap-2 mb-2">
              <button 
                type="button" 
                onClick={() => {
                  if (!name) return alert('Vui lòng nhập tên nhân vật trước!');
                  const prompt = `${name} ${description} anime portrait high quality`;
                  setAvatar(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=400&nologo=true`);
                }}
                className="flex-1 bg-[#FFE4F0] hover:bg-[#FFD1E3] text-[#5D4055] text-xs py-1.5 rounded-md transition-colors border border-[#FFD1E3]"
              >
                🎨 Tạo Anime
              </button>
              <button 
                type="button" 
                onClick={() => {
                  if (!name) return alert('Vui lòng nhập tên nhân vật trước!');
                  const prompt = `${name} ${description} portrait photography realistic high resolution cinematic`;
                  setAvatar(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=400&nologo=true`);
                }}
                className="flex-1 bg-[#FFE4F0] hover:bg-[#FFD1E3] text-[#5D4055] text-xs py-1.5 rounded-md transition-colors border border-[#FFD1E3]"
              >
                📸 Tạo Ảnh Thật
              </button>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-[#FFE4F0] hover:bg-[#FFD1E3] text-[#5D4055] text-xs py-1.5 rounded-md transition-colors border border-[#FFD1E3] flex items-center justify-center gap-1"
              >
                <Upload size={14} /> Tải từ máy
              </button>
            </div>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <input 
              type="text" 
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              className="w-full bg-[#FFE4F0] text-[#5D4055] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B9E]"
              placeholder="https://... hoặc tải ảnh lên"
            />
            {avatar && (
              <div className="mt-2 flex justify-center">
                <img src={avatar} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-[#FAD4E6]" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8E7A86] mb-1">Prompt / Tính cách *</label>
            <textarea 
              required
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              className="w-full bg-[#FFE4F0] text-[#5D4055] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B9E] min-h-[120px] resize-y"
              placeholder="Bạn là [Tên], tính cách của bạn là... Hãy trả lời theo phong cách..."
            />
            <p className="text-xs text-[#A897A0] mt-1">Prompt càng chi tiết, AI nhập vai càng giống thật.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8E7A86] mb-1">Tin nhắn đầu tiên (Tuỳ chọn)</label>
            <textarea 
              value={firstMessage}
              onChange={e => setFirstMessage(e.target.value)}
              className="w-full bg-[#FFE4F0] text-[#5D4055] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B9E] min-h-[80px] resize-y"
              placeholder="Tin nhắn đầu tiên bot sẽ gửi cho bạn..."
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-[#FF6B9E] hover:bg-[#FFE4F0] transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit"
              className="px-4 py-2 rounded-lg font-medium bg-[#FF6B9E] text-white hover:bg-[#E65A8D] transition-colors disabled:opacity-50"
              disabled={!name.trim() || !systemPrompt.trim()}
            >
              Tạo Bot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
