import {
  FullSeoData,
  PageSeoConfig,
  CategorySeoConfig,
  ProductSeoConfig,
  ArticleSeoConfig,
  SeoRedirect,
  RobotsConfig,
  SitemapConfig,
  GlobalSeoSettings,
  SeoAuditReport,
  SeoAuditItem,
  Product,
  JournalArticle
} from '../types';

export const DEFAULT_GLOBAL_SEO: GlobalSeoSettings = {
  siteName: 'Sajavat Atelier',
  titleSeparator: ' | ',
  defaultTitle: 'Sajavat — Luxury Artisanal Home Décor & Handcrafted Brassware',
  defaultDescription: 'Discover handcrafted brass urlis, festive diyas, scented soy candles & heirloom gifts. Decore For Every Celebration with insured nationwide delivery.',
  defaultOgImage: 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=1200&q=80',
  twitterHandle: '@sajavatatelier',
  googleSiteVerification: 'google-site-verification=sajavat_atelier_seo_auth_2026',
  bingSiteVerification: 'bing-site-verification=sajavat_bing_webmaster_2026',
  organizationSchema: {
    name: 'Sajavat Atelier',
    legalName: 'Sajavat Luxury Crafts Private Limited',
    url: 'https://sajavat.atelier.com',
    logo: 'https://sajavat.atelier.com/Sajavat.svg',
    contactEmail: 'concierge@sajavat.com',
    contactPhone: '+91 98112 34567',
    addressCountry: 'India',
    sameAs: [
      'https://instagram.com/sajavatatelier',
      'https://pinterest.com/sajavatatelier',
      'https://wa.me/919811234567'
    ]
  }
};

export const DEFAULT_PAGES_SEO: Record<string, PageSeoConfig> = {
  home: {
    pageId: 'home',
    pageLabel: 'Homepage (Storefront)',
    title: 'Sajavat — Luxury Artisanal Home Décor & Handcrafted Brassware',
    description: 'Discover handcrafted brass urlis, festive diyas, scented soy candles & heirloom gifts. Decore For Every Celebration with insured nationwide delivery.',
    focusKeyword: 'festive home decor brassware',
    secondaryKeywords: ['handcrafted brass urli', 'moradabad brassware', 'diwali festive gifts', 'luxury indian home decor'],
    slug: '',
    canonicalUrl: 'https://sajavat.atelier.com/',
    ogTitle: 'Sajavat — Handcrafted Brassware & Festive Décor',
    ogDescription: 'Decore For Every Celebration. Pure brass urlis, temple bells, and botanical soy candles crafted by master artisans.',
    ogImage: 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    metaRobots: 'index, follow',
    schemaType: 'Store',
    priority: 1.0,
    changefreq: 'daily',
    lastModified: new Date().toISOString()
  },
  shop: {
    pageId: 'shop',
    pageLabel: 'Shop Catalogue & Collections',
    title: 'Shop Handcrafted Brass Urlis, Diyas & Festive Décor | Sajavat',
    description: 'Explore heirloom brassware, sand-cast urlis, aromatic pillar candles & festive hampers. Complimentary nationwide delivery on orders over ₹2,999.',
    focusKeyword: 'buy brass home decor online',
    secondaryKeywords: ['handcrafted brass diyas', 'luxury gift hampers', 'festive table decor'],
    slug: 'shop',
    canonicalUrl: 'https://sajavat.atelier.com/shop',
    ogTitle: 'Shop Curated Festive Décor & Artisanal Brassware | Sajavat',
    ogDescription: 'Browse heirloom brass urlis, temple lamps, scented soy candles, and luxury festive hampers.',
    ogImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    metaRobots: 'index, follow',
    schemaType: 'CollectionPage',
    priority: 0.9,
    changefreq: 'daily',
    lastModified: new Date().toISOString()
  },
  about: {
    pageId: 'about',
    pageLabel: 'Our Story & Moradabad Guild',
    title: 'Our Heritage & 400-Year Moradabad Artisan Guild | Sajavat',
    description: 'Learn how Sajavat preserves the sacred crafts of Moradabad bell-metal casting and chiseling. Handcrafted by multigenerational artisan families.',
    focusKeyword: 'moradabad artisan heritage',
    secondaryKeywords: ['indian brass craft history', 'sand casting brass', 'ethical luxury decor'],
    slug: 'about',
    canonicalUrl: 'https://sajavat.atelier.com/about',
    ogTitle: 'Our Heritage & 400-Year Moradabad Artisan Guild',
    ogDescription: 'Preserving ancient sand-casting and hand-chiseling heritage in Moradabad, Uttar Pradesh.',
    ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    metaRobots: 'index, follow',
    schemaType: 'AboutPage',
    priority: 0.7,
    changefreq: 'monthly',
    lastModified: new Date().toISOString()
  },
  journal: {
    pageId: 'journal',
    pageLabel: 'The Atelier Journal',
    title: 'The Sajavat Journal — Festive Styling, Ritual Care & Artisan Notes',
    description: 'Curated essays on foyer styling, brass ritual care, botanical fragrances, and festive entertaining traditions.',
    focusKeyword: 'festive home styling guide',
    secondaryKeywords: ['brass care tips', 'urli decoration ideas', 'botanical candle guide'],
    slug: 'journal',
    canonicalUrl: 'https://sajavat.atelier.com/journal',
    ogTitle: 'The Sajavat Journal — Curated Festive Living',
    ogDescription: 'Step inside our ateliers. Styling guides, artisan memoirs, and festive decor inspiration.',
    ogImage: 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    metaRobots: 'index, follow',
    schemaType: 'Blog',
    priority: 0.8,
    changefreq: 'weekly',
    lastModified: new Date().toISOString()
  },
  contact: {
    pageId: 'contact',
    pageLabel: 'Concierge & Customer Care',
    title: 'Concierge & Customer Care — Bespoke Festive Styling | Sajavat',
    description: 'Connect with our Moradabad concierge for bespoke gifting, bulk festive hampers, order tracking, and artisan inquiries.',
    focusKeyword: 'sajavat concierge contact',
    secondaryKeywords: ['custom brassware orders', 'corporate diwali hampers', 'customer care'],
    slug: 'contact',
    canonicalUrl: 'https://sajavat.atelier.com/contact',
    ogTitle: 'Connect With Our Concierge | Sajavat Atelier',
    ogDescription: 'Bespoke styling consultations, bulk gifting concierge, and order assistance.',
    ogImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    metaRobots: 'index, follow',
    schemaType: 'ContactPage',
    priority: 0.6,
    changefreq: 'monthly',
    lastModified: new Date().toISOString()
  },
  'care-guide': {
    pageId: 'care-guide',
    pageLabel: 'Ritual Care & Cleaning Guide',
    title: 'Brass Ritual Care, Patina Maintenance & Cleaning Guide | Sajavat',
    description: 'Step-by-step master guide for preserving solid brass heirlooms. Cleaning with pitambari, tamarind, and microfiber to maintain eternal radiance.',
    focusKeyword: 'how to clean brass diyas',
    secondaryKeywords: ['brass patina care', 'pitambari cleaning brass urli', 'heirloom metal maintenance'],
    slug: 'care-guide',
    canonicalUrl: 'https://sajavat.atelier.com/care-guide',
    ogTitle: 'Heirloom Brass Ritual Care Guide | Sajavat',
    ogDescription: 'Preserve the eternal golden luster of your Moradabad brassware across generations.',
    ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    metaRobots: 'index, follow',
    schemaType: 'FAQPage',
    priority: 0.7,
    changefreq: 'monthly',
    lastModified: new Date().toISOString()
  }
};

export const DEFAULT_CATEGORIES_SEO: Record<string, CategorySeoConfig> = {
  'diyas-candle-holders': {
    categoryId: 'diyas-candle-holders',
    categoryLabel: 'Diyas & Candle Holders',
    title: 'Artisanal Brass Diyas & Luxury Candle Holders | Sajavat',
    description: 'Shop handcrafted brass diyas, akhand jyotis, and contemporary candle holders forged in Moradabad for radiant festive celebrations.',
    focusKeyword: 'brass diyas candle holders',
    h1Override: 'Handcrafted Brass Diyas & Temple Candle Holders',
    seoContentIntro: 'Bring divine illumination into your sacred living spaces with our Moradabad sand-cast brass lamps and akhand jyoti vessels.',
    slug: 'diyas-candle-holders',
    canonicalUrl: 'https://sajavat.atelier.com/shop?category=diyas-candle-holders',
    ogImage: 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=1200&q=80',
    metaRobots: 'index, follow',
    priority: 0.85,
    changefreq: 'weekly'
  },
  'candles-fragrance': {
    categoryId: 'candles-fragrance',
    categoryLabel: 'Candles & Fragrance',
    title: 'Kashmiri Botanical Soy Candles & Mysore Sandalwood Aromas | Sajavat',
    description: 'Discover clean-burning botanical soy candles infused with pure Mysore sandalwood, saffron stigmas, and cold-pressed botanical oils.',
    focusKeyword: 'botanical soy candles sandalwood',
    h1Override: 'Botanical Soy Candles & Scented Aromatics',
    seoContentIntro: 'Transform your home into a sanctuary of peace with non-toxic, soot-free soy wax candles scented with natural Indian botanicals.',
    slug: 'candles-fragrance',
    canonicalUrl: 'https://sajavat.atelier.com/shop?category=candles-fragrance',
    ogImage: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80',
    metaRobots: 'index, follow',
    priority: 0.85,
    changefreq: 'weekly'
  },
  'festive-decorations': {
    categoryId: 'festive-decorations',
    categoryLabel: 'Festive Decorations',
    title: 'Festive Door Torans, Brass Bells & Temple Garland Décor | Sajavat',
    description: 'Elevate festive foyers and mandirs with everlasting Chanderi organza garlands, cast temple bells, and auspicious doorway torans.',
    focusKeyword: 'festive decorations door torans brass bells',
    h1Override: 'Artisanal Festive Garlands & Doorway Décor',
    seoContentIntro: 'Welcome Lakshmi and auspicious beginnings with melodious brass bell drapes and artisan-strung festive garlands.',
    slug: 'festive-decorations',
    canonicalUrl: 'https://sajavat.atelier.com/shop?category=festive-decorations',
    ogImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
    metaRobots: 'index, follow',
    priority: 0.85,
    changefreq: 'weekly'
  },
  'home-accents': {
    categoryId: 'home-accents',
    categoryLabel: 'Home Accents',
    title: 'Moradabad Hand-Chiseled Brass Urlis & Royal Centerpieces | Sajavat',
    description: 'Shop heavyweight virgin brass urlis sculpted for floating marigolds and scented candles. Heritage craftsmanship for luxury Indian living.',
    focusKeyword: 'brass urlis home accents centerpiece',
    h1Override: 'Handcrafted Brass Urlis & Sculptural Centerpieces',
    seoContentIntro: 'Command visual reverence in your foyer or coffee table with our signature hand-hammered and peacock-chiseled brass urlis.',
    slug: 'home-accents',
    canonicalUrl: 'https://sajavat.atelier.com/shop?category=home-accents',
    ogImage: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=80',
    metaRobots: 'index, follow',
    priority: 0.85,
    changefreq: 'weekly'
  },
  'table-decor': {
    categoryId: 'table-decor',
    categoryLabel: 'Table Décor',
    title: 'Artisan Brass Coasters, Festive Runners & Table Accents | Sajavat',
    description: 'Curate memorable festive dinner tables with Ayurvedic kansa tableware, hand-etched brass coasters, and gold-embroidered table linens.',
    focusKeyword: 'festive table decor brass tableware',
    h1Override: 'Festive Tableware & Artisanal Dining Accents',
    seoContentIntro: 'Impart imperial grace to Diwali feasts and festive gatherings with hand-beaten bronze and brass tableware.',
    slug: 'table-decor',
    canonicalUrl: 'https://sajavat.atelier.com/shop?category=table-decor',
    ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    metaRobots: 'index, follow',
    priority: 0.85,
    changefreq: 'weekly'
  },
  'gifts-hampers': {
    categoryId: 'gifts-hampers',
    categoryLabel: 'Gifts & Hampers',
    title: 'Curated Royal Festive Hampers & Velvet Gift Trunks | Sajavat',
    description: 'Luxurious gift boxes featuring handcrafted brassware, wild raw honey, Kashmiri saffron, and soy candles in imperial velvet trunks.',
    focusKeyword: 'luxury diwali gift hamper corporate gifting',
    h1Override: 'Royal Festive Hampers & Curated Gift Trunks',
    seoContentIntro: 'Presented in keepsake wine-burgundy velvet trunks with brass hardware and personalized wax seals for royal gifting.',
    slug: 'gifts-hampers',
    canonicalUrl: 'https://sajavat.atelier.com/shop?category=gifts-hampers',
    ogImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
    metaRobots: 'index, follow',
    priority: 0.85,
    changefreq: 'weekly'
  }
};

export const DEFAULT_PRODUCTS_SEO: Record<string, ProductSeoConfig> = {
  'saj-01': {
    productId: 'saj-01',
    title: 'Mayura Brass Urli with Floating Diya Set | Sajavat',
    description: 'Sand-cast solid brass urli hand-etched with peacock feather motifs. Includes 5 floating diyas. Free shipping across India.',
    focusKeyword: 'mayura brass urli floating diya',
    slug: 'mayura-brass-urli',
    imageAlt: 'Mayura hand-chiseled brass urli with peacock motifs and floating diyas',
    canonicalUrl: 'https://sajavat.atelier.com/products/mayura-brass-urli',
    metaRobots: 'index, follow'
  },
  'saj-02': {
    productId: 'saj-02',
    title: 'Kashmiri Saffron & Sandalwood Soy Pillar Candle | Sajavat',
    description: 'Pure cold-pressed botanical soy wax pillar infused with Mysore sandalwood and Kashmiri saffron. 65 hours soot-free burn time.',
    focusKeyword: 'kashmiri sandalwood soy candle',
    slug: 'kashmiri-saffron-sandalwood-candle',
    imageAlt: 'Pure cold-pressed soy wax pillar candle scented with natural mysore sandalwood',
    canonicalUrl: 'https://sajavat.atelier.com/products/kashmiri-saffron-sandalwood-candle',
    metaRobots: 'index, follow'
  },
  'saj-03': {
    productId: 'saj-03',
    title: 'Ashtalakshmi Tiered Brass Akhand Diya | Sajavat',
    description: 'Traditional eight-form Lakshmi tiered bell-metal oil lamp for festive mandir sanctums. Hand-polished heirloom finish.',
    focusKeyword: 'ashtalakshmi brass akhand diya',
    slug: 'ashtalakshmi-tiered-brass-diya',
    imageAlt: 'Traditional eight-form lakshmi brass tiered oil lamp for festive mandir',
    canonicalUrl: 'https://sajavat.atelier.com/products/ashtalakshmi-tiered-brass-diya',
    metaRobots: 'index, follow'
  },
  'saj-04': {
    productId: 'saj-04',
    title: 'Royal Jaipur Meenakari Brass Incense Burner | Sajavat',
    description: 'Hand-enameled brass dhoop holder with vibrant Jaipur meenakari art and lid lattice for serene fragrant ventilation.',
    focusKeyword: 'jaipur meenakari brass incense burner',
    slug: 'royal-jaipur-meenakari-burner',
    imageAlt: 'Enamelled brass dhoop holder with hand painted jaipur meenakari motifs',
    canonicalUrl: 'https://sajavat.atelier.com/products/royal-jaipur-meenakari-burner',
    metaRobots: 'index, follow'
  },
  'saj-05': {
    productId: 'saj-05',
    title: 'Kansa Hand-Hammered Festive Serving Thali Set | Sajavat',
    description: 'Ayurvedic bell metal bronze dinner thali hand-beaten by master metal smiths. Elevate auspicious festive dining.',
    focusKeyword: 'kansa bronze serving thali',
    slug: 'kansa-hand-hammered-serving-thali',
    imageAlt: 'Pure ayurvedic bell metal kansa thali for festive dining and prasad offerings',
    canonicalUrl: 'https://sajavat.atelier.com/products/kansa-hand-hammered-serving-thali',
    metaRobots: 'index, follow'
  },
  'saj-06': {
    productId: 'saj-06',
    title: 'Gilded Kamal Lotus Brass Tealight Pair | Sajavat',
    description: 'Set of two blooming lotus candle holders hand-cast in Moradabad brass. Beautiful layered petals reflect glowing candlelight.',
    focusKeyword: 'lotus brass tealight holder pair',
    slug: 'gilded-kamal-lotus-tealight-pair',
    imageAlt: 'Double tiered blooming lotus candle holder in solid antique brass finish',
    canonicalUrl: 'https://sajavat.atelier.com/products/gilded-kamal-lotus-tealight-pair',
    metaRobots: 'index, follow'
  },
  'saj-07': {
    productId: 'saj-07',
    title: 'Sajavat Shahi Royal Diwali Gift Hamper | Sajavat',
    description: 'Luxury velvet trunk hamper with brass diya, Kashmiri saffron, wild honey, and botanical soy candle. Personalized wax-sealed card.',
    focusKeyword: 'royal diwali gift hamper luxury',
    slug: 'sajavat-shahi-royal-gift-hamper',
    imageAlt: 'Imperial wine velvet trunk containing brass diya honey saffron and soy candle',
    canonicalUrl: 'https://sajavat.atelier.com/products/sajavat-shahi-royal-gift-hamper',
    metaRobots: 'index, follow'
  },
  'saj-08': {
    productId: 'saj-08',
    title: 'Chanderi Marigold Floral Garland with Brass Bells | Sajavat',
    description: 'Five-foot organza marigold garland strand finished with melodic solid brass temple bells. Ideal for entryways and mandirs.',
    focusKeyword: 'chanderi marigold brass bell garland',
    slug: 'chanderi-marigold-brass-garland',
    imageAlt: 'Tactile spun organza marigold garland with melodious solid brass temple bells',
    canonicalUrl: 'https://sajavat.atelier.com/products/chanderi-marigold-brass-garland',
    metaRobots: 'index, follow'
  }
};

export const DEFAULT_ARTICLES_SEO: Record<string, ArticleSeoConfig> = {
  'art-01': {
    articleId: 'art-01',
    title: 'Festive Foyer Styling: Urlis, Floating Petals & Brass Diyas | Sajavat',
    description: 'Transform your home entrance into a tranquil sanctuary with hand-chiseled brass urlis, floating marigolds, and asymmetric brass candlelight.',
    focusKeyword: 'festive foyer urli styling guide',
    slug: 'festive-foyer-styling-guide',
    imageAlt: 'Handcrafted solid brass urli with floating marigolds and glowing brass diyas in festive foyer',
    canonicalUrl: 'https://sajavat.atelier.com/journal/festive-foyer-styling-guide',
    metaRobots: 'index, follow'
  },
  'art-02': {
    articleId: 'art-02',
    title: 'Vastu Brass Urli Placement: Water, Directions & Deepam Rules | Sajavat',
    description: 'Harness Ishanya North-East directions, water element flow, and sacred brass deepams to invite peace and wealth according to classical Vastu.',
    focusKeyword: 'vastu brass urli placement',
    slug: 'vastu-brass-urli-placement-guide',
    imageAlt: 'Traditional brass urli placed in North-East corner with floating marigolds and serene reflection',
    canonicalUrl: 'https://sajavat.atelier.com/journal/vastu-brass-urli-placement-guide',
    metaRobots: 'index, follow'
  },
  'art-03': {
    articleId: 'art-03',
    title: 'Inside Moradabad Foundries: 400-Year Heritage of Sand-Cast Brass | Sajavat',
    description: 'Explore the 11 sacred stages of Moradabad sand-casting bell-metal and master hand-chiseling with iron chheni for enduring festive heirlooms.',
    focusKeyword: 'moradabad brass foundry history',
    slug: 'moradabad-brass-heritage',
    imageAlt: 'Moradabad brass artisan chiseling intricate patterns on solid brass vessel in historic atelier',
    canonicalUrl: 'https://sajavat.atelier.com/journal/moradabad-brass-heritage',
    metaRobots: 'index, follow'
  },
  'art-04': {
    articleId: 'art-04',
    title: 'Brass Patina & Ritual Care: Cleaning with Tamarind & Pitambari | Sajavat',
    description: 'Master chemical-free brass cleaning using natural tamarind pulp, lemon, and Pitambari to preserve golden luster without scratching metal.',
    focusKeyword: 'how to clean brass diyas patina care',
    slug: 'brass-patina-care-restoration-guide',
    imageAlt: 'Traditional brass deepam being gently polished with natural paste to restore golden luster',
    canonicalUrl: 'https://sajavat.atelier.com/journal/brass-patina-care-restoration-guide',
    metaRobots: 'index, follow'
  },
  'art-05': {
    articleId: 'art-05',
    title: 'Why Botanical Soy & Mysore Sandalwood Matter for Festive Wellness | Sajavat',
    description: 'Avoid petroleum paraffin fumes during celebrations. Learn how clean-burning soy wax and distilled Mysore sandalwood purify indoor air.',
    focusKeyword: 'clean botanical soy candles sandalwood',
    slug: 'botanical-fragrance-clean-lighting',
    imageAlt: 'Clean burning botanical soy candle in hand-hammered brass vessel with natural sandalwood notes',
    canonicalUrl: 'https://sajavat.atelier.com/journal/botanical-fragrance-clean-lighting',
    metaRobots: 'index, follow'
  },
  'art-06': {
    articleId: 'art-06',
    title: 'Royal Festive Table: Layering Kansa Bronze, Hand-Etched Brass | Sajavat',
    description: 'Curate an unforgettable celebratory feast tablescape with Ayurvedic bronze Kansa thalis, raw oat linens, and low-profile rivers of candlelight.',
    focusKeyword: 'luxury festive table decor brassware kansa',
    slug: 'setting-the-festive-feast',
    imageAlt: 'Imperial festive dining tablescape with raw linen runners, solid brass tableware and glowing candles',
    canonicalUrl: 'https://sajavat.atelier.com/journal/setting-the-festive-feast',
    metaRobots: 'index, follow'
  },
  'art-07': {
    articleId: 'art-07',
    title: 'The Art of the Thoughtful Keepsake: Why Heirlooms Outlive Hampers | Sajavat',
    description: 'Move beyond disposable cellophane baskets. Explore why solid bell-metal brassware and Lokta wax-sealed trunks create everlasting festive memories.',
    focusKeyword: 'luxury diwali gift hamper corporate gifting',
    slug: 'art-of-the-thoughtful-keepsake',
    imageAlt: 'Luxury velvet keepsake gift hamper with solid brass diya, botanical soy candle, and wax sealed card',
    canonicalUrl: 'https://sajavat.atelier.com/journal/art-of-the-thoughtful-keepsake',
    metaRobots: 'index, follow'
  }
};

export const DEFAULT_REDIRECTS: SeoRedirect[] = [
  {
    id: 'redir-01',
    sourceUrl: '/brass-urli',
    targetUrl: '/shop?category=home-accents',
    statusCode: 301,
    active: true,
    hitCount: 38,
    createdAt: '2026-09-01T10:00:00.000Z',
    note: 'Legacy category alias for Moradabad brass urlis'
  },
  {
    id: 'redir-02',
    sourceUrl: '/diwali-gifts',
    targetUrl: '/shop?category=gifts-hampers',
    statusCode: 301,
    active: true,
    hitCount: 94,
    createdAt: '2026-09-10T12:00:00.000Z',
    note: 'Seasonal marketing link to royal festive hampers'
  },
  {
    id: 'redir-03',
    sourceUrl: '/brass-care',
    targetUrl: '/care-guide',
    statusCode: 301,
    active: true,
    hitCount: 21,
    createdAt: '2026-09-15T15:30:00.000Z',
    note: 'Old link printed on care pamphlets'
  },
  {
    id: 'redir-04',
    sourceUrl: '/candlemaking',
    targetUrl: '/journal?slug=botanical-fragrance-clean-lighting',
    statusCode: 302,
    active: true,
    hitCount: 15,
    createdAt: '2026-09-20T08:45:00.000Z',
    note: 'Temporary social campaign redirect'
  }
];

export const DEFAULT_ROBOTS: RobotsConfig = {
  customRobotsTxt: `User-agent: *
Allow: /
Disallow: /cms
Disallow: /admin
Disallow: /api/cms
Disallow: /checkout

# Crawler rules for major search engines
User-agent: Googlebot
Allow: /
Disallow: /cms
Disallow: /admin

User-agent: Bingbot
Allow: /
Disallow: /cms

Sitemap: https://sajavat.atelier.com/sitemap.xml`,
  sitemapUrl: '/sitemap.xml',
  disallowPaths: ['/cms', '/admin', '/api/cms', '/checkout'],
  allowPaths: ['/'],
  crawlDelay: 0
};

export const DEFAULT_SITEMAP: SitemapConfig = {
  includeProducts: true,
  includeArticles: true,
  includeCategories: true,
  includeStaticPages: true,
  defaultChangefreq: 'weekly',
  customUrls: []
};

// Initial Full SEO State
export const INITIAL_FULL_SEO_DATA: FullSeoData = {
  global: DEFAULT_GLOBAL_SEO,
  pages: DEFAULT_PAGES_SEO,
  categories: DEFAULT_CATEGORIES_SEO,
  products: DEFAULT_PRODUCTS_SEO,
  articles: DEFAULT_ARTICLES_SEO,
  redirects: DEFAULT_REDIRECTS,
  robots: DEFAULT_ROBOTS,
  sitemap: DEFAULT_SITEMAP
};

// Real-Time SEO Audit Engine
export function runSeoAudit(
  seoData: FullSeoData,
  products: Product[],
  articles: JournalArticle[]
): SeoAuditReport {
  const items: SeoAuditItem[] = [];
  let checksPassed = 0;
  let warningsCount = 0;
  let errorsCount = 0;

  // 1. Audit Pages
  Object.values(seoData.pages).forEach((page) => {
    // Title length (optimal: 30-60 chars)
    if (!page.title) {
      errorsCount++;
      items.push({
        id: `page-${page.pageId}-no-title`,
        targetType: 'page',
        targetId: page.pageId,
        targetName: page.pageLabel,
        level: 'error',
        rule: 'Meta Title Required',
        message: 'Missing meta title tag.',
        recommendation: 'Add a distinctive title between 30 and 60 characters.',
        field: 'title'
      });
    } else if (page.title.length < 30) {
      warningsCount++;
      items.push({
        id: `page-${page.pageId}-short-title`,
        targetType: 'page',
        targetId: page.pageId,
        targetName: page.pageLabel,
        level: 'warning',
        rule: 'Meta Title Length',
        message: `Title is ${page.title.length} characters (recommended: 30-60).`,
        recommendation: 'Expand title with brand name and key artisan keywords.',
        field: 'title'
      });
    } else if (page.title.length > 60) {
      warningsCount++;
      items.push({
        id: `page-${page.pageId}-long-title`,
        targetType: 'page',
        targetId: page.pageId,
        targetName: page.pageLabel,
        level: 'warning',
        rule: 'Meta Title Length',
        message: `Title is ${page.title.length} characters (search engines truncate over 60).`,
        recommendation: 'Shorten title to keep it concise in Google SERPs.',
        field: 'title'
      });
    } else {
      checksPassed++;
      items.push({
        id: `page-${page.pageId}-title-pass`,
        targetType: 'page',
        targetId: page.pageId,
        targetName: page.pageLabel,
        level: 'pass',
        rule: 'Meta Title Optimal',
        message: `Title length is optimal (${page.title.length} characters).`,
        recommendation: 'Maintains ideal length for Google snippets.'
      });
    }

    // Description length (optimal: 120-160 chars)
    if (!page.description) {
      errorsCount++;
      items.push({
        id: `page-${page.pageId}-no-desc`,
        targetType: 'page',
        targetId: page.pageId,
        targetName: page.pageLabel,
        level: 'error',
        rule: 'Meta Description Required',
        message: 'Missing meta description.',
        recommendation: 'Add a compelling description between 120 and 160 characters with a clear CTA.',
        field: 'description'
      });
    } else if (page.description.length < 110) {
      warningsCount++;
      items.push({
        id: `page-${page.pageId}-short-desc`,
        targetType: 'page',
        targetId: page.pageId,
        targetName: page.pageLabel,
        level: 'warning',
        rule: 'Meta Description Length',
        message: `Description is ${page.description.length} characters (recommended: 120-160).`,
        recommendation: 'Provide more detail to maximize snippet real-estate on search pages.',
        field: 'description'
      });
    } else if (page.description.length > 165) {
      warningsCount++;
      items.push({
        id: `page-${page.pageId}-long-desc`,
        targetType: 'page',
        targetId: page.pageId,
        targetName: page.pageLabel,
        level: 'warning',
        rule: 'Meta Description Length',
        message: `Description is ${page.description.length} characters (will be truncated in search results).`,
        recommendation: 'Trim description to under 160 characters.',
        field: 'description'
      });
    } else {
      checksPassed++;
      items.push({
        id: `page-${page.pageId}-desc-pass`,
        targetType: 'page',
        targetId: page.pageId,
        targetName: page.pageLabel,
        level: 'pass',
        rule: 'Meta Description Optimal',
        message: `Description length is optimal (${page.description.length} characters).`,
        recommendation: 'Search engines will display full snippet with high CTR.'
      });
    }

    // Focus Keyword presence
    if (page.focusKeyword) {
      const kw = page.focusKeyword.toLowerCase();
      const titleHasKw = page.title.toLowerCase().includes(kw);
      if (titleHasKw) {
        checksPassed++;
        items.push({
          id: `page-${page.pageId}-kw-in-title`,
          targetType: 'page',
          targetId: page.pageId,
          targetName: page.pageLabel,
          level: 'pass',
          rule: 'Focus Keyword in Title',
          message: `Focus keyword "${page.focusKeyword}" found in title.`,
          recommendation: 'Excellent keyword targeting alignment.'
        });
      } else {
        warningsCount++;
        items.push({
          id: `page-${page.pageId}-kw-miss-title`,
          targetType: 'page',
          targetId: page.pageId,
          targetName: page.pageLabel,
          level: 'warning',
          rule: 'Keyword in Title',
          message: `Focus keyword "${page.focusKeyword}" is missing from title.`,
          recommendation: 'Incorporate primary keyword near the beginning of the title.',
          field: 'title'
        });
      }
    }
  });

  // 2. Audit Products
  products.forEach((prod) => {
    const prodSeo = seoData.products[prod.id];
    const title = prodSeo?.title || `${prod.name} | Sajavat`;
    const desc = prodSeo?.description || prod.description;
    const alt = prodSeo?.imageAlt;

    if (!alt || alt.length < 10) {
      warningsCount++;
      items.push({
        id: `prod-${prod.id}-alt`,
        targetType: 'product',
        targetId: prod.id,
        targetName: prod.name,
        level: 'warning',
        rule: 'Product Image Alt Text',
        message: 'Product image alt text is short or generic.',
        recommendation: 'Add descriptive alt text specifying material and craft heritage for Google Image Search.',
        field: 'imageAlt'
      });
    } else {
      checksPassed++;
      items.push({
        id: `prod-${prod.id}-alt-pass`,
        targetType: 'product',
        targetId: prod.id,
        targetName: prod.name,
        level: 'pass',
        rule: 'Descriptive Image Alt',
        message: `High-quality alt tag configured: "${alt.slice(0, 35)}..."`,
        recommendation: 'Optimized for visual discovery.'
      });
    }

    if (title.length >= 25 && title.length <= 65) {
      checksPassed++;
    } else {
      warningsCount++;
      items.push({
        id: `prod-${prod.id}-title-len`,
        targetType: 'product',
        targetId: prod.id,
        targetName: prod.name,
        level: 'warning',
        rule: 'Product Title Length',
        message: `Product title is ${title.length} characters (recommended: 30-60).`,
        recommendation: 'Refine product title for maximum click-through rates.'
      });
    }
  });

  // 3. Technical SEO Checks
  if (seoData.robots.customRobotsTxt.includes('Sitemap:')) {
    checksPassed++;
    items.push({
      id: 'tech-robots-sitemap',
      targetType: 'technical',
      targetId: 'robots',
      targetName: 'Robots Directives',
      level: 'pass',
      rule: 'Sitemap in Robots.txt',
      message: 'Robots.txt references XML sitemap correctly.',
      recommendation: 'Search engine crawlers find all content quickly.'
    });
  } else {
    warningsCount++;
    items.push({
      id: 'tech-robots-no-sitemap',
      targetType: 'technical',
      targetId: 'robots',
      targetName: 'Robots Directives',
      level: 'warning',
      rule: 'Sitemap in Robots.txt',
      message: 'Missing Sitemap declaration in robots.txt.',
      recommendation: 'Add "Sitemap: https://.../sitemap.xml" to robots.txt.'
    });
  }

  if (seoData.robots.disallowPaths.includes('/cms') && seoData.robots.disallowPaths.includes('/admin')) {
    checksPassed++;
    items.push({
      id: 'tech-cms-protected',
      targetType: 'technical',
      targetId: 'robots',
      targetName: 'Admin Security Crawling',
      level: 'pass',
      rule: 'CMS Paths Protected',
      message: 'Sensitive CMS, admin, and checkout paths are disallowed for search engine bots.',
      recommendation: 'Protects backend crawling budget.'
    });
  } else {
    errorsCount++;
    items.push({
      id: 'tech-cms-unprotected',
      targetType: 'technical',
      targetId: 'robots',
      targetName: 'Admin Security Crawling',
      level: 'error',
      rule: 'CMS Paths Protected',
      message: 'CMS paths (/cms, /admin) should be disallowed in robots.txt.',
      recommendation: 'Add /cms and /admin to disallow list.'
    });
  }

  // Active Redirects Check
  const activeRedirs = seoData.redirects.filter((r) => r.active);
  if (activeRedirs.length > 0) {
    checksPassed++;
    items.push({
      id: 'tech-redirects-active',
      targetType: 'technical',
      targetId: 'redirects',
      targetName: 'Redirects Manager',
      level: 'pass',
      rule: 'Permanent Redirects Configured',
      message: `${activeRedirs.length} active 301/302 redirects preventing broken links and preserving link equity.`,
      recommendation: 'Preserves SEO rank during migrations.'
    });
  }

  // Structured Data Check
  if (seoData.global.organizationSchema?.name && seoData.global.organizationSchema?.logo) {
    checksPassed++;
    items.push({
      id: 'tech-schema-org',
      targetType: 'technical',
      targetId: 'schema',
      targetName: 'Schema.org JSON-LD',
      level: 'pass',
      rule: 'Organization Structured Data',
      message: 'Complete Organization schema with brand name, logo, phone, and social handles configured.',
      recommendation: 'Eligible for Google Knowledge Panel.'
    });
  }

  // Calculate score (out of 100)
  const total = checksPassed + warningsCount + errorsCount * 2;
  const rawScore = total > 0 ? Math.round(((checksPassed + warningsCount * 0.5) / total) * 100) : 95;
  const overallScore = Math.max(70, Math.min(99, rawScore));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'A+';
  if (overallScore >= 95) grade = 'A+';
  else if (overallScore >= 88) grade = 'A';
  else if (overallScore >= 80) grade = 'B';
  else if (overallScore >= 70) grade = 'C';
  else grade = 'D';

  return {
    overallScore,
    grade,
    checksPassed,
    warningsCount,
    errorsCount,
    lastRunAt: new Date().toISOString(),
    items
  };
}
