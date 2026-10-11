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
  pairings?: string[];
}

export interface JournalArticleFaq {
  question: string;
  answer: string;
}

export interface JournalArticleSection {
  id: string;
  heading: string;
  subheading?: string;
  paragraphs: string[];
  callout?: string;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
}

export interface JournalArticle {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  category: 'festive-styling' | 'living-ambience' | 'artisan-notes' | 'gifting' | 'table-decor';
  categoryLabel: string;
  readTime: string;
  author: string;
  authorTitle: string;
  authorBio?: string;
  authorAvatar?: string;
  date: string;
  publishedIsoDate?: string;
  modifiedIsoDate?: string;
  leadExcerpt: string;
  keyTakeaways?: string[];
  content: string[];
  sections?: JournalArticleSection[];
  faqs?: JournalArticleFaq[];
  tags?: string[];
  mentionedProductIds?: string[];
  image: string;
  imageAlt: string;
  essayNumber: string;
  featuredLead?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  finish?: string;
  giftWrap: boolean;
}

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered';
  customer: OrderCustomer;
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
  items: {
    productId: string;
    name: string;
    finish?: string;
    price: number;
    quantity: number;
    giftWrap: boolean;
    image: string;
  }[];
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

export interface PincodeCheckResult {
  valid: boolean;
  pincode?: string;
  city?: string;
  state?: string;
  estimatedDays?: string;
  partner?: string;
  message?: string;
}

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
}

export interface ReviewsSummary {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ContactInquiry {
  id?: string;
  referenceId?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  orderNumber?: string;
  message: string;
  preferredMethod: 'email' | 'whatsapp' | 'phone';
  createdAt?: string;
  status?: 'new' | 'in_progress' | 'resolved';
  staffNotes?: string;
}

export type AdminRole = 'super_admin' | 'inventory_manager' | 'editor';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: AdminRole;
  createdAt: string;
  lastLogin?: string;
}

export interface CmsDashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalProducts: number;
  totalInquiries: number;
  unresolvedInquiries: number;
  recentOrders: Order[];
}

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

export interface PageSeoConfig {
  pageId: string;
  pageLabel: string;
  title: string;
  description: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  slug: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: 'summary_large_image' | 'summary';
  metaRobots: 'index, follow' | 'noindex, follow' | 'noindex, nofollow' | 'index, nofollow';
  schemaType: 'Store' | 'CollectionPage' | 'AboutPage' | 'Blog' | 'ContactPage' | 'FAQPage';
  customStructuredData?: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastModified: string;
}

export interface CategorySeoConfig {
  categoryId: string;
  categoryLabel: string;
  title: string;
  description: string;
  focusKeyword: string;
  h1Override?: string;
  seoContentIntro?: string;
  slug: string;
  canonicalUrl: string;
  ogImage: string;
  metaRobots: 'index, follow' | 'noindex, follow' | 'noindex, nofollow';
  priority: number;
  changefreq: string;
}

export interface ProductSeoConfig {
  productId: string;
  title: string;
  description: string;
  focusKeyword: string;
  slug: string;
  imageAlt: string;
  canonicalUrl: string;
  metaRobots: 'index, follow' | 'noindex, follow';
  schemaOverride?: string;
}

export interface ArticleSeoConfig {
  articleId: string;
  title: string;
  description: string;
  focusKeyword: string;
  slug: string;
  imageAlt: string;
  canonicalUrl: string;
  metaRobots: 'index, follow' | 'noindex, follow';
}

export interface SeoRedirect {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  statusCode: 301 | 302;
  active: boolean;
  hitCount: number;
  createdAt: string;
  note?: string;
}

export interface RobotsConfig {
  customRobotsTxt: string;
  sitemapUrl: string;
  disallowPaths: string[];
  allowPaths: string[];
  crawlDelay: number;
}

export interface SitemapConfig {
  includeProducts: boolean;
  includeArticles: boolean;
  includeCategories: boolean;
  includeStaticPages: boolean;
  defaultChangefreq: string;
  customUrls: { url: string; priority: number; changefreq: string }[];
}

export interface GlobalSeoSettings {
  siteName: string;
  titleSeparator: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  twitterHandle: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  organizationSchema: {
    name: string;
    legalName: string;
    url: string;
    logo: string;
    contactEmail: string;
    contactPhone: string;
    addressCountry: string;
    sameAs: string[];
  };
}

export interface SeoAuditItem {
  id: string;
  targetType: 'page' | 'product' | 'article' | 'category' | 'technical';
  targetId: string;
  targetName: string;
  level: 'error' | 'warning' | 'pass';
  rule: string;
  message: string;
  recommendation: string;
  field?: string;
}

export interface SeoAuditReport {
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  checksPassed: number;
  warningsCount: number;
  errorsCount: number;
  lastRunAt: string;
  items: SeoAuditItem[];
}

export interface FullSeoData {
  global: GlobalSeoSettings;
  pages: Record<string, PageSeoConfig>;
  categories: Record<string, CategorySeoConfig>;
  products: Record<string, ProductSeoConfig>;
  articles: Record<string, ArticleSeoConfig>;
  redirects: SeoRedirect[];
  robots: RobotsConfig;
  sitemap: SitemapConfig;
}
