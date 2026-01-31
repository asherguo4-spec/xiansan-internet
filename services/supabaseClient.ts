
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * 【小白配置指引 - 必填】
 * 请将下面的内容替换为你刚才在 Supabase API 页面看到的值。
 */

// 1. 把下面的引号里换成你的 Project URL
const supabaseUrl = 'https://frbmtwmxstshsnqcdhgq.supabase.co'; 

// 2. 把下面的引号里换成你的 anon public Key
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyYm10d214c3RzaHNucWNkaGdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3Njc0NzUsImV4cCI6MjA4NTM0MzQ3NX0.DxbEC1p5v6x7QVaoEvLvHkznIWEFFulnQHSSvecKL-c';

export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('在这里粘贴')) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any; 
