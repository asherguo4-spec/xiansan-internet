
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg(null);
    
    if (!email || !password) {
      setErrorMsg('请填写邮箱和密码');
      return;
    }
    if (!isLogin && !username) {
      setErrorMsg('请填写一个昵称');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // 优化 Invalid login credentials 提示
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('账号或密码不正确，请重新输入');
          }
          throw error;
        }
        
        if (data.user) {
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: username }
          }
        });

        if (error) throw error;

        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: username,
            avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
            uid: Math.floor(Math.random() * 900000 + 100000).toString()
          });

          if (data.session) {
            onClose();
          } else {
            setErrorMsg('注册成功！请检查邮箱确认链接，完成后再登录。');
            setIsLogin(true);
          }
        }
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      setErrorMsg(err.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 pink-gradient rounded-3xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg shadow-pink-100">
              <i className={`fas ${isLogin ? 'fa-fingerprint' : 'fa-user-plus'}`}></i>
            </div>
            <h2 className="text-2xl font-black text-gray-800">{isLogin ? '欢迎回来' : '注册新账号'}</h2>
            <p className="text-gray-400 text-xs mt-2 font-bold tracking-widest uppercase">建安三高校园圈</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-bold leading-relaxed">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl pl-10 pr-4 py-4 focus:ring-2 focus:ring-pink-500 outline-none transition-all text-sm font-bold"
                  placeholder="你的昵称"
                />
              </div>
            )}
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl pl-10 pr-4 py-4 focus:ring-2 focus:ring-pink-500 outline-none transition-all text-sm font-bold"
                placeholder="邮箱地址"
              />
            </div>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl pl-10 pr-4 py-4 focus:ring-2 focus:ring-pink-500 outline-none transition-all text-sm font-bold"
                placeholder="密码 (最少6位)"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 pink-gradient text-white rounded-2xl font-black shadow-lg shadow-pink-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <i className="fas fa-circle-notch animate-spin text-xl"></i>
              ) : (
                <span>{isLogin ? '登录' : '注册并进入'}</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg(null);
              }}
              className="text-pink-500 text-xs font-black underline underline-offset-4"
            >
              {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
            </button>
            <div className="flex flex-col items-center gap-2">
              <button onClick={onClose} className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">暂时跳过</button>
              <p className="text-[8px] text-gray-200 font-bold">开发者：2322郭佳豪</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
