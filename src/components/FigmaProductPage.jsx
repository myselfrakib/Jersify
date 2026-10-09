import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import ImageWithSpinner from './ImageWithSpinner';
import { rtdb, ref, onValue } from '../firebase';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

import { 
  imgHome, 
  imgShoppingBag, 
  imgUser, 
  imgShoppingCart 
} from '../assets/svgIcons';

const imgSlide1 = "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de";
const DEFAULT_LOGO_URL = imgSlide1;

export default function FigmaProductPage({ 
  product, 
  allProducts = [],
  cartItems = [],
  cartCount = 0,
  onBack, 
  onAddToCart,
  onUpdateQty,
  onSelectProduct,
  onOpenCart,
  onOpenAuth,
  onNavigateHome
}) {
  const currentProduct = product || {
    id: "figma-detail-1",
    name: "ARGENTINA HOME 26/27 | FAN VERSION",
    price: 650,
    type: "Fan version",
    team: "Argentina",
    rating: 4.4,
    description: "Embroidered logos, lightweight breathable fabric and a comfortable fit. Made for match days and everyday wear, with quality stitching for regular use.",
    imgUrl: imgSlide1
  };

  const productImages = Array.isArray(currentProduct.images) && currentProduct.images.length > 0
    ? currentProduct.images
    : [currentProduct.imgUrl || imgSlide1];

  const [headerLogo, setHeaderLogo] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_site_images');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.jersifyLogoHeader) return parsed.jersifyLogoHeader;
      }
    } catch (e) {}
    return DEFAULT_LOGO_URL;
  });

  const [internalProducts, setInternalProducts] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_products');
      return cached ? JSON.parse(cached) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  useEffect(() => {
    const unsubImages = onValue(ref(rtdb, 'siteConfig/images'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        if (val.jersifyLogoHeader?.url) {
          setHeaderLogo(val.jersifyLogoHeader.url);
        }
      }
    }, () => {});

    const unsubProds = onValue(ref(rtdb, 'products'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const items = Object.keys(val).map(k => ({ id: k, ...val[k] }));
        if (items.length > 0) {
          setInternalProducts(items);
        }
      }
    }, () => {});

    return () => {
      unsubImages();
      unsubProds();
    };
  }, []);

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Touch Swipe State
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 40) {
      // Swipe Left -> Next Image
      setActiveSlide((prev) => (prev + 1) % productImages.length);
    } else if (distance < -40) {
      // Swipe Right -> Prev Image
      setActiveSlide((prev) => (prev - 1 + productImages.length) % productImages.length);
    }
    setTouchStartX(0);
    setTouchEndX(0);
  };

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  // Helper to remove category / version suffix from recommendation product names
  const formatCleanTitle = (title) => {
    if (!title) return '';
    let clean = title;
    if (clean.includes('|')) {
      clean = clean.split('|')[0];
    }
    return clean
      .replace(/\s*[-–—]\s*(fan version|player version|player issue|fan edition|retro|this season|hot picks|kit).*/gi, '')
      .replace(/\s*\((fan version|player version|player issue|fan edition|retro|this season|hot picks|kit).*?\)/gi, '')
      .replace(/\s*\[(fan version|player version|player issue|fan edition|retro|this season|hot picks|kit).*?\]/gi, '')
      .replace(/\s+(fan version|player version|player issue|fan edition|retro|this season|hot picks)\s*$/gi, '')
      .trim();
  };

  const productsListToUse = (Array.isArray(allProducts) && allProducts.length > 0) ? allProducts : internalProducts;

  // Determine category key for any product
  const getCategoryKey = (item) => {
    if (!item) return '';
    if (item.categoryTag) return item.categoryTag.toLowerCase().trim();
    if (item.category) return item.category.toLowerCase().trim();
    const nameLower = (item.name || '').toLowerCase();
    const typeLower = (item.type || '').toLowerCase();
    if (nameLower.includes('retro') || typeLower.includes('retro')) return 'retro';
    if (nameLower.includes('hot pick') || nameLower.includes('hot picks')) return 'hot picks';
    if (nameLower.includes('this season')) return 'this season';
    if (item.teamType) return item.teamType.toLowerCase().trim();
    return 'kit';
  };

  // Filter recommendations by current product category
  const recProducts = useMemo(() => {
    if (!Array.isArray(productsListToUse) || productsListToUse.length <= 1) {
      return [
        {
          id: "rec-1",
          name: "BARCELONA HOME 26/27",
          price: 750,
          type: "Fan version · S–XXL",
          imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de"
        },
        {
          id: "rec-2",
          name: "REAL MADRID HOME 24/25",
          price: 750,
          type: "Player Issue · S–XXL",
          imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1779627815641_0_675C45F9-A02E-4936-8088-13695728CA76.png?alt=media&token=0dcaea32-29d4-4ad7-9df3-9e894ea604fe"
        }
      ];
    }

    const currentCat = getCategoryKey(currentProduct);

    // 1. Strict category match
    const exactCategoryMatches = productsListToUse.filter((p) => {
      if (String(p.id) === String(currentProduct.id)) return false;
      return getCategoryKey(p) === currentCat;
    });

    // 2. Secondary match (matching teamType, team, or version/type)
    const secondaryMatches = productsListToUse.filter((p) => {
      if (String(p.id) === String(currentProduct.id)) return false;
      if (exactCategoryMatches.some((m) => String(m.id) === String(p.id))) return false;
      if (currentProduct.teamType && p.teamType && currentProduct.teamType.toLowerCase() === p.teamType.toLowerCase()) return true;
      if (currentProduct.team && p.team && currentProduct.team.toLowerCase() === p.team.toLowerCase()) return true;
      if (currentProduct.version && p.version && currentProduct.version.toLowerCase() === p.version.toLowerCase()) return true;
      return false;
    });

    // 3. Fallback remaining products
    const otherProducts = productsListToUse.filter((p) => {
      if (String(p.id) === String(currentProduct.id)) return false;
      if (exactCategoryMatches.some((m) => String(m.id) === String(p.id))) return false;
      if (secondaryMatches.some((m) => String(m.id) === String(p.id))) return false;
      return true;
    });

    const combined = [...exactCategoryMatches, ...secondaryMatches, ...otherProducts];
    return combined.slice(0, 2);
  }, [productsListToUse, currentProduct]);

  const cartIndex = Array.isArray(cartItems)
    ? cartItems.findIndex(item => String(item.id) === String(currentProduct.id) && item.selectedSize === selectedSize)
    : -1;
  const existingInCart = cartIndex > -1 ? cartItems[cartIndex] : null;

  const handleAdd = () => {
    onAddToCart({
      ...currentProduct,
      selectedSize,
      quantity: 1
    });
  };

  return (
    <div style={{ width: '100%', maxWidth: '393px', margin: '0 auto', background: '#FFFFFF', position: 'relative', overflowX: 'hidden', minHeight: '1600px', paddingBottom: '60px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      {/* Top Header Logo & Back Action */}
      <div style={{ position: 'absolute', top: '24px', left: '19px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 20 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={16} />
          </button>
        )}
        <div style={{ width: '128px', height: '47px', cursor: 'pointer' }} onClick={onNavigateHome}>
          <ImageWithSpinner src={headerLogo} alt="Jersify" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Slidable Hero Product Carousel */}
      <div 
        style={{ position: 'relative', top: '70px', width: '393px', height: '568px', background: '#F3F2EF', overflow: 'hidden' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{
          display: 'flex',
          width: `${productImages.length * 393}px`,
          height: '100%',
          transform: `translateX(-${activeSlide * 393}px)`,
          transition: 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)'
        }}>
          {productImages.map((imgUrl, idx) => (
            <div key={idx} style={{ width: '393px', height: '100%', flexShrink: 0 }}>
              <ImageWithSpinner src={imgUrl} alt={`${currentProduct.name} ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>

        {/* Previous Image Arrow */}
        {productImages.length > 1 && (
          <button
            onClick={() => setActiveSlide((prev) => (prev - 1 + productImages.length) % productImages.length)}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.85)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            aria-label="Previous Image"
          >
            <ChevronLeft size={20} color="#111111" />
          </button>
        )}

        {/* Next Image Arrow */}
        {productImages.length > 1 && (
          <button
            onClick={() => setActiveSlide((prev) => (prev + 1) % productImages.length)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.85)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            aria-label="Next Image"
          >
            <ChevronRight size={20} color="#111111" />
          </button>
        )}

        {/* Slide Indicator Dots */}
        {productImages.length > 1 && (
          <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
            {productImages.map((_, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveSlide(idx)}
                style={{
                  width: activeSlide === idx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: activeSlide === idx ? '#000000' : 'rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Information Container */}
      <div style={{ padding: '19px', paddingTop: '80px' }}>
        {/* Gallery Thumbnails Strip */}
        {productImages.length > 1 && (
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '4px' }}>
            {productImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveSlide(idx)}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: activeSlide === idx ? '2px solid #111111' : '1px solid #E5E7EB',
                  opacity: activeSlide === idx ? 1 : 0.6,
                  flexShrink: 0
                }}
              >
                <ImageWithSpinner src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 style={{ fontFamily: 'Karla', fontWeight: 400, fontSize: '18px', color: '#000000', lineHeight: 'normal', marginBottom: '12px' }}>
          {currentProduct.name}
        </h1>

        {/* Price & Rating */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontFamily: 'Karla', fontWeight: 400, fontSize: '26px', color: '#000000' }}>
            ₹{currentProduct.price}
          </span>
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '13px', color: '#262626', background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px' }}>
            ★ {currentProduct.rating || 4.4}
          </span>
        </div>
        <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#989191', marginBottom: '24px' }}>
          MRP inclusive of all taxes
        </p>

        {/* Size Selection (Figma 8:68 Exact Specification) */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'Karla', fontSize: '14px', color: '#1F1F1F' }}>Select your size</span>
            <span 
              onClick={() => setIsSizeGuideOpen(true)}
              style={{ fontFamily: 'Karla', fontSize: '12px', color: '#000000', textDecoration: 'underline', cursor: 'pointer' }}
            >
              SIZE GUIDE
            </span>
          </div>

          <div style={{ display: 'flex', width: '211.3px', height: '46px', border: '0.72px solid #000000', overflow: 'hidden' }}>
            {sizes.map((sz, i) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize(sz)}
                style={{
                  width: '42.26px',
                  height: '46px',
                  background: selectedSize === sz ? '#000000' : '#FFFFFF',
                  color: selectedSize === sz ? '#FFFFFF' : '#000000',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: selectedSize === sz ? 600 : 400,
                  border: 'none',
                  borderRight: i < sizes.length - 1 ? '0.72px solid #000000' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  transition: 'background 0.15s ease, color 0.15s ease'
                }}
              >
                {sz}
              </button>
            ))}
          </div>
          <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#1F1F1F', marginTop: '8px' }}>
            Check the size guide before choosing your fit.
          </p>
        </div>

        {/* Add to Bag Button OR Sleek Black Plus/Minus Quantity Controller */}
        {existingInCart && existingInCart.quantity > 0 ? (
          <div style={{
            width: '100%',
            height: '56px',
            background: '#000000',
            color: '#FFFFFF',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <button
              type="button"
              onClick={() => onUpdateQty && onUpdateQty(cartIndex, existingInCart.quantity - 1)}
              style={{
                background: 'transparent',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '24px',
                fontWeight: 700,
                width: '48px',
                height: '100%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}
              title="Decrease quantity in bag"
            >
              −
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Karla', fontSize: '15px', fontWeight: 700 }}>
              <span style={{ color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '12px' }}>IN BAG:</span>
              <span style={{ fontSize: '18px', fontWeight: 800, background: '#222222', color: '#FFFFFF', padding: '2px 12px', borderRadius: '4px', border: '1px solid #333333' }}>
                {existingInCart.quantity}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onUpdateQty && onUpdateQty(cartIndex, existingInCart.quantity + 1)}
              style={{
                background: 'transparent',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '24px',
                fontWeight: 700,
                width: '48px',
                height: '100%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}
              title="Increase quantity in bag"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            style={{
              width: '100%',
              height: '56px',
              background: '#000000',
              color: '#FFFFFF',
              fontFamily: 'Karla',
              fontSize: '18px',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
              marginBottom: '16px',
              transition: 'background 0.2s ease'
            }}
          >
            Add to Bag
          </button>
        )}


        {/* Same Day Dispatch Banner */}
        <div style={{ width: '100%', height: '40px', background: '#EDDBDB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', borderRadius: '2px' }}>
          <span style={{ fontFamily: 'Karla', fontSize: '13px', color: '#333333' }}>
            Same Day Dispatch on 5k+ pincodes
          </span>
        </div>

        {/* Product details */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'Karla', fontSize: '20px', color: '#000000', textDecoration: 'underline', marginBottom: '12px' }}>
            Product details
          </h2>
          <p style={{ fontFamily: 'Karla', fontSize: '14px', lineHeight: '22px', color: '#111827', marginBottom: '12px' }}>
            {currentProduct.description || "Embroidered logos, lightweight breathable fabric and a comfortable fit. Made for match days and everyday wear, with quality stitching for regular use."}
          </p>
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 12px' }}>
            <p style={{ fontFamily: 'Karla', fontSize: '13px', lineHeight: '20px', color: '#6B7280' }}>
              Fan Version for supporters and casual wear — not the official player-issued version.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '24px' }}>
          <h2 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '20px', color: '#111827', marginBottom: '16px' }}>
            You may also like
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {recProducts.map((rec) => (
              <div 
                key={rec.id}
                onClick={() => onSelectProduct && onSelectProduct(rec)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ width: '100%', height: '210px', background: '#D9D9D9', borderRadius: '2px', overflow: 'hidden' }}>
                  <ImageWithSpinner src={rec.imgUrl} alt={rec.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h4 style={{ fontFamily: 'Karla', fontWeight: 600, fontSize: '13px', color: '#111827', lineHeight: '18px' }}>
                  {formatCleanTitle(rec.name)}
                </h4>

                <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '13px', color: '#111827' }}>
                  ₹{rec.price}
                </p>
                <p style={{ fontFamily: 'Karla', fontSize: '11px', color: '#989191' }}>
                  {rec.type}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Size Guide Modal Dialog (Figma 93:146 Exact Match) */}
      {isSizeGuideOpen && (
        <div 
          onClick={() => setIsSizeGuideOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              width: '361px',
              maxWidth: '100%',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              borderRadius: '2px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
          >
            {/* Dialog Heading */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '20px', color: '#000000', margin: 0, lineHeight: 1.2 }}>
                  SIZE GUIDE
                </h3>
                <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#666666', margin: '4px 0 0 0' }}>
                  Adult T-shirts · Indian sizing
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Close Size Guide"
              >
                <X size={20} color="#000000" />
              </button>
            </div>

            {/* General Reference Notice */}
            <div style={{ background: '#F4F4F4', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '12px', color: '#1F1F1F' }}>
                GENERAL REFERENCE ONLY
              </span>
              <p style={{ fontFamily: 'Karla', fontSize: '12px', lineHeight: '17px', color: '#666666', margin: 0 }}>
                Common garment sizes; may vary by brand and fit. Not verified measurements for this product.
              </p>
            </div>

            {/* Size Chart Table */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'center' }}>
              {/* Table Headings */}
              <div style={{ background: '#000000', color: '#FFFFFF', height: '38px', display: 'flex', alignItems: 'center', fontFamily: 'Karla', fontWeight: 700, fontSize: '12px' }}>
                <div style={{ width: '49px' }}>Size</div>
                <div style={{ flex: 1 }}>Chest circumference</div>
                <div style={{ flex: 1 }}>Length</div>
              </div>

              {/* Measurement Units */}
              <div style={{ background: '#F4F4F4', color: '#666666', height: '26px', display: 'flex', alignItems: 'center', fontFamily: 'Karla', fontSize: '11px' }}>
                <div style={{ width: '49px' }}>—</div>
                <div style={{ flex: 0.5 }}>inches</div>
                <div style={{ flex: 0.5 }}>cm</div>
                <div style={{ flex: 0.5 }}>inches</div>
                <div style={{ flex: 0.5 }}>cm</div>
              </div>

              {/* Measurement Rows */}
              {[
                { size: 'S', chestIn: '38', chestCm: '96.5', lenIn: '26', lenCm: '66.0' },
                { size: 'M', chestIn: '40', chestCm: '101.6', lenIn: '27', lenCm: '68.6' },
                { size: 'L', chestIn: '42', chestCm: '106.7', lenIn: '28', lenCm: '71.1' },
                { size: 'XL', chestIn: '44', chestCm: '111.8', lenIn: '29', lenCm: '73.7' },
                { size: 'XXL', chestIn: '46', chestCm: '116.8', lenIn: '30', lenCm: '76.2' }
              ].map((row) => (
                <div 
                  key={row.size}
                  style={{
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #DEDEDE',
                    fontFamily: 'Karla',
                    fontSize: '13px',
                    color: '#1F1F1F'
                  }}
                >
                  <div style={{ width: '49px', fontWeight: 700 }}>{row.size}</div>
                  <div style={{ flex: 0.5 }}>{row.chestIn}</div>
                  <div style={{ flex: 0.5 }}>{row.chestCm}</div>
                  <div style={{ flex: 0.5 }}>{row.lenIn}</div>
                  <div style={{ flex: 0.5 }}>{row.lenCm}</div>
                </div>
              ))}
            </div>

            {/* How To Measure Guidance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', color: '#1F1F1F' }}>
                HOW TO MEASURE
              </span>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {/* T-shirt Diagram */}
                <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M53.084 34.4023V70.21L51.0176 67.2617L50.5264 67.6055L50.0352 67.9502L53.1924 72.457L53.6846 73.1582L54.1758 72.457L57.333 67.9502L56.8418 67.6055L56.3506 67.2617L54.2842 70.21V34.4023H58.2949L55.4141 36.7148L55.7891 37.1826L56.165 37.6514L59.4004 35.0537V79.4004H20.5996V35.0537L23.835 37.6514L24.2109 37.1826L24.5859 36.7148L21.7051 34.4023H53.084ZM68.0039 6.10449L79.1875 24.6055L66.4717 32.9805L60.4912 24.4443L59.4004 22.8867V32.5518L56.165 29.9551L55.7891 30.4229L55.4141 30.8906L58.2949 33.2031H54.2842V9.78906L56.3506 12.7383L56.8418 12.3945L57.333 12.0498L54.1758 7.54297L53.6846 6.8418L53.1924 7.54297L50.0352 12.0498L50.5264 12.3945L51.0176 12.7383L53.084 9.78906V33.2031H21.7051L24.5859 30.8906L24.2109 30.4229L23.835 29.9551L20.5996 32.5518V22.8867L19.5088 24.4443L13.5273 32.9805L0.811523 24.6055L11.9951 6.10449L24.0674 0.719727C29.2961 6.21373 34.6072 9.05078 40 9.05078C45.3927 9.05078 50.7031 6.21341 55.9316 0.719727L68.0039 6.10449Z" stroke="#1F1F1F" strokeWidth="1.2"/>
                  </svg>
                  <span style={{ position: 'absolute', left: '29px', top: '22px', fontFamily: 'Karla', fontWeight: 700, fontSize: '10px', color: '#1F1F1F' }}>A</span>
                  <span style={{ position: 'absolute', left: '58px', top: '53px', fontFamily: 'Karla', fontWeight: 700, fontSize: '10px', color: '#1F1F1F' }}>B</span>
                </div>

                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'Karla', fontSize: '12px' }}>
                  <p style={{ color: '#666666', margin: 0, lineHeight: '16px' }}>
                    Lay a well-fitting T-shirt flat.
                  </p>
                  <p style={{ color: '#1F1F1F', margin: 0, lineHeight: '16px' }}>
                    <strong>A · Chest:</strong> Measure armpit to armpit, then double it.
                  </p>
                  <p style={{ color: '#1F1F1F', margin: 0, lineHeight: '16px' }}>
                    <strong>B · Length:</strong> Measure from the highest shoulder point to the hem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '393px', height: '56px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 50 }}>
        <button onClick={onNavigateHome} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <img src={imgHome} alt="Home" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Home</span>
        </button>
        <button onClick={onBack} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <img src={imgShoppingBag} alt="Shop" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Shop</span>
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
