import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'Fast & Offline',
      description: 'Works offline and loads instantly'
    },
    {
      icon: Smartphone,
      title: 'Home Screen Access',
      description: 'Add to your home screen like a native app'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data stays secure on your device'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">Install AI Financial Advisor</CardTitle>
          <CardDescription className="text-lg">
            Get the best experience with our installable app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="flex justify-center">
                  <feature.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {isInstallable ? (
            <Button onClick={handleInstall} size="lg" className="w-full">
              <Download className="mr-2 h-5 w-5" />
              Install App
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-semibold mb-2">How to install on your device:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>iPhone/iPad:</strong> Tap Share → Add to Home Screen</li>
                  <li>• <strong>Android:</strong> Tap Menu (⋮) → Add to Home Screen</li>
                  <li>• <strong>Desktop:</strong> Look for the install icon in your browser's address bar</li>
                </ul>
              </div>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
