import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface GuestLoginProps {
  onLogin: (profile: UserProfile) => void;
}

export function GuestLogin({ onLogin }: GuestLoginProps) {
  const [isSplash, setIsSplash] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      onLogin({
        name: user.displayName || 'Google User',
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}&backgroundColor=b6e3f4,c0aede,d1d4f9`
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đăng nhập Google thất bại');
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
        <p className="text-[#A897A0] mb-8 text-sm z-10">Đăng nhập để trò chuyện cùng các Bot AI</p>
        
        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg p-3 mb-4 z-10">
            {error}
          </div>
        )}

        <div className="w-full flex flex-col gap-4 z-10">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-gray-900 rounded-xl py-3.5 font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Tiếp tục với Google
          </button>
        </div>
      </div>
    </div>
  );
}
