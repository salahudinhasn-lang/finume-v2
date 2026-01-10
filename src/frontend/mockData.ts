
import { Client, Expert, Request, Transaction, Service, Admin, PricingPlan, FileBatch } from './types';

// Generators
const industries = ['Retail', 'Services', 'Manufacturing', 'Tech', 'Healthcare'];
const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca'];
const statuses = ['NEW', 'MATCHED', 'IN_PROGRESS', 'REVIEW_CLIENT', 'REVIEW_ADMIN', 'COMPLETED', 'CANCELLED'] as const;
const zatcaStatuses = ['GREEN', 'YELLOW', 'RED'] as const;

export const SERVICES: Service[] = [
  { id: 'SERV-00001', nameEn: 'VAT Filing', nameAr: 'إقرار ضريبة القيمة المضافة', price: 500, description: 'Complete VAT return filing with ZATCA' },
  { id: 'SERV-00002', nameEn: 'Bookkeeping (Monthly)', nameAr: 'مسك الدفاتر (شهري)', price: 2500, description: 'Monthly financial record keeping' },
  { id: 'SERV-00003', nameEn: 'Financial Audit', nameAr: 'تدقيق مالي', price: 15000, description: 'Full annual financial audit' },
  { id: 'SERV-00004', nameEn: 'Zakat Advisory', nameAr: 'استشارات الزكاة', price: 1000, description: 'Consultation on Zakat calculation' },
  { id: 'SERV-00005', nameEn: 'CFO Advisory', nameAr: 'استشارات المدير المالي', price: 5000, description: 'Strategic financial planning' },
  { id: 'SERV-SUBSCRIPTION', nameEn: 'Plan Subscription', nameAr: 'اشتراك باقة', price: 0, description: 'Recurring Plan Subscription' },
];

export const MOCK_PLANS: PricingPlan[] = [
  {
    id: 'PLAN-00001',
    name: 'CR Guard',
    price: 500,
    description: 'Dormant or pre-revenue CRs',
    tagline: '"Keep my legal status active"',
    features: ['Zero-filing VAT', 'Basic Annual Qawaem', 'Zakat Est. Filing'],
    guarantee: 'Basic Compliance',
    color: 'border-slate-200',
    limits: {
      revenue: { label: '< 375k SAR', value: 375000 },
      transactions: { label: '< 50 / mo', value: 50 },
      invoices: { label: '< 5 / mo', value: 5 },
      bills: { label: '< 10 / mo', value: 10 },
      bankAccounts: { label: '1 Account', value: 1 },
      employees: { label: 'None', value: 0 },
      features: { international: false, stock: 'Basic', contracts: false }
    }
  },
  {
    id: 'PLAN-00002',
    name: 'ZATCA Shield',
    price: 1750,
    description: 'Active shops, cafes, and service businesses',
    tagline: '"Avoid fines & stay compliant"',
    features: ['Quarterly VAT Filing', 'Monthly Bookkeeping', 'E-Invoicing Review', 'Payroll (GOSI)'],
    guarantee: 'Fine Protection (100%)',
    isPopular: true,
    color: 'border-blue-500',
    limits: {
      revenue: { label: '< 5M SAR', value: 5000000 },
      transactions: { label: 'Up to 300 / mo', value: 300 },
      invoices: { label: 'Unlimited', value: 9999 },
      bills: { label: 'Up to 100', value: 100 },
      bankAccounts: { label: 'Up to 3', value: 3 },
      employees: { label: 'Up to 10', value: 10 },
      features: { international: 'Basic', stock: 'Basic', contracts: 'Basic' }
    }
  },
  {
    id: 'PLAN-00003',
    name: 'Audit Proof',
    price: 5000,
    description: 'Funded startups & Government contractors',
    tagline: '"CFO-level governance"',
    features: ['Monthly Closing', 'Cost Accounting', 'Audit Coordination', 'Full Payroll & HR'],
    guarantee: 'Audit Defense Support',
    color: 'border-purple-500',
    limits: {
      revenue: { label: 'Unlimited', value: 99999999 },
      transactions: { label: 'Unlimited', value: 9999 },
      invoices: { label: 'Unlimited', value: 9999 },
      bills: { label: 'Unlimited', value: 9999 },
      bankAccounts: { label: 'Unlimited', value: 99 },
      employees: { label: 'Unlimited', value: 999 },
      features: { international: true, stock: 'Full', contracts: true }
    }
  }
];

const EXPERT_BIOS = [
  "Certified CPA with over 10 years of experience in Saudi Tax Law and ZATCA compliance.",
  "Financial analyst specializing in retail sector growth strategies and bookkeeping.",
  "Former Big 4 auditor helping SMEs streamline their financial reporting.",
  "Zakat and Tax expert with a focus on manufacturing and logistics companies.",
  "Virtual CFO helping tech startups manage burn rate and fundraising preparation."
];

const FINANCE_SKILLS = [
  "VAT Compliance", "Zakat Filing", "Bookkeeping", "Financial Modeling",
  "Auditing", "CFO Advisory", "Corporate Tax", "Payroll Management",
  "Cost Accounting", "Feasibility Studies", "Risk Management", "M&A Advisory"
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
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=C${i}&backgroundColor=e0f2fe`,
    gamification: {
      totalPoints: Math.floor(Math.random() * 500),
      totalStars: Math.floor(Math.random() * 50),
      currentStreak: Math.floor(Math.random() * 10),
      level: ['Bronze', 'Silver', 'Gold', 'Platinum'][Math.floor(Math.random() * 4)] as any
    }
  }));
};

// Generate Experts
export const generateExperts = (count: number): Expert[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `E${i + 1}`,
    email: `expert${i + 1}@example.com`,
    name: `Expert ${i + 1}`,
    role: 'EXPERT',
    specializations: [
      FINANCE_SKILLS[i % FINANCE_SKILLS.length],
      FINANCE_SKILLS[(i + 3) % FINANCE_SKILLS.length]
    ],
    status: i < 15 ? 'ACTIVE' : 'VETTING',
    totalEarned: 0, // Calculated dynamically from requests now
    rating: 4.5 + (Math.random() * 0.5), // High ratings
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Expert${i}`,
    bio: EXPERT_BIOS[i % EXPERT_BIOS.length],
    yearsExperience: 5 + Math.floor(Math.random() * 15),
    hourlyRate: 200 + Math.floor(Math.random() * 300),
    isPremium: i % 3 === 0, // Increased frequency: Every 3rd is Premium
    isFeatured: i % 4 === 0, // Every 4th is Featured
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
    while (currentEarnings < targetEarnings) {
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

// Combine History and Recent
export const MOCK_CLIENTS: Client[] = [];
export const MOCK_EXPERTS: Expert[] = [];
export const MOCK_REQUESTS: Request[] = [];
