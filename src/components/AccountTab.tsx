import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Globe, Twitter, Instagram, MessageSquare, Facebook, ExternalLink, LogOut } from 'lucide-react';

const ConnectedAccount = ({ platform, username, icon: Icon, color }: any) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-bold capitalize">{platform}</p>
        <p className="text-xs text-zinc-500">@{username}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <ExternalLink className="w-3.5 h-3.5" />
      </Button>
    </div>
  </div>
);

export const AccountTab = () => {
  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Manage your profile and connected social media accounts.</p>
        </div>
        <Button variant="outline" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 border-rose-200 dark:border-rose-800">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 mx-auto mb-4 flex items-center justify-center border-4 border-white dark:border-zinc-950 shadow-xl">
                <User className="w-10 h-10 text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold">Edward Paul</h3>
              <p className="text-sm text-zinc-500 mb-6">edwardpaul75060@gmail.com</p>
              <Button variant="outline" size="sm" className="w-full">Edit Profile</Button>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Plan</span>
                <Badge>Pro Plan</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Next Billing</span>
                <span className="text-sm font-medium">May 1, 2026</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">Manage Billing</Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                Connected Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ConnectedAccount platform="twitter" username="edward_tech" icon={Twitter} color="text-blue-400" />
              <ConnectedAccount platform="instagram" username="edward.visuals" icon={Instagram} color="text-pink-500" />
              <ConnectedAccount platform="reddit" username="edward_p" icon={MessageSquare} color="text-orange-500" />
              <ConnectedAccount platform="facebook" username="edwardpaul" icon={Facebook} color="text-blue-600" />
              
              <Button variant="outline" className="w-full border-dashed py-8">
                + Connect New Account
              </Button>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                <div>
                  <p className="text-sm font-bold">Two-Factor Authentication</p>
                  <p className="text-xs text-zinc-500">Secure your account with 2FA.</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
