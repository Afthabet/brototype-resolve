import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

const Complaints = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to student dashboard
    navigate("/student");
  }, [navigate]);

  return (
    <DashboardLayout role="student">
      <div>Loading...</div>
    </DashboardLayout>
  );
};

export default Complaints;
