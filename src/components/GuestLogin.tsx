import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface GuestLoginProps {
  onLogin: (profile: UserProfile) => void;
}

export function GuestLogin({ onLogin }: GuestLoginProps) {
  const [isSplash, setIsSplash] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên và mật khẩu');
      return;
    }
    if (username.length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Tạo một ID cố định dựa trên tên đăng nhập và mật khẩu
      // Giúp người dùng "đăng nhập" lại và giữ nguyên dữ liệu mà không cần Firebase Auth
      const uid = btoa(encodeURIComponent(`${username.toLowerCase()}:${password}`));

      onLogin({
        name: username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
        uid: uid
      });
    } catch (err: any) {
      console.error(err);
      setError('Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (isSplash) {
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

  return (
    <div className="min-h-screen bg-[#FFE4E1] flex items-center justify-center p-4 font-sans">
      <div className="bg-[#FFF0F5] p-8 rounded-3xl max-w-md w-full border border-[#FAD4E6] shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-pink-500/10 to-transparent pointer-events-none"></div>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shadow-lg mb-6 z-10">
          <span className="text-white font-bold text-3xl">S</span>
        </div>
        
        <h1 className="text-2xl font-bold text-[#5D4055] mb-2 z-10">Sweetie Chat</h1>
        <p className="text-[#A897A0] mb-8 text-sm z-10">
          {isLoginMode ? 'Đăng nhập để trò chuyện cùng các Bot AI' : 'Tạo tài khoản mới để bắt đầu'}
        </p>
        
        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg p-3 mb-4 z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="w-full flex flex-col gap-4 z-10">
          <div className="text-left">
            <label className="block text-sm font-medium text-[#5D4055] mb-1">Tên đăng nhập</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên của bạn"
              className="w-full bg-[#FFFFFF] text-[#5D4055] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B9E] transition-all border border-[#FAD4E6]"
            />
          </div>
          
          <div className="text-left">
            <label className="block text-sm font-medium text-[#5D4055] mb-1">Mật khẩu</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              className="w-full bg-[#FFFFFF] text-[#5D4055] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B9E] transition-all border border-[#FAD4E6]"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF7EB3] to-[#FF65A3] text-white rounded-xl py-3.5 font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-3 shadow-md disabled:opacity-50 mt-2"
          >
            {loading ? 'Đang xử lý...' : (isLoginMode ? 'Đăng nhập' : 'Đăng ký')}
          </button>
        </form>

        <div className="mt-6 z-10">
          <button 
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
            }}
            className="text-[#FF6B9E] hover:text-[#E65A8D] text-sm font-medium transition-colors"
          >
            {isLoginMode ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}
