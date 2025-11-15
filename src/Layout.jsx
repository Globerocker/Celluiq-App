import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Droplet, Utensils, Pill, User, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Blood Markers",
    url: createPageUrl("BloodMarkers"),
    icon: Droplet,
  },
  {
    title: "Nutrition",
    url: createPageUrl("Nutrition"),
    icon: Utensils,
  },
  {
    title: "Supplement Stack",
    url: createPageUrl("SupplementStack"),
    icon: Pill,
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: User,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#F6F7F5]">
        <Sidebar className="border-r border-[#24272A1A]">
          <SidebarHeader className="border-b border-[#24272A1A] p-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6918fb0cf6a9e7160138f9da/30649b179_IconCELLUIQ.png"
                alt="CELLUIQ Icon"
                className="w-10 h-10"
              />
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6918fb0cf6a9e7160138f9da/7b4f18e64_1.png"
                alt="CELLUIQ"
                className="h-6"
              />
            </div>
            <p className="text-xs text-[#64676A] mt-2 font-medium">Personalized Health Intelligence</p>
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-[#64676A] uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-[#B7323F] hover:text-white transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url ? 'bg-[#B7323F] text-white shadow-md' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-[#24272A1A] p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-[#F6F7F5] rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5 text-[#64676A]" />
              <span className="font-medium text-[#64676A]">Logout</span>
            </button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-[#24272A1A] px-6 py-4 md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="hover:bg-[#F6F7F5] p-2 rounded-lg transition-colors" />
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6918fb0cf6a9e7160138f9da/30649b179_IconCELLUIQ.png"
                  alt="CELLUIQ"
                  className="w-8 h-8"
                />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}