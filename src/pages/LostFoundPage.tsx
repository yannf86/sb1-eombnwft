import React, { useState } from 'react';
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
  Search, 
  Download, 
  Plus, 
  RefreshCw,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  Tag,
  FileText
} from 'lucide-react';
import { 
  lostItems,
  hotels, 
  users, 
  parameters, 
  getHotelName, 
  getParameterLabel, 
  getUserName 
} from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { exportLostItems } from '@/lib/exportUtils';
import { exportLostItemsToPDF } from '@/lib/pdfUtils';
import { useToast } from '@/hooks/use-toast';

// Define chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const LostFoundPage = () => {
  const [selectedTab, setSelectedTab] = useState('list');
  const [filterHotel, setFilterHotel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const { toast } = useToast();
  
  // View lost item dialog
  const [viewItemDialogOpen, setViewItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Extract parameters by type
  const locationParams = parameters.filter(p => p.type === 'location');
  const itemTypeParams = parameters.filter(p => p.type === 'lost_item_type');
  
  // Filter lost items based on selected filters
  const filteredItems = lostItems.filter(item => {
    // Filter by hotel
    if (filterHotel !== 'all' && item.hotelId !== filterHotel) return false;
    
    // Filter by status
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    
    // Filter by item type
    if (filterType !== 'all' && item.itemTypeId !== filterType) return false;
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesDescription = item.description.toLowerCase().includes(query);
      const matchesHotel = getHotelName(item.hotelId).toLowerCase().includes(query);
      const matchesType = getParameterLabel(item.itemTypeId).toLowerCase().includes(query);
      const matchesStorage = item.storageLocation.toLowerCase().includes(query);
      
      if (!matchesDescription && !matchesHotel && !matchesType && !matchesStorage) return false;
    }
    
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Prepare chart data
  const itemsByType = itemTypeParams.map(type => ({
    name: type.label,
    value: lostItems.filter(item => 
      item.itemTypeId === type.id && 
      (filterHotel === 'all' || item.hotelId === filterHotel) &&
      (filterStatus === 'all' || item.status === filterStatus)
    ).length
  }));
  
  const itemsByLocation = locationParams.map(location => ({
    name: location.label,
    value: lostItems.filter(item => 
      item.locationId === location.id && 
      (filterHotel === 'all' || item.hotelId === filterHotel) &&
      (filterStatus === 'all' || item.status === filterStatus) &&
      (filterType === 'all' || item.itemTypeId === filterType)
    ).length
  }));
  
  const itemsByStatus = [
    { name: 'Conservé', value: lostItems.filter(item => item.status === 'conservé' && (filterHotel === 'all' || item.hotelId === filterHotel)).length },
    { name: 'Rendu', value: lostItems.filter(item => item.status === 'rendu' && (filterHotel === 'all' || item.hotelId === filterHotel)).length },
    { name: 'Transféré', value: lostItems.filter(item => item.status === 'transféré' && (filterHotel === 'all' || item.hotelId === filterHotel)).length }
  ];
  
  const itemsByHotel = hotels.map(hotel => ({
    name: hotel.name,
    value: lostItems.filter(item => 
      item.hotelId === hotel.id && 
      (filterStatus === 'all' || item.status === filterStatus) &&
      (filterType === 'all' || item.itemTypeId === filterType)
    ).length
  }));
  
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
      exportLostItems(filteredItems, getHotelName, getParameterLabel, getUserName);
      
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
      const fileName = exportLostItemsToPDF(filteredItems, getHotelName, getParameterLabel, getUserName);
      
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
  
  // Handle view lost item
  const handleViewItem = (itemId: string) => {
    const item = lostItems.find(i => i.id === itemId);
    if (item) {
      setSelectedItem(item);
      setViewItemDialogOpen(true);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Objets Trouvés</h1>
          <p className="text-muted-foreground">Gestion des objets trouvés et perdus</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Objet
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
      
      <div className="flex flex-col space-y-2">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filterHotel} onValueChange={setFilterHotel}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tous les hôtels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les hôtels</SelectItem>
              {hotels.map(hotel => (
                <SelectItem key={hotel.id} value={hotel.id}>{hotel.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={() => setFiltersExpanded(!filtersExpanded)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon" onClick={resetFilters}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {filtersExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 border rounded-md">
            <div>
              <label className="text-sm font-medium mb-1 block">Statut</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="conservé">Conservé</SelectItem>
                  <SelectItem value="rendu">Rendu</SelectItem>
                  <SelectItem value="transféré">Transféré</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Type d'objet</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {itemTypeParams.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="list" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList>
          <TabsTrigger value="list">Liste des Objets</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Hôtel</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Trouvé par</TableHead>
                  <TableHead>Stockage</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      Aucun objet trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{formatDate(item.date)}</div>
                        <div className="text-xs text-muted-foreground">{item.time}</div>
                      </TableCell>
                      <TableCell>{getHotelName(item.hotelId)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3.5 w-3.5 text-slate-500" />
                          {getParameterLabel(item.locationId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Tag className="mr-1 h-3.5 w-3.5 text-slate-500" />
                          {getParameterLabel(item.itemTypeId)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                      <TableCell>{getUserName(item.foundById)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Briefcase className="mr-1 h-3.5 w-3.5 text-slate-500" />
                          {item.storageLocation}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={
                          item.status === 'conservé' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 border-blue-300" :
                          item.status === 'rendu' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-600 border-green-300" :
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-orange-50 text-orange-600 border-orange-300"
                        }>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewItem(item.id)}
                        >
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Items by Type */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Objets par Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={itemsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {itemsByType.map((entry, index) => (
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
            
            {/* Items by Status */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Objets par Statut</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={itemsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#3b82f6" /> {/* Conservé */}
                        <Cell fill="#10b981" /> {/* Rendu */}
                        <Cell fill="#f59e0b" /> {/* Transféré */}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Items by Location */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Objets par Lieu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={itemsByLocation}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={60} />
                      <Tooltip />
                      <Bar dataKey="value" name="Objets" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Items by Hotel */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Objets par Hôtel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={itemsByHotel}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Objets" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* View Lost Item Dialog */}
      <Dialog open={viewItemDialogOpen} onOpenChange={setViewItemDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'objet trouvé</DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              {/* Basic item information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">ID de l'objet</p>
                  <p className="font-medium">{selectedItem.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  <div>
                    <span className={
                      selectedItem.status === 'conservé' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 border-blue-300" :
                      selectedItem.status === 'rendu' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-600 border-green-300" :
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-orange-50 text-orange-600 border-orange-300"
                    }>
                      {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Date de découverte</p>
                    <p className="font-medium">{formatDate(selectedItem.date)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Heure</p>
                    <p className="font-medium">{selectedItem.time}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Hôtel</p>
                    <p className="font-medium">{getHotelName(selectedItem.hotelId)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Lieu</p>
                    <p className="font-medium">{getParameterLabel(selectedItem.locationId)}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Type d'objet</p>
                  <p className="font-medium">{getParameterLabel(selectedItem.itemTypeId)}</p>
                </div>
              </div>
              
              {/* Description */}
              <div className="space-y-2 pt-2 border-t">
                <h3 className="text-lg font-medium">Description de l'objet</h3>
                <p className="text-sm whitespace-pre-wrap">{selectedItem.description}</p>
              </div>
              
              {/* Storage information */}
              <div className="space-y-4 pt-2 border-t">
                <h3 className="text-lg font-medium">Informations de stockage</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Trouvé par</p>
                    <p className="font-medium">{getUserName(selectedItem.foundById)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Lieu de stockage</p>
                    <p className="font-medium">{selectedItem.storageLocation}</p>
                  </div>
                </div>
              </div>
              
              {/* Photo if exists */}
              {selectedItem.photo && (
                <div className="space-y-2 pt-2 border-t">
                  <h3 className="text-lg font-medium">Photo</h3>
                  <div className="h-48 w-full border rounded-md flex items-center justify-center bg-slate-50">
                    <p className="text-slate-500">Photo disponible</p>
                  </div>
                </div>
              )}
              
              {/* Return details if returned */}
              {selectedItem.status === 'rendu' && (
                <div className="space-y-4 pt-2 border-t">
                  <h3 className="text-lg font-medium">Détails de restitution</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Rendu à</p>
                      <p className="font-medium">{selectedItem.returnedTo}</p>
                    </div>
                    {selectedItem.returnDate && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Date de restitution</p>
                        <p className="font-medium">{formatDate(selectedItem.returnDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Metadata */}
              <div className="space-y-4 pt-2 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Créé le</p>
                    <p className="font-medium">{formatDate(selectedItem.createdAt)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Dernière mise à jour</p>
                    <p className="font-medium">{formatDate(selectedItem.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewItemDialogOpen(false)}>
              Fermer
            </Button>
            <Button>
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LostFoundPage;