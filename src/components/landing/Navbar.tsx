import { useState, useEffect } from "react";
import { GraduationCap, LogOut, Shield, Bell, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { fetchUnreadCount } from "@/lib/api";

interface NavbarProps {
  showLanguageToggle?: boolean;
}

const Navbar = ({ showLanguageToggle = true }: NavbarProps) => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t, languages } = useI18n();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount().then((r) => setUnread(r.count)).catch(() => {});
    }
  }, [isAuthenticated]);

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
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/scholarships">{t("nav.scholarships")}</Link>
            </Button>
          )}

          {isAuthenticated && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">{t("nav.dashboard")}</Link>
            </Button>
          )}

          {isAdmin && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">
                <Shield className="mr-1 h-4 w-4" /> Admin
              </Link>
            </Button>
          )}

          {/* Language Toggle */}
          {showLanguageToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => setLang(language.code)}
                    className={lang === language.code ? "font-bold" : ""}
                  >
                    {language.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Notifications Bell */}
          {isAuthenticated && (
            <Button variant="ghost" size="icon" className="relative h-8 w-8" asChild>
              <Link to="/dashboard?tab=notifications">
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            </Button>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {!isAdmin && (
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link to="/profile">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.full_name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1 h-4 w-4" /> {t("nav.logout")}
              </Button>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">{t("nav.login")}</Link>
            </Button>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;