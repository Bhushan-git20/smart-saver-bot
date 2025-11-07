import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Bell, RefreshCw } from 'lucide-react';

export const FinancialPerformance = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <h3 className="font-semibold">Financial Performance</h3>
        <Button variant="ghost" size="icon">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Achievement */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-muted-foreground">68% Target Achieved</span>
            <span className="text-sm font-semibold">$15,890.00</span>
          </div>
          <Progress value={68} className="h-2" />
        </div>

        {/* Total Revenue */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Total Revenue</h4>
            <Button variant="ghost" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold">$23,779.58</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-destructive">
              53.4% (21,351.04)
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>

          {/* Team Avatars */}
          <div className="flex -space-x-2 mt-4">
            <Avatar className="w-8 h-8 border-2 border-background">
              <AvatarFallback className="bg-blue-500 text-white">A</AvatarFallback>
            </Avatar>
            <Avatar className="w-8 h-8 border-2 border-background">
              <AvatarFallback className="bg-green-500 text-white">B</AvatarFallback>
            </Avatar>
            <Avatar className="w-8 h-8 border-2 border-background bg-secondary text-secondary-foreground">
              <AvatarFallback>+5</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* View All Report Button */}
        <Button 
          variant="ghost" 
          className="w-full justify-between hover:bg-primary/5 group"
        >
          <span>View All Report</span>
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
            →
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};
