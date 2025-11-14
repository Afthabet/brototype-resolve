import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

const StudentDashboard = () => {
  const complaints = [
    {
      id: "CMP-001",
      title: "Wi-Fi connectivity issue in hostel",
      category: "Technical",
      status: "In Progress",
      date: "2024-01-15",
      priority: "High"
    },
    {
      id: "CMP-002",
      title: "Request for makeup class",
      category: "Academic",
      status: "Resolved",
      date: "2024-01-14",
      priority: "Medium"
    },
    {
      id: "CMP-003",
      title: "Placement support needed",
      category: "Placement",
      status: "Pending",
      date: "2024-01-13",
      priority: "High"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4" />;
      case "In Progress":
        return <AlertCircle className="h-4 w-4" />;
      case "Resolved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "Rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Pending":
        return "secondary";
      case "In Progress":
        return "default";
      case "Resolved":
        return "outline";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Being worked on</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Successfully closed</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Complaints */}
        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Complaints</CardTitle>
                <CardDescription>Track and manage your submitted complaints</CardDescription>
              </div>
              <Link to="/student/new-complaint">
                <Button className="bg-gradient-primary hover:opacity-90 transition-smooth">
                  <Plus className="h-4 w-4 mr-2" />
                  New Complaint
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getStatusIcon(complaint.status)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{complaint.title}</h3>
                        {complaint.priority === "High" && (
                          <Badge variant="destructive" className="text-xs">High Priority</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{complaint.id}</span>
                        <span>•</span>
                        <span>{complaint.category}</span>
                        <span>•</span>
                        <span>{complaint.date}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(complaint.status)}>
                    {complaint.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
