import React, { useState, useEffect } from 'react';
import { rtdb, ref, get, onValue } from '../firebase';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import ImageWithSpinner from './ImageWithSpinner';

import { 
  imgBack, 
  imgShoppingBag, 
  imgHome, 
  imgUser, 
  imgJerseyPhoto as imgEllipse12, 
  imgHeroBarca 
} from '../assets/svgIcons';

const TEAM_DETAILS = {
  'Barcelona': {
    name: 'FC BARCELONA',
    subtitle: 'La Liga · Spain',
    founded: '1899',
    stadium: 'Spotify Camp Nou',
    logo: imgEllipse12,
    banner: imgHeroBarca,
    description: 'Explore official Blaugrana kits and retro classics for this season.'
  },
  'Real Madrid': {
    name: 'REAL MADRID CF',
    subtitle: 'La Liga · Spain',
    founded: '1902',
    stadium: 'Santiago Bernabéu',
    logo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
    banner: imgHeroBarca,
    description: 'Discover Los Blancos official home, away and special edition kits with 15-time Champions League heritage.'
  },
  'Argentina': {
    name: 'ARGENTINA',
    subtitle: 'CONMEBOL · World Champions',
    founded: '1893',
    stadium: 'Estadio MÁS Monumental',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Association_Argentine_de_Football_logo.svg',
    banner: imgHeroBarca,
    description: 'Wear the iconic Albiceleste stripes with 3-star World Cup champion badges and authentic fan versions.'
  },
  'Man City': {
    name: 'MANCHESTER CITY',
    subtitle: 'Premier League · England',
    founded: '1880',
    stadium: 'Etihad Stadium',
    logo: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
    banner: imgHeroBarca,
    description: 'Explore Cityzens modern home and away kits designed for pitch performance and lifestyle wear.'
  }
};

export default function FigmaTeamPage({
  teamName = 'Barcelona',
  cartCount = 0,
  onBack,
  onSelectProduct,
  onOpenCart,
  onNavigateHome,
  onNavigateShop
}) {
  const [activeTab, setActiveTab] = useState('All');
  const [savedWishlist, setSavedWishlist] = useState({});
  const [allProducts, setAllProducts] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_products');
      return cached ? JSON.parse(cached) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [teamConfig, setTeamConfig] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_team_banners');
      return cached ? JSON.parse(cached) : TEAM_DETAILS;
    } catch (e) {
      return TEAM_DETAILS;
    }
  });

  useEffect(() => {
    const unsubProds = onValue(ref(rtdb, 'products'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const items = Object.keys(val).map(k => ({ id: k, ...val[k] }));
        if (items.length > 0) {
          setAllProducts(items);
          sessionStorage.setItem('jersify_products', JSON.stringify(items));
        }
      }
    }, () => {});

    const unsubTeams = onValue(ref(rtdb, 'siteConfig/teamBanners'), (snap) => {
      if (snap.exists()) {
        const merged = { ...TEAM_DETAILS, ...snap.val() };
        setTeamConfig(merged);
        sessionStorage.setItem('jersify_team_banners', JSON.stringify(merged));
      }
    }, () => {});

    return () => {
      unsubProds();
      unsubTeams();
    };
  }, []);

  const info = teamConfig[teamName] || TEAM_DETAILS[teamName] || {
    name: teamName.toUpperCase(),
    subtitle: 'Official Collection',
    founded: '1900',
    stadium: 'Home Stadium',
    logo: imgEllipse12,
    banner: imgHeroBarca,
    description: `Official kits for ${teamName}. Premium breathable fabric.`
  };

  // Filter products by team dynamically from RTDB
  const teamProducts = allProducts.filter(p => 
    p.team?.toLowerCase() === teamName.toLowerCase() || 
    p.name.toLowerCase().includes(teamName.toLowerCase())
  );

  const filteredProducts = teamProducts.filter(p => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Home') return p.name.toLowerCase().includes('home');
    if (activeTab === 'Away') return p.name.toLowerCase().includes('away');
    if (activeTab === 'Retro') return p.type?.toLowerCase().includes('retro') || p.badge?.includes('08/') || p.badge?.includes('14/');
    if (activeTab === 'Player Issue') return p.playerVersion || p.type?.toLowerCase().includes('player');
    return true;
  });

  const featuredProduct = teamProducts.find(p => p.id === 'barca-home-2627') || teamProducts[0];

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    setSavedWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ width: '100%', maxWidth: '393px', margin: '0 auto', background: '#FFFFFF', position: 'relative', overflowX: 'hidden', minHeight: '1200px', paddingBottom: '70px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      {/* Navigation Header */}
      <div style={{ borderBottom: '1px solid #E5E7EB', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 19px', position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 40 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <img src={imgBack} alt="Back" style={{ width: '22px', height: '22px' }} />
        </button>
        <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '18px', color: '#111111', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {info.name}
        </p>
        <button onClick={onOpenCart} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <img src={imgShoppingBag} alt="Bag" style={{ width: '22px', height: '22px' }} />
        </button>
      </div>

      {/* Team Hero Section */}
      <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden', background: '#111111' }}>
        <ImageWithSpinner src={info.banner} alt={info.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
        
        {/* Team Crest & Details Overlay */}
        <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px', display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
          <div style={{ width: '72px', height: '72px', background: '#FFFFFF', borderRadius: '50%', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', flexShrink: 0 }}>
            <ImageWithSpinner src={info.logo} alt={info.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
          </div>
          <div style={{ color: '#FFFFFF', flexGrow: 1 }}>
            <span style={{ fontSize: '11px', fontFamily: 'Karla', textTransform: 'uppercase', letterSpacing: '1px', color: '#E5E7EB' }}>
              {info.subtitle}
            </span>
            <h1 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '22px', color: '#FFFFFF', margin: '2px 0 4px', lineHeight: '26px' }}>
              {info.name}
            </h1>
            <p style={{ fontSize: '12px', fontFamily: 'Karla', color: '#9CA3AF' }}>
              Est. {info.founded} · {teamProducts.length} Kits Available
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: '16px 19px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
        <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#4B5563', lineHeight: '18px' }}>
          {info.description}
        </p>
      </div>

      {/* Category Tabs Filter */}
      <div style={{ display: 'flex', gap: '8px', padding: '16px 19px', overflowX: 'auto', borderBottom: '1px solid #E5E7EB', scrollbarWidth: 'none' }}>
        {['All', 'Home', 'Away', 'Retro', 'Player Issue'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              fontFamily: 'Karla',
              fontSize: '13px',
              fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? '#FFFFFF' : '#374151',
              background: activeTab === tab ? '#111111' : '#F3F4F6',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab} Kits
          </button>
        ))}
      </div>

      {/* Featured Kit Spotlight Card */}
      {featuredProduct && activeTab === 'All' && (
        <div style={{ padding: '20px 19px 10px' }}>
          <div 
            onClick={() => onSelectProduct(featuredProduct)}
            style={{ background: '#F3F4F6', border: '1px solid #111111', cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ background: '#111111', color: '#FFFFFF', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Karla', fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>FEATURED KIT</span>
              <span style={{ fontFamily: 'Karla', fontSize: '11px', color: '#EDDBDB' }}>26/27 SEASON</span>
            </div>
            <div style={{ height: '240px', width: '100%', position: 'relative', background: '#FFFFFF' }}>
              <ImageWithSpinner src={featuredProduct.imgUrl} alt={featuredProduct.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '16px', background: '#FFFFFF', borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h3 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '16px', color: '#111111' }}>
                {featuredProduct.name}
              </h3>
              <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>
                {featuredProduct.type}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '18px', color: '#111111' }}>
                  ₹{featuredProduct.price}
                </span>
                <button style={{ background: '#000000', color: '#FFFFFF', padding: '8px 16px', fontFamily: 'Karla', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                  View Kit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Catalogue Grid */}
      <div style={{ padding: '20px 19px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '20px', color: '#111111' }}>
            {activeTab === 'All' ? 'All Team Kits' : `${activeTab} Kits`}
          </h2>
          <span style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>
            {filteredProducts.length} items
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#6B7280', fontFamily: 'Karla', fontSize: '14px' }}>
            No kits found matching this filter category.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {filteredProducts.map(p => (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ position: 'relative', width: '100%', height: '220px', background: '#F5F5F5', border: '1px solid #E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                  <ImageWithSpinner src={p.imgUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                  
                  {p.badge && (
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#EDDBDB', padding: '3px 8px' }}>
                      <span style={{ fontFamily: 'Karla', fontSize: '10px', fontWeight: 700, color: '#333333' }}>
                        {p.badge}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={(e) => toggleWishlist(e, p.id)}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <span style={{ color: savedWishlist[p.id] ? '#EF4444' : '#6B7280', fontSize: '14px' }}>
                      {savedWishlist[p.id] ? '❤️' : '🤍'}
                    </span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h4 style={{ fontFamily: 'Karla', fontWeight: 600, fontSize: '13px', color: '#111111', lineHeight: '17px' }}>
                    {p.name}
                  </h4>
                  <p style={{ fontFamily: 'Karla', fontSize: '11px', color: '#6B7280' }}>
                    {p.type}
                  </p>
                  <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', color: '#111111', marginTop: '2px' }}>
                    ₹{p.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quality Fan Version Note Banner */}
      <div style={{ margin: '0 19px 24px', padding: '16px', background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <h4 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', color: '#111111', marginBottom: '4px' }}>
          Fan Version Specifications
        </h4>
        <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#6B7280', lineHeight: '17px' }}>
          Crafted with embroidered club crests, comfortable regular fit cut, and lightweight 100% recycled polyester Dri-FIT technology.
        </p>
      </div>

      {/* Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '393px', height: '56px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 50 }}>
        <button onClick={onNavigateHome} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', background: 'none', border: 'none' }}>
          <img src={imgHome} alt="Home" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Home</span>
        </button>
        <button onClick={onNavigateShop} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', background: 'none', border: 'none' }}>
          <img src={imgShoppingBag} alt="Shop" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Shop</span>
        </button>
        <button onClick={onOpenCart} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', background: 'none', border: 'none' }}>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <img src={imgShoppingBag} alt="Bag" style={{ width: '20px', height: '20px' }} />
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
        <button onClick={onBack} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', background: 'none', border: 'none' }}>
          <img src={imgUser} alt="Profile" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', fontWeight: 500, color: '#111827' }}>Profile</span>
        </button>
      </div>
    </div>
  );
}
