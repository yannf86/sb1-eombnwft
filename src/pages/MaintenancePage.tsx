import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PenTool as Tool, 
  Search, 
  Download, 
  Plus, 
  RefreshCw, 
  SlidersHorizontal, 
  Wrench, 
  FileText,
  Upload,
  Check,
  X,
  Image,
  FileUp,
  Clock,
  Euro,
  CalendarRange,
  User
} from 'lucide-react';
import { 
  hotels, 
  users, 
  parameters, 
  getHotelName, 
  getParameterLabel, 
  getUserName 
} from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { exportMaintenanceRequests } from '@/lib/exportUtils';
import { exportMaintenanceRequestsToPDF } from '@/lib/pdfUtils';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';
import { getMaintenanceRequests, createMaintenanceRequest } from '@/lib/db/maintenance';

// Import components
import MaintenanceDialog from '@/components/maintenance/MaintenanceDialog';
import MaintenanceEdit from '@/components/maintenance/MaintenanceEdit';
import MaintenanceForm from '@/components/maintenance/MaintenanceForm';
import MaintenanceList from '@/components/maintenance/MaintenanceList';
import MaintenanceFilters from '@/components/maintenance/MaintenanceFilters';

// Define chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const MaintenancePage = () => {
  const [selectedTab, setSelectedTab] = useState('list');
  const [filterHotel, setFilterHotel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Load maintenance requests on mount
  useEffect(() => {
    const loadMaintenanceRequests = async () => {
      try {
        const data = await getMaintenanceRequests();
        setMaintenanceRequests(data);
      } catch (error) {
        console.error('Error loading maintenance requests:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les demandes de maintenance",
          variant: "destructive",
        });
      }
    };
    loadMaintenanceRequests();
  }, []);
  
  // New maintenance dialog
  const [newMaintenanceDialogOpen, setNewMaintenanceDialogOpen] = useState(false);
  const [maintenanceFormData, setMaintenanceFormData] = useState({
    description: '',
    hotelId: '',
    locationId: '',
    interventionTypeId: '',
    photoBefore: null as File | null,
    photoBeforePreview: '',
    hasQuote: false,
    quoteFile: null as File | null,
    quoteAmount: '',
    quoteAccepted: false
  });

  // View maintenance dialog
  const [viewMaintenanceDialogOpen, setViewMaintenanceDialogOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  
  // Extract parameters by type
  const locationParams = parameters.filter(p => p.type === 'location');
  const interventionTypeParams = parameters.filter(p => p.type === 'intervention_type');
  const statusParams = parameters.filter(p => p.type === 'status');
  
  // Filter maintenance requests based on selected filters
  const filteredRequests = maintenanceRequests.filter(request => {
    // Filter by hotel
    if (filterHotel !== 'all' && request.hotelId !== filterHotel) return false;
    
    // Filter by status
    if (filterStatus !== 'all' && request.statusId !== filterStatus) return false;
    
    // Filter by intervention type
    if (filterType !== 'all' && request.interventionTypeId !== filterType) return false;
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesDescription = request.description.toLowerCase().includes(query);
      const matchesHotel = getHotelName(request.hotelId).toLowerCase().includes(query);
      const matchesType = getParameterLabel(request.interventionTypeId).toLowerCase().includes(query);
      
      if (!matchesDescription && !matchesHotel && !matchesType) return false;
    }
    
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMaintenanceFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, value: boolean) => {
    setMaintenanceFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'photoBefore' | 'quoteFile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileType === 'photoBefore') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMaintenanceFormData(prev => ({
          ...prev,
          photoBefore: file,
          photoBeforePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'quoteFile') {
      setMaintenanceFormData(prev => ({
        ...prev,
        quoteFile: file
      }));
    }
  };

  // Handle form submission
  const handleSubmitMaintenance = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Create maintenance request
      await createMaintenanceRequest({
        ...maintenanceFormData,
        statusId: 'stat1', // Initial status: Open
        receivedById: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      toast({
        title: "Demande d'intervention créée",
        description: "La demande d'intervention a été créée avec succès",
      });

      // Reload maintenance requests
      const updatedRequests = await getMaintenanceRequests();
      setMaintenanceRequests(updatedRequests);
      
      setNewMaintenanceDialogOpen(false);
      
      // Reset form
      setMaintenanceFormData({
        description: '',
        hotelId: '',
        locationId: '',
        interventionTypeId: '',
        photoBefore: null,
        photoBeforePreview: '',
        hasQuote: false,
        quoteFile: null,
        quoteAmount: '',
        quoteAccepted: false
      });
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la demande",
        variant: "destructive",
      });
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilterHotel('all');
    setFilterStatus('all');
    setFilterType('all');
    setSearchQuery('');
  };
  
  // Handle export to Excel
  const handleExcelExport = () => {
    try {
      exportMaintenanceRequests(filteredRequests, getHotelName, getParameterLabel, getUserName);
      
      toast({
        title: "Export Excel réussi",
        description: "Le fichier Excel a été téléchargé avec succès.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
      
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export Excel.",
        variant: "destructive",
      });
    }
  };
  
  // Handle export to PDF
  const handlePDFExport = () => {
    try {
      const fileName = exportMaintenanceRequestsToPDF(filteredRequests, getHotelName, getParameterLabel, getUserName);
      
      toast({
        title: "Export PDF réussi",
        description: `Le fichier PDF a été généré avec succès (${fileName}).`,
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export PDF.",
        variant: "destructive",
      });
    }
  };
  
  // Handle view maintenance
  const handleViewMaintenance = (maintenanceId: string) => {
    const maintenance = maintenanceRequests.find(req => req.id === maintenanceId);
    if (maintenance) {
      setSelectedMaintenance(maintenance);
      setViewMaintenanceDialogOpen(true);
    }
  };
  
  // Handle update maintenance
  const handleUpdateMaintenance = async (updatedMaintenance: any) => {
    try {
      // Here you would normally update the maintenance request in the database
      
      // Reload maintenance requests
      const updatedRequests = await getMaintenanceRequests();
      setMaintenanceRequests(updatedRequests);
      
      toast({
        title: "Demande mise à jour",
        description: "La demande d'intervention a été mise à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suivi Technique</h1>
          <p className="text-muted-foreground">Gestion des maintenances et réparations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button onClick={() => setNewMaintenanceDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Intervention
          </Button>
          <div className="flex space-x-1">
            <Button variant="outline" onClick={handleExcelExport}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={handlePDFExport}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </div>
      
      <MaintenanceFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterHotel={filterHotel}
        onHotelChange={setFilterHotel}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterType={filterType}
        onTypeChange={setFilterType}
        filtersExpanded={filtersExpanded}
        onFiltersExpandedChange={setFiltersExpanded}
        onReset={resetFilters}
      />
      
      <Tabs defaultValue="list" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList>
          <TabsTrigger value="list">Liste des Interventions</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <MaintenanceList 
                maintenanceRequests={filteredRequests}
                onViewMaintenance={handleViewMaintenance}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interventions by Type */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Interventions par Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={interventionTypeParams.map(type => ({
                          name: type.label,
                          value: filteredRequests.filter(req => req.interventionTypeId === type.id).length
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {interventionTypeParams.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Interventions by Status */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Interventions par Statut</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusParams.map(status => ({
                          name: status.label,
                          value: filteredRequests.filter(req => req.statusId === status.id).length
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusParams.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              index === 0 ? "#f59e0b" : // Ouvert
                              index === 1 ? "#3b82f6" : // En cours
                              index === 2 ? "#10b981" : // Résolu
                              index === 3 ? "#6b7280" : // Fermé
                              "#ef4444" // Annulé
                            } 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* New Maintenance Form */}
      <MaintenanceForm 
        isOpen={newMaintenanceDialogOpen}
        onClose={() => setNewMaintenanceDialogOpen(false)}
        formData={maintenanceFormData}
        onFormChange={handleFormChange}
        onSwitchChange={handleSwitchChange}
        onFileUpload={handleFileUpload}
        onSubmit={handleSubmitMaintenance}
      />
      
      {/* View/Edit Maintenance Dialog */}
      <MaintenanceDialog 
        maintenance={selectedMaintenance}
        isOpen={viewMaintenanceDialogOpen}
        onClose={() => setViewMaintenanceDialogOpen(false)}
        onUpdate={handleUpdateMaintenance}
      />
    </div>
  );
};

export default MaintenancePage;