import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================
  // STORE
  // ============================================================
  await prisma.store.upsert({
    where: { id: "store-1" },
    update: {},
    create: {
      id: "store-1",
      name: "Clothing Store",
      description: "Toko pakaian online dengan kualitas terbaik",
      phone: "08123456789",
      email: "hello@clothingstore.com",
      instagram: "@clothingstore",
      whatsapp: "08123456789",
    },
  });

  // ============================================================
  // ADMIN
  // ============================================================
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.adminUser.upsert({
    where: { email: "admin@store.com" },
    update: {},
    create: { name: "Super Admin", email: "admin@store.com", password: hashedPassword, role: "SUPER_ADMIN" },
  });

  console.log("✅ Admin created");

  // ============================================================
  // KATEGORI
  // ============================================================
  const categoryData = [
    { name: "Jackets", slug: "jackets" },
    { name: "T-Shirts", slug: "t-shirts" },
    { name: "Polo Shirts", slug: "polo-shirts" },
    { name: "Sweats", slug: "sweats" },
    { name: "Accessories", slug: "accessories" },
  ];

  for (const cat of categoryData) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
  }

  const cats = await prisma.category.findMany();
  const cat = (slug: string) => cats.find((c) => c.slug === slug)!;

  console.log("✅ Categories created");

  // ============================================================
  // PRODUK
  // ============================================================
  const products = [
    // ── JACKETS ──────────────────────────────────────────────
    {
      name: "Military Field Jacket Olive",
      slug: "military-field-jacket-olive",
      description: "Jaket lapangan militer dengan material canvas washed yang tahan lama. Terinspirasi dari jaket militer era 80an, dilengkapi dengan banyak saku fungsional. Cocok untuk aktivitas outdoor maupun casual sehari-hari.",
      price: 1500000,
      categorySlug: "jackets",
      images: [
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
        "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Olive",      colorHex: "#556b2f", stock: 6 },
        { size: "M",  color: "Olive",      colorHex: "#556b2f", stock: 10 },
        { size: "L",  color: "Olive",      colorHex: "#556b2f", stock: 8 },
        { size: "XL", color: "Olive",      colorHex: "#556b2f", stock: 4 },
        { size: "S",  color: "Black",      colorHex: "#111111", stock: 5 },
        { size: "M",  color: "Black",      colorHex: "#111111", stock: 7 },
        { size: "L",  color: "Black",      colorHex: "#111111", stock: 6 },
        { size: "XL", color: "Black",      colorHex: "#111111", stock: 3 },
      ],
    },
    {
      name: "Canvas Work Jacket Brown",
      slug: "canvas-work-jacket-brown",
      description: "Jaket kerja berbahan canvas tebal dengan detail jahitan kuat. Desain klasik yang timeless dan cocok untuk berbagai kesempatan. Material breathable dan nyaman dipakai seharian.",
      price: 1350000,
      categorySlug: "jackets",
      images: [
        "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&q=80",
        "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Brown",      colorHex: "#7c5c3e", stock: 4 },
        { size: "M",  color: "Brown",      colorHex: "#7c5c3e", stock: 8 },
        { size: "L",  color: "Brown",      colorHex: "#7c5c3e", stock: 6 },
        { size: "XL", color: "Brown",      colorHex: "#7c5c3e", stock: 2 },
        { size: "M",  color: "Tan",        colorHex: "#c4a882", stock: 5 },
        { size: "L",  color: "Tan",        colorHex: "#c4a882", stock: 4 },
      ],
    },
    {
      name: "Waxed Cotton Hunting Jacket",
      slug: "waxed-cotton-hunting-jacket",
      description: "Jaket berbahan waxed cotton yang water-resistant alami. Material yang semakin indah seiring waktu pemakaian, memberikan karakter unik pada setiap jaket. Ideal untuk aktivitas outdoor.",
      price: 1750000,
      categorySlug: "jackets",
      images: [
        "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80",
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Dark Green", colorHex: "#2d4a1e", stock: 3 },
        { size: "M",  color: "Dark Green", colorHex: "#2d4a1e", stock: 6 },
        { size: "L",  color: "Dark Green", colorHex: "#2d4a1e", stock: 5 },
        { size: "XL", color: "Dark Green", colorHex: "#2d4a1e", stock: 2 },
        { size: "M",  color: "Navy",       colorHex: "#1b2a4a", stock: 4 },
        { size: "L",  color: "Navy",       colorHex: "#1b2a4a", stock: 3 },
      ],
    },
    {
      name: "Nylon Souwester Jacket",
      slug: "nylon-souwester-jacket",
      description: "Jaket nylon ringan dengan desain modern. Anti-angin dan tahan cipratan air, cocok untuk aktivitas outdoor ringan. Bisa dilipat menjadi kecil dan masuk ke kantong.",
      price: 950000,
      categorySlug: "jackets",
      images: [
        "https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=600&q=80",
        "https://images.unsplash.com/photo-1614495640990-4b7686f7c5d9?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Black",      colorHex: "#111111", stock: 8 },
        { size: "M",  color: "Black",      colorHex: "#111111", stock: 12 },
        { size: "L",  color: "Black",      colorHex: "#111111", stock: 10 },
        { size: "XL", color: "Black",      colorHex: "#111111", stock: 5 },
        { size: "S",  color: "Olive",      colorHex: "#556b2f", stock: 6 },
        { size: "M",  color: "Olive",      colorHex: "#556b2f", stock: 8 },
        { size: "L",  color: "Olive",      colorHex: "#556b2f", stock: 6 },
      ],
    },
    {
      name: "Denim Chore Jacket Indigo",
      slug: "denim-chore-jacket-indigo",
      description: "Jaket denim chore coat dengan bahan denim 12oz berkualitas tinggi. Potongan oversized yang trendi dengan konstruksi yang kuat. Makin bagus setelah sering dipakai.",
      price: 1200000,
      categorySlug: "jackets",
      images: [
        "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80",
        "https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Indigo",     colorHex: "#3f4b8c", stock: 5 },
        { size: "M",  color: "Indigo",     colorHex: "#3f4b8c", stock: 9 },
        { size: "L",  color: "Indigo",     colorHex: "#3f4b8c", stock: 7 },
        { size: "XL", color: "Indigo",     colorHex: "#3f4b8c", stock: 3 },
        { size: "M",  color: "Black",      colorHex: "#111111", stock: 6 },
        { size: "L",  color: "Black",      colorHex: "#111111", stock: 5 },
      ],
    },

    // ── T-SHIRTS ─────────────────────────────────────────────
    {
      name: "Garment Dyed Tee Black",
      slug: "garment-dyed-tee-black",
      description: "Kaos dengan proses garment dye yang menghasilkan warna yang kaya dan unik. Material cotton combed 30s yang lembut dan nyaman. Setiap kaos memiliki gradasi warna yang sedikit berbeda.",
      price: 350000,
      categorySlug: "t-shirts",
      images: [
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80",
      ],
      variants: [
        { size: "S",   color: "Black",     colorHex: "#111111", stock: 15 },
        { size: "M",   color: "Black",     colorHex: "#111111", stock: 20 },
        { size: "L",   color: "Black",     colorHex: "#111111", stock: 18 },
        { size: "XL",  color: "Black",     colorHex: "#111111", stock: 12 },
        { size: "XXL", color: "Black",     colorHex: "#111111", stock: 6 },
        { size: "S",   color: "White",     colorHex: "#f5f5f5", stock: 12 },
        { size: "M",   color: "White",     colorHex: "#f5f5f5", stock: 16 },
        { size: "L",   color: "White",     colorHex: "#f5f5f5", stock: 14 },
        { size: "XL",  color: "White",     colorHex: "#f5f5f5", stock: 8 },
      ],
    },
    {
      name: "Military Print Graphic Tee",
      slug: "military-print-graphic-tee",
      description: "Kaos grafis dengan desain print terinspirasi estetika militer. Dicetak menggunakan teknik screen printing berkualitas tinggi yang tahan lama. Material cotton 100% ringspun.",
      price: 380000,
      categorySlug: "t-shirts",
      images: [
        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
        "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&q=80",
      ],
      variants: [
        { size: "S",   color: "Ecru",      colorHex: "#f5f0e8", stock: 10 },
        { size: "M",   color: "Ecru",      colorHex: "#f5f0e8", stock: 14 },
        { size: "L",   color: "Ecru",      colorHex: "#f5f0e8", stock: 12 },
        { size: "XL",  color: "Ecru",      colorHex: "#f5f0e8", stock: 8 },
        { size: "S",   color: "Black",     colorHex: "#111111", stock: 8 },
        { size: "M",   color: "Black",     colorHex: "#111111", stock: 10 },
        { size: "L",   color: "Black",     colorHex: "#111111", stock: 9 },
      ],
    },
    {
      name: "Oversized Pocket Tee Stone",
      slug: "oversized-pocket-tee-stone",
      description: "Kaos oversized dengan detail kantong dada. Potongan boxy yang santai namun tetap stylish. Bahan cotton fleece ringan yang nyaman untuk aktivitas sehari-hari.",
      price: 320000,
      categorySlug: "t-shirts",
      images: [
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
        "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600&q=80",
      ],
      variants: [
        { size: "S",   color: "Stone",     colorHex: "#9e9e8c", stock: 12 },
        { size: "M",   color: "Stone",     colorHex: "#9e9e8c", stock: 18 },
        { size: "L",   color: "Stone",     colorHex: "#9e9e8c", stock: 15 },
        { size: "XL",  color: "Stone",     colorHex: "#9e9e8c", stock: 9 },
        { size: "M",   color: "Charcoal",  colorHex: "#3a3a3a", stock: 10 },
        { size: "L",   color: "Charcoal",  colorHex: "#3a3a3a", stock: 8 },
      ],
    },
    {
      name: "Stripe Sailor Tee Navy",
      slug: "stripe-sailor-tee-navy",
      description: "Kaos bergaris ala pelaut Prancis yang klasik. Terinspirasi dari Breton stripe yang ikonik. Material cotton pique yang ringan dan breathable, cocok untuk musim panas.",
      price: 360000,
      categorySlug: "t-shirts",
      images: [
        "https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=600&q=80",
        "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=600&q=80",
      ],
      variants: [
        { size: "S",   color: "Navy/White",colorHex: "#1b2a4a", stock: 8 },
        { size: "M",   color: "Navy/White",colorHex: "#1b2a4a", stock: 12 },
        { size: "L",   color: "Navy/White",colorHex: "#1b2a4a", stock: 10 },
        { size: "XL",  color: "Navy/White",colorHex: "#1b2a4a", stock: 6 },
        { size: "S",   color: "Black/White",colorHex: "#111111", stock: 6 },
        { size: "M",   color: "Black/White",colorHex: "#111111", stock: 8 },
        { size: "L",   color: "Black/White",colorHex: "#111111", stock: 7 },
      ],
    },
    {
      name: "Tie Dye Tee Sunset",
      slug: "tie-dye-tee-sunset",
      description: "Kaos tie dye dengan proses pewarnaan tangan yang menghasilkan motif unik. Setiap kaos adalah satu-satunya di dunia karena dikerjakan secara manual. Material cotton combed 30s.",
      price: 420000,
      categorySlug: "t-shirts",
      images: [
        "https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=600&q=80",
        "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80",
      ],
      variants: [
        { size: "S",   color: "Sunset",    colorHex: "#e8734a", stock: 5 },
        { size: "M",   color: "Sunset",    colorHex: "#e8734a", stock: 8 },
        { size: "L",   color: "Sunset",    colorHex: "#e8734a", stock: 6 },
        { size: "XL",  color: "Sunset",    colorHex: "#e8734a", stock: 3 },
        { size: "S",   color: "Ocean",     colorHex: "#3a7bd5", stock: 5 },
        { size: "M",   color: "Ocean",     colorHex: "#3a7bd5", stock: 7 },
        { size: "L",   color: "Ocean",     colorHex: "#3a7bd5", stock: 5 },
      ],
    },

    // ── POLO SHIRTS ──────────────────────────────────────────
    {
      name: "Pique Polo Navy Classic",
      slug: "pique-polo-navy-classic",
      description: "Polo shirt klasik berbahan pique cotton berkualitas tinggi. Potongan slim fit yang rapi dan elegan. Cocok untuk smart casual maupun casual formal.",
      price: 450000,
      categorySlug: "polo-shirts",
      images: [
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
        "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Navy",       colorHex: "#1b2a4a", stock: 8 },
        { size: "M",  color: "Navy",       colorHex: "#1b2a4a", stock: 12 },
        { size: "L",  color: "Navy",       colorHex: "#1b2a4a", stock: 10 },
        { size: "XL", color: "Navy",       colorHex: "#1b2a4a", stock: 6 },
        { size: "S",  color: "White",      colorHex: "#f5f5f5", stock: 7 },
        { size: "M",  color: "White",      colorHex: "#f5f5f5", stock: 10 },
        { size: "L",  color: "White",      colorHex: "#f5f5f5", stock: 8 },
      ],
    },
    {
      name: "Terry Polo Shirt Olive",
      slug: "terry-polo-shirt-olive",
      description: "Polo shirt berbahan terry cotton yang lembut dan breathable. Desain modern dengan detail collar yang rapi. Cocok dipadupadankan dengan berbagai outfit.",
      price: 480000,
      categorySlug: "polo-shirts",
      images: [
        "https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=600&q=80",
        "https://images.unsplash.com/photo-1625910513407-57ef44e5aa51?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Olive",      colorHex: "#556b2f", stock: 7 },
        { size: "M",  color: "Olive",      colorHex: "#556b2f", stock: 11 },
        { size: "L",  color: "Olive",      colorHex: "#556b2f", stock: 9 },
        { size: "XL", color: "Olive",      colorHex: "#556b2f", stock: 4 },
        { size: "M",  color: "Ecru",       colorHex: "#f5f0e8", stock: 8 },
        { size: "L",  color: "Ecru",       colorHex: "#f5f0e8", stock: 6 },
      ],
    },
    {
      name: "Stripe Polo Shirt Black",
      slug: "stripe-polo-shirt-black",
      description: "Polo shirt dengan detail stripe halus pada collar dan cuff. Material cotton pique premium dengan finishing yang rapi. Tampilan yang clean dan mudah dipadukan.",
      price: 460000,
      categorySlug: "polo-shirts",
      images: [
        "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80",
        "https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Black",      colorHex: "#111111", stock: 9 },
        { size: "M",  color: "Black",      colorHex: "#111111", stock: 14 },
        { size: "L",  color: "Black",      colorHex: "#111111", stock: 11 },
        { size: "XL", color: "Black",      colorHex: "#111111", stock: 7 },
        { size: "S",  color: "Burgundy",   colorHex: "#6e1c2a", stock: 5 },
        { size: "M",  color: "Burgundy",   colorHex: "#6e1c2a", stock: 7 },
        { size: "L",  color: "Burgundy",   colorHex: "#6e1c2a", stock: 5 },
      ],
    },
    {
      name: "Knit Polo Cream",
      slug: "knit-polo-cream",
      description: "Polo shirt berbahan knit yang ringan dan elegant. Tekstur rajutan yang memberikan dimensi visual unik. Cocok untuk acara semi-formal maupun casual.",
      price: 520000,
      categorySlug: "polo-shirts",
      images: [
        "https://images.unsplash.com/photo-1559582798-678dfc71ccd8?w=600&q=80",
        "https://images.unsplash.com/photo-1614495640990-4b7686f7c5d9?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Cream",      colorHex: "#f5f0e8", stock: 6 },
        { size: "M",  color: "Cream",      colorHex: "#f5f0e8", stock: 9 },
        { size: "L",  color: "Cream",      colorHex: "#f5f0e8", stock: 7 },
        { size: "XL", color: "Cream",      colorHex: "#f5f0e8", stock: 3 },
        { size: "M",  color: "Brown",      colorHex: "#7c5c3e", stock: 6 },
        { size: "L",  color: "Brown",      colorHex: "#7c5c3e", stock: 5 },
      ],
    },
    {
      name: "Linen Polo Slate Blue",
      slug: "linen-polo-slate-blue",
      description: "Polo shirt berbahan linen yang ringan dan breathable. Pilihan terbaik untuk musim panas. Warna slate blue yang kalem dan mudah dipadukan dengan berbagai bawahan.",
      price: 490000,
      categorySlug: "polo-shirts",
      images: [
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",
        "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Slate Blue", colorHex: "#6a7fa8", stock: 7 },
        { size: "M",  color: "Slate Blue", colorHex: "#6a7fa8", stock: 10 },
        { size: "L",  color: "Slate Blue", colorHex: "#6a7fa8", stock: 8 },
        { size: "XL", color: "Slate Blue", colorHex: "#6a7fa8", stock: 4 },
        { size: "M",  color: "Sage",       colorHex: "#87a878", stock: 7 },
        { size: "L",  color: "Sage",       colorHex: "#87a878", stock: 5 },
      ],
    },

    // ── SWEATS ───────────────────────────────────────────────
    {
      name: "Heavy Fleece Crewneck Grey",
      slug: "heavy-fleece-crewneck-grey",
      description: "Crewneck sweatshirt berbahan fleece heavyweight 380gsm yang hangat dan nyaman. Potongan relaxed fit yang stylish. Cocok untuk cuaca dingin maupun sebagai layer.",
      price: 650000,
      categorySlug: "sweats",
      images: [
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
        "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Grey",       colorHex: "#888888", stock: 10 },
        { size: "M",  color: "Grey",       colorHex: "#888888", stock: 15 },
        { size: "L",  color: "Grey",       colorHex: "#888888", stock: 12 },
        { size: "XL", color: "Grey",       colorHex: "#888888", stock: 8 },
        { size: "S",  color: "Black",      colorHex: "#111111", stock: 8 },
        { size: "M",  color: "Black",      colorHex: "#111111", stock: 12 },
        { size: "L",  color: "Black",      colorHex: "#111111", stock: 10 },
        { size: "XL", color: "Black",      colorHex: "#111111", stock: 6 },
      ],
    },
    {
      name: "Zip-Up Hoodie Charcoal",
      slug: "zip-up-hoodie-charcoal",
      description: "Hoodie zip-up dengan material fleece premium. Dilengkapi dengan dua kantong samping dan satu kantong dalam yang tersembunyi. Ritsleting YKK yang berkualitas.",
      price: 720000,
      categorySlug: "sweats",
      images: [
        "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&q=80",
        "https://images.unsplash.com/photo-1616677042679-d9e5c8b0b13e?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Charcoal",   colorHex: "#3a3a3a", stock: 8 },
        { size: "M",  color: "Charcoal",   colorHex: "#3a3a3a", stock: 12 },
        { size: "L",  color: "Charcoal",   colorHex: "#3a3a3a", stock: 10 },
        { size: "XL", color: "Charcoal",   colorHex: "#3a3a3a", stock: 6 },
        { size: "M",  color: "Navy",       colorHex: "#1b2a4a", stock: 8 },
        { size: "L",  color: "Navy",       colorHex: "#1b2a4a", stock: 6 },
      ],
    },
    {
      name: "Vintage Wash Sweatshirt Ecru",
      slug: "vintage-wash-sweatshirt-ecru",
      description: "Sweatshirt dengan proses vintage wash yang memberikan tampilan usang yang stylish. Material cotton fleece 320gsm yang tebal dan nyaman. Warna ecru yang netral dan mudah dipadukan.",
      price: 580000,
      categorySlug: "sweats",
      images: [
        "https://images.unsplash.com/photo-1614495640990-4b7686f7c5d9?w=600&q=80",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Ecru",       colorHex: "#f5f0e8", stock: 9 },
        { size: "M",  color: "Ecru",       colorHex: "#f5f0e8", stock: 13 },
        { size: "L",  color: "Ecru",       colorHex: "#f5f0e8", stock: 10 },
        { size: "XL", color: "Ecru",       colorHex: "#f5f0e8", stock: 5 },
        { size: "S",  color: "Dusty Pink", colorHex: "#d4a0a0", stock: 6 },
        { size: "M",  color: "Dusty Pink", colorHex: "#d4a0a0", stock: 8 },
        { size: "L",  color: "Dusty Pink", colorHex: "#d4a0a0", stock: 6 },
      ],
    },
    {
      name: "Quarter Zip Pullover Olive",
      slug: "quarter-zip-pullover-olive",
      description: "Pullover quarter-zip dengan material fleece mid-weight. Desain sporty yang versatile, cocok untuk olahraga ringan maupun casual. Collar yang nyaman dan rapi.",
      price: 680000,
      categorySlug: "sweats",
      images: [
        "https://images.unsplash.com/photo-1542574621-e088a4464792?w=600&q=80",
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Olive",      colorHex: "#556b2f", stock: 7 },
        { size: "M",  color: "Olive",      colorHex: "#556b2f", stock: 10 },
        { size: "L",  color: "Olive",      colorHex: "#556b2f", stock: 8 },
        { size: "XL", color: "Olive",      colorHex: "#556b2f", stock: 4 },
        { size: "M",  color: "Brown",      colorHex: "#7c5c3e", stock: 7 },
        { size: "L",  color: "Brown",      colorHex: "#7c5c3e", stock: 5 },
      ],
    },
    {
      name: "Embroidered Crewneck Black",
      slug: "embroidered-crewneck-black",
      description: "Crewneck dengan detail bordir eksklusif di dada. Material cotton fleece premium 350gsm yang hangat. Logo bordir tangan yang memberikan nilai estetis tinggi.",
      price: 700000,
      categorySlug: "sweats",
      images: [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
      ],
      variants: [
        { size: "S",  color: "Black",      colorHex: "#111111", stock: 8 },
        { size: "M",  color: "Black",      colorHex: "#111111", stock: 12 },
        { size: "L",  color: "Black",      colorHex: "#111111", stock: 10 },
        { size: "XL", color: "Black",      colorHex: "#111111", stock: 5 },
        { size: "S",  color: "Forest",     colorHex: "#2d4a1e", stock: 5 },
        { size: "M",  color: "Forest",     colorHex: "#2d4a1e", stock: 7 },
        { size: "L",  color: "Forest",     colorHex: "#2d4a1e", stock: 6 },
      ],
    },

    // ── ACCESSORIES ──────────────────────────────────────────
    {
      name: "Canvas Tote Bag Natural",
      slug: "canvas-tote-bag-natural",
      description: "Tote bag berbahan canvas tebal 12oz yang kuat dan tahan lama. Kapasitas besar dengan satu kantong dalam. Bisa dipakai ke pasar, kampus, maupun jalan-jalan.",
      price: 250000,
      categorySlug: "accessories",
      images: [
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80",
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80",
      ],
      variants: [
        { size: "ONE SIZE", color: "Natural",    colorHex: "#f5f0e8", stock: 20 },
        { size: "ONE SIZE", color: "Black",      colorHex: "#111111", stock: 15 },
        { size: "ONE SIZE", color: "Olive",      colorHex: "#556b2f", stock: 12 },
      ],
    },
    {
      name: "Military Cap Olive",
      slug: "military-cap-olive",
      description: "Topi 6-panel dengan material canvas tebal. Desain terinspirasi dari topi militer dengan detail strap di belakang yang adjustable. Cocok untuk berbagai ukuran kepala.",
      price: 280000,
      categorySlug: "accessories",
      images: [
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80",
        "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&q=80",
      ],
      variants: [
        { size: "ONE SIZE", color: "Olive",      colorHex: "#556b2f", stock: 18 },
        { size: "ONE SIZE", color: "Black",      colorHex: "#111111", stock: 15 },
        { size: "ONE SIZE", color: "Khaki",      colorHex: "#c4a882", stock: 10 },
      ],
    },
    {
      name: "Leather Card Holder Brown",
      slug: "leather-card-holder-brown",
      description: "Card holder berbahan genuine leather full grain. Kapasitas hingga 6 kartu dengan satu slot uang. Semakin indah seiring waktu pemakaian.",
      price: 320000,
      categorySlug: "accessories",
      images: [
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80",
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80",
      ],
      variants: [
        { size: "ONE SIZE", color: "Tan",        colorHex: "#c4a882", stock: 15 },
        { size: "ONE SIZE", color: "Dark Brown",  colorHex: "#3e2723", stock: 12 },
        { size: "ONE SIZE", color: "Black",      colorHex: "#111111", stock: 10 },
      ],
    },
    {
      name: "Woven Belt Olive",
      slug: "woven-belt-olive",
      description: "Ikat pinggang anyaman berbahan canvas dengan buckle metal berwarna antique brass. Desain yang klasik dan tahan lama. Adjustable hingga lingkar pinggang 42 inci.",
      price: 220000,
      categorySlug: "accessories",
      images: [
        "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=80",
        "https://images.unsplash.com/photo-1614093302611-8efc673b4a69?w=600&q=80",
      ],
      variants: [
        { size: "ONE SIZE", color: "Olive",      colorHex: "#556b2f", stock: 20 },
        { size: "ONE SIZE", color: "Tan",        colorHex: "#c4a882", stock: 16 },
        { size: "ONE SIZE", color: "Black",      colorHex: "#111111", stock: 14 },
      ],
    },
    {
      name: "Canvas Backpack Olive Large",
      slug: "canvas-backpack-olive-large",
      description: "Ransel canvas premium berkapasitas 25L. Dilengkapi dengan laptop sleeve 15 inci, banyak kantong organizer, dan strap punggung yang ergonomis. Material canvas 14oz yang tahan lama.",
      price: 750000,
      categorySlug: "accessories",
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80",
      ],
      variants: [
        { size: "ONE SIZE", color: "Olive",      colorHex: "#556b2f", stock: 12 },
        { size: "ONE SIZE", color: "Black",      colorHex: "#111111", stock: 10 },
        { size: "ONE SIZE", color: "Brown",      colorHex: "#7c5c3e", stock: 7 },
      ],
    },
  ];

  // Insert semua produk
  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      console.log(`  ⏭  Skip: ${p.name}`);
      continue;
    }

    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        categoryId: cat(p.categorySlug).id,
        isActive: true,
        images: {
          create: p.images.map((url, i) => ({ url, isMain: i === 0, order: i })),
        },
        variants: {
          create: p.variants.map((v) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: v.stock,
          })),
        },
      },
    });

    console.log(`  ✅ ${p.name}`);
  }

  console.log(`\n🎉 ${products.length} produk berhasil ditambahkan.`);

  // ============================================================
  // SAMPLE CUSTOMERS & ORDERS (untuk demo/testing)
  // ============================================================

  const sampleCustomers = [
    { name: "Budi Santoso",   email: "budi@example.com",  phone: "081234567890" },
    { name: "Siti Rahayu",    email: "siti@example.com",  phone: "082345678901" },
    { name: "Andi Wijaya",    email: "andi@example.com",  phone: "083456789012" },
    { name: "Dewi Putri",     email: "dewi@example.com",  phone: "084567890123" },
    { name: "Rizky Pratama",  email: "rizky@example.com", phone: "085678901234" },
  ];

  const customerPass = await bcrypt.hash("customer123", 10);
  const createdCustomers: { id: string }[] = [];

  for (const c of sampleCustomers) {
    const customer = await prisma.customer.upsert({
      where: { email: c.email },
      update: {},
      create: { ...c, password: customerPass, isActive: true },
    });
    createdCustomers.push({ id: customer.id });
  }

  // Buat alamat untuk masing-masing customer
  for (const c of createdCustomers) {
    const existing = await prisma.address.findFirst({ where: { customerId: c.id } });
    if (!existing) {
      await prisma.address.create({
        data: {
          customerId: c.id,
          label: "Rumah",
          recipientName: sampleCustomers[createdCustomers.indexOf(c)].name,
          phone: sampleCustomers[createdCustomers.indexOf(c)].phone,
          address: `Jl. Contoh No. ${createdCustomers.indexOf(c) + 1}`,
          city: "Jakarta Selatan",
          province: "DKI Jakarta",
          postalCode: "12345",
          isDefault: true,
        },
      });
    }
  }

  console.log("✅ Sample customers created");

  // Buat 15 sample orders tersebar 30 hari terakhir
  const allProducts = await prisma.product.findMany({
    include: { variants: true },
    where: { isActive: true },
    take: 10,
  });

  const allStatuses = ["PENDING","PAID","PROCESSING","SHIPPED","DELIVERED","DELIVERED","DELIVERED","CANCELLED"] as const;
  let orderCount = 0;

  for (let i = 0; i < 15; i++) {
    const customer = createdCustomers[i % createdCustomers.length];
    const address = await prisma.address.findFirst({ where: { customerId: customer.id } });
    if (!address) continue;

    const daysAgo = Math.floor(Math.random() * 30);
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - daysAgo);

    const status = allStatuses[i % allStatuses.length];
    const orderNumber = `ORD-${orderDate.getFullYear()}${String(orderDate.getMonth()+1).padStart(2,"0")}${String(orderDate.getDate()).padStart(2,"0")}-${String(i+1).padStart(4,"0")}`;

    const exists = await prisma.order.findUnique({ where: { orderNumber } });
    if (exists) continue;

    // Pilih 1-2 produk random
    const picked = allProducts.slice(i % allProducts.length, (i % allProducts.length) + (i % 2 === 0 ? 1 : 2));
    if (picked.length === 0) continue;

    const items = picked.map((p) => {
      const variant = p.variants[0];
      const qty = 1 + (i % 2);
      return {
        productId: p.id,
        variantId: variant.id,
        quantity: qty,
        price: p.price,
        subtotal: p.price * qty,
      };
    });

    const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
    const shippingCost = subtotal >= 500000 ? 0 : 25000;
    const total = subtotal + shippingCost;

    await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        addressId: address.id,
        status,
        paymentStatus: status === "PENDING" ? "UNPAID" : "PAID",
        paymentMethod: "MIDTRANS",
        subtotal,
        shippingCost,
        total,
        shippingCourier: "JNE",
        shippingService: "REG",
        createdAt: orderDate,
        items: { create: items },
      },
    });

    orderCount++;
  }

  console.log(`✅ ${orderCount} sample orders created`);
  console.log(`\n🔑 Login Admin   : admin@store.com / admin123`);
  console.log(`🔑 Login Customer: budi@example.com / customer123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
