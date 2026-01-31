
import React, { useState, useEffect } from 'react';
import { Comment, UserProfile, Post } from '../types';
import { supabase } from '../services/supabaseClient';

interface CommentSectionProps {
  post: Post;
  currentUser: UserProfile | null;
  onCommentSuccess: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ post, currentUser, onCommentSuccess }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // 获取该动态下的所有评论
  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_id,
          user_id,
          content,
          created_at,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const formatted: Comment[] = data.map((item: any) => ({
          id: item.id,
          post_id: item.post_id,
          user_id: item.user_id,
          content: item.content,
          created_at: item.created_at,
          profile: item.profiles // 这里的 profiles 是通过外键关联查出来的发布者信息
        }));
        setComments(formatted);
      }
    } catch (e) {
      console.error("加载评论失败:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post.id]);

  // 发送评论
  const handleSubmit = async () => {
    if (!currentUser) {
      alert('请先登录后再发表评论哦~');
      return;
    }
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: post.id,
          user_id: currentUser.id,
          content: content.trim()
        }]);

      if (error) throw error;

      // 发送成功后：清空输入框、重新刷新评论列表、通知父组件刷新计数
      setContent('');
      await fetchComments();
      onCommentSuccess();
      
      // 同时也给动态作者发个通知
      if (currentUser.id !== post.user_id) {
        await supabase.from('notifications').insert([{
          user_id: post.user_id,
          sender_id: currentUser.id,
          type: 'comment',
          content: `${currentUser.username} 评论了你：${content.trim().substring(0, 15)}...`,
          post_id: post.id
        }]);
      }
    } catch (e: any) {
      alert('评论失败: ' + (e.message || '网络错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* 评论列表显示 */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto hide-scrollbar">
        {loading ? (
          <div className="text-center py-4 flex flex-col items-center gap-2">
            <div className="w-4 h-4 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            <span className="text-[10px] text-gray-300 font-bold">翻找评论中...</span>
          </div>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-2 animate-in fade-in duration-500">
              <img 
                src={comment.profile?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.user_id}`} 
                className="w-7 h-7 rounded-full shrink-0 border border-white shadow-sm" 
                alt="avatar" 
              />
              <div className="flex-1 bg-gray-50/80 backdrop-blur-sm rounded-2xl p-2 px-3">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[10px] font-black text-gray-500">{comment.profile?.username || '三高同学'}</span>
                  <span className="text-[8px] text-gray-300 font-bold">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-gray-700 leading-relaxed break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center">
            <p className="text-[10px] text-gray-300 font-black italic">还没有评论，快来留下你的足迹吧 ✨</p>
          </div>
        )}
      </div>

      {/* 发表评论输入框 */}
      <div className="flex items-end gap-2 bg-white rounded-2xl p-2 pr-1 border border-gray-100 shadow-inner focus-within:border-pink-200 transition-all">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={currentUser ? "说点好听的..." : "登录后即可发表评论"}
          disabled={!currentUser || isSubmitting}
          className="flex-1 bg-transparent border-none outline-none text-[12px] font-bold text-gray-700 px-3 py-1.5 max-h-32 resize-none leading-relaxed placeholder-gray-200"
          rows={1}
          style={{ height: 'auto' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <button 
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting || !currentUser}
          className="w-9 h-9 pink-gradient text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-20 disabled:grayscale"
        >
          {isSubmitting ? (
             <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <i className="fas fa-paper-plane text-xs"></i>
          )}
        </button>
      </div>
      {!currentUser && (
        <p className="text-center text-[8px] text-pink-300 font-black mt-2">点击右下角“我的”进行登录后即可评论</p>
      )}
    </div>
  );
};

export default CommentSection;
