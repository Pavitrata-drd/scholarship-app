import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-card py-12">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">ScholarHub</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/scholarships" className="hover:text-foreground transition-colors">Scholarships</Link>
            <Link to="/auth" className="hover:text-foreground transition-colors">Login</Link>
            <span>Privacy Policy</span>
            <span>Terms</span>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ScholarHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
