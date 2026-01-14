
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
const USERS = [
  {
    id: 'ADMIN_MAIN',
    email: 'admin@finume.com',
    name: 'Main Admin',
    role: 'ADMIN',
    adminRole: 'SUPER_ADMIN',
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=0ea5e9&color=fff'
  },
  {
    id: 'EXPERT_MAIN',
    email: 'expert@finume.com',
    name: 'Main Expert',
    role: 'EXPERT',
    status: 'ACTIVE',
    specializations: JSON.stringify(['VAT', 'Audit']),
    bio: 'Senior Financial Expert',
    yearsExperience: 10,
    hourlyRate: 200,
    avatarUrl: 'https://ui-avatars.com/api/?name=Expert&background=10b981&color=fff'
  },
  {
    id: 'CLIENT_MAIN',
    email: 'client@finume.com',
    name: 'Business Owner',
    role: 'CLIENT',
    companyName: 'My Business Ltd',
    industry: 'Retail',
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
  const password = "12121212";

  // 1. CLEAN UP
  // We clean up everything to ensure fresh IDs and no stale data.
  try {
    console.log('Cleaning up database...');
    // Order matters due to foreign keys
    await prisma.fileBatch.deleteMany({}); // Delete FileBatches (depends on Request) - wait, Request depends on User/Plan/Service
    // Request -> Client(User), Service, Plan, Expert(User)
    // FileBatch -> Request
    // UploadedFile -> User, FileBatch...

    // Let's try to delete in order of dependency (Leafs first)
    await prisma.transaction.deleteMany({});
    await prisma.complianceLog.deleteMany({});
    await prisma.gamificationProfile.deleteMany({});
    await prisma.chatMessage.deleteMany({});
    await prisma.uploadedFile.deleteMany({});
    await prisma.fileBatch.deleteMany({});
    await prisma.request.deleteMany({});

    await prisma.clientFeaturePermissions.deleteMany({});
    await prisma.payoutRequest.deleteMany({});

    await prisma.user.deleteMany({});
    await prisma.pricingPlan.deleteMany({});
    // await prisma.service.deleteMany({}); // Optional, services are stable usually, but consistent to clear.

    console.log('Database cleaned.');
  } catch (e) {
    console.warn('Cleanup warning (non-fatal):', e);
  }

  // 2. SERVICES
  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }
  console.log('Services seeded.');

  // 3. PLANS (New IDs)
  for (const p of PLANS) {
    await prisma.pricingPlan.create({ // We can use create because we cleared table
      data: p
    });
  }
  console.log('Plans seeded.');

  // 4. USERS
  for (const u of USERS) {
    const {
      permissions, // separating out to ignore or handle separately if schema supported (it doesn't currently)
      companyName, industry, // Client props
      bio, specializations, yearsExperience, hourlyRate, // Expert props
      adminRole, // Admin props
      role,
      status, // Excluded from baseUser (not in User schema)
      ...baseUser
    } = u;

    console.log(`Seeding user ${baseUser.email}...`);

    await prisma.user.create({
      data: {
        ...baseUser,
        role: role,
        passwordHash: await require('bcryptjs').hash("12121212", 10), // Real hash for "12121212"
        // Correctly nest profile creation
        ...(role === 'CLIENT' ? {
          clientProfile: {
            create: {
              companyName,
              industry,
              billingAddress: 'Riyadh, KSA'
            }
          }
        } : {}),
        ...(role === 'EXPERT' ? {
          expertProfile: {
            create: {
              bio,
              yearsExperience,
              hourlyRate,
              specializations: specializations, // It's already JSON string in USERS array
              kycStatus: 'APPROVED'
            }
          }
        } : {}),
        ...(role === 'ADMIN' ? {
          adminProfile: {
            create: {
              adminLevel: 'OPS' // Defaulting to OPS since schema uses enum, USERS had string
            }
          }
        } : {})
      }
    });
  }
  console.log('Specific users seeded.');

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
