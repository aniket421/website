/**
 * Idempotent seed. Safe to run repeatedly: every write is an upsert keyed on a
 * natural unique column, so re-running never duplicates rows and never clobbers
 * edits the showroom has made in the admin (it only fills in what is missing).
 *
 * Brands, categories, testimonials and FAQs are read from lib/data/, the same
 * files the frontend renders from, so the launch content lives in one place.
 */
import { PrismaClient, Application, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { brands } from '../lib/data/brands';
import { categories } from '../lib/data/categories';
import { testimonials } from '../lib/data/testimonials';
import { faqs } from '../lib/data/faqs';

const prisma = new PrismaClient();
const BCRYPT_COST = 12;

/** Handful of real ranges so the catalogue is browsable straight after setup. */
const sampleProducts: {
  name: string;
  brandSlug: string;
  categorySlug: string;
  size: string;
  finish: string;
  application: Application;
  description: string;
  isFeatured?: boolean;
}[] = [
  {
    name: 'Statuario Bookmatch Slab',
    brandSlug: 'lioli-ceramica',
    categorySlug: 'large-slabs',
    size: '1200×2400 mm',
    finish: 'Glossy',
    application: Application.WALL,
    description:
      'Bookmatched porcelain slab in a Statuario marble pattern, supplied as mirrored pairs for a continuous vein across a feature wall.',
    isFeatured: true,
  },
  {
    name: 'Carrara Satin Wall Tile',
    brandSlug: 'kajaria',
    categorySlug: 'wall-tiles',
    size: '300×600 mm',
    finish: 'Matte',
    application: Application.WALL,
    description:
      'Soft grey veining on a warm white body, with a satin face that keeps bathroom lighting from glaring.',
  },
  {
    name: 'Terrazzo Grigio Floor Tile',
    brandSlug: 'agl',
    categorySlug: 'floor-tiles',
    size: '600×600 mm',
    finish: 'Matte',
    application: Application.FLOOR,
    description:
      'Fine-aggregate terrazzo look in cool grey, anti-skid rated for bathrooms and balconies.',
    isFeatured: true,
  },
  {
    name: 'Travertine Carving Feature Tile',
    brandSlug: 'simero',
    categorySlug: 'designer-tiles',
    size: '600×1200 mm',
    finish: 'Carving',
    application: Application.WALL,
    description:
      'Deep-carved travertine texture that catches raking light, intended for a single feature wall rather than a full room.',
  },
  {
    name: 'Outdoor Grip Deck Tile',
    brandSlug: 'lavis-ceramic',
    categorySlug: 'floor-tiles',
    size: '600×600 mm',
    finish: 'Structured',
    application: Application.OUTDOOR,
    description:
      'Structured 20 mm body for terraces and pool surrounds, rated R11 for wet underfoot grip.',
  },
  {
    name: 'Wall-Hung Rimless Closet',
    brandSlug: 'mozart',
    categorySlug: 'sanitaryware',
    size: '540×360 mm',
    finish: 'Glossy',
    application: Application.WALL,
    description:
      'Rimless bowl with a soft-close seat, designed for a concealed cistern and a 320 mm rough-in.',
    isFeatured: true,
  },
  {
    name: 'Counter-Top Oval Basin',
    brandSlug: 'ivash',
    categorySlug: 'wash-basins',
    size: '600×400 mm',
    finish: 'Matte',
    application: Application.BOTH,
    description:
      'Thin-rim vitreous china basin in matte white, sized for a 700 mm vanity with room either side.',
  },
  {
    name: 'Brushed Gold Basin Mixer',
    brandSlug: 'massimo',
    categorySlug: 'faucets',
    size: '175 mm spout',
    finish: 'Brushed Gold',
    application: Application.BOTH,
    description:
      'Single-lever mixer with a PVD brushed gold finish that will not lift or discolour, with a ceramic cartridge rated to 500,000 cycles.',
    isFeatured: true,
  },
  {
    name: 'Matte Black Rain Shower Set',
    brandSlug: 'massimo',
    categorySlug: 'bathroom-accessories',
    size: '300×300 mm head',
    finish: 'Matte Black',
    application: Application.WALL,
    description:
      'Overhead rain head with a hand shower and diverter, finished in matte black across every visible component.',
  },
  {
    name: 'Sandstone Ledger Wall Tile',
    brandSlug: 'sunheart-ceramik',
    categorySlug: 'designer-tiles',
    size: '300×600 mm',
    finish: 'Structured',
    application: Application.BOTH,
    description:
      'Stacked-stone ledger profile in warm sandstone tones, suitable for interior features and sheltered exterior walls.',
  },
  {
    name: 'Concrete Grey Large Format',
    brandSlug: 'lioli-ceramica',
    categorySlug: 'large-slabs',
    size: '800×1600 mm',
    finish: 'Matte',
    application: Application.BOTH,
    description:
      'Micro-cement look in a mid grey, with enough face variation to avoid the repeat showing across a large floor.',
  },
  {
    name: 'Pedestal Wash Basin Classic',
    brandSlug: 'kajaria',
    categorySlug: 'wash-basins',
    size: '560×430 mm',
    finish: 'Glossy',
    application: Application.BOTH,
    description:
      'Full-pedestal basin that hides the trap and supply lines, for bathrooms without vanity storage.',
  },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedBrands() {
  for (const [index, brand] of brands.entries()) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: {
        name: brand.name,
        slug: brand.slug,
        logoUrl: brand.logo,
        displayOrder: index,
      },
    });
  }
  console.log(`  brands:       ${brands.length}`);
}

async function seedCategories() {
  for (const [index, category] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.title,
        slug: category.slug,
        description: category.description,
        displayOrder: index,
      },
    });
  }
  console.log(`  categories:   ${categories.length}`);
}

async function seedProducts() {
  for (const [index, product] of sampleProducts.entries()) {
    const brand = await prisma.brand.findUnique({ where: { slug: product.brandSlug } });
    const category = await prisma.category.findUnique({
      where: { slug: product.categorySlug },
    });
    if (!brand || !category) {
      console.warn(`  ! skipped ${product.name}: missing brand or category`);
      continue;
    }

    await prisma.product.upsert({
      where: { slug: slugify(product.name) },
      update: {},
      create: {
        name: product.name,
        slug: slugify(product.name),
        brandId: brand.id,
        categoryId: category.id,
        description: product.description,
        size: product.size,
        finish: product.finish,
        application: product.application,
        isFeatured: product.isFeatured ?? false,
        displayOrder: index,
      },
    });
  }
  console.log(`  products:     ${sampleProducts.length}`);
}

async function seedTestimonials() {
  for (const [index, testimonial] of testimonials.entries()) {
    // No natural unique key, so key idempotency on author plus quote opening.
    const existing = await prisma.testimonial.findFirst({
      where: { authorName: testimonial.name, quote: { startsWith: testimonial.quote.slice(0, 40) } },
    });
    if (existing) continue;

    await prisma.testimonial.create({
      data: {
        authorName: testimonial.name,
        city: testimonial.city,
        quote: testimonial.quote,
        rating: testimonial.rating,
        displayOrder: index,
      },
    });
  }
  console.log(`  testimonials: ${testimonials.length}`);
}

async function seedFaqs() {
  for (const [index, faq] of faqs.entries()) {
    const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
    if (existing) continue;
    await prisma.faq.create({
      data: { question: faq.question, answer: faq.answer, displayOrder: index },
    });
  }
  console.log(`  faqs:         ${faqs.length}`);
}

async function seedAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.warn('  ! admin:      skipped (ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD unset)');
    return;
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log('  admin:        already present, password left untouched');
    return;
  }

  await prisma.adminUser.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, BCRYPT_COST),
      name: 'Showroom Owner',
      role: AdminRole.OWNER,
    },
  });
  console.log(`  admin:        created ${email}`);
}

async function main() {
  console.log('Seeding Elegance Bath Decor…');
  await seedBrands();
  await seedCategories();
  await seedProducts();
  await seedTestimonials();
  await seedFaqs();
  await seedAdmin();
  console.log('Done.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
