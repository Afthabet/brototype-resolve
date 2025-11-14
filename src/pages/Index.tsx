import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, Clock, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">BCMS</span>
          </div>
          <Link to="/login">
            <Button className="bg-gradient-primary hover:opacity-90 transition-smooth">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Brototype Complaint
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Management System
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A transparent and efficient platform for students and staff to manage complaints
              with accountability and faster resolutions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-smooth text-lg px-8">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            <div className="bg-card p-6 rounded-lg shadow-soft hover:shadow-medium transition-smooth">
              <CheckCircle2 className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Track Status</h3>
              <p className="text-sm text-muted-foreground">
                Real-time updates on your complaint resolution
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-soft hover:shadow-medium transition-smooth">
              <Clock className="h-10 w-10 text-secondary mb-4" />
              <h3 className="font-semibold mb-2">Quick Response</h3>
              <p className="text-sm text-muted-foreground">
                Faster resolution with dedicated staff assignment
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-soft hover:shadow-medium transition-smooth">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Transparent</h3>
              <p className="text-sm text-muted-foreground">
                Complete visibility into issue management
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-soft hover:shadow-medium transition-smooth">
              <TrendingUp className="h-10 w-10 text-secondary mb-4" />
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Insights to improve processes continuously
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2024 Brototype. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
