
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';

interface EditProfileScreenProps {
  user: UserProfile;
  onClose: () => void;
  onUpdate: () => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ user, onClose, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 限制文件大小 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('图片太大了，请选择 2MB 以内的图片');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. 上传到 Supabase Storage 的 avatars 桶
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. 获取公共访问链接
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      alert('头像上传失败: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!username.trim() || isSaving) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          bio: bio.trim().substring(0, 15),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      await onUpdate();
      onClose();
    } catch (error: any) {
      alert('保存失败：' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#FFF9FB] z-[120] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-800">
          <i className="fas fa-chevron-left text-xl"></i>
        </button>
        <h2 className="text-xl font-black text-gray-800">个人设置</h2>
        <button 
          onClick={handleSave}
          disabled={isSaving || isUploading || !username.trim()}
          className="text-pink-500 font-black text-sm disabled:opacity-30"
        >
          {isSaving ? '保存中...' : '完成'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-10">
        {/* 头像设置区域 */}
        <div className="flex flex-col items-center my-8">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white relative">
              <img src={avatarUrl} className="w-full h-full object-cover" alt="avatar preview" />
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                  <i className="fas fa-spinner animate-spin"></i>
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-10 h-10 pink-gradient text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg active:scale-90 transition-transform"
            >
              <i className="fas fa-camera text-sm"></i>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <p className="text-[10px] text-gray-300 font-bold mt-4 uppercase tracking-widest">点击相机图标上传你的专属照片</p>
        </div>

        <div className="space-y-6">
          <section>
            <label className="text-[10px] font-black text-pink-400 uppercase tracking-widest ml-4 mb-2 block">
              同学昵称
            </label>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-4">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="起个响亮的昵称吧"
                className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-700"
              />
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center ml-4 mb-2">
              <label className="text-[10px] font-black text-pink-400 uppercase tracking-widest block">
                个性签名 (15字以内)
              </label>
              <span className={`text-[10px] font-bold ${bio.length >= 15 ? 'text-red-400' : 'text-gray-300'}`}>
                {bio.length}/15
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-4">
              <textarea 
                value={bio}
                maxLength={15}
                onChange={(e) => setBio(e.target.value)}
                placeholder="介绍一下你自己..."
                rows={2}
                className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-700 resize-none leading-relaxed"
              />
            </div>
          </section>

          <div className="pt-10 flex flex-col items-center gap-8">
            <button 
              onClick={() => { if(confirm('确定要退出登录吗？')) supabase.auth.signOut(); }}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-red-100 text-red-400 text-xs font-black hover:bg-red-50 transition-colors"
            >
              退出账号
            </button>
            <p className="text-[8px] text-gray-200 font-bold mb-4">开发者：2322郭佳豪</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileScreen;
