
import React from 'react';

const DiscoveryScreen: React.FC = () => {
  const hotSearches = [
    { label: '李佳桂怀孕了', trend: true, new: true },
    { label: '食堂的饭里吃出老鼠肉', trend: true, new: false },
    { label: '魏奥辰出轨，被老婆现场捉奸', trend: false, new: false },
  ];

  return (
    <div className="px-6 pt-10">
      {/* 核心板块：县三头条 */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-6 bg-[#FF2E93] rounded-full"></div>
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <i className="fas fa-fire text-orange-500"></i>
            县三头条
          </h3>
        </div>
        
        <div className="flex flex-col gap-4">
          {hotSearches.map((item, index) => (
            <div 
              key={item.label} 
              className="bg-white p-5 rounded-[28px] shadow-sm border border-gray-50 flex items-center justify-between group active:scale-95 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className={`text-lg font-black ${index === 0 ? 'text-orange-500' : index === 1 ? 'text-pink-500' : 'text-gray-300'}`}>
                  {index + 1}
                </span>
                <span className="text-sm font-bold text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.trend && <i className="fas fa-arrow-trend-up text-pink-400 text-xs"></i>}
                {item.new && <span className="bg-emerald-400 text-white text-[9px] px-1.5 py-0.5 rounded-lg font-bold">New</span>}
                <i className="fas fa-chevron-right text-gray-200 text-[10px] ml-2"></i>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部装饰或提示 */}
      <div className="mt-20 text-center opacity-20">
        <i className="fas fa-feather-pointed text-4xl mb-4 text-gray-300"></i>
        <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">更多话题正在赶来</p>
        <p className="text-[8px] font-bold mt-2">开发者：2322郭佳豪</p>
      </div>
    </div>
  );
};

export default DiscoveryScreen;
