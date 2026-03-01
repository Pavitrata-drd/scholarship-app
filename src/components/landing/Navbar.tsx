import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
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
          <Button variant="ghost" asChild>
            <Link to="/scholarships">Scholarships</Link>
          </Button>

          <Button variant="ghost" asChild>
            <Link to="/admin">Admin</Link>
          </Button>

          <Button asChild>
            <Link to="/auth">Login</Link>
          </Button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;