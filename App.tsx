
import React, { useState, useEffect, useCallback } from 'react';
import { Post, PostTag, UserProfile, TabType } from './types';
import HomeScreen from './screens/HomeScreen';
import DiscoveryScreen from './screens/DiscoveryScreen';
import MessagesScreen from './screens/MessagesScreen';
import ProfileScreen from './screens/ProfileScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import AuthModal from './components/AuthModal';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const isSupabaseReady = !!supabase;

  // 监听登录状态
  useEffect(() => {
    if (!isSupabaseReady) {
      setLoading(false);
      return;
    }

    // 初始化获取 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // 监听 auth 变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          setShowAuth(false);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isSupabaseReady]);

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseReady) return;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setUser(data);
      }
    } catch (e) {
      console.error("Fetch profile failed", e);
    }
  };

  const fetchPosts = useCallback(async () => {
    if (!isSupabaseReady) return;
    try {
      // 1. 获取所有动态，包含用户信息
      const { data: postsData } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });

      // 2. 如果用户已登录，获取点赞过的记录
      let myLikes: string[] = [];
      if (user) {
        const { data: likesData } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id);
        if (likesData) {
          myLikes = likesData.map(l => l.post_id);
        }
      }

      if (postsData) {
        const formattedPosts: Post[] = postsData.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          content: item.content,
          tag: item.tag as PostTag,
          created_at: item.created_at,
          profile: item.profiles,
          image_urls: item.image_urls,
          likes_count: item.likes_count || 0,
          // 这里现在会读取数据库里真实的 comments_count 字段
          comments_count: item.comments_count || 0,
          is_liked_by_me: myLikes.includes(item.id),
          mood: item.mood
        }));
        setPosts(formattedPosts);
      }
    } catch (e) {
      console.error("Fetch posts failed", e);
    }
  }, [isSupabaseReady, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (!isSupabaseReady) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FFF9FB] p-10 text-center">
        <div className="text-6xl mb-6">🛠️</div>
        <h2 className="text-xl font-black text-gray-800 mb-2">配置未完成</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          看起来你还没有在代码中填入 Supabase 的 URL 和 Key。<br/>
          请打开 <code className="bg-gray-100 px-1 rounded text-pink-500 font-mono">services/supabaseClient.ts</code> 文件进行设置。
        </p>
        <p className="mt-8 text-xs text-gray-300">填好后刷新页面即可开启社区！</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFF9FB]">
        <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderScreen = () => {
    if (!user && (activeTab === 'messages' || activeTab === 'profile')) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-10 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center text-4xl mb-6 shadow-sm">🔒</div>
          <h3 className="text-xl font-black text-gray-800 mb-2">私密小窝</h3>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">这里只有三高的同学才能进入哦<br/>登录后查看你的消息通知和个人动态</p>
          <button 
            onClick={() => setShowAuth(true)}
            className="pink-gradient text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-pink-100 transition-all active:scale-95"
          >
            立即登录
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'home': return <HomeScreen posts={posts} user={user} onRefresh={fetchPosts} />;
      case 'discovery': return <DiscoveryScreen />;
      case 'messages': return user ? <MessagesScreen userId={user.id} /> : null;
      case 'profile': return user ? <ProfileScreen user={user} onUpdate={() => fetchProfile(user.id)} onPostAction={fetchPosts} /> : null;
      default: return <HomeScreen posts={posts} user={user} onRefresh={fetchPosts} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative bg-[#FFF9FB] overflow-hidden border-x border-gray-50 shadow-2xl">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        {renderScreen()}
      </div>

      {user ? (
        <button 
          onClick={() => setShowCreate(true)}
          className="fixed bottom-24 right-6 w-16 h-16 pink-gradient text-white rounded-full shadow-lg shadow-pink-200 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-50"
        >
          <i className="fas fa-plus text-2xl"></i>
        </button>
      ) : (
        activeTab === 'home' && (
          <button 
            onClick={() => setShowAuth(true)}
            className="fixed bottom-24 right-6 px-6 py-3 pink-gradient text-white rounded-full shadow-lg font-black text-sm z-50 animate-bounce"
          >
            登录发布动态
          </button>
        )
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center py-4 px-2 z-[100]">
        {[
          { id: 'home', icon: 'fa-house', label: '广场' },
          { id: 'discovery', icon: 'fa-magnifying-glass', label: '探索' },
          { id: 'messages', icon: 'fa-comment-dots', label: '消息' },
          { id: 'profile', icon: 'fa-user', label: '我的' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className="flex flex-col items-center gap-1 w-1/4"
          >
            <div className={`w-12 h-10 flex items-center justify-center rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[#FF2E93] text-white shadow-lg shadow-pink-100' : 'text-gray-300'}`}>
              <i className={`fas ${tab.icon} text-lg`}></i>
            </div>
            <span className={`text-[10px] font-bold ${activeTab === tab.id ? 'text-[#FF2E93]' : 'text-gray-300'}`}>{tab.label}</span>
          </button>
        ))}
      </div>

      {showCreate && user && (
        <CreatePostScreen 
          user={user} 
          onClose={() => setShowCreate(false)} 
          onSubmit={() => { fetchPosts(); setShowCreate(false); }} 
        />
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={() => setShowAuth(false)} />}
    </div>
  );
};

export default App;
