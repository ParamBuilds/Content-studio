import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight,
  Share2,
  MousePointer2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: 'Mon', views: 4000, interactions: 2400, comments: 400 },
  { name: 'Tue', views: 3000, interactions: 1398, comments: 300 },
  { name: 'Wed', views: 2000, interactions: 9800, comments: 1200 },
  { name: 'Thu', views: 2780, interactions: 3908, comments: 500 },
  { name: 'Fri', views: 1890, interactions: 4800, comments: 600 },
  { name: 'Sat', views: 2390, interactions: 3800, comments: 400 },
  { name: 'Sun', views: 3490, interactions: 4300, comments: 700 },
];

const platformData = [
  { name: 'Twitter', value: 45, color: '#3b82f6' },
  { name: 'Instagram', value: 30, color: '#ec4899' },
  { name: 'Reddit', value: 15, color: '#f97316' },
  { name: 'Facebook', value: 10, color: '#1d4ed8' },
];

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900">
          <Icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight mt-1">{value}</h3>
      </div>
    </CardContent>
  </Card>
);

export const AnalyticsTab = () => {
  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Track your performance across all connected accounts.</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
          <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-zinc-800 shadow-sm">7 Days</button>
          <button className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">30 Days</button>
          <button className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">90 Days</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Views" value="124.5k" change="+12.5%" icon={Eye} trend="up" />
        <StatCard title="Interactions" value="48.2k" change="+8.2%" icon={MousePointer2} trend="up" />
        <StatCard title="Comments" value="1,284" change="-2.4%" icon={MessageCircle} trend="down" />
        <StatCard title="Audience Reach" value="89.1k" change="+15.3%" icon={Users} trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Growth Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="interactions" 
                  stroke="#ec4899" 
                  strokeWidth={2}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-500" />
              Platform Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={platformData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  width={80}
                />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-8 space-y-3">
              {platformData.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-zinc-500 dark:text-zinc-400">{p.name}</span>
                  </div>
                  <span className="font-bold">{p.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Audience Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { user: 'Sarah Jenkins', action: 'commented on your Instagram post', time: '2h ago', content: 'This is exactly what I needed today! Thanks for sharing.' },
              { user: 'TechExplorer', action: 'retweeted your launch announcement', time: '5h ago', content: '' },
              { user: 'Alex Rivera', action: 'replied to your Reddit thread', time: '1d ago', content: 'Have you considered adding a dark mode toggle?' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      <span className="font-bold">{item.user}</span>{' '}
                      <span className="text-zinc-500">{item.action}</span>
                    </p>
                    <span className="text-xs text-zinc-400">{item.time}</span>
                  </div>
                  {item.content && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 italic">"{item.content}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
