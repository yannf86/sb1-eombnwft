import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Image, FileUp, X } from 'lucide-react';
import { hotels, parameters, getAvailableLocations, getAvailableStaff } from '@/lib/data';
import { MaintenanceFormData } from './types/maintenance.types';

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  formData: MaintenanceFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSwitchChange: (name: string, value: boolean) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, fileType: 'photoBefore' | 'quoteFile') => void;
  onSubmit: () => void;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSwitchChange,
  onFileUpload,
  onSubmit
}) => {
  // Get available locations based on selected hotel
  const availableLocations = formData.hotelId ? getAvailableLocations(formData.hotelId) : [];
  
  // Get available staff based on selected hotel
  const availableStaff = formData.hotelId ? getAvailableStaff(formData.hotelId) : [];
  
  // Get intervention types
  const interventionTypeParams = parameters.filter(p => p.type === 'intervention_type');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle Intervention Technique</DialogTitle>
          <DialogDescription>
            Créez une nouvelle demande d'intervention technique
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description du problème</Label>
            <textarea
              id="description"
              name="description"
              className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              placeholder="Décrivez le problème technique..."
              value={formData.description}
              onChange={onFormChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hotelId">Hôtel</Label>
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
                  {hotels.map(hotel => (
                    <SelectItem key={hotel.id} value={hotel.id}>{hotel.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="locationId">Lieu</Label>
              <Select 
                name="locationId" 
                value={formData.locationId} 
                onValueChange={(value) => onFormChange({ 
                  target: { name: 'locationId', value } 
                } as React.ChangeEvent<HTMLSelectElement>)}
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
              name="interventionTypeId" 
              value={formData.interventionTypeId} 
              onValueChange={(value) => onFormChange({ 
                target: { name: 'interventionTypeId', value } 
              } as React.ChangeEvent<HTMLSelectElement>)}
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
            <Label htmlFor="photoBefore">Photo du problème</Label>
            <div className="mt-2">
              {formData.photoBeforePreview ? (
                <div className="relative w-full h-48 bg-slate-100 rounded-md overflow-hidden mb-2">
                  <img 
                    src={formData.photoBeforePreview} 
                    alt="Aperçu" 
                    className="w-full h-full object-contain"
                  />
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={() => onSwitchChange('photoBefore', false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Image className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG (MAX. 2MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => onFileUpload(e, 'photoBefore')}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="hasQuote" 
                checked={formData.hasQuote} 
                onCheckedChange={(checked) => onSwitchChange('hasQuote', checked)}
              />
              <Label htmlFor="hasQuote">Devis disponible</Label>
            </div>
            
            {formData.hasQuote && (
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
                        onChange={(e) => onFileUpload(e, 'quoteFile')}
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
                      value={formData.quoteAmount}
                      onChange={onFormChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quoteAccepted">Statut du devis</Label>
                    <div className="flex items-center space-x-2 h-10 pl-3">
                      <Switch 
                        id="quoteAccepted" 
                        checked={formData.quoteAccepted} 
                        onCheckedChange={(checked) => onSwitchChange('quoteAccepted', checked)}
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" onClick={onSubmit}>
            Créer l'intervention
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceForm;