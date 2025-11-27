import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, User, Tag, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ComplaintNote {
  id: string;
  note: string;
  created_at: string;
  is_internal: boolean;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Complaint {
  id: string;
  complaint_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  categories: {
    name: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
  assigned_staff?: {
    full_name: string;
    email: string;
  } | null;
}

const StudentComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [notes, setNotes] = useState<ComplaintNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      loadComplaint();
      loadNotes();
    }
  }, [user, id]);

  const loadComplaint = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          categories (name),
          profiles!complaints_user_id_fkey (full_name, email),
          assigned_staff:profiles!complaints_assigned_staff_id_fkey (full_name, email)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast.error("Complaint not found");
        navigate("/student");
        return;
      }

      setComplaint(data);
    } catch (error: any) {
      console.error("Error loading complaint:", error);
      toast.error("Failed to load complaint details");
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const { data: notesData, error } = await supabase
        .from("complaint_notes")
        .select("*")
        .eq("complaint_id", id)
        .eq("is_internal", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile data for each note
      if (notesData && notesData.length > 0) {
        const userIds = [...new Set(notesData.map(note => note.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        
        const notesWithProfiles = notesData.map(note => ({
          ...note,
          profiles: profilesMap.get(note.user_id) || { full_name: "Unknown", email: "" }
        }));

        setNotes(notesWithProfiles);
      } else {
        setNotes([]);
      }
    } catch (error: any) {
      console.error("Error loading notes:", error);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const capitalizeStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading complaint details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Complaint not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/student")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{complaint.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      ID: {complaint.complaint_id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusVariant(complaint.status)}>
                      {capitalizeStatus(complaint.status)}
                    </Badge>
                    <Badge variant={getPriorityVariant(complaint.priority)}>
                      {complaint.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {complaint.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Updates & Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {notes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No updates yet. You'll see updates from staff here once they work on your complaint.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{note.profiles.full_name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(note.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {note.note}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{complaint.categories.name}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-medium">{formatDate(complaint.created_at)}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{formatDate(complaint.updated_at)}</p>
                  </div>
                </div>

                {complaint.resolved_at && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Resolved</p>
                        <p className="font-medium">{formatDate(complaint.resolved_at)}</p>
                      </div>
                    </div>
                  </>
                )}

                {complaint.assigned_staff && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Assigned To</p>
                        <p className="font-medium">{complaint.assigned_staff.full_name}</p>
                      </div>
                    </div>
                  </>
                )}

                {complaint.status === "rejected" && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Complaint Rejected</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Check the updates section for details.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentComplaintDetail;
