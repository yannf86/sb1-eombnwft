import { BadgeCategory } from '@/lib/gamification';

export interface Maintenance {
  id: string;
  date: string;
  time: string;
  hotelId: string;
  locationId: string;
  interventionTypeId: string;
  description: string;
  receivedById: string;
  technicianId?: string;
  statusId: string;
  estimatedAmount?: number;
  finalAmount?: number;
  startDate?: string;
  endDate?: string;
  photoBefore?: string;
  photoAfter?: string;
  quoteUrl?: string;
  quoteAmount?: number;
  quoteAccepted?: boolean;
  quoteAcceptedDate?: string;
  quoteAcceptedById?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  history?: {
    timestamp: string;
    userId: string;
    action: string;
    changes: any;
  }[];
}

export interface MaintenanceFormData {
  description: string;
  hotelId: string;
  locationId: string;
  interventionTypeId: string;
  photoBefore: File | null;
  photoBeforePreview: string;
  hasQuote: boolean;
  quoteFile: File | null;
  quoteAmount: string;
  quoteAccepted: boolean;
}

export interface MaintenanceFilters {
  searchQuery: string;
  filterHotel: string;
  filterStatus: string;
  filterType: string;
  filtersExpanded: boolean;
}

export interface MaintenanceEditFormData extends Maintenance {
  photoBefore: File | null;
  photoBeforePreview: string;
  photoAfter: File | null;
  photoAfterPreview: string;
  quoteFile: File | null;
}