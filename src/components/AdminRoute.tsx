import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';

export const AdminRoute = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) throw error;
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Erro ao verificar role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdmin();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
