import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Newspaper } from 'lucide-react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MutualFund {
  name: string;
  nav: number;
  change: number;
  category: string;
}

interface FDRate {
  bank: string;
  tenure: string;
  rate: number;
  minAmount: number;
}

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
}

// Mock data - will be replaced with real API calls
const mockStocks: StockData[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2450.50, change: 25.30, changePercent: 1.04 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3720.80, change: -15.20, changePercent: -0.41 },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1650.25, change: 12.75, changePercent: 0.78 },
  { symbol: 'HDFC', name: 'HDFC Bank', price: 1580.90, change: 8.40, changePercent: 0.53 },
];

const mockMutualFunds: MutualFund[] = [
  { name: 'SBI Bluechip Fund', nav: 65.42, change: 0.85, category: 'Large Cap' },
  { name: 'HDFC Mid-Cap Fund', nav: 98.35, change: -1.20, category: 'Mid Cap' },
  { name: 'ICICI Prudential Technology Fund', nav: 145.60, change: 2.15, category: 'Sectoral' },
  { name: 'Axis Liquid Fund', nav: 2156.78, change: 0.05, category: 'Liquid' },
];

const mockFDRates: FDRate[] = [
  { bank: 'SBI', tenure: '1 Year', rate: 6.8, minAmount: 1000 },
  { bank: 'HDFC Bank', tenure: '2 Years', rate: 7.1, minAmount: 5000 },
  { bank: 'ICICI Bank', tenure: '3 Years', rate: 7.25, minAmount: 10000 },
  { bank: 'Axis Bank', tenure: '5 Years', rate: 7.5, minAmount: 25000 },
];

const mockNews: NewsItem[] = [
  {
    title: 'RBI keeps repo rate unchanged at 6.5%',
    summary: 'The Reserve Bank of India maintains the key policy rate amid inflation concerns.',
    source: 'Economic Times',
    publishedAt: '2024-01-15T10:30:00Z'
  },
  {
    title: 'Indian stock markets reach new highs',
    summary: 'Sensex and Nifty continue their upward trajectory on positive sentiment.',
    source: 'Business Standard',
    publishedAt: '2024-01-15T09:15:00Z'
  },
];

export const InvestmentModule = () => {
  const [recommendedPortfolio, setRecommendedPortfolio] = useState<{
    riskProfile: string;
    allocation: { type: string; percentage: number; amount: number }[];
  } | null>(null);

  const investmentAmount = 50000; // Default amount for recommendations

  const generateRecommendations = (riskProfile: 'low' | 'medium' | 'high') => {
    let allocation;
    
    switch (riskProfile) {
      case 'low':
        allocation = [
          { type: 'Fixed Deposits', percentage: 60, amount: investmentAmount * 0.6 },
          { type: 'Liquid Funds', percentage: 30, amount: investmentAmount * 0.3 },
          { type: 'Savings Account', percentage: 10, amount: investmentAmount * 0.1 },
        ];
        break;
      case 'medium':
        allocation = [
          { type: 'SIP (Mutual Funds)', percentage: 50, amount: investmentAmount * 0.5 },
          { type: 'Fixed Deposits', percentage: 30, amount: investmentAmount * 0.3 },
          { type: 'Equity Funds', percentage: 20, amount: investmentAmount * 0.2 },
        ];
        break;
      case 'high':
        allocation = [
          { type: 'Equity/Stocks', percentage: 60, amount: investmentAmount * 0.6 },
          { type: 'SIP (Mutual Funds)', percentage: 30, amount: investmentAmount * 0.3 },
          { type: 'Fixed Deposits', percentage: 10, amount: investmentAmount * 0.1 },
        ];
        break;
    }

    setRecommendedPortfolio({ riskProfile, allocation });
  };

  return (
    <div className="space-y-6">
      {/* Investment Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Recommendations</CardTitle>
          <CardDescription>
            Get personalized investment suggestions based on your risk profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button onClick={() => generateRecommendations('low')} variant="outline">
              Low Risk
            </Button>
            <Button onClick={() => generateRecommendations('medium')} variant="outline">
              Medium Risk
            </Button>
            <Button onClick={() => generateRecommendations('high')} variant="outline">
              High Risk
            </Button>
          </div>

          {recommendedPortfolio && (
            <div className="space-y-4">
              <h3 className="font-semibold">
                Recommended Portfolio for {recommendedPortfolio.riskProfile} risk profile (₹{investmentAmount.toLocaleString()})
              </h3>
              <div className="grid gap-3">
                {recommendedPortfolio.allocation.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="font-medium">{item.type}</span>
                    <div className="text-right">
                      <div className="font-semibold">₹{item.amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Data Tabs */}
      <Tabs defaultValue="stocks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="mutual-funds">Mutual Funds</TabsTrigger>
          <TabsTrigger value="fd-rates">FD Rates</TabsTrigger>
          <TabsTrigger value="news">Financial News</TabsTrigger>
        </TabsList>

        <TabsContent value="stocks">
          <Card>
            <CardHeader>
              <CardTitle>Stock Market</CardTitle>
              <CardDescription>Live stock prices and market data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockStocks.map((stock) => (
                  <div key={stock.symbol} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{stock.price}</div>
                      <div className={`text-sm flex items-center ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {stock.change > 0 ? '+' : ''}{stock.change} ({stock.changePercent}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mutual-funds">
          <Card>
            <CardHeader>
              <CardTitle>Mutual Funds</CardTitle>
              <CardDescription>Latest NAV and fund performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMutualFunds.map((fund, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{fund.name}</div>
                      <Badge variant="secondary" className="text-xs mt-1">{fund.category}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{fund.nav}</div>
                      <div className={`text-sm ${fund.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {fund.change > 0 ? '+' : ''}{fund.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fd-rates">
          <Card>
            <CardHeader>
              <CardTitle>Fixed Deposit Rates</CardTitle>
              <CardDescription>Current FD interest rates from major banks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockFDRates.map((fd, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{fd.bank}</div>
                      <div className="text-sm text-muted-foreground">
                        {fd.tenure} • Min: ₹{fd.minAmount.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">{fd.rate}%</div>
                      <div className="text-sm text-muted-foreground">per annum</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news">
          <Card>
            <CardHeader>
              <CardTitle>Financial News</CardTitle>
              <CardDescription>Latest financial and market news</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockNews.map((news, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{news.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{news.summary}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{news.source}</span>
                      <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};