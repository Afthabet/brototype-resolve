import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AdminComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [assignedStaffId, setAssignedStaffId] = useState("");
  const [priority, setPriority] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    loadComplaint();
    loadStaff();
  }, [id]);

  const loadComplaint = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          categories (name),
          profiles!complaints_user_id_fkey (full_name, email)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      setComplaint(data);
      setStatus(data.status);
      setAssignedStaffId(data.assigned_staff_id || "");
      setPriority(data.priority);
    } catch (error: any) {
      console.error("Error loading complaint:", error);
      toast({
        title: "Error",
        description: "Failed to load complaint",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      // First get staff user IDs
      const { data: staffRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "staff");

      if (rolesError) throw rolesError;

      if (!staffRoles || staffRoles.length === 0) {
        setStaff([]);
        return;
      }

      const staffIds = staffRoles.map(r => r.user_id);

      // Then get profiles for those users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", staffIds);

      if (profilesError) throw profilesError;

      setStaff(profiles || []);
    } catch (error: any) {
      console.error("Error loading staff:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const updates: any = {
        status,
        priority,
        assigned_staff_id: assignedStaffId || null,
      };

      if (status === "resolved" && !complaint.resolved_at) {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("complaints")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      // Add admin note if provided
      if (note.trim()) {
        const { error: noteError } = await supabase
          .from("complaint_notes")
          .insert({
            complaint_id: id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            note: note,
            is_internal: true,
          });

        if (noteError) throw noteError;
      }

      toast({
        title: "Success",
        description: "Complaint updated successfully",
      });

      navigate("/admin/complaints");
    } catch (error: any) {
      console.error("Error updating complaint:", error);
      toast({
        title: "Error",
        description: "Failed to update complaint",
        variant: "destructive",
      });
    }
  };

  if (loading) return <DashboardLayout role="admin"><p>Loading...</p></DashboardLayout>;
  if (!complaint) return <DashboardLayout role="admin"><p>Complaint not found</p></DashboardLayout>;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/complaints">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Complaint Details</h1>
            <p className="text-muted-foreground">Manage complaint #{complaint.complaint_id}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Complaint Info */}
          <Card>
            <CardHeader>
              <CardTitle>Complaint Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Complaint ID</Label>
                <p className="font-semibold">{complaint.complaint_id}</p>
              </div>
              <div>
                <Label>Title</Label>
                <p className="font-medium">{complaint.title}</p>
              </div>
              <div>
                <Label>Category</Label>
                <p>{complaint.categories?.name}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm">{complaint.description}</p>
              </div>
              <div>
                <Label>Submitted By</Label>
                <p>{complaint.profiles?.full_name}</p>
                <p className="text-sm text-muted-foreground">{complaint.profiles?.email}</p>
              </div>
              <div>
                <Label>Created At</Label>
                <p className="text-sm">{new Date(complaint.created_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Management Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assign to Staff</Label>
                <Select value={assignedStaffId} onValueChange={setAssignedStaffId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.full_name} ({s.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Admin Note (Internal)</Label>
                <Textarea
                  placeholder="Add internal note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={handleUpdate} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Update Complaint
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminComplaintDetail;
