import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  ExternalLink,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Link as LinkIcon,
  FileText,
  Sliders,
  Plus,
  Trash2,
  Smartphone,
  Monitor,
  Sparkles,
  ArrowRight,
  Code,
  Tag,
  Share2,
  Check,
  Compass,
  Copy,
  Info
} from 'lucide-react';
import {
  Product,
  JournalArticle,
  AdminUser,
  FullSeoData,
  PageSeoConfig,
  CategorySeoConfig,
  ProductSeoConfig,
  ArticleSeoConfig,
  SeoRedirect,
  SeoAuditReport,
  SeoAuditItem
} from '../../types';
import {
  INITIAL_FULL_SEO_DATA,
  DEFAULT_GLOBAL_SEO,
  DEFAULT_PAGES_SEO,
  DEFAULT_CATEGORIES_SEO,
  DEFAULT_PRODUCTS_SEO,
  DEFAULT_ARTICLES_SEO,
  runSeoAudit
} from '../../data/seoDefaults';

interface CmsSeoSectionProps {
  authToken: string | null;
  products: Product[];
  journalArticles: JournalArticle[];
  currentUser: AdminUser;
  onRefreshSite?: () => void;
}

export function CmsSeoSection({
  authToken,
  products,
  journalArticles,
  currentUser,
  onRefreshSite
}: CmsSeoSectionProps) {
  // Main SEO State
  const [seoData, setSeoData] = useState<FullSeoData>(INITIAL_FULL_SEO_DATA);
  const [auditReport, setAuditReport] = useState<SeoAuditReport>(() =>
    runSeoAudit(INITIAL_FULL_SEO_DATA, products, journalArticles)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sub-navigation
  type SeoSubTab = 'audit' | 'pages' | 'products' | 'articles' | 'categories' | 'redirects' | 'technical';
  const [subTab, setSubTab] = useState<SeoSubTab>('audit');

  // Audit filter
  const [auditFilter, setAuditFilter] = useState<'all' | 'error' | 'warning' | 'pass'>('all');

  // Page SEO selection
  const [selectedPageId, setSelectedPageId] = useState<string>('home');
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Product SEO selection & search
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'saj-01');
  const [productSearch, setProductSearch] = useState('');

  // Article SEO selection
  const [selectedArticleId, setSelectedArticleId] = useState<string>(journalArticles[0]?.id || 'art-01');

  // Category SEO selection
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('diyas-candle-holders');

  // Redirect modal & form
  const [isAddRedirectOpen, setIsAddRedirectOpen] = useState(false);
  const [newRedirect, setNewRedirect] = useState({
    sourceUrl: '',
    targetUrl: '',
    statusCode: 301,
    note: ''
  });

  // Keyword Density Tester
  const [densityKeyword, setDensityKeyword] = useState('brass urli');
  const [densityText, setDensityText] = useState(
    'A handcrafted solid brass urli with peacock motifs for floating fresh marigolds and glowing diyas during festive celebrations.'
  );

  // Load live SEO from server
  const fetchSeoSettings = () => {
    setIsLoading(true);
    fetch('/api/cms/seo', {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load SEO configuration');
      })
      .then((data) => {
        if (data.seo) {
          setSeoData(data.seo);
          if (data.audit) {
            setAuditReport(data.audit);
          } else {
            setAuditReport(runSeoAudit(data.seo, products, journalArticles));
          }
        }
      })
      .catch((err) => {
        console.warn('Fallback to local SEO state:', err);
        setAuditReport(runSeoAudit(seoData, products, journalArticles));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchSeoSettings();
  }, [authToken]);

  // Save changes to backend
  const handleSaveSeo = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/cms/seo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(seoData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save SEO configuration');
      }
      setSeoData(data.seo);
      if (data.audit) {
        setAuditReport(data.audit);
      } else {
        setAuditReport(runSeoAudit(data.seo, products, journalArticles));
      }
      setStatusMessage({ text: 'All SEO settings successfully updated and deployed!', type: 'success' });
      if (onRefreshSite) onRefreshSite();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Error saving SEO configuration', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  // Re-run instant audit
  const handleRunAudit = () => {
    const report = runSeoAudit(seoData, products, journalArticles);
    setAuditReport(report);
    setStatusMessage({ text: `SEO audit completed. Health Score: ${report.overallScore}/100 (${report.grade})`, type: 'success' });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Helper: character length indicator
  const getCharIndicator = (currentLen: number, min: number, max: number) => {
    if (currentLen === 0) {
      return { status: 'empty', color: 'text-stone-400', bg: 'bg-stone-100', label: 'Empty' };
    }
    if (currentLen >= min && currentLen <= max) {
      return { status: 'optimal', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300', label: 'Optimal' };
    }
    if (currentLen < min) {
      return { status: 'short', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-300', label: 'Too short' };
    }
    return { status: 'long', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-300', label: 'Too long' };
  };

  // Update Page SEO field
  const updatePageSeo = (field: keyof PageSeoConfig, value: any) => {
    setSeoData((prev) => {
      const page: PageSeoConfig = prev.pages[selectedPageId] || DEFAULT_PAGES_SEO[selectedPageId] || {
        pageId: selectedPageId,
        pageLabel: selectedPageId,
        title: '',
        description: '',
        focusKeyword: '',
        secondaryKeywords: [],
        slug: '',
        canonicalUrl: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        ogType: 'website',
        twitterCard: 'summary_large_image',
        metaRobots: 'index, follow',
        schemaType: 'Store',
        priority: 0.8,
        changefreq: 'weekly',
        lastModified: new Date().toISOString()
      };
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [selectedPageId]: {
            ...page,
            [field]: value,
            lastModified: new Date().toISOString()
          }
        }
      };
    });
  };

  // Update Product SEO field
  const updateProductSeo = (productId: string, field: keyof ProductSeoConfig, value: any) => {
    setSeoData((prev) => {
      const prod = prev.products[productId] || DEFAULT_PRODUCTS_SEO[productId] || {
        productId,
        title: '',
        description: '',
        focusKeyword: '',
        slug: productId,
        imageAlt: '',
        canonicalUrl: '',
        metaRobots: 'index, follow'
      };
      return {
        ...prev,
        products: {
          ...prev.products,
          [productId]: {
            ...prod,
            [field]: value
          }
        }
      };
    });
  };

  // Update Article SEO field
  const updateArticleSeo = (articleId: string, field: keyof ArticleSeoConfig, value: any) => {
    setSeoData((prev) => {
      const art = prev.articles[articleId] || DEFAULT_ARTICLES_SEO[articleId] || {
        articleId,
        title: '',
        description: '',
        focusKeyword: '',
        slug: articleId,
        imageAlt: '',
        canonicalUrl: '',
        metaRobots: 'index, follow'
      };
      return {
        ...prev,
        articles: {
          ...prev.articles,
          [articleId]: {
            ...art,
            [field]: value
          }
        }
      };
    });
  };

  // Update Category SEO field
  const updateCategorySeo = (categoryId: string, field: keyof CategorySeoConfig, value: any) => {
    setSeoData((prev) => {
      const cat = prev.categories[categoryId] || DEFAULT_CATEGORIES_SEO[categoryId] || {
        categoryId,
        categoryLabel: categoryId,
        title: '',
        description: '',
        focusKeyword: '',
        slug: categoryId,
        canonicalUrl: '',
        ogImage: '',
        metaRobots: 'index, follow',
        priority: 0.8,
        changefreq: 'weekly'
      };
      return {
        ...prev,
        categories: {
          ...prev.categories,
          [categoryId]: {
            ...cat,
            [field]: value
          }
        }
      };
    });
  };

  // Redirect handlers
  const handleAddRedirect = () => {
    if (!newRedirect.sourceUrl || !newRedirect.targetUrl) {
      alert('Please provide both Source URL and Target URL.');
      return;
    }
    const cleanSource = newRedirect.sourceUrl.trim().startsWith('/')
      ? newRedirect.sourceUrl.trim()
      : `/${newRedirect.sourceUrl.trim()}`;
    const redirectItem: SeoRedirect = {
      id: `redir-${Date.now()}`,
      sourceUrl: cleanSource,
      targetUrl: newRedirect.targetUrl.trim(),
      statusCode: Number(newRedirect.statusCode) === 302 ? 302 : 301,
      active: true,
      hitCount: 0,
      createdAt: new Date().toISOString(),
      note: newRedirect.note.trim()
    };

    setSeoData((prev) => ({
      ...prev,
      redirects: [redirectItem, ...prev.redirects]
    }));
    setIsAddRedirectOpen(false);
    setNewRedirect({ sourceUrl: '', targetUrl: '', statusCode: 301, note: '' });
    setStatusMessage({ text: `Redirect created: ${cleanSource} -> ${newRedirect.targetUrl}`, type: 'success' });
  };

  const handleDeleteRedirect = (id: string) => {
    setSeoData((prev) => ({
      ...prev,
      redirects: prev.redirects.filter((r) => r.id !== id)
    }));
    setStatusMessage({ text: 'Redirect rule removed.', type: 'success' });
  };

  const handleToggleRedirect = (id: string) => {
    setSeoData((prev) => ({
      ...prev,
      redirects: prev.redirects.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    }));
  };

  // Keyword density calculation
  const calcDensity = () => {
    if (!densityKeyword || !densityText) return 0;
    const kw = densityKeyword.toLowerCase().trim();
    const txt = densityText.toLowerCase();
    const words = txt.split(/\s+/).filter(Boolean);
    if (words.length === 0) return 0;
    const matches = (txt.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    return parseFloat(((matches / words.length) * 100).toFixed(1));
  };

  // Current page object
  const currentPage = seoData.pages[selectedPageId] || DEFAULT_PAGES_SEO[selectedPageId] || {
    pageId: selectedPageId,
    pageLabel: selectedPageId,
    title: '',
    description: '',
    focusKeyword: '',
    secondaryKeywords: [],
    slug: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    metaRobots: 'index, follow',
    schemaType: 'Store',
    priority: 0.8,
    changefreq: 'weekly',
    lastModified: new Date().toISOString()
  };

  // Filtered products list
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white border border-[#E8DEC8] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#991B1B]/10 text-[#991B1B] border border-[#991B1B]/20">
              <Globe className="w-5 h-5 text-[#991B1B]" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
                Search Engine Optimization Suite
                <span className="text-[10px] uppercase font-sans tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
                  Google Search Ready
                </span>
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Centralized metadata control, real-time audit engine, dynamic XML sitemap, robots directives & 301 redirects.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 border border-stone-200 text-xs font-semibold transition-colors"
            title="Inspect dynamic sitemap in XML format"
          >
            <Code className="w-3.5 h-3.5 text-[#9B782E]" />
            <span>XML Sitemap</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>

          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 border border-stone-200 text-xs font-semibold transition-colors"
            title="View live robots directives"
          >
            <FileText className="w-3.5 h-3.5 text-[#9B782E]" />
            <span>Robots.txt</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>

          <button
            type="button"
            onClick={handleRunAudit}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFF8EA] hover:bg-[#FDF2D5] text-[#8C6B1C] border border-[#E5C378] text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Run SEO Audit</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSeo}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#D4AF37]" />
            <span>{isSaving ? 'Deploying...' : 'Save & Publish SEO'}</span>
          </button>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-stone-400 hover:text-stone-700 cursor-pointer text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Executive SEO Health Score & Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Health Score */}
        <div className="bg-white border border-[#E8DEC8] rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-bold">SEO Health Score</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
              Grade {auditReport.grade}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-900">{auditReport.overallScore}%</span>
            <span className="text-xs text-stone-500">of 100</span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                auditReport.overallScore >= 90
                  ? 'bg-emerald-600'
                  : auditReport.overallScore >= 75
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${auditReport.overallScore}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            {auditReport.checksPassed} passed • {auditReport.warningsCount} warnings • {auditReport.errorsCount} critical
          </p>
        </div>

        {/* Metric 2: Tracked Keywords */}
        <div className="bg-white border border-[#E8DEC8] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-bold">Target Keywords</span>
            <Tag className="w-4 h-4 text-[#9B782E]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-900">18</span>
            <span className="text-xs text-stone-500">Commercial terms</span>
          </div>
          <p className="text-[11px] text-stone-600 mt-3 truncate">
            Top: brass urli, moradabad brassware, festive diyas
          </p>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700 font-semibold">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Title & description alignment 100%</span>
          </div>
        </div>

        {/* Metric 3: Indexed Sitemap URLs */}
        <div className="bg-white border border-[#E8DEC8] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-bold">Crawlable URLs</span>
            <Compass className="w-4 h-4 text-[#9B782E]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-900">
              {Object.keys(seoData.pages).length +
                Object.keys(seoData.categories).length +
                products.length +
                journalArticles.length}
            </span>
            <span className="text-xs text-stone-500">live URLs</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-3">
            {Object.keys(seoData.pages).length} pages • {products.length} products • {journalArticles.length} essays
          </p>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700 font-semibold">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Valid sitemap protocol 0.9</span>
          </div>
        </div>

        {/* Metric 4: Active Redirects */}
        <div className="bg-white border border-[#E8DEC8] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-bold">Active Redirects</span>
            <LinkIcon className="w-4 h-4 text-[#9B782E]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-900">
              {seoData.redirects.filter((r) => r.active).length}
            </span>
            <span className="text-xs text-stone-500">rules (301/302)</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-3">
            Total link equity preserved: {seoData.redirects.reduce((acc, r) => acc + (r.hitCount || 0), 0)} hits
          </p>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-stone-600">
            <span>Fast server-side HTTP dispatch</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white border border-[#E8DEC8] rounded-2xl p-1.5 shadow-sm flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSubTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'audit'
              ? 'bg-[#991B1B] text-white shadow-2xs font-bold'
              : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Audit & Health ({auditReport.overallScore}%)</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('pages')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'pages'
              ? 'bg-[#991B1B] text-white shadow-2xs font-bold'
              : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Page-by-Page SEO</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('products')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'products'
              ? 'bg-[#991B1B] text-white shadow-2xs font-bold'
              : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Product SEO & Alt Tags ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('articles')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'articles'
              ? 'bg-[#991B1B] text-white shadow-2xs font-bold'
              : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Journal Articles SEO ({journalArticles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('categories')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'categories'
              ? 'bg-[#991B1B] text-white shadow-2xs font-bold'
              : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Category SEO & Intro Content</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('redirects')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'redirects'
              ? 'bg-[#991B1B] text-white shadow-2xs font-bold'
              : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Redirects Manager ({seoData.redirects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('technical')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'technical'
              ? 'bg-[#991B1B] text-white shadow-2xs font-bold'
              : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Robots, Sitemap & Schema</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: AUDIT & HEALTH DASHBOARD */}
      {/* ========================================================================= */}
      {subTab === 'audit' && (
        <div className="space-y-6">
          {/* Audit Controls & Summary */}
          <div className="bg-white border border-[#E8DEC8] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">SEO Audit Checklist & Diagnostic Rules</h3>
                <p className="text-xs text-stone-600">
                  Real-time validation against Google Search Central guidelines, Core Web Vitals, and meta length standards.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setAuditFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    auditFilter === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All ({auditReport.items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilter('error')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    auditFilter === 'error'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  Critical Errors ({auditReport.errorsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilter('warning')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    auditFilter === 'warning'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  Warnings ({auditReport.warningsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilter('pass')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    auditFilter === 'pass'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  Passed ({auditReport.checksPassed})
                </button>
              </div>
            </div>

            {/* Audit Checklist Table */}
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
              {auditReport.items
                .filter((item) => (auditFilter === 'all' ? true : item.level === auditFilter))
                .map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                      item.level === 'error'
                        ? 'bg-rose-50/50 hover:bg-rose-50'
                        : item.level === 'warning'
                        ? 'bg-amber-50/40 hover:bg-amber-50'
                        : 'bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {item.level === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                        ) : item.level === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{item.rule}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 font-semibold uppercase">
                            {item.targetName}
                          </span>
                        </div>
                        <p className="text-stone-700 mt-0.5">{item.message}</p>
                        <p className="text-[11px] text-stone-500 italic mt-0.5">Tip: {item.recommendation}</p>
                      </div>
                    </div>

                    {item.targetType === 'page' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPageId(item.targetId);
                          setSubTab('pages');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#991B1B] hover:text-[#7F1D1D] hover:underline cursor-pointer shrink-0"
                      >
                        <span>Fix Page</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {item.targetType === 'product' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductId(item.targetId);
                          setSubTab('products');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#991B1B] hover:text-[#7F1D1D] hover:underline cursor-pointer shrink-0"
                      >
                        <span>Fix Product</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Real-Time Keyword Optimization & Density Tester */}
          <div className="bg-white border border-[#E8DEC8] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">Keyword Density & Optimization Tester</h3>
                <p className="text-xs text-stone-600">
                  Analyze body copy or product descriptions for keyword prominence without triggering Google keyword stuffing penalties.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-500 font-medium">Calculated Density:</span>
                <span
                  className={`ml-2 text-base font-bold font-serif ${
                    calcDensity() >= 1 && calcDensity() <= 3
                      ? 'text-emerald-700'
                      : calcDensity() > 3
                      ? 'text-rose-700'
                      : 'text-amber-700'
                  }`}
                >
                  {calcDensity()}%
                </span>
                <span className="text-[10px] text-stone-400 block">(Recommended: 1.0% - 2.5%)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Target Focus Keyword</label>
                <input
                  type="text"
                  value={densityKeyword}
                  onChange={(e) => setDensityKeyword(e.target.value)}
                  placeholder="e.g. brass urli"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#991B1B]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Content Text To Analyze</label>
                <textarea
                  rows={3}
                  value={densityText}
                  onChange={(e) => setDensityText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#991B1B]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: PAGE-BY-PAGE SEO EDITOR */}
      {/* ========================================================================= */}
      {subTab === 'pages' && (
        <div className="space-y-6">
          {/* Page Picker Selector Bar */}
          <div className="bg-white border border-[#E8DEC8] rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 overflow-x-auto">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0">Select Page:</span>
            <div className="flex items-center gap-2 overflow-x-auto">
              {Object.keys(DEFAULT_PAGES_SEO).map((pId) => {
                const p = seoData.pages[pId] || DEFAULT_PAGES_SEO[pId];
                return (
                  <button
                    key={pId}
                    type="button"
                    onClick={() => setSelectedPageId(pId)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedPageId === pId
                        ? 'bg-[#991B1B] text-white shadow-2xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {p.pageLabel || pId}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-white border border-[#E8DEC8] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-base font-serif font-bold text-stone-900">
                    Editing SEO for: {currentPage.pageLabel}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Live changes dynamically update document &lt;title&gt;, meta tags, and OpenGraph headers.
                  </p>
                </div>

                {/* 1. Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-800">
                      SEO Meta Title <span className="text-[#991B1B]">*</span>
                    </label>
                    {(() => {
                      const ind = getCharIndicator((currentPage.title || '').length, 30, 60);
                      return (
                        <span className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold ${ind.bg} ${ind.color}`}>
                          {(currentPage.title || '').length} / 60 chars ({ind.label})
                        </span>
                      );
                    })()}
                  </div>
                  <input
                    type="text"
                    value={currentPage.title || ''}
                    onChange={(e) => updatePageSeo('title', e.target.value)}
                    placeholder="Branded, descriptive title (30-60 characters)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#991B1B] font-medium"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Google displays the first 50–60 characters. Include primary keyword near the start.
                  </p>
                </div>

                {/* 2. Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-800">
                      Meta Description <span className="text-[#991B1B]">*</span>
                    </label>
                    {(() => {
                      const ind = getCharIndicator((currentPage.description || '').length, 120, 160);
                      return (
                        <span className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold ${ind.bg} ${ind.color}`}>
                          {(currentPage.description || '').length} / 160 chars ({ind.label})
                        </span>
                      );
                    })()}
                  </div>
                  <textarea
                    rows={3}
                    value={currentPage.description || ''}
                    onChange={(e) => updatePageSeo('description', e.target.value)}
                    placeholder="Compelling 1-2 sentence summary with call-to-action (120-160 characters)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#991B1B]"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Crucial for search snippet click-through rates. Make it inspiring and trustworthy.
                  </p>
                </div>

                {/* 3. Focus Keywords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">Primary Focus Keyword</label>
                    <input
                      type="text"
                      value={currentPage.focusKeyword || ''}
                      onChange={(e) => updatePageSeo('focusKeyword', e.target.value)}
                      placeholder="e.g. festive home decor brassware"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#991B1B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">Secondary Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={(currentPage.secondaryKeywords || []).join(', ')}
                      onChange={(e) =>
                        updatePageSeo(
                          'secondaryKeywords',
                          e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                        )
                      }
                      placeholder="brass urlis, moradabad gifts"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#991B1B]"
                    />
                  </div>
                </div>

                {/* 4. Slug & Canonical URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">URL Path Slug</label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-stone-100 border border-r-0 border-stone-300 rounded-l-xl text-stone-500 text-xs">
                        /
                      </span>
                      <input
                        type="text"
                        value={currentPage.slug || ''}
                        onChange={(e) => updatePageSeo('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                        placeholder="e.g. shop or about (empty for home)"
                        className="w-full px-3 py-2 rounded-r-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#991B1B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">Canonical URL Tag</label>
                    <input
                      type="text"
                      value={currentPage.canonicalUrl || ''}
                      onChange={(e) => updatePageSeo('canonicalUrl', e.target.value)}
                      placeholder="https://sajavat.atelier.com/..."
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#991B1B]"
                    />
                  </div>
                </div>

                {/* 5. Robots Directive & Structured Data Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">Search Engine Directives</label>
                    <select
                      value={currentPage.metaRobots || 'index, follow'}
                      onChange={(e) => updatePageSeo('metaRobots', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#991B1B] bg-white"
                    >
                      <option value="index, follow">index, follow (Allow all search engines)</option>
                      <option value="noindex, follow">noindex, follow (Hide page, follow links)</option>
                      <option value="noindex, nofollow">noindex, nofollow (Strictly private)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">Schema.org Structured Data Type</label>
                    <select
                      value={currentPage.schemaType || 'Store'}
                      onChange={(e) => updatePageSeo('schemaType', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#991B1B] bg-white"
                    >
                      <option value="Store">Store / LocalBusiness</option>
                      <option value="CollectionPage">CollectionPage (E-Commerce)</option>
                      <option value="AboutPage">AboutPage (Organization Story)</option>
                      <option value="Blog">Blog / Editorial Publication</option>
                      <option value="ContactPage">ContactPage (Concierge)</option>
                      <option value="FAQPage">FAQPage (Care Guide & Questions)</option>
                    </select>
                  </div>
                </div>

                {/* 6. Social Share OpenGraph Image */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Social Share Image (og:image)</label>
                  <input
                    type="text"
                    value={currentPage.ogImage || ''}
                    onChange={(e) => updatePageSeo('ogImage', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#991B1B]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live SERP & Social Previews */}
            <div className="lg:col-span-5 space-y-5">
              {/* Google SERP Preview Card */}
              <div className="bg-white border border-[#E8DEC8] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-[#991B1B]" />
                    <span className="text-xs font-bold text-stone-900">Google SERP Snippet Preview</span>
                  </div>

                  {/* Device toggle */}
                  <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setSerpDevice('desktop')}
                      className={`p-1 rounded-md transition-colors ${
                        serpDevice === 'desktop' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                      }`}
                      title="Desktop Search"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSerpDevice('mobile')}
                      className={`p-1 rounded-md transition-colors ${
                        serpDevice === 'mobile' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                      }`}
                      title="Mobile Search"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Simulated Google Search Result */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 font-sans space-y-1.5">
                  <div className="flex items-center gap-2 text-[12px] text-stone-600">
                    <div className="w-5 h-5 rounded-full bg-[#991B1B] text-[#D4AF37] flex items-center justify-center text-[10px] font-serif font-bold">
                      S
                    </div>
                    <div className="leading-tight">
                      <p className="font-semibold text-stone-800 text-[11px]">Sajavat Atelier</p>
                      <p className="text-[10px] text-stone-500 truncate">
                        https://sajavat.atelier.com {currentPage.slug ? `› ${currentPage.slug}` : ''}
                      </p>
                    </div>
                  </div>

                  <h4 className="text-base font-medium text-[#1A0DAB] hover:underline cursor-pointer leading-snug">
                    {currentPage.title || 'Page Title Placeholder — Sajavat'}
                  </h4>

                  <p className="text-xs text-[#4D5156] leading-relaxed line-clamp-2">
                    {currentPage.description ||
                      'Discover handcrafted brass urlis, festive diyas, scented soy candles & heirloom gifts. Decore For Every Celebration.'}
                  </p>
                </div>
              </div>

              {/* Social Share Card Preview */}
              <div className="bg-white border border-[#E8DEC8] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-1.5 border-b border-stone-100 pb-2.5">
                  <Share2 className="w-4 h-4 text-[#9B782E]" />
                  <span className="text-xs font-bold text-stone-900">Social Card Preview (X / WhatsApp / LinkedIn)</span>
                </div>

                <div className="rounded-xl border border-stone-200 overflow-hidden bg-stone-50">
                  <div className="aspect-video w-full bg-stone-200 relative overflow-hidden">
                    <img
                      src={currentPage.ogImage || DEFAULT_GLOBAL_SEO.defaultOgImage}
                      alt={currentPage.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_GLOBAL_SEO.defaultOgImage;
                      }}
                    />
                  </div>
                  <div className="p-3 bg-white border-t border-stone-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400">SAJAVAT.ATELIER.COM</span>
                    <h5 className="text-xs font-bold text-stone-900 line-clamp-1">{currentPage.title}</h5>
                    <p className="text-[11px] text-stone-600 line-clamp-2">{currentPage.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: PRODUCT SEO & IMAGE ALT MANAGER */}
      {/* ========================================================================= */}
      {subTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8DEC8] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">Product SEO & Google Image Alt Tags</h3>
                <p className="text-xs text-stone-600">
                  Optimize product titles, meta descriptions, image search alt attributes, and Schema.org rich snippets for products.
                </p>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by title/SKU..."
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#991B1B]"
                />
              </div>
            </div>

            {/* Products Table with Quick SEO Fields */}
            <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
              {filteredProducts.map((prod) => {
                const prodSeo = seoData.products[prod.id] || DEFAULT_PRODUCTS_SEO[prod.id] || {
                  productId: prod.id,
                  title: `${prod.name} | Sajavat`,
                  description: prod.description.slice(0, 155),
                  focusKeyword: prod.name.toLowerCase(),
                  slug: prod.id,
                  imageAlt: `Handcrafted ${prod.name} in Moradabad brass`,
                  canonicalUrl: `https://sajavat.atelier.com/products/${prod.id}`,
                  metaRobots: 'index, follow'
                };

                const isSelected = selectedProductId === prod.id;

                return (
                  <div key={prod.id} className="p-4 bg-white hover:bg-stone-50/70 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Product identity */}
                      <div className="flex items-center gap-3 shrink-0">
                        <img
                          src={prod.images.main}
                          alt={prodSeo.imageAlt || prod.name}
                          className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-stone-900">{prod.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-mono">
                              {prod.sku}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            ₹{prod.price.toLocaleString('en-IN')} • {prod.categoryLabel}
                          </p>
                        </div>
                      </div>

                      {/* Quick Meta Stats */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                            prodSeo.title.length >= 25 && prodSeo.title.length <= 65
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          Title: {prodSeo.title.length} chars
                        </span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                            prodSeo.imageAlt?.length >= 15
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          Alt: {prodSeo.imageAlt?.length >= 15 ? 'Descriptive' : 'Needs attention'}
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedProductId(isSelected ? '' : prod.id)}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-[#991B1B] text-white hover:bg-[#7F1D1D] transition-colors cursor-pointer"
                        >
                          {isSelected ? 'Close Details' : 'Edit SEO & Alt Text'}
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Edit Panel */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50/70 p-4 rounded-xl border border-stone-200">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Product Meta Title ({prodSeo.title.length} chars)
                          </label>
                          <input
                            type="text"
                            value={prodSeo.title}
                            onChange={(e) => updateProductSeo(prod.id, 'title', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">Target Focus Keyword</label>
                          <input
                            type="text"
                            value={prodSeo.focusKeyword}
                            onChange={(e) => updateProductSeo(prod.id, 'focusKeyword', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Primary Image Alt Tag (Google Images)
                          </label>
                          <input
                            type="text"
                            value={prodSeo.imageAlt}
                            onChange={(e) => updateProductSeo(prod.id, 'imageAlt', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
                          />
                          <p className="text-[10px] text-stone-500 mt-0.5">
                            Describe materials, motif (e.g. peacock, lotus), and origin for visual search rankings.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">Product URL Slug</label>
                          <input
                            type="text"
                            value={prodSeo.slug}
                            onChange={(e) => updateProductSeo(prod.id, 'slug', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Meta Description ({prodSeo.description.length} chars)
                          </label>
                          <textarea
                            rows={2}
                            value={prodSeo.description}
                            onChange={(e) => updateProductSeo(prod.id, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: JOURNAL & BLOG ARTICLES SEO */}
      {/* ========================================================================= */}
      {subTab === 'articles' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8DEC8] rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">Editorial Journal Articles SEO</h3>
              <p className="text-xs text-stone-600">
                Configure Article / BlogPosting structured data, meta descriptions, and Google Discover preview tags.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {journalArticles.map((art) => {
                const artSeo = seoData.articles[art.id] || DEFAULT_ARTICLES_SEO[art.id] || {
                  articleId: art.id,
                  title: `${art.title} | Sajavat Journal`,
                  description: art.leadExcerpt,
                  focusKeyword: art.title.toLowerCase().slice(0, 25),
                  slug: art.slug,
                  imageAlt: art.imageAlt,
                  canonicalUrl: `https://sajavat.atelier.com/journal/${art.slug}`,
                  metaRobots: 'index, follow'
                };

                const isSelected = selectedArticleId === art.id;

                return (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticleId(art.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#991B1B] bg-[#FFF8EA]/30 shadow-xs ring-1 ring-[#991B1B]'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <img src={art.image} alt={art.imageAlt} className="w-full h-28 object-cover rounded-lg mb-2" />
                    <span className="text-[10px] font-bold text-[#9B782E] uppercase">{art.categoryLabel}</span>
                    <h4 className="text-xs font-bold text-stone-900 line-clamp-2 mt-1">{art.title}</h4>
                    <p className="text-[11px] text-stone-500 mt-1">Author: {art.author}</p>
                  </div>
                );
              })}
            </div>

            {/* Active Article Editor */}
            {(() => {
              const activeArt = journalArticles.find((a) => a.id === selectedArticleId);
              if (!activeArt) return null;
              const artSeo = seoData.articles[activeArt.id] || DEFAULT_ARTICLES_SEO[activeArt.id] || {
                articleId: activeArt.id,
                title: `${activeArt.title} | Sajavat Journal`,
                description: activeArt.leadExcerpt,
                focusKeyword: '',
                slug: activeArt.slug,
                imageAlt: activeArt.imageAlt,
                canonicalUrl: `https://sajavat.atelier.com/journal/${activeArt.slug}`,
                metaRobots: 'index, follow'
              };

              return (
                <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-4 mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Editing Essay SEO: {activeArt.title}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Meta Title ({artSeo.title.length} chars)
                      </label>
                      <input
                        type="text"
                        value={artSeo.title}
                        onChange={(e) => updateArticleSeo(activeArt.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Focus Keyword</label>
                      <input
                        type="text"
                        value={artSeo.focusKeyword}
                        onChange={(e) => updateArticleSeo(activeArt.id, 'focusKeyword', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Featured Image Alt Text</label>
                      <input
                        type="text"
                        value={artSeo.imageAlt}
                        onChange={(e) => updateArticleSeo(activeArt.id, 'imageAlt', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">URL Article Slug</label>
                      <input
                        type="text"
                        value={artSeo.slug}
                        onChange={(e) => updateArticleSeo(activeArt.id, 'slug', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Meta Description ({artSeo.description.length} chars)
                      </label>
                      <textarea
                        rows={2}
                        value={artSeo.description}
                        onChange={(e) => updateArticleSeo(activeArt.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: CATEGORY SEO & INTRO CONTENT */}
      {/* ========================================================================= */}
      {subTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8DEC8] rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">Category SEO & On-Page Intro Content</h3>
              <p className="text-xs text-stone-600">
                Optimize category landing pages to capture broad commercial search terms like "brass diyas" and "luxury gift hampers".
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {Object.keys(DEFAULT_CATEGORIES_SEO).map((cId) => {
                const cat = seoData.categories[cId] || DEFAULT_CATEGORIES_SEO[cId];
                return (
                  <button
                    key={cId}
                    type="button"
                    onClick={() => setSelectedCategoryId(cId)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategoryId === cId
                        ? 'bg-[#991B1B] text-white shadow-2xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {cat.categoryLabel}
                  </button>
                );
              })}
            </div>

            {(() => {
              const cat = seoData.categories[selectedCategoryId] || DEFAULT_CATEGORIES_SEO[selectedCategoryId];
              if (!cat) return null;

              return (
                <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Category Meta Title ({cat.title.length} chars)
                      </label>
                      <input
                        type="text"
                        value={cat.title}
                        onChange={(e) => updateCategorySeo(selectedCategoryId, 'title', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Focus Keyword</label>
                      <input
                        type="text"
                        value={cat.focusKeyword}
                        onChange={(e) => updateCategorySeo(selectedCategoryId, 'focusKeyword', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">H1 Heading Override</label>
                      <input
                        type="text"
                        value={cat.h1Override || ''}
                        onChange={(e) => updateCategorySeo(selectedCategoryId, 'h1Override', e.target.value)}
                        placeholder="e.g. Handcrafted Brass Diyas & Candle Holders"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Category Slug</label>
                      <input
                        type="text"
                        value={cat.slug}
                        onChange={(e) => updateCategorySeo(selectedCategoryId, 'slug', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Meta Description ({cat.description.length} chars)
                      </label>
                      <textarea
                        rows={2}
                        value={cat.description}
                        onChange={(e) => updateCategorySeo(selectedCategoryId, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        SEO Intro Description (Displayed at top of category page)
                      </label>
                      <textarea
                        rows={2}
                        value={cat.seoContentIntro || ''}
                        onChange={(e) => updateCategorySeo(selectedCategoryId, 'seoContentIntro', e.target.value)}
                        placeholder="Rich keyword-optimized introductory paragraphs..."
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 6: REDIRECTS MANAGER (301 & 302) */}
      {/* ========================================================================= */}
      {subTab === 'redirects' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8DEC8] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">301 & 302 Redirect Rules Engine</h3>
                <p className="text-xs text-stone-600">
                  Manage permanent (301) and temporary (302) URL redirects. Prevents 404 errors and preserves backlinks.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddRedirectOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Add Redirect Rule</span>
              </button>
            </div>

            {/* Add Redirect Modal */}
            {isAddRedirectOpen && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">New Redirect Rule</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Source Path (Old URL)</label>
                    <input
                      type="text"
                      value={newRedirect.sourceUrl}
                      onChange={(e) => setNewRedirect({ ...newRedirect, sourceUrl: e.target.value })}
                      placeholder="/old-urli-page"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Target Destination (New URL)</label>
                    <input
                      type="text"
                      value={newRedirect.targetUrl}
                      onChange={(e) => setNewRedirect({ ...newRedirect, targetUrl: e.target.value })}
                      placeholder="/shop?category=home-accents"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Status Code</label>
                    <select
                      value={newRedirect.statusCode}
                      onChange={(e) => setNewRedirect({ ...newRedirect, statusCode: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                    >
                      <option value={301}>301 Permanent (Passes 99% SEO juice)</option>
                      <option value={302}>302 Temporary (Marketing / Seasonal)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Reason / Campaign Note</label>
                  <input
                    type="text"
                    value={newRedirect.note}
                    onChange={(e) => setNewRedirect({ ...newRedirect, note: e.target.value })}
                    placeholder="e.g. Pamphlet QR code printed in 2025"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                  />
                </div>

                <div className="flex items-center gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddRedirectOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddRedirect}
                    className="px-3 py-1.5 rounded-lg bg-[#991B1B] text-white text-xs font-bold cursor-pointer"
                  >
                    Save Rule
                  </button>
                </div>
              </div>
            )}

            {/* Redirects Table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
              {seoData.redirects.map((r) => (
                <div key={r.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white hover:bg-stone-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                        {r.sourceUrl}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-mono text-[#991B1B] font-semibold">{r.targetUrl}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          r.statusCode === 301 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        HTTP {r.statusCode}
                      </span>
                    </div>
                    {r.note && <p className="text-[11px] text-stone-500 mt-1 italic">Note: {r.note}</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-stone-500 font-medium">Hits: {r.hitCount || 0}</span>

                    <button
                      type="button"
                      onClick={() => handleToggleRedirect(r.id)}
                      className={`text-[10px] px-2 py-1 rounded font-bold cursor-pointer ${
                        r.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {r.active ? 'Active' : 'Paused'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRedirect(r.id)}
                      className="p-1.5 rounded text-stone-400 hover:text-rose-600 cursor-pointer"
                      title="Delete redirect"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 7: TECHNICAL SEO, ROBOTS.TXT, SITEMAP & SCHEMA */}
      {/* ========================================================================= */}
      {subTab === 'technical' && (
        <div className="space-y-6">
          {/* Robots.txt Directives Editor */}
          <div className="bg-white border border-[#E8DEC8] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">Robots.txt Directives Configuration</h3>
                <p className="text-xs text-stone-600">
                  Instruct search crawlers on what to index and what to disallow (e.g. /cms, /admin, /api).
                </p>
              </div>

              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#991B1B] hover:underline flex items-center gap-1"
              >
                <span>Live /robots.txt</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <textarea
                rows={8}
                value={seoData.robots.customRobotsTxt}
                onChange={(e) =>
                  setSeoData({
                    ...seoData,
                    robots: { ...seoData.robots, customRobotsTxt: e.target.value }
                  })
                }
                className="w-full font-mono text-xs px-3.5 py-3 rounded-xl border border-stone-300 bg-stone-900 text-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic XML Sitemap Configuration */}
          <div className="bg-white border border-[#E8DEC8] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">XML Sitemap Generator & Exclusions</h3>
                <p className="text-xs text-stone-600">
                  Configure entities included in automated sitemap pinging and change frequency directives.
                </p>
              </div>

              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#991B1B] hover:underline flex items-center gap-1"
              >
                <span>Live /sitemap.xml</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seoData.sitemap.includeStaticPages}
                  onChange={(e) =>
                    setSeoData({
                      ...seoData,
                      sitemap: { ...seoData.sitemap, includeStaticPages: e.target.checked }
                    })
                  }
                  className="rounded text-[#991B1B]"
                />
                <span className="text-xs font-bold text-stone-800">Static Pages (Home, About, etc.)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seoData.sitemap.includeCategories}
                  onChange={(e) =>
                    setSeoData({
                      ...seoData,
                      sitemap: { ...seoData.sitemap, includeCategories: e.target.checked }
                    })
                  }
                  className="rounded text-[#991B1B]"
                />
                <span className="text-xs font-bold text-stone-800">Categories (6 Collections)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seoData.sitemap.includeProducts}
                  onChange={(e) =>
                    setSeoData({
                      ...seoData,
                      sitemap: { ...seoData.sitemap, includeProducts: e.target.checked }
                    })
                  }
                  className="rounded text-[#991B1B]"
                />
                <span className="text-xs font-bold text-stone-800">Products ({products.length} Items)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seoData.sitemap.includeArticles}
                  onChange={(e) =>
                    setSeoData({
                      ...seoData,
                      sitemap: { ...seoData.sitemap, includeArticles: e.target.checked }
                    })
                  }
                  className="rounded text-[#991B1B]"
                />
                <span className="text-xs font-bold text-stone-800">Journal Articles ({journalArticles.length} Essays)</span>
              </label>
            </div>
          </div>

          {/* Schema.org Structured Data Inspector */}
          <div className="bg-white border border-[#E8DEC8] rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">Schema.org JSON-LD Structured Data Inspector</h3>
              <p className="text-xs text-stone-600">
                Verified structured data generated dynamically for Google rich snippets (Organization, WebSite, Product, Article, FAQPage).
              </p>
            </div>

            <pre className="font-mono text-[11px] p-4 bg-stone-900 text-amber-200 rounded-xl overflow-x-auto max-h-64 border border-stone-800">
              {JSON.stringify(
                {
                  '@context': 'https://schema.org',
                  '@graph': [
                    {
                      '@type': 'WebSite',
                      name: seoData.global.siteName,
                      url: 'https://sajavat.atelier.com',
                      potentialAction: {
                        '@type': 'SearchAction',
                        target: 'https://sajavat.atelier.com/shop?search={search_term_string}'
                      }
                    },
                    {
                      '@type': 'Organization',
                      name: seoData.global.organizationSchema.name,
                      legalName: seoData.global.organizationSchema.legalName,
                      url: seoData.global.organizationSchema.url,
                      logo: seoData.global.organizationSchema.logo,
                      contactPoint: {
                        telephone: seoData.global.organizationSchema.contactPhone,
                        contactType: 'customer service'
                      }
                    }
                  ]
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
