import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { getHotels } from '@/lib/db/hotels';
import { getHotelLocations } from '@/lib/db/parameters-locations';
import { getIncidentCategoryParameters } from '@/lib/db/parameters-incident-categories';
import { getImpactParameters } from '@/lib/db/parameters-impact';
import { getStatusParameters } from '@/lib/db/parameters-status';
import { getBookingOriginParameters } from '@/lib/db/parameters-booking-origin';
import { getCurrentUser } from '@/lib/auth';
import { useDate } from '@/hooks/use-date';
import { useToast } from '@/hooks/use-toast';

interface IncidentFormProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: () => void;
}

const IncidentForm: React.FC<IncidentFormProps> = ({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSubmit
}) => {
  const currentUser = getCurrentUser();
  const { toast } = useToast();
  const [hotels, setHotels] = React.useState<any[]>([]);
  const [locations, setLocations] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [impacts, setImpacts] = React.useState<any[]>([]);
  const [statuses, setStatuses] = React.useState<any[]>([]);
  const [bookingOrigins, setBookingOrigins] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingLocations, setLoadingLocations] = React.useState(false);
  const [loadingCategories, setLoadingCategories] = React.useState(true);
  const [loadingImpacts, setLoadingImpacts] = React.useState(true);
  const [loadingStatuses, setLoadingStatuses] = React.useState(true);
  const [loadingBookingOrigins, setLoadingBookingOrigins] = React.useState(true);

  // Load all data on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setLoadingCategories(true);
        setLoadingImpacts(true);
        setLoadingStatuses(true);
        setLoadingBookingOrigins(true);
        
        // Load hotels
        const hotelsData = await getHotels();
        setHotels(hotelsData);
        
        // Load categories
        const categoriesData = await getIncidentCategoryParameters();
        setCategories(categoriesData);
        
        // Load impacts
        const impactsData = await getImpactParameters();
        setImpacts(impactsData);
        
        // Load statuses
        const statusesData = await getStatusParameters();
        setStatuses(statusesData);
        
        // Load booking origins
        const bookingOriginsData = await getBookingOriginParameters();
        setBookingOrigins(bookingOriginsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setLoadingCategories(false);
        setLoadingImpacts(false);
        setLoadingStatuses(false);
        setLoadingBookingOrigins(false);
      }
    };
    loadData();
  }, []);

  // Load locations when hotel changes
  React.useEffect(() => {
    const loadLocations = async () => {
      if (!formData.hotelId) {
        setLocations([]);
        return;
      }

      try {
        setLoadingLocations(true);
        const locationsData = await getHotelLocations(formData.hotelId);
        setLocations(locationsData);
      } catch (error) {
        console.error('Error loading locations:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les lieux",
          variant: "destructive",
        });
      } finally {
        setLoadingLocations(false);
      }
    };
    loadLocations();
  }, [formData.hotelId]);

  // Set receivedById to current user's ID if not already set
  React.useEffect(() => {
    if (currentUser && !formData.receivedById) {
      onFormChange({
        target: { name: 'receivedById', value: currentUser.id }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [currentUser, formData.receivedById, onFormChange]);

  // Use the date hook for incident date
  const incidentDate = useDate({
    defaultDate: formData.date,
    defaultTime: formData.time,
    required: true
  });

  // Use the date hook for arrival/departure dates
  const arrivalDate = useDate({
    defaultDate: formData.arrivalDate,
    required: false
  });

  const departureDate = useDate({
    defaultDate: formData.departureDate,
    minDate: formData.arrivalDate,
    required: false
  });

  // Filter hotels based on user role
  const filteredHotels = currentUser?.role === 'admin' 
    ? hotels 
    : hotels.filter(hotel => currentUser?.hotels.includes(hotel.id));

  // Validate form before submission
  const validateForm = () => {
    if (!incidentDate.isValid) {
      return { valid: false, message: "La date de l'incident est invalide" };
    }
    if (!formData.hotelId) {
      return { valid: false, message: "Le champ 'Hôtel' est obligatoire" };
    }
    if (!formData.locationId) {
      return { valid: false, message: "Le champ 'Lieu' est obligatoire" };
    }
    if (!formData.categoryId) {
      return { valid: false, message: "Le champ 'Catégorie' est obligatoire" };
    }
    if (!formData.impactId) {
      return { valid: false, message: "Le champ 'Impact' est obligatoire" };
    }
    if (!formData.description || formData.description.length < 10) {
      return { valid: false, message: "La description doit contenir au moins 10 caractères" };
    }
    if (!formData.receivedById) {
      return { valid: false, message: "Le champ 'Reçu par' est obligatoire" };
    }
    if (!formData.statusId) {
      return { valid: false, message: "Le champ 'Statut' est obligatoire" };
    }
    if (formData.arrivalDate && !arrivalDate.isValid) {
      return { valid: false, message: "La date d'arrivée est invalide" };
    }
    if (formData.departureDate && !departureDate.isValid) {
      return { valid: false, message: "La date de départ est invalide" };
    }
    if (formData.departureDate && formData.arrivalDate && formData.departureDate < formData.arrivalDate) {
      return { valid: false, message: "La date de départ doit être après la date d'arrivée" };
    }
    return { valid: true };
  };

  // Handle form submission with validation
  const handleSubmit = () => {
    const validation = validateForm();
    if (!validation.valid) {
      toast({
        title: "Erreur de validation",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }
    onSubmit();
  };

  // Update form data when dates change
  React.useEffect(() => {
    onFormChange({ 
      target: { name: 'date', value: incidentDate.date } 
    } as React.ChangeEvent<HTMLInputElement>);
    onFormChange({ 
      target: { name: 'time', value: incidentDate.time } 
    } as React.ChangeEvent<HTMLInputElement>);
  }, [incidentDate.date, incidentDate.time]);

  React.useEffect(() => {
    if (arrivalDate.date) {
      onFormChange({ 
        target: { name: 'arrivalDate', value: arrivalDate.date } 
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [arrivalDate.date]);

  React.useEffect(() => {
    if (departureDate.date) {
      onFormChange({ 
        target: { name: 'departureDate', value: departureDate.date } 
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [departureDate.date]);

  // Reset locationId when hotel changes
  React.useEffect(() => {
    onFormChange({
      target: { name: 'locationId', value: '' }
    } as React.ChangeEvent<HTMLInputElement>);
  }, [formData.hotelId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvel Incident</DialogTitle>
          <DialogDescription>
            Créez un nouvel incident
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <DateTimePicker
            label="Date et heure de l'incident"
            date={incidentDate.date}
            time={incidentDate.time}
            onDateChange={incidentDate.setDate}
            onTimeChange={incidentDate.setTime}
            error={incidentDate.error}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hotelId" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Hôtel
              </Label>
              <Select 
                name="hotelId" 
                value={formData.hotelId} 
                onValueChange={(value) => onFormChange({ 
                  target: { name: 'hotelId', value } 
                } as React.ChangeEvent<HTMLSelectElement>)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un hôtel" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
                  ) : (
                    filteredHotels.map(hotel => (
                      <SelectItem key={hotel.id} value={hotel.id}>{hotel.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="locationId" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Lieu
              </Label>
              <Select 
                name="locationId" 
                value={formData.locationId} 
                onValueChange={(value) => onFormChange({ 
                  target: { name: 'locationId', value } 
                } as React.ChangeEvent<HTMLSelectElement>)}
                disabled={!formData.hotelId || loadingLocations}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !formData.hotelId 
                      ? "Sélectionnez d'abord un hôtel" 
                      : loadingLocations 
                        ? "Chargement..." 
                        : "Sélectionnez un lieu"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {loadingLocations ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
                  ) : locations.length === 0 ? (
                    <SelectItem value="none" disabled>Aucun lieu disponible</SelectItem>
                  ) : (
                    locations.map(location => (
                      <SelectItem key={location.id} value={location.id}>{location.label}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Catégorie
              </Label>
              <Select 
                name="categoryId" 
                value={formData.categoryId} 
                onValueChange={(value) => onFormChange({ 
                  target: { name: 'categoryId', value } 
                } as React.ChangeEvent<HTMLSelectElement>)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCategories ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="none" disabled>Aucune catégorie disponible</SelectItem>
                  ) : (
                    categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.label}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="impactId" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Impact
              </Label>
              <Select 
                name="impactId" 
                value={formData.impactId} 
                onValueChange={(value) => onFormChange({ 
                  target: { name: 'impactId', value } 
                } as React.ChangeEvent<HTMLSelectElement>)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un impact" />
                </SelectTrigger>
                <SelectContent>
                  {loadingImpacts ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
                  ) : impacts.length === 0 ? (
                    <SelectItem value="none" disabled>Aucun niveau d'impact disponible</SelectItem>
                  ) : (
                    impacts.map(impact => (
                      <SelectItem key={impact.id} value={impact.id}>{impact.label}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Description
            </Label>
            <textarea
              id="description"
              name="description"
              className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              value={formData.description}
              onChange={onFormChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolutionDescription">Description de la résolution</Label>
            <textarea
              id="resolutionDescription"
              name="resolutionDescription"
              className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              placeholder="Description de la résolution (optionnel)"
              value={formData.resolutionDescription}
              onChange={onFormChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receivedById" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Reçu par
              </Label>
              <Input
                id="receivedById"
                name="receivedById"
                value={currentUser?.name || ''}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="statusId" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Statut
              </Label>
              <Select 
                name="statusId" 
                value={formData.statusId} 
                onValueChange={(value) => onFormChange({ 
                  target: { name: 'statusId', value } 
                } as React.ChangeEvent<HTMLSelectElement>)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  {loadingStatuses ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
                  ) : statuses.length === 0 ? (
                    <SelectItem value="none" disabled>Aucun statut disponible</SelectItem>
                  ) : (
                    statuses.map(status => (
                      <SelectItem key={status.id} value={status.id}>{status.label}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Informations Client</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nom du client</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={onFormChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={onFormChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Téléphone</Label>
              <Input
                id="clientPhone"
                name="clientPhone"
                type="tel"
                value={formData.clientPhone}
                onChange={onFormChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <DateTimePicker
                label="Date d'arrivée"
                date={arrivalDate.date}
                time=""
                onDateChange={arrivalDate.setDate}
                onTimeChange={() => {}}
                error={arrivalDate.error}
              />
              
              <DateTimePicker
                label="Date de départ"
                date={departureDate.date}
                time=""
                onDateChange={departureDate.setDate}
                onTimeChange={() => {}}
                error={departureDate.error}
                disabled={!formData.arrivalDate}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reservationAmount">Montant réservation</Label>
                <Input
                  id="reservationAmount"
                  name="reservationAmount"
                  type="number"
                  placeholder="0.00"
                  value={formData.reservationAmount}
                  onChange={onFormChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="origin">Origine réservation</Label>
                <Select 
                  name="origin" 
                  value={formData.origin} 
                  onValueChange={(value) => onFormChange({ 
                    target: { name: 'origin', value } 
                  } as React.ChangeEvent<HTMLSelectElement>)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une origine" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingBookingOrigins ? (
                      <SelectItem value="loading" disabled>Chargement...</SelectItem>
                    ) : bookingOrigins.length === 0 ? (
                      <SelectItem value="none" disabled>Aucune origine disponible</SelectItem>
                    ) : (
                      bookingOrigins.map(origin => (
                        <SelectItem key={origin.id} value={origin.id}>{origin.label}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Créer l'incident
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentForm;