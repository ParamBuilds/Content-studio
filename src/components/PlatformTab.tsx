import React from 'react';
import { useContent } from '../ContentContext';
import { Platform } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Hash, Image as ImageIcon, Send, Clock, Wand2, Trash2 } from 'lucide-react';
import { generateCopy, generateHashtags, generateVisualIdeas, generateRedditTitle } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { VisualEngine } from './VisualEngine';

import { ReviewModal } from './ReviewModal';

interface PlatformTabProps {
  platform: Platform;
}

export const PlatformTab: React.FC<PlatformTabProps> = ({ platform }) => {
  const { topic, tone, posts, updatePost } = useContent();
  const post = posts[platform];
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isReviewOpen, setIsReviewOpen] = React.useState(false);

  const handleGenerateCopy = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const copy = await generateCopy(platform, topic, tone);
      updatePost(platform, { copy });
      if (platform === 'reddit') {
        const redditTitle = await generateRedditTitle(topic);
        updatePost(platform, { redditTitle });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateHashtags = async () => {
    if (!topic) return;
    const hashtags = await generateHashtags(platform, topic);
    updatePost(platform, { hashtags });
  };

  const handleGenerateVisualIdeas = async () => {
    if (!topic) return;
    const visualIdeas = await generateVisualIdeas(platform, topic);
    updatePost(platform, { visualIdeas });
  };

  const charLimit = platform === 'twitter' ? 280 : platform === 'instagram' ? 2200 : 63206;
  const charCount = post.copy.length;
  const charWarning = charCount > charLimit * 0.85;
  const charError = charCount > charLimit;

  return (
    <div className="flex h-full overflow-hidden bg-zinc-50/50 dark:bg-zinc-950">
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">
          {/* Left Column: Content Creation (7/12) */}
          <div className="xl:col-span-7 space-y-6">
            {/* Section A: Copy */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="h-1 bg-blue-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Content Strategy
                  </CardTitle>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Drafting & AI Assistance</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerateCopy}
                  disabled={isGenerating || !topic}
                  className="gap-2 h-8 text-xs"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  {isGenerating ? 'Generating...' : 'AI Generate'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {platform === 'reddit' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Reddit Title</label>
                    <Input 
                      placeholder="Enter post title..." 
                      value={post.redditTitle || ''}
                      onChange={(e) => updatePost(platform, { redditTitle: e.target.value })}
                      className="font-medium bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Body Text</label>
                  <Textarea 
                    placeholder={`Write your ${platform} post...`}
                    className="min-h-[240px] resize-none font-sans text-base leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-blue-500"
                    value={post.copy}
                    onChange={(e) => updatePost(platform, { copy: e.target.value })}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase tracking-wider" onClick={() => updatePost(platform, { copy: '' })}>Clear</Button>
                    </div>
                    <span className={`text-[10px] font-mono ${charError ? 'text-red-500 font-bold' : charWarning ? 'text-yellow-500' : 'text-zinc-400'}`}>
                      {charCount} / {charLimit}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section B: Hashtags */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Hash className="w-4 h-4 text-purple-500" />
                  Discoverability
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleGenerateHashtags} disabled={!topic}>
                  <Wand2 className="w-3.5 h-3.5 mr-2" />
                  Suggest Tags
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {post.hashtags.map((tag, i) => (
                      <motion.div
                        key={tag}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                      >
                        <Badge 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors py-1 px-2 text-xs font-medium"
                          onClick={() => updatePost(platform, { hashtags: post.hashtags.filter(t => t !== tag) })}
                        >
                          {tag}
                          <Trash2 className="w-3 h-3 ml-1.5 opacity-50" />
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {post.hashtags.length === 0 && (
                    <p className="text-xs text-zinc-400 italic">No hashtags suggested yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section C: Visual Ideas */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  Creative Direction
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleGenerateVisualIdeas} disabled={!topic}>
                  <Wand2 className="w-3.5 h-3.5 mr-2" />
                  Ideate
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[160px] pr-4">
                  <div className="space-y-3">
                    {post.visualIdeas.map((idea, i) => (
                      <div key={i} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-300 flex gap-3">
                        <div className="w-1 h-full bg-emerald-500 rounded-full shrink-0" />
                        {idea}
                      </div>
                    ))}
                    {post.visualIdeas.length === 0 && (
                      <p className="text-xs text-zinc-400 italic">Click "Ideate" to get visual concepts.</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Preview & Engine (5/12) */}
          <div className="xl:col-span-5 space-y-6">
            {/* Live Preview Card */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden bg-white dark:bg-zinc-900">
              <CardHeader className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700 py-3">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Live Preview: {platform}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="max-w-[400px] mx-auto border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden bg-white dark:bg-black">
                  {/* Platform Specific Header */}
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                      <div className="h-2 w-16 bg-zinc-100 dark:bg-zinc-900 rounded" />
                    </div>
                  </div>
                  
                  {/* Post Content */}
                  <div className="px-4 pb-4 space-y-3">
                    {platform === 'reddit' && post.redditTitle && (
                      <h3 className="font-bold text-lg leading-tight">{post.redditTitle}</h3>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {post.copy || <span className="text-zinc-300 italic">Your content will appear here...</span>}
                    </p>
                    <p className="text-sm text-blue-500 font-medium">
                      {post.hashtags.join(' ')}
                    </p>
                  </div>

                  {/* Media Preview */}
                  {post.attachedMedia.length > 0 && (
                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                      <img src={post.attachedMedia[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}

                  {/* Platform Specific Footer */}
                  <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-between">
                    <div className="flex gap-4">
                      <div className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-800" />
                      <div className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-800" />
                      <div className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                    <div className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visual Engine */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">Asset Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <VisualEngine platform={platform} />
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Publication Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Date</label>
                    <Input 
                      type="date" 
                      className="h-9 text-xs bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                      value={post.scheduledAt ? new Date(post.scheduledAt.getTime() - post.scheduledAt.getTimezoneOffset() * 60000).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value;
                        const currentTime = post.scheduledAt ? post.scheduledAt.toTimeString().split(' ')[0] : '12:00:00';
                        if (date) {
                          updatePost(platform, { scheduledAt: new Date(`${date}T${currentTime}`) });
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Time</label>
                    <Input 
                      type="time" 
                      className="h-9 text-xs bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                      value={post.scheduledAt ? post.scheduledAt.toTimeString().split(' ')[0].slice(0, 5) : ''}
                      onChange={(e) => {
                        const time = e.target.value;
                        const currentDate = post.scheduledAt ? post.scheduledAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                        if (time) {
                          updatePost(platform, { scheduledAt: new Date(`${currentDate}T${time}`) });
                        }
                      }}
                    />
                  </div>
                </div>
                {post.scheduledAt && (
                  <div className="flex items-center gap-2 p-2 rounded bg-blue-50 dark:bg-blue-900/20 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                    <Clock className="w-3 h-3" />
                    Scheduled for: {post.scheduledAt.toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Bar */}
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setIsReviewOpen(true)}
                className="flex-1 h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                Review & Publish
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 border-zinc-200 dark:border-zinc-800">
                <Clock className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>

      <ReviewModal 
        platform={platform} 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
      />
    </div>
  );
};
