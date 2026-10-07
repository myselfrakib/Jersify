import React, { useEffect, useState } from 'react';
import { rtdb, ref, onValue } from '../firebase';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
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

export default function FigmaShopPage({ onSelectProduct, onOpenCart, onOpenAuth, onNavigateHome }) {
  const [headerLogo, setHeaderLogo] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_site_images');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.jersifyLogoHeader) return parsed.jersifyLogoHeader;
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
        if (val.jersifyLogoHeader?.url) {
          setHeaderLogo(val.jersifyLogoHeader.url);
        } else if (typeof val.jersifyLogoHeader === 'string') {
          setHeaderLogo(val.jersifyLogoHeader);
        }
      }
    }, () => {});

    return () => {
      unsubProds();
      unsubImages();
    };
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '393px', margin: '0 auto', background: '#FFFFFF', position: 'relative', overflowX: 'hidden', minHeight: '1604px', paddingBottom: '60px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      {/* Store Navigation Header */}
      <div style={{ borderBottom: '1px solid #E5E7EB', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 19px' }}>
        <div style={{ width: '128px', height: '47px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={onNavigateHome}>
          <ImageWithSpinner src={headerLogo} alt="Jersify" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <img src={imgSearchIcon} alt="Search" style={{ width: '20px', height: '20px' }} />
          </button>
          <button onClick={onOpenAuth} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <img src={imgAccountButton} alt="Account" style={{ width: '20px', height: '20px' }} />
          </button>
          <button onClick={onOpenCart} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <img src={imgShoppingBagButton} alt="Bag" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>

      {/* Shop Title Heading */}
      <div style={{ padding: '20px 19px 18px', borderBottom: '1px solid #E5E7EB' }}>
        <h1 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '28px', color: '#111111', lineHeight: '32px' }}>
          Shop
        </h1>
      </div>

      {/* Product Listing Grid */}
      <div style={{ padding: '19px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {shopJerseys.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelectProduct(item)}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <div style={{ width: '100%', height: '210px', background: '#F3F2EF', borderRadius: '2px', overflow: 'hidden' }}>
                <ImageWithSpinner src={item.imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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



        {/* Catalog Completion Footer Note */}
        <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '28px' }}>
          <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#737373', marginBottom: '20px' }}>
            You’ve seen all 10 jerseys
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
