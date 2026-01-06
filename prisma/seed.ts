
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CONSTANTS (Mirrored from mockData.ts)
const SERVICES = [
  { id: 'S1', nameEn: 'VAT Filing', nameAr: 'إقرار ضريبة القيمة المضافة', price: 500, description: 'Complete VAT return filing with ZATCA' },
  { id: 'S2', nameEn: 'Bookkeeping (Monthly)', nameAr: 'مسك الدفاتر (شهري)', price: 2500, description: 'Monthly financial record keeping' },
  { id: 'S3', nameEn: 'Financial Audit', nameAr: 'تدقيق مالي', price: 15000, description: 'Full annual financial audit' },
  { id: 'S4', nameEn: 'Zakat Advisory', nameAr: 'استشارات الزكاة', price: 1000, description: 'Consultation on Zakat calculation' },
  { id: 'S5', nameEn: 'CFO Advisory', nameAr: 'استشارات المدير المالي', price: 5000, description: 'Strategic financial planning' },
];

const PLANS = [
  {
    id: 'basic',
    name: 'CR Guard (Basic)',
    price: 250,
    description: 'Dormant / Low-Activity CRs',
    tagline: '"Keep my CR Active"',
    features: JSON.stringify(['Zero-filing VAT', 'Annual Qawaem (Basic)', 'Zakat "Estimated" Filing']),
    guarantee: 'Yes (Basic)',
    color: 'border-gray-200'
  },
  {
    id: 'standard',
    name: 'ZATCA Shield (Standard)',
    price: 1300,
    description: 'Active Shops / Cafes',
    tagline: '"No VAT Fines"',
    features: JSON.stringify(['Quarterly VAT Filing', 'Monthly Bookkeeping', 'E-Invoicing Review']),
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
    features: JSON.stringify(['Full Monthly Closing', 'Cost Center Accounting', 'Audit Coordination']),
    guarantee: 'Yes (Full)',
    color: 'border-gray-200'
  }
];

const ADMINS = [
  { id: 'ADMIN1', email: 'admin@finume.com', name: 'Super Admin', role: 'ADMIN', adminRole: 'SUPER_ADMIN', avatarUrl: 'https://ui-avatars.com/api/?name=Super+Admin&background=0ea5e9&color=fff' },
  { id: 'ADMIN2', email: 'finance@finume.com', name: 'Sarah Finance', role: 'ADMIN', adminRole: 'FINANCE', avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Finance&background=10b981&color=fff' },
  { id: 'ADMIN3', email: 'support@finume.com', name: 'John Support', role: 'ADMIN', adminRole: 'SUPPORT', avatarUrl: 'https://ui-avatars.com/api/?name=John+Support&background=f59e0b&color=fff' },
  { id: 'ADMIN4', email: 'sales@finume.com', name: 'Mike Sales', role: 'ADMIN', adminRole: 'SALES', avatarUrl: 'https://ui-avatars.com/api/?name=Mike+Sales&background=8b5cf6&color=fff' },
  { id: 'ADMIN5', email: 'experts@finume.com', name: 'Lisa Relations', role: 'ADMIN', adminRole: 'EXPERT_RELATIONS', avatarUrl: 'https://ui-avatars.com/api/?name=Lisa+Relations&background=ec4899&color=fff' }
];

async function main() {
  console.log('Start seeding ...');
  const password = "12121212";

  // 1. SERVICES
  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }
  console.log('Services seeded.');

  // 2. PLANS
  for (const p of PLANS) {
    await prisma.pricingPlan.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }
  console.log('Plans seeded.');

  // 3. ADMINS
  for (const a of ADMINS) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: { password }, // Update password just in case
      create: {
        id: a.id,
        email: a.email,
        name: a.name,
        role: a.role,
        adminRole: a.adminRole,
        avatarUrl: a.avatarUrl,
        password: password
      }
    });
  }
  console.log('Admins seeded.');

  // 4. CLIENTS & EXPERTS (Generating manually to avoid importing frontend code)
  // CLIENTS
  const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca'];
  const industries = ['Retail', 'Services', 'Manufacturing', 'Tech', 'Healthcare'];
  for (let i = 0; i < 50; i++) {
    const id = `C${i + 1}`;
    const email = `client${i + 1}@example.com`;
    await prisma.user.upsert({
      where: { email },
      update: { password },
      create: {
        id,
        email,
        name: `Company ${i + 1} ${cities[i % cities.length]}`,
        role: 'CLIENT',
        companyName: `Company ${i + 1} LLC`,
        industry: industries[i % industries.length],
        totalSpent: Math.floor(Math.random() * 50000),
        zatcaStatus: ['GREEN', 'YELLOW', 'RED'][Math.floor(Math.random() * 3)],
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=C${i}&backgroundColor=e0f2fe`,
        password
      }
    });
  }
  console.log('Clients seeded.');

  // EXPERTS
  const expertBios = [
    "Certified CPA with over 10 years of experience in Saudi Tax Law and ZATCA compliance.",
    "Financial analyst specializing in retail sector growth strategies and bookkeeping.",
    "Former Big 4 auditor helping SMEs streamline their financial reporting.",
    "Zakat and Tax expert with a focus on manufacturing and logistics companies.",
    "Virtual CFO helping tech startups manage burn rate and fundraising preparation."
  ];
  for (let i = 0; i < 20; i++) {
    const id = `E${i + 1}`;
    const email = `expert${i + 1}@example.com`;
    await prisma.user.upsert({
      where: { email },
      update: { password },
      create: {
        id,
        email,
        name: `Expert ${i + 1}`,
        role: 'EXPERT',
        specializations: JSON.stringify(['VAT Compliance', 'Bookkeeping']), // Simplified
        status: i < 15 ? 'ACTIVE' : 'VETTING',
        // totalEarned calculated from requests usually, but seeding initial value
        totalEarned: 0,
        rating: 4.5 + (Math.random() * 0.5),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Expert${i}`,
        bio: expertBios[i % expertBios.length],
        yearsExperience: 5 + Math.floor(Math.random() * 15),
        hourlyRate: 200 + Math.floor(Math.random() * 300),
        isPremium: i % 3 === 0,
        isFeatured: i % 4 === 0,
        password
      }
    });
  }
  console.log('Experts seeded.');

  // 5. REQUESTS (Simplified generation)
  // We need to fetch clients and experts to link them correctly if IDs were auto-generated, 
  // but we forced IDs (C1, E1) so we can map easily.

  // Create some requests
  console.log('Seeding Requests...');
  // ... (Skipping complex request generation for brevity, but ensuring at least some exist)
  // Let's create one request for Client 1 and Expert 1
  await prisma.request.create({
    data: {
      clientId: 'C1',
      serviceId: 'S1',
      status: 'MATCHED',
      amount: 500,
      assignedExpertId: 'E1',
      description: 'Seeded Request for VAT Filing',
    }
  }).catch((e: any) => console.log('Request creation failed (might already exist or ID mismatch)', e.message));

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
