
export type Platform = 'twitter' | 'instagram' | 'reddit' | 'facebook';

export type Tab = Platform | 'analytics' | 'queue' | 'settings' | 'account';

export type Tone = 'professional' | 'casual' | 'humorous' | 'inspirational';

export interface PostState {
  copy: string;
  hashtags: string[];
  visualIdeas: string[];
  attachedMedia: string[];
  status: 'draft' | 'reviewed' | 'scheduled' | 'published' | 'failed';
  scheduledAt?: Date;
  redditTitle?: string; // Specific to Reddit
}

export interface GlobalContext {
  topic: string;
  tone: Tone;
}

export interface AIReviewResponse {
  score: number;
  strengths: string[];
  improvements: string[];
  revised_version?: string;
}
