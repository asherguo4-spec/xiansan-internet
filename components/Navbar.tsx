
import React from 'react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onLoginClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLoginClick }) => {
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <i className="fas fa-school text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">建安三高圈</h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-none">Jian'an No.3 High School</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex relative">
            <input 
              type="text" 
              placeholder="搜索校园动态..." 
              className="bg-gray-100 border-none rounded-full px-4 py-1.5 text-sm w-48 focus:ring-2 focus:ring-blue-500 transition-all focus:w-64 outline-none"
            />
            <i className="fas fa-search absolute right-3 top-2.5 text-gray-400 text-xs"></i>
          </div>

          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <span className="hidden sm:inline text-sm font-medium text-gray-700">{user.username}</span>
              <img 
                src={user.avatar_url} 
                alt={user.username} 
                className="w-9 h-9 rounded-full ring-2 ring-blue-50 ring-offset-1 object-cover cursor-pointer hover:opacity-80 transition-opacity"
              />
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:bg-blue-700 transition-colors"
            >
              登录 / 注册
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
