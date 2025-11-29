import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'creator' | 'manager' | 'admin' | 'chat_team' | 'studio_team' | 'marketing_team';

export const useRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching roles:', error);
        setRoles([]);
      } else {
        setRoles(data.map((r: any) => r.role as AppRole));
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: AppRole) => roles.includes(role);
  
  const isStaff = () => {
    return roles.some(r => ['manager', 'admin', 'chat_team', 'studio_team', 'marketing_team'].includes(r));
  };

  const isCreator = () => hasRole('creator');

  return { roles, hasRole, isStaff, isCreator, loading };
};
