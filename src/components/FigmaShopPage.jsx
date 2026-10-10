import React, { useEffect, useState, useMemo } from 'react';
import { rtdb, ref, onValue } from '../firebase';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { INITIAL_CATEGORIES } from '../data/categoriesData';
import ImageWithSpinner from './ImageWithSpinner';


import { 
  imgHome, 
  imgShoppingBag, 
  imgUser, 
  imgSearchIcon, 
  imgShoppingCart 
} from '../assets/svgIcons';

const DEFAULT_LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de";
const imgAccountButton = imgUser;
const imgShoppingBagButton = imgShoppingBag;

export default function FigmaShopPage({
  cartCount = 0,
  onSelectProduct,
  onOpenCart,
  onOpenAuth,
  onNavigateHome,
  selectedCategoryFilter = null,
  onClearCategoryFilter
}) {
  const [headerLogo, setHeaderLogo] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_site_images');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.jersifyLogoHeader && !String(parsed.jersifyLogoHeader).startsWith('/figma/')) {
          return parsed.jersifyLogoHeader;
        }
      }
      return DEFAULT_LOGO_URL;
    } catch (e) {
      return DEFAULT_LOGO_URL;
    }
  });

  const [shopJerseys, setShopJerseys] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_products');
      return cached ? JSON.parse(cached) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [categoriesList, setCategoriesList] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_categories');
      return cached ? JSON.parse(cached) : INITIAL_CATEGORIES;
    } catch (e) {
      return INITIAL_CATEGORIES;
    }
  });

  const [shoppingPageOrder, setShoppingPageOrder] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_shopping_page_order');
      return cached ? JSON.parse(cached) : { fan: [], player: [], retro: [] };
    } catch (e) {
      return { fan: [], player: [], retro: [] };
    }
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('fan');

  useEffect(() => {
    const unsubProds = onValue(ref(rtdb, 'products'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const items = Object.keys(val).map(k => ({ id: k, ...val[k] }));
        if (items.length > 0) {
          setShopJerseys(items);
          sessionStorage.setItem('jersify_products', JSON.stringify(items));
        }
      }
    }, () => {});

    const unsubImages = onValue(ref(rtdb, 'siteConfig/images'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const headerUrl = val.jersifyLogoHeader?.url || (typeof val.jersifyLogoHeader === 'string' ? val.jersifyLogoHeader : null);
        if (headerUrl && !headerUrl.startsWith('/figma/')) {
          setHeaderLogo(headerUrl);
        }
      }
    }, () => {});

    const unsubCategories = onValue(ref(rtdb, 'categories'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const list = Object.keys(val).map(k => {
          const cat = { id: k, ...val[k] };
          if (cat.imageUrl && cat.imageUrl.startsWith('/figma/')) {
            cat.imageUrl = "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de";
          }
          return cat;
        });
        if (list.length > 0) {
          setCategoriesList(list);
          sessionStorage.setItem('jersify_categories', JSON.stringify(list));
        }
      }
    }, () => {});

    const unsubShoppingOrder = onValue(ref(rtdb, 'siteConfig/shoppingPageOrder'), (snap) => {
      if (snap.exists() && snap.val()) {
        const val = snap.val();
        const formatted = {
          fan: Array.isArray(val.fan) ? val.fan : [],
          player: Array.isArray(val.player) ? val.player : [],
          retro: Array.isArray(val.retro) ? val.retro : []
        };
        setShoppingPageOrder(formatted);
        sessionStorage.setItem('jersify_shopping_page_order', JSON.stringify(formatted));
      }
    }, () => {});

    return () => {
      unsubProds();
      unsubImages();
      unsubCategories();
      unsubShoppingOrder();
    };
  }, []);

  const isRetroProduct = (item) => {
    if (!item) return false;
    const tag = (item.categoryTag || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    const type = (item.type || '').toLowerCase();
    const badge = (item.badge || '').toLowerCase();
    return (
      tag === 'retro' ||
      cat === 'retro' ||
      name.includes('retro') ||
      type.includes('retro') ||
      badge.includes('retro')
    );
  };

  const isPlayerProduct = (item) => {
    if (!item) return false;
    if (item.playerVersion === true) return true;
    const ver = (item.version || '').toLowerCase();
    const type = (item.type || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    return (
      ver === 'player' ||
      type.includes('player') ||
      type.includes('player issue') ||
      type.includes('player version') ||
      name.includes('player issue') ||
      name.includes('player version') ||
      name.includes('player')
    );
  };

  const isFanProduct = (item) => {
    if (!item) return false;
    if (isRetroProduct(item) || isPlayerProduct(item)) return false;
    return true;
  };

  const activeCustomCategory = useMemo(() => {
    if (!selectedCategoryFilter) return null;
    if (typeof selectedCategoryFilter === 'object') {
      const found = categoriesList.find(c => c.id === selectedCategoryFilter.id || c.name.toLowerCase() === selectedCategoryFilter.name?.toLowerCase());
      return found || selectedCategoryFilter;
    }
    const target = String(selectedCategoryFilter).toLowerCase();
    const found = categoriesList.find(c => c.id?.toLowerCase() === target || c.name?.toLowerCase() === target);
    if (found) return found;
    return { name: selectedCategoryFilter, productIds: [] };
  }, [selectedCategoryFilter, categoriesList]);

  const filteredJerseys = React.useMemo(() => {
    // 0. Custom Category filter (from admin categories)
    let list = shopJerseys.filter((item) => {
      if (activeCustomCategory) {
        const assignedIds = Array.isArray(activeCustomCategory.productIds) ? activeCustomCategory.productIds : [];
        const catName = (activeCustomCategory.name || '').toLowerCase();
        const isAssigned = assignedIds.includes(item.id);
        const isNameMatch = (item.category && item.category.toLowerCase() === catName) ||
                            (item.categoryTag && item.categoryTag.toLowerCase() === catName);
        if (!isAssigned && !isNameMatch) return false;
      }

      // 1. Category version filter
      if (selectedCategory === 'fan' && !isFanProduct(item)) return false;
      if (selectedCategory === 'player' && !isPlayerProduct(item)) return false;
      if (selectedCategory === 'retro' && !isRetroProduct(item)) return false;
      return true;
    });

    // 2. Custom category sequence defined by Admin in User Shopping Page
    const activeCategoryKey = selectedCategory || 'fan';
    const activeOrder = shoppingPageOrder?.[activeCategoryKey];

    if (Array.isArray(activeOrder) && activeOrder.length > 0) {
      list = [...list].sort((a, b) => {
        const idxA = activeOrder.indexOf(String(a.id));
        const idxB = activeOrder.indexOf(String(b.id));

        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
    }

    // 3. Search query filter
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((item) =>
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.type && item.type.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.team && item.team.toLowerCase().includes(q))
    );
  }, [shopJerseys, selectedCategory, shoppingPageOrder, searchQuery]);

  return (
    <div style={{ width: '100%', maxWidth: '393px', margin: '0 auto', background: '#FFFFFF', position: 'relative', overflowX: 'clip', minHeight: '1604px', paddingBottom: '60px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      {/* Sticky/Fixed Navigation Header on Scroll: Logo, Search & Cart */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#FFFFFF',
        width: '100%',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Store Navigation Header */}
        <div style={{ borderBottom: '1px solid #E5E7EB', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 19px' }}>
          <div style={{ width: '128px', height: '47px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={onNavigateHome}>
            <ImageWithSpinner src={headerLogo} alt="Jersify" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <button 
              onClick={() => setIsSearchOpen(prev => !prev)} 
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              title="Search"
            >
              <img src={imgSearchIcon} alt="Search" style={{ width: '20px', height: '20px' }} />
            </button>
            <button 
              onClick={onOpenCart} 
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              title="Shopping Bag"
            >
              <img src={imgShoppingBagButton} alt="Bag" style={{ width: '20px', height: '20px' }} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-8px',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: 800,
                  borderRadius: '9999px',
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #FFFFFF'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Input Bar */}
        {isSearchOpen && (
          <div style={{ borderBottom: '1px solid #E5E7EB', padding: '10px 19px', background: '#F9FAFB', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <img src={imgSearchIcon} alt="Search" style={{ position: 'absolute', left: '12px', width: '16px', height: '16px', opacity: 0.4 }} />
              <input
                type="text"
                placeholder="Search jerseys, teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 32px 8px 36px',
                  fontSize: '13px',
                  fontFamily: 'Karla, sans-serif',
                  borderRadius: '9999px',
                  border: '1px solid #D1D5DB',
                  outline: 'none',
                  background: '#FFFFFF',
                  color: '#111111'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#9CA3AF', padding: '2px 4px' }}
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
              style={{ background: 'none', border: 'none', fontSize: '13px', fontFamily: 'Karla, sans-serif', fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Full-Width Filter Bar replacing Shop heading: Fan | Player (Premium) | Retro */}
      <div style={{ width: '100%', display: 'flex', borderBottom: '1px solid #E5E7EB', background: '#FFFFFF' }}>
        {/* Fan Filter Option */}
        <button
          type="button"
          onClick={() => setSelectedCategory(prev => prev === 'fan' ? null : 'fan')}
          style={{
            flex: 1,
            height: '52px',
            border: 'none',
            borderRight: '1px solid #E5E7EB',
            background: selectedCategory === 'fan' ? '#111111' : '#FFFFFF',
            color: selectedCategory === 'fan' ? '#FFFFFF' : '#111111',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            transition: 'all 0.2s ease',
            boxShadow: selectedCategory === 'fan' ? 'inset 0 -3px 0 #111111' : 'none'
          }}
        >
          <span style={{
            fontFamily: 'Karla, sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            Fan
          </span>
          <span style={{
            fontSize: '9px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: selectedCategory === 'fan' ? '#D1D5DB' : '#9CA3AF',
            textTransform: 'uppercase',
            marginTop: '1px'
          }}>
            Standard
          </span>
        </button>

        {/* Player Filter Option (Premium Aesthetic) */}
        <button
          type="button"
          onClick={() => setSelectedCategory(prev => prev === 'player' ? null : 'player')}
          style={{
            flex: 1,
            height: '52px',
            border: 'none',
            borderLeft: selectedCategory === 'player' ? '1px solid #D4AF37' : '1px solid #E5D5AA',
            borderRight: selectedCategory === 'player' ? '1px solid #D4AF37' : '1px solid #E5D5AA',
            background: selectedCategory === 'player'
              ? 'linear-gradient(135deg, #18181B 0%, #09090B 100%)'
              : '#FDFCF7',
            color: selectedCategory === 'player' ? '#D4AF37' : '#111111',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            position: 'relative',
            transition: 'all 0.2s ease',
            boxShadow: selectedCategory === 'player'
              ? 'inset 0 -3px 0 #D4AF37, 0 4px 12px rgba(212, 175, 55, 0.2)'
              : 'inset 0 0 0 1px rgba(212, 175, 55, 0.15)'
          }}
        >
          <span style={{
            fontFamily: 'Karla, sans-serif',
            fontWeight: 800,
            fontSize: '14px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: selectedCategory === 'player' ? '#D4AF37' : '#111111'
          }}>
            Player
          </span>
          <span style={{
            fontSize: '9px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: selectedCategory === 'player' ? '#D4AF37' : '#B48C36',
            textTransform: 'uppercase',
            marginTop: '1px'
          }}>
            Authentic
          </span>
        </button>

        {/* Retro Filter Option */}
        <button
          type="button"
          onClick={() => setSelectedCategory(prev => prev === 'retro' ? null : 'retro')}
          style={{
            flex: 1,
            height: '52px',
            border: 'none',
            borderLeft: '1px solid #E5E7EB',
            background: selectedCategory === 'retro' ? '#111111' : '#FFFFFF',
            color: selectedCategory === 'retro' ? '#FFFFFF' : '#111111',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            transition: 'all 0.2s ease',
            boxShadow: selectedCategory === 'retro' ? 'inset 0 -3px 0 #111111' : 'none'
          }}
        >
          <span style={{
            fontFamily: 'Karla, sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            Retro
          </span>
          <span style={{
            fontSize: '9px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: selectedCategory === 'retro' ? '#D1D5DB' : '#9CA3AF',
            textTransform: 'uppercase',
            marginTop: '1px'
          }}>
            Classic
          </span>
        </button>
      </div>

      {/* Active Custom Category Banner (when redirected from homepage or filter) */}
      {activeCustomCategory && (
        <div style={{
          background: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB',
          padding: '10px 19px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: '#6B7280', flexShrink: 0 }}>
              CATEGORY:
            </span>
            <span style={{ fontFamily: 'Josefin Sans, sans-serif', fontSize: '17px', fontWeight: 700, color: '#111111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeCustomCategory.name}
            </span>
            <span style={{
              background: '#111111',
              color: '#FFFFFF',
              fontSize: '10px',
              padding: '1px 7px',
              borderRadius: '9999px',
              fontWeight: 700,
              flexShrink: 0
            }}>
              {filteredJerseys.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onClearCategoryFilter) onClearCategoryFilter();
            }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '3px',
              cursor: 'pointer',
              color: '#374151',
              flexShrink: 0
            }}
          >
            ✕ View All
          </button>
        </div>
      )}

      {/* Filter status row when version (fan/player/retro) is selected */}
      {selectedCategory && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 19px 0', fontSize: '12px' }}>
          <span style={{ color: '#6B7280', fontFamily: 'Karla, sans-serif', textTransform: 'capitalize' }}>
            Showing {selectedCategory} jerseys ({filteredJerseys.length})
          </span>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#111111',
              fontWeight: 600,
              textDecoration: 'underline',
              cursor: 'pointer',
              fontFamily: 'Karla, sans-serif',
              fontSize: '12px'
            }}
          >
            Show All
          </button>
        </div>
      )}

      {/* Product Listing Grid */}
      <div style={{ padding: '19px' }}>
        {filteredJerseys.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {filteredJerseys.map((item, idx) => (
              <div 
                key={item.id}
                data-product-card="true"
                onClick={() => onSelectProduct(item)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ width: '100%', aspectRatio: '3/4', background: '#F3F2EF', borderRadius: '2px', overflow: 'hidden' }}>
                  <ImageWithSpinner
                    src={item.imgUrl}
                    alt={item.name}
                    loading={idx < 4 ? "eager" : "lazy"}
                    fetchPriority={idx < 2 ? "high" : "auto"}
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <h4 style={{ fontFamily: 'Karla', fontWeight: 600, fontSize: '13px', color: '#111111', lineHeight: '17px' }}>
                    {item.name}
                  </h4>
                  <p style={{ fontFamily: 'Karla', fontSize: '11px', color: '#737373', margin: '2px 0' }}>
                    {item.type}
                  </p>
                  <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', color: '#111111' }}>
                    ₹{item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
            <p style={{ fontFamily: 'Karla', fontSize: '15px', fontWeight: 600, color: '#111111', marginBottom: '8px' }}>
              No jerseys found
            </p>
            <p style={{ fontFamily: 'Karla', fontSize: '13px', marginBottom: '16px' }}>
              {activeCustomCategory
                ? `No products in category "${activeCustomCategory.name}" matched your current filter.`
                : searchQuery
                ? `No products matched "${searchQuery}".`
                : 'No products found.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ padding: '8px 16px', background: '#FFFFFF', border: '1px solid #D1D5DB', color: '#111111', borderRadius: '4px', fontSize: '12px', fontFamily: 'Karla', cursor: 'pointer', fontWeight: 600 }}
                >
                  Clear Search
                </button>
              )}
              {activeCustomCategory && (
                <button
                  onClick={onClearCategoryFilter}
                  style={{ padding: '8px 16px', background: '#111111', color: '#FFFFFF', border: 'none', borderRadius: '4px', fontSize: '12px', fontFamily: 'Karla', cursor: 'pointer', fontWeight: 600 }}
                >
                  View All Products
                </button>
              )}
            </div>
          </div>
        )}

        {/* Catalog Completion Footer Note */}
        <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '28px' }}>
          <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#737373', marginBottom: '20px' }}>
            You’ve seen all {filteredJerseys.length} jerseys
          </p>
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', fontSize: '12px', color: '#111111' }}>
            Size guide   ·   Shipping & returns   ·   Help
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '393px', height: '56px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 50 }}>
        <button onClick={onNavigateHome} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <img src={imgHome} alt="Home" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Home</span>
        </button>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <img src={imgShoppingBag} alt="Shop" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', fontWeight: 500, color: '#111827' }}>Shop</span>
        </button>
        <button onClick={onOpenCart} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', background: 'none', border: 'none' }}>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <img src={imgShoppingCart} alt="Bag" style={{ width: '20px', height: '20px' }} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-8px',
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 800,
                borderRadius: '9999px',
                minWidth: '16px',
                height: '16px',
                padding: '0 3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #FFFFFF'
              }}>
                {cartCount}
              </span>
            )}
          </div>
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Bag</span>
        </button>
        <button onClick={onOpenAuth} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <img src={imgUser} alt="Profile" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Profile</span>
        </button>
      </div>
    </div>
  );
}
