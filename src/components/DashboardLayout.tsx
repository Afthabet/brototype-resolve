import { Shield, Home, FileText, User, LogOut, Users, Settings, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "student" | "staff" | "admin";
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const getNavItems = () => {
    switch (role) {
      case "student":
        return [
          { icon: Home, label: "Dashboard", path: "/student" },
          { icon: FileText, label: "My Complaints", path: "/student/complaints" },
          { icon: User, label: "Profile", path: "/student/profile" },
        ];
      case "staff":
        return [
          { icon: Home, label: "Dashboard", path: "/staff" },
          { icon: FileText, label: "Assigned", path: "/staff/assigned" },
          { icon: User, label: "Profile", path: "/staff/profile" },
        ];
      case "admin":
        return [
          { icon: Home, label: "Dashboard", path: "/admin" },
          { icon: FileText, label: "All Complaints", path: "/admin/complaints" },
          { icon: Users, label: "Users", path: "/admin/users" },
          { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
          { icon: Settings, label: "Settings", path: "/admin/settings" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-xl">BCMS</span>
              <span className="text-xs text-muted-foreground ml-2 capitalize">
                {role} Portal
              </span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-primary/10 transition-smooth"
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
