import React from 'react';
import { useContent } from '../ContentContext';
import { Platform } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageIcon, Video, Film, Scissors, Wand2, Loader2 } from 'lucide-react';
import { generateVideo, generateImage } from '../lib/gemini';
import { motion } from 'motion/react';
import { KeyRound, ExternalLink } from 'lucide-react';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

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
  const [hasApiKey, setHasApiKey] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        setHasApiKey(true); // Fallback for local dev if needed
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true); // Assume success per skill instructions
    }
  };

  const handleGenerate = async () => {
    if (!hasApiKey) {
      await handleSelectKey();
    }
    
    setIsGenerating(true);
    try {
      if (mode === 'text-to-video') {
        const url = await generateVideo(prompt || topic, aspectRatio === '16:9' || aspectRatio === '9:16' ? aspectRatio : '16:9');
        setGeneratedUrl(url);
      } else if (mode === 'text-to-image') {
        const url = await generateImage(prompt || topic, imageSize, aspectRatio);
        setGeneratedUrl(url);
      } else {
        // Mock for other modes for now
        await new Promise(r => setTimeout(r, 2000));
        setGeneratedUrl('https://picsum.photos/seed/contentstudio/800/450');
      }
    } catch (error: any) {
      if (error.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
      }
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (hasApiKey === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 space-y-4 text-center">
        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
          <KeyRound className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold">API Key Required</h3>
          <p className="text-sm text-zinc-500 max-w-[280px]">
            High-quality image and video generation requires a paid Gemini API key.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-[240px]">
          <Button onClick={handleSelectKey} className="w-full gap-2">
            Select API Key
          </Button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-zinc-400 hover:text-blue-500 flex items-center justify-center gap-1"
          >
            Learn about billing <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    );
  }

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
            <Button onClick={handleGenerate} disabled={isGenerating || hasApiKey === null}>
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
