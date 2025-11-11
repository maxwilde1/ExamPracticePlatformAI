import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, AlertCircle, BarChart3, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import AdminPaperUpload from "@/components/AdminPaperUpload";
import AdminModerationQueue from "@/components/AdminModerationQueue";

const menuItems = [
  {
    title: "Overview",
    icon: BarChart3,
    view: "overview",
  },
  {
    title: "Upload Paper",
    icon: Upload,
    view: "upload",
  },
  {
    title: "Moderation Queue",
    icon: AlertCircle,
    view: "moderation",
  },
  {
    title: "All Papers",
    icon: FileText,
    view: "papers",
  },
];

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    console.log("Admin logged out");
    setLocation("/admin");
  };

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-lg font-semibold px-4 py-3">
                Admin Dashboard
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          onClick={() => setActiveView(item.view)}
                          isActive={activeView === item.view}
                          data-testid={`nav-${item.view}`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} data-testid="button-logout">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex items-center gap-2 border-b p-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h1 className="text-xl font-semibold">
              {menuItems.find(item => item.view === activeView)?.title || "Dashboard"}
            </h1>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeView === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Papers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">42</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Across all exam boards
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Attempts This Month
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">1,247</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        +23% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Pending Moderation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">8</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Low confidence scores
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>New paper uploaded: Biology Paper 2</span>
                        <span className="text-muted-foreground">2 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Moderation completed: 3 submissions</span>
                        <span className="text-muted-foreground">5 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New paper uploaded: Physics Paper 1</span>
                        <span className="text-muted-foreground">1 day ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === "upload" && <AdminPaperUpload />}

            {activeView === "moderation" && <AdminModerationQueue />}

            {activeView === "papers" && (
              <Card>
                <CardHeader>
                  <CardTitle>All Papers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Paper management interface coming soon</p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
