
import { Client, Expert, Request, Transaction, Service, Admin, PricingPlan, FileBatch } from './types';

// Generators
const industries = ['Retail', 'Services', 'Manufacturing', 'Tech', 'Healthcare'];
const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca'];
const statuses = ['NEW', 'MATCHED', 'IN_PROGRESS', 'REVIEW_CLIENT', 'REVIEW_ADMIN', 'COMPLETED', 'CANCELLED'] as const;
const zatcaStatuses = ['GREEN', 'YELLOW', 'RED'] as const;

export const SERVICES: Service[] = [
  { id: 'S1', nameEn: 'VAT Filing', nameAr: 'إقرار ضريبة القيمة المضافة', price: 500, description: 'Complete VAT return filing with ZATCA' },
  { id: 'S2', nameEn: 'Bookkeeping (Monthly)', nameAr: 'مسك الدفاتر (شهري)', price: 2500, description: 'Monthly financial record keeping' },
  { id: 'S3', nameEn: 'Financial Audit', nameAr: 'تدقيق مالي', price: 15000, description: 'Full annual financial audit' },
  { id: 'S4', nameEn: 'Zakat Advisory', nameAr: 'استشارات الزكاة', price: 1000, description: 'Consultation on Zakat calculation' },
  { id: 'S5', nameEn: 'CFO Advisory', nameAr: 'استشارات المدير المالي', price: 5000, description: 'Strategic financial planning' },
];

export const MOCK_PLANS: PricingPlan[] = [
  {
      id: 'basic',
      name: 'CR Guard (Basic)',
      price: 250,
      description: 'Dormant / Low-Activity CRs',
      tagline: '"Keep my CR Active"',
      features: ['Zero-filing VAT', 'Annual Qawaem (Basic)', 'Zakat "Estimated" Filing'],
      guarantee: 'Yes (Basic)',
      color: 'border-gray-200'
  },
  {
      id: 'standard',
      name: 'ZATCA Shield (Standard)',
      price: 1300,
      description: 'Active Shops / Cafes',
      tagline: '"No VAT Fines"',
      features: ['Quarterly VAT Filing', 'Monthly Bookkeeping', 'E-Invoicing Review'],
      guarantee: 'Yes (Full)',
      isPopular: true,
      color: 'border-primary-500'
  },
  {
      id: 'pro',
      name: 'Audit Proof (Pro)',
      price: 5000,
      description: 'Funded Startups / Contractors',
      tagline: '"CFO-Level Reporting"',
      features: ['Full Monthly Closing', 'Cost Center Accounting', 'Audit Coordination'],
      guarantee: 'Yes (Full)',
      color: 'border-gray-200'
  }
];

const EXPERT_BIOS = [
  "Certified CPA with over 10 years of experience in Saudi Tax Law and ZATCA compliance.",
  "Financial analyst specializing in retail sector growth strategies and bookkeeping.",
  "Former Big 4 auditor helping SMEs streamline their financial reporting.",
  "Zakat and Tax expert with a focus on manufacturing and logistics companies.",
  "Virtual CFO helping tech startups manage burn rate and fundraising preparation."
];

// Generate Clients
export const generateClients = (count: number): Client[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `C${i + 1}`,
    email: `client${i + 1}@example.com`,
    name: `Company ${i + 1} ${cities[i % cities.length]}`,
    role: 'CLIENT',
    companyName: `Company ${i + 1} LLC`,
    industry: industries[i % industries.length],
    totalSpent: Math.floor(Math.random() * 50000),
    zatcaStatus: zatcaStatuses[Math.floor(Math.random() * zatcaStatuses.length)],
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=C${i}&backgroundColor=e0f2fe`
  }));
};

// Generate Experts
export const generateExperts = (count: number): Expert[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `E${i + 1}`,
    email: `expert${i + 1}@example.com`,
    name: `Expert ${i + 1}`,
    role: 'EXPERT',
    specializations: [SERVICES[i % SERVICES.length].nameEn, SERVICES[(i + 1) % SERVICES.length].nameEn],
    status: i < 15 ? 'ACTIVE' : 'VETTING',
    totalEarned: 0, // Calculated dynamically from requests now
    rating: 4.5 + (Math.random() * 0.5), // High ratings
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Expert${i}`,
    bio: EXPERT_BIOS[i % EXPERT_BIOS.length],
    yearsExperience: 5 + Math.floor(Math.random() * 15),
    hourlyRate: 200 + Math.floor(Math.random() * 300),
    isPremium: i % 5 === 0, // Every 5th expert is Premium
    isFeatured: i % 3 === 0, // Every 3rd expert is Featured
  }));
};

// Generate Mock Batches
const generateBatches = (date: string): FileBatch[] => {
    const batches: FileBatch[] = [];
    const sources = ['WHATSAPP', 'DESKTOP', 'MOBILE_WEB', 'APP'] as const;
    
    // 50% chance of having a batch
    if (Math.random() > 0.5) {
        batches.push({
            id: date,
            date: date,
            status: 'COMPLETED',
            files: [
                { 
                    id: 'f1', 
                    name: 'Invoice_001.pdf', 
                    size: '1.2 MB', 
                    type: 'application/pdf', 
                    uploadedBy: 'CLIENT', 
                    uploadedAt: date + 'T10:00:00', 
                    url: '#',
                    source: sources[Math.floor(Math.random() * sources.length)]
                },
                { 
                    id: 'f2', 
                    name: 'Bank_Statement.csv', 
                    size: '450 KB', 
                    type: 'text/csv', 
                    uploadedBy: 'CLIENT', 
                    uploadedAt: date + 'T10:05:00', 
                    url: '#',
                    source: sources[Math.floor(Math.random() * sources.length)]
                }
            ]
        });
    }
    return batches;
}

// Generate Historical Requests (The Ledger Backfill)
const generateHistoricalRequests = (experts: Expert[], clients: Client[]): Request[] => {
    const requests: Request[] = [];
    let reqId = 2000;

    experts.forEach(expert => {
        // Only generate history for ACTIVE experts
        if (expert.status !== 'ACTIVE') return;

        // Target random lifetime earnings between 20k and 150k SAR for each expert
        const targetEarnings = 20000 + Math.floor(Math.random() * 130000);
        let currentEarnings = 0;

        // Keep creating jobs until we hit the target
        while(currentEarnings < targetEarnings) {
            const client = clients[Math.floor(Math.random() * clients.length)];
            const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
            
            // Random date in past 2 years (730 days)
            const daysAgo = Math.floor(Math.random() * 730) + 10; 
            const date = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

            // 80% chance of being settled if older than 30 days
            const isSettled = daysAgo > 30 && Math.random() > 0.2;
            const payoutId = isSettled ? 'WD-LEGACY' : undefined;

            requests.push({
                id: `REQ-${reqId++}`,
                clientId: client.id,
                clientName: client.companyName,
                serviceId: service.id,
                serviceName: service.nameEn,
                status: 'COMPLETED',
                amount: service.price,
                dateCreated: date,
                assignedExpertId: expert.id,
                expertName: expert.name,
                description: `Historical Service: ${service.nameEn}`,
                batches: [],
                payoutId: payoutId
            });

            // Expert gets 80%
            currentEarnings += (service.price * 0.8);
        }
    });

    return requests;
};

// Generate Recent/Active Requests
export const generateActiveRequests = (count: number, clients: Client[], experts: Expert[]): Request[] => {
  return Array.from({ length: count }).map((_, i) => {
    const client = clients[i % clients.length];
    const expert = experts[i % experts.length];
    const service = SERVICES[i % SERVICES.length];
    const status = statuses[i % statuses.length];
    const dateCreated = new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0]; // Recent
    
    // Some requests are NEW and unassigned (Marketplace logic)
    const isUnassigned = status === 'NEW';

    return {
      id: `REQ-${5000 + i}`, // Start IDs higher to separate from history
      clientId: client.id,
      clientName: client.companyName,
      serviceId: service.id,
      serviceName: service.nameEn,
      status: status,
      amount: service.price,
      dateCreated: dateCreated,
      assignedExpertId: isUnassigned ? undefined : expert.id,
      expertName: isUnassigned ? undefined : expert.name,
      description: `Request for ${service.nameEn} services regarding Q${(i % 4) + 1} financials.`,
      batches: generateBatches(dateCreated)
    };
  });
};

export const MOCK_ADMINS: Admin[] = [
  {
    id: 'ADMIN1',
    email: 'admin@finume.com',
    name: 'Super Admin',
    role: 'ADMIN',
    adminRole: 'SUPER_ADMIN',
    avatarUrl: 'https://ui-avatars.com/api/?name=Super+Admin&background=0ea5e9&color=fff'
  },
  {
    id: 'ADMIN2',
    email: 'finance@finume.com',
    name: 'Sarah Finance',
    role: 'ADMIN',
    adminRole: 'FINANCE',
    avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Finance&background=10b981&color=fff'
  },
  {
    id: 'ADMIN3',
    email: 'support@finume.com',
    name: 'John Support',
    role: 'ADMIN',
    adminRole: 'SUPPORT',
    avatarUrl: 'https://ui-avatars.com/api/?name=John+Support&background=f59e0b&color=fff'
  },
  {
    id: 'ADMIN4',
    email: 'sales@finume.com',
    name: 'Mike Sales',
    role: 'ADMIN',
    adminRole: 'SALES',
    avatarUrl: 'https://ui-avatars.com/api/?name=Mike+Sales&background=8b5cf6&color=fff'
  },
  {
    id: 'ADMIN5',
    email: 'experts@finume.com',
    name: 'Lisa Relations',
    role: 'ADMIN',
    adminRole: 'EXPERT_RELATIONS',
    avatarUrl: 'https://ui-avatars.com/api/?name=Lisa+Relations&background=ec4899&color=fff'
  }
];

export const MOCK_CLIENTS = generateClients(50);
export const MOCK_EXPERTS = generateExperts(20);

// Combine History and Recent
const history = generateHistoricalRequests(MOCK_EXPERTS, MOCK_CLIENTS);
const recent = generateActiveRequests(50, MOCK_CLIENTS, MOCK_EXPERTS);

export const MOCK_REQUESTS = [...history, ...recent].sort((a,b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
