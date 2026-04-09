import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Platform, PostState, Tone } from './types';

interface ContentContextType {
  topic: string;
  setTopic: (topic: string) => void;
  tone: Tone;
  setTone: (tone: Tone) => void;
  posts: Record<Platform, PostState>;
  updatePost: (platform: Platform, updates: Partial<PostState>) => void;
}

const initialPostState: PostState = {
  copy: '',
  hashtags: [],
  visualIdeas: [],
  attachedMedia: [],
  status: 'draft',
};

const seedData: Record<Platform, PostState> = {
  twitter: {
    copy: "Burnout isn't a badge of honor. It's a signal. 🧘‍♂️\n\nIntroducing ZenFlow: The first AI mindfulness coach that adapts to your heart rate and schedule. \n\nFind your flow, even on your busiest days.",
    hashtags: ["#ZenFlow", "#Mindfulness", "#TechWellness", "#Focus"],
    visualIdeas: ["Minimalist workspace with a glowing ZenFlow icon on a phone", "Abstract wave pattern representing 'Flow' state"],
    attachedMedia: ["https://picsum.photos/seed/zenflow-tw/1200/675"],
    status: 'draft',
  },
  instagram: {
    copy: "Your productivity shouldn't come at the cost of your peace. ✨\n\nMeet ZenFlow. We’ve combined ancient wisdom with cutting-edge AI to create a meditation experience that actually fits into a 60-hour work week. \n\nNo more 'I don't have time to sit still.' ZenFlow finds the gaps in your day and guides you back to center.\n\nLink in bio to join the waitlist. 🚀",
    hashtags: ["#MindfulTech", "#ZenFlow", "#WorkLifeBalance", "#MeditationApp", "#SelfCare"],
    visualIdeas: ["High-quality lifestyle shot of a professional meditating with noise-canceling headphones", "Soft-lit morning routine aesthetic"],
    attachedMedia: ["https://picsum.photos/seed/zenflow-ig/1080/1350"],
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
  },
  reddit: {
    copy: "Hey everyone, I've been a lurker here for a long time. Like many of you, I struggled with traditional meditation apps. They felt too passive or didn't account for how frantic my day actually is.\n\nI spent the last year building ZenFlow. It uses AI to analyze your calendar and stress markers to suggest 'Micro-meditations' (30-90 seconds) right when you need them most.\n\nI'm looking for some early beta testers from this community to give honest feedback. No marketing fluff, just want to see if this helps you as much as it helped me.",
    redditTitle: "I built an AI meditation app that actually works for people with ADHD/High-stress jobs.",
    hashtags: [],
    visualIdeas: ["Screenshot of the 'Micro-meditation' UI", "Comparison chart: Traditional vs. AI-Adaptive meditation"],
    attachedMedia: [],
    status: 'draft',
  },
  facebook: {
    copy: "Is your 'To-Do' list longer than your 'Me-Time'? ☕️\n\nWe built ZenFlow for the busy parents, the late-night founders, and everyone in between. It’s more than just a meditation app—it’s a digital sanctuary that grows with you.\n\nJoin thousands of early adopters who are reclaiming their focus. \n\nComment 'FLOW' below and we'll send you an exclusive invite to our private beta! 👇",
    hashtags: ["#ZenFlow", "#MentalHealthMatters", "#ProductivityHack"],
    visualIdeas: ["Warm, community-focused image of diverse people smiling in a calm environment"],
    attachedMedia: ["https://picsum.photos/seed/zenflow-fb/1200/630"],
    status: 'draft',
  }
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [topic, setTopic] = useState('ZenFlow: AI-Powered Mindfulness for Busy Professionals');
  const [tone, setTone] = useState<Tone>('inspirational');
  const [posts, setPosts] = useState<Record<Platform, PostState>>(seedData);

  const updatePost = (platform: Platform, updates: Partial<PostState>) => {
    setPosts((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], ...updates },
    }));
  };

  return (
    <ContentContext.Provider value={{ topic, setTopic, tone, setTone, posts, updatePost }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within a ContentProvider');
  return context;
};
