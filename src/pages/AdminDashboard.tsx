import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Users, CheckCircle, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    activeComplaints: 0,
    resolvedComplaints: 0,
    totalUsers: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load complaints stats
      const { data: complaints, error: complaintsError } = await supabase
        .from("complaints")
        .select("id, status");

      if (complaintsError) throw complaintsError;

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

      if (profilesError) throw profilesError;

      const totalUsers = profiles?.length || 0;

      setStats({
        totalComplaints,
        activeComplaints,
        resolvedComplaints,
        totalUsers,
      });

      // Load recent complaints
      const { data: recent, error: recentError } = await supabase
        .from("complaints")
        .select(`
          *,
          categories (name),
          profiles (full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentError) throw recentError;
      setRecentComplaints(recent || []);

    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
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

        {/* Recent Complaints */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : recentComplaints.length === 0 ? (
              <p className="text-muted-foreground">No complaints yet</p>
            ) : (
              <div className="space-y-4">
                {recentComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{complaint.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {complaint.categories?.name} • {complaint.profiles?.full_name}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </div>
                  </div>
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
