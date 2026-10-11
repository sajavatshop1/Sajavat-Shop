import React, { useEffect, useState } from 'react';
import { Product, JournalArticle, SiteSettings, FullSeoData } from '../types';
import {
  DEFAULT_GLOBAL_SEO,
  DEFAULT_PAGES_SEO,
  DEFAULT_CATEGORIES_SEO,
  DEFAULT_PRODUCTS_SEO,
  DEFAULT_ARTICLES_SEO,
  INITIAL_FULL_SEO_DATA
} from '../data/seoDefaults';

interface SeoHeadProps {
  currentView: string;
  selectedProduct?: Product;
  selectedArticle?: JournalArticle;
  selectedCategory?: string;
  siteSettings?: SiteSettings;
  seoDataOverride?: FullSeoData;
}

export function SeoHead({
  currentView,
  selectedProduct,
  selectedArticle,
  selectedCategory = 'all',
  siteSettings,
  seoDataOverride
}: SeoHeadProps) {
  const [seoConfig, setSeoConfig] = useState<FullSeoData>(seoDataOverride || INITIAL_FULL_SEO_DATA);

  // Fetch live SEO config from Express backend
  useEffect(() => {
    if (seoDataOverride) {
      setSeoConfig(seoDataOverride);
      return;
    }

    fetch('/api/seo')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load SEO configuration');
      })
      .then((data) => {
        if (data.seo) {
          setSeoConfig((prev) => ({
            ...prev,
            ...data.seo
          }));
        }
      })
      .catch((err) => {
        console.warn('Using client fallback SEO presets:', err);
      });
  }, [seoDataOverride]);

  // Compute live meta attributes depending on current active view
  useEffect(() => {
    const global = seoConfig.global || DEFAULT_GLOBAL_SEO;
    const pages = seoConfig.pages || DEFAULT_PAGES_SEO;
    const categories = seoConfig.categories || DEFAULT_CATEGORIES_SEO;
    const productsSeo = seoConfig.products || DEFAULT_PRODUCTS_SEO;
    const articlesSeo = seoConfig.articles || DEFAULT_ARTICLES_SEO;

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sajavat.atelier.com';
    let title = global.defaultTitle;
    let description = global.defaultDescription;
    let canonicalUrl = `${origin}/`;
    let ogImage = global.defaultOgImage;
    let ogType = 'website';
    let metaRobots = 'index, follow';
    let focusKeywords = 'festive home decor, brass urli, moradabad brassware, luxury indian gifts';
    let schemaGraph: any[] = [];

    // Base Website & Store schemas
    const websiteSchema = {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: origin,
      name: global.siteName,
      description: global.defaultDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${origin}/shop?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    };

    const organizationSchema = {
      '@type': 'Organization',
      '@id': `${origin}/#organization`,
      name: global.organizationSchema.name,
      legalName: global.organizationSchema.legalName,
      url: origin,
      logo: {
        '@type': 'ImageObject',
        url: global.organizationSchema.logo.startsWith('http')
          ? global.organizationSchema.logo
          : `${origin}${global.organizationSchema.logo}`
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: global.organizationSchema.contactPhone,
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi']
      },
      sameAs: global.organizationSchema.sameAs
    };

    // Breadcrumb schema builder
    const breadcrumbItems = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` }];

    if (currentView === 'home') {
      const homePage = pages.home || DEFAULT_PAGES_SEO.home;
      title = homePage.title;
      description = homePage.description;
      focusKeywords = [homePage.focusKeyword, ...(homePage.secondaryKeywords || [])].join(', ');
      canonicalUrl = homePage.canonicalUrl || `${origin}/`;
      ogImage = homePage.ogImage || global.defaultOgImage;
      metaRobots = homePage.metaRobots || 'index, follow';
    } else if (currentView === 'shop') {
      const isFiltered = selectedCategory && selectedCategory !== 'all' && categories[selectedCategory];
      if (isFiltered) {
        const cat = categories[selectedCategory];
        title = cat.title;
        description = cat.description;
        focusKeywords = cat.focusKeyword;
        canonicalUrl = cat.canonicalUrl || `${origin}/shop?category=${cat.slug}`;
        ogImage = cat.ogImage || global.defaultOgImage;
        metaRobots = cat.metaRobots || 'index, follow';
        breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: 'Shop', item: `${origin}/shop` });
        breadcrumbItems.push({ '@type': 'ListItem', position: 3, name: cat.categoryLabel, item: canonicalUrl });
      } else {
        const shopPage = pages.shop || DEFAULT_PAGES_SEO.shop;
        title = shopPage.title;
        description = shopPage.description;
        focusKeywords = [shopPage.focusKeyword, ...(shopPage.secondaryKeywords || [])].join(', ');
        canonicalUrl = shopPage.canonicalUrl || `${origin}/shop`;
        ogImage = shopPage.ogImage || global.defaultOgImage;
        metaRobots = shopPage.metaRobots || 'index, follow';
        breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: 'Shop Catalogue', item: canonicalUrl });
      }
    } else if (currentView === 'product-detail' && selectedProduct) {
      const prodSeo = productsSeo[selectedProduct.id];
      const prodTitle = prodSeo?.title || `${selectedProduct.name} — Handcrafted Brassware | Sajavat`;
      const prodDesc = prodSeo?.description || selectedProduct.description;
      const prodSlug = prodSeo?.slug || selectedProduct.id;

      title = prodTitle;
      description = prodDesc.length > 160 ? `${prodDesc.slice(0, 157)}...` : prodDesc;
      focusKeywords = `${prodSeo?.focusKeyword || selectedProduct.name}, brass decor, moradabad craft, festive gift`;
      canonicalUrl = prodSeo?.canonicalUrl || `${origin}/products/${prodSlug}`;
      ogImage = selectedProduct.images.main || global.defaultOgImage;
      ogType = 'product';
      metaRobots = prodSeo?.metaRobots || 'index, follow';

      breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: 'Shop', item: `${origin}/shop` });
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 3,
        name: selectedProduct.categoryLabel,
        item: `${origin}/shop?category=${selectedProduct.category}`
      });
      breadcrumbItems.push({ '@type': 'ListItem', position: 4, name: selectedProduct.name, item: canonicalUrl });

      // Schema.org Product item
      const productSchema = {
        '@type': 'Product',
        name: selectedProduct.name,
        image: [
          selectedProduct.images.main,
          selectedProduct.images.lifestyle,
          selectedProduct.images.waterView
        ].filter(Boolean),
        description: selectedProduct.description,
        sku: selectedProduct.sku,
        mpn: selectedProduct.sku,
        brand: {
          '@type': 'Brand',
          name: global.siteName
        },
        material: selectedProduct.material,
        offers: {
          '@type': 'Offer',
          url: canonicalUrl,
          priceCurrency: 'INR',
          price: selectedProduct.price,
          priceValidUntil: '2027-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability:
            selectedProduct.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: global.siteName
          }
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: selectedProduct.rating,
          reviewCount: selectedProduct.reviewsCount || 1,
          bestRating: '5',
          worstRating: '1'
        }
      };
      schemaGraph.push(productSchema);
    } else if (currentView === 'journal') {
      const artSeo = selectedArticle ? articlesSeo[selectedArticle.id] : null;
      if (selectedArticle) {
        title = artSeo?.title || `${selectedArticle.title} | Sajavat Journal`;
        description = artSeo?.description || selectedArticle.leadExcerpt;
        focusKeywords = artSeo?.focusKeyword
          ? `${artSeo.focusKeyword}, ${selectedArticle.tags?.join(', ') || ''}`
          : `${selectedArticle.tags?.join(', ') || 'festive decor tips, brass urli styling, moradabad craft, sajavat journal'}`;
        canonicalUrl = artSeo?.canonicalUrl || `${origin}/journal/${selectedArticle.slug}`;
        ogImage = selectedArticle.image || global.defaultOgImage;
        ogType = 'article';
        metaRobots = artSeo?.metaRobots || 'index, follow';

        breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: 'The Journal', item: `${origin}/journal` });
        breadcrumbItems.push({ '@type': 'ListItem', position: 3, name: selectedArticle.title, item: canonicalUrl });

        // Schema.org BlogPosting / Article
        const articleSchema: any = {
          '@type': 'BlogPosting',
          headline: selectedArticle.title,
          name: selectedArticle.title,
          image: [selectedArticle.image],
          datePublished: selectedArticle.publishedIsoDate || '2026-10-01T08:00:00+05:30',
          dateModified: selectedArticle.modifiedIsoDate || new Date().toISOString(),
          inLanguage: 'en-IN',
          author: {
            '@type': 'Person',
            name: selectedArticle.author,
            jobTitle: selectedArticle.authorTitle,
            description: selectedArticle.authorBio
          },
          publisher: organizationSchema,
          description: selectedArticle.leadExcerpt,
          articleSection: selectedArticle.categoryLabel,
          keywords: focusKeywords,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl
          }
        };

        if (selectedArticle.content && selectedArticle.content.length > 0) {
          articleSchema.articleBody = selectedArticle.content.join(' ');
        }
        schemaGraph.push(articleSchema);

        // Schema.org FAQPage for Google Rich Snippets if the article has FAQs
        if (selectedArticle.faqs && selectedArticle.faqs.length > 0) {
          const faqSchema = {
            '@type': 'FAQPage',
            mainEntity: selectedArticle.faqs.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
              }
            }))
          };
          schemaGraph.push(faqSchema);
        }
      } else {
        const journalPage = pages.journal || DEFAULT_PAGES_SEO.journal;
        title = journalPage.title || 'The Sajavat Journal — Festive Styling, Ritual Care & Artisan Notes';
        description = journalPage.description || 'Curated essays on brass urli decoration, Vastu placement, heirloom cleaning, and festive entertaining.';
        focusKeywords = [journalPage.focusKeyword, ...(journalPage.secondaryKeywords || [])].filter(Boolean).join(', ');
        canonicalUrl = journalPage.canonicalUrl || `${origin}/journal`;
        ogImage = journalPage.ogImage || global.defaultOgImage;
        metaRobots = journalPage.metaRobots || 'index, follow';
        breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: 'The Journal', item: canonicalUrl });

        const blogSchema = {
          '@type': 'Blog',
          name: 'The Sajavat Journal',
          description: description,
          url: canonicalUrl,
          publisher: organizationSchema
        };
        schemaGraph.push(blogSchema);
      }
    } else if (currentView === 'about') {
      const aboutPage = pages.about || DEFAULT_PAGES_SEO.about;
      title = aboutPage.title;
      description = aboutPage.description;
      focusKeywords = [aboutPage.focusKeyword, ...(aboutPage.secondaryKeywords || [])].join(', ');
      canonicalUrl = aboutPage.canonicalUrl || `${origin}/about`;
      ogImage = aboutPage.ogImage || global.defaultOgImage;
      metaRobots = aboutPage.metaRobots || 'index, follow';
      breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: 'Our Heritage', item: canonicalUrl });
    } else if (currentView === 'contact') {
      const contactPage = pages.contact || DEFAULT_PAGES_SEO.contact;
      title = contactPage.title;
      description = contactPage.description;
      focusKeywords = [contactPage.focusKeyword, ...(contactPage.secondaryKeywords || [])].join(', ');
      canonicalUrl = contactPage.canonicalUrl || `${origin}/contact`;
      ogImage = contactPage.ogImage || global.defaultOgImage;
      metaRobots = contactPage.metaRobots || 'index, follow';
      breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: 'Concierge Care', item: canonicalUrl });
    } else if (currentView === 'care-guide') {
      const carePage = pages['care-guide'] || DEFAULT_PAGES_SEO['care-guide'];
      title = carePage.title;
      description = carePage.description;
      focusKeywords = [carePage.focusKeyword, ...(carePage.secondaryKeywords || [])].join(', ');
      canonicalUrl = carePage.canonicalUrl || `${origin}/care-guide`;
      ogImage = carePage.ogImage || global.defaultOgImage;
      metaRobots = carePage.metaRobots || 'index, follow';
      breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: 'Brass Ritual Care', item: canonicalUrl });

      // FAQPage schema for Care Guide
      const faqSchema = {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I clean and restore oxidized brass urlis and diyas?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Rinse with tepid water and apply a paste of tamarind pulp with fine salt or Pitambari powder. Gently buff with a soft microfiber cloth and rinse with plain water. Pat completely dry.'
            }
          },
          {
            '@type': 'Question',
            name: 'Can I leave water inside a brass urli continuously?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, but for optimal brass luster and to prevent hard mineral ring build-up, refresh the water every 2 to 3 days and wipe the rim dry.'
            }
          },
          {
            '@type': 'Question',
            name: 'Why does genuine Moradabad brass develop a natural patina?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Virgin bell-metal brass breathes naturally and oxidizes gracefully when exposed to atmospheric moisture, deepening in antique character and imperial warmth.'
            }
          }
        ]
      };
      schemaGraph.push(faqSchema);
    } else if (currentView === 'cms' || currentView === 'admin') {
      title = 'Sajavat Atelier CMS — Live Curatorial, Inventory & SEO Suite';
      description = 'Administrative portal for managing products, editorial journal, orders, fulfillment, and SEO optimization.';
      metaRobots = 'noindex, nofollow';
      canonicalUrl = `${origin}/#cms`;
    }

    // Assemble complete schema graph
    const breadcrumbSchema = {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems
    };

    schemaGraph.unshift(breadcrumbSchema);
    schemaGraph.unshift(organizationSchema);
    schemaGraph.unshift(websiteSchema);

    // 1. Update Document Title
    document.title = title;

    // Helper to safely set meta tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Search Meta
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', focusKeywords);
    setMetaTag('name', 'robots', metaRobots);

    // 3. Canonical Tag
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

    // 4. OpenGraph Social Cards
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', global.siteName);

    // Article Specific OpenGraph Metadata
    if (ogType === 'article' && selectedArticle) {
      setMetaTag('property', 'article:published_time', selectedArticle.publishedIsoDate || '2026-10-01T08:00:00+05:30');
      setMetaTag('property', 'article:author', selectedArticle.author);
      setMetaTag('property', 'article:section', selectedArticle.categoryLabel);
      if (selectedArticle.tags && selectedArticle.tags.length > 0) {
        setMetaTag('property', 'article:tag', selectedArticle.tags[0].replace(/^#/, ''));
      }
    }

    // 5. Twitter / X Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);
    setMetaTag('name', 'twitter:site', global.twitterHandle || '@sajavatatelier');

    // 6. Search Engine Verification
    if (global.googleSiteVerification) {
      setMetaTag('name', 'google-site-verification', global.googleSiteVerification);
    }
    if (global.bingSiteVerification) {
      setMetaTag('name', 'msvalidate.01', global.bingSiteVerification);
    }

    // 7. Inject JSON-LD Schema
    let scriptTag = document.getElementById('sajavat-seo-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'sajavat-seo-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': schemaGraph
    });
  }, [currentView, selectedProduct, selectedArticle, selectedCategory, seoConfig, siteSettings]);

  return null; // Head-only reactive controller
}
