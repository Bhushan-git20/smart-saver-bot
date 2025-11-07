import { Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const DashboardGreeting = () => {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.first_name || 'Abanda';

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 className="text-3xl font-bold mb-1">
          Good Morning, {firstName} 👋
        </h2>
        <p className="text-muted-foreground">
          Track your sales and performance of your strategy.
        </p>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search something..." 
            className="pl-10 w-full md:w-80 bg-muted/50"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘F
          </kbd>
        </div>
        <Button className="bg-secondary hover:bg-secondary/90 rounded-full gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>
    </div>
  );
};
