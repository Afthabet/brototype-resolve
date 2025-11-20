import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const StaffDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    if (user) {
      loadComplaints();
    }
  }, [user]);

  const loadComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          categories (name),
          profiles (full_name)
        `)
        .eq("assigned_staff_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setComplaints(data || []);
      
      // Calculate stats
      const assigned = data?.filter(c => c.status === "pending").length || 0;
      const inProgress = data?.filter(c => c.status === "in_progress").length || 0;
      const resolved = data?.filter(c => c.status === "resolved").length || 0;
      
      setStats({ assigned, inProgress, resolved });
    } catch (error: any) {
      console.error("Error loading complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <ClipboardList className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "in_progress":
        return "default";
      case "resolved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground">Manage assigned complaints</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assigned}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : complaints.length === 0 ? (
              <p className="text-muted-foreground">No complaints assigned yet</p>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-smooth"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{complaint.complaint_id}</span>
                        <Badge variant={getStatusVariant(complaint.status)}>
                          {getStatusIcon(complaint.status)}
                          <span className="ml-1">{complaint.status.replace("_", " ")}</span>
                        </Badge>
                      </div>
                      <p className="font-medium">{complaint.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {complaint.categories?.name} • Submitted by {complaint.profiles?.full_name}
                      </p>
                    </div>
                    <Link to={`/staff/complaint/${complaint.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
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

export default StaffDashboard;
