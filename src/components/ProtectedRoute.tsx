import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  /** If true, also require the admin role */
  adminOnly?: boolean;
}

/**
 * Wraps a route – redirects to /auth when not logged in,
 * or to / when non-admin accesses an admin-only route.
 */
export default function ProtectedRoute({ children, adminOnly }: Props) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/scholarships" replace />;
  }

  return <>{children}</>;
}
