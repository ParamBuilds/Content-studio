import React from 'react';
import { Platform, AIReviewResponse } from '../types';
import { useContent } from '../ContentContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, Send, Edit3, Sparkles } from 'lucide-react';
import { reviewPost } from '../lib/gemini';
import { motion } from 'motion/react';

interface ReviewModalProps {
  platform: Platform;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ platform, isOpen, onClose }) => {
  const { posts, updatePost } = useContent();
  const post = posts[platform];
  const [review, setReview] = React.useState<AIReviewResponse | null>(null);
  const [isReviewing, setIsReviewing] = React.useState(false);

  const fullPost = `${post.redditTitle ? post.redditTitle + '\n\n' : ''}${post.copy}\n\n${post.hashtags.join(' ')}`;

  const handleReview = async () => {
    setIsReviewing(true);
    try {
      const result = await reviewPost(platform, fullPost);
      setReview(result);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleApplyRevision = () => {
    if (!review?.revised_version) return;
    // Simple heuristic to split revised version back into copy and hashtags
    // Usually AI returns hashtags at the end
    const lines = review.revised_version.split('\n');
    const hashtags = lines.filter(l => l.trim().startsWith('#')).flatMap(l => l.split(' ')).filter(t => t.startsWith('#'));
    const copy = lines.filter(l => !l.trim().startsWith('#')).join('\n').trim();
    
    updatePost(platform, { copy, hashtags });
    onClose();
  };

  const handleConfirmPost = () => {
    const status = post.scheduledAt ? 'scheduled' : 'published';
    updatePost(platform, { status });
    onClose();
  };

  React.useEffect(() => {
    if (isOpen) handleReview();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[85vh] flex flex-col p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <DialogHeader className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <Badge variant="outline" className="uppercase tracking-widest text-[10px] py-0.5 px-2 border-none font-bold">
                  {platform}
                </Badge>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">Review & Publish</DialogTitle>
                <p className="text-xs text-zinc-500 mt-0.5">Finalize your content before it goes live.</p>
              </div>
            </div>
            {review && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">AI Quality Score</span>
                <Badge className={`${review.score >= 8 ? 'bg-emerald-500' : review.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'} text-white font-bold px-3`}>
                  {review.score}/10
                </Badge>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left: Preview */}
          <div className="p-8 bg-zinc-50/50 dark:bg-zinc-950/50 border-r border-zinc-100 dark:border-zinc-800 overflow-y-auto custom-scrollbar">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6 block">Platform Preview</label>
            <div className="max-w-[420px] mx-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800" />
                <div>
                  <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded mb-1" />
                  <div className="h-2 w-16 bg-zinc-50 dark:bg-zinc-900 rounded" />
                </div>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 font-sans">
                {fullPost}
              </div>
              {post.attachedMedia.length > 0 && (
                <div className="aspect-square rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-inner">
                  <img src={post.attachedMedia[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          </div>

          {/* Right: Feedback */}
          <div className="p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-950">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6 block">AI Editor Feedback</label>
            {isReviewing ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-zinc-400">
                <div className="relative">
                  <Sparkles className="w-12 h-12 animate-pulse text-blue-500" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-2 border-2 border-dashed border-blue-500/30 rounded-full"
                  />
                </div>
                <p className="text-sm font-medium animate-pulse">Analyzing content quality...</p>
              </div>
            ) : review ? (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold flex items-center gap-2 text-emerald-600 uppercase tracking-widest">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-3">
                    {review.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-3 items-start">
                        <span className="text-emerald-500 mt-1 shrink-0">•</span> 
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator className="bg-zinc-100 dark:bg-zinc-800" />

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold flex items-center gap-2 text-amber-600 uppercase tracking-widest">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-3">
                    {review.improvements.map((imp, i) => (
                      <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-3 items-start">
                        <span className="text-amber-500 mt-1 shrink-0">•</span> 
                        <span className="leading-relaxed">{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {review.revised_version && (
                  <div className="mt-8 p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles className="w-12 h-12 text-blue-500" />
                    </div>
                    <h4 className="text-[10px] font-bold text-blue-600 flex items-center gap-2 uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Optimized Revision
                    </h4>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 italic leading-relaxed relative z-10">
                      "{review.revised_version}"
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleApplyRevision}
                      className="w-full bg-white dark:bg-zinc-900 border-blue-200 dark:border-blue-800 text-blue-600 hover:bg-blue-600 hover:text-white transition-all font-bold"
                    >
                      Apply This Revision
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-2">
                <AlertCircle className="w-8 h-8 opacity-20" />
                <p className="text-sm italic">Failed to generate review. Please try again.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 gap-4">
          <Button variant="ghost" onClick={onClose} className="gap-2 h-11 px-6 font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            <Edit3 className="w-4 h-4" />
            Continue Editing
          </Button>
          <Button 
            onClick={handleConfirmPost}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 h-11 font-bold shadow-lg shadow-blue-500/20"
          >
            <Send className="w-4 h-4" />
            {post.scheduledAt ? 'Schedule Content' : 'Publish Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
