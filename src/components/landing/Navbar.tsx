import { GraduationCap, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            ScholarHub
          </span>
        </Link>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Button variant="ghost" asChild>
              <Link to="/scholarships">Scholarships</Link>
            </Button>
          )}

          {isAuthenticated && (
            <Button variant="ghost" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          )}

          {isAdmin && (
            <Button variant="ghost" asChild>
              <Link to="/admin">
                <Shield className="mr-1 h-4 w-4" /> Admin
              </Link>
            </Button>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.full_name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1 h-4 w-4" /> Logout
              </Button>
            </div>
          ) : (
            <Button asChild>
              <Link to="/auth">Login</Link>
            </Button>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;