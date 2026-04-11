import React from 'react';
import { ContentProvider, useContent } from './ContentContext';
import { Platform, Tab, Tone } from './types';
import { PlatformTab } from './components/PlatformTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { QueueTab } from './components/QueueTab';
import { SettingsTab } from './components/SettingsTab';
import { AccountTab } from './components/AccountTab';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { GradientDots } from '@/components/ui/gradient-dots';
import { 
  Twitter, 
  Instagram, 
  MessageSquare, 
  Facebook, 
  LayoutDashboard, 
  Settings, 
  User,
  Search,
  Zap,
  BarChart3,
  Sun,
  Moon,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick,
  collapsed
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void,
  collapsed: boolean,
  key?: string
}) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
      active 
        ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm' 
        : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100'
    } ${collapsed ? 'justify-center px-2' : ''}`}
  >
    <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-blue-500' : 'group-hover:text-blue-500'}`} />
    {!collapsed && (
      <motion.span 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-sm font-medium whitespace-nowrap overflow-hidden"
      >
        {label}
      </motion.span>
    )}
    {active && !collapsed && (
      <motion.div 
        layoutId="active-pill" 
        className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"
      />
    )}
    {active && collapsed && (
      <motion.div 
        layoutId="active-pill-collapsed" 
        className="absolute right-1 w-1 h-4 rounded-full bg-blue-500"
      />
    )}
  </button>
);

const Dashboard = () => {
  const { topic, setTopic, tone, setTone } = useContent();
  const [activeTab, setActiveTab] = React.useState<Tab>('twitter');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const platforms: { id: Platform, label: string, icon: any }[] = [
    { id: 'twitter', label: 'Twitter / X', icon: Twitter },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'reddit', label: 'Reddit', icon: MessageSquare },
    { id: 'facebook', label: 'Facebook', icon: Facebook },
  ];

  return (
    <div className={`flex h-screen bg-bg-main text-text-primary overflow-hidden relative theme-${theme} transition-colors duration-500`}>
      {/* Dynamic Mesh Background */}
      <div className="mesh-bg opacity-40 forced-dark:opacity-20" />
      
      {/* Premium Gradient Dots Background */}
      <GradientDots 
        className="opacity-[0.15] dark:opacity-[0.25] pointer-events-none" 
        backgroundColor="transparent" 
        duration={45}
      />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Midnight Glass */}
      <aside 
        className={`fixed lg:relative z-50 h-full border-r border-border flex flex-col glass-panel !rounded-none transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-72'
        } ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className={`flex items-center gap-3 px-6 h-24 shrink-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-lg font-bold tracking-tight font-display">Content Studio</h1>
              <span className="text-[10px] text-accent font-semibold tracking-[0.2em] uppercase">Pro Edition</span>
            </motion.div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden ml-auto"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          <div className="space-y-1">
            <label className={`text-[10px] font-bold uppercase tracking-widest text-text-muted px-4 mb-3 block ${isSidebarCollapsed ? 'text-center px-0' : ''}`}>
              {isSidebarCollapsed ? '•' : 'Content Hub'}
            </label>
            {platforms.map((p) => (
              <SidebarItem
                key={p.id}
                icon={p.icon}
                label={p.label}
                active={activeTab === p.id}
                onClick={() => {
                  setActiveTab(p.id);
                  setIsMobileMenuOpen(false);
                }}
                collapsed={isSidebarCollapsed}
              />
            ))}
          </div>
          
          <div className="space-y-1">
            <label className={`text-[10px] font-bold uppercase tracking-widest text-text-muted px-4 mb-3 block ${isSidebarCollapsed ? 'text-center px-0' : ''}`}>
              {isSidebarCollapsed ? '•' : 'Audio Studio'}
            </label>
            <SidebarItem 
              icon={Sun} 
              label="Audio (TTS/Note)" 
              active={activeTab === 'audio'} 
              onClick={() => {
                setActiveTab('audio' as any);
                setIsMobileMenuOpen(false);
              }} 
              collapsed={isSidebarCollapsed}
            />
          </div>

          <div className="space-y-1">
            <label className={`text-[10px] font-bold uppercase tracking-widest text-text-muted px-4 mb-3 block ${isSidebarCollapsed ? 'text-center px-0' : ''}`}>
              {isSidebarCollapsed ? '•' : 'Operations'}
            </label>
            <SidebarItem 
              icon={BarChart3} 
              label="Analytics" 
              active={activeTab === 'analytics'} 
              onClick={() => {
                setActiveTab('analytics');
                setIsMobileMenuOpen(false);
              }} 
              collapsed={isSidebarCollapsed}
            />
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Asset Queue" 
              active={activeTab === 'queue'} 
              onClick={() => {
                setActiveTab('queue');
                setIsMobileMenuOpen(false);
              }} 
              collapsed={isSidebarCollapsed}
            />
          </div>
        </div>

        {/* User Profile Area */}
        <div className="p-4 border-t border-border bg-bg-secondary/50">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-tertiary transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">JD</div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Demo User</span>
                <span className="text-[10px] text-text-muted">Pro Plan</span>
              </div>
              <Settings className="ml-auto w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent/20 mx-auto flex items-center justify-center text-accent font-bold cursor-pointer">JD</div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Modern Top Header */}
        <header className="h-24 flex items-center px-8 lg:px-12 gap-8 bg-bg-main/50 backdrop-blur-xl border-b border-border">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden shrink-0 glass-panel"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5 text-text-primary" />
          </Button>

          <div className="flex-1 relative group max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-all" />
            <Input 
              placeholder="What are we igniting today? (e.g. AI Strategy...)" 
              className="pl-12 h-14 bg-bg-secondary/50 border-border focus:border-accent text-lg rounded-2xl glass-panel !transition-all !duration-300"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <label className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-1">Theme</label>
              <button
                onClick={toggleTheme}
                className="w-12 h-6 rounded-full bg-bg-tertiary relative border border-border transition-all"
              >
                <motion.div 
                  animate={{ x: theme === 'light' ? 2 : 24 }}
                  className="w-4 h-4 rounded-full bg-accent absolute top-1/2 -translate-y-1/2 shadow-lg shadow-accent/40"
                />
              </button>
            </div>

            <div className="h-10 w-[1px] bg-border" />

            <div className="flex flex-col">
              <label className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-1">Director Tone</label>
              <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                <SelectTrigger className="w-40 h-10 bg-bg-secondary/50 border-border glass-panel font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-panel border-border">
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-accent/5 border border-accent/20 glow-shadow">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider">Studio Active</span>
            </div>
          </div>
        </header>

        {/* Dynamic Studio Window */}
        <div className="flex-1 overflow-hidden p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="h-full"
            >
              {activeTab === 'analytics' ? (
                <AnalyticsTab />
              ) : activeTab === 'queue' ? (
                <QueueTab />
              ) : activeTab === 'settings' ? (
                <SettingsTab />
              ) : activeTab === 'account' ? (
                <AccountTab />
              ) : activeTab === ('audio' as any) ? (
                <div className="h-full flex items-center justify-center text-text-muted italic">Audio Studio Components Mounting...</div>
              ) : (
                <PlatformTab platform={activeTab} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ContentProvider>
      <Dashboard />
    </ContentProvider>
  );
}
