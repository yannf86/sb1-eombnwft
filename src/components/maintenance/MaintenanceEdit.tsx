import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Image, FileUp, X } from 'lucide-react';
import { hotels, parameters, users, getAvailableLocations, getAvailableStaff } from '@/lib/data';
import { Maintenance, MaintenanceEditFormData } from './types/maintenance.types';

interface MaintenanceEditProps {
  isOpen: boolean;
  onClose: () => void;
  maintenance: Maintenance;
  onSave: (updatedMaintenance: Maintenance) => void;
}

const MaintenanceEdit: React.FC<MaintenanceEditProps> = ({
  isOpen,
  onClose,
  maintenance,
  onSave
}) => {
  const [formData, setFormData] = React.useState<MaintenanceEditFormData>({
    ...maintenance,
    photoBefore: null,
    photoBeforePreview: maintenance.photoBefore || '',
    photoAfter: null,
    photoAfterPreview: maintenance.photoAfter || '',
    quoteFile: null
  });

  // Get available locations based on selected hotel
  const availableLocations = formData.hotelId ? getAvailableLocations(formData.hotelId) : [];
  
  // Get available staff based on selected hotel
  const availableStaff = formData.hotelId ? getAvailableStaff(formData.hotelId) : [];

  // Extract parameters by type
  const interventionTypeParams = parameters.filter(p => p.type === 'intervention_type');
  const statusParams = parameters.filter(p => p.type === 'status');

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string | null) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'photoBefore' | 'photoAfter' | 'quoteFile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileType === 'photoBefore' || fileType === 'photoAfter') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [fileType]: file,
          [`${fileType}Preview`]: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'quoteFile') {
      setFormData(prev => ({
        ...prev,
        quoteFile: file
      }));
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Here you would normally handle file uploads and create URLs
    const updatedMaintenance: Maintenance = {
      ...formData,
      photoBefore: formData.photoBeforePreview || undefined,
      photoAfter: formData.photoAfterPreview || undefined,
      // Update other fields as needed
    };
    onSave(updatedMaintenance);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'intervention</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'intervention technique
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Heure</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleFormChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hotelId">Hôtel</Label>
              <Select 
                value={formData.hotelId} 
                onValueChange={(value) => handleSelectChange('hotelId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un hôtel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map(hotel => (
                    <SelectItem key={hotel.id} value={hotel.id}>{hotel.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="locationId">Lieu</Label>
              <Select 
                value={formData.locationId} 
                onValueChange={(value) => handleSelectChange('locationId', value)}
                disabled={!formData.hotelId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.hotelId ? "Sélectionnez un lieu" : "Sélectionnez d'abord un hôtel"} />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.map(location => (
                    <SelectItem key={location.id} value={location.id}>{location.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interventionTypeId">Type d'intervention</Label>
            <Select 
              value={formData.interventionTypeId} 
              onValueChange={(value) => handleSelectChange('interventionTypeId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type d'intervention" />
              </SelectTrigger>
              <SelectContent>
                {interventionTypeParams.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              value={formData.description}
              onChange={handleFormChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Photos</Label>
            <div className="grid grid-cols-2 gap-4">
              {/* Photo Avant */}
              <div className="space-y-2">
                <Label>Photo avant</Label>
                {formData.photoBeforePreview ? (
                  <div className="relative w-full h-48 bg-slate-100 rounded-md overflow-hidden mb-2">
                    <img 
                      src={formData.photoBeforePreview} 
                      alt="Aperçu avant" 
                      className="w-full h-full object-contain"
                    />
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        photoBefore: null,
                        photoBeforePreview: ''
                      }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Image className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="text-xs text-gray-500">Cliquez pour uploader</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'photoBefore')}
                      />
                    </label>
                  </div>
                )}
              </div>
              
              {/* Photo Après */}
              <div className="space-y-2">
                <Label>Photo après</Label>
                {formData.photoAfterPreview ? (
                  <div className="relative w-full h-48 bg-slate-100 rounded-md overflow-hidden mb-2">
                    <img 
                      src={formData.photoAfterPreview} 
                      alt="Aperçu après" 
                      className="w-full h-full object-contain"
                    />
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        photoAfter: null,
                        photoAfterPreview: ''
                      }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Image className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="text-xs text-gray-500">Cliquez pour uploader</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'photoAfter')}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="hasQuote" 
                checked={Boolean(formData.quoteUrl)}
                onCheckedChange={(checked) => handleSwitchChange('quoteUrl', checked)}
              />
              <Label htmlFor="hasQuote">Devis disponible</Label>
            </div>
            
            {formData.quoteUrl && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="quoteFile">Fichier du devis</Label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileUp className="w-6 h-6 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Cliquez pour uploader le devis</span>
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, 'quoteFile')}
                      />
                    </label>
                  </div>
                  {formData.quoteFile && (
                    <p className="text-sm text-green-600">
                      Fichier sélectionné: {formData.quoteFile.name}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quoteAmount">Montant du devis (€)</Label>
                    <Input
                      id="quoteAmount"
                      name="quoteAmount"
                      type="number"
                      placeholder="0.00"
                      value={formData.quoteAmount || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quoteAccepted">Statut du devis</Label>
                    <div className="flex items-center space-x-2 h-10 pl-3">
                      <Switch 
                        id="quoteAccepted" 
                        checked={Boolean(formData.quoteAccepted)}
                        onCheckedChange={(checked) => handleSwitchChange('quoteAccepted', checked)}
                      />
                      <Label htmlFor="quoteAccepted">
                        {formData.quoteAccepted ? 'Accepté' : 'En attente'}
                      </Label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Assignation</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="technicianId">Technicien</Label>
                <Select 
                  value={formData.technicianId || "unassigned"} 
                  onValueChange={(value) => handleSelectChange('technicianId', value === "unassigned" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un technicien" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Non assigné</SelectItem>
                    {availableStaff.map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="statusId">Statut</Label>
                <Select 
                  value={formData.statusId} 
                  onValueChange={(value) => handleSelectChange('statusId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusParams.map(status => (
                      <SelectItem key={status.id} value={status.id}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedAmount">Montant estimé (€)</Label>
                <Input
                  id="estimatedAmount"
                  name="estimatedAmount"
                  type="number"
                  placeholder="0.00"
                  value={formData.estimatedAmount || ''}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="finalAmount">Montant final (€)</Label>
                <Input
                  id="finalAmount"
                  name="finalAmount"
                  type="number"
                  placeholder="0.00"
                  value={formData.finalAmount || ''}
                  onChange={handleFormChange}
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Enregistrer les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceEdit;