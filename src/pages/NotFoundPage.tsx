import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-app p-4 text-center">
      <p className="text-8xl font-bold text-primary-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-app">Page Not Found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/dashboard">
          <Button><Home className="h-4 w-4" />Back to Dashboard</Button>
        </Link>
        <Link to="/tasks">
          <Button variant="outline"><Search className="h-4 w-4" />Browse Tasks</Button>
        </Link>
      </div>
    </div>
  );
}
