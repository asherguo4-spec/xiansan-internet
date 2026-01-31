
import React, { useState } from 'react';
import { Post, PostTag, UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';
import CommentSection from '../components/CommentSection';

interface HomeScreenProps {
  posts: Post[];
  user: UserProfile | null;
  onRefresh: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ posts, user, onRefresh }) => {
  const [activeComments, setActiveComments] = useState<Record<string, boolean>>({});

  const dailyBanger = {
    title: "建安区三高“最帅男同学榜”新鲜出炉",
    imageUrl: "https://images.unsplash.com/photo-1540600113337-25e135123992?auto=format&fit=crop&q=80&w=800",
    views: "1.2w"
  };

  const toggleComments = (postId: string) => {
    setActiveComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleLike = async (post: Post) => {
    if (!user) {
      alert('登录后才能点赞哦~');
      return;
    }

    const isLiked = post.is_liked_by_me;

    try {
      if (isLiked) {
        // 取消赞：直接删除记录
        const { error } = await supabase.from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // 点赞：插入记录
        const { error } = await supabase.from('likes')
          .insert([{ post_id: post.id, user_id: user.id }]);
        if (error) throw error;

        // 给作者发通知
        if (user.id !== post.user_id) {
          await supabase.from('notifications').insert([{
            user_id: post.user_id,
            sender_id: user.id,
            type: 'like',
            content: `${user.username} 点赞了你的动态`,
            post_id: post.id
          }]);
        }
      }
      // 成功后通知 App.tsx 重新 fetch 数据
      onRefresh();
    } catch (error: any) {
      console.error('Like error:', error);
      alert('操作失败: ' + error.message);
    }
  };

  return (
    <div className="px-4 pt-6 pb-10">
      {/* 顶部主标题 */}
      <div className="mb-6 px-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">县三网</h1>
        <div className="w-10 h-1.5 bg-[#FF2E93] rounded-full mt-1"></div>
      </div>

      <div className="mb-8">
        <div className="relative overflow-hidden bg-gray-900 rounded-[32px] shadow-2xl shadow-orange-100 min-h-[180px] flex flex-col justify-end p-6 group">
          <img src={dailyBanger.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="banger" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 animate-pulse">
              <i className="fas fa-bomb text-xs"></i>今日王炸
            </div>
            <h2 className="text-xl font-black text-white leading-tight mb-2">{dailyBanger.title}</h2>
            <div className="flex items-center gap-3 text-white/50 text-[10px] font-bold">
              <span><i className="far fa-eye mr-1"></i> {dailyBanger.views} 围观</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 text-center">
        <p className="text-[10px] font-black text-gray-300">内容一经发布，将无法删除与更改。</p>
        <p className="text-[10px] font-black text-gray-300">言论自由，想发啥发啥。</p>
        <p className="text-[8px] font-bold text-gray-200 mt-2">开发者：2322郭佳豪</p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 pink-gradient rounded-xl flex items-center justify-center text-white shadow-lg"><i className="fas fa-shapes"></i></div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">精选广场</h1>
        </div>
      </div>

      <div className="masonry-grid">
        {posts.map((post, i) => (
          <div key={post.id} className={`bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 flex flex-col mb-4 ${i % 3 === 0 ? 'bg-pink-50/30' : i % 2 === 0 ? 'bg-blue-50/30' : 'bg-green-50/30'}`}>
            {post.image_urls && post.image_urls.length > 0 && (
              <img src={post.image_urls[0]} className="w-full h-auto object-cover max-h-48" alt="post" />
            )}
            <div className="p-4 flex flex-col flex-1">
              <p className="text-sm font-bold text-gray-800 leading-relaxed mb-4 line-clamp-3">{post.content}</p>
              <div className="mb-3">
                 <span className={`text-[10px] px-2 py-1 rounded-full font-black ${post.tag === PostTag.LOVE ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'}`}>{post.tag}</span>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-1.5 shrink-0 overflow-hidden">
                  <img src={post.profile?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback'} className="w-5 h-5 rounded-full border border-white" alt="avatar" />
                  <span className="text-[9px] font-bold text-gray-400 truncate max-w-[40px]">{post.profile?.username || '匿名'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => toggleComments(post.id)} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black transition-all active:scale-90 ${activeComments[post.id] ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <i className="far fa-comment"></i>{post.comments_count || 0}
                  </button>
                  <button onClick={() => handleLike(post)} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black transition-all active:scale-90 ${post.is_liked_by_me ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <i className={`${post.is_liked_by_me ? 'fas' : 'far'} fa-heart`}></i>{post.likes_count || 0}
                  </button>
                </div>
              </div>
              {activeComments[post.id] && (
                <CommentSection 
                  post={post} 
                  currentUser={user} 
                  onCommentSuccess={onRefresh} 
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;
