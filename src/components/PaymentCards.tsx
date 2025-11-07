import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wifi } from 'lucide-react';

export const PaymentCards = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
              💳
            </div>
            My Card
          </h3>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Orange Card */}
          <div className="relative h-48 rounded-2xl p-6 text-white overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #FF6B42 0%, #FF8E6D 100%)' }}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-white/80 text-xs mb-1">ABANDA HERMAN</p>
              </div>
              <Wifi className="w-6 h-6 rotate-90" />
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2 text-xl font-mono">
                <span>••••</span>
                <span>••••</span>
                <span>••••</span>
                <span>1234</span>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/70 text-[10px]">Exp Date</p>
                  <p className="text-sm font-mono">12/25</p>
                </div>
                <div>
                  <p className="text-white/70 text-[10px]">CVV</p>
                  <p className="text-sm font-mono">123</p>
                </div>
                <div className="text-2xl font-bold">VISA</div>
              </div>
            </div>
          </div>

          {/* Dark Card */}
          <div className="relative h-48 rounded-2xl p-6 text-white overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-white/80 text-xs mb-1">ABANDA HERMAN</p>
              </div>
              <Wifi className="w-6 h-6 rotate-90" />
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2 text-xl font-mono">
                <span>••••</span>
                <span>••••</span>
                <span>••••</span>
                <span>5678</span>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/70 text-[10px]">Exp Date</p>
                  <p className="text-sm font-mono">12/25</p>
                </div>
                <div>
                  <p className="text-white/70 text-[10px]">CVV</p>
                  <p className="text-sm font-mono">123</p>
                </div>
                <div className="text-2xl font-bold">VISA</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Top Up
          </Button>
          <Button variant="outline" className="rounded-xl gap-2">
            <span>↓</span>
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
