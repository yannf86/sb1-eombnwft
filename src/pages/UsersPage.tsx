import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  UserPlus, 
  Search, 
  Lock, 
  Building, 
  Layers, 
  LogIn, 
  Mail, 
  RefreshCw,
  CheckCheck,
  XCircle,
  ShieldCheck,
  Edit,
  Save
} from 'lucide-react';
import { modules } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getHotels } from '@/lib/db/hotels';

// Custom component for checkbox group
interface CheckboxGroupProps {
  items: Array<{ id: string; name: string }>;
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const CheckboxGroupComponent: React.FC<CheckboxGroupProps> = ({ items, selectedItems, onSelectionChange }) => {
  const toggleItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedItems, itemId]);
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={item.id}
            checked={selectedItems.includes(item.id)}
            onChange={() => toggleItem(item.id)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {item.name}
          </label>
        </div>
      ))}
    </div>
  );
};

const UsersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'standard',
    active: true
  });

  // Load users and hotels on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load users from Firestore
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
        
        // Load hotels from Firestore
        const hotelsData = await getHotels();
        setHotels(hotelsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  // Open edit dialog for a user
  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      active: user.active
    });
    setSelectedHotels(user.hotels);
    setSelectedModules(user.modules);
    setEditUserDialogOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle role change
  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  // Handle active status change
  const handleActiveChange = (active: boolean) => {
    setFormData(prev => ({
      ...prev,
      active
    }));
  };

  // Validate form
  const validateForm = (isNew: boolean = true) => {
    if (!formData.name) {
      return { valid: false, message: "Le nom est requis" };
    }
    if (!formData.email) {
      return { valid: false, message: "L'email est requis" };
    }
    if (isNew && !formData.password) {
      return { valid: false, message: "Le mot de passe est requis" };
    }
    if (isNew && formData.password !== formData.confirmPassword) {
      return { valid: false, message: "Les mots de passe ne correspondent pas" };
    }
    if (selectedHotels.length === 0) {
      return { valid: false, message: "Au moins un hôtel doit être sélectionné" };
    }
    if (selectedModules.length === 0) {
      return { valid: false, message: "Au moins un module doit être sélectionné" };
    }
    return { valid: true };
  };

  // Handle create user
  const handleCreateUser = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      toast({
        title: "Erreur de validation",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Create user in Firestore
      await addDoc(collection(db, 'users'), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        hotels: selectedHotels,
        modules: selectedModules,
        active: formData.active,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur a été créé avec succès",
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'standard',
        active: true
      });
      setSelectedHotels([]);
      setSelectedModules([]);
      setNewUserDialogOpen(false);

      // Reload users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle update user
  const handleUpdateUser = async () => {
    const validation = validateForm(false);
    if (!validation.valid) {
      toast({
        title: "Erreur de validation",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Update user in Firestore
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        hotels: selectedHotels,
        modules: selectedModules,
        active: formData.active,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Utilisateur modifié",
        description: "L'utilisateur a été modifié avec succès",
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'standard',
        active: true
      });
      setSelectedHotels([]);
      setSelectedModules([]);
      setEditUserDialogOpen(false);

      // Reload users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Common dialog content
  const UserFormContent = ({ isNew = true }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="after:content-['*'] after:ml-0.5 after:text-red-500">
            Nom complet
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="John Doe"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="after:content-['*'] after:ml-0.5 after:text-red-500">
            Adresse e-mail
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john.doe@example.com"
          />
        </div>
      </div>
      
      {isNew && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Mot de passe
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Confirmer le mot de passe
            </Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Rôle</Label>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="role-standard"
              name="role"
              value="standard"
              checked={formData.role === 'standard'}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="role-standard" className="text-sm">
              Utilisateur Standard
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="role-admin"
              name="role"
              value="admin"
              checked={formData.role === 'admin'}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="role-admin" className="text-sm">
              Administrateur
            </Label>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Hôtels accessibles</Label>
        <div className="p-4 border rounded-md max-h-36 overflow-y-auto">
          <CheckboxGroupComponent
            items={hotels.map(hotel => ({ id: hotel.id, name: hotel.name }))}
            selectedItems={selectedHotels}
            onSelectionChange={setSelectedHotels}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Modules accessibles</Label>
        <div className="p-4 border rounded-md max-h-36 overflow-y-auto">
          <CheckboxGroupComponent
            items={modules.map(module => ({ id: module.id, name: module.name }))}
            selectedItems={selectedModules}
            onSelectionChange={setSelectedModules}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="user-active" 
          checked={formData.active}
          onCheckedChange={handleActiveChange}
        />
        <Label htmlFor="user-active" className="text-sm font-medium">
          Utilisateur actif
        </Label>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chargement des données...</h2>
          <p className="text-muted-foreground">Veuillez patienter pendant le chargement des utilisateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">Gérer les comptes utilisateurs et leurs permissions</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button onClick={() => setNewUserDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nouvel Utilisateur
          </Button>
        </div>
      </div>
      
      <div className="flex">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un utilisateur..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Hôtels</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.role === 'admin' ? (
                      <div className="flex items-center">
                        <ShieldCheck className="mr-1 h-4 w-4 text-blue-500" />
                        <span>Administrateur</span>
                      </div>
                    ) : (
                      <span>Utilisateur Standard</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.hotels.length === hotels.length ? (
                      <span>Tous les hôtels</span>
                    ) : (
                      <span>{user.hotels.length} hôtel(s)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.modules.length === modules.length ? (
                      <span>Tous les modules</span>
                    ) : (
                      <span>{user.modules.length} module(s)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.active ? (
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-600 border-green-300">
                        <CheckCheck className="mr-1 h-3 w-3" />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-600 border-red-300">
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactif
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(user)}
                      disabled={saving}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* New User Dialog */}
      <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Créez un nouvel utilisateur et définissez ses permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            <UserFormContent isNew={true} />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewUserDialogOpen(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={saving}
            >
              {saving ? 'Création...' : 'Créer l\'utilisateur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations et les permissions de l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            <UserFormContent isNew={false} />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditUserDialogOpen(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleUpdateUser}
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;