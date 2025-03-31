import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { getHotelName, getParameterLabel, getUserName } from '@/lib/data';
import { 
  Building, 
  MapPin, 
  User, 
  Image, 
  FileUp, 
  Clock, 
  Euro, 
  CalendarRange,
  Check,
  X,
  FileText
} from 'lucide-react';
import { Maintenance } from './types/maintenance.types';
import MaintenanceEdit from './MaintenanceEdit';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceDialogProps {
  maintenance: Maintenance | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedMaintenance: Maintenance) => void;
}

const MaintenanceDialog: React.FC<MaintenanceDialogProps> = ({ 
  maintenance, 
  isOpen, 
  onClose,
  onUpdate 
}) => {
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  if (!maintenance) return null;

  // Handle save changes
  const handleSave = (updatedMaintenance: Maintenance) => {
    // Here you would normally send the updated data to your backend
    toast({
      title: "Intervention mise à jour",
      description: "Les modifications ont été enregistrées avec succès",
    });
    
    // Call onUpdate if provided
    if (onUpdate) {
      onUpdate(updatedMaintenance);
    }
    
    setEditMode(false);
  };

  if (editMode) {
    return (
      <MaintenanceEdit 
        isOpen={isOpen}
        onClose={() => setEditMode(false)}
        maintenance={maintenance}
        onSave={handleSave}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de l'intervention</DialogTitle>
          <DialogDescription>
            Consultation des informations de l'intervention technique
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic maintenance information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">ID de l'intervention</p>
              <p className="font-medium">{maintenance.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Statut</p>
              <div>
                <span className={
                  maintenance.statusId === 'stat1' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-50 text-yellow-600 border-yellow-300" :
                  maintenance.statusId === 'stat2' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 border-blue-300" :
                  maintenance.statusId === 'stat3' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-600 border-green-300" :
                  maintenance.statusId === 'stat4' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-gray-50 text-gray-600 border-gray-300" :
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-600 border-red-300"
                }>
                  {getParameterLabel(maintenance.statusId)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Date de l'intervention</p>
                <div className="flex items-center">
                  <CalendarRange className="h-4 w-4 mr-1 text-muted-foreground" />
                  <p className="font-medium">{formatDate(maintenance.date)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Heure</p>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <p className="font-medium">{maintenance.time}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Hôtel</p>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                  <p className="font-medium">{getHotelName(maintenance.hotelId)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Lieu</p>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                  <p className="font-medium">{getParameterLabel(maintenance.locationId)}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Type d'intervention</p>
              <p className="font-medium">{getParameterLabel(maintenance.interventionTypeId)}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-4">
                <p className="font-medium whitespace-pre-wrap">{maintenance.description}</p>
              </div>
            </div>
          </div>
          
          {/* Photos */}
          {(maintenance.photoBefore || maintenance.photoAfter) && (
            <div className="space-y-4 pt-2 border-t">
              <h3 className="text-lg font-medium flex items-center">
                <Image className="h-5 w-5 mr-2 text-slate-500" />
                Photos
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {maintenance.photoBefore && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Avant</p>
                    <div className="h-40 w-full border rounded bg-slate-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={maintenance.photoBefore} 
                        alt="Photo avant" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
                {maintenance.photoAfter && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Après</p>
                    <div className="h-40 w-full border rounded bg-slate-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={maintenance.photoAfter} 
                        alt="Photo après" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Quotes and financial information */}
          {(maintenance.quoteUrl || maintenance.estimatedAmount || maintenance.finalAmount) && (
            <div className="space-y-4 pt-2 border-t">
              <h3 className="text-lg font-medium flex items-center">
                <Euro className="h-5 w-5 mr-2 text-slate-500" />
                Informations financières
              </h3>
              
              {maintenance.quoteUrl && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Devis</h4>
                      <p className="text-sm text-amber-800">
                        Un devis a été fourni pour cette intervention
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Voir le devis
                    </Button>
                  </div>
                  
                  {maintenance.quoteAmount && (
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-amber-800">Montant du devis:</p>
                      <p className="text-sm font-bold text-amber-800">{maintenance.quoteAmount} €</p>
                    </div>
                  )}
                  
                  {maintenance.quoteAccepted !== undefined && (
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-amber-800">Statut:</p>
                      <div className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                        maintenance.quoteAccepted 
                          ? "bg-green-50 text-green-600 border-green-200" 
                          : "bg-red-50 text-red-600 border-red-200"
                      }`}>
                        {maintenance.quoteAccepted 
                          ? <><Check className="h-3 w-3 mr-1" /> Devis accepté</> 
                          : <><X className="h-3 w-3 mr-1" /> Devis refusé</>}
                      </div>
                    </div>
                  )}
                  
                  {maintenance.quoteAccepted && maintenance.quoteAcceptedDate && (
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-amber-800">Date d'acceptation:</p>
                      <p className="text-sm text-amber-800">{formatDate(maintenance.quoteAcceptedDate)}</p>
                    </div>
                  )}
                  
                  {maintenance.quoteAccepted && maintenance.quoteAcceptedById && (
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-amber-800">Accepté par:</p>
                      <p className="text-sm text-amber-800">{getUserName(maintenance.quoteAcceptedById)}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {maintenance.estimatedAmount && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Montant estimé</p>
                    <p className="font-medium">{maintenance.estimatedAmount} €</p>
                  </div>
                )}
                {maintenance.finalAmount && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Montant final</p>
                    <p className="font-medium">{maintenance.finalAmount} €</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Assignation and timeline */}
          <div className="space-y-4 pt-2 border-t">
            <h3 className="text-lg font-medium flex items-center">
              <Clock className="h-5 w-5 mr-2 text-slate-500" />
              Suivi et assignation
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Reçu par</p>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1 text-slate-400" />
                  <p className="font-medium">{getUserName(maintenance.receivedById)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Technicien</p>
                <p className="font-medium">
                  {maintenance.technicianId 
                    ? <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-slate-400" />
                        <span>{getUserName(maintenance.technicianId)}</span>
                      </div>
                    : "Non assigné"}
                </p>
              </div>
            </div>
            
            {(maintenance.startDate || maintenance.endDate) && (
              <div className="grid grid-cols-2 gap-4">
                {maintenance.startDate && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Date de début</p>
                    <div className="flex items-center">
                      <CalendarRange className="h-4 w-4 mr-1 text-slate-400" />
                      <p className="font-medium">{formatDate(maintenance.startDate)}</p>
                    </div>
                  </div>
                )}
                {maintenance.endDate && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Date de fin</p>
                    <div className="flex items-center">
                      <CalendarRange className="h-4 w-4 mr-1 text-slate-400" />
                      <p className="font-medium">{formatDate(maintenance.endDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Metadata */}
          <div className="space-y-4 pt-2 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Créé le</p>
                <p className="font-medium">{formatDate(maintenance.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Dernière mise à jour</p>
                <p className="font-medium">{formatDate(maintenance.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={() => setEditMode(true)}>
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceDialog;