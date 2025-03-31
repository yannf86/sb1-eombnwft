import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { getHotelName, getParameterLabel, getUserName } from '@/lib/data';

interface IncidentListProps {
  incidents: any[];
  onViewIncident: (id: string) => void;
}

const IncidentList: React.FC<IncidentListProps> = ({ incidents, onViewIncident }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Hôtel</TableHead>
          <TableHead>Catégorie</TableHead>
          <TableHead>Impact</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Reçu par</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incidents.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center">
              Aucun incident trouvé
            </TableCell>
          </TableRow>
        ) : (
          incidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell>
                <div className="font-medium">{formatDate(incident.date)}</div>
                <div className="text-xs text-muted-foreground">{incident.time}</div>
              </TableCell>
              <TableCell>{getHotelName(incident.hotelId)}</TableCell>
              <TableCell>{getParameterLabel(incident.categoryId)}</TableCell>
              <TableCell>
                <span className={
                  incident.impactId === 'imp4' ? "text-red-500 font-medium" :
                  incident.impactId === 'imp3' ? "text-amber-500 font-medium" :
                  incident.impactId === 'imp2' ? "text-blue-500 font-medium" :
                  "text-green-500 font-medium"
                }>
                  {getParameterLabel(incident.impactId)}
                </span>
              </TableCell>
              <TableCell>{incident.clientName || "-"}</TableCell>
              <TableCell>{getUserName(incident.receivedById)}</TableCell>
              <TableCell>
                <span className={
                  incident.statusId === 'stat1' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-50 text-yellow-600 border-yellow-300" :
                  incident.statusId === 'stat2' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 border-blue-300" :
                  incident.statusId === 'stat3' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-600 border-green-300" :
                  incident.statusId === 'stat4' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-gray-50 text-gray-600 border-gray-300" :
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-600 border-red-300"
                }>
                  {getParameterLabel(incident.statusId)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewIncident(incident.id)}
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

export default IncidentList;