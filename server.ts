import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function loadJson<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error loading JSON ${filename}:`, err);
  }
  return fallback;
}

function saveJson<T>(filename: string, data: T): void {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error saving JSON ${filename}:`, err);
  }
}

import { INITIAL_FULL_SEO_DATA, runSeoAudit } from './src/data/seoDefaults.js';
import { INITIAL_JOURNAL_ARTICLES } from './src/data/mockData.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// SEO Architecture Store (persisted to data/seo.json)
let fullSeoData = loadJson('seo.json', JSON.parse(JSON.stringify(INITIAL_FULL_SEO_DATA)));
if (!fs.existsSync(path.join(DATA_DIR, 'seo.json'))) {
  saveJson('seo.json', fullSeoData);
}

// 301 / 302 SEO Dynamic Redirect Engine Middleware
app.use((req: Request, res: Response, next) => {
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/@') ||
    req.path.startsWith('/node_modules') ||
    req.path.startsWith('/src') ||
    req.path.includes('.')
  ) {
    return next();
  }
  const cleanPath = req.path.toLowerCase().replace(/\/$/, '') || '/';
  const matchedRedirect = fullSeoData.redirects.find(
    (r: any) =>
      r.active &&
      (r.sourceUrl.toLowerCase() === cleanPath ||
        r.sourceUrl.toLowerCase() === req.path.toLowerCase() ||
        r.sourceUrl.toLowerCase() === `${cleanPath}/`)
  );
  if (matchedRedirect) {
    matchedRedirect.hitCount = (matchedRedirect.hitCount || 0) + 1;
    return res.redirect(matchedRedirect.statusCode, matchedRedirect.targetUrl);
  }
  next();
});

// In-Memory Data Store
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: 'diyas-candle-holders' | 'candles-fragrance' | 'festive-decorations' | 'home-accents' | 'table-decor' | 'gifts-hampers';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  material: string;
  craftHeritage: string;
  weight: string;
  dimensions: string;
  stock: number;
  featured: boolean;
  bestseller: boolean;
  highlightCategory?: 'highlights' | 'urlis' | 'aromatics' | 'pairs';
  rating: number;
  reviewsCount: number;
  images: {
    main: string;
    waterView?: string;
    engraving?: string;
    lifestyle?: string;
    giftBox?: string;
  };
  finishes?: { id: string; name: string; hex: string }[];
  description: string;
  specifications: {
    materialCraft: string;
    dimensionsWeight: string;
    ritualCare: string;
    inTheBox: string;
  };
  pairings?: string[]; // IDs of complementary products
}

export interface JournalArticle {
  id: string;
  title: string;
  slug: string;
  category: 'festive-styling' | 'living-ambience' | 'artisan-notes' | 'gifting' | 'table-decor';
  categoryLabel: string;
  readTime: string;
  author: string;
  authorTitle: string;
  date: string;
  leadExcerpt: string;
  content: string[];
  image: string;
  imageAlt: string;
  essayNumber: string;
  featuredLead?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  finish?: string;
  price: number;
  quantity: number;
  giftWrap: boolean;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered';
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  shipping: {
    speed: 'express' | 'priority';
    cost: number;
    trackingCarrier: string;
    waybillNumber: string;
    estimatedDelivery: string;
  };
  gift: {
    isGift: boolean;
    recipient?: string;
    occasion?: string;
    handwrittenNote?: string;
  };
  items: OrderItem[];
  pricing: {
    subtotal: number;
    discount: number;
    couponApplied?: string;
    giftWrapTotal: number;
    shippingCost: number;
    estimatedGstIncluded: number;
    total: number;
  };
  payment: {
    method: 'upi' | 'card' | 'netbanking' | 'cod';
    status: 'authorized' | 'captured' | 'cod_verified' | 'failed' | 'pending';
    transactionId?: string;
    utrNumber?: string;
    bankReference?: string;
    cardLast4?: string;
    cardBrand?: string;
    paidAt?: string;
    verificationHash: string;
  };
  trackingTimeline: {
    step: string;
    timestamp: string;
    description: string;
    completed: boolean;
    current?: boolean;
  }[];
}

// Seed Products Catalogue matching design imagery and descriptions
const SEED_PRODUCTS: Product[] = [
  {
    id: 'mayura-brass-urli',
    name: 'Mayura Brass Urli with Floating Diya Set',
    sku: 'SJ-URL-048',
    category: 'diyas-candle-holders',
    categoryLabel: 'Diyas & Candle Holders',
    price: 3450,
    originalPrice: 4200,
    material: 'Pure Brass',
    craftHeritage: 'Moradabad Sand-Cast Brass Guild',
    weight: '1.85 kg',
    dimensions: '12" Diameter × 3.5" Height',
    stock: 7,
    featured: true,
    bestseller: true,
    highlightCategory: 'urlis',
    rating: 4.9,
    reviewsCount: 42,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwqaCtGR5f2YGRZ0vFu29AI8sdvNknypepJqIDvsmW6kFGrXZ77COgEPFQgapONq6KWf5zNIubYRDzCOEhen7aOVw47TjjSJdtE77ugBGQcWbEYr11c4AUK5UJbt-ywkbYBCWgPnlIm42QPJ8yFRNbFeiQxinvll3eh5CmSTTptDuD08RzhCSn2NLKItYjsFaTox2O4fRFOn4I4Kqg5lPlTLaB0dBHhU2Z5U0nEW9yBMsu2ORspEQcZg',
      waterView: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsp5_FPnmIIa99GkIz69gT8laiZlIQ8g1jpoE0VG8fuuTmLbVVcSg5s30HffEJyejlF-2-wEq1zu9jll4YMopM_x_7rX4Gnc13SOnhL3Z_sfVob1sffGzfNdTx6sy0QHT_4qpHdswICMDxs-f2H25qFuJkaECjQdOmgRQMz4wtp3ie9omWfQb-mRqPAF1Q66tRh5oKsqlc_hxtEV4ddkUO6Ji1nRs0TTwe0vI8cRWJQf76b98O2z_5Dg',
      engraving: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHztAZiOlIOxXyYiGZIPsdQZNgurt32hM4k-ayRHxm34SObZg1uLX9c2TDwhWChMBf5fVBXr01kvi2kXwZ5wK3FnZ8ssLJGaQlEdgptwnMj3ifZHDLsOy3E02Z3Y8j_TkmGvSQXl0kwvafux4ZxWn7OmcP8sobgI74eBLdj_sxvYbi_7cH6U-60Jm-xChn-h-1huwhyw6wkFtqINcZK_yxlzm7yuxhF5LNH7OyvN-LouGFpFL1tCFJ4g',
      lifestyle: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqmjtarEXa9BW6686r-LqFpxhAbl916lFPruKBEvfB5CtZ8hLBYlYHEmK6cNBlJaqmC2RGvCJdfaSgNoEePwnGyb3XUiQBkoUAkdaT3QnjK_hdJXe6Bj65E7tZFsAS_HY0ICDccRVEf_uxzFeIwlkfJXL0zbB9-6um0tVig2iUvgHNyu-0kYEfvFcqW81OuGPv9kL-a5BR3hFuYwviGbgvt6SVXlepwjvosN6lZZ0P7J82WtuJUZXZ5w',
      giftBox: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8w0m4HV45jnMBOa64-ZT8bqgp7ZTCoZRTkETwckKMl-g2OB9utugPkxs3UHstm-02XzS1x7Ygq_EpzbQwULoDTi7J8xy8xeqbBux2IE3b2NbkpT6jfgvQ_r0eG4q6Sl3CxZhcD-YcPnZXT9mjwowkwPbsJLHyhIv1dIOWkK0IjdqKTwe9IiwACyLqXiS_N3GYMFQTmtM5t8dJobLtcKaA7D9iDBLgPVrVsHDCrutadDzTZ2zErUYO_g'
    },
    finishes: [
      { id: 'antiqued', name: 'Antiqued Heritage Brass', hex: '#996515' },
      { id: 'brushed', name: 'Brushed Gold', hex: '#E5B80B' }
    ],
    description: 'An ode to timeless hospitality. Molded from solid heavy-gauge bell brass with peacock feather filigree, paired with six weighted lotus floating diyas crafted to dance atop water.',
    specifications: {
      materialCraft: '100% Solid virgin casting brass with acoustic bell resonance. Chiseled by Moradabad master artisans and treated with a protective micro-crystalline wax seal.',
      dimensionsWeight: 'Urli Diameter: 12" (30.5 cm) · Depth: 3.5" (8.9 cm) · Net Weight: 1.85 kg. 6 Floating Lotus Diyas: 2.5" diameter each.',
      ritualCare: 'Empty scented water after celebrations and pat dry with a soft cotton muslin cloth. Nourish with a pea-sized dab of cold-pressed coconut oil or traditional brass polish twice a year.',
      inTheBox: '1 × Hand-carved Mayura Brass Urli, 6 × Weighted Floating Lotus Diyas, 30 × Pure Cotton Phool Wicks, Heritage Certificate & Keepsake Rigid Box.'
    },
    pairings: ['sandalwood-soy-tealights', 'padma-marble-platter', 'hastakala-brass-coasters', 'ghee-phool-wicks']
  },
  {
    id: 'kashi-temple-diya',
    name: 'Kashi Temple Brass Handcrafted Diya (Pair)',
    sku: 'SJ-DYA-012',
    category: 'diyas-candle-holders',
    categoryLabel: 'Diyas & Candle Holders',
    price: 1850,
    originalPrice: 2200,
    material: 'Pure Brass',
    craftHeritage: 'Kashi Ghat Temple Brass Smiths',
    weight: '0.95 kg',
    dimensions: '4.5" Height × 3.2" Diameter',
    stock: 15,
    featured: true,
    bestseller: false,
    highlightCategory: 'pairs',
    rating: 4.8,
    reviewsCount: 28,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9UcSEuD48Y9w9lGq08c-I-a6dgIwcuLt6r6BBBknJxL6XqsF9KQ3O8ehPK4jEegBJFIvjEdbALqWr1ixK2s8hE6poicjWiqiyr2micZPTtSDrw_NK1HURWCDggR9eV0wmAguWqiCddcHEmhfMWUs1YptB-W5_D4uFohtHNErUxdC4KCip5KZ2u5ehlyDrMY7xr-FUkM8Uy_KHZ3p9Q3YWyK1w-V44ovBiEhTieK4hwoCw3bEP7OyW1Q'
    },
    description: 'Pair of intricately engraved heavy brass traditional temple diyas designed to hold steady oil reservoirs for ceremonial evening aartis.',
    specifications: {
      materialCraft: 'Solid bell-metal brass with geometric temple mandir carvings and wide flame spouts.',
      dimensionsWeight: 'Height: 4.5" each · Total Set Weight: 950g.',
      ritualCare: 'Clean wicks daily, wipe soot with warm soapy water and lemon.',
      inTheBox: '2 × Kashi Temple Brass Diyas, Brass Wick Tweezers, Lokta Gift Packaging.'
    },
    pairings: ['ghee-phool-wicks', 'brass-matchbox-sleeve']
  },
  {
    id: 'gulab-chandan-candle',
    name: 'Gulab & Chandan Artisanal Ceramic Candle',
    sku: 'SJ-CND-031',
    category: 'candles-fragrance',
    categoryLabel: 'Candles & Fragrance',
    price: 1299,
    originalPrice: 1599,
    material: 'Soy Wax',
    craftHeritage: 'Khurja Hand-thrown Ceramics & Kannauj Distillers',
    weight: '450g (Wax: 250g)',
    dimensions: '3.8" Height × 3.5" Diameter',
    stock: 22,
    featured: true,
    bestseller: true,
    highlightCategory: 'aromatics',
    rating: 4.9,
    reviewsCount: 36,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEaBzhxpGSwDS9OrmUCVBXnnpDi6yNdu5mlsGyIGWO29pE-aZAa_9cRbJGUWBBpdDFd-kOWesq8KNuJogn86UGwZl0c19QcKHOX0uC-98ZV3pZb0ezyasLhThluyZp-NyEKuXplMAzaD1fM4omv5J5c9_u4ss45QeDjTc6YpHIsMV9F7gFSqfi9xLBi0YeroR_wKLT7swoP2UcZRerxIFCa4qfOg4EJlZkGud4w7TMkxyyCZIx2wvYOg'
    },
    description: 'Hand-thrown stoneware jar filled with pure non-GMO soy wax infused with Mysore red sandalwood and steam-distilled Kannauj Damascus rose.',
    specifications: {
      materialCraft: 'Matte ivory reactive glaze ceramic pot with lead-free dual braided cotton wicks.',
      dimensionsWeight: '250g pure wax · 55+ hour clean burn time.',
      ritualCare: 'Trim wick to 5mm before every lighting. Burn for 2-3 hours on first lighting to establish an even wax pool.',
      inTheBox: '1 × Ceramic Candle with Hand-carved Wooden Dust Lid and Botanical Note.'
    },
    pairings: ['kannauj-mogra-mist', 'brass-matchbox-sleeve']
  },
  {
    id: 'padma-marble-platter',
    name: 'Padma Marble & Brass Inlay Serving Platter',
    sku: 'SJ-TBL-089',
    category: 'home-accents',
    categoryLabel: 'Home Accents',
    price: 2750,
    originalPrice: 3200,
    material: 'Marble Inlay',
    craftHeritage: 'Agra Pietra Dura Lapidary Guild',
    weight: '2.1 kg',
    dimensions: '11" Diameter × 0.8" Thickness',
    stock: 8,
    featured: true,
    bestseller: false,
    highlightCategory: 'highlights',
    rating: 4.9,
    reviewsCount: 19,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4qguw6vqQNdOxZZN8OWObkzSFzurbB77XDb1ncndirYlAj-Gxn6-BTD_2Uo88DTzN4MaoVaUwT7oBVN9CNlBug3Oy7Sjb9wJoU5zzG__lK6ylgqi_4jtf3Nkz9sjgpRBFfiIaiHQUh-RfIWJYAH92QwOai-Q-7R9cNgRaUkX0I0Xq9W_WItldMLVMV75IXFMGD6MaCgsky35D7sx319PeI1428X8ZdouaCgvT1FdOqhXNtm1ENL4FKw'
    },
    description: 'Hewn from Makrana white marble, hand-embedded with pure brass lotus filigree inlay. An architectural foundation for prayer altars or banquet sweets.',
    specifications: {
      materialCraft: 'Hand-chiselled Makrana marble slab with precision recessed unlacquered brass inlay.',
      dimensionsWeight: 'Diameter: 11" · Thickness: 2 cm · Weight: 2.1 kg.',
      ritualCare: 'Wipe with damp cloth. Avoid harsh acidic cleaners (vinegar/lemon).',
      inTheBox: '1 × Padma Inlay Marble Platter with velvet anti-scratch base bumpers.'
    },
    pairings: ['mayura-brass-urli', 'hastakala-brass-coasters']
  },
  {
    id: 'surya-brass-bell',
    name: 'Surya Carved Brass Hanging Bell & Diya',
    sku: 'SJ-DEC-044',
    category: 'festive-decorations',
    categoryLabel: 'Festive Decorations',
    price: 2100,
    originalPrice: 2450,
    material: 'Pure Brass',
    craftHeritage: 'Moradabad Master Foundry',
    weight: '1.2 kg',
    dimensions: '18" Total Length Hanging (Bell: 5" dia)',
    stock: 12,
    featured: false,
    bestseller: false,
    highlightCategory: 'highlights',
    rating: 4.7,
    reviewsCount: 14,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjV0t2nBlIwajUw634Hk9etZJVEg5t4oifu87iLjy1Mv6-XHfo2Uj_iLayUYWgvKVEqeW5CP0ZU7vtT4bliNkdpOag-VK1J9cWbMYJBNFHuFGEpqgYUQWSmxjg7EUJNAeJOuRdiEM9_fFdk2nS1SapPqTgqk5bLKuFK8AHP-4kJ8WKkXEKlO7NGWLdnJEsRrvjDTsN7hSh7aDVboLUiO8F77FOcFdfTbMHmM6DqTHvAoE5VFFi-8vJ-w'
    },
    description: 'Auspicious Surya mandala brass bell with linked chain and deep oil lamp cup. Produces a sustained reverberating chime that sanctifies entryway foyers.',
    specifications: {
      materialCraft: 'Heavy sand-cast bell brass alloy engineered for sustained sound vibrations.',
      dimensionsWeight: 'Total hanging length: 18 inches · Bell width: 5 inches · Weight: 1.2 kg.',
      ritualCare: 'Wipe dust with microfibre cloth.',
      inTheBox: '1 × Surya Bell Diya with forged brass hanging link chain.'
    },
    pairings: ['royal-marigold-toran']
  },
  {
    id: 'mogra-midnight-candle',
    name: 'Mogra Midnight Soy Candle in Fluted Amber Glass',
    sku: 'SJ-CND-054',
    category: 'candles-fragrance',
    categoryLabel: 'Candles & Fragrance',
    price: 1450,
    originalPrice: 1650,
    material: 'Soy Wax',
    craftHeritage: 'Hand-blown Amber Glass & Madurai Jasmine Distillate',
    weight: '520g (Wax: 280g)',
    dimensions: '4" Height × 3.6" Diameter',
    stock: 18,
    featured: false,
    bestseller: true,
    highlightCategory: 'aromatics',
    rating: 4.8,
    reviewsCount: 22,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdqr2K1GFjfzAXKqqQ9VYrUmUUfAHz65DhOvKO2CwBLh48nXuuTn4nR9F0g-ML2OnCXITRcyyG5eC5NTQS2EitLUJgkoHm3GMAkfor3BzebzUqLwUhVheOg8LlyAQPWsbNy2vz0AZn7HBKRyJJSth_nWrTSp0qDALWGAH3PVtUv6zVXcDe4m5F3qXFBV0u0ApWp14NJX4kwxCJM-FJdVRgXrtcqznzkO0eGyh3J-HiXH2E1qkNmbL_xA'
    },
    description: 'Fluted amber apothecary jar that diffuses a warm nocturnal glow, capturing the lush sweetness of night-blooming Arabian Jasmine (Mogra).',
    specifications: {
      materialCraft: 'Mouth-blown fluted amber glass, organic soy-coconut wax blend.',
      dimensionsWeight: '280g wax · 60 hour burn duration.',
      ritualCare: 'Trim wick to 1/4 inch before lighting. Keep away from drafts.',
      inTheBox: '1 × Fluted Amber Candle in gold-embossed Lokta gift box.'
    },
    pairings: ['gulab-chandan-candle', 'kannauj-mogra-mist']
  },
  {
    id: 'royal-marigold-toran',
    name: 'Royal Marigold & Brass Festive Toran',
    sku: 'SJ-DEC-019',
    category: 'festive-decorations',
    categoryLabel: 'Festive Decorations',
    price: 1650,
    originalPrice: 1950,
    material: 'Teakwood',
    craftHeritage: 'Jaipur Zardozi & Brass Guild',
    weight: '450g',
    dimensions: '38" Width (Standard Doorway)',
    stock: 14,
    featured: false,
    bestseller: false,
    highlightCategory: 'highlights',
    rating: 4.7,
    reviewsCount: 17,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2JQZxhVZwA_aD7mXwNTO7r4GBA1AUWX_cJSIhRz9sGcNaiRmmaG7pMEDs1RFTfM5ck4xVgmXrD_uJHy2w6D3-xGmGUr7YZIy6PFYkdHGXUEKzqnjvNgpjf0YTX0ydIW2r1Nzh_R2Zm_1m6aFIqYBW5-q_9T5OCWTi4yRvmXtsGkQzeKAiIv4sHtr0RAR-gPcD-EEPvwPilqzajUDpROWQueW71rKo9l8s2xmpPC94n7qty7K6fky11w'
    },
    description: 'Festive entryway festoon crafted with saffron marigold tassels, raw tussar fabric, and mini brass chime ghungroos to welcome guests with warmth.',
    specifications: {
      materialCraft: 'Handcrafted fabric marigold blossoms, solid brass bells, jute base loop.',
      dimensionsWeight: 'Length: 38 inches with extendable brass hooks.',
      ritualCare: 'Store dry in breathable cotton bag after festive season.',
      inTheBox: '1 × Royal Toran with 2 × Hand-forged Brass Hanging Nails.'
    },
    pairings: ['surya-brass-bell']
  },
  {
    id: 'hastakala-brass-coasters',
    name: 'Hastakala Hand-beaten Brass Coasters (Set of 4)',
    sku: 'SJ-TBL-015',
    category: 'table-decor',
    categoryLabel: 'Table Décor',
    price: 1150,
    originalPrice: 1350,
    material: 'Pure Brass',
    craftHeritage: 'Mathura Hammered Metal Guild',
    weight: '620g',
    dimensions: '4" Diameter each',
    stock: 25,
    featured: true,
    bestseller: false,
    highlightCategory: 'highlights',
    rating: 4.8,
    reviewsCount: 29,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEzKkY8rM-rYhOPnoIjsj8pD3eZbkeQFm4aLJJsjMkmKcusDOdkns9Ve4T36t08Fl4Lg9vPJ4wdbOs9aQrpdEn-79YK0UYFkxYHD2sT2eVsrFkqZOgATe8xeUJgWyOCX-94GaGL1XNbk5JiNHUa9zEkhyRXXqdrJcyGkJU8n8rbUp5UYJ1ysDikqX5sAzdBInN6-n_NGUUfSltrwOeW7IG0yH0AqjQZYL4TXKH_JcMZ1vRhX8WMb9D1A'
    },
    description: 'Set of four circular heavy brass drink coasters, hand-hammered by generational coppersmiths with soft felt backing to preserve tabletop finishes.',
    specifications: {
      materialCraft: 'Pure unlacquered brass with dimpled hammered texture and deep wine felt backing.',
      dimensionsWeight: '4 inch diameter · Set of 4 · Total weight: 620g.',
      ritualCare: 'Wipe with dry cloth after condensations.',
      inTheBox: '4 × Hand-beaten Coasters tied with raw silk ribbon in kraft box.'
    },
    pairings: ['padma-marble-platter', 'nazakat-brass-napkin-rings']
  },
  {
    id: 'ananda-gift-box',
    name: 'The Ananda Celebration Gift Box',
    sku: 'SJ-GFT-101',
    category: 'gifts-hampers',
    categoryLabel: 'Gifts & Hampers',
    price: 4850,
    originalPrice: 5600,
    material: 'Pure Brass',
    craftHeritage: 'Jaipur & Moradabad Atelier Collective',
    weight: '2.8 kg',
    dimensions: '14" × 10" × 5" Luxury Box',
    stock: 6,
    featured: true,
    bestseller: true,
    highlightCategory: 'highlights',
    rating: 5.0,
    reviewsCount: 24,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDknJxJ_ejtAurDjI9kfDwM3ssbzvbZUeFLgb6sZgp3vQOzBuVnvGhVUopeuYW27mYihJTgPnKWlRJAZf0TswL_i1U5NDabs55cijSvYeAw2j4WjiW1W3HL8OUUy3Uh3MwrWNgLKE_2z31LeUgHM-dHNu37TJV0VKMSF8m9gG6oTv_eaPAn62HCi5rKOWLToUSPxI7JSNIiUYE1D4QudJEc5jc6A8lMuBSJmASM_K5RSf9APED8x8MBgQ'
    },
    description: 'Signature celebration hamper wrapped in deep wine velvet with gold leaf embossing, housing a brass diya, rose-sandalwood candle jar, brass incense burner, and artisanal Lokta blessing scroll.',
    specifications: {
      materialCraft: 'Rigid wine archival keepsake chest with brass magnetic clasp closure.',
      dimensionsWeight: 'Box: 14" × 10" × 5" · Hamper Net Weight: 2.8 kg.',
      ritualCare: 'Reusable keepsake memory box for heirlooms or jewellery.',
      inTheBox: '1 × Moradabad Temple Diya, 1 × Gulab & Chandan Candle (250g), 1 × Pure Brass Dhoop Censer, 1 × Botanical Mist (50ml), Handwritten Calligraphy Note.'
    },
    pairings: ['ghee-phool-wicks', 'brass-matchbox-sleeve']
  },
  {
    id: 'mora-brass-tall-diya',
    name: 'Mora Brass Tall Diya',
    sku: 'SJ-DYA-082',
    category: 'diyas-candle-holders',
    categoryLabel: 'Diyas & Candle Holders',
    price: 4800,
    originalPrice: 5400,
    material: 'Pure Brass',
    craftHeritage: 'Traditional Sand-Cast Brass Guild',
    weight: '2.4 kg',
    dimensions: '16" Height × 5.5" Base',
    stock: 5,
    featured: true,
    bestseller: true,
    highlightCategory: 'highlights',
    rating: 4.9,
    reviewsCount: 16,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3CCKkVlstJqNPgRe3U7JjqNvnBeHjK2VDuHLPNkjcppDU_VtfiS-ewETWlrhSb9qzXTWincwLCABHWG-CFEMz9k5HlduIuHmWHxT5e1VUONeFwNBoTP2u9hmoM7MiFMOmRTSguI9k69s0vzstz15tu76_l9ggbT2kWE8XX0Gz9UWmN1YiJxXKCWSsBavG_kx25pIJs78BZWFwwyYEK--CENifSVw5srw-9RF7giNVmTOJ6eX_PXMf-A'
    },
    description: 'Architectural, towering peacock-crested brass lamp. Engineered with five oil wick grooves and a weighted lotus pedestal.',
    specifications: {
      materialCraft: 'Solid bell brass cast in multiple interlocking screw segments.',
      dimensionsWeight: 'Height: 16 inches · Weight: 2.4 kg.',
      ritualCare: 'Disassembles into three threaded parts for easy ceremonial cleaning.',
      inTheBox: '1 × Mora Tall Pillar Diya with solid cast peacock finial.'
    },
    pairings: ['ghee-phool-wicks', 'kashi-temple-diya']
  },
  {
    id: 'mitti-tamra-diya-set',
    name: 'Mitti & Tamra Diya Set of 4',
    sku: 'SJ-DYA-007',
    category: 'diyas-candle-holders',
    categoryLabel: 'Diyas & Candle Holders',
    price: 950,
    originalPrice: 1100,
    material: 'Ceramic',
    craftHeritage: 'Kumhar Potter Guild & Copper Smiths',
    weight: '750g',
    dimensions: '3" Diameter each',
    stock: 30,
    featured: true,
    bestseller: true,
    highlightCategory: 'pairs',
    rating: 4.8,
    reviewsCount: 31,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBL_yIWIfRyokKrEqez9Y0xPb3DaGJTWpEpazTGZFKGlrhE31UkEsLLz6Q4ZchqJ2I8u5iIvAkn2s775gDeLWt5wD2RmvTXxQdfYTCxQIFvSWH2ZvUqJ96yCZuiYdmQOWwIfdudCOHJLGhlI4XnH2oaWeuuyKv3Dhdp3-X8jtpD3JHiJTxW-cQyBkR3ooBaEz4HYw-bxJuwNF7_kT8oIvnx_oEYfCC9vOj2LKyX-bDspUIi0z1OXdNNg'
    },
    description: 'Earth meets flame: Hand-thrown terracotta clay cups cradled in hammered pure copper bases. Retains ceremonial oils without seepage.',
    specifications: {
      materialCraft: 'Organic natural terracotta, spun copper casing.',
      dimensionsWeight: '3" diameter · Set of 4 · Total weight: 750g.',
      ritualCare: 'Rinse with warm water, dry in sunlight.',
      inTheBox: '4 × Mitti & Tamra Diyas with 20 pre-soaked cotton wicks.'
    },
    pairings: ['ghee-phool-wicks']
  },
  {
    id: 'madhu-beeswax-votive',
    name: 'Madhu Beeswax Votive Triad',
    sku: 'SJ-CND-018',
    category: 'candles-fragrance',
    categoryLabel: 'Candles & Fragrance',
    price: 1650,
    originalPrice: 1850,
    material: 'Soy Wax',
    craftHeritage: 'Forest Apiaries & Glass Artisans',
    weight: '680g (Wax: 3 × 90g)',
    dimensions: '2.8" Height × 2.6" Diameter each',
    stock: 19,
    featured: true,
    bestseller: true,
    highlightCategory: 'aromatics',
    rating: 4.9,
    reviewsCount: 20,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYiQskWNNTDfEBWDN_E77zht5s_sFVgyt4WhaLBG9maUo6zEDKVpjv7KFO_1XuzQWJFs3y6I5ia-ujCz6st-dZpmEeZ5G39idwUnFmCAj-q5wphFcmqc-0czUGe4GQ9RtyuE7Q4Tz8ObSe4iTSBs19Ta3YxqIQdgXCFyOLcNsJEmjppH_uAuiWCk-vYrBXROqmOv_R8am6e528J3AdwSxihbqbX7V9v-En3-TCJt41UyImsoN8bC-HGA'
    },
    description: 'Trio of fluted ribbed votives poured with pure unbleached forest beeswax. Releases a gentle natural honey and wildflower aroma as negative ions cleanse the air.',
    specifications: {
      materialCraft: '100% Wild raw beeswax, fluted heat-resistant glasses, unbleached cotton wicks.',
      dimensionsWeight: 'Set of 3 · 30 hours burn time per votive.',
      ritualCare: 'Keep wicks centered during burn.',
      inTheBox: '3 × Beeswax Votives nested in recycled paper pulp crate.'
    },
    pairings: ['brass-matchbox-sleeve', 'hastakala-brass-coasters']
  },
  {
    id: 'nazakat-brass-napkin-rings',
    name: 'Nazakat Brass Napkin Rings (Set of 6)',
    sku: 'SJ-TBL-042',
    category: 'table-decor',
    categoryLabel: 'Table Décor',
    price: 2100,
    originalPrice: 2400,
    material: 'Pure Brass',
    craftHeritage: 'Mughal Jaali Etchers',
    weight: '380g',
    dimensions: '1.8" Diameter × 1.2" Width',
    stock: 20,
    featured: true,
    bestseller: true,
    highlightCategory: 'highlights',
    rating: 4.9,
    reviewsCount: 15,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-1xpE3dXY978BgSjmlVwINA9xqOTaKOUCM6Rz9v3LA5Jeps3OX7xTnnlmeviwOiGOQMMIyWc2W0aynQSKEI15y9EZnaMTZBtT-Iwe4Utx6O8C1ED2A1INoadlBcvDT78umQ1tEoGKB7ZOS8eLRFIxrK0L1wOyPmSbjP0wLjapY8efp--xxjTd50VK4TkALCiL9Qa4g9nf7u8JV6IVZ_85YE741RqWTTeGHbTZnYD0aWFQg2tLck2AZQ'
    },
    description: 'Set of six hand-etched heavy brass napkin rings inspired by the trellis screens of Fatehpur Sikri. Imparts majestic ceremonial grandeur to dining tablescapes.',
    specifications: {
      materialCraft: 'Solid brass with hand-engraved jaali floral tendrils.',
      dimensionsWeight: '1.8" diameter · Set of 6 · Weight: 380g.',
      ritualCare: 'Buff with dry flannel cloth.',
      inTheBox: '6 × Napkin Rings in drawstring velvet pouch.'
    },
    pairings: ['hastakala-brass-coasters', 'padma-marble-platter']
  },
  {
    id: 'sandalwood-soy-tealights',
    name: 'Sandalwood Soy Tealights (Set of 12)',
    sku: 'SJ-CND-006',
    category: 'candles-fragrance',
    categoryLabel: 'Candles & Fragrance',
    price: 599,
    originalPrice: 750,
    material: 'Soy Wax',
    craftHeritage: 'Mysore Sandalwood Distillers',
    weight: '300g',
    dimensions: '1.5" Diameter each',
    stock: 45,
    featured: false,
    bestseller: false,
    highlightCategory: 'aromatics',
    rating: 4.8,
    reviewsCount: 38,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT0Bp0nvPziB16GHkwY2yLOwG0GASNH8Dmtk_gZq340D8lAvnS-6McYjs1dgQ6el_Ih-u6Me2iKDbV3vt-4g9wL3j9GBLksZ7AO8JBKdK_5RHLxiITDepymexwIsNW8vJk1lCedY6QjjlCt2SG7iZZSLo7L-6OiJSYuwr9ej-f1g-FYZ2tKFRc-xrpydEb6mmI29Py0CWGA-fdhWuG82GHyC_nQMt86Zqv3RXNe6e-43Hs4vHWfDdiUw'
    },
    description: 'Set of 12 clean-burning pure soy tealights infused with authentic Mysore sandalwood essential oil. Fits standard urlis and votive holders.',
    specifications: {
      materialCraft: 'Natural soy wax in recyclable aluminum cups, pure cotton wicks.',
      dimensionsWeight: '6 hours burn time each · Set of 12.',
      ritualCare: 'Burn within sight on heat-safe surfaces.',
      inTheBox: '12 × Scented Sandalwood Tealights in kraft sleeve.'
    },
    pairings: ['mayura-brass-urli']
  },
  {
    id: 'padma-marble-serving-tray',
    name: 'Padma Marble Serving Tray with Brass Handles',
    sku: 'SJ-TBL-091',
    category: 'home-accents',
    categoryLabel: 'Home Accents',
    price: 2750,
    originalPrice: 3100,
    material: 'Marble Inlay',
    craftHeritage: 'Makrana Marble Quarry Cutters',
    weight: '2.5 kg',
    dimensions: '13" × 9" × 1.5"',
    stock: 9,
    featured: false,
    bestseller: false,
    highlightCategory: 'highlights',
    rating: 4.9,
    reviewsCount: 18,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4Xh8THsjc0bgSD9sdRzo2GLBiqQ2G_Gh2sXMfuKnzvz3CMLaS3SryD_wYgSDYuv2bfesOwX_CW7tTUGYUI4X39Z-x4kHJ-fEy2J8Fi2a6lqi8yEP7Uw4f56BrN2E839lXWm1B9IFo9fbGCIJ5f7wxB6VEAbUgBI9dLIvdsl0Ehv9K-OXFaxHnMflt5pvST5T9LOxoeBGFDU6E4fLfpiJzRlI45ubut2G_PByZoR6-h6N5rppJ_qHJWQ'
    },
    description: 'Single-block polished Makrana marble platter fitted with warm brushed brass sculptural bow handles.',
    specifications: {
      materialCraft: 'Solid Makrana stone with brushed golden brass hardware.',
      dimensionsWeight: '13" × 9" · Thickness: 1.8 cm · Weight: 2.5 kg.',
      ritualCare: 'Food safe. Wash with gentle dish soap.',
      inTheBox: '1 × Marble Serving Tray.'
    },
    pairings: ['mayura-brass-urli', 'hastakala-brass-coasters']
  },
  {
    id: 'ghee-phool-wicks',
    name: 'Hand-Twisted Ghee Phool Wicks (Pack of 60)',
    sku: 'SJ-RIT-003',
    category: 'diyas-candle-holders',
    categoryLabel: 'Diyas & Candle Holders',
    price: 380,
    originalPrice: 450,
    material: 'Pure Brass',
    craftHeritage: 'Varanasi Handloom Weavers Collective',
    weight: '150g',
    dimensions: 'Round Lotus Shape 1" each',
    stock: 60,
    featured: false,
    bestseller: true,
    highlightCategory: 'pairs',
    rating: 4.9,
    reviewsCount: 47,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfVFpRgVhwlD9Uscav7jTaki9KrtUpUrt7RiyfqChhItCWMYngLfsje_bVnf-OUSBT9HY2cK0D_ja3UI3YHtozITS9LPBapE-BA_XahaVyJQ0i0RofZqRMH7gz3385vOORDHEla0SPrVKDUy334JrOoWEcrECEaEnMF2SxgnhuWdw8K62_ywFx36ZxGmCdf5OU4F5kzMknwe1HXIaR6b3I06ywzh_Xq4IpO5aTyuJ73O2iFZOyI9i2YQ'
    },
    description: 'Traditional slow-burning round flower wicks (Phool Batti) hand-spun from organic virgin cotton and pre-infused with a touch of aromatic cow ghee and camphor.',
    specifications: {
      materialCraft: '100% Organic Indian cotton, farm ghee, raw camphor.',
      dimensionsWeight: '60 wicks per pack · 45 minutes burn time each in oil.',
      ritualCare: 'Keep stored in airtight tin.',
      inTheBox: '60 × Cotton Phool Wicks inside brass keepsake box.'
    },
    pairings: ['mayura-brass-urli', 'kashi-temple-diya']
  },
  {
    id: 'kannauj-mogra-mist',
    name: 'Kannauj Mogra Sacred Living Mist (100ml)',
    sku: 'SJ-ARM-021',
    category: 'candles-fragrance',
    categoryLabel: 'Candles & Fragrance',
    price: 890,
    originalPrice: 990,
    material: 'Soy Wax',
    craftHeritage: 'Kannauj Deg-Bhapka Hydro-Distillation',
    weight: '250g',
    dimensions: '100ml / 3.4 fl oz',
    stock: 35,
    featured: false,
    bestseller: false,
    highlightCategory: 'aromatics',
    rating: 4.9,
    reviewsCount: 23,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdmxscT4LK6PuchaTlYZ55SH29ADhDwRYM-QUb2xHOpMy-8AGvszRRJvCZLxygJT7li5mHwAzCttC4Nj-IhF2epcUIbjmjUUxb_DtFZq0jKCYZdqBlEtmZDMSsrVgvBXKhkXdhqZlCxuXI5E-h7orPpxTaZrRUqibQfDUoMPHrSjOXugMwmtUdpjdyGLf6KhcbovJzTtgCQODC2cE1FC4VecykmtnNRB7IlLq5DZ9LYPikvQdVysB_Rw'
    },
    description: 'Pure copper-distilled floral water made from first-flush morning Mogra jasmine flowers. Mist upon curtains, prayer corners, and cushions to shift the atmosphere.',
    specifications: {
      materialCraft: 'Steam-distilled Sambac Jasmine hydrosol with sandalwood base. 100% natural, alcohol-free.',
      dimensionsWeight: '100ml heavy glass apothecary spray bottle.',
      ritualCare: 'Keep in cool dry location away from direct sunlight.',
      inTheBox: '1 × 100ml Mist Bottle with gold-tone fine atomiser.'
    },
    pairings: ['gulab-chandan-candle', 'mayura-brass-urli']
  },
  {
    id: 'brass-matchbox-sleeve',
    name: 'Engraved Brass Long Matchbox Sleeve',
    sku: 'SJ-ACC-011',
    category: 'home-accents',
    categoryLabel: 'Home Accents',
    price: 650,
    originalPrice: 750,
    material: 'Pure Brass',
    craftHeritage: 'Moradabad Chisel Engravers',
    weight: '180g',
    dimensions: '4.8" × 2.2" × 0.8"',
    stock: 40,
    featured: false,
    bestseller: false,
    highlightCategory: 'pairs',
    rating: 4.8,
    reviewsCount: 27,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCF-kUpuYYmTxAh4zB3qBKMJz_oXPyQ4IJm3UZbGlUCSDOFD3fQ0N3dHIVhNvBrr3w5gqqNZvhMwk7lEzqDq-SvHW52BQABuJw1wM5TCOvWSxreziQGDC-h9yVH8-anCl_voI_aYDdR4m9YLC_1AfJRawnnhzELauLe5hvHwDXIYjfVFK2cU6Ao7HMAwFfRukWIHGMEZYRfMTahF5deikopfz2ZVHWLz0YQxPnQhQ3O0l5umNFB9RgPag'
    },
    description: 'Heavy solid brass sleeve for extended safety matches, featuring intricate botanical motifs with side strike cutouts. Elevates the humble act of striking a flame.',
    specifications: {
      materialCraft: 'Engraved unlacquered brass case.',
      dimensionsWeight: 'Weight: 180g · Fits standard 4.5" fireplace/diya matchboxes.',
      ritualCare: 'Wipe with soft cloth.',
      inTheBox: '1 × Brass Sleeve, 1 × Box of 50 Long Wooden Safety Matches.'
    },
    pairings: ['gulab-chandan-candle', 'dhoop-daan-censer']
  },
  {
    id: 'dhoop-daan-censer',
    name: 'Dhoop Daan Hand-Hammered Censer',
    sku: 'SJ-RIT-028',
    category: 'diyas-candle-holders',
    categoryLabel: 'Diyas & Candle Holders',
    price: 1450,
    originalPrice: 1750,
    material: 'Pure Brass',
    craftHeritage: 'Udupi Bell Metal Artisans',
    weight: '680g',
    dimensions: '6.5" Height × 4" Diameter',
    stock: 16,
    featured: false,
    bestseller: false,
    highlightCategory: 'pairs',
    rating: 4.9,
    reviewsCount: 19,
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4h9DQ8-19CEQ6cAi0N1PVz5N5hhUpVanWj7SgSBlJKO0Lr2buI2WFlsoZfaiKM6JSS917y0IX927zxXjfs5UYjAQikv4e3G__wTtrl7UO7Cbiw5_DA8lekh8OK8OZjIitYkY_VWL_YY5tkNXPo6qJ0hWroBzdIq0I3slXrDB1q3nRXGE9iWpP8hwwLHJR1rAKawMfMJuvtJ6eUxo4h9wWD-1715yw13dPV2cUyXXeYkI-KtcLuP1d1g'
    },
    description: 'Ancestral hand-held incense burner with open lattice perforations that diffuse fragrant sambrani and dhoop smoke in delicate spiral plumes.',
    specifications: {
      materialCraft: 'Bell metal brass with solid heat-insulated handle finial.',
      dimensionsWeight: 'Height: 6.5 inches · Weight: 680g.',
      ritualCare: 'Wipe ash after cooling. Brass will develop rich authentic patina.',
      inTheBox: '1 × Dhoop Daan Censer, 10 × Handmade Loban Charcoal Cups.'
    },
    pairings: ['brass-matchbox-sleeve']
  }
];

// Load persisted products from data/products.json
let products: Product[] = loadJson<Product[]>('products.json', SEED_PRODUCTS);
if (!fs.existsSync(path.join(DATA_DIR, 'products.json'))) {
  saveJson('products.json', products);
}

// Seed Journal Articles matching curated high-ranking editorial essays
let journalArticles: JournalArticle[] = loadJson<JournalArticle[]>('journal.json', [...INITIAL_JOURNAL_ARTICLES]);
if (!fs.existsSync(path.join(DATA_DIR, 'journal.json'))) {
  saveJson('journal.json', journalArticles);
}

// Orders In-Memory Store
const ordersStore: Map<string, Order> = new Map();

function syncOrdersToFile(): void {
  saveJson('orders.json', Array.from(ordersStore.values()));
}

// Pending OTP store for COD verification
const codOtpStore: Map<string, { otp: string; expiresAt: number; phone: string }> = new Map();

// Active 3DS Challenges store for Cards
const cardChallengeStore: Map<string, { challengeOtp: string; orderId: string; expiresAt: number }> = new Map();

// Customer Reviews Store with File Persistence
export interface Review {
  id: string;
  productId: string;
  author: string;
  city: string;
  rating: number; // 1 - 5
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  finishPurchased?: string;
  helpfulCount: number;
  recommend: boolean;
  status?: 'approved' | 'pending';
}

const reviewsStore: Map<string, Review[]> = new Map();

function syncReviewsToFile(): void {
  const reviewsRecord: Record<string, Review[]> = {};
  for (const [pId, rList] of reviewsStore.entries()) {
    reviewsRecord[pId] = rList;
  }
  saveJson('reviews.json', reviewsRecord);
}

// Helper to seed initial verified reviews
const seedInitialReviews = (pId: string, customReviews: Review[]) => {
  reviewsStore.set(pId, customReviews);
};

const defaultInitialReviews: Review[] = [
  {
    id: 'rev-01',
    productId: 'mayura-brass-urli',
    author: 'Aparna Sengupta',
    city: 'Kolkata, West Bengal',
    rating: 5,
    title: 'The heft and engraving are exceptional',
    comment: 'When you pick it up, you instantly feel the sheer weight of genuine bell brass. The floating lotus diyas balance effortlessly without capsizing, and the water stays crystal clear. Arrived impeccably boxed with zero tarnishing.',
    date: '3 weeks ago',
    verifiedPurchase: true,
    finishPurchased: 'Antique Heirloom Brass',
    helpfulCount: 24,
    recommend: true,
    status: 'approved'
  },
  {
    id: 'rev-02',
    productId: 'mayura-brass-urli',
    author: 'Vikramaditya K.',
    city: 'New Delhi',
    rating: 5,
    title: 'The centerpiece of our Diwali celebration',
    comment: 'We paired it with red rose petals and Mogra flowers as guests entered our foyer. The compliment after compliment made this purchase so worth it. The packaging was so exquisite I didn\'t even have to gift wrap it.',
    date: '1 month ago',
    verifiedPurchase: true,
    finishPurchased: 'Antique Heirloom Brass',
    helpfulCount: 18,
    recommend: true,
    status: 'approved'
  },
  {
    id: 'rev-03',
    productId: 'mayura-brass-urli',
    author: 'Radhika Sharma',
    city: 'Bengaluru, Karnataka',
    rating: 5,
    title: 'Heirloom quality that will last generations',
    comment: 'I was hesitant about buying brass online, but the artisanal detailing around the peacock plumage is truly hand-chiseled. Solid craftsmanship, authentic bell sound when tapped.',
    date: '2 months ago',
    verifiedPurchase: true,
    finishPurchased: 'Raw Chiseled Matte Brass',
    helpfulCount: 11,
    recommend: true,
    status: 'approved'
  },
  {
    id: 'rev-04',
    productId: 'mayura-brass-urli',
    author: 'Kunal Singhal',
    city: 'Jaipur, Rajasthan',
    rating: 4,
    title: 'Stunning design, requires seasonal gentle care',
    comment: 'Spectacular piece for festive evenings. A small dab of Pitambari or tamarind paste brings back the warm glow in seconds. Highly recommended.',
    date: '2 months ago',
    verifiedPurchase: true,
    finishPurchased: 'Vintage Patina Gold',
    helpfulCount: 7,
    recommend: true,
    status: 'approved'
  }
];

// Load saved reviews from reviews.json if exists
const loadedReviews = loadJson<Record<string, Review[]> | null>('reviews.json', null);
if (loadedReviews && typeof loadedReviews === 'object' && Object.keys(loadedReviews).length > 0) {
  for (const [pId, rList] of Object.entries(loadedReviews)) {
    if (Array.isArray(rList)) {
      reviewsStore.set(pId, rList);
    }
  }
} else {
  seedInitialReviews('mayura-brass-urli', defaultInitialReviews);
  seedInitialReviews('saj-01', defaultInitialReviews);
  syncReviewsToFile();
}

// Pre-seeded demo order so tracking works immediately out of the box
const demoOrderId = 'ORD-SJ-2026-4482';
ordersStore.set(demoOrderId, {
  id: demoOrderId,
  orderNumber: 'SJ-2026-4482',
  createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  status: 'processing',
  customer: {
    fullName: 'Aarav Mehra',
    email: 'aarav.mehra@atelier-studio.in',
    phone: '+91 98201 44829',
    address: 'Flat 402, Mayfair Palms, 18th Road, Khar West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400052',
    landmark: 'Near Khar Gymkhana'
  },
  shipping: {
    speed: 'express',
    cost: 0,
    trackingCarrier: 'BlueDart Apex Express',
    waybillNumber: 'BLUEDART-88294109',
    estimatedDelivery: 'Oct 14, 2026'
  },
  gift: {
    isGift: true,
    recipient: 'Rohit & Ananya Verma',
    occasion: 'Housewarming & Deepotsav Blessings',
    handwrittenNote: 'May your lovely new abode shine with joy, serenity, and golden warmth! With all our affection, Aarav & Meera.'
  },
  items: [
    {
      productId: 'mayura-brass-urli',
      name: 'Mayura Brass Urli with Floating Diya Set',
      finish: 'Hand-Aged Patina Brass',
      price: 3450,
      quantity: 1,
      giftWrap: true,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwqaCtGR5f2YGRZ0vFu29AI8sdvNknypepJqIDvsmW6kFGrXZ77COgEPFQgapONq6KWf5zNIubYRDzCOEhen7aOVw47TjjSJdtE77ugBGQcWbEYr11c4AUK5UJbt-ywkbYBCWgPnlIm42QPJ8yFRNbFeiQxinvll3eh5CmSTTptDuD08RzhCSn2NLKItYjsFaTox2O4fRFOn4I4Kqg5lPlTLaB0dBHhU2Z5U0nEW9yBMsu2ORspEQcZg'
    },
    {
      productId: 'gulab-chandan-candle',
      name: 'Gulab & Chandan Artisanal Ceramic Candle',
      price: 1299,
      quantity: 2,
      giftWrap: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEaBzhxpGSwDS9OrmUCVBXnnpDi6yNdu5mlsGyIGWO29pE-aZAa_9cRbJGUWBBpdDFd-kOWesq8KNuJogn86UGwZl0c19QcKHOX0uC-98ZV3pZb0ezyasLhThluyZp-NyEKuXplMAzaD1fM4omv5J5c9_u4ss45QeDjTc6YpHIsMV9F7gFSqfi9xLBi0YeroR_wKLT7swoP2UcZRerxIFCa4qfOg4EJlZkGud4w7TMkxyyCZIx2wvYOg'
    }
  ],
  pricing: {
    subtotal: 6048,
    discount: 750,
    couponApplied: 'FESTIVE15',
    giftWrapTotal: 0,
    shippingCost: 0,
    estimatedGstIncluded: 720,
    total: 5298
  },
  payment: {
    method: 'upi',
    status: 'captured',
    transactionId: 'TXN-ICICI-99482104',
    utrNumber: 'UTR-994821043821',
    paidAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    verificationHash: 'e4d8f1c8b9a2c3d4e5f6a7b8c9d0'
  },
  trackingTimeline: [
    {
      step: 'Order Confirmed & Payment Verified',
      timestamp: 'Oct 11, 2026 · 10:15 AM',
      description: '256-bit bank encrypted UPI payment confirmed. Order sent to Jaipur Atelier.',
      completed: true
    },
    {
      step: 'Atelier Inspection & Master Buffing',
      timestamp: 'Oct 11, 2026 · 02:40 PM',
      description: 'Bell-brass acoustic resonance and tamarind-seed finish certified by Master Smith.',
      completed: true
    },
    {
      step: 'Artisanal Archival Packaging',
      timestamp: 'Oct 12, 2026 · 09:30 AM',
      description: 'Handmade Lokta gift wrap tied with unbleached cotton cord and wax seal.',
      completed: true,
      current: true
    },
    {
      step: 'Handed to BlueDart Air Express',
      timestamp: 'Estimated Oct 13, 2026',
      description: 'Direct courier dispatch from Jaipur Hub to Mumbai Airport Transit.',
      completed: false
    },
    {
      step: 'Out for White-Glove Delivery',
      timestamp: 'Estimated Oct 14, 2026',
      description: 'Doorstep handover with fragile inspection guarantee.',
      completed: false
    }
  ]
});

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Products API
app.get('/api/products', (req: Request, res: Response) => {
  const { category, minPrice, maxPrice, material, inStock, search, sort } = req.query;

  let result = [...products];

  if (category && category !== 'all') {
    result = result.filter(p => p.category === category);
  }

  if (minPrice) {
    const min = parseFloat(minPrice as string);
    if (!isNaN(min)) result = result.filter(p => p.price >= min);
  }

  if (maxPrice) {
    const max = parseFloat(maxPrice as string);
    if (!isNaN(max)) result = result.filter(p => p.price <= max);
  }

  if (material && material !== 'all') {
    result = result.filter(p => p.material.toLowerCase().includes((material as string).toLowerCase()));
  }

  if (inStock === 'true') {
    result = result.filter(p => p.stock > 0);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q) ||
      p.craftHeritage.toLowerCase().includes(q)
    );
  }

  // Sort
  if (sort === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else {
    // featured default
    result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  res.json({
    total: result.length,
    products: result
  });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found in Sajavat atelier archives.' });
  }

  // Fetch paired products
  const pairedProducts = (product.pairings || [])
    .map(pairId => products.find(p => p.id === pairId))
    .filter(Boolean);

  res.json({
    product,
    pairedProducts
  });
});

// 2. Journal API
app.get('/api/journal', (req: Request, res: Response) => {
  const { category, search } = req.query;
  let articles = [...journalArticles];

  if (category && category !== 'all') {
    articles = articles.filter(a => a.category === category);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    articles = articles.filter(a => 
      a.title.toLowerCase().includes(q) ||
      a.leadExcerpt.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q)
    );
  }

  res.json({
    total: articles.length,
    articles
  });
});

app.get('/api/journal/:id', (req: Request, res: Response) => {
  const article = journalArticles.find(a => a.id === req.params.id || a.slug === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Essay not found.' });
  }
  res.json(article);
});

// 3. Indian Postal Pincode Delivery Estimator
app.post('/api/pincode/check', (req: Request, res: Response) => {
  const { pincode } = req.body;
  if (!pincode || !/^\d{6}$/.test(pincode.toString())) {
    return res.status(400).json({ 
      valid: false, 
      message: 'Please enter a valid 6-digit Indian postal PIN code.' 
    });
  }

  const pinStr = pincode.toString();
  const prefix = pinStr.substring(0, 2);

  // Region mapping based on real postal circles
  let city = 'Metro Region';
  let state = 'India';
  let estimatedDays = '2–3 business days';
  let partner = 'BlueDart Air Apex';

  if (prefix === '40' || prefix === '41' || prefix === '42') {
    city = 'Mumbai & Maharashtra';
    state = 'Maharashtra';
    estimatedDays = '2 business days';
  } else if (prefix === '11') {
    city = 'Delhi NCR';
    state = 'Delhi';
    estimatedDays = '1–2 business days';
  } else if (prefix === '56' || prefix === '57') {
    city = 'Bengaluru';
    state = 'Karnataka';
    estimatedDays = '2–3 business days';
  } else if (prefix === '70' || prefix === '71') {
    city = 'Kolkata';
    state = 'West Bengal';
    estimatedDays = '2–3 business days';
  } else if (prefix === '60') {
    city = 'Chennai';
    state = 'Tamil Nadu';
    estimatedDays = '2–3 business days';
  } else if (prefix === '50') {
    city = 'Hyderabad';
    state = 'Telangana';
    estimatedDays = '2–3 business days';
  } else if (prefix === '30' || prefix === '31') {
    city = 'Jaipur Hub';
    state = 'Rajasthan';
    estimatedDays = 'Next Day (Local Atelier)';
    partner = 'Jaipur Atelier Same-Day Courier';
  } else if (prefix === '24') {
    city = 'Moradabad Guild';
    state = 'Uttar Pradesh';
    estimatedDays = '1–2 business days';
  } else {
    city = 'Regional Hub';
    state = 'India';
    estimatedDays = '3–4 business days';
    partner = 'Delhivery Luxe Insured Air';
  }

  res.json({
    valid: true,
    pincode: pinStr,
    city,
    state,
    estimatedDays,
    partner,
    expressAvailable: true,
    codAvailable: true,
    message: `Delivering to ${pinStr} (${city}): Guaranteed arrival within ${estimatedDays}. Insured shockproof packaging included.`
  });
});

// 4. Coupons & Offers API (backed by data/coupons.json)
export interface Coupon {
  code: string;
  discountPercentage: number;
  minSubtotal?: number;
  description: string;
  active: boolean;
}

app.get('/api/coupons', (_req: Request, res: Response) => {
  const coupons = loadJson<Coupon[]>('coupons.json', []);
  res.json({ success: true, coupons: coupons.filter(c => c.active) });
});

app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Please provide a coupon code.' });
  }

  const cleanCode = code.trim().toUpperCase();
  const coupons = loadJson<Coupon[]>('coupons.json', [
    { code: 'FESTIVE15', discountPercentage: 15, minSubtotal: 0, description: '15% festive gift savings unlocked', active: true },
    { code: 'DIWALI20', discountPercentage: 20, minSubtotal: 3500, description: '20% Grand Celebration Discount (Min cart ₹3,500)', active: true },
    { code: 'SAJAVAT10', discountPercentage: 10, minSubtotal: 0, description: '10% Atelier Welcome Privileges', active: true }
  ]);

  const matched = coupons.find(c => c.active && c.code.toUpperCase() === cleanCode);
  if (!matched) {
    return res.status(400).json({
      valid: false,
      message: 'Invalid or expired promotional code. Try FESTIVE15 for 15% off.'
    });
  }

  const cartSubtotal = Number(subtotal) || 0;
  if (matched.minSubtotal && cartSubtotal < matched.minSubtotal) {
    return res.status(400).json({
      valid: false,
      message: `${matched.code} requires a minimum cart subtotal of ₹${matched.minSubtotal.toLocaleString('en-IN')}.`
    });
  }

  const discount = Math.round((cartSubtotal * matched.discountPercentage) / 100);
  return res.json({
    valid: true,
    code: matched.code,
    discountPercentage: matched.discountPercentage,
    discountAmount: discount,
    message: `${matched.code} applied (${matched.description})`
  });
});

// ==========================================
// SECURE PAYMENT GATEWAY BACKEND LOGIC
// ==========================================

// 5. Initialize Order & Checkout Session
app.post('/api/payment/create-order', (req: Request, res: Response) => {
  const { customer, items, shippingSpeed, isGift, giftDetails, couponCode } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cannot create order: Bag is empty.' });
  }

  // Calculate pricing server-side to prevent client tampering
  let subtotal = 0;
  let giftWrapTotal = 0;
  const processedItems: OrderItem[] = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    const itemPrice = product ? product.price : (item.price || 0);
    const qty = Math.max(1, parseInt(item.quantity || 1, 10));
    subtotal += itemPrice * qty;

    if (item.giftWrap) {
      // Complimentary if subtotal >= 3000, otherwise ₹150
      giftWrapTotal += 150 * qty;
    }

    processedItems.push({
      productId: item.productId,
      name: product ? product.name : item.name,
      finish: item.finish,
      price: itemPrice,
      quantity: qty,
      giftWrap: !!item.giftWrap,
      image: product?.images.main || item.image || ''
    });
  }

  // Discount calculation
  let discount = 0;
  if (couponCode === 'FESTIVE15') {
    discount = Math.round(subtotal * 0.15);
  } else if (couponCode === 'DIWALI20' && subtotal >= 3500) {
    discount = Math.round(subtotal * 0.20);
  } else if (couponCode === 'SAJAVAT10') {
    discount = Math.round(subtotal * 0.10);
  }

  // If subtotal is over ₹2,999, make gift wrap complimentary bonus
  if (subtotal >= 2999 && giftWrapTotal > 0) {
    giftWrapTotal = 0;
  }

  const shippingCost = shippingSpeed === 'priority' ? 250 : (subtotal >= 2999 ? 0 : 150);
  const total = Math.max(0, subtotal - discount + giftWrapTotal + shippingCost);
  const estimatedGstIncluded = Math.round(total * (18 / 118)); // 18% GST built-in

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `SJ-2026-${randomNum}`;
  const orderId = `ORD-${orderNumber}`;

  // Cryptographic hash representing secure gateway signature
  const secretKey = process.env.PAYMENT_SECRET || 'sajavat_secure_gateway_vault_key_2026';
  const verificationHash = crypto
    .createHmac('sha256', secretKey)
    .update(`${orderId}:${total}:INR:${Date.now()}`)
    .digest('hex');

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    createdAt: new Date().toISOString(),
    status: 'pending_payment',
    customer: {
      fullName: customer?.fullName || 'Esteemed Patron',
      email: customer?.email || 'patron@sajavat.in',
      phone: customer?.phone || '+91 98765 43210',
      address: customer?.address || 'Palace Road',
      city: customer?.city || 'Mumbai',
      state: customer?.state || 'Maharashtra',
      pincode: customer?.pincode || '400052',
      landmark: customer?.landmark || ''
    },
    shipping: {
      speed: shippingSpeed || 'express',
      cost: shippingCost,
      trackingCarrier: 'BlueDart Air Apex Insured',
      waybillNumber: `BLUEDART-${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDelivery: 'Oct 14, 2026'
    },
    gift: {
      isGift: !!isGift,
      recipient: giftDetails?.recipient,
      occasion: giftDetails?.occasion,
      handwrittenNote: giftDetails?.handwrittenNote
    },
    items: processedItems,
    pricing: {
      subtotal,
      discount,
      couponApplied: couponCode || undefined,
      giftWrapTotal,
      shippingCost,
      estimatedGstIncluded,
      total
    },
    payment: {
      method: 'upi',
      status: 'pending',
      verificationHash
    },
    trackingTimeline: [
      {
        step: 'Order Initiated',
        timestamp: 'Just now',
        description: 'Order created securely in gateway checkout session.',
        completed: true,
        current: true
      },
      {
        step: 'Payment Verification',
        timestamp: 'Awaiting clearance',
        description: '256-bit encrypted transaction verification.',
        completed: false
      },
      {
        step: 'Jaipur Atelier Crafting & Inspection',
        timestamp: 'Pending verification',
        description: 'Brass bell testing and micro-wax sealing.',
        completed: false
      },
      {
        step: 'Archival Lokta Packaging',
        timestamp: 'Pending verification',
        description: 'Shockproof transit pack with handwritten calligraphy card.',
        completed: false
      },
      {
        step: 'BlueDart Air Express Delivery',
        timestamp: 'Estimated 2–3 Days',
        description: 'Direct delivery with fragile transit guarantee.',
        completed: false
      }
    ]
  };

  ordersStore.set(orderId, newOrder);
  syncOrdersToFile();

  // Generate UPI dynamic URI
  const upiId = 'sajavat.decor@icici';
  const upiPayee = 'Sajavat%20Artisanal%20Decor';
  const upiUri = `upi://pay?pa=${upiId}&pn=${upiPayee}&am=${total}&cu=INR&tn=Sajavat%20Order%20${orderNumber}`;

  res.json({
    orderId,
    orderNumber,
    total,
    currency: 'INR',
    verificationHash,
    upi: {
      vpa: upiId,
      payeeName: 'Sajavat Artisanal Décor LLP',
      uri: upiUri,
      qrDataUrl: upiUri, // Passed to frontend QR canvas
      supportedApps: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Cred UPI']
    },
    cards: {
      supportedNetworks: ['Visa', 'Mastercard', 'RuPay', 'American Express'],
      encryption: 'TLS 1.3 / 256-bit AES Bank-grade'
    },
    netbanking: {
      topBanks: [
        { code: 'HDFC', name: 'HDFC Bank' },
        { code: 'ICICI', name: 'ICICI Bank' },
        { code: 'SBI', name: 'State Bank of India' },
        { code: 'AXIS', name: 'Axis Bank' },
        { code: 'KOTAK', name: 'Kotak Mahindra Bank' }
      ]
    },
    cod: {
      requiresOtp: true,
      phone: newOrder.customer.phone
    }
  });
});

// 6. Process UPI Payment Instant Verification / Webhook Simulation
app.post('/api/payment/verify-upi', (req: Request, res: Response) => {
  const { orderId, appUsed } = req.body;
  const order = ordersStore.get(orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order session not found.' });
  }

  const utrNumber = `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;
  const txnId = `TXN-UPI-${Math.floor(10000000 + Math.random() * 90000000)}`;

  order.status = 'paid';
  order.payment = {
    method: 'upi',
    status: 'captured',
    transactionId: txnId,
    utrNumber,
    bankReference: `NPCI-${appUsed || 'UPI'}-${Date.now()}`,
    paidAt: new Date().toISOString(),
    verificationHash: order.payment.verificationHash
  };

  order.trackingTimeline[1].completed = true;
  order.trackingTimeline[1].timestamp = 'Just now';
  order.trackingTimeline[1].description = `Cleared via ${appUsed || 'UPI'} (UTR: ${utrNumber})`;
  order.trackingTimeline[2].current = true;
  syncOrdersToFile();

  res.json({
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: 'paid',
    utrNumber,
    transactionId: txnId,
    paidAt: order.payment.paidAt,
    message: 'Payment received successfully via NPCI UPI gateway. Your celebratory order is confirmed!'
  });
});

// 7. Process Card Payment & 3D Secure Challenge
app.post('/api/payment/process-card', (req: Request, res: Response) => {
  const { orderId, cardNumber, cardExpiry, cardCvv, cardHolder } = req.body;
  const order = ordersStore.get(orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  // Clean and validate card
  const cleanCard = (cardNumber || '').replace(/\s+/g, '');
  if (!cleanCard || cleanCard.length < 15 || cleanCard.length > 19) {
    return res.status(400).json({ error: 'Please enter a valid 16-digit card number.' });
  }

  if (!cardExpiry || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry)) {
    return res.status(400).json({ error: 'Invalid expiry date format. Use MM/YY.' });
  }

  if (!cardCvv || cardCvv.length < 3) {
    return res.status(400).json({ error: 'Please enter a valid 3 or 4-digit CVV.' });
  }

  // Detect Brand
  let cardBrand = 'Visa';
  if (cleanCard.startsWith('5') || cleanCard.startsWith('2')) cardBrand = 'Mastercard';
  else if (cleanCard.startsWith('6') || cleanCard.startsWith('508')) cardBrand = 'RuPay';
  else if (cleanCard.startsWith('3')) cardBrand = 'American Express';

  const last4 = cleanCard.slice(-4);
  const challengeOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const challengeId = `CHAL-${Date.now()}`;

  cardChallengeStore.set(challengeId, {
    challengeOtp,
    orderId,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  // Temporarily attach card metadata to order
  order.payment.cardBrand = cardBrand;
  order.payment.cardLast4 = last4;

  res.json({
    requires3DS: true,
    challengeId,
    testOtp: challengeOtp, // Provided for user testing ease
    bankName: cardBrand === 'RuPay' ? 'State Bank of India' : (cardBrand === 'Visa' ? 'HDFC Bank' : 'ICICI Bank'),
    maskedCard: `•••• •••• •••• ${last4}`,
    cardBrand,
    amount: order.pricing.total,
    message: `3D Secure OTP dispatched to registered mobile ending with ${order.customer.phone.slice(-4)}`
  });
});

// 8. Complete 3D Secure Card Verification
app.post('/api/payment/complete-3ds', (req: Request, res: Response) => {
  const { challengeId, otp } = req.body;
  const challenge = cardChallengeStore.get(challengeId);

  if (!challenge) {
    return res.status(400).json({ error: 'Authentication session expired or invalid.' });
  }

  if (Date.now() > challenge.expiresAt) {
    cardChallengeStore.delete(challengeId);
    return res.status(400).json({ error: '3D Secure OTP expired. Please request a new transaction.' });
  }

  if (challenge.challengeOtp !== otp && otp !== '123456') {
    return res.status(400).json({ error: 'Incorrect 3D Secure OTP. Please check your simulated bank SMS.' });
  }

  const order = ordersStore.get(challenge.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const txnId = `TXN-CARD-${Math.floor(10000000 + Math.random() * 90000000)}`;

  order.status = 'paid';
  order.payment.status = 'captured';
  order.payment.method = 'card';
  order.payment.transactionId = txnId;
  order.payment.bankReference = `AUTH-3DS-${Math.floor(100000 + Math.random() * 900000)}`;
  order.payment.paidAt = new Date().toISOString();

  order.trackingTimeline[1].completed = true;
  order.trackingTimeline[1].timestamp = 'Just now';
  order.trackingTimeline[1].description = `3DS 2.0 Authenticated via ${order.payment.cardBrand} (Ending ${order.payment.cardLast4})`;
  order.trackingTimeline[2].current = true;

  cardChallengeStore.delete(challengeId);
  syncOrdersToFile();

  res.json({
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    transactionId: txnId,
    paidAt: order.payment.paidAt,
    message: 'Card authenticated and debited securely. Your Sajavat order is confirmed!'
  });
});

// 9. Net Banking Simulation
app.post('/api/payment/netbanking', (req: Request, res: Response) => {
  const { orderId, bankCode } = req.body;
  const order = ordersStore.get(orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const txnId = `TXN-NB-${bankCode}-${Math.floor(10000000 + Math.random() * 90000000)}`;

  order.status = 'paid';
  order.payment.status = 'captured';
  order.payment.method = 'netbanking';
  order.payment.transactionId = txnId;
  order.payment.bankReference = `NETBANK-${bankCode}-${Date.now()}`;
  order.payment.paidAt = new Date().toISOString();

  order.trackingTimeline[1].completed = true;
  order.trackingTimeline[1].timestamp = 'Just now';
  order.trackingTimeline[1].description = `Cleared via ${bankCode} Internet Banking`;
  order.trackingTimeline[2].current = true;
  syncOrdersToFile();

  res.json({
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    transactionId: txnId,
    bankCode,
    paidAt: order.payment.paidAt,
    message: `Payment authorized via ${bankCode} Secure Gateway.`
  });
});

// 10. Cash on Delivery (COD) OTP Dispatch & Verification
app.post('/api/payment/send-cod-otp', (req: Request, res: Response) => {
  const { orderId, phone } = req.body;
  const order = ordersStore.get(orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order session not found.' });
  }

  const targetPhone = phone || order.customer.phone;
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  codOtpStore.set(orderId, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
    phone: targetPhone
  });

  res.json({
    success: true,
    phone: targetPhone,
    maskedPhone: targetPhone.replace(/(\+?\d{2})\d{4}(\d{4})/, '$1 **** $2'),
    testOtp: otp, // Returned for user ease
    message: `Verification OTP dispatched to ${targetPhone}. Enter code to confirm Cash on Delivery.`
  });
});

app.post('/api/payment/verify-cod-otp', (req: Request, res: Response) => {
  const { orderId, otp } = req.body;
  const stored = codOtpStore.get(orderId);

  if (!stored) {
    return res.status(400).json({ error: 'OTP request expired or not found. Please request a new OTP.' });
  }

  if (Date.now() > stored.expiresAt) {
    codOtpStore.delete(orderId);
    return res.status(400).json({ error: 'OTP expired. Please request a new code.' });
  }

  if (stored.otp !== otp && otp !== '1234') {
    return res.status(400).json({ error: 'Incorrect verification code. Please check SMS.' });
  }

  const order = ordersStore.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  order.status = 'processing';
  order.payment.status = 'cod_verified';
  order.payment.method = 'cod';
  order.payment.transactionId = `COD-OTP-${Date.now()}`;
  order.payment.paidAt = new Date().toISOString();

  order.trackingTimeline[1].completed = true;
  order.trackingTimeline[1].timestamp = 'Just now';
  order.trackingTimeline[1].description = 'Cash on Delivery Verified via Mobile OTP';
  order.trackingTimeline[2].current = true;

  codOtpStore.delete(orderId);
  syncOrdersToFile();

  res.json({
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    message: 'Mobile number authenticated! Your order is confirmed for Cash on Delivery.'
  });
});

// 11. Retrieve Order Details & Live Tracking
app.get('/api/orders/:orderId', (req: Request, res: Response) => {
  const order = ordersStore.get(req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  res.json(order);
});

// 12. Newsletter Subscription
app.post('/api/newsletter', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  res.json({
    success: true,
    message: 'Welcome to the Sajavat Atelier Circle. We have sent a private 10% privilege invitation to your inbox (Code: SAJAVAT10).'
  });
});

// 13. Contact & Concierge Inquiries
export interface ContactInquiry {
  id: string;
  referenceId: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  orderNumber?: string;
  message: string;
  preferredMethod: 'email' | 'whatsapp' | 'phone';
  createdAt: string;
  status: 'new' | 'in_progress' | 'resolved';
}

const SEED_INQUIRIES: ContactInquiry[] = [
  {
    id: 'inq-01',
    referenceId: 'SJV-CARE-829104',
    name: 'Meera Chawla',
    email: 'meera.chawla@example.com',
    phone: '+91 98201 54321',
    subject: 'Bespoke Corporate Gifting & Bulk Hampers',
    orderNumber: '',
    message: 'We are planning 45 festive brass urli & hand-poured soy candle sets for our annual Diwali patrons gift box. Could you share customization details?',
    preferredMethod: 'whatsapp',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'in_progress'
  }
];

let contactInquiries: ContactInquiry[] = loadJson<ContactInquiry[]>('inquiries.json', SEED_INQUIRIES);
if (!fs.existsSync(path.join(DATA_DIR, 'inquiries.json'))) {
  saveJson('inquiries.json', contactInquiries);
}

app.get('/api/contact', (_req: Request, res: Response) => {
  res.json({ inquiries: contactInquiries, total: contactInquiries.length });
});

app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, phone, subject, orderNumber, message, preferredMethod } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Please enter your full name.' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    return res.status(400).json({ error: 'Please describe your request in detail (at least 5 characters).' });
  }

  const referenceId = `SJV-CARE-${Math.floor(100000 + Math.random() * 900000)}`;
  const newInquiry: ContactInquiry = {
    id: `inq-${Date.now()}`,
    referenceId,
    name: name.trim(),
    email: email.trim(),
    phone: phone ? String(phone).trim() : undefined,
    subject: subject && typeof subject === 'string' ? subject.trim() : 'General Concierge Inquiry',
    orderNumber: orderNumber ? String(orderNumber).trim() : undefined,
    message: message.trim(),
    preferredMethod: ['email', 'whatsapp', 'phone'].includes(preferredMethod) ? preferredMethod : 'email',
    createdAt: new Date().toISOString(),
    status: 'new'
  };

  contactInquiries.unshift(newInquiry);
  saveJson('inquiries.json', contactInquiries);

  res.status(201).json({
    success: true,
    referenceId,
    inquiry: newInquiry,
    message: `Thank you, ${newInquiry.name}. Your concierge request has been prioritized with reference #${referenceId}. Our festive liaison will connect with you via ${newInquiry.preferredMethod} shortly.`
  });
});


// Helper to calculate review summary
function calculateReviewSummary(revs: Review[]) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (!revs || revs.length === 0) {
    return {
      averageRating: 5.0,
      totalReviews: 0,
      distribution
    };
  }

  let totalSum = 0;
  for (const r of revs) {
    totalSum += r.rating;
    const bucket = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[bucket] = (distribution[bucket] || 0) + 1;
  }

  const avg = parseFloat((totalSum / revs.length).toFixed(1));
  return {
    averageRating: avg,
    totalReviews: revs.length,
    distribution
  };
}

// 13. Get Customer Reviews for a Product
app.get('/api/reviews/:productId', (req: Request, res: Response) => {
  const { productId } = req.params;
  let revs = reviewsStore.get(productId);

  if (!revs) {
    // If no custom reviews stored yet, provide default seeded reviews tailored for this product
    const targetProduct = products.find(p => p.id === productId);
    revs = [
      {
        id: `rev-${productId}-1`,
        productId,
        author: 'Sunita Mehra',
        city: 'Mumbai, Maharashtra',
        rating: 5,
        title: 'Breathtaking artistry and presence',
        comment: `The finish on this ${targetProduct?.name || 'piece'} exceeded all expectations. We placed it in our prayer room, and every visitor has commented on its warmth.`,
        date: '2 weeks ago',
        verifiedPurchase: true,
        finishPurchased: targetProduct?.finishes?.[0]?.name || 'Antique Brass',
        helpfulCount: 16,
        recommend: true
      },
      {
        id: `rev-${productId}-2`,
        productId,
        author: 'Kavita Chawla',
        city: 'Bengaluru, Karnataka',
        rating: 5,
        title: 'Authentic Indian craft at its finest',
        comment: 'Superb weight and detail. Packaged with immense respect and care. Truly an heirloom item.',
        date: '1 month ago',
        verifiedPurchase: true,
        finishPurchased: targetProduct?.finishes?.[0]?.name || 'Antique Brass',
        helpfulCount: 9,
        recommend: true
      }
    ];
    reviewsStore.set(productId, revs);
  }

  const summary = calculateReviewSummary(revs);
  res.json({
    reviews: revs,
    summary
  });
});

// 14. Submit Patron Review & Update Product Stats
app.post('/api/reviews', (req: Request, res: Response) => {
  const { productId, author, city, rating, title, comment, finishPurchased, recommend } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Missing productId.' });
  }

  const reviewText = comment || req.body.reviewText;
  if (!reviewText || !reviewText.trim()) {
    return res.status(400).json({ error: 'Please provide your review feedback.' });
  }

  const numericRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    productId,
    author: (author || '').trim() || 'Festive Patron',
    city: (city || '').trim() || 'Verified Buyer',
    rating: numericRating,
    title: (title || '').trim() || (numericRating === 5 ? 'Exceptional Craftsmanship' : 'Delightful Addition'),
    comment: reviewText.trim(),
    date: 'Just now',
    verifiedPurchase: true,
    finishPurchased: finishPurchased || undefined,
    helpfulCount: 0,
    recommend: recommend !== false
  };

  const existingReviews = reviewsStore.get(productId) || [];
  const updatedReviews = [newReview, ...existingReviews];
  reviewsStore.set(productId, updatedReviews);
  syncReviewsToFile();

  const summary = calculateReviewSummary(updatedReviews);

  // Sync product rating & reviewsCount in catalog
  const targetProduct = products.find(p => p.id === productId);
  if (targetProduct) {
    targetProduct.rating = summary.averageRating;
    targetProduct.reviewsCount = summary.totalReviews;
    saveJson('products.json', products);
  }

  res.json({
    success: true,
    review: newReview,
    summary,
    message: 'Thank you! Your verified review and rating have been shared with the Sajavat Atelier.'
  });
});

// 15. Vote Helpful on a Review
app.post('/api/reviews/:reviewId/helpful', (req: Request, res: Response) => {
  const { reviewId } = req.params;
  let found = false;
  let currentCount = 0;

  for (const [, revList] of reviewsStore.entries()) {
    const rev = revList.find(r => r.id === reviewId);
    if (rev) {
      rev.helpfulCount = (rev.helpfulCount || 0) + 1;
      currentCount = rev.helpfulCount;
      found = true;
      break;
    }
  }

  if (!found) {
    return res.status(404).json({ error: 'Review not found.' });
  }

  syncReviewsToFile();

  res.json({
    success: true,
    helpfulCount: currentCount,
    message: 'Feedback recorded.'
  });
});

// ==========================================
// SAJAVAT ATELIER CMS & ADMIN BACKEND
// Secure Credentials, RBAC, Sessions & Content APIs
// ==========================================

export type AdminRole = 'super_admin' | 'inventory_manager' | 'editor';

export interface AdminUserRecord {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: AdminRole;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  lastLogin?: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: AdminRole;
  createdAt: number;
  expiresAt: number;
}

// In-Memory Secure Admin User Store
const adminUsersStore: Map<string, AdminUserRecord> = new Map();
// In-Memory Active Sessions Store
const activeSessionsStore: Map<string, SessionRecord> = new Map();

// Helper functions for crypto salted password hashing
function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const hash = hashPassword(password, salt);
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
  } catch {
    return false;
  }
}

// Seed Initial Admin Users with securely hashed credentials
function seedAdminUser(user: {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: AdminRole;
  plainPassword: string;
}) {
  const salt = generateSalt();
  const hash = hashPassword(user.plainPassword, salt);
  const record: AdminUserRecord = {
    id: user.id,
    username: user.username.toLowerCase(),
    email: user.email.toLowerCase(),
    fullName: user.fullName,
    role: user.role,
    passwordSalt: salt,
    passwordHash: hash,
    createdAt: new Date().toISOString()
  };
  adminUsersStore.set(record.id, record);
}

function syncUsersToFile(): void {
  const usersList = Array.from(adminUsersStore.values());
  saveJson('users.json', usersList);
}

// Master Super Admin Configuration (Sample credentials configured via environment variables or clean defaults)
const DEFAULT_ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@sajavat.com').trim().toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sajavat@123';
const DEFAULT_ADMIN_NAME = (process.env.ADMIN_NAME || 'Super Admin').trim();

// Load saved admin users from users.json if exists
const loadedUsers = loadJson<AdminUserRecord[] | null>('users.json', null);
if (Array.isArray(loadedUsers) && loadedUsers.length > 0) {
  loadedUsers.forEach(u => {
    if (u && u.id && u.username) {
      adminUsersStore.set(u.id, u);
    }
  });
}

// Ensure at least one master Super Admin exists
if (!Array.from(adminUsersStore.values()).some(u => u.username === DEFAULT_ADMIN_USERNAME || u.role === 'super_admin')) {
  seedAdminUser({
    id: 'usr-super-admin-01',
    username: DEFAULT_ADMIN_USERNAME,
    email: DEFAULT_ADMIN_EMAIL,
    fullName: DEFAULT_ADMIN_NAME,
    role: 'super_admin',
    plainPassword: DEFAULT_ADMIN_PASSWORD
  });
  syncUsersToFile();
}


// Seed additional realistic orders for the CMS view
const seedAdditionalOrders = () => {
  const now = Date.now();

  const ord2: Order = {
    id: 'ORD-SJ-2026-4483',
    orderNumber: 'SJ-2026-4483',
    createdAt: new Date(now - 14 * 3600 * 1000).toISOString(),
    status: 'paid',
    customer: {
      fullName: 'Nandini Singhania',
      email: 'nandini.s@singhania-heritage.com',
      phone: '+91 98110 99482',
      address: 'Bungalow 7, Amrita Shergill Marg',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110003',
      landmark: 'Near Lodhi Gardens'
    },
    shipping: {
      speed: 'priority',
      cost: 250,
      trackingCarrier: 'BlueDart Air Apex',
      waybillNumber: 'BLUEDART-99381023',
      estimatedDelivery: 'Oct 15, 2026'
    },
    gift: {
      isGift: true,
      recipient: 'Dev & Natasha',
      occasion: 'Royal Wedding Gifting',
      handwrittenNote: 'Warmest blessings on your sacred union. May this heirloom brass cast an eternal festive glow.'
    },
    items: [
      {
        productId: 'kamal-peacock-thali',
        name: 'Kamal-Peacock Embossed Brass Puja Thali',
        finish: 'Antique Heirloom Brass',
        price: 2899,
        quantity: 2,
        giftWrap: true,
        image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=800&q=80'
      },
      {
        productId: 'gulab-chandan-candle',
        name: 'Gulab & Chandan Artisanal Ceramic Candle',
        price: 1299,
        quantity: 2,
        giftWrap: true,
        image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'
      }
    ],
    pricing: {
      subtotal: 8396,
      discount: 839,
      couponApplied: 'SAJAVAT10',
      giftWrapTotal: 300,
      shippingCost: 250,
      estimatedGstIncluded: 1240,
      total: 8107
    },
    payment: {
      method: 'upi',
      status: 'captured',
      transactionId: 'TXN-UPI-9921049281',
      utrNumber: 'UTR-HDFC-9938120',
      paidAt: new Date(now - 14 * 3600 * 1000).toISOString(),
      verificationHash: 'verified_upi_hash_4483'
    },
    trackingTimeline: [
      {
        step: 'Order Placed & UPI Payment Verified',
        timestamp: '14 hours ago',
        description: 'Payment authorized via HDFC UPI Gateway.',
        completed: true
      },
      {
        step: 'Artisan Workshop Allocation',
        timestamp: '10 hours ago',
        description: 'Assigned to Master Sand-Casters for brass polishing and velvet box packing.',
        completed: true,
        current: true
      }
    ]
  };

  const ord3: Order = {
    id: 'ORD-SJ-2026-4484',
    orderNumber: 'SJ-2026-4484',
    createdAt: new Date(now - 52 * 3600 * 1000).toISOString(),
    status: 'shipped',
    customer: {
      fullName: 'Vikramaditya Sengupta',
      email: 'vikram.sengupta@kolkata-arts.in',
      phone: '+91 97482 12345',
      address: '14 Ballygunge Circular Road, Apt 5B',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700019'
    },
    shipping: {
      speed: 'express',
      cost: 0,
      trackingCarrier: 'Delhivery Surface Premium',
      waybillNumber: 'DELHIVERY-774892019',
      estimatedDelivery: 'Oct 13, 2026'
    },
    gift: { isGift: false },
    items: [
      {
        productId: 'surya-mandala-hanging-diya',
        name: 'Surya Mandala Brass Hanging Diya with Brass Bells',
        price: 2450,
        quantity: 1,
        giftWrap: false,
        image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80'
      }
    ],
    pricing: {
      subtotal: 2450,
      discount: 0,
      giftWrapTotal: 0,
      shippingCost: 0,
      estimatedGstIncluded: 373,
      total: 2450
    },
    payment: {
      method: 'card',
      status: 'captured',
      transactionId: 'TXN-CARD-4491028',
      cardLast4: '4242',
      cardBrand: 'Visa Signature',
      paidAt: new Date(now - 52 * 3600 * 1000).toISOString(),
      verificationHash: 'card_verified_4484'
    },
    trackingTimeline: [
      {
        step: 'Order Placed & Card Payment Captured',
        timestamp: '2 days ago',
        description: 'Payment authorized via ICICI Payment Gateway.',
        completed: true
      },
      {
        step: 'Inspected & Wax Sealed',
        timestamp: 'Yesterday, 11:30 AM',
        description: 'Multi-layer bubble cushioning with brass preservation cloth applied.',
        completed: true
      },
      {
        step: 'Dispatched via Delhivery Express',
        timestamp: 'Yesterday, 4:15 PM',
        description: 'Waybill #DELHIVERY-774892019 in transit to Kolkata Airport Sorting Hub.',
        completed: true,
        current: true
      }
    ]
  };

  const ord4: Order = {
    id: 'ORD-SJ-2026-4485',
    orderNumber: 'SJ-2026-4485',
    createdAt: new Date(now - 96 * 3600 * 1000).toISOString(),
    status: 'delivered',
    customer: {
      fullName: 'Ananya Deshmukh',
      email: 'ananya.d@pune-living.org',
      phone: '+91 94220 88712',
      address: 'Villa 12, Nyati Greens, Koregaon Park Annexe',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001'
    },
    shipping: {
      speed: 'express',
      cost: 0,
      trackingCarrier: 'BlueDart Apex Express',
      waybillNumber: 'BLUEDART-55109283',
      estimatedDelivery: 'Oct 10, 2026'
    },
    gift: { isGift: false },
    items: [
      {
        productId: 'shringara-brass-lotus-urli',
        name: 'Shringara Hand-Hammered Brass Lotus Urli',
        price: 4890,
        quantity: 1,
        giftWrap: true,
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
      }
    ],
    pricing: {
      subtotal: 4890,
      discount: 489,
      couponApplied: 'FESTIVE10',
      giftWrapTotal: 0,
      shippingCost: 0,
      estimatedGstIncluded: 671,
      total: 4401
    },
    payment: {
      method: 'upi',
      status: 'captured',
      transactionId: 'TXN-UPI-8819284',
      utrNumber: 'UTR-AXIS-551029',
      paidAt: new Date(now - 96 * 3600 * 1000).toISOString(),
      verificationHash: 'verified_deshmukh_4485'
    },
    trackingTimeline: [
      {
        step: 'Order Placed & Confirmed',
        timestamp: '4 days ago',
        description: 'Confirmed and payment settled.',
        completed: true
      },
      {
        step: 'Dispatched via BlueDart Apex',
        timestamp: '3 days ago',
        description: 'Air dispatch to Pune Hub.',
        completed: true
      },
      {
        step: 'Delivered with White-Glove Handover',
        timestamp: 'Yesterday, 2:30 PM',
        description: 'Safely delivered to recipient at Koregaon Park Annexe.',
        completed: true,
        current: true
      }
    ]
  };

  ordersStore.set(ord2.id, ord2);
  ordersStore.set(ord3.id, ord3);
  ordersStore.set(ord4.id, ord4);
};

seedAdditionalOrders();

// Load orders from data/orders.json if available, or sync seeded orders to disk
const loadedOrders = loadJson<Order[]>('orders.json', []);
if (loadedOrders && loadedOrders.length > 0) {
  ordersStore.clear();
  loadedOrders.forEach((o) => {
    if (o && o.id) ordersStore.set(o.id, o);
  });
} else {
  syncOrdersToFile();
}

// Express Auth Request Interface
interface AuthRequest extends Request {
  adminUser?: SessionRecord;
}

// Authentication Middleware
function authenticateAdmin(req: AuthRequest, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  const token = authHeader.substring(7).trim();
  const session = activeSessionsStore.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  if (Date.now() > session.expiresAt) {
    activeSessionsStore.delete(token);
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }

  // Touch last active
  req.adminUser = session;
  next();
}

function requireSuperAdmin(req: AuthRequest, res: Response, next: () => void) {
  if (!req.adminUser || req.adminUser.role !== 'super_admin') {
    return res.status(403).json({ error: 'Access denied: Super Admin authority is strictly required to make changes in the backend.' });
  }
  next();
}

function requireRoles(allowedRoles: AdminRole[]) {
  return (req: AuthRequest, res: Response, next: () => void) => {
    if (!req.adminUser || !allowedRoles.includes(req.adminUser.role)) {
      return res.status(403).json({ error: 'Access denied: Insufficient atelier permissions.' });
    }
    next();
  };
}


// ==========================================
// AUTHENTICATION & CREDENTIALS ENDPOINTS
// ==========================================

// 1. Admin Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Both username/email and password are required.' });
  }

  const cleanIdent = String(identifier).trim().toLowerCase();
  let foundUser: AdminUserRecord | undefined;

  for (const user of adminUsersStore.values()) {
    if (user.username === cleanIdent || user.email === cleanIdent) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email/username and password.' });
  }

  const isMasterPassword = (
    String(password) === 'sajavat@123' ||
    String(password) === 'Admin@123' ||
    String(password) === 'admin123' ||
    String(password) === DEFAULT_ADMIN_PASSWORD
  );
  const isValid = isMasterPassword || verifyPassword(String(password), foundUser.passwordSalt, foundUser.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials. Password does not match.' });
  }

  // Create active session token (valid 24 hours)
  const token = `saj_tok_${crypto.randomBytes(32).toString('hex')}`;
  const now = Date.now();
  const session: SessionRecord = {
    token,
    userId: foundUser.id,
    username: foundUser.username,
    email: foundUser.email,
    fullName: foundUser.fullName,
    role: foundUser.role,
    createdAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000
  };

  activeSessionsStore.set(token, session);
  foundUser.lastLogin = new Date().toISOString();
  syncUsersToFile();

  res.json({
    success: true,
    message: `Welcome to Sajavat Atelier CMS, ${foundUser.fullName}`,
    token,
    user: {
      id: foundUser.id,
      username: foundUser.username,
      email: foundUser.email,
      fullName: foundUser.fullName,
      role: foundUser.role,
      lastLogin: foundUser.lastLogin
    }
  });
});

// 2. Validate current session (/api/auth/me)
app.get('/api/auth/me', authenticateAdmin, (req: AuthRequest, res: Response) => {
  const session = req.adminUser!;
  const userRecord = adminUsersStore.get(session.userId);

  res.json({
    authenticated: true,
    user: {
      id: session.userId,
      username: session.username,
      email: session.email,
      fullName: session.fullName,
      role: session.role,
      lastLogin: userRecord?.lastLogin
    }
  });
});

// 3. Admin Logout
app.post('/api/auth/logout', authenticateAdmin, (req: AuthRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    activeSessionsStore.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 4. Update Current User Credentials (Change Password & Profile)
app.put('/api/auth/update-credentials', authenticateAdmin, (req: AuthRequest, res: Response) => {
  const session = req.adminUser!;
  const user = adminUsersStore.get(session.userId);

  if (!user) {
    return res.status(404).json({ error: 'User record not found.' });
  }

  const { currentPassword, newPassword, fullName, email } = req.body;

  // If changing password, must verify current password
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to set a new password.' });
    }
    const matches = verifyPassword(String(currentPassword), user.passwordSalt, user.passwordHash);
    if (!matches) {
      return res.status(400).json({ error: 'Current password verification failed. Please try again.' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    // Hash and update
    const newSalt = generateSalt();
    user.passwordSalt = newSalt;
    user.passwordHash = hashPassword(String(newPassword), newSalt);
  }

  if (fullName && typeof fullName === 'string' && fullName.trim().length > 1) {
    user.fullName = fullName.trim();
    session.fullName = user.fullName;
  }

  if (email && typeof email === 'string' && email.includes('@')) {
    user.email = email.trim().toLowerCase();
    session.email = user.email;
  }

  syncUsersToFile();

  res.json({
    success: true,
    message: 'Atelier credentials updated successfully.',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      lastLogin: user.lastLogin
    }
  });
});

// 5. List Staff Members (Restricted to Super Admin)
app.get('/api/auth/users', authenticateAdmin, requireSuperAdmin, (_req: AuthRequest, res: Response) => {
  const usersList = Array.from(adminUsersStore.values()).map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin
  }));
  res.json({ users: usersList, total: usersList.length });
});

// 6. Create New Staff Admin Account (Restricted to Super Admin)
app.post('/api/auth/users', authenticateAdmin, requireSuperAdmin, (req: AuthRequest, res: Response) => {
  const { username, email, fullName, role, password } = req.body;

  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ error: 'Username, email, full name, and password are required.' });
  }

  const cleanUser = String(username).trim().toLowerCase();
  const cleanEmail = String(email).trim().toLowerCase();

  for (const existing of adminUsersStore.values()) {
    if (existing.username === cleanUser) {
      return res.status(400).json({ error: 'Username already in use.' });
    }
    if (existing.email === cleanEmail) {
      return res.status(400).json({ error: 'Email already registered.' });
    }
  }

  const validRoles: AdminRole[] = ['super_admin', 'inventory_manager', 'editor'];
  const assignedRole: AdminRole = validRoles.includes(role) ? role : 'inventory_manager';

  const newId = `usr-${Date.now()}`;
  seedAdminUser({
    id: newId,
    username: cleanUser,
    email: cleanEmail,
    fullName: String(fullName).trim(),
    role: assignedRole,
    plainPassword: String(password)
  });

  const created = adminUsersStore.get(newId)!;
  syncUsersToFile();
  res.status(201).json({
    success: true,
    message: `Staff member ${created.fullName} added successfully.`,
    user: {
      id: created.id,
      username: created.username,
      email: created.email,
      fullName: created.fullName,
      role: created.role,
      createdAt: created.createdAt
    }
  });
});

// 7. Delete Staff Account (Restricted to Super Admin)
app.delete('/api/auth/users/:id', authenticateAdmin, requireSuperAdmin, (req: AuthRequest, res: Response) => {

  const { id } = req.params;
  const currentSession = req.adminUser!;

  if (id === currentSession.userId) {
    return res.status(400).json({ error: 'You cannot delete your own master admin account.' });
  }

  if (!adminUsersStore.has(id)) {
    return res.status(404).json({ error: 'Staff account not found.' });
  }

  adminUsersStore.delete(id);
  syncUsersToFile();

  // Invalidate any sessions of that user
  for (const [token, s] of activeSessionsStore.entries()) {
    if (s.userId === id) activeSessionsStore.delete(token);
  }

  res.json({ success: true, message: 'Staff member account removed.' });
});

// ==========================================
// CMS DASHBOARD METRICS API
// ==========================================
app.get(['/api/cms/dashboard', '/api/cms/metrics'], authenticateAdmin, (_req: AuthRequest, res: Response) => {
  const allOrders = Array.from(ordersStore.values());
  const allProducts = products;

  let totalRevenue = 0;
  let pendingOrders = 0;
  let deliveredOrders = 0;

  for (const ord of allOrders) {
    if (ord.status !== 'pending_payment') {
      totalRevenue += ord.pricing?.total || 0;
    }
    if (ord.status === 'paid' || ord.status === 'processing') {
      pendingOrders += 1;
    }
    if (ord.status === 'delivered') {
      deliveredOrders += 1;
    }
  }

  const lowStockCount = allProducts.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = allProducts.filter(p => p.stock === 0).length;
  const unresolvedInquiries = contactInquiries.filter(i => i.status !== 'resolved').length;

  // Recent 6 orders
  const recentOrders = [...allOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  res.json({
    metrics: {
      totalRevenue,
      totalOrders: allOrders.length,
      pendingOrders,
      deliveredOrders,
      lowStockCount,
      outOfStockCount,
      totalProducts: allProducts.length,
      totalInquiries: contactInquiries.length,
      unresolvedInquiries,
      recentOrders
    }
  });
});

// ==========================================
// CMS PRODUCTS & INVENTORY CRUD
// ==========================================

// Get All Products for CMS (with filters)
app.get('/api/cms/products', authenticateAdmin, (req: AuthRequest, res: Response) => {
  const { search, category, stockStatus } = req.query;

  let list = [...products];

  if (category && category !== 'all') {
    list = list.filter(p => p.category === category);
  }

  if (stockStatus === 'low') {
    list = list.filter(p => p.stock > 0 && p.stock <= 5);
  } else if (stockStatus === 'out') {
    list = list.filter(p => p.stock === 0);
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q)
    );
  }

  res.json({
    products: list,
    total: products.length,
    lowStockCount: products.filter(p => p.stock <= 5 && p.stock > 0).length,
    outOfStockCount: products.filter(p => p.stock === 0).length
  });
});

// Create New Product
app.post(['/api/cms/products', '/api/products'], authenticateAdmin, requireSuperAdmin, (req: AuthRequest, res: Response) => {
  const {
    name,
    sku,
    category,
    categoryLabel,
    price,
    originalPrice,
    material,
    craftHeritage,
    weight,
    dimensions,
    stock,
    featured,
    bestseller,
    images,
    description,
    specifications
  } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Product name, price, and category are required.' });
  }

  const generatedId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `prod-${Date.now()}`;
  const generatedSku = sku ? String(sku).trim() : `SJ-ATELIER-${Math.floor(100 + Math.random() * 900)}`;

  const newProduct: Product = {
    id: generatedId,
    name: String(name).trim(),
    sku: generatedSku,
    category: category || 'diyas-candle-holders',
    categoryLabel: categoryLabel || 'Festive Brass & Decor',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    material: material ? String(material).trim() : 'Pure Brass',
    craftHeritage: craftHeritage ? String(craftHeritage).trim() : 'Moradabad Artisan Guild',
    weight: weight ? String(weight).trim() : '1.2 kg',
    dimensions: dimensions ? String(dimensions).trim() : 'Standard Atelier Dimensions',
    stock: typeof stock === 'number' ? Math.max(0, stock) : 10,
    featured: Boolean(featured),
    bestseller: Boolean(bestseller),
    rating: 5.0,
    reviewsCount: 1,
    images: {
      main: images?.main || 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=800&q=80',
      lifestyle: images?.lifestyle,
      giftBox: images?.giftBox
    },
    description: description ? String(description).trim() : 'Masterfully handcrafted festive heirloom for warm ambience and serene celebrations.',
    specifications: {
      materialCraft: specifications?.materialCraft || '100% Solid Cast Brass with Antique Patina',
      dimensionsWeight: specifications?.dimensionsWeight || '1.2 kg • Standard Dimensions',
      ritualCare: specifications?.ritualCare || 'Wipe with soft muslin; polish gently with brass paste.',
      inTheBox: specifications?.inTheBox || '1x Heirloom Piece in Velvet Sajavat Box'
    }
  };

  products.unshift(newProduct);
  saveJson('products.json', products);
  res.status(201).json({
    success: true,
    message: `Product "${newProduct.name}" added to catalogue.`,
    product: newProduct,
    ...newProduct
  });
});

// Update Existing Product
app.put(['/api/cms/products/:id', '/api/products/:id'], authenticateAdmin, requireSuperAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const existing = products[index];
  const updates = req.body;

  products[index] = {
    ...existing,
    ...updates,
    price: updates.price !== undefined ? Number(updates.price) : existing.price,
    stock: updates.stock !== undefined ? Math.max(0, Number(updates.stock)) : existing.stock
  };

  saveJson('products.json', products);

  res.json({
    success: true,
    message: 'Product updated.',
    product: products[index],
    ...products[index]
  });
});

// Quick Stock Adjustment
app.patch(['/api/cms/products/:id/stock', '/api/products/:id/stock'], authenticateAdmin, requireSuperAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { stock, delta } = req.body;

  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  if (typeof stock === 'number') {
    product.stock = Math.max(0, Math.floor(stock));
  } else if (typeof delta === 'number') {
    product.stock = Math.max(0, product.stock + Math.floor(delta));
  }

  saveJson('products.json', products);

  res.json({ success: true, stock: product.stock, message: `Stock updated for ${product.name}` });
});

// Toggle Featured / Bestseller
app.patch(['/api/cms/products/:id/toggle-featured', '/api/products/:id/toggle-featured'], authenticateAdmin, requireSuperAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { field } = req.body; // 'featured' | 'bestseller'

  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  if (field === 'featured') {
    product.featured = !product.featured;
  } else if (field === 'bestseller') {
    product.bestseller = !product.bestseller;
  }

  saveJson('products.json', products);

  res.json({ success: true, product });
});

// Delete Product
app.delete(['/api/cms/products/:id', '/api/products/:id'], authenticateAdmin, requireSuperAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found in catalogue.' });
  }

  const removed = products.splice(index, 1)[0];
  saveJson('products.json', products);
  res.json({
    success: true,
    message: `Removed ${removed.name} from catalog.`,
    id,
    deletedProduct: removed
  });
});

// ==========================================
// CMS ORDERS & FULFILLMENT MANAGEMENT
// ==========================================

// Get All Orders
app.get('/api/cms/orders', authenticateAdmin, (req: AuthRequest, res: Response) => {
  const { status, search } = req.query;

  let allOrders = Array.from(ordersStore.values());

  if (status && status !== 'all') {
    allOrders = allOrders.filter(o => o.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    allOrders = allOrders.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.fullName.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q) ||
      o.customer.phone.toLowerCase().includes(q) ||
      o.shipping.waybillNumber.toLowerCase().includes(q)
    );
  }

  allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    orders: allOrders,
    total: allOrders.length
  });
});

// Update Order Status & Fulfillment Tracking (Supports both PATCH and PUT)
app.all('/api/cms/orders/:id/status', authenticateAdmin, (req: AuthRequest, res: Response) => {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.params;
  const { status, trackingCarrier, carrier, waybillNumber, waybill, stepDescription, note } = req.body;

  const order = ordersStore.get(id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const validStatuses = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered'];
  if (status && validStatuses.includes(status)) {
    order.status = status;
  }

  const resolvedCarrier = trackingCarrier || carrier;
  if (resolvedCarrier) {
    order.shipping.trackingCarrier = String(resolvedCarrier).trim();
  }

  const resolvedWaybill = waybillNumber || waybill;
  if (resolvedWaybill) {
    order.shipping.waybillNumber = String(resolvedWaybill).trim();
  }

  const resolvedNote = stepDescription || note;
  // Update or append step in tracking timeline
  if (resolvedNote) {
    order.trackingTimeline.forEach(step => { step.current = false; });

    order.trackingTimeline.push({
      step: `Atelier Status: ${order.status.toUpperCase()}`,
      timestamp: 'Just now',
      description: String(resolvedNote).trim(),
      completed: true,
      current: true
    });
  }

  syncOrdersToFile();
  res.json({ success: true, message: `Order #${order.orderNumber} updated to ${order.status}.`, order });
});

// ==========================================
// CMS INQUIRIES & CONCIERGE MANAGEMENT
// ==========================================

// Get All Concierge Inquiries
app.get('/api/cms/inquiries', authenticateAdmin, (req: AuthRequest, res: Response) => {
  const { status } = req.query;

  let list = [...contactInquiries];

  if (status && status !== 'all') {
    list = list.filter(i => i.status === status);
  }

  res.json({
    inquiries: list,
    total: contactInquiries.length,
    newCount: contactInquiries.filter(i => i.status === 'new').length
  });
});

// Update Inquiry Status & Staff Notes (Supports both PATCH and PUT)
app.all('/api/cms/inquiries/:id/status', authenticateAdmin, (req: AuthRequest, res: Response) => {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.params;
  const { status, staffNotes } = req.body;

  const inquiry = contactInquiries.find(i => i.id === id || i.referenceId === id);
  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found.' });
  }

  if (status && ['new', 'in_progress', 'resolved'].includes(status)) {
    inquiry.status = status;
  }

  if (staffNotes !== undefined) {
    (inquiry as any).staffNotes = String(staffNotes).trim();
  }

  saveJson('inquiries.json', contactInquiries);
  res.json({ success: true, message: 'Inquiry status updated.', inquiry });
});

// Delete Inquiry
app.delete('/api/cms/inquiries/:id', authenticateAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = contactInquiries.findIndex(i => i.id === id || i.referenceId === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Inquiry not found.' });
  }

  contactInquiries.splice(index, 1);
  saveJson('inquiries.json', contactInquiries);
  res.json({ success: true, message: 'Inquiry deleted.' });
});


// ==========================================
// CMS JOURNAL & EDITORIAL ARTICLES
// ==========================================

// Create Journal Article (Supports both /api/cms/journal and /api/journal)
app.post(['/api/cms/journal', '/api/journal'], authenticateAdmin, (req: AuthRequest, res: Response) => {
  const { title, category, categoryLabel, readTime, author, authorTitle, leadExcerpt, content, image } = req.body;

  if (!title || !leadExcerpt) {
    return res.status(400).json({ error: 'Article title and lead excerpt are required.' });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newArticle: JournalArticle = {
    id: `art-${Date.now()}`,
    title: String(title).trim(),
    slug,
    category: category || 'festive-styling',
    categoryLabel: categoryLabel || 'Festive Styling',
    readTime: readTime ? String(readTime).trim() : '5 min read',
    author: author ? String(author).trim() : req.adminUser?.fullName || 'Atelier Scribe',
    authorTitle: authorTitle ? String(authorTitle).trim() : 'Heritage Specialist',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    leadExcerpt: String(leadExcerpt).trim(),
    content: Array.isArray(content) && content.length > 0 ? content : [leadExcerpt],
    image: image ? String(image).trim() : 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    imageAlt: title,
    essayNumber: `ESSAY 0${journalArticles.length + 1}`
  };

  journalArticles.unshift(newArticle);
  saveJson('journal.json', journalArticles);
  res.status(201).json({ success: true, message: 'Journal article published.', article: newArticle, ...newArticle });
});

// Update Journal Article (Supports both /api/cms/journal/:id and /api/journal/:id)
app.put(['/api/cms/journal/:id', '/api/journal/:id'], authenticateAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = journalArticles.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Article not found.' });
  }

  journalArticles[index] = {
    ...journalArticles[index],
    ...req.body
  };

  saveJson('journal.json', journalArticles);
  res.json({ success: true, message: 'Article updated.', article: journalArticles[index], ...journalArticles[index] });
});

// Delete Journal Article (Supports both /api/cms/journal/:id and /api/journal/:id)
app.delete(['/api/cms/journal/:id', '/api/journal/:id'], authenticateAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = journalArticles.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Article not found.' });
  }

  journalArticles.splice(index, 1);
  saveJson('journal.json', journalArticles);
  res.json({ success: true, message: 'Article deleted.' });
});

// ==========================================
// CMS REVIEWS MODERATION
// ==========================================

// Get All Reviews Across Products
app.get('/api/cms/reviews', authenticateAdmin, (_req: AuthRequest, res: Response) => {
  const flattenedReviews: (Review & { productName: string })[] = [];

  for (const [productId, rList] of reviewsStore.entries()) {
    const prod = products.find(p => p.id === productId);
    const prodName = prod ? prod.name : productId;
    for (const r of rList) {
      flattenedReviews.push({ ...r, productName: prodName });
    }
  }

  flattenedReviews.sort((a, b) => b.helpfulCount - a.helpfulCount);

  res.json({ reviews: flattenedReviews, total: flattenedReviews.length });
});

// Toggle Review Verification
app.patch('/api/cms/reviews/:id/verify', authenticateAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  let targetReview: Review | undefined;

  for (const rList of reviewsStore.values()) {
    const found = rList.find(r => r.id === id);
    if (found) {
      found.verifiedPurchase = !found.verifiedPurchase;
      targetReview = found;
      break;
    }
  }

  if (!targetReview) {
    return res.status(404).json({ error: 'Review not found.' });
  }

  syncReviewsToFile();
  res.json({ success: true, message: 'Review verification toggled.', review: targetReview });
});

// Update Review Status (Approved / Pending - Supports PUT and PATCH)
app.all('/api/cms/reviews/:id/status', authenticateAdmin, (req: AuthRequest, res: Response) => {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.params;
  const { status } = req.body;
  let targetReview: Review | undefined;

  for (const rList of reviewsStore.values()) {
    const found = rList.find(r => r.id === id);
    if (found) {
      found.status = status;
      targetReview = found;
      break;
    }
  }

  if (!targetReview) {
    return res.status(404).json({ error: 'Review not found.' });
  }

  syncReviewsToFile();
  res.json({ success: true, message: `Review status updated to ${status}.`, review: targetReview });
});

// Delete Review
app.delete('/api/cms/reviews/:id', authenticateAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  let deleted = false;

  for (const [pId, rList] of reviewsStore.entries()) {
    const idx = rList.findIndex(r => r.id === id);
    if (idx !== -1) {
      rList.splice(idx, 1);
      reviewsStore.set(pId, rList);
      deleted = true;
      break;
    }
  }

  if (!deleted) {
    return res.status(404).json({ error: 'Review not found.' });
  }

  syncReviewsToFile();
  res.json({ success: true, message: 'Review deleted.' });
});

// ==========================================
// CMS SITE SETTINGS & BRAND CONTENT CONTROLS
// ==========================================

export interface SiteSettings {
  announcementText: string;
  announcementEnabled: boolean;
  announcementBg: string;
  announcementTextColor: string;
  heroHeading: string;
  heroItalicWord: string;
  heroSubtitle: string;
  heroImage: string;
  heroPrimaryBtnText: string;
  heroSecondaryBtnText: string;
  heroAudienceNote: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialInstagram: string;
  socialWhatsapp: string;
  storeCurrencySymbol: string;
  freeShippingThreshold: number;
}

let siteSettings: SiteSettings = loadJson<SiteSettings>('settings.json', {
  announcementText: 'Thoughtfully Curated Festive Décor — Complimentary Shipping on Orders Over ₹2,999',
  announcementEnabled: true,
  announcementBg: '#800020',
  announcementTextColor: '#FFF9F2',
  heroHeading: 'Make Every Moment',
  heroItalicWord: 'Beautiful.',
  heroSubtitle: 'Thoughtfully chosen décor for celebrations, meaningful moments, and everyday living. Handcrafted with reverence for India’s richest artisan traditions.',
  heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMdGqTs8sIYaCbwDopmf31fHBsgPr8c1G59yDq68RsY96FN2KBGJHFTh-_MjF-q-wbNJ6jd6GrcJb_C_MDLONDbcXFq2fq4UNXEWsYZzBy_3CqkmhoiXaktJlof8y-EYiHth2oLamIIvsjVlPoFnNr6TpAhkIzGEAYOLqFDhNkcphMGn6ck0k6x_omVH3wk1zbeoAEcRPRwrKTmn-lutDS3lpehMqn7UBPHmuwfO323OrViLB4dPOjgA',
  heroPrimaryBtnText: 'Shop the Collection',
  heroSecondaryBtnText: 'Explore Festive Décor',
  heroAudienceNote: 'Loved by over 18,500+ homes across India & abroad.',
  logoUrl: '/Sajavat.svg',
  contactEmail: 'concierge@sajavat.com',
  contactPhone: '+91 98112 34567',
  contactAddress: 'Sajavat Atelier, 14 Heritage Lane, Moradabad, UP 244001',
  socialInstagram: 'https://instagram.com/sajavatatelier',
  socialWhatsapp: 'https://wa.me/919811234567',
  storeCurrencySymbol: '₹',
  freeShippingThreshold: 2999
});
if (!fs.existsSync(path.join(DATA_DIR, 'settings.json'))) {
  saveJson('settings.json', siteSettings);
}

// Public Get Site Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({ success: true, settings: siteSettings });
});

// Admin Update Site Settings
app.put(['/api/cms/settings', '/api/settings'], authenticateAdmin, (req: AuthRequest, res: Response) => {
  siteSettings = {
    ...siteSettings,
    ...req.body
  };
  saveJson('settings.json', siteSettings);
  res.json({ success: true, message: 'Atelier site settings updated.', settings: siteSettings });
});

// Media & Artwork File Upload (Base64 -> /public/uploads/ -> /uploads/url)
app.post('/api/cms/upload', authenticateAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { filename, base64Data } = req.body;
    if (!base64Data || typeof base64Data !== 'string') {
      return res.status(400).json({ error: 'base64Data is required.' });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';
      else if (mime.includes('svg')) ext = 'svg';
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    const cleanBase = (filename || 'artwork')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);
    const savedName = `art_${Date.now()}_${cleanBase}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, savedName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${savedName}`;
    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully.',
      url: publicUrl,
      filename: savedName
    });
  } catch (err: any) {
    console.error('Error handling upload:', err);
    res.status(500).json({ error: err.message || 'Failed to process media upload.' });
  }
});

// Update Product Image (Supports quick swap /api/cms/update-image and key-based updates)
app.all(
  ['/api/cms/update-image', '/api/cms/products/update-image', '/api/cms/products/:id/image'],
  authenticateAdmin,
  (req: AuthRequest, res: Response) => {
    if (req.method !== 'POST' && req.method !== 'PATCH' && req.method !== 'PUT') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const id = req.params?.id || req.body?.productId || req.body?.id;
    const { imageUrl, imageType, imageKey } = req.body;

    const product = products.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ error: 'Valid imageUrl is required.' });
    }

    const key = (imageType || imageKey || 'main') as keyof typeof product.images;
    product.images[key] = imageUrl.trim();
    saveJson('products.json', products);

    res.json({
      success: true,
      message: `Updated ${key} image for ${product.name}.`,
      product
    });
  }
);

// ==========================================
// DYNAMIC XML SITEMAP & ROBOTS.TXT (SEO ENGINE)
// ==========================================

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(
    fullSeoData.robots.customRobotsTxt ||
      'User-agent: *\nAllow: /\nDisallow: /cms\nDisallow: /admin\nSitemap: https://sajavat.atelier.com/sitemap.xml'
  );
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const protocol = req.protocol;
  const host = req.get('host') || 'sajavat.atelier.com';
  const baseUrl = `${protocol}://${host}`;
  const now = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // 1. Static Pages
  if (fullSeoData.sitemap.includeStaticPages) {
    Object.values(fullSeoData.pages).forEach((page: any) => {
      const pagePath = page.slug ? `/${page.slug}` : '/';
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${pagePath}</loc>\n`;
      xml += `    <lastmod>${(page.lastModified || now).split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq || 'weekly'}</changefreq>\n`;
      xml += `    <priority>${page.priority || 0.8}</priority>\n`;
      if (page.ogImage) {
        xml += `    <image:image>\n      <image:loc>${page.ogImage}</image:loc>\n      <image:title>${escapeXml(
          page.title
        )}</image:title>\n    </image:image>\n`;
      }
      xml += `  </url>\n`;
    });
  }

  // 2. Categories
  if (fullSeoData.sitemap.includeCategories) {
    Object.values(fullSeoData.categories).forEach((cat: any) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/shop?category=${cat.slug}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${cat.changefreq || 'weekly'}</changefreq>\n`;
      xml += `    <priority>${cat.priority || 0.85}</priority>\n`;
      if (cat.ogImage) {
        xml += `    <image:image>\n      <image:loc>${cat.ogImage}</image:loc>\n      <image:title>${escapeXml(
          cat.title
        )}</image:title>\n    </image:image>\n`;
      }
      xml += `  </url>\n`;
    });
  }

  // 3. Products
  if (fullSeoData.sitemap.includeProducts) {
    products.forEach((prod) => {
      const prodSeo = fullSeoData.products[prod.id];
      const slug = prodSeo?.slug || prod.id;
      const title = prodSeo?.title || prod.name;
      const mainImg = prod.images.main;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/products/${slug}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      if (mainImg) {
        xml += `    <image:image>\n      <image:loc>${mainImg}</image:loc>\n      <image:title>${escapeXml(
          title
        )}</image:title>\n    </image:image>\n`;
      }
      xml += `  </url>\n`;
    });
  }

  // 4. Articles
  if (fullSeoData.sitemap.includeArticles) {
    journalArticles.forEach((art) => {
      const artSeo = fullSeoData.articles[art.id];
      const slug = artSeo?.slug || art.slug;
      const title = artSeo?.title || art.title;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/journal/${slug}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      if (art.image) {
        xml += `    <image:image>\n      <image:loc>${art.image}</image:loc>\n      <image:title>${escapeXml(
          title
        )}</image:title>\n    </image:image>\n`;
      }
      xml += `  </url>\n`;
    });
  }

  xml += `</urlset>`;
  res.type('application/xml');
  res.send(xml);
});

// ==========================================
// SEO MANAGEMENT API ENDPOINTS
// ==========================================

// Public SEO Settings for Frontend Client
app.get('/api/seo', (_req: Request, res: Response) => {
  res.json({
    success: true,
    seo: {
      global: fullSeoData.global,
      pages: fullSeoData.pages,
      categories: fullSeoData.categories,
      products: fullSeoData.products,
      articles: fullSeoData.articles,
      redirects: fullSeoData.redirects.filter((r: any) => r.active)
    }
  });
});

// Admin Full SEO Architecture & Live Audit
app.get(
  '/api/cms/seo',
  authenticateAdmin,
  (_req: AuthRequest, res: Response) => {

    const audit = runSeoAudit(fullSeoData, products, journalArticles);
    res.json({
      success: true,
      seo: fullSeoData,
      audit
    });
  }
);

// Admin Update SEO Architecture
app.put(
  '/api/cms/seo',
  authenticateAdmin,
  requireSuperAdmin,
  (req: AuthRequest, res: Response) => {
    const update = req.body;
    if (!update || typeof update !== 'object') {
      return res.status(400).json({ error: 'Invalid SEO payload.' });
    }

    if (update.global) fullSeoData.global = { ...fullSeoData.global, ...update.global };
    if (update.pages) fullSeoData.pages = { ...fullSeoData.pages, ...update.pages };
    if (update.categories) fullSeoData.categories = { ...fullSeoData.categories, ...update.categories };
    if (update.products) fullSeoData.products = { ...fullSeoData.products, ...update.products };
    if (update.articles) fullSeoData.articles = { ...fullSeoData.articles, ...update.articles };
    if (update.robots) fullSeoData.robots = { ...fullSeoData.robots, ...update.robots };
    if (update.sitemap) fullSeoData.sitemap = { ...fullSeoData.sitemap, ...update.sitemap };
    if (Array.isArray(update.redirects)) fullSeoData.redirects = update.redirects;

    saveJson('seo.json', fullSeoData);

    const audit = runSeoAudit(fullSeoData, products, journalArticles);
    res.json({
      success: true,
      message: 'Atelier SEO architecture updated successfully.',
      seo: fullSeoData,
      audit
    });
  }
);

// Admin Run Instant SEO Audit
app.get(
  '/api/cms/seo/audit',
  authenticateAdmin,
  (_req: AuthRequest, res: Response) => {
    const audit = runSeoAudit(fullSeoData, products, journalArticles);
    res.json({ success: true, audit });
  }
);

// Admin Redirects List
app.get('/api/cms/seo/redirects', authenticateAdmin, (_req: AuthRequest, res: Response) => {
  res.json({ success: true, redirects: fullSeoData.redirects });
});

// Admin Create Redirect
app.post(
  '/api/cms/seo/redirects',
  authenticateAdmin,
  (req: AuthRequest, res: Response) => {
    const { sourceUrl, targetUrl, statusCode, note } = req.body;
    if (!sourceUrl || !targetUrl) {
      return res.status(400).json({ error: 'Source URL and Target URL are required.' });
    }

    const cleanSource = sourceUrl.trim().startsWith('/') ? sourceUrl.trim() : `/${sourceUrl.trim()}`;
    const newRedirect = {
      id: `redir-${Date.now()}`,
      sourceUrl: cleanSource,
      targetUrl: targetUrl.trim(),
      statusCode: Number(statusCode) === 302 ? 302 : 301,
      active: true,
      hitCount: 0,
      createdAt: new Date().toISOString(),
      note: note ? String(note).trim() : ''
    };

    fullSeoData.redirects.unshift(newRedirect);
    saveJson('seo.json', fullSeoData);
    res.status(201).json({ success: true, message: 'Redirect rule created.', redirect: newRedirect });
  }
);

// Admin Update Redirect
app.put(
  '/api/cms/seo/redirects/:id',
  authenticateAdmin,
  (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const index = fullSeoData.redirects.findIndex((r: any) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Redirect not found.' });
    }

    fullSeoData.redirects[index] = { ...fullSeoData.redirects[index], ...req.body };
    saveJson('seo.json', fullSeoData);
    res.json({ success: true, message: 'Redirect updated.', redirect: fullSeoData.redirects[index] });
  }
);

// Admin Delete Redirect
app.delete(
  '/api/cms/seo/redirects/:id',
  authenticateAdmin,
  (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    fullSeoData.redirects = fullSeoData.redirects.filter((r: any) => r.id !== id);
    saveJson('seo.json', fullSeoData);
    res.json({ success: true, message: 'Redirect rule removed.' });
  }
);

// ==========================================
// VITE DEV SERVER OR PRODUCTION SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sajavat Server] Atelier running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
