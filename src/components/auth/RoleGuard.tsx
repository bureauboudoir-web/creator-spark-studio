import { ReactNode } from 'react';
import { useRole, AppRole } from '@/hooks/useRole';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
  staffOnly?: boolean;
  fallback?: ReactNode;
}

export const RoleGuard = ({ children, allowedRoles, staffOnly, fallback = null }: RoleGuardProps) => {
  const { roles, isStaff, loading } = useRole();

  if (loading) {
    return null;
  }

  if (staffOnly && !isStaff()) {
    return <>{fallback}</>;
  }

  if (allowedRoles && !allowedRoles.some(role => roles.includes(role))) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
