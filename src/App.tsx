import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { Product, JournalArticle, Order, SiteSettings } from './types';
import { INITIAL_PRODUCTS, INITIAL_JOURNAL_ARTICLES } from './data/mockData';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { OrderLookupModal } from './components/OrderLookupModal';
import { Toast } from './components/Toast';
import { SeoHead } from './components/SeoHead';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { JournalPage } from './pages/JournalPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CmsPage } from './pages/CmsPage';


function AppContent() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [journalArticles, setJournalArticles] = useState<JournalArticle[]>(INITIAL_JOURNAL_ARTICLES);
  const [currentView, setCurrentView] = useState<string>('home');
  const [contactTab, setContactTab] = useState<'form' | 'care' | 'shipping' | 'returns' | 'faqs'>('form');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product>(INITIAL_PRODUCTS[0]);
  const [selectedArticle, setSelectedArticle] = useState<JournalArticle>(INITIAL_JOURNAL_ARTICLES[0]);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | undefined>(undefined);

  // Fetch site settings
  const refreshSettings = () => {
    fetch('/api/settings')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load settings');
      })
      .then((data) => {
        if (data.settings) {
          setSiteSettings(data.settings);
        }
      })
      .catch((err) => {
        console.warn('Using client default site settings:', err);
      });
  };

  // Fetch live products & journal articles from Express backend
  const refreshProducts = () => {
    refreshSettings();
    fetch('/api/products')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load products');
      })
      .then((data) => {
        const productList = Array.isArray(data) ? data : data?.products;
        if (Array.isArray(productList) && productList.length > 0) {
          setProducts(productList);
          setSelectedProduct((prev) => productList.find((p: Product) => p.id === prev.id) || productList[0]);
        }
      })
      .catch((err) => {
        console.warn('Using client-side products catalogue fallback:', err);
      });
  };

  useEffect(() => {
    refreshProducts();
    refreshSettings();

    fetch('/api/journal')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load journal articles');
      })
      .then((data) => {
        const articleList = Array.isArray(data) ? data : data?.articles;
        if (Array.isArray(articleList) && articleList.length > 0) {
          setJournalArticles(articleList);
          setSelectedArticle(articleList[0]);
        }
      })
      .catch((err) => {
        console.warn('Using client-side journal fallback:', err);
      });

    // Hash and URL based semantic routing
    const checkHashAndRoute = () => {
      const rawHash = window.location.hash || '';
      const h = rawHash.toLowerCase();
      const p = window.location.pathname.toLowerCase();

      // Separate / hidden login for backend admin & CMS portal
      if (
        h === '#admin' ||
        h === '#cms' ||
        h === '#/admin' ||
        h === '#/cms' ||
        h === '#login' ||
        h === '#/login' ||
        h === '#portal' ||
        h === '#/portal' ||
        p === '/admin' ||
        p === '/cms' ||
        p === '/login'
      ) {
        setCurrentView('cms');
        return;
      }

      if (h.startsWith('#/products/') || h.startsWith('#/product/')) {
        const slugOrId = rawHash.replace(/^#\/(products|product)\//, '').split('?')[0];
        const match = products.find(
          (p) => p.id.toLowerCase() === slugOrId.toLowerCase() || p.sku.toLowerCase() === slugOrId.toLowerCase()
        );
        if (match) {
          setSelectedProduct(match);
          setCurrentView('product-detail');
          return;
        }
      }

      if (h.startsWith('#/journal/')) {
        const slug = rawHash.replace(/^#\/journal\//, '').split('?')[0];
        const match = journalArticles.find(
          (a) => a.slug.toLowerCase() === slug.toLowerCase() || a.id.toLowerCase() === slug.toLowerCase()
        );
        if (match) {
          setSelectedArticle(match);
          setCurrentView('journal');
          return;
        } else {
          setSelectedArticle(undefined);
          setCurrentView('journal');
          return;
        }
      }

      if (h === '#/journal' || h === '#journal') {
        setSelectedArticle(undefined);
        setCurrentView('journal');
        return;
      }

      if (h.startsWith('#/shop')) {
        const urlParams = new URLSearchParams(rawHash.split('?')[1] || '');
        const cat = urlParams.get('category');
        if (cat) {
          setSelectedCategory(cat);
        }
        setCurrentView('shop');
        return;
      }

      if (h === '#/about' || h === '#about') {
        setCurrentView('about');
        return;
      }

      if (h === '#/contact' || h === '#contact') {
        setContactTab('form');
        setCurrentView('contact');
        return;
      }

      if (h === '#/care-guide' || h === '#care-guide') {
        setContactTab('care');
        setCurrentView('contact');
        return;
      }
    };

    // Discreet shortcut for store administrators: Ctrl+Shift+A or Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        window.location.hash = '#admin';
        setCurrentView('cms');
      }
    };

    checkHashAndRoute();
    window.addEventListener('hashchange', checkHashAndRoute);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkHashAndRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [products, journalArticles]);

  // View navigation helper that ensures top scroll and seamless routing
  const navigateToView = (view: string) => {
    if (view === 'cms' || view === 'admin') {
      setCurrentView('cms');
      window.location.hash = '#admin';
    } else {
      if (
        window.location.hash === '#cms' ||
        window.location.hash === '#admin' ||
        window.location.hash === '#/admin' ||
        window.location.hash === '#/cms' ||
        window.location.hash === '#login' ||
        window.location.hash === '#/login'
      ) {
        history.replaceState(null, '', window.location.pathname);
      }
      if (currentView === 'cms') {
        refreshProducts();
      }

      if (view === 'contact' || view === 'customer-care') {
        setContactTab('form');
        setCurrentView('contact');
        window.location.hash = '#/contact';
      } else if (view === 'care-guide') {
        setContactTab('care');
        setCurrentView('contact');
        window.location.hash = '#/care-guide';
      } else if (view === 'shipping-guide') {
        setContactTab('shipping');
        setCurrentView('contact');
      } else if (view === 'returns-policy' || view === 'returns') {
        setContactTab('returns');
        setCurrentView('contact');
      } else if (view === 'faqs') {
        setContactTab('faqs');
        setCurrentView('contact');
      } else if (view === 'our-story') {
        setCurrentView('about');
        window.location.hash = '#/about';
      } else if (view === 'about') {
        setCurrentView('about');
        window.location.hash = '#/about';
      } else if (view === 'shop') {
        setCurrentView('shop');
        window.location.hash = '#/shop';
      } else if (view === 'journal') {
        setSelectedArticle(undefined);
        setCurrentView('journal');
        window.location.hash = '#/journal';
      } else if (view === 'home') {
        setCurrentView('home');
        if (window.location.hash) {
          history.replaceState(null, '', window.location.pathname);
        }
      } else {
        setCurrentView(view);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.location.hash = `#/products/${product.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (article: JournalArticle | undefined) => {
    setSelectedArticle(article);
    setCurrentView('journal');
    if (article) {
      window.location.hash = `#/journal/${article.slug}`;
    } else {
      window.location.hash = '#/journal';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentView('shop');
    window.location.hash = `#/shop?category=${category}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    navigateToView('order-confirmation');
  };

  const handleViewOrderDetails = (order: Order) => {
    setConfirmedOrder(order);
    navigateToView('order-confirmation');
  };

  // Dedicated Full-Page CMS Portal View
  if (currentView === 'cms' || currentView === 'admin') {
    return (
      <div className="min-h-screen bg-[#FBF9F5]">
        <SeoHead currentView={currentView} siteSettings={siteSettings} />
        <CmsPage
          setCurrentView={navigateToView}
          onSelectProduct={handleSelectProduct}
        />
        <Toast />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#332927]">
      {/* Real-Time Dynamic SEO Head (Title, Meta Description, Canonical, OG, Twitter, Schema) */}
      <SeoHead
        currentView={currentView}
        selectedProduct={selectedProduct}
        selectedArticle={selectedArticle}
        selectedCategory={selectedCategory}
        siteSettings={siteSettings}
      />

      {/* Global Navigation Header */}
      <Header
        currentView={currentView}
        setCurrentView={navigateToView}
        onSelectCategory={handleSelectCategory}
        siteSettings={siteSettings}
      />


      {/* Main Page View Switching */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <HomePage
            products={products}
            journalArticles={journalArticles}
            setCurrentView={navigateToView}
            onSelectProduct={handleSelectProduct}
            onSelectArticle={handleSelectArticle}
            onSelectCategory={handleSelectCategory}
            siteSettings={siteSettings}
          />
        )}

        {currentView === 'shop' && (
          <ShopPage
            products={products}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSelectProduct={handleSelectProduct}
            setCurrentView={navigateToView}
          />
        )}

        {currentView === 'product-detail' && (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={products}
            onSelectProduct={handleSelectProduct}
            setCurrentView={navigateToView}
            journalArticles={journalArticles}
            onSelectArticle={handleSelectArticle}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            allProducts={products}
            onOrderSuccess={handleOrderSuccess}
            setCurrentView={navigateToView}
          />
        )}

        {currentView === 'order-confirmation' && (
          confirmedOrder ? (
            <OrderConfirmationPage
              order={confirmedOrder}
              setCurrentView={navigateToView}
              onSelectCategory={handleSelectCategory}
            />
          ) : (
            <ShopPage
              products={products}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onSelectProduct={handleSelectProduct}
              setCurrentView={navigateToView}
            />
          )
        )}

        {currentView === 'journal' && (
          <JournalPage
            articles={journalArticles}
            selectedArticle={selectedArticle}
            onSelectArticle={handleSelectArticle}
            products={products}
            onSelectProduct={handleSelectProduct}
            setCurrentView={navigateToView}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            setCurrentView={navigateToView}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {(currentView === 'contact' || currentView === 'customer-care') && (
          <ContactPage
            setCurrentView={navigateToView}
            onSelectCategory={handleSelectCategory}
            initialTab={contactTab}
          />
        )}
      </main>

      {/* Global Wine Burgundy Footer */}
      <Footer
        setCurrentView={navigateToView}
        onSelectCategory={handleSelectCategory}
      />

      {/* Global Drawers & Modals */}
      <CartDrawer setCurrentView={navigateToView} />
      <WishlistDrawer products={products} onSelectProduct={handleSelectProduct} />
      <SearchModal
        products={products}
        journalArticles={journalArticles}
        onSelectProduct={handleSelectProduct}
        onSelectArticle={handleSelectArticle}
      />
      <OrderLookupModal onViewOrderDetails={handleViewOrderDetails} />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
