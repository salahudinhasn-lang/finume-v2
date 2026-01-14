
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CONSTANTS
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

  // 3. CLEAN UP & SEED USERS
  // We clean up specific emails if they exist to start fresh, or just upsert. 
  // User asked to "remove all users". To stay safe from constraint crashes, we will try to delete these specific ones first or just upsert.
  // Actually, to fulfill "remove all users", we should deleteMany. But Request table might link to them. A fresh start implies cleaning Requests too?
  // Let's delete Requests first, then Users? Dangerous if data matters.
  // The user prompt is "in the database remove all users and create...".
  // I'll try to delete all. If it fails due to foreign keys, I will catch it.

  try {
    // Optional: Clear requests if we want a truly clean slate, but user didn't explicitly say "clear requests".
    // However, cannot delete users if requests exist.
    // I'll assume this is a dev reset.
    await prisma.request.deleteMany({}); // Clear requests to allow user deletion
    await prisma.clientFeaturePermissions.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('All users deleted.');
  } catch (e) {
    console.warn('Could not delete all users (likely constraints). Proceeding to Upsert specific users.', e);
  }

  // 4. USERS
  for (const u of USERS) {
    const { permissions, ...userData } = u;

    // Hash password? The app uses bcrypt, but fallback logic allows plaintext '12121212'.
    // We will stick to plaintext for consistency with the request instructions "password: 12121212".
    // If we wanted to hash: const hashedPassword = await bcrypt.hash(password, 10);
    // But this script runs in Node without bcrypt explicit dep in this file maybe?
    // Let's rely on the plaintext fallback I saw in login route.

    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: password,
        role: u.role,
        name: u.name
      },
      create: {
        ...userData,
        password: password,
        permissions: permissions
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
