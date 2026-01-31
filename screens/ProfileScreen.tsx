
import React, { useState, useEffect } from 'react';
import { UserProfile, Post } from '../types';
import { supabase } from '../services/supabaseClient';
import EditProfileScreen from './EditProfileScreen';
import CommentSection from '../components/CommentSection';

interface ProfileScreenProps {
  user: UserProfile;
  onUpdate: () => void;
  onPostAction: () => void | Promise<void>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onUpdate, onPostAction }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeComments, setActiveComments] = useState<Record<string, boolean>>({});

  const fetchUserPosts = async () => {
    setLoadingPosts(true);
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setUserPosts(data as any[]);
    }
    setLoadingPosts(false);
  };

  useEffect(() => {
    fetchUserPosts();
  }, [user.id]);

  const toggleComments = (postId: string) => {
    setActiveComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleLogout = async () => {
    if(confirm('确定要离开校园圈吗？')) {
      await supabase.auth.signOut();
    }
  };

  return (
    <div className="relative pb-10">
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center text-gray-600">
        <button onClick={handleLogout} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
          <i className="fas fa-sign-out-alt"></i>
        </button>
        <button onClick={() => setShowEdit(true)} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-transform">
          <i className="fas fa-cog"></i>
        </button>
      </div>

      <div className="h-64 pink-gradient relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="absolute -bottom-16 left-0 right-0 flex justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
            <img src={user.avatar_url} className="w-full h-full object-cover" alt="me" />
          </div>
        </div>
      </div>

      <div className="mt-20 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-2xl font-black text-gray-800">{user.username}</h2>
          <span className="bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-lg font-black italic">LV.{user.lv || 1}</span>
        </div>
        <p className="text-xs text-gray-400 font-bold mb-1 px-4">“ {user.bio || '还没有写个性签名呢~'} ”</p>
        <p className="text-[10px] text-gray-300 uppercase tracking-widest font-black">UID: {user.uid}</p>

        <div className="flex justify-center gap-10 my-10">
          {[{ label: '好友', val: '0' }, { label: '动态', val: userPosts.length.toString() }, { label: '获赞', val: userPosts.reduce((acc, curr) => acc + (curr.likes_count || 0), 0).toString() }].map(stat => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-xl font-black text-gray-800">{stat.val}</span>
              <span className="text-[10px] font-bold text-gray-400">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="mb-10 text-left">
           <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2"><i className="fas fa-camera-retro text-pink-500"></i>我的瞬间</h3>
           {loadingPosts ? (
             <div className="py-10 text-center text-gray-300 font-bold">加载中...</div>
           ) : userPosts.length > 0 ? (
             <div className="flex flex-col gap-4">
               {userPosts.map(post => (
                 <div key={post.id} className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-50">
                   <div className="flex justify-between items-start mb-3">
                     <span className="text-[10px] font-black text-gray-300 uppercase">{new Date(post.created_at).toLocaleDateString()}</span>
                   </div>
                   <p className="text-sm font-bold text-gray-700 leading-relaxed mb-4">{post.content}</p>
                   {post.image_urls && post.image_urls.length > 0 && (
                     <div className="grid grid-cols-2 gap-2 mb-4">
                       {post.image_urls.map((url, idx) => (<img key={idx} src={url} className="w-full h-24 object-cover rounded-xl border border-gray-50" alt="post" />))}
                     </div>
                   )}
                   <div className="flex items-center gap-4 text-gray-300 text-[10px] font-black">
                     <button onClick={() => toggleComments(post.id)} className={`flex items-center gap-1 ${activeComments[post.id] ? 'text-blue-400' : ''}`}>
                       <i className="fas fa-comment mr-1"></i> {activeComments[post.id] ? '关闭评论' : '查看评论'}
                     </button>
                     <span><i className="fas fa-heart mr-1"></i> {post.likes_count || 0}</span>
                     <span><i className="fas fa-tag mr-1"></i> {post.tag}</span>
                   </div>
                   {activeComments[post.id] && (
                     <CommentSection 
                       post={post} 
                       currentUser={user} 
                       onCommentSuccess={onPostAction} 
                     />
                   )}
                 </div>
               ))}
             </div>
           ) : (
             <div className="bg-gray-50 rounded-[32px] p-10 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 opacity-50">
               <p className="text-xs font-bold text-gray-300">还没有动态哦</p>
             </div>
           )}
        </div>
      </div>
      {showEdit && <EditProfileScreen user={user} onClose={() => setShowEdit(false)} onUpdate={onUpdate} />}
    </div>
  );
};

export default ProfileScreen;
