import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { getHotelName, getParameterLabel } from '@/lib/data';
import { Image, FileUp, Check, X } from 'lucide-react';
import { Maintenance } from './types/maintenance.types';

interface MaintenanceListProps {
  maintenanceRequests: Maintenance[];
  onViewMaintenance: (id: string) => void;
}

const MaintenanceList: React.FC<MaintenanceListProps> = ({ maintenanceRequests, onViewMaintenance }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Hôtel</TableHead>
          <TableHead>Lieu</TableHead>
          <TableHead>Type d'intervention</TableHead>
          <TableHead>Photos</TableHead>
          <TableHead>Devis</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {maintenanceRequests.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center">
              Aucune intervention trouvée
            </TableCell>
          </TableRow>
        ) : (
          maintenanceRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div className="font-medium">{formatDate(request.date)}</div>
                <div className="text-xs text-muted-foreground">{request.time}</div>
              </TableCell>
              <TableCell>{getHotelName(request.hotelId)}</TableCell>
              <TableCell>{getParameterLabel(request.locationId)}</TableCell>
              <TableCell>{getParameterLabel(request.interventionTypeId)}</TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  {request.photoBefore && (
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 border-blue-200">
                      <Image className="h-3 w-3 mr-1" />
                      Avant
                    </span>
                  )}
                  {request.photoAfter && (
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-green-50 text-green-600 border-green-200">
                      <Image className="h-3 w-3 mr-1" />
                      Après
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {request.quoteUrl && (
                  <div className="flex flex-col space-y-1">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-600 border-amber-200">
                      <FileUp className="h-3 w-3 mr-1" />
                      {request.quoteAmount ? `${request.quoteAmount}€` : 'Devis'}
                    </span>
                    {request.quoteAccepted !== undefined && (
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                        request.quoteAccepted 
                          ? "bg-green-50 text-green-600 border-green-200" 
                          : "bg-red-50 text-red-600 border-red-200"
                      }`}>
                        {request.quoteAccepted 
                          ? <><Check className="h-3 w-3 mr-1" /> Accepté</> 
                          : <><X className="h-3 w-3 mr-1" /> Refusé</>}
                      </span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <span className={
                  request.statusId === 'stat1' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-50 text-yellow-600 border-yellow-300" :
                  request.statusId === 'stat2' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 border-blue-300" :
                  request.statusId === 'stat3' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-600 border-green-300" :
                  request.statusId === 'stat4' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-gray-50 text-gray-600 border-gray-300" :
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-600 border-red-300"
                }>
                  {getParameterLabel(request.statusId)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewMaintenance(request.id)}
                >
                  Voir
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default MaintenanceList;