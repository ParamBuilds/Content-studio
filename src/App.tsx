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
    <div className="flex h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden relative">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed lg:relative z-50 h-full border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/50 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className={`flex items-center gap-2 px-4 h-20 shrink-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          {!isSidebarCollapsed && (
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-bold tracking-tight whitespace-nowrap"
            >
              Content Studio
            </motion.h1>
          )}
          
          {/* Mobile Close Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden ml-auto"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
          <label className={`text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 mb-2 block ${isSidebarCollapsed ? 'text-center px-0' : ''}`}>
            {isSidebarCollapsed ? '•' : 'Platforms'}
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
          
          <Separator className="my-4 bg-zinc-200 dark:border-zinc-800" />
          <label className={`text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 mb-2 block ${isSidebarCollapsed ? 'text-center px-0' : ''}`}>
            {isSidebarCollapsed ? '•' : 'Insights'}
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

          <Separator className="my-4 bg-zinc-200 dark:bg-zinc-800" />
          <label className={`text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 mb-2 block ${isSidebarCollapsed ? 'text-center px-0' : ''}`}>
            {isSidebarCollapsed ? '•' : 'System'}
          </label>
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Queue" 
            active={activeTab === 'queue'} 
            onClick={() => {
              setActiveTab('queue');
              setIsMobileMenuOpen(false);
            }} 
            collapsed={isSidebarCollapsed}
          />
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => {
              setActiveTab('settings');
              setIsMobileMenuOpen(false);
            }} 
            collapsed={isSidebarCollapsed}
          />
          <SidebarItem 
            icon={User} 
            label="Account" 
            active={activeTab === 'account'} 
            onClick={() => {
              setActiveTab('account');
              setIsMobileMenuOpen(false);
            }} 
            collapsed={isSidebarCollapsed}
          />
        </div>

        {/* Collapse Toggle (Desktop) */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 hidden lg:block">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 text-zinc-500"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            {!isSidebarCollapsed && <span className="text-sm font-medium">Collapse Sidebar</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Global Header */}
        <header className="h-20 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 lg:px-8 gap-4 lg:gap-6 bg-white dark:bg-zinc-950 z-10">
          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden shrink-0"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="What are we creating today? (e.g. Launching my productivity app...)" 
              className="pl-10 h-12 bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-base"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-9 h-9 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            <Separator orientation="vertical" className="h-8 bg-zinc-200 dark:bg-zinc-800" />

            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Tone</label>
              <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                <SelectTrigger className="w-40 h-9 bg-zinc-50 dark:bg-zinc-900 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-8 bg-zinc-200 dark:bg-zinc-800" />

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Connected</span>
            </div>
          </div>
        </header>

        {/* Platform Content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {activeTab === 'analytics' ? (
                <AnalyticsTab />
              ) : activeTab === 'queue' ? (
                <QueueTab />
              ) : activeTab === 'settings' ? (
                <SettingsTab />
              ) : activeTab === 'account' ? (
                <AccountTab />
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
