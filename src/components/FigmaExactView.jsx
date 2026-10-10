import React, { useEffect, useState, useRef, useMemo } from 'react';
import { rtdb, ref, onValue } from '../firebase';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { INITIAL_CATEGORIES } from '../data/categoriesData';
import ImageWithSpinner from './ImageWithSpinner';

import { 
  imgHome, 
  imgShoppingBag, 
  imgUser, 
  imgShoppingCart 
} from '../assets/svgIcons';

const defaultImages = {
  jersifyLogoHeader: "/jersify-wordmark.png",
  heroBanner1: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de",
  heroBanner2: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790334116027_pfan_0_IMG_3915.png?alt=media&token=8c2058d5-2b95-4926-8960-1b2ce77d29eb",
  heroBanner3: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030635314_1_IMG_6074.jpeg?alt=media&token=f8e8d995-63d7-4c57-aef4-948d93e6533d",
  wearYourIdentity: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030642038_2_IMG_6072.jpeg?alt=media&token=d0ba389d-4214-44ec-b2b3-c0dbdb548678",
  curatedSeasonPkg: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030675022_4_IMG_6071.jpeg?alt=media&token=ab978713-fa93-4b20-a8f2-a69b2f5c6aaf",
  premiumProducts: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1777010842917_0_IMG_3702.jpeg?alt=media&token=1797da70-902b-42e8-9682-7feb6c89d4ef",
  goodOldKits: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1777324422299_0_IMG_4061.jpeg?alt=media&token=f94be5a7-75e9-486d-bf07-92135cb38132",
  gurlsChoice: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030648696_3_IMG_6073.jpeg?alt=media&token=90f31fe5-1bb0-4522-aada-9db03fbcfab8",
  activities: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1778510513151_0_IMG_5263.jpeg?alt=media&token=17bad7fd-0018-4016-9fa2-5aedc6c3d09d",
  activities2: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1778510513151_0_IMG_5263.jpeg?alt=media&token=17bad7fd-0018-4016-9fa2-5aedc6c3d09d",
  clubLogoBarca: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  clubLogoReal: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  clubLogoMilan: "https://upload.wikimedia.org/wikipedia/commons/d/d0/AC_Milan_logo.svg",
  clubLogoBayern: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  clubLogoManUtd: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  clubLogoManCity: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  clubLogoLiverpool: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  clubLogoJuventus: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg"
};

export default function FigmaExactView({
  cartCount = 0,
  onSelectProduct,
  onSelectTeam,
  onSelectCategory,
  onOpenCart,
  onOpenAuth,
  onNavigateShop,
  onLoadingChange
}) {
  const [siteImages, setSiteImages] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_site_images') || localStorage.getItem('jersify_site_images');
      if (cached) {
        const parsed = JSON.parse(cached);
        const cleaned = {};
        Object.keys(parsed).forEach(k => {
          if (parsed[k] && !String(parsed[k]).startsWith('/figma/')) {
            cleaned[k] = parsed[k];
          }
        });
        return { ...defaultImages, ...cleaned };
      }
      return defaultImages;
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

  const imgImg44492 = siteImages.jersifyLogoHeader || defaultImages.jersifyLogoHeader;

  const [figmaJerseys, setFigmaJerseys] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_products') || localStorage.getItem('jersify_products');
      return cached ? JSON.parse(cached) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [categoriesList, setCategoriesList] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_categories') || localStorage.getItem('jersify_categories');
      return cached ? JSON.parse(cached) : INITIAL_CATEGORIES;
    } catch (e) {
      return INITIAL_CATEGORIES;
    }
  });

  const [homepageOrder, setHomepageOrder] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_homepage_order') || localStorage.getItem('jersify_homepage_order');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [teamBanners, setTeamBanners] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_team_banners') || localStorage.getItem('jersify_team_banners');
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      return {};
    }
  });

  const [clubsConfig, setClubsConfig] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_clubs_config') || localStorage.getItem('jersify_clubs_config');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    // Realtime auto-loading for siteImages
    const unsubImages = onValue(ref(rtdb, 'siteConfig/images'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const mapped = {};
        Object.keys(val).forEach(k => {
          const itemUrl = val[k]?.url || (typeof val[k] === 'string' ? val[k] : null);
          if (itemUrl && !itemUrl.startsWith('/figma/')) {
            mapped[k] = itemUrl;
          }
        });
        const merged = { ...defaultImages, ...mapped };
        setSiteImages(merged);
        sessionStorage.setItem('jersify_site_images', JSON.stringify(merged));
        localStorage.setItem('jersify_site_images', JSON.stringify(merged));
        localStorage.setItem('jersify_home_cached', 'true');
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
          localStorage.setItem('jersify_products', JSON.stringify(items));
        }
      }
    }, () => {});

    // Realtime auto-loading for categories
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
          localStorage.setItem('jersify_categories', JSON.stringify(list));
        }
      }
    }, () => {});

    // Realtime auto-loading for homepage product sequence
    const unsubOrder = onValue(ref(rtdb, 'siteConfig/homepageOrder'), (snap) => {
      if (snap.exists() && Array.isArray(snap.val())) {
        setHomepageOrder(snap.val());
        sessionStorage.setItem('jersify_homepage_order', JSON.stringify(snap.val()));
        localStorage.setItem('jersify_homepage_order', JSON.stringify(snap.val()));
      }
    }, () => {});

    // Realtime auto-loading for club entries & team banners
    const unsubTeams = onValue(ref(rtdb, 'siteConfig/teamBanners'), (snap) => {
      if (snap.exists() && snap.val()) {
        const val = snap.val();
        setTeamBanners(val);
        sessionStorage.setItem('jersify_team_banners', JSON.stringify(val));
        localStorage.setItem('jersify_team_banners', JSON.stringify(val));
      }
    }, () => {});

    const unsubClubs = onValue(ref(rtdb, 'siteConfig/clubs'), (snap) => {
      if (snap.exists() && snap.val()) {
        const val = snap.val();
        setClubsConfig(val);
        sessionStorage.setItem('jersify_clubs_config', JSON.stringify(val));
        localStorage.setItem('jersify_clubs_config', JSON.stringify(val));
      }
    }, () => {});

    return () => {
      unsubImages();
      unsubProds();
      unsubCategories();
      unsubOrder();
      unsubTeams();
      unsubClubs();
    };
  }, []);

  const displayedJerseys = useMemo(() => {
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
          if (c.type === 'national') return;
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
        if (item?.type === 'national') return;
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

  // Slidable Club Badges Dragging
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

  // Slidable Categories Dragging
  const categorySliderRef = useRef(null);
  const [isCategoryDragging, setIsCategoryDragging] = useState(false);
  const [categoryStartX, setCategoryStartX] = useState(0);
  const [categoryScrollLeft, setCategoryScrollLeft] = useState(0);
  const categoryHasDraggedRef = useRef(false);

  const handleCategoryMouseDown = (e) => {
    setIsCategoryDragging(true);
    categoryHasDraggedRef.current = false;
    setCategoryStartX(e.pageX - (categorySliderRef.current?.offsetLeft || 0));
    setCategoryScrollLeft(categorySliderRef.current?.scrollLeft || 0);
  };

  const handleCategoryMouseMove = (e) => {
    if (!isCategoryDragging || !categorySliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - (categorySliderRef.current?.offsetLeft || 0);
    const walk = (x - categoryStartX) * 1.4;
    if (Math.abs(walk) > 4) {
      categoryHasDraggedRef.current = true;
    }
    categorySliderRef.current.scrollLeft = categoryScrollLeft - walk;
  };

  const handleCategoryMouseUpOrLeave = () => {
    setIsCategoryDragging(false);
  };

  // Slidable Activities Dragging
  const activitySliderRef = useRef(null);
  const [isActivityDragging, setIsActivityDragging] = useState(false);
  const [activityStartX, setActivityStartX] = useState(0);
  const [activityScrollLeft, setActivityScrollLeft] = useState(0);
  const activityHasDraggedRef = useRef(false);

  const handleActivityMouseDown = (e) => {
    setIsActivityDragging(true);
    activityHasDraggedRef.current = false;
    setActivityStartX(e.pageX - (activitySliderRef.current?.offsetLeft || 0));
    setActivityScrollLeft(activitySliderRef.current?.scrollLeft || 0);
  };

  const handleActivityMouseMove = (e) => {
    if (!isActivityDragging || !activitySliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - (activitySliderRef.current?.offsetLeft || 0);
    const walk = (x - activityStartX) * 1.4;
    if (Math.abs(walk) > 4) {
      activityHasDraggedRef.current = true;
    }
    activitySliderRef.current.scrollLeft = activityScrollLeft - walk;
  };

  const handleActivityMouseUpOrLeave = () => {
    setIsActivityDragging(false);
  };

  // 3 Hero Carousel Slides
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

  // Ensure homepage hero banners photos are properly loaded (only hero banners, not all photos on the page)
  useEffect(() => {
    let isCancelled = false;
    if (onLoadingChange) onLoadingChange(true);

    const heroBannerUrls = [
      siteImages.heroBanner1 || defaultImages.heroBanner1,
      siteImages.heroBanner2 || defaultImages.heroBanner2,
      siteImages.heroBanner3 || defaultImages.heroBanner3
    ].filter((u) => u && typeof u === 'string' && !u.startsWith('data:image/svg+xml'));

    const promises = heroBannerUrls.map((url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        if (img.complete && (img.naturalWidth > 0 || img.__jersifyError)) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => {
            img.__jersifyError = true;
            resolve();
          };
        }
      });
    });

    const maxSafetyTimer = setTimeout(() => {
      if (!isCancelled && onLoadingChange) {
        onLoadingChange(false);
      }
    }, 4500);

    Promise.all(promises).then(() => {
      if (!isCancelled) {
        clearTimeout(maxSafetyTimer);
        // Ensure browser has committed render
        setTimeout(() => {
          if (!isCancelled && onLoadingChange) {
            onLoadingChange(false);
          }
        }, 100);
      }
    });

    return () => {
      isCancelled = true;
      clearTimeout(maxSafetyTimer);
    };
  }, [siteImages]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '393px',
      margin: '0 auto',
      background: '#FFFFFF',
      position: 'relative',
      overflowX: 'hidden',
      paddingBottom: '70px',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)'
    }}>

      {/* Top Header Brand Logo */}
      <div style={{ padding: '16px 19px 8px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ width: '128px', height: '47px' }}>
          <ImageWithSpinner
            src={imgImg44492}
            alt="Jersify Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Slidable 3 Hero Banners Slider with Pagination Dots */}
      <div id="hero-banner-carousel" data-hero-banners="true" style={{ width: '393px', height: '510px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          width: `${heroSlides.length * 393}px`,
          height: '100%',
          transform: `translateX(-${currentHeroSlide * 393}px)`,
          transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
        }}>
          {heroSlides.map((slideUrl, idx) => (
            <div key={idx} style={{ width: '393px', height: '510px', flexShrink: 0 }}>
              <ImageWithSpinner
                data-hero-banner="true"
                src={slideUrl}
                alt={`Hero Banner ${idx + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>

        {/* Slider Pagination Dots */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          zIndex: 30
        }}>
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

      {/* SHOP BY / CLUB JERSEYS */}
      <div style={{ marginTop: '20px' }}>
        <p style={{
          fontFamily: 'Karla, sans-serif',
          fontSize: '22.68px',
          color: '#000000',
          paddingLeft: '19px',
          margin: 0,
          lineHeight: '1.2'
        }}>
          SHOP BY
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: '22.68px',
          color: '#000000',
          paddingLeft: '19px',
          margin: '2px 0 10px',
          lineHeight: '1.2'
        }}>
          CLUB JERSEYS
        </p>

        {/* Club Badges with Figma Pink/Peach Gradient Background */}
        <div style={{
          width: '393px',
          minHeight: '187px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #E5D0D0 99.99%)',
          padding: '14px 19px 20px',
          boxSizing: 'border-box'
        }}>
          {clubsList.length <= 8 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px 12px',
              justifyItems: 'center',
              alignItems: 'center'
            }}>
              {clubsList.map((club) => (
                <div
                  key={club.id}
                  onClick={() => onSelectTeam && onSelectTeam(club.name)}
                  style={{
                    width: '64px',
                    height: '64px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <ImageWithSpinner
                    src={club.logo}
                    alt={club.name}
                    style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                  />
                </div>
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
                gridTemplateRows: 'repeat(2, 64px)',
                gridAutoFlow: 'column',
                gridAutoColumns: '64px',
                gap: '14px',
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x proximity',
                width: '100%',
                cursor: isClubDragging ? 'grabbing' : 'grab',
                userSelect: 'none'
              }}
            >
              {clubsList.map((club) => (
                <div
                  key={club.id}
                  style={{ scrollSnapAlign: 'start', flexShrink: 0, width: '64px', height: '64px' }}
                >
                  <ImageWithSpinner
                    onClick={() => {
                      if (clubHasDraggedRef.current) return;
                      if (onSelectTeam) onSelectTeam(club.name);
                    }}
                    src={club.logo}
                    alt={club.name}
                    style={{ width: '64px', height: '64px', cursor: 'pointer', objectFit: 'contain' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* WEAR YOUR IDENTITY Banner */}
      <div style={{ width: '393px', height: '162px', position: 'relative' }}>
        <ImageWithSpinner
          src={siteImages.wearYourIdentity || defaultImages.wearYourIdentity}
          alt="Wear Your Identity"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* CATEGORIES SECTION - Slidable on Homepage */}
      <div style={{ marginTop: '28px', marginBottom: '24px' }}>
        <h2 style={{
          fontFamily: 'Josefin Sans, sans-serif',
          fontWeight: 400,
          fontSize: '22px',
          color: '#000000',
          textAlign: 'center',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          margin: '0 0 16px'
        }}>
          CATEGORIES
        </h2>

        {/* Slidable Categories Container (Horizontal touch swipe & mouse drag) */}
        <div
          ref={categorySliderRef}
          onMouseDown={handleCategoryMouseDown}
          onMouseMove={handleCategoryMouseMove}
          onMouseUp={handleCategoryMouseUpOrLeave}
          onMouseLeave={handleCategoryMouseUpOrLeave}
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x proximity',
            padding: '0 19px',
            cursor: isCategoryDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
        >
          {categoriesList.map((cat) => (
            <div
              key={cat.id || cat.name}
              style={{
                scrollSnapAlign: 'start',
                flexShrink: 0,
                width: '173px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
              onClick={() => {
                if (categoryHasDraggedRef.current) return;
                if (onSelectCategory) {
                  onSelectCategory(cat);
                } else if (onNavigateShop) {
                  onNavigateShop();
                }
              }}
            >
              {/* Category Card Image with 2px Black Border */}
              <div style={{
                width: '173px',
                height: '212px',
                border: '2px solid #000000',
                background: '#F9FAFB',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <ImageWithSpinner
                  src={cat.imageUrl}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Category Name in Josefin Sans 25px */}
              <p style={{
                fontFamily: 'Josefin Sans, sans-serif',
                fontWeight: 400,
                fontSize: '25px',
                color: '#000000',
                textAlign: 'center',
                margin: '10px 0 0',
                lineHeight: '1.2',
                whiteSpace: 'nowrap'
              }}>
                {cat.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Curated for the season */}
      <div style={{ padding: '0 19px', marginTop: '36px' }}>
        <h2 style={{
          fontFamily: 'Karla, sans-serif',
          fontWeight: 600,
          fontSize: '25px',
          color: '#111111',
          margin: '0 0 16px'
        }}>
          Curated for the season
        </h2>

        {/* Card 1: Premium Packaging */}
        <div style={{
          marginBottom: '16px',
          borderRadius: '2px',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          height: '333px'
        }}>
          <ImageWithSpinner
            src={siteImages.curatedSeasonPkg || defaultImages.curatedSeasonPkg}
            alt="Premium Packaging"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Card 2: Premium Products (Argentina Banner) */}
        <div style={{
          borderRadius: '2px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          height: '131px'
        }}>
          <ImageWithSpinner
            src={siteImages.premiumProducts || defaultImages.premiumProducts}
            alt="Premium Products"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* GOOD OLD KITS */}
      <div style={{ padding: '0 19px', marginTop: '40px' }}>
        <h2 style={{
          fontFamily: 'Karla, sans-serif',
          fontWeight: 600,
          fontSize: '25px',
          color: '#111111',
          margin: '0 0 16px'
        }}>
          GOOD OLD KITS
        </h2>

        <div style={{
          width: '100%',
          height: '360px',
          borderRadius: '2px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden'
        }}>
          <ImageWithSpinner
            src={siteImages.goodOldKits || defaultImages.goodOldKits}
            alt="Good Old Kits"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* GURL‘S CHOICE */}
      <div style={{ padding: '0 19px', marginTop: '40px' }}>
        <h2 style={{
          fontFamily: 'Karla, sans-serif',
          fontWeight: 500,
          fontSize: '25px',
          color: '#111111',
          margin: '0 0 16px'
        }}>
          GURL‘S CHOICE
        </h2>

        <div style={{
          width: '100%',
          height: '413px',
          borderRadius: '2px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden'
        }}>
          <ImageWithSpinner
            src={siteImages.gurlsChoice || defaultImages.gurlsChoice}
            alt="Gurl's Choice"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* ACTIVITIES Section */}
      <div style={{ marginTop: '40px', marginBottom: '24px' }}>
        <h2 style={{
          fontFamily: 'Josefin Sans, sans-serif',
          fontWeight: 400,
          fontSize: '31.4px',
          color: '#000000',
          textAlign: 'center',
          letterSpacing: '1px',
          margin: '0 0 18px'
        }}>
          ACTIVITIES
        </h2>

        {/* Slidable Activities Cards */}
        <div
          ref={activitySliderRef}
          onMouseDown={handleActivityMouseDown}
          onMouseMove={handleActivityMouseMove}
          onMouseUp={handleActivityMouseUpOrLeave}
          onMouseLeave={handleActivityMouseUpOrLeave}
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x proximity',
            padding: '0 19px',
            cursor: isActivityDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
        >
          <div style={{
            scrollSnapAlign: 'start',
            flexShrink: 0,
            width: '205px',
            height: '134px',
            border: '2px solid #000000',
            overflow: 'hidden'
          }}>
            <ImageWithSpinner
              src={siteImages.activities || defaultImages.activities}
              alt="Activity 1"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{
            scrollSnapAlign: 'start',
            flexShrink: 0,
            width: '205px',
            height: '134px',
            border: '2px solid #000000',
            overflow: 'hidden'
          }}>
            <ImageWithSpinner
              src={siteImages.activities2 || defaultImages.activities2 || siteImages.activities || defaultImages.activities}
              alt="Activity 2"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      {/* Product Catalog Grid (10 Jerseys) */}
      <div style={{ padding: '0 19px', marginTop: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {displayedJerseys.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelectProduct && onSelectProduct(item)}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <div style={{ width: '100%', height: '210px', background: '#F3F2EF', borderRadius: '2px', overflow: 'hidden' }}>
                <ImageWithSpinner
                  src={item.imgUrl}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <h4 style={{ fontFamily: 'Karla, sans-serif', fontWeight: 600, fontSize: '13px', color: '#111111', lineHeight: '17px', margin: 0 }}>
                  {item.name}
                </h4>
                <p style={{ fontFamily: 'Karla, sans-serif', fontSize: '11px', color: '#737373', margin: '2px 0' }}>
                  {item.type}
                </p>
                <p style={{ fontFamily: 'Karla, sans-serif', fontWeight: 700, fontSize: '14px', color: '#111111', margin: 0 }}>
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
              fontFamily: 'Karla, sans-serif',
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
            Size guide   ·   Shipping & returns   ·   Help
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '393px',
        height: '56px',
        background: '#F9FAFB',
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 50
      }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <img src={imgHome} alt="Home" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', fontWeight: 500, color: '#111827' }}>Home</span>
        </button>
        <button
          onClick={onNavigateShop}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <img src={imgShoppingBag} alt="Shop" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Shop</span>
        </button>
        <button
          onClick={onOpenCart}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', background: 'none', border: 'none' }}
        >
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
        <button
          onClick={onOpenAuth}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <img src={imgUser} alt="Profile" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Profile</span>
        </button>
      </div>

    </div>
  );
}
