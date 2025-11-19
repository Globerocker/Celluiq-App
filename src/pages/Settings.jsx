import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  User, 
  Moon, 
  Bell, 
  Lock, 
  LogOut,
  Activity,
  Link as LinkIcon
} from "lucide-react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to={createPageUrl("Home")}>
          <Button variant="ghost" className="text-[#808080] hover:text-white">
            ← Back to Home
          </Button>
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-[#808080]">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <Card className="bg-[#111111] border-[#1A1A1A]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{user?.full_name || 'User'}</h2>
                <p className="text-[#808080]">{user?.email}</p>
              </div>
            </div>
            <Button className="w-full bg-[#1A1A1A] text-white hover:bg-[#222222]">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Fitness Tracker Integration */}
        <Card className="bg-[#111111] border-[#1A1A1A]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-[#3B7C9E]" />
              <h3 className="text-lg font-semibold text-white">Fitness Trackers</h3>
            </div>
            <div className="space-y-3">
              <Button className="w-full bg-[#1A1A1A] text-white hover:bg-[#222222] justify-between">
                <span>Connect Apple Health</span>
                <LinkIcon className="w-4 h-4" />
              </Button>
              <Button className="w-full bg-[#1A1A1A] text-white hover:bg-[#222222] justify-between">
                <span>Connect Garmin</span>
                <LinkIcon className="w-4 h-4" />
              </Button>
              <Button className="w-full bg-[#1A1A1A] text-white hover:bg-[#222222] justify-between">
                <span>Connect Google Fit</span>
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-[#111111] border-[#1A1A1A]">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
            
            <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#808080]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <div>
                  <p className="text-white font-medium">Language</p>
                  <p className="text-xs text-[#666666]">English (Default)</p>
                </div>
              </div>
              <select className="bg-[#0A0A0A] text-white text-sm px-3 py-1.5 rounded-lg border border-[#333333] focus:border-[#3B7C9E] focus:outline-none">
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-[#808080]" />
                <div>
                  <p className="text-white font-medium">Dark Mode</p>
                  <p className="text-xs text-[#666666]">Currently enabled</p>
                </div>
              </div>
              <Switch 
                checked={darkMode} 
                onCheckedChange={setDarkMode}
                className="data-[state=checked]:bg-[#3B7C9E]"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#808080]" />
                <div>
                  <p className="text-white font-medium">Notifications</p>
                  <p className="text-xs text-[#666666]">Get health reminders</p>
                </div>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications}
                className="data-[state=checked]:bg-[#3B7C9E]"
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#808080]" />
                <div>
                  <p className="text-white font-medium">Privacy & Security</p>
                  <p className="text-xs text-[#666666]">Manage your data</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          onClick={handleLogout}
          className="w-full bg-[#B7323F] text-white hover:bg-[#9A2835]"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}