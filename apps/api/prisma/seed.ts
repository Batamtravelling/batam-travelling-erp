import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const permissions = [
  'lead.create', 'lead.read', 'lead.update', 'lead.assign', 'lead.convert',
  'customer.create', 'customer.read', 'customer.update', 'audit.read',
  'employee.read', 'employee.manage', 'project.read', 'project.manage',
  'task.read', 'task.manage', 'dashboard.owner',
  'booking.read', 'booking.manage', 'invoice.read',
  'payment.read', 'payment.manage', 'payment.verify',
  'package.read', 'package.create', 'package.update',
  'trip.read', 'trip.manage', 'assignment.manage',
  'archive.read', 'archive.manage',
  'content.read', 'content.manage',
  'asset.read', 'asset.manage', 'knowledge.read', 'knowledge.manage',
];

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'batam-travelling' },
    update: {},
    create: { name: 'Batam Travelling', slug: 'batam-travelling' },
  });
  const role = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Tenant Owner' } },
    update: {},
    create: { tenantId: tenant.id, name: 'Tenant Owner' },
  });
  for (const code of permissions) {
    const permission = await prisma.permission.upsert({ where: { code }, update: {}, create: { code } });
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, update: {},
      create: { roleId: role.id, permissionId: permission.id },
    });
  }
  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'owner@batamtravelling.local' } },
    update: {}, create: { tenantId: tenant.id, email: 'owner@batamtravelling.local', name: 'Tenant Owner' },
  });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });

  const customer = await prisma.customer.upsert({
    where: { tenantId_customerCode: { tenantId: tenant.id, customerCode: 'CUS-000001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      customerCode: 'CUS-000001',
      fullName: 'Rina Suryani',
      phone: '081234567890',
      email: 'rina@example.com',
      city: 'Batam',
      notes: 'Seeded customer',
    },
  });

  await prisma.lead.upsert({
    where: { tenantId_leadCode: { tenantId: tenant.id, leadCode: 'LEAD-000001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      leadCode: 'LEAD-000001',
      customerId: customer.id,
      source: 'Website',
      requirement: 'Family trip to Bintan',
      destination: 'Bintan',
      pax: 4,
      estimatedValue: 1200000,
      priority: 'HIGH',
      status: 'QUOTATION',
      notes: 'Seeded lead',
    },
  });

  const customerTwo = await prisma.customer.upsert({
    where: { tenantId_customerCode: { tenantId: tenant.id, customerCode: 'CUS-000002' } },
    update: {},
    create: {
      tenantId: tenant.id,
      customerCode: 'CUS-000002',
      fullName: 'Andi Pratama',
      phone: '081298765432',
      email: 'andi@example.com',
      city: 'Singapore',
      notes: 'Corporate / family seed customer',
    },
  });
  const customerThree = await prisma.customer.upsert({
    where: { tenantId_customerCode: { tenantId: tenant.id, customerCode: 'CUS-000003' } },
    update: {},
    create: {
      tenantId: tenant.id,
      customerCode: 'CUS-000003',
      fullName: 'Siti Rahma',
      phone: '081377788899',
      email: 'siti@example.com',
      city: 'Batam',
      notes: 'Repeat customer seed',
    },
  });

  const packageTemplates = [
    { packageCode: 'TPL-1D-REG', name: '1 Day Trip Regular', kind: 'REGULAR' as const, durationDays: 1, minPax: 6, maxPax: 20, customizable: false },
    { packageCode: 'TPL-1D-PRI', name: '1 Day Trip Private', kind: 'PRIVATE' as const, durationDays: 1, minPax: 1, maxPax: 12, customizable: true },
    { packageCode: 'TPL-2D1N', name: 'Paket 2D1N', kind: 'REGULAR' as const, durationDays: 2, minPax: 4, maxPax: 20, customizable: true },
    { packageCode: 'TPL-3D2N', name: 'Paket 3D2N', kind: 'REGULAR' as const, durationDays: 3, minPax: 4, maxPax: 20, customizable: true },
    { packageCode: 'TPL-4D3N', name: 'Paket 4D3N', kind: 'REGULAR' as const, durationDays: 4, minPax: 4, maxPax: 20, customizable: true },
    { packageCode: 'TPL-5D4N', name: 'Paket 5D4N', kind: 'REGULAR' as const, durationDays: 5, minPax: 4, maxPax: 20, customizable: true },
    { packageCode: 'TPL-CUSTOM', name: 'Custom Trip', kind: 'CUSTOM' as const, durationDays: 1, minPax: 1, maxPax: 50, customizable: true },
  ];
  for (const item of packageTemplates) await prisma.travelPackage.upsert({
    where: { tenantId_packageCode: { tenantId: tenant.id, packageCode: item.packageCode } }, update: {},
    create: { tenantId: tenant.id, ...item, category: 'TRIP', destination: 'Batam / Custom', description: 'Template paket. Lengkapi harga, fasilitas, itinerary, dan kebijakan sebelum diaktifkan.', status: 'DRAFT' },
  });

  const serviceProducts = [
    {productCode:'FRY-BTM-SIN',name:'Tiket Ferry Batam–Singapore PP',category:'FERRY',price:850000,unit:'pax',duration:'Pulang pergi',route:'Batam Centre → HarbourFront → Batam Centre',description:'Tiket ferry pulang-pergi dengan pilihan jadwal sesuai ketersediaan.',inclusions:'Tiket ferry pulang-pergi\nBagasi sesuai ketentuan operator',importantInfo:'Paspor wajib berlaku minimal 6 bulan.',featured:true},
    {productCode:'TRF-PORT-ONE',name:'Transfer Pelabuhan ke Hotel — One Way',category:'TRANSPORT',price:250000,unit:'vehicle',capacity:6,duration:'Sekali jalan',route:'Pelabuhan Batam → Hotel/Alamat Batam',description:'Mobil ber-AC dengan pengemudi untuk penjemputan satu arah.',inclusions:'Mobil dan driver\nBBM\nParkir pelabuhan',featured:true},
    {productCode:'TRF-2WAY',name:'Transportasi 2 Way Titik A–B',category:'TRANSPORT',price:475000,unit:'vehicle',capacity:6,duration:'Dua kali transfer',route:'Titik A ↔ Titik B',description:'Antar dan jemput kembali pada waktu yang disepakati.',inclusions:'Mobil dan driver\nBBM',featured:true},
    {productCode:'CAR-FULLDAY',name:'Sewa Mobil + Driver Full Day',category:'TRANSPORT',price:850000,unit:'vehicle',capacity:6,duration:'10 jam',route:'Area Batam',description:'Kendaraan dan driver untuk aktivitas harian di area Batam.',inclusions:'Mobil\nDriver\nBBM',importantInfo:'Overtime dihitung per jam.',featured:true},
    {productCode:'ATR-JETSKI',name:'Jet Ski Experience',category:'ATTRACTION',price:450000,unit:'session',capacity:2,duration:'15 menit',route:'Pantai Nongsa',description:'Pengalaman jetski dengan instruktur dan perlengkapan keselamatan.',inclusions:'Jet ski\nLife jacket\nInstruktur',featured:true},
    {productCode:'ATR-BANANA',name:'Banana Boat',category:'ATTRACTION',price:150000,unit:'pax',capacity:6,duration:'15 menit',route:'Pantai Nongsa',description:'Aktivitas banana boat untuk keluarga atau grup.',inclusions:'Life jacket\nPemandu aktivitas',featured:true},
    {productCode:'ATR-SNORKEL',name:'Snorkeling Batam',category:'ATTRACTION',price:350000,unit:'pax',duration:'3 jam',route:'Pulau sekitar Batam',description:'Snorkeling dengan peralatan dan pendamping.',inclusions:'Masker dan snorkel\nLife jacket\nBoat sharing\nPendamping',featured:true},
    {productCode:'MEAL-LUNCH',name:'Makan Siang Wisata',category:'MEAL',price:85000,unit:'pax',description:'Menu makan siang di restoran rekanan.',inclusions:'1 kali makan\nAir mineral',featured:true},
    {productCode:'DOC-VIDEO',name:'Dokumentasi Foto & Video Trip',category:'DOCUMENTATION',price:750000,unit:'booking',duration:'Sesuai durasi trip',description:'Dokumentasi perjalanan dan video highlight singkat.',inclusions:'Foto digital\nVideo highlight 60–90 detik',featured:true},
    {productCode:'DOC-DRONE',name:'Dokumentasi Drone',category:'DOCUMENTATION',price:1200000,unit:'session',duration:'Maksimal 2 jam',description:'Pengambilan gambar udara sesuai kondisi cuaca dan izin lokasi.',inclusions:'Pilot drone\nFootage terpilih\nVideo edit pendek',importantInfo:'Pelaksanaan bergantung cuaca dan izin terbang.',featured:true},
  ];
  for(const item of serviceProducts)await prisma.serviceProduct.upsert({where:{tenantId_productCode:{tenantId:tenant.id,productCode:item.productCode}},update:{...item,active:true},create:{tenantId:tenant.id,...item,active:true,requiresDate:true}});

  const trips = [
    { bookingCode: 'BKG-000001', packageName: '3H2M Batam - Singapore', travelDate: new Date('2026-08-15'), pax: 4, totalAmount: 6800000, paidAmount: 3400000, status: 'PARTIALLY_PAID' as const, customerId: customer.id, source: 'WEBSITE' as const, notes: 'Family demo booking' },
    { bookingCode: 'BKG-000002', packageName: '2D1N Batam - Bintan Premium', travelDate: new Date('2026-08-18'), pax: 6, totalAmount: 9600000, paidAmount: 9600000, status: 'CONFIRMED' as const, customerId: customerTwo.id, source: 'SALES' as const, notes: 'Premium family trip' },
    { bookingCode: 'BKG-000003', packageName: '1 Day Island Hopping', travelDate: new Date('2026-08-21'), pax: 10, totalAmount: 5500000, paidAmount: 1500000, status: 'PENDING_PAYMENT' as const, customerId: customerThree.id, source: 'POS' as const, notes: 'Group outgoing trip' },
  ];
  for (const t of trips) {
    const booking = await prisma.booking.upsert({
      where: { tenantId_bookingCode: { tenantId: tenant.id, bookingCode: t.bookingCode } },
      update: { packageName: t.packageName, travelDate: t.travelDate, pax: t.pax, totalAmount: t.totalAmount, paidAmount: t.paidAmount, status: t.status, notes: t.notes },
      create: {
        tenantId: tenant.id,
        bookingCode: t.bookingCode,
        customerId: t.customerId,
        source: t.source,
        packageName: t.packageName,
        travelDate: t.travelDate,
        pax: t.pax,
        totalAmount: t.totalAmount,
        paidAmount: t.paidAmount,
        status: t.status,
        notes: t.notes,
      },
    });
    await prisma.invoice.upsert({
      where: { tenantId_invoiceNumber: { tenantId: tenant.id, invoiceNumber: `INV-${t.bookingCode.slice(-6)}` } },
      update: { totalAmount: t.totalAmount, paidAmount: t.paidAmount },
      create: {
        tenantId: tenant.id,
        invoiceNumber: `INV-${t.bookingCode.slice(-6)}`,
        bookingId: booking.id,
        customerId: t.customerId,
        totalAmount: t.totalAmount,
        paidAmount: t.paidAmount,
        status: t.paidAmount >= t.totalAmount ? 'PAID' : t.paidAmount > 0 ? 'PARTIALLY_PAID' : 'ISSUED',
      },
    });
  }

  const projects = [
    { code: 'PRJ-DEMO-001', name: '2026 High Season Campaign', description: 'Campaign, CRM follow-up, and package production workstream.', status: 'ACTIVE' as const },
    { code: 'PRJ-DEMO-002', name: 'August Operations Trips', description: 'Operational planning for confirmed departures.', status: 'ACTIVE' as const },
    { code: 'PRJ-DEMO-003', name: 'Finance Closing & Collections', description: 'Collections, vendor bills, and month-end review.', status: 'PLANNED' as const },
  ];
  const createdProjects: any[] = [];
  for (const project of projects) {
    const row = await prisma.project.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: project.code } },
      update: { name: project.name, description: project.description, status: project.status },
      create: { tenantId: tenant.id, code: project.code, name: project.name, description: project.description, status: project.status },
    });
    createdProjects.push(row);
  }

  const tasks = [
    { projectId: createdProjects[0].id, title: 'Prepare 10 package templates', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, progress: 60, dueDate: new Date('2026-08-16'), assigneeId: user.id, notes: 'Need regular and premium variations.' },
    { projectId: createdProjects[0].id, title: 'Update website preview cards', status: 'TODO' as const, priority: 'NORMAL' as const, progress: 10, dueDate: new Date('2026-08-17'), assigneeId: user.id, notes: 'Preview landing page with dummy data.' },
    { projectId: createdProjects[1].id, title: 'Confirm trip assignments', status: 'BLOCKED' as const, priority: 'HIGH' as const, progress: 40, dueDate: new Date('2026-08-19'), assigneeId: user.id, notes: 'Waiting on driver availability.' },
    { projectId: createdProjects[1].id, title: 'Collect passenger list', status: 'IN_PROGRESS' as const, priority: 'URGENT' as const, progress: 75, dueDate: new Date('2026-08-18'), assigneeId: user.id, notes: 'Need child and infant split.' },
    { projectId: createdProjects[2].id, title: 'Review outstanding invoices', status: 'TODO' as const, priority: 'HIGH' as const, progress: 0, dueDate: new Date('2026-08-20'), assigneeId: user.id, notes: 'Collections focus.' },
  ];
  for (const task of tasks) {
    const existing = await prisma.task.findFirst({ where: { tenantId: tenant.id, projectId: task.projectId, title: task.title } });
    const row = existing ?? await prisma.task.create({
      data: {
        tenantId: tenant.id,
        projectId: task.projectId,
        title: task.title,
        status: task.status,
        priority: task.priority,
        progress: task.progress,
        dueDate: task.dueDate,
        assigneeId: task.assigneeId,
        description: task.notes,
      },
    });
    if (row && task.status !== 'TODO') {
      await prisma.taskComment.create({
        data: {
          tenantId: tenant.id,
          taskId: row.id,
          authorId: user.id,
          type: task.status === 'IN_PROGRESS' ? 'STATUS_CHANGE' : 'NOTE',
          message: `Seed template: ${task.title}`,
          statusTo: task.status,
        },
      }).catch(() => undefined);
    }
  }

  const packageNames = [
    '3H2M Batam - Singapore',
    '2D1N Batam - Bintan Premium',
    '1 Day Island Hopping',
    'Singapore City Tour',
    'Sentosa Family Escape',
    'Johor Bahru Shopping Trip',
    'Weekend Batam Relax',
    'Corporate Team Building',
    'Anniversary Private Trip',
    'Custom Luxury Trip',
  ];
  const priceMap = [1250000, 1890000, 850000, 1450000, 2100000, 1650000, 980000, 2750000, 3200000, 4500000];
  for (let i = 0; i < packageNames.length; i++) {
    const code = `TPL-DEMO-${String(i + 1).padStart(3, '0')}`;
    await prisma.travelPackage.upsert({
      where: { tenantId_packageCode: { tenantId: tenant.id, packageCode: code } },
      update: {
        name: packageNames[i],
        destination: i < 3 ? 'Batam / Singapore / Bintan' : i < 6 ? 'Singapore' : i < 8 ? 'Batam' : 'Private Destinations',
        serviceLevel: i % 2 === 0 ? 'REGULAR' : 'PREMIUM',
        adultPrice: priceMap[i],
        childPrice: Math.round(priceMap[i] * 0.75),
        infantPrice: Math.round(priceMap[i] * 0.15),
        status: 'ACTIVE',
        customizable: i >= 6,
      },
      create: {
        tenantId: tenant.id,
        packageCode: code,
        name: packageNames[i],
        category: 'TRIP',
        kind: i % 3 === 0 ? 'REGULAR' : i % 3 === 1 ? 'PRIVATE' : 'CUSTOM',
        destination: i < 3 ? 'Batam / Singapore / Bintan' : i < 6 ? 'Singapore' : i < 8 ? 'Batam' : 'Private Destinations',
        durationDays: i < 2 ? 1 : i < 5 ? 2 : i < 8 ? 3 : 4,
        description: `Template paket demo ${i + 1}`,
        publicDescription: `Preview package ${packageNames[i]}`,
        included: 'Ferry / transport / guide sesuai paket',
        excluded: 'Personal expenses',
        meetingPoint: 'Batam Center / sesuai konfirmasi',
        importantInfo: 'Template demo untuk preview produk.',
        serviceLevel: i % 2 === 0 ? 'REGULAR' : 'PREMIUM',
        adultPrice: priceMap[i],
        childPrice: Math.round(priceMap[i] * 0.75),
        infantPrice: Math.round(priceMap[i] * 0.15),
        status: 'ACTIVE',
        customizable: i >= 6,
        minPax: i >= 8 ? 2 : 4,
        maxPax: i >= 8 ? 12 : 25,
      },
    });
  }

  await prisma.companyProfile.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      vision: 'Menjadi partner perjalanan terpercaya dari Batam.',
      mission: 'Memberikan perjalanan yang aman, transparan, dan berkesan.',
      websiteLogoUrl: '',
      erpLogoUrl: '',
      documentLogoUrl: '',
      heroTitle: 'Liburan terbaik dimulai dari Batam.',
      heroSubtitle: 'Booking perjalanan lebih cepat, rapi, dan nyaman untuk pelanggan.',
      heroBadge: 'Perjalanan modern yang praktis',
      heroCtaPrimary: 'Lihat Open Trip',
      heroCtaSecondary: 'Cara Booking',
      featureHeadline: 'Semua kebutuhan perjalanan tersusun rapi',
      featureText: 'Paket, jadwal, harga, dan detail perjalanan tampil dalam satu pengalaman yang mudah dibaca.',
      howToBookTitle: 'Booking perjalanan dibuat lebih ringkas',
      howToBookText: 'Lihat detail, pilih jadwal, isi data, lalu siap berangkat.',
      aboutTitle: 'Perjalanan yang tertata, pengalaman yang terasa premium.',
      aboutText: 'Kami membantu keluarga, komunitas, dan perusahaan menikmati perjalanan yang lebih mudah dipahami, lebih cepat dipesan, dan lebih nyaman dijalankan.',
      whatsappNumber: '6281234567890',
      whatsappNumberSecondary: '6281234567891',
      contactEmail: 'hello@batamtravelling.com',
      contactAddress: 'Batam, Kepulauan Riau',
      contactHours: 'Senin–Sabtu, 09.00–18.00 WIB',
      instagramUrl: 'https://instagram.com/batamtravelling',
      facebookUrl: 'https://facebook.com/batamtravelling',
      tiktokUrl: 'https://tiktok.com/@batamtravelling',
      youtubeUrl: 'https://youtube.com/@batamtravelling',
    } as any,
  });

  console.log(JSON.stringify({ tenantId: tenant.id, userId: user.id }, null, 2));
}
main().finally(() => prisma.$disconnect());
