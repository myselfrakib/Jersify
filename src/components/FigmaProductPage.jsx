import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageWithSpinner from './ImageWithSpinner';
import { rtdb, ref, onValue } from '../firebase';

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
  onBack, 
  onAddToCart,
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

  useEffect(() => {
    const unsubImages = onValue(ref(rtdb, 'siteConfig/images'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        if (val.jersifyLogoHeader?.url) {
          setHeaderLogo(val.jersifyLogoHeader.url);
        }
      }
    }, () => {});
    return () => unsubImages();
  }, []);

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');

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

  const recProducts = (Array.isArray(allProducts) && allProducts.length > 1)
    ? allProducts.filter(p => p.id !== currentProduct.id).slice(0, 2)
    : [
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

        {/* Size Selection */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'Karla', fontSize: '14px', color: '#1F1F1F' }}>Select your size</span>
            <span style={{ fontFamily: 'Karla', fontSize: '12px', color: '#000000', textDecoration: 'underline', cursor: 'pointer' }}>SIZE GUIDE</span>
          </div>

          <div style={{ display: 'flex', border: '1px solid #000000', borderRadius: '2px', overflow: 'hidden' }}>
            {sizes.map((sz, i) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                style={{
                  flex: 1,
                  height: '46px',
                  background: selectedSize === sz ? '#111827' : '#FFFFFF',
                  color: selectedSize === sz ? '#FFFFFF' : '#000000',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: selectedSize === sz ? 700 : 400,
                  border: 'none',
                  borderRight: i < sizes.length - 1 ? '1px solid #000000' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
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

        {/* Add to Bag Button */}
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
                <h4 style={{ fontFamily: 'Karla', fontWeight: 600, fontSize: '13px', color: '#111827' }}>
                  {rec.name}
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
        <button onClick={onOpenCart} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <img src={imgShoppingCart} alt="Bag" style={{ width: '20px', height: '20px' }} />
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
