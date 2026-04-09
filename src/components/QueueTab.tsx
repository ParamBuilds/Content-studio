import React from 'react';
import { useContent } from '../ContentContext';
import { Platform, PostState } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, Twitter, Instagram, MessageSquare, Facebook, CheckCircle2, Timer } from 'lucide-react';
import { motion } from 'motion/react';

const PlatformIcon = ({ platform }: { platform: Platform }) => {
  switch (platform) {
    case 'twitter': return <Twitter className="w-4 h-4 text-blue-400" />;
    case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
    case 'reddit': return <MessageSquare className="w-4 h-4 text-orange-500" />;
    case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
  }
};

export const QueueTab = () => {
  const { posts } = useContent();
  
  const allPosts = (Object.keys(posts) as Platform[]).map((platform) => ({
    platform,
    ...posts[platform]
  })).filter(p => p.status !== 'draft');

  const scheduled = allPosts.filter(p => p.status === 'scheduled').sort((a, b) => 
    (a.scheduledAt?.getTime() || 0) - (b.scheduledAt?.getTime() || 0)
  );
  
  const published = allPosts.filter(p => p.status === 'published');

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Content Queue</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Manage your upcoming and past publications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-400">
            <Timer className="w-4 h-4" />
            Upcoming ({scheduled.length})
          </div>
          
          <div className="space-y-4">
            {scheduled.map((post, i) => (
              <motion.div
                key={post.platform}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                  <div className="h-1 bg-blue-500" />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={post.platform} />
                        <span className="text-xs font-bold uppercase tracking-wider">{post.platform}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <Clock className="w-3 h-3" />
                        {post.scheduledAt?.toLocaleString()}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2 italic">
                      "{post.copy}"
                    </p>
                    {post.attachedMedia.length > 0 && (
                      <div className="flex gap-2">
                        {post.attachedMedia.map((m, idx) => (
                          <div key={idx} className="w-12 h-12 rounded bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                            <img src={m} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {scheduled.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-xl">
                <Calendar className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm text-zinc-400 italic">No posts scheduled yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-400">
            <CheckCircle2 className="w-4 h-4" />
            Published ({published.length})
          </div>
          
          <div className="space-y-4">
            {published.map((post, i) => (
              <Card key={post.platform} className="border-zinc-200 dark:border-zinc-800 shadow-sm opacity-75">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={post.platform} />
                      <span className="text-xs font-bold uppercase tracking-wider">{post.platform}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
                      Published
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-500 line-clamp-2">
                    {post.copy}
                  </p>
                </CardContent>
              </Card>
            ))}
            {published.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm text-zinc-400 italic">No posts published yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
