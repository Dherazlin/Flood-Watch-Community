import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, MapPin, AlertTriangle, Users, BarChart3, Shield } from 'lucide-react';
import FloodMap from '@/components/FloodMap';
import AuthDialog from '@/components/AuthDialog';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    activeReports: 0,
    resolvedReports: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and get user info
      fetch('http://localhost:8080/api/auth/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (!res.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          const userData = localStorage.getItem('user');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
    }

    // Fetch stats
    fetch('http://localhost:8080/api/reports/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch stats:', err));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthOpen(false);
    toast({
      title: "Login Successful",
      description: `Welcome back, ${userData.fullName}!`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Droplets className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">FloodWatch</h1>
            <Badge variant="secondary">Community</Badge>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.fullName}
                </span>
                {user.role === 'ADMIN' && (
                  <Badge variant="outline">
                    <Shield className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                )}
                <Link to="/dashboard">
                  <Button variant="secondary">My Dashboard</Button>
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin">
                    <Button variant="default">Admin</Button>
                  </Link>
                )}
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsAuthOpen(true)}>
                Login / Register
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground">
            Real-Time Flood Reporting Platform
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Help your community stay safe during floods. Report waterlogged areas, 
            view real-time flood data, and plan safer routes with our community-driven platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Card className="p-6 text-center">
              <BarChart3 className="mx-auto mb-2 h-8 w-8 text-primary" />
              <div className="text-2xl font-bold text-foreground">{stats.totalReports}</div>
              <div className="text-sm text-muted-foreground">Total Reports</div>
            </Card>
            <Card className="p-6 text-center">
              <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-destructive" />
              <div className="text-2xl font-bold text-foreground">{stats.activeReports}</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </Card>
            <Card className="p-6 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-primary" />
              <div className="text-2xl font-bold text-foreground">{stats.resolvedReports}</div>
              <div className="text-sm text-muted-foreground">Resolved Issues</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-foreground">Live Flood Map</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Click on map to report flooding</span>
            </div>
          </div>
          <Card className="overflow-hidden">
            <FloodMap user={user} onAuthRequired={() => setIsAuthOpen(true)} />
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h3 className="mb-8 text-center text-2xl font-bold text-foreground">
            How It Works
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-6 text-center">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h4 className="mb-2 text-lg font-semibold text-foreground">Report</h4>
              <p className="text-muted-foreground">
                Click on the map to report waterlogged areas with photos and descriptions.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Droplets className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h4 className="mb-2 text-lg font-semibold text-foreground">Verify</h4>
              <p className="text-muted-foreground">
                Community and authorities verify reports to ensure accurate information.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h4 className="mb-2 text-lg font-semibold text-foreground">Navigate</h4>
              <p className="text-muted-foreground">
                Use real-time data to plan safer routes and avoid flooded areas.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Auth Dialog */}
      <AuthDialog 
        open={isAuthOpen} 
        onOpenChange={setIsAuthOpen}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Index;
