import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'mutual_fund' | 'fd' | 'bond';
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  current_price: number;
  last_updated: string;
}

interface PortfolioSummary {
  totalInvestment: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
}

export const PortfolioTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    type: 'stock' as 'stock' | 'mutual_fund' | 'fd' | 'bond',
    quantity: '',
    purchase_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    current_price: ''
  });

  useEffect(() => {
    if (user) {
      fetchHoldings();
    }
  }, [user]);

  const fetchHoldings = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHoldings((data || []) as PortfolioHolding[]);
    } catch (error) {
      console.error('Error fetching portfolio holdings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch portfolio holdings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      const holdingData = {
        user_id: user.id,
        symbol: formData.symbol.toUpperCase(),
        name: formData.name,
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        purchase_price: parseFloat(formData.purchase_price),
        purchase_date: formData.purchase_date,
        current_price: parseFloat(formData.current_price || formData.purchase_price),
        last_updated: new Date().toISOString()
      };

      const { error } = await supabase
        .from('portfolio_holdings')
        .insert([holdingData]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Investment added to portfolio",
      });

      setDialogOpen(false);
      resetForm();
      fetchHoldings();
    } catch (error) {
      console.error('Error saving portfolio holding:', error);
      toast({
        title: "Error",
        description: "Failed to add investment",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      symbol: '',
      name: '',
      type: 'stock',
      quantity: '',
      purchase_price: '',
      purchase_date: new Date().toISOString().split('T')[0],
      current_price: ''
    });
  };

  const calculateHoldingValue = (holding: PortfolioHolding) => {
    return {
      investment: holding.quantity * holding.purchase_price,
      currentValue: holding.quantity * holding.current_price,
      return: holding.quantity * (holding.current_price - holding.purchase_price),
      returnPercentage: ((holding.current_price - holding.purchase_price) / holding.purchase_price) * 100
    };
  };

  const calculatePortfolioSummary = (): PortfolioSummary => {
    const summary = holdings.reduce(
      (acc, holding) => {
        const holdingCalc = calculateHoldingValue(holding);
        acc.totalInvestment += holdingCalc.investment;
        acc.currentValue += holdingCalc.currentValue;
        acc.totalReturn += holdingCalc.return;
        return acc;
      },
      { totalInvestment: 0, currentValue: 0, totalReturn: 0, returnPercentage: 0, dayChange: 0, dayChangePercentage: 0 }
    );

    summary.returnPercentage = summary.totalInvestment > 0 
      ? (summary.totalReturn / summary.totalInvestment) * 100 
      : 0;
    
    // Mock day change for demo (in real app, this would come from API)
    summary.dayChange = summary.currentValue * 0.002; // 0.2% daily change
    summary.dayChangePercentage = 0.2;

    return summary;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stock':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'mutual_fund':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'fd':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'bond':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const summary = calculatePortfolioSummary();

  if (loading) {
    return <div className="text-center">Loading portfolio...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold">₹{summary.totalInvestment.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-2xl font-bold">₹{summary.currentValue.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Return</p>
                <p className={`text-2xl font-bold ${summary.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.totalReturn >= 0 ? '+' : ''}₹{summary.totalReturn.toLocaleString()}
                </p>
                <p className={`text-sm ${summary.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.returnPercentage >= 0 ? '+' : ''}{summary.returnPercentage.toFixed(2)}%
                </p>
              </div>
              {summary.totalReturn >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Day Change</p>
                <p className={`text-2xl font-bold ${summary.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.dayChange >= 0 ? '+' : ''}₹{summary.dayChange.toLocaleString()}
                </p>
                <p className={`text-sm ${summary.dayChangePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.dayChangePercentage >= 0 ? '+' : ''}{summary.dayChangePercentage.toFixed(2)}%
                </p>
              </div>
              {summary.dayChange >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Portfolio Holdings</CardTitle>
              <CardDescription>
                Track your investments and their performance
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Investment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Investment</DialogTitle>
                  <DialogDescription>
                    Add a new investment to your portfolio
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="symbol">Symbol/Code</Label>
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      placeholder="e.g., RELIANCE, TCS, etc."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Reliance Industries Ltd"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                        <SelectItem value="fd">Fixed Deposit</SelectItem>
                        <SelectItem value="bond">Bond</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="0"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="purchase_price">Purchase Price (₹)</Label>
                      <Input
                        id="purchase_price"
                        type="number"
                        step="0.01"
                        value={formData.purchase_price}
                        onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="purchase_date">Purchase Date</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="current_price">Current Price (₹)</Label>
                    <Input
                      id="current_price"
                      type="number"
                      step="0.01"
                      value={formData.current_price}
                      onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                      placeholder="Leave empty to use purchase price"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Add Investment
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {holdings.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No investments in your portfolio yet.
            </p>
          ) : (
            <div className="space-y-4">
              {holdings.map((holding) => {
                const calc = calculateHoldingValue(holding);
                
                return (
                  <div
                    key={holding.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{holding.symbol}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(holding.type)}`}>
                          {holding.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{holding.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {holding.quantity} units • Avg: ₹{holding.purchase_price.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold">₹{calc.currentValue.toLocaleString()}</p>
                      <p className={`text-sm ${calc.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {calc.return >= 0 ? '+' : ''}₹{calc.return.toLocaleString()}
                      </p>
                      <p className={`text-xs ${calc.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {calc.returnPercentage >= 0 ? '+' : ''}{calc.returnPercentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};