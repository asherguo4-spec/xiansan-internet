
import React, { useState, useRef } from 'react';
import { PostTag, UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';

interface CreatePostScreenProps {
  user: UserProfile;
  onClose: () => void;
  onSubmit: () => void;
}

const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ user, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    (Array.from(files) as File[]).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if ((!content.trim() && images.length === 0) || isPosting) return;
    
    setIsPosting(true);
    const { error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: user.id,
          content: content.trim(),
          tag: content.includes('表白') ? PostTag.LOVE : PostTag.DAILY,
          mood: '普通', // 固定默认值
          image_urls: images, 
        }
      ]);

    if (error) {
      alert('发布失败，请检查网络后再试');
      console.error(error);
    } else {
      onSubmit();
    }
    setIsPosting(false);
  };

  return (
    <div className="fixed inset-0 bg-[#FFF9FB] z-[100] flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-400">
          <i className="fas fa-times text-2xl"></i>
        </button>
        <h2 className="text-lg font-black text-gray-800">写心情手账</h2>
        <button 
          onClick={handlePost}
          disabled={(!content.trim() && images.length === 0) || isPosting}
          className="bg-[#FFEB3B] text-gray-800 px-6 py-2 rounded-2xl font-black shadow-lg shadow-yellow-100 active:scale-95 disabled:opacity-30 transition-all"
        >
          {isPosting ? '发布中' : '发布'}
        </button>
      </div>

      {/* 奶油信纸输入区 */}
      <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        {/* 用户信息栏 */}
        <div className="p-8 pb-2 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-50">
            <img src={user.avatar_url} className="w-full h-full object-cover" alt="avatar" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-800">{user.username}</h4>
            <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">
              {new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} · 分享动态
            </p>
          </div>
        </div>

        {/* 核心信纸输入 */}
        <div className="flex-1 px-4 mb-4 overflow-y-auto">
          <div className="handbook-paper min-h-full px-12 pt-1 pb-10">
            <textarea 
              placeholder="此刻在想什么？..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
              className="w-full bg-transparent border-none outline-none resize-none text-gray-600 font-medium text-base placeholder-gray-200"
              style={{ minHeight: '150px', lineHeight: '32px' }}
            ></textarea>

            {/* 图片预览区域 (类似手账贴纸) */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4 pb-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img 
                      src={img} 
                      className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-white rotate-1 hover:rotate-0 transition-transform" 
                      alt="preview" 
                    />
                    <button 
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90"
                    >
                      <i className="fas fa-times text-[10px]"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* 添加图片按钮 (手账风格) */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex items-center gap-3 px-5 py-3 rounded-2xl border-2 border-dashed border-pink-100 text-pink-300 hover:bg-pink-50 transition-colors"
            >
              <i className="fas fa-image text-xl"></i>
              <span className="text-xs font-black">添加照片贴纸</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              multiple 
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden" 
            />
          </div>
        </div>
        
        {/* 底部小装饰 */}
        <div className="p-6 flex flex-col items-end opacity-10">
          <i className="fas fa-leaf text-2xl text-pink-500 mb-1"></i>
          <span className="text-[8px] font-bold">开发者：2322郭佳豪</span>
        </div>
      </div>
      <div className="h-4"></div>
    </div>
  );
};

export default CreatePostScreen;
