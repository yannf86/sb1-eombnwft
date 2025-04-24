import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { getHotelName, getParameterLabel, getUserName } from '@/lib/data';
import { 
  Building, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  User, 
  Image, 
  FileUp, 
  Clock, 
  Euro, 
  CalendarRange,
  Check,
  X,
  FileText,
  Edit,
  Trash2,
  History
} from 'lucide-react';
import { Maintenance } from './types/maintenance.types';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';
import { deleteMaintenanceRequest } from '@/lib/db/maintenance';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import MaintenanceEdit from './MaintenanceEdit';

interface MaintenanceDialogProps {
  maintenance: Maintenance | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedMaintenance: Maintenance) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const MaintenanceDialog: React.FC<MaintenanceDialogProps> = ({ 
  maintenance, 
  isOpen, 
  onClose,
  onUpdate,
  onEdit,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userNames, setUserNames] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  // Load user names for history entries
  useEffect(() => {
    if (!maintenance || !maintenance.history) return;

    const loadUserNames = async () => {
      const names: {[key: string]: string} = {};
      const userIds = new Set<string>();

      // Collect all user IDs from history entries
      maintenance.history.forEach((entry: any) => {
        if (entry.userId && !userNames[entry.userId]) {
          userIds.add(entry.userId);
        }
      });

      // Load names for all user IDs
      for (const userId of userIds) {
        names[userId] = await getUserName(userId);
      }

      setUserNames(prev => ({ ...prev, ...names }));
    };

    loadUserNames();
  }, [maintenance, userNames]);

  // Handle delete maintenance
  const handleDelete = async () => {
    if (!isAdmin) return;
    
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cette intervention ? Cette action est irréversible.');
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      await deleteMaintenanceRequest(maintenance!.id);
      toast({
        title: "Intervention supprimée",
        description: "L'intervention technique a été supprimée avec succès",
      });
      onDelete?.();
      onClose();
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'intervention",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!maintenance) return null;

  // Format history entries for display
  const formatHistoryEntry = (entry: any) => {
    const userName = userNames[entry.userId] || 'Utilisateur inconnu';
    const date = formatDate(new Date(entry.timestamp));
    const time = new Date(entry.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    let actionText = '';
    switch (entry.action) {
      case 'create':
        actionText = 'a créé l\'intervention';
        break;
      case 'update':
        actionText = 'a modifié l\'intervention';
        break;
      case 'delete':
        actionText = 'a supprimé l\'intervention';
        break;
      default:
        actionText = 'a effectué une action';
    }
    
    return (
      <div className="space-y-2 border-b pb-2 last:border-0">
        <div className="flex items-center text-sm">
          <User className="h-3.5 w-3.5 mr-1 text-slate-500" />
          <span className="font-medium">{userName}</span>
          <span className="mx-1">{actionText}</span>
          <Clock className="h-3.5 w-3.5 mx-1 text-slate-500" />
          <span className="text-muted-foreground">{date} à {time}</span>
        </div>
        
        {entry.action === 'update' && entry.changes && Object.keys(entry.changes).length > 0 && (
          <div className="text-xs space-y-1 ml-5">
            {Object.entries(entry.changes).map(([field, change]: [string, any], i) => {
              let fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);
              
              // Format specific fields
              switch (field) {
                case 'statusId':
                  fieldLabel = 'Statut';
                  break;
                case 'interventionTypeId':
                  fieldLabel = 'Type d\'intervention';
                  break;
                case 'hotelId':
                  fieldLabel = 'Hôtel';
                  break;
                case 'locationId':
                  fieldLabel = 'Lieu';
                  break;
                case 'receivedById':
                  fieldLabel = 'Reçu par';
                  break;
                case 'technicianId':
                  fieldLabel = 'Technicien';
                  break;
                case 'description':
                  fieldLabel = 'Description';
                  break;
                case 'comments':
                  fieldLabel = 'Commentaires';
                  break;
                case 'photoBefore':
                  fieldLabel = 'Photo avant';
                  break;
                case 'photoAfter':
                  fieldLabel = 'Photo après';
                  break;
                case 'quoteUrl':
                  fieldLabel = 'Devis';
                  break;
              }
              
              return (
                <div key={i} className="flex items-start">
                  <span className="font-medium mr-1">{fieldLabel}:</span>
                  <span className="text-red-500 line-through mr-1">
                    {typeof change.old === 'object' ? JSON.stringify(change.old) : 
                     change.old === null || change.old === undefined ? '(vide)' : change.old.toString()}
                  </span>
                  <span className="text-green-500">
                    {typeof change.new === 'object' ? JSON.stringify(change.new) : 
                     change.new === null || change.new === undefined ? '(vide)' : change.new.toString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // If in edit mode, show the edit form
  if (editMode) {
    return (
      <MaintenanceEdit 
        isOpen={isOpen}
        onClose={() => setEditMode(false)}
        maintenance={maintenance}
        onSave={(updatedMaintenance) => {
          if (onUpdate) onUpdate(updatedMaintenance);
          setEditMode(false);
        }}
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
            
            {/* Comments section */}
            {maintenance.comments && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Commentaires</p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-4">
                  <p className="whitespace-pre-wrap">{maintenance.comments}</p>
                </div>
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
          
          {/* Historique des modifications */}
          {maintenance.history && maintenance.history.length > 0 && (
            <div className="space-y-4 pt-2 border-t">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="history">
                  <AccordionTrigger className="flex items-center">
                    <div className="flex items-center">
                      <History className="h-5 w-5 mr-2 text-slate-500" />
                      <h3 className="text-lg font-medium">Historique</h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 mt-2">
                      {maintenance.history
                        .slice()
                        .reverse()
                        .map((entry: any, index: number) => (
                          <div key={index} className="text-sm">
                            {formatHistoryEntry(entry)}
                          </div>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>
        
        <DialogFooter className="space-x-2 pt-4 border-t">
          {isAdmin && (
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
              {isDeleting && '...'}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Fermer
          </Button>
          
          <Button 
            onClick={() => setEditMode(true)}
            className="flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceDialog;