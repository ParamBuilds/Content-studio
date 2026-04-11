import React from 'react';
import { useContent } from '../ContentContext';
import { Platform } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
    setGeneratedUrl(null);
    setIsGenerating(true);
    try {
      if (mode === 'text-to-video') {
        const result = await generateVideo(prompt || topic);
        if (result.url) {
          setGeneratedUrl(result.url);
          if (result.isFallback) setError(result.notice);
        } else {
          setError('Failed to generate video.');
        }
      } else if (mode === 'image-to-video') {
        const lastImageUrl = generatedUrl; 
        const result = await generateVideo(prompt || topic, lastImageUrl || undefined);
        if (result.url) {
          setGeneratedUrl(result.url);
          if (result.isFallback) setError(result.notice);
        } else {
          setError('Failed to generate video.');
        }
      } else if (mode === 'text-to-image') {
        const url = await generateImage(prompt || topic, imageSize, aspectRatio);
        if (url) setGeneratedUrl(url);
        else setError('Image generation failed. Please check your OpenRouter configuration.');
      } else {
        setError('This mode is coming soon.');
      }
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message || 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[500px]">
      {/* Controls Area */}
      <div className="flex-1 space-y-6">
        <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-full">
          <TabsList className="grid grid-cols-4 w-full h-14 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-xl">
            <TabsTrigger value="text-to-image" className="gap-2 text-xs font-bold uppercase">
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">T → Image</span>
            </TabsTrigger>
            <TabsTrigger value="text-to-video" className="gap-2 text-xs font-bold uppercase">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">T → Video</span>
            </TabsTrigger>
            <TabsTrigger value="image-to-video" className="gap-2 text-xs font-bold uppercase">
              <Film className="w-4 h-4" />
              <span className="hidden sm:inline">I → Video</span>
            </TabsTrigger>
            <TabsTrigger value="video-to-images" className="gap-2 text-xs font-bold uppercase">
              <Scissors className="w-4 h-4" />
              <span className="hidden sm:inline">V → Image</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Magic Prompt</label>
              <div className="flex gap-2">
                <Input 
                  placeholder={mode === 'text-to-video' ? "Describe the video scene..." : "Describe the visual..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 h-12 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {mode === 'text-to-image' ? 'Resolution' : 'Style'}
                </label>
                {mode === 'text-to-image' ? (
                  <Select value={imageSize} onValueChange={(v: any) => setImageSize(v)}>
                    <SelectTrigger className="h-10 text-xs">
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
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photorealistic">Photorealistic</SelectItem>
                      <SelectItem value="illustrated">Illustrated</SelectItem>
                      <SelectItem value="cinematic">Cinematic</SelectItem>
                      <SelectItem value="brand">Brand Style</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Format</label>
                <Select value={aspectRatio} onValueChange={(v: any) => setAspectRatio(v)}>
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                    <SelectItem value="4:5">4:5 (Standard)</SelectItem>
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

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full h-14 text-sm font-bold uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-all rounded-xl shadow-xl shadow-zinc-200 dark:shadow-none"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
              {isGenerating ? 'Igniting Creation...' : 'Generate Masterpiece'}
            </Button>
          </div>
        </Tabs>
      </div>

      {/* Preview Area */}
      <div className="w-full md:w-1/2 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-6 min-h-[400px]">
        <div className="relative w-full aspect-square max-w-[440px] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-2xl group">
          {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center animate-pulse">
                <Wand2 className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest animate-pulse">Gemma 4 Orchestrating...</p>
            </div>
          ) : generatedUrl ? (
            <>
              {mode.includes('video') ? (
                <video key={generatedUrl} src={generatedUrl} controls className="w-full h-full object-cover" />
              ) : (
                <img 
                  src={generatedUrl} 
                  alt="Generated Asset" 
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" className="bg-white/80 backdrop-blur-md" asChild>
                  <a href={generatedUrl} download target="_blank" rel="noreferrer">
                    <ImageIcon className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center p-12 space-y-4">
              <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto border border-zinc-100 dark:border-zinc-800">
                <ImageIcon className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Visual Studio Idle</h3>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tight">Your cinematic assets will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
