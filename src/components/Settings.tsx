import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/ThemeProvider';
import { Globe, Palette, Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const generateMonthlyReport = async () => {
    if (!user) return;

    setIsGeneratingReport(true);
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      const { data, error } = await supabase.functions.invoke('monthly-report', {
        body: {
          userId: user.id,
          email: user.email,
          month: currentMonth
        }
      });

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: 'Monthly report generated successfully!',
      });

      // In a real implementation, you'd send this via email
      // For demo purposes, we'll show the data
      console.log('Monthly Report Data:', data);
      
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to generate monthly report',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t('settings.language')}
          </CardTitle>
          <CardDescription>
            Choose your preferred language for the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Application Language</Label>
            <Select value={i18n.language} onValueChange={changeLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              More languages will be added in future updates
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            {t('settings.theme')}
          </CardTitle>
          <CardDescription>
            Customize the appearance of the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Color Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System (Auto)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              System mode automatically adapts to your device's preference
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Monthly Reports
          </CardTitle>
          <CardDescription>
            Generate and access your monthly financial summaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Monthly reports include:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Income vs expenses summary</li>
                <li>• Category-wise expense breakdown</li>
                <li>• Budget goal performance</li>
                <li>• Investment portfolio updates</li>
                <li>• Financial insights and recommendations</li>
              </ul>
            </div>
            
            <Button 
              onClick={generateMonthlyReport} 
              disabled={isGeneratingReport}
              className="w-full"
            >
              {isGeneratingReport ? (
                <>
                  <Download className="w-4 h-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate This Month's Report
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              * In production, reports would be automatically emailed to you monthly
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};