import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.replace('/login');
    }
  }, [user, router]);

  // While redirecting, render nothing
  if (!user || user.role !== 'ADMIN') return null;
  return <>{children}</>;
}
