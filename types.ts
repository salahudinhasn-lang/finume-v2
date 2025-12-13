export type UserRole = 'CLIENT' | 'EXPERT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Client extends User {
  role: 'CLIENT';
  companyName: string;
  industry: string;
  totalSpent: number;
  zatcaStatus: 'GREEN' | 'YELLOW' | 'RED';
}

export interface Expert extends User {
  role: 'EXPERT';
  specializations: string[];
  status: 'ACTIVE' | 'VETTING' | 'SUSPENDED';
  totalEarned: number;
  rating: number;
  bio: string;
  yearsExperience: number;
  hourlyRate: number;
  isPremium?: boolean;
  isFeatured?: boolean;
}

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'FINANCE' | 'SUPPORT' | 'EXPERT_RELATIONS' | 'SALES';

export interface Admin extends User {
  role: 'ADMIN';
  adminRole: AdminRole;
}

export interface Service {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  description: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  tagline: string;
  features: string[];
  guarantee: string;
  isPopular?: boolean;
  color?: string;
}

export interface Review {
  requestId: string;
  expertRating: number; // 1-5
  expertComment: string;
  adminNps: number; // 0-10
  adminComment: string;
  date: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedBy: 'CLIENT' | 'EXPERT' | 'ADMIN';
  uploadedAt: string; // ISO string including time
  source?: 'WHATSAPP' | 'DESKTOP' | 'MOBILE_WEB' | 'APP';
}

export interface FileBatch {
  id: string; // Usually the date string YYYY-MM-DD
  date: string;
  files: UploadedFile[];
  status: 'PENDING' | 'COMPLETED'; // Acts as a sub-task status
  assignedExpertId?: string; // New: Allow assigning specific batch to an expert
  assignedExpertName?: string; // New: Display name
}

export interface Request {
  id: string;
  clientId: string;
  clientName: string; // Denormalized for ease
  serviceId: string;
  serviceName: string;
  status: 'NEW' | 'MATCHED' | 'IN_PROGRESS' | 'REVIEW_CLIENT' | 'REVIEW_ADMIN' | 'COMPLETED' | 'CANCELLED';
  amount: number;
  dateCreated: string;
  assignedExpertId?: string;
  expertName?: string;
  description: string;
  review?: Review;
  batches?: FileBatch[];
  payoutId?: string; // Link to a PayoutRequest. If undefined, it is "Unsettled".
}

export interface Transaction {
  id: string;
  requestId: string;
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING' | 'REFUNDED';
  type: 'PAYMENT' | 'PAYOUT';
}

export interface PayoutRequest {
  id: string;
  expertId: string;
  expertName: string;
  amount: number;
  requestDate: string;
  processedDate?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  bankDetails?: string;
  requestIds: string[]; // List of Request IDs included in this payout
}

export interface Notification {
  id: string;
  userId: string; // Recipient
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  date: string;
  link?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}