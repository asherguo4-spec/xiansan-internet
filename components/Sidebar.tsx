
import React from 'react';
import { PostTag } from '../types';

interface SidebarProps {
  currentFilter: PostTag;
  setFilter: (tag: PostTag) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentFilter, setFilter }) => {
  const menuItems = [
    // Fix: Replaced PostTag.ALL with PostTag.FEATURED
    { tag: PostTag.FEATURED, icon: 'fa-layer-group', label: '校园广场' },
    { tag: PostTag.LOVE, icon: 'fa-heart', label: '表白墙' },
    { tag: PostTag.RANT, icon: 'fa-comments', label: '吐槽墙' },
    { tag: PostTag.DAILY, icon: 'fa-camera-retro', label: '校园日常' },
    { tag: PostTag.HELP, icon: 'fa-hands-helping', label: '校园求助' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 overflow-hidden sticky top-20">
      <div className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.tag}
            onClick={() => setFilter(item.tag)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
              currentFilter === item.tag 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className={`fas ${item.icon} ${currentFilter === item.tag ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-400'} transition-colors w-5`}></i>
            {item.label}
            {currentFilter === item.tag && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-8 pt-4 border-t border-gray-100 px-4 pb-4">
        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">热门板块</h5>
        <div className="space-y-3">
          <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
            <span className="w-6 h-6 rounded bg-indigo-50 text-indigo-500 text-[10px] flex items-center justify-center font-bold">#</span>
            <span className="text-xs text-gray-600 font-medium">期末冲刺中</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
            <span className="w-6 h-6 rounded bg-pink-50 text-pink-500 text-[10px] flex items-center justify-center font-bold">#</span>
            <span className="text-xs text-gray-600 font-medium">高三毕业季</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
            <span className="w-6 h-6 rounded bg-green-50 text-green-500 text-[10px] flex items-center justify-center font-bold">#</span>
            <span className="text-xs text-gray-600 font-medium">社团招新啦</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
