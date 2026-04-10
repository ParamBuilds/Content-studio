import React from 'react';
import { useContent } from '../ContentContext';
import { Platform } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageIcon, Video, Film, Scissors, Wand2, Loader2, AlertCircle } from 'lucide-react';
import { generateVideo, generateImage } from '../lib/gemini';
import { motion } from 'motion/react';

interface VisualEngineProps {
  platform: Platform;
}

export const VisualEngine: React.FC<VisualEngineProps> = ({ platform }) => {
  const { topic, updatePost } = useContent();
  const [mode, setMode] = React.useState<'text-to-image' | 'text-to-video' | 'image-to-video' | 'video-to-images'>('text-to-image');
  const [prompt, setPrompt] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedUrl, setGeneratedUrl] = React.useState<string | null>(null);
  const [imageSize, setImageSize] = React.useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = React.useState<'1:1' | '16:9' | '9:16' | '4:5'>('1:1');
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      if (mode === 'text-to-video' || mode === 'image-to-video') {
        setError('Video generation requires a specialised paid AI service and is not available with your current RapidAPI plan. Use Text → Image instead.');
        return;
      } else if (mode === 'text-to-image') {
        const url = await generateImage(prompt || topic, imageSize, aspectRatio);
        if (url) setGeneratedUrl(url);
        else setError('Image generation returned no result. Check your RapidAPI key and subscription.');
      } else {
        // video-to-images: not implemented
        setError('This mode requires video upload functionality, coming soon.');
      }
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message || 'Generation failed. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-full">
        <TabsList className="grid grid-cols-4 w-full h-14 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-xl">
          <TabsTrigger value="text-to-image" className="gap-2 text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">T → Image</span>
          </TabsTrigger>
          <TabsTrigger value="text-to-video" className="gap-2 text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">T → Video</span>
          </TabsTrigger>
          <TabsTrigger value="image-to-video" className="gap-2 text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
            <Film className="w-4 h-4" />
            <span className="hidden sm:inline">I → Video</span>
          </TabsTrigger>
          <TabsTrigger value="video-to-images" className="gap-2 text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
            <Scissors className="w-4 h-4" />
            <span className="hidden sm:inline">V → Image</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder={mode === 'text-to-video' ? "Describe the video scene..." : "Describe the visual..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {mode === 'text-to-image' ? 'Resolution' : 'Style'}
              </label>
              {mode === 'text-to-image' ? (
                <Select value={imageSize} onValueChange={(v: any) => setImageSize(v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1K">1K Resolution</SelectItem>
                    <SelectItem value="2K">2K Resolution</SelectItem>
                    <SelectItem value="4K">4K Resolution</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select defaultValue="photorealistic">
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photorealistic">Photorealistic</SelectItem>
                    <SelectItem value="illustrated">Illustrated</SelectItem>
                    <SelectItem value="typographic">Typographic</SelectItem>
                    <SelectItem value="brand">Brand Style</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Aspect Ratio</label>
              <Select value={aspectRatio} onValueChange={(v: any) => setAspectRatio(v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                  <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                  <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {generatedUrl && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900"
            >
              {mode.includes('video') ? (
                <video src={generatedUrl} controls className="w-full h-full object-cover" />
              ) : (
                <img src={generatedUrl} alt="Generated" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              )}
              <Button 
                size="sm" 
                className="absolute bottom-2 right-2 gap-2"
                onClick={() => updatePost(platform, { attachedMedia: [generatedUrl] })}
              >
                Use Asset
              </Button>
            </motion.div>
          )}
        </div>
      </Tabs>
    </div>
  );
};
