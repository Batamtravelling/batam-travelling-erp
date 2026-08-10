import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const tenantSlug = 'batam-travelling';
const image = (name) => `http://localhost:3000/${name}`;

async function main() {
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { slug: tenantSlug } });
  const sales = await prisma.user.findFirstOrThrow({ where: { tenantId: tenant.id, email: 'sari.sales@demo.local' } });

  const packageRow = await prisma.travelPackage.findFirstOrThrow({
    where: { tenantId: tenant.id, packageCode: 'PKG-DEMO-SG-3D2N' },
  });

  const gallery = [
    { sortOrder: 0, imageUrl: image('trip-placeholder.svg'), caption: 'Singapore skyline' },
    { sortOrder: 1, imageUrl: image('trip-placeholder.svg'), caption: 'Marina Bay at night' },
    { sortOrder: 2, imageUrl: image('trip-placeholder.svg'), caption: 'Family trip moments' },
  ];
  for (const item of gallery) {
    await prisma.packageGallery.upsert({
      where: { id: `${packageRow.id}-${item.sortOrder}` },
      update: { imageUrl: item.imageUrl, caption: item.caption, sortOrder: item.sortOrder },
      create: { id: `${packageRow.id}-${item.sortOrder}`, tenantId: tenant.id, packageId: packageRow.id, ...item },
    }).catch(async () => {
      const found = await prisma.packageGallery.findFirst({ where: { packageId: packageRow.id, sortOrder: item.sortOrder } });
      if (!found) {
        await prisma.packageGallery.create({ data: { tenantId: tenant.id, packageId: packageRow.id, ...item } });
      }
    });
  }

  const articles = [
    {
      slug: 'panduan-open-trip-singapore-3d2n',
      title: 'Panduan Open Trip Singapore 3D2N',
      excerpt: 'Persiapan, itinerary, dan tips perjalanan Singapore dari Batam.',
      content:
        'Open Trip Singapore cocok untuk keluarga, pasangan, dan komunitas. Siapkan paspor, datang tepat waktu di meeting point, dan ikuti arahan tour leader.\n\nPaket demo ini mencakup ferry, hotel, transportasi, dan itinerary utama.\n\nGunakan paket ini sebagai referensi preview publik sebelum konten final dipublikasikan.',
      coverImage: image('trip-placeholder.svg'),
    },
    {
      slug: 'tips-booking-private-trip-batam',
      title: 'Tips Booking Private Trip Batam',
      excerpt: 'Cara memilih private trip, reguler, dan premium agar perjalanan lebih nyaman.',
      content:
        'Private trip cocok untuk keluarga kecil, honeymoon, dan agenda fleksibel. Pilih paket berdasarkan durasi, jumlah peserta, dan kebutuhan kendaraan.\n\nWebsite kini dapat menampilkan artikel dengan gambar, relasi paket, dan preview konten yang lebih hidup.',
      coverImage: image('trip-placeholder.svg'),
    },
  ];

  for (const art of articles) {
    const article = await prisma.article.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: art.slug } },
      update: { title: art.title, excerpt: art.excerpt, content: art.content, coverImage: art.coverImage, status: 'PUBLISHED', publishedAt: new Date(), authorId: sales.id },
      create: { tenantId: tenant.id, slug: art.slug, title: art.title, excerpt: art.excerpt, content: art.content, coverImage: art.coverImage, status: 'PUBLISHED', publishedAt: new Date(), authorId: sales.id },
    });
    await prisma.articlePackage.upsert({
      where: { articleId_packageId: { articleId: article.id, packageId: packageRow.id } },
      update: {},
      create: { articleId: article.id, packageId: packageRow.id },
    });
  }

  const products = await prisma.serviceProduct.findMany({ where: { tenantId: tenant.id } });
  for (const product of products) {
    if (!product.imageUrl) {
      await prisma.serviceProduct.update({ where: { id: product.id }, data: { imageUrl: image('trip-placeholder.svg') } });
    }
  }

  console.log(JSON.stringify({ tenant: tenant.slug, packages: 1, articles: articles.length, products: products.length }, null, 2));
}

main().finally(() => prisma.$disconnect());
