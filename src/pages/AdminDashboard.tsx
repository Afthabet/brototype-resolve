import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Users, CheckCircle, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    activeComplaints: 0,
    resolvedComplaints: 0,
    totalUsers: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "in_progress": return "default";
      case "resolved": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load complaints stats
      const { data: complaints, error: complaintsError } = await supabase
        .from("complaints")
        .select("id, status");

      if (complaintsError) {
        console.error("Error loading complaints:", complaintsError);
        throw complaintsError;
      }

      console.log("Loaded complaints:", complaints);

      const totalComplaints = complaints?.length || 0;
      const activeComplaints = complaints?.filter(
        c => c.status === "pending" || c.status === "in_progress"
      ).length || 0;
      const resolvedComplaints = complaints?.filter(
        c => c.status === "resolved"
      ).length || 0;

      // Load users count
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id");

      if (profilesError) {
        console.error("Error loading profiles:", profilesError);
        throw profilesError;
      }

      console.log("Loaded profiles:", profiles);

      const totalUsers = profiles?.length || 0;

      setStats({
        totalComplaints,
        activeComplaints,
        resolvedComplaints,
        totalUsers,
      });

      // Load recent complaints with proper joins
      const { data: recent, error: recentError } = await supabase
        .from("complaints")
        .select(`
          id,
          title,
          status,
          priority,
          created_at,
          categories!inner (name),
          profiles!complaints_user_id_fkey (full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentError) {
        console.error("Error loading recent complaints:", recentError);
        throw recentError;
      }

      console.log("Loaded recent complaints:", recent);
      setRecentComplaints(recent || []);

      // Load category analytics
      const { data: categoryStats, error: categoryError } = await supabase
        .from("complaints")
        .select(`
          category_id,
          categories!inner (name)
        `);

      if (!categoryError && categoryStats) {
        const categoryMap = new Map();
        categoryStats.forEach((item: any) => {
          const catName = item.categories?.name || "Unknown";
          categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1);
        });
        const catData = Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value
        }));
        setCategoryData(catData);
      }

      // Load status analytics
      const statusMap = new Map();
      complaints?.forEach((c: any) => {
        statusMap.set(c.status, (statusMap.get(c.status) || 0) + 1);
      });
      const statData = Array.from(statusMap.entries()).map(([name, value]) => ({
        name: name.replace('_', ' ').toUpperCase(),
        value
      }));
      setStatusData(statData);

    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete system overview and management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComplaints}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeComplaints}</div>
              <p className="text-xs text-muted-foreground">Pending + In Progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolvedComplaints}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalComplaints > 0
                  ? `${Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100)}% resolution rate`
                  : "0% resolution rate"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Complaints by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complaints by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Complaints */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Complaints</CardTitle>
            <Link to="/admin/complaints">
              <Button variant="outline" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : recentComplaints.length === 0 ? (
              <p className="text-muted-foreground">No complaints yet</p>
            ) : (
              <div className="space-y-3">
                {recentComplaints.map((complaint) => (
                  <Link
                    key={complaint.id}
                    to={`/admin/complaints/${complaint.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{complaint.title}</p>
                        <div className="flex gap-2 items-center text-sm text-muted-foreground">
                          <span>{complaint.categories?.name}</span>
                          <span>•</span>
                          <span>{complaint.profiles?.full_name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getStatusVariant(complaint.status)}>
                            {complaint.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant={getPriorityVariant(complaint.priority)}>
                            {complaint.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
