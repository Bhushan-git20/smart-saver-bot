import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Plus } from 'lucide-react';

const contacts = [
  { name: 'Elina', avatar: '👩', color: 'bg-blue-100' },
  { name: 'David', avatar: '👨', color: 'bg-green-100' },
  { name: 'Jane', avatar: '👩', color: 'bg-purple-100' },
  { name: 'Ruby', avatar: '👨', color: 'bg-yellow-100' },
];

export const QuickTransfer = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <h3 className="font-semibold">Quick Transfer</h3>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Contacts */}
        <div className="flex gap-4 mb-6">
          <button className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:border-primary transition-colors">
              <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </div>
          </button>
          {contacts.map((contact) => (
            <button key={contact.name} className="flex flex-col items-center gap-2 group">
              <Avatar className="w-14 h-14 ring-2 ring-transparent group-hover:ring-primary transition-all">
                <AvatarFallback className={contact.color}>
                  {contact.avatar}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{contact.name}</span>
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div className="space-y-2 mb-4">
          <label className="text-sm text-muted-foreground">Enter Amount</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold">$</span>
              <Input 
                type="text" 
                value="15,890.00"
                className="text-xl font-bold pl-10 h-12"
              />
            </div>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 5h18M3 10h18M3 15h18M3 20h18" strokeWidth="2" strokeLinecap="round"/>
                <rect x="12" y="7" width="5" height="3" fill="currentColor"/>
              </svg>
            </Button>
          </div>
        </div>

        {/* Send Button */}
        <Button className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl text-base font-semibold">
          Send Money
        </Button>
      </CardContent>
    </Card>
  );
};
