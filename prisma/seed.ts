
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();

// CONSTANTS (Mirrored from mockData.ts)
const SERVICES = [
  { id: 'S1', nameEn: 'VAT Filing', nameAr: 'إقرار ضريبة القيمة المضافة', basePrice: 500, description: 'Complete VAT return filing with ZATCA', slug: 'vat-filing', type: 'RECURRING', isActive: true },
  { id: 'S2', nameEn: 'Bookkeeping (Monthly)', nameAr: 'مسك الدفاتر (شهري)', basePrice: 2500, description: 'Monthly financial record keeping', slug: 'bookkeeping', type: 'RECURRING', isActive: true },
  { id: 'S3', nameEn: 'Financial Audit', nameAr: 'تدقيق مالي', basePrice: 15000, description: 'Full annual financial audit', slug: 'audit', type: 'ONE_TIME', isActive: true },
  { id: 'S4', nameEn: 'Zakat Advisory', nameAr: 'استشارات الزكاة', basePrice: 1000, description: 'Consultation on Zakat calculation', slug: 'zakat', type: 'ONE_TIME', isActive: true },
  { id: 'S5', nameEn: 'CFO Advisory', nameAr: 'استشارات المدير المالي', basePrice: 5000, description: 'Strategic financial planning', slug: 'cfo', type: 'RECURRING', isActive: true },
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
  const passwordHash = await bcrypt.hash(password, 10);

  // 1. SERVICES
  for (const s of SERVICES) {
    await db.service.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }
  console.log('Services seeded.');

  // 2. PLANS
  for (const p of PLANS) {
    await db.pricingPlan.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }
  console.log('Plans seeded.');

  // 3. ADMINS
  for (const a of ADMINS) {
    // Map seed adminRole to schema AdminLevel or User Role
    let userRole = a.role;
    let adminLevel = 'OPS'; // Default

    if (a.adminRole === 'SUPER_ADMIN') {
      userRole = 'SUPER_ADMIN';
      adminLevel = 'OPS'; // Super admin has all access
    } else if (a.adminRole === 'FINANCE') {
      adminLevel = 'FINANCE';
    } else {
      adminLevel = 'OPS';
    }

    const userData = {
      id: a.id,
      email: a.email,
      name: a.name,
      role: userRole,
      // avatarUrl: a.avatarUrl, // Skipped as not in schema
      passwordHash: passwordHash
    };

    // Create User
    await db.user.upsert({
      where: { email: a.email },
      update: { passwordHash: passwordHash },
      create: {
        ...userData,
        adminProfile: (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') ? {
          create: {
            adminLevel: adminLevel
          }
        } : undefined
      }
    });
  }
  console.log('Admins seeded.');

  // 4. CLIENTS & EXPERTS
  console.log('Skipping fake client/expert generation to keep DB clean.');

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
