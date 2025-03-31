import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building as Buildings, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login, isAuthenticated } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);
  
  // Handle login form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Demo login credentials
    if (email === '') {
      toast({
        title: "Champ requis",
        description: "Veuillez entrer une adresse e-mail",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    // Perform login
    const result = login(email, password);
    
    if (result.success) {
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${result.user?.name}`,
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Erreur de connexion",
        description: result.message || "Identifiants incorrects",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };
  
  // Fill in demo credentials
  const useDemoCredentials = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setEmail('admin@test.com');
      setPassword('password');
    } else {
      setEmail('user@test.com');
      setPassword('password');
    }
  };
  
  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Buildings className="h-12 w-12 text-brand-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-brand-600">Creho</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à votre espace de gestion
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Adresse e-mail</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
            <div className="flex flex-col space-y-2 w-full">
              <p className="text-sm text-center text-charcoal-500 dark:text-cream-400">
                Comptes de démonstration
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => useDemoCredentials('admin')}
                  className="text-xs"
                >
                  <Lock className="h-3.5 w-3.5 mr-1" />
                  Compte Admin
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => useDemoCredentials('user')}
                  className="text-xs"
                >
                  <Lock className="h-3.5 w-3.5 mr-1" />
                  Compte Standard
                </Button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;