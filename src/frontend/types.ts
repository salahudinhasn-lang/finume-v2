
export type UserRole = 'CLIENT' | 'EXPERT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  specializations?: string[];
  mobileNumber?: string;
  linkedinUrl?: string;
}

export interface Client extends User {
  role: 'CLIENT';
  companyName: string;
  industry: string;
  totalSpent: number;
  zatcaStatus: 'GREEN' | 'YELLOW' | 'RED';
  gamification?: ClientGamification;
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
  attributes?: Record<string, any>; // Dynamic attributes matching table config
  guarantee: string;
  isPopular?: boolean;
  color?: string;
  limits?: {
    revenue: { label: string; value: number };
    transactions: { label: string; value: number };
    invoices: { label: string; value: number };
    bills: { label: string; value: number };
    bankAccounts: { label: string; value: number };
    employees: { label: string; value: number };
    features: {
      international: boolean | 'Basic';
      stock: 'Basic' | 'Full';
      contracts: boolean | 'Basic';
    };
  };
}

export interface PageVisibility {
  public: boolean;
  client: boolean;
}

export interface SitePage {
  id: string; // e.g. 'about', 'careers'
  slug: string; // e.g. '/about'
  title: string; // Menu Title
  section: 'COMPANY' | 'RESOURCES' | 'LEGAL';
  isSystem?: boolean; // If true, slug might be fixed
  showPublic: boolean;
  showClient: boolean;
  content?: {
    pageTitle?: string;
    subtitle?: string;
    body?: string; // Markdown/HTML
    hiringBadge?: boolean; // For Careers
    hiringTagline?: string;
  };
}

export interface PlatformSettings {
  id: string;
  showExpertsPage: boolean;
  showServicesPage: boolean;
  careersEnabled: boolean;
  careersTitle?: string;
  careersSubtitle?: string;
  pageVisibility?: string; // JSON string
  sitePages?: string; // JSON string
  pricingTableConfig?: string; // JSON string for table rows
  expertSkills?: string; // JSON string for list of skills
  yearlyDiscountPercentage?: number;
}

export interface ClientFeaturePermissions {
  id: string;
  clientId: string;
  canViewReports: boolean;
  canUploadDocs: boolean;
  canDownloadInvoices: boolean;
  canRequestCalls: boolean;
  canSubmitTickets: boolean;
  canViewMarketplace: boolean; // New: View Experts/Services
}

export interface Review {
  requestId: string;
  expertRating: number; // 1-5
  expertComment: string;
  adminNps: number; // 0-10
  adminComment: string;
  date: string;
}

export interface ClientGamification {
  totalPoints: number;
  totalStars: number;
  currentStreak: number;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export type FileStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedBy: 'CLIENT' | 'EXPERT' | 'ADMIN';
  uploadedAt: string; // ISO string including time
  source?: 'WHATSAPP' | 'DESKTOP' | 'MOBILE_WEB' | 'APP';
  category?: DocumentCategory;
  originalCategory?: DocumentCategory; // AI Detected category
  status?: FileStatus;
}

export type DocumentCategory =
  | 'Sales Invoice'
  | 'Purchase Invoice'
  | 'Contract'
  | 'Expense'
  | 'Petty Cash'
  | 'Bank Statement'
  | 'VAT Return'
  | 'Other';

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
  // Services & Plans (Mutually Exclusive usually)
  serviceId?: string;
  service?: Service; // Populated by Backend
  pricingPlanId?: string;
  pricingPlan?: PricingPlan; // Populated by Backend

  // Derived Display Data
  serviceName: string; // Helper for display (either Service Name or Plan Name)
  status: 'PENDING_PAYMENT' | 'NEW' | 'MATCHED' | 'IN_PROGRESS' | 'REVIEW_CLIENT' | 'REVIEW_ADMIN' | 'COMPLETED' | 'CANCELLED';
  visibility?: 'ADMIN' | 'ASSIGNED' | 'OPEN'; // New
  requiredSkills?: string[]; // New
  amount: number;
  dateCreated: string;
  createdAt?: string; // Backend compatibility
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
