
export enum PostTag {
  FEATURED = '精选广场',
  LOVE = '#LoveWall',
  RANT = '#Rants',
  HELP = '#StudyHelp',
  DAILY = '#CampusLife'
}

export type TabType = 'home' | 'discovery' | 'messages' | 'profile';

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  lv?: number;
  bio?: string;
  uid?: string;
  is_admin?: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_urls?: string[];
  tag: PostTag;
  created_at: string;
  profile: UserProfile;
  likes_count: number;
  comments_count: number;
  is_liked_by_me: boolean;
  mood?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile: UserProfile;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'system';
  user?: UserProfile;
  content: string;
  time: string;
  postImage?: string;
  badge?: string;
}
