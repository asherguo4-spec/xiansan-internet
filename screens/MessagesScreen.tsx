
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface MessagesScreenProps {
  userId: string;
  onOpenChat?: (convId: string) => void;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    // 获取通知，包含发送者信息
    const { data, error } = await supabase
      .from('notifications')
      .select('*, sender:profiles!notifications_sender_id_fkey(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const categories = [
    { label: '赞和收藏', icon: 'fa-heart', color: 'bg-pink-100 text-pink-500' },
    { label: '互动提醒', icon: 'fa-user-plus', color: 'bg-blue-100 text-blue-500' },
    { label: '系统通知', icon: 'fa-bell', color: 'bg-emerald-100 text-emerald-500' },
  ];

  const getTimeAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="px-6 pt-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-gray-800">消息通知</h2>
      </div>

      {/* 分类快捷入口 */}
      <div className="flex gap-4 mb-10 overflow-x-auto hide-scrollbar">
        {categories.map(cat => (
          <div key={cat.label} className="flex flex-col items-center gap-2 shrink-0">
            <div className={`w-16 h-16 rounded-[24px] ${cat.color} flex items-center justify-center text-xl shadow-sm relative`}>
              <i className={`fas ${cat.icon}`}></i>
            </div>
            <span className="text-[10px] font-black text-gray-600">{cat.label}</span>
          </div>
        ))}
      </div>

      {/* 通知列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-gray-300">
            <i className="fas fa-circle-notch animate-spin mr-2 text-pink-500"></i> 加载中...
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(notif => (
            <div key={notif.id} className="bg-white p-4 rounded-3xl border border-gray-50 flex items-center gap-4 animate-in slide-in-from-right duration-300 shadow-sm">
              <img 
                src={notif.sender?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=system'} 
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                alt="sender"
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-700">{notif.content}</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{getTimeAgo(notif.created_at)}</p>
              </div>
              {!notif.read && <div className="w-2 h-2 rounded-full bg-pink-500"></div>}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-envelope-open text-3xl text-gray-300"></i>
            </div>
            <p className="text-sm font-black text-gray-400">还没有收到通知哦</p>
            <p className="text-[10px] text-gray-300 mt-1">当有人给你点赞或关注你时，通知会出现在这里</p>
          </div>
        )}
      </div>

      <div className="mt-20 mb-10 text-center opacity-20">
        <p className="text-[8px] font-bold text-gray-400">开发者：2322郭佳豪</p>
      </div>
    </div>
  );
};

export default MessagesScreen;
