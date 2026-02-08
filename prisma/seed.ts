
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CONSTANTS
const SERVICES = [
  { id: 'S1', nameEn: 'VAT Filing', nameAr: 'إقرار ضريبة القيمة المضافة', basePrice: 500, slug: 'vat-filing', type: 'RECURRING', description: 'Complete VAT return filing with ZATCA' },
  { id: 'S2', nameEn: 'Bookkeeping (Monthly)', nameAr: 'مسك الدفاتر (شهري)', basePrice: 2500, slug: 'monthly-bookkeeping', type: 'RECURRING', description: 'Monthly financial record keeping' },
  { id: 'S3', nameEn: 'Financial Audit', nameAr: 'تدقيق مالي', basePrice: 15000, slug: 'financial-audit', type: 'ONE_TIME', description: 'Full annual financial audit' },
  { id: 'S4', nameEn: 'Zakat Advisory', nameAr: 'استشارات الزكاة', basePrice: 1000, slug: 'zakat-advisory', type: 'ONE_TIME', description: 'Consultation on Zakat calculation' },
  { id: 'S5', nameEn: 'CFO Advisory', nameAr: 'استشارات المدير المالي', basePrice: 5000, slug: 'cfo-advisory', type: 'RECURRING', description: 'Strategic financial planning' },
];

const PLANS = [
  {
    id: 'PLAN-0001',
    name: 'CR Guard',
    price: 500,
    description: 'Dormant / Low-Activity CRs',
    tagline: '"Keep my CR Active"',
    features: JSON.stringify(['Zero-filing VAT', 'Annual Qawaem (Basic)', 'Zakat "Estimated" Filing']),
    guarantee: 'Yes (Basic)',
    color: 'border-gray-200'
  },
  {
    id: 'PLAN-0002',
    name: 'ZATCA Shield',
    price: 1300,
    description: 'Active Shops / Cafes',
    tagline: '"No VAT Fines"',
    features: JSON.stringify(['Quarterly VAT Filing', 'Monthly Bookkeeping', 'E-Invoicing Review']),
    guarantee: 'Yes (Full)',
    isPopular: true,
    color: 'border-primary-500'
  },
  {
    id: 'PLAN-0003',
    name: 'Audit Proof',
    price: 5000,
    description: 'Funded Startups / Contractors',
    tagline: '"CFO-Level Reporting"',
    features: JSON.stringify(['Full Monthly Closing', 'Cost Center Accounting', 'Audit Coordination']),
    guarantee: 'Yes (Full)',
    color: 'border-gray-200'
  }
];

// USERS TO SEED
const ADMINS = [
  {
    id: 'adm-000001',
    email: 'admin@finume.com',
    name: 'Main Admin',
    role: 'ADMIN',
    adminLevel: 'OPS', // Valid enum value
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=0ea5e9&color=fff'
  }
];

const EXPERTS = [
  {
    id: 'exp-000001',
    email: 'expert@finume.com',
    name: 'Main Expert',
    role: 'EXPERT',
    specializations: JSON.stringify(['VAT', 'Audit']),
    bio: 'Senior Financial Expert',
    yearsExperience: 10,
    hourlyRate: 200,
    avatarUrl: 'https://ui-avatars.com/api/?name=Expert&background=10b981&color=fff',
    kycStatus: 'APPROVED'
  }
];

const CLIENTS = [
  {
    id: 'cus-000001',
    email: 'client@finume.com',
    name: 'Aly Al Mohsen',
    jobTitle: 'CEO',
    mobileNumber: '+966 555555555',
    role: 'CLIENT',
    companyName: 'Ayen Platform',
    industry: 'General',
    website: 'https://',
    foundedYear: 'YYYY',
    crNumber: '1010...',
    vatNumber: '3...',
    nationalAddress: 'Building, Street, District...',
    legalStructure: 'LLC',
    avatarUrl: 'https://ui-avatars.com/api/?name=Client&background=f59e0b&color=fff',
    // Default Permissions
    permissions: {
      create: {
        canViewReports: true,
        canUploadDocs: true,
        canDownloadInvoices: true,
        canRequestCalls: true,
        canSubmitTickets: true,
        canViewMarketplace: true
      }
    }
  }
];

async function main() {
  console.log('Start seeding ...');
  // Hash for "12121212"
  const passwordHash = await require('bcryptjs').hash("12121212", 10);

  // 1. CLEAN UP - DISABLED TO PREVENT WIPING PROD DATA
  /*
  try {
    console.log('Cleaning up database...');
    await prisma.transaction.deleteMany({});
    await prisma.complianceLog.deleteMany({});
    await prisma.gamificationProfile.deleteMany({});
    await prisma.chatMessage.deleteMany({});
    await prisma.uploadedFile.deleteMany({});
    await prisma.fileBatch.deleteMany({});
    await prisma.request.deleteMany({});
    await prisma.clientFeaturePermissions.deleteMany({});
    await prisma.payoutRequest.deleteMany({});
    await prisma.teamMember.deleteMany({});

    // Delete Users (Cascades to profiles)
    await prisma.user.deleteMany({});
    // await prisma.admin.deleteMany({}); // Optional if cascade works
    // await prisma.expert.deleteMany({});
    // await prisma.client.deleteMany({});

    await prisma.pricingPlan.deleteMany({});
    // await prisma.service.deleteMany({}); 

    console.log('Database cleaned.');
  } catch (e) {
    console.warn('Cleanup warning:', e);
  }
  */

  // 2. SERVICES
  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }
  console.log('Services seeded.');

  // 3. PLANS
  for (const p of PLANS) {
    await prisma.pricingPlan.create({ data: p });
  }
  console.log('Plans seeded.');

  // 4. ADMINS
  for (const a of ADMINS) {
    console.log(`Seeding admin ${a.email}...`);
    // 1. Create User
    await prisma.user.create({
      data: {
        id: a.id,
        email: a.email,
        name: a.name,
        passwordHash,
        role: 'ADMIN',
        avatarUrl: a.avatarUrl,
        adminProfile: {
          create: {
            adminLevel: a.adminLevel
          }
        }
      }
    });
  }

  // 5. EXPERTS - REMOVED FOR CLEAN START
  // for (const e of EXPERTS) { ... }

  // 6. CLIENTS - REMOVED FOR CLEAN START
  // for (const c of CLIENTS) { ... }

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
