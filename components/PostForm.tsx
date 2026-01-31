
import React, { useState, useRef } from 'react';
import { Post, PostTag, UserProfile } from '../types';
import { moderateContent, suggestTags } from '../services/geminiService';

interface PostFormProps {
  user: UserProfile;
  onSubmit: (post: Post) => void;
}

const PostForm: React.FC<PostFormProps> = ({ user, onSubmit }) => {
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<PostTag>(PostTag.DAILY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    // AI Moderation & Optimization
    const modResult = await moderateContent(content);
    if (!modResult.safe) {
      alert(`无法发布：${modResult.reason || '内容可能违反社区准则'}`);
      setIsSubmitting(false);
      return;
    }

    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: user.id,
      content,
      tag: selectedTag,
      created_at: new Date().toISOString(),
      profile: user,
      likes_count: 0,
      comments_count: 0,
      is_liked_by_me: false,
    };

    onSubmit(newPost);
    setContent('');
    setSelectedTag(PostTag.DAILY);
    setIsSubmitting(false);
  };

  const handleAiTag = async () => {
    if (!content.trim()) return;
    setIsAiProcessing(true);
    const tag = await suggestTags(content);
    // Rough match back to enum
    if (tag.includes('表白')) setSelectedTag(PostTag.LOVE);
    else if (tag.includes('吐槽')) setSelectedTag(PostTag.RANT);
    else if (tag.includes('求助')) setSelectedTag(PostTag.HELP);
    else setSelectedTag(PostTag.DAILY);
    setIsAiProcessing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 mb-6">
      <div className="flex gap-4">
        <img src={user.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="me" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今天有什么新鲜事要分享？"
            className="w-full border-none focus:ring-0 text-gray-700 placeholder-gray-400 resize-none min-h-[100px] text-sm py-2"
          />
          
          <div className="flex flex-wrap gap-2 mt-2">
            {/* Fix: Replaced non-existent PostTag.ALL with PostTag.FEATURED to filter out restricted tags */}
            {Object.values(PostTag).filter(t => t !== PostTag.FEATURED).map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedTag === tag 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-gray-50 text-gray-500 border border-transparent hover:border-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
            <button 
              type="button"
              onClick={handleAiTag}
              disabled={!content.trim() || isAiProcessing}
              className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm disabled:opacity-50 flex items-center gap-1 ml-auto"
            >
              <i className={`fas fa-magic ${isAiProcessing ? 'animate-pulse' : ''}`}></i>
              智能标签
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-4 text-gray-400">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="hover:text-blue-500 transition-colors p-1"
              >
                <i className="far fa-image text-lg"></i>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
              </button>
              <button type="button" className="hover:text-blue-500 transition-colors p-1">
                <i className="far fa-grin text-lg"></i>
              </button>
              <button type="button" className="hover:text-blue-500 transition-colors p-1">
                <i className="fas fa-at text-lg"></i>
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="bg-blue-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 disabled:translate-y-0 active:translate-y-0.5"
            >
              {isSubmitting ? '发布中...' : '发布动态'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
