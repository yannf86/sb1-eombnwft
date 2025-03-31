import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Trophy, RefreshCw, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GamificationTab = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres de Gamification</CardTitle>
        <CardDescription>
          Configurer le système de points, badges et récompenses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-md p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-200">Configuration avancée</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Le module de configuration de gamification est disponible dans une section dédiée pour une gestion plus précise des paramètres.
              </p>
            </div>
          </div>
        </div>
        
        <Button size="lg" onClick={() => navigate('/settings/gamification-config')}>
          <Trophy className="mr-2 h-5 w-5" />
          Accéder à la configuration de la gamification
        </Button>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="xp-rate">Taux d'XP global</Label>
            <div className="flex items-center space-x-2">
              <Input id="xp-rate" type="number" defaultValue="1" min="0.1" max="5.0" step="0.1" />
              <span className="text-sm text-muted-foreground">×</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Multiplicateur appliqué à tous les gains d'XP
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Système de gamification</Label>
            <div className="flex items-center space-x-2">
              <Switch id="gamification-active" defaultChecked />
              <Label htmlFor="gamification-active">Activer la gamification</Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Réinitialiser les données
        </Button>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GamificationTab;