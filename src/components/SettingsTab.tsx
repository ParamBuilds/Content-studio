import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, RotateCcw, FileText, Sparkles, Hash, ImageIcon, MessageSquare, Twitter, Instagram, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const promptFiles = [
  { id: 'twitter_copy', label: 'Twitter Copy', icon: Twitter, color: 'text-blue-400' },
  { id: 'instagram_copy', label: 'Instagram Copy', icon: Instagram, color: 'text-pink-500' },
  { id: 'reddit_copy', label: 'Reddit Copy', icon: MessageSquare, color: 'text-orange-500' },
  { id: 'facebook_copy', label: 'Facebook Copy', icon: Facebook, color: 'text-blue-600' },
  { id: 'hashtags', label: 'Hashtags Generator', icon: Hash, color: 'text-purple-500' },
  { id: 'visual_ideas', label: 'Visual Content Ideas', icon: ImageIcon, color: 'text-emerald-500' },
];

export const SettingsTab = () => {
  const [selectedPrompt, setSelectedPrompt] = React.useState(promptFiles[0].id);
  const [content, setContent] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const loadPrompt = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/prompts/${id}`);
      const data = await res.json();
      setContent(data.content || '');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadPrompt(selectedPrompt);
  }, [selectedPrompt]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/prompts/${selectedPrompt}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Prompt Engineering</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Customize the AI "memories" used for content generation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-2 mb-2 block">Prompt Files (.md)</label>
          {promptFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => setSelectedPrompt(file.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                selectedPrompt === file.id 
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm' 
                  : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
              }`}
            >
              <file.icon className={`w-4 h-4 ${file.color}`} />
              {file.label}
              <span className="ml-auto text-[10px] opacity-30 font-mono">.md</span>
            </button>
          ))}
        </div>

        {/* Editor */}
        <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col min-h-[600px]">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-400" />
                {promptFiles.find(f => f.id === selectedPrompt)?.label}.md
              </CardTitle>
              <CardDescription className="text-xs">
                Edit the markdown instructions for this task.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => loadPrompt(selectedPrompt)}>
                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving || isLoading}>
                <Save className="w-3.5 h-3.5 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[500px] p-6 font-mono text-sm border-none focus-visible:ring-0 resize-none bg-zinc-50/30 dark:bg-zinc-900/30"
              placeholder="Enter prompt instructions..."
              disabled={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
