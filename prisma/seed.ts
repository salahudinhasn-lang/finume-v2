
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

  // 4. CLIENTS & EXPERTS
  console.log('Skipping fake client/expert generation to keep DB clean.');

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
