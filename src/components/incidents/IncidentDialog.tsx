import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { getHotelName, getParameterLabel, getUserName } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import { deleteIncident, updateIncident } from '@/lib/db/incidents';
import { useToast } from '@/hooks/use-toast';
import { 
  Building, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Euro, 
  Tag, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  FileText,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parameters } from '@/lib/data';
import IncidentEdit from './IncidentEdit';

interface IncidentDialogProps {
  incident: any;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onUpdate?: () => void;
}

const IncidentDialog: React.FC<IncidentDialogProps> = ({ 
  incident, 
  isOpen, 
  onClose,
  onDelete,
  onUpdate
}) => {
  const [editMode, setEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  // Get status parameters
  const statusParams = parameters.filter(p => p.type === 'status');

  if (!incident) return null;

  // Handle delete incident
  const handleDelete = async () => {
    if (!isAdmin) return;
    
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cet incident ? Cette action est irréversible.');
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      await deleteIncident(incident.id);
      toast({
        title: "Incident supprimé",
        description: "L'incident a été supprimé avec succès",
      });
      onDelete?.();
      onClose();
    } catch (error) {
      console.error('Error deleting incident:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'incident",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatusId: string) => {
    try {
      setIsUpdating(true);
      
      // Update incident in Firebase
      await updateIncident(incident.id, {
        ...incident,
        statusId: newStatusId,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Statut mis à jour",
        description: "Le statut de l'incident a été mis à jour avec succès",
      });

      // Notify parent component to refresh the list
      onUpdate?.();
    } catch (error) {
      console.error('Error updating incident status:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du statut",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle save changes
  const handleSave = async (updatedIncident: any) => {
    setIsUpdating(true);
    try {
      // Update incident in Firebase
      await updateIncident(incident.id, {
        ...updatedIncident,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Incident mis à jour",
        description: "Les modifications ont été enregistrées avec succès",
      });

      // Notify parent component to refresh the list
      onUpdate?.();
      
      setEditMode(false);
    } catch (error) {
      console.error('Error updating incident:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'incident",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (editMode) {
    return (
      <IncidentEdit 
        isOpen={isOpen}
        onClose={() => setEditMode(false)}
        incident={incident}
        onSave={handleSave}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de l'incident</DialogTitle>
          <DialogDescription>
            Consultation des informations de l'incident
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic incident information */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold flex items-center">
                <Building className="h-5 w-5 mr-2" />
                {getHotelName(incident.hotelId)}
              </h2>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {formatDate(incident.date)} à {incident.time}
              </div>
            </div>
            <div>
              <Select 
                value={incident.statusId} 
                onValueChange={handleStatusChange}
                disabled={isUpdating}
              >
                <SelectTrigger className={
                  incident.statusId === 'stat1' ? "bg-yellow-50 text-yellow-600 border-yellow-300" :
                  incident.statusId === 'stat2' ? "bg-blue-50 text-blue-600 border-blue-300" :
                  incident.statusId === 'stat3' ? "bg-green-50 text-green-600 border-green-300" :
                  incident.statusId === 'stat4' ? "bg-gray-50 text-gray-600 border-gray-300" :
                  "bg-red-50 text-red-600 border-red-300"
                }>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusParams.map(status => (
                    <SelectItem 
                      key={status.id} 
                      value={status.id}
                      className={
                        status.id === 'stat1' ? "text-yellow-600" :
                        status.id === 'stat2' ? "text-blue-600" :
                        status.id === 'stat3' ? "text-green-600" :
                        status.id === 'stat4' ? "text-gray-600" :
                        "text-red-600"
                      }
                    >
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Location and Category */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Lieu</p>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-slate-500" />
                <p className="font-medium">{getParameterLabel(incident.locationId)}</p>
              </div>
              {incident.roomType && (
                <p className="text-sm text-muted-foreground mt-1">
                  Type: {getParameterLabel(incident.roomType)}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Catégorie & Impact</p>
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-1 text-slate-500" />
                <p className="font-medium">{getParameterLabel(incident.categoryId)}</p>
              </div>
              <div className="flex items-center mt-1">
                <AlertTriangle className={`h-4 w-4 mr-1 ${
                  incident.impactId === 'imp4' ? "text-red-500" :
                  incident.impactId === 'imp3' ? "text-amber-500" :
                  incident.impactId === 'imp2' ? "text-blue-500" :
                  "text-green-500"
                }`} />
                <p className={
                  incident.impactId === 'imp4' ? "font-medium text-red-500" :
                  incident.impactId === 'imp3' ? "font-medium text-amber-500" :
                  incident.impactId === 'imp2' ? "font-medium text-blue-500" :
                  "font-medium text-green-500"
                }>
                  {getParameterLabel(incident.impactId)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-4 pt-2 border-t">
            <div className="space-y-2">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-slate-500" />
                <h3 className="text-lg font-medium">Description</h3>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-4">
                <p className="font-medium whitespace-pre-wrap">{incident.description}</p>
              </div>
            </div>

            {incident.resolutionDescription && (
              <div className="space-y-2">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-slate-500" />
                  <h3 className="text-lg font-medium">Description de la résolution</h3>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-4">
                  <p className="font-medium whitespace-pre-wrap">{incident.resolutionDescription}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Client information */}
          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-slate-500" />
              <h3 className="text-lg font-medium">Informations Client</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Nom</p>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1 text-slate-500" />
                  <p className="font-medium">{incident.clientName || '-'}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1 text-slate-500" />
                  <p className="font-medium">{incident.clientEmail || '-'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1 text-slate-500" />
                <p className="font-medium">{incident.clientPhone || '-'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Date d'arrivée</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-slate-500" />
                  <p className="font-medium">{incident.arrivalDate ? formatDate(incident.arrivalDate) : '-'}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Date de départ</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-slate-500" />
                  <p className="font-medium">{incident.departureDate ? formatDate(incident.departureDate) : '-'}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Montant réservation</p>
                <div className="flex items-center">
                  <Euro className="h-4 w-4 mr-1 text-slate-500" />
                  <p className="font-medium">{incident.reservationAmount ? `${incident.reservationAmount} €` : '-'}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Origine réservation</p>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1 text-slate-500" />
                  <p className="font-medium">{incident.origin ? getParameterLabel(incident.origin) : '-'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Staff and Metadata */}
          <div className="space-y-4 pt-2 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Reçu par</p>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1 text-slate-500" />
                  <p className="font-medium">{getUserName(incident.receivedById)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Clôturé par</p>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1 text-slate-500" />
                  <p className="font-medium">{incident.concludedById ? getUserName(incident.concludedById) : '-'}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Créé le</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-slate-500" />
                  <p className="font-medium">{formatDate(incident.createdAt)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Dernière mise à jour</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-slate-500" />
                  <p className="font-medium">{formatDate(incident.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <div className="flex justify-between w-full">
            {isAdmin && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting || isUpdating}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </Button>
            )}
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              <Button 
                onClick={() => setEditMode(true)}
                disabled={isUpdating}
              >
                {isUpdating ? 'Modification...' : 'Modifier'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDialog;