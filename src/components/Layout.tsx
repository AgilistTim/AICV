import { useAuth } from '@/context/AuthContext';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Don't show header on login/register pages
  const hideHeader = ['/login', '/register'].includes(location.pathname);

  if (hideHeader) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6" />
              <span className="font-bold">Interactive CV</span>
            </Link>
            {user && (
              <nav className="flex space-x-4">
                <Link
                  to="/candidate"
                  className={location.pathname === '/candidate' ? 'text-primary' : 'text-muted-foreground'}
                >
                  Candidate
                </Link>
                <Link
                  to="/recruiter"
                  className={location.pathname === '/recruiter' ? 'text-primary' : 'text-muted-foreground'}
                >
                  Recruiter
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            {user && (
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="container py-6 md:py-8 lg:py-10">{children}</main>
    </div>
  );
}