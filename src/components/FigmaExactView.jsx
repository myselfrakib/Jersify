import React, { useEffect, useState, useRef, useMemo } from 'react';
import { rtdb, ref, get, onValue } from '../firebase';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import ImageWithSpinner from './ImageWithSpinner';


import { 
  imgHome, 
  imgShoppingBag, 
  imgUser, 
  imgShoppingCart 
} from '../assets/svgIcons';

const sampleJerseyImg = "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de";

const defaultImages = {
  heroBanner1: sampleJerseyImg,
  heroBanner2: sampleJerseyImg,
  heroBanner3: sampleJerseyImg,
  wearYourIdentity: sampleJerseyImg,
  notBasicSpotlight: sampleJerseyImg,
  curatedSeasonPkg: sampleJerseyImg,
  qualityYouCanWear: sampleJerseyImg,
  retroBanner1: sampleJerseyImg,
  retroBanner2: sampleJerseyImg,
  lifestyleClubs: sampleJerseyImg,
  lifestyleNationals: sampleJerseyImg,
  jersifyLogoHeader: sampleJerseyImg,
  clubLogoBarca: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  clubLogoReal: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  clubLogoMilan: "https://upload.wikimedia.org/wikipedia/commons/d/d0/AC_Milan_logo.svg",
  clubLogoBayern: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  clubLogoManUtd: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  clubLogoManCity: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  clubLogoLiverpool: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  clubLogoJuventus: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg"
};

export default function FigmaExactView({ cartCount = 0, onSelectProduct, onSelectTeam, onOpenCart, onOpenAuth, onNavigateShop }) {
  const [siteImages, setSiteImages] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_site_images');
      return cached ? JSON.parse(cached) : defaultImages;
    } catch (e) {
      return defaultImages;
    }
  });

  const imgEllipse12 = siteImages.clubLogoBarca || defaultImages.clubLogoBarca;
  const imgEllipse18 = siteImages.clubLogoMilan || defaultImages.clubLogoMilan;
  const imgEllipse14 = siteImages.clubLogoBayern || defaultImages.clubLogoBayern;
  const imgEllipse15 = siteImages.clubLogoManUtd || defaultImages.clubLogoManUtd;
  const imgEllipse16 = siteImages.clubLogoReal || defaultImages.clubLogoReal;
  const imgEllipse17 = siteImages.clubLogoManCity || defaultImages.clubLogoManCity;
  const imgEllipse13 = siteImages.clubLogoLiverpool || defaultImages.clubLogoLiverpool;
  const imgEllipse19 = siteImages.clubLogoJuventus || defaultImages.clubLogoJuventus;

  const imgImg44492 = siteImages.jersifyLogoHeader || sampleJerseyImg;
  const imgRectangle3 = siteImages.wearYourIdentity || sampleJerseyImg;

  const [figmaJerseys, setFigmaJerseys] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_products');
      return cached ? JSON.parse(cached) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [homepageOrder, setHomepageOrder] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_homepage_order');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [teamBanners, setTeamBanners] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_team_banners');
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      return {};
    }
  });

  const [clubsConfig, setClubsConfig] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_clubs_config');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    // Realtime auto-loading for site images
    const unsubImages = onValue(ref(rtdb, 'siteConfig/images'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const mapped = {};
        Object.keys(val).forEach(k => {
          if (val[k]?.url) mapped[k] = val[k].url;
        });
        const merged = { ...defaultImages, ...mapped };
        setSiteImages(merged);
        sessionStorage.setItem('jersify_site_images', JSON.stringify(merged));
      }
    }, () => {});

    // Realtime auto-loading for product catalog
    const unsubProds = onValue(ref(rtdb, 'products'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const items = Object.keys(val).map(k => ({ id: k, ...val[k] }));
        if (items.length > 0) {
          setFigmaJerseys(items);
          sessionStorage.setItem('jersify_products', JSON.stringify(items));
        }
      }
    }, () => {});

    // Realtime auto-loading for homepage product sequence
    const unsubOrder = onValue(ref(rtdb, 'siteConfig/homepageOrder'), (snap) => {
      if (snap.exists() && Array.isArray(snap.val())) {
        setHomepageOrder(snap.val());
        sessionStorage.setItem('jersify_homepage_order', JSON.stringify(snap.val()));
      }
    }, () => {});

    // Realtime auto-loading for club entries & team banners
    const unsubTeams = onValue(ref(rtdb, 'siteConfig/teamBanners'), (snap) => {
      if (snap.exists() && snap.val()) {
        const val = snap.val();
        setTeamBanners(val);
        sessionStorage.setItem('jersify_team_banners', JSON.stringify(val));
      }
    }, () => {});

    const unsubClubs = onValue(ref(rtdb, 'siteConfig/clubs'), (snap) => {
      if (snap.exists() && snap.val()) {
        const val = snap.val();
        setClubsConfig(val);
        sessionStorage.setItem('jersify_clubs_config', JSON.stringify(val));
      }
    }, () => {});

    return () => {
      unsubImages();
      unsubProds();
      unsubOrder();
      unsubTeams();
      unsubClubs();
    };
  }, []);

  const displayedJerseys = React.useMemo(() => {
    if (homepageOrder && homepageOrder.length > 0) {
      const ordered = [];
      homepageOrder.forEach(id => {
        const found = figmaJerseys.find(p => String(p.id) === String(id));
        if (found) ordered.push(found);
      });
      figmaJerseys.forEach(p => {
        if (ordered.length < 10 && !ordered.some(o => String(o.id) === String(p.id))) {
          ordered.push(p);
        }
      });
      return ordered.slice(0, 10);
    }
    return figmaJerseys.slice(0, 10);
  }, [figmaJerseys, homepageOrder]);

  const clubsList = useMemo(() => {
    const baseClubs = [
      { id: 'Barcelona', name: 'Barcelona', logo: imgEllipse12 },
      { id: 'Real Madrid', name: 'Real Madrid', logo: imgEllipse16 },
      { id: 'Man City', name: 'Man City', logo: imgEllipse17 },
      { id: 'Liverpool', name: 'Liverpool', logo: imgEllipse13 },
      { id: 'AC Milan', name: 'AC Milan', logo: imgEllipse18 },
      { id: 'Bayern Munich', name: 'Bayern Munich', logo: imgEllipse14 },
      { id: 'Man United', name: 'Man United', logo: imgEllipse15 },
      { id: 'Juventus', name: 'Juventus', logo: imgEllipse19 }
    ];

    const extraClubs = [];

    if (clubsConfig) {
      const list = Array.isArray(clubsConfig) ? clubsConfig : Object.values(clubsConfig);
      list.forEach((c) => {
        if (c && c.name && (c.logo || c.logoUrl || c.crest)) {
          const already = baseClubs.some(
            (b) => b.name.toLowerCase() === c.name.toLowerCase()
          );
          if (!already) {
            extraClubs.push({
              id: c.id || c.name,
              name: c.name,
              logo: c.logo || c.logoUrl || c.crest
            });
          }
        }
      });
    }

    if (teamBanners && typeof teamBanners === 'object') {
      Object.keys(teamBanners).forEach((teamName) => {
        const item = teamBanners[teamName];
        const already =
          baseClubs.some((b) => b.name.toLowerCase() === teamName.toLowerCase()) ||
          extraClubs.some((e) => e.name.toLowerCase() === teamName.toLowerCase());
        if (!already && (item?.logo || item?.crest)) {
          extraClubs.push({
            id: teamName,
            name: item.name || teamName,
            logo: item.logo || item.crest
          });
        }
      });
    }

    return [...baseClubs, ...extraClubs];
  }, [teamBanners, clubsConfig, imgEllipse12, imgEllipse16, imgEllipse17, imgEllipse13, imgEllipse18, imgEllipse14, imgEllipse15, imgEllipse19]);

  const clubSliderRef = useRef(null);
  const [isClubDragging, setIsClubDragging] = useState(false);
  const [clubStartX, setClubStartX] = useState(0);
  const [clubScrollLeft, setClubScrollLeft] = useState(0);
  const clubHasDraggedRef = useRef(false);

  const handleClubMouseDown = (e) => {
    if (clubsList.length <= 8) return;
    setIsClubDragging(true);
    clubHasDraggedRef.current = false;
    setClubStartX(e.pageX - (clubSliderRef.current?.offsetLeft || 0));
    setClubScrollLeft(clubSliderRef.current?.scrollLeft || 0);
  };

  const handleClubMouseMove = (e) => {
    if (!isClubDragging || !clubSliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - (clubSliderRef.current?.offsetLeft || 0);
    const walk = (x - clubStartX) * 1.4;
    if (Math.abs(walk) > 4) {
      clubHasDraggedRef.current = true;
    }
    clubSliderRef.current.scrollLeft = clubScrollLeft - walk;
  };

  const handleClubMouseUpOrLeave = () => {
    setIsClubDragging(false);
  };

  const heroSlides = [
    siteImages.heroBanner1 || defaultImages.heroBanner1,
    siteImages.heroBanner2 || defaultImages.heroBanner2,
    siteImages.heroBanner3 || defaultImages.heroBanner3
  ].filter(Boolean);

  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div style={{ width: '100%', maxWidth: '393px', margin: '0 auto', background: '#FFFFFF', position: 'relative', overflowX: 'hidden', minHeight: '4924px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>

      {/* Top Header Logo */}
      <div style={{ position: 'absolute', top: '16px', left: '19px', width: '128px', height: '47px', zIndex: 10 }}>
        <ImageWithSpinner src={imgImg44492} alt="Jersify Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Slidable 3 Hero Banners Slider with Dots */}
      <div style={{ position: 'absolute', top: '68px', left: 0, width: '393px', height: '510px', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          width: `${heroSlides.length * 393}px`,
          height: '100%',
          transform: `translateX(-${currentHeroSlide * 393}px)`,
          transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
        }}>
          {heroSlides.map((slideUrl, idx) => (
            <div key={idx} style={{ width: '393px', height: '510px', flexShrink: 0 }}>
              <ImageWithSpinner src={slideUrl} alt={`Hero Banner ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>

        {/* Slider Pagination Dots */}
        <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', zIndex: 30 }}>
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: currentHeroSlide === idx ? '26px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentHeroSlide === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                boxShadow: currentHeroSlide === idx ? '0 2px 6px rgba(0,0,0,0.3)' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* SHOP BY CLUB JERSEYS */}
      <p style={{ position: 'absolute', top: '597px', left: '19px', fontFamily: 'Karla', fontSize: '22.68px', color: '#000000' }}>
        SHOP BY
      </p>
      <p style={{ position: 'absolute', top: '624px', left: '19px', fontFamily: 'Inter', fontWeight: 600, fontSize: '22.68px', color: '#000000' }}>
        CLUB JERSEYS
      </p>

      {/* Club Crest Badges Grid / Slider */}
      <div style={{ position: 'absolute', top: '673px', left: '19px', width: '355px', height: '166px' }}>
        {clubsList.length <= 8 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', justifyItems: 'center', alignItems: 'center' }}>
            {clubsList.map((club) => (
              <ImageWithSpinner
                key={club.id}
                onClick={() => onSelectTeam && onSelectTeam(club.name)}
                src={club.logo}
                alt={club.name}
                style={{ width: '70px', height: '70px', cursor: 'pointer' }}
              />
            ))}
          </div>
        ) : (
          <div
            ref={clubSliderRef}
            onMouseDown={handleClubMouseDown}
            onMouseMove={handleClubMouseMove}
            onMouseUp={handleClubMouseUpOrLeave}
            onMouseLeave={handleClubMouseUpOrLeave}
            style={{
              display: 'grid',
              gridTemplateRows: 'repeat(2, 70px)',
              gridAutoFlow: 'column',
              gridAutoColumns: '70px',
              gap: '16px',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x proximity',
              width: '100%',
              height: '100%',
              cursor: isClubDragging ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
          >
            {clubsList.map((club) => (
              <div key={club.id} style={{ scrollSnapAlign: 'start', flexShrink: 0, width: '70px', height: '70px' }}>
                <ImageWithSpinner
                  onClick={() => {
                    if (clubHasDraggedRef.current) return;
                    if (onSelectTeam) onSelectTeam(club.name);
                  }}
                  src={club.logo}
                  alt={club.name}
                  style={{ width: '70px', height: '70px', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WEAR YOUR IDENTITY Banner */}
      <div style={{ position: 'absolute', top: '864px', left: 0, width: '393px', height: '162px' }}>
        <ImageWithSpinner src={siteImages.wearYourIdentity || defaultImages.wearYourIdentity} alt="Wear Your Identity" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* NOT BASIC Spotlight Banner */}
      <div style={{ position: 'absolute', top: '1038px', left: 0, width: '393px', height: '510px' }}>
        <ImageWithSpinner src={siteImages.notBasicSpotlight || defaultImages.notBasicSpotlight} alt="Not Basic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Merchandising Section */}
      <div style={{ position: 'absolute', top: '1532px', left: 0, width: '393px', height: '2565px', padding: '0 19px' }}>
        {/* Curated for the season */}
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontFamily: 'Karla', fontWeight: 600, fontSize: '25px', color: '#111111', marginBottom: '16px' }}>
            Curated for the season
          </h2>
          <div style={{ marginBottom: '16px', borderRadius: '2px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
            <ImageWithSpinner src={siteImages.curatedSeasonPkg || defaultImages.curatedSeasonPkg} alt="Premium Packaging" style={{ width: '100%', height: '333px', objectFit: 'cover' }} />
          </div>
          <div style={{ background: '#F5F5F5', borderRadius: '2px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <ImageWithSpinner src={siteImages.qualityYouCanWear || defaultImages.qualityYouCanWear} alt="Quality you can wear" style={{ width: '100%', height: '131px', objectFit: 'cover' }} />
            <div style={{ padding: '16px' }}>
              <h3 style={{ fontFamily: 'Karla', fontWeight: 600, fontSize: '18px', color: '#111111', marginBottom: '8px' }}>
                Quality you can wear
              </h3>
              <p style={{ fontFamily: 'Karla', fontSize: '14px', color: '#6B7280' }}>
                Premium quality, made to be worn with pride
              </p>
            </div>
          </div>
        </div>

        {/* GOOD OLD KITS */}
        <div style={{ marginTop: '60px' }}>
          <p style={{ fontFamily: 'Karla', fontSize: '10px', letterSpacing: '1.8px', color: '#6B7280', textTransform: 'uppercase' }}>
            Old Jerseys, Forever relevant.
          </p>
          <h2 style={{ fontFamily: 'Karla', fontWeight: 600, fontSize: '25px', color: '#111111', marginBottom: '16px' }}>
            GOOD OLD KITS
          </h2>
          <div style={{ display: 'flex', gap: '19px' }}>
            <ImageWithSpinner src={siteImages.retroBanner1 || defaultImages.retroBanner1} alt="Retro 1" style={{ flex: 1, height: '360px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #E5E7EB' }} />
            <ImageWithSpinner src={siteImages.retroBanner2 || defaultImages.retroBanner2} alt="Retro 2" style={{ flex: 1, height: '360px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #E5E7EB' }} />
          </div>
        </div>

        {/* LIFESTYLE Off the pitch */}
        <div style={{ marginTop: '60px' }}>
          <p style={{ fontFamily: 'Karla', fontSize: '10px', letterSpacing: '1.8px', color: '#6B7280', textTransform: 'uppercase' }}>
            LIFESTYLE
          </p>
          <h2 style={{ fontFamily: 'Karla', fontWeight: 600, fontSize: '25px', color: '#111111', marginBottom: '16px' }}>
            Off the pitch
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', background: '#F5F5F5', border: '1px solid #E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
              <ImageWithSpinner src={siteImages.lifestyleClubs || defaultImages.lifestyleClubs} alt="Clubs" style={{ width: '207px', height: '166px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontFamily: 'Karla', fontWeight: 600, fontSize: '18px', color: '#111111', marginBottom: '8px' }}>CLUBS</h3>
                <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>Elevated essentials for the city.</p>
              </div>
            </div>

            <div style={{ display: 'flex', background: '#F5F5F5', border: '1px solid #E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ padding: '16px', flexGrow: 1 }}>
                <h3 style={{ fontFamily: 'Karla', fontWeight: 600, fontSize: '18px', color: '#111111', marginBottom: '8px' }}>NATIONALS</h3>
                <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>Finishing touches for the modern fan.</p>
              </div>
              <ImageWithSpinner src={siteImages.lifestyleNationals || defaultImages.lifestyleNationals} alt="Nationals" style={{ width: '136px', height: '166px', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        {/* Product Catalog Grid (10 Jerseys) */}
        <div style={{ marginTop: '60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {displayedJerseys.map((item) => (
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

          <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '28px' }}>
            <button 
              onClick={onNavigateShop}
              style={{
                width: '100%',
                height: '48px',
                background: '#111111',
                color: '#FFFFFF',
                fontFamily: 'Karla',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Load More Jerseys →
            </button>
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', fontSize: '12px', color: '#111111' }}>
              Size guide · Shipping & returns · Help
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '393px', height: '56px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 50 }}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <img src={imgHome} alt="Home" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', fontWeight: 500, color: '#111827' }}>Home</span>
        </button>
        <button onClick={onNavigateShop} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
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
        <button onClick={onOpenAuth} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <img src={imgUser} alt="Profile" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Profile</span>
        </button>
      </div>
    </div>
  );
}
