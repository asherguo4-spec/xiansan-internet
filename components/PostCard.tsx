
import React, { useState } from 'react';
import { Post, PostTag } from '../types';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onHide: () => void;
  isAdmin?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onHide, isAdmin }) => {
  const [showComments, setShowComments] = useState(false);

  const getTagColor = (tag: PostTag) => {
    switch (tag) {
      case PostTag.LOVE: return 'bg-pink-100 text-pink-600';
      case PostTag.RANT: return 'bg-orange-100 text-orange-600';
      case PostTag.HELP: return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return '刚刚';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src={post.profile.avatar_url} 
              alt={post.profile.username} 
              className="w-10 h-10 rounded-full object-cover bg-gray-50" 
            />
            <div>
              <h4 className="text-sm font-bold text-gray-800">{post.profile.username}</h4>
              <p className="text-xs text-gray-400">{getTimeAgo(post.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getTagColor(post.tag)}`}>
              {post.tag}
            </span>
            {isAdmin && (
              <button 
                onClick={onHide}
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                title="管理员隐藏此内容"
              >
                <i className="fas fa-eye-slash text-sm"></i>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
          {post.content}
        </p>

        {post.image_urls && post.image_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {post.image_urls.map((url, i) => (
              <img key={i} src={url} className="rounded-lg w-full h-40 object-cover border" alt="post content" />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-6 pt-3 border-t border-gray-50">
          <button 
            onClick={onLike}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.is_liked_by_me ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
          >
            <i className={`${post.is_liked_by_me ? 'fas' : 'far'} fa-heart`}></i>
            <span>{post.likes_count}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-500 transition-colors"
          >
            <i className="far fa-comment"></i>
            <span>{post.comments_count}</span>
          </button>
          <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-500 transition-colors ml-auto">
            <i className="far fa-share-square"></i>
            <span className="hidden sm:inline">分享</span>
          </button>
        </div>

        {/* Fake Comment Expansion Area */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-4">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs shrink-0">我</div>
              <input 
                type="text" 
                placeholder="说点什么吧..." 
                className="flex-1 bg-gray-50 border-none rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0"></div>
                <div className="bg-gray-50 p-2 rounded-lg flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-gray-700">同学A</span>
                    <span className="text-[9px] text-gray-400">10分钟前</span>
                  </div>
                  <p className="text-xs text-gray-600">我也觉得食堂那个红烧肉越来越少了！</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
