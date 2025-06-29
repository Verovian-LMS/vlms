
import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Settings, 
  BarChart, 
  FileText, 
  Calendar, 
  Upload,
} from "lucide-react";

interface ProfileSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  profile: any;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  profile 
}) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: User },
    { id: "analytics", label: "Analytics", icon: BarChart },
    { id: "courses", label: "My Courses", icon: FileText },
    { id: "uploaded-courses", label: "Uploaded Courses", icon: Upload },
    { id: "calendar", label: "Study Schedule", icon: Calendar },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-full md:w-64 bg-white rounded-lg border shadow-sm">
      <div className="p-6 flex flex-col items-center">
        <Avatar className="w-24 h-24 mb-4 border-4 border-white shadow">
          <AvatarImage src={profile?.avatar} alt={profile?.name} />
          <AvatarFallback>{profile?.name?.substring(0, 2) || "UN"}</AvatarFallback>
        </Avatar>
        <h3 className="font-bold text-lg">{profile?.name || "User"}</h3>
        <p className="text-sm text-gray-500">{profile?.role || "Medical Student"}</p>
      </div>
      <Separator />
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Button
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeSection === item.id ? "bg-slate-100" : ""
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default ProfileSidebar;
