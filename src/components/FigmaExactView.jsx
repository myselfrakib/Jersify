import React, { useEffect, useState } from 'react';
import { rtdb, ref, get } from '../firebase';

const defaultImages = {
  heroBanner1: "http://localhost:3845/assets/4a5bf1256465888e3f8ad578d93f2194a847b287.png",
  heroBanner2: "http://localhost:3845/assets/08eaae9b8d6f047ba9b1bf816be8279c23ca5b79.png",
  heroBanner3: "http://localhost:3845/assets/b4ca2f4a5332624caba58bcf3f92587c23c71169.png",
  wearYourIdentity: "http://localhost:3845/assets/aa1cf1709f82c4b2a1cf7ce45b739d3379b0e0e7.png",
  notBasicSpotlight: "http://localhost:3845/assets/3d9c63e439c097fd35375eee418847add198ba5e.png",
  curatedSeasonPkg: "http://localhost:3845/assets/c7321852f457d9b37da7803950e5e2379a736556.png",
  qualityYouCanWear: "http://localhost:3845/assets/855ef2d489a779d01e498ba93cd96f51680e222c.png",
  retroBanner1: "http://localhost:3845/assets/64269d952e03e2cfe6b2f34338cedcfd8c20be9c.png",
  retroBanner2: "http://localhost:3845/assets/1b0f4742125549062a00a04d67497746c3a4fd77.png",
  lifestyleClubs: "http://localhost:3845/assets/5ba9af2b698fca31703a423d73a073f2012857c6.png",
  lifestyleNationals: "http://localhost:3845/assets/f44f755c468bd086a40ef40d4bb7c4c9d3301587.png"
};

const imgEllipse12 = "http://localhost:3845/assets/39ab2a4dd213aa9206bf0e36859faf18175daef5.png";
const imgEllipse18 = "http://localhost:3845/assets/4272137932a53bd9f16f8d60ee1548cf5f975643.png";
const imgEllipse14 = "http://localhost:3845/assets/06e03a5ac717eff1a306d8fc3fda648e08d0fa89.png";
const imgEllipse15 = "http://localhost:3845/assets/2097926c577d6098c40d8d445adb1e14fcc3438b.png";
const imgEllipse16 = "http://localhost:3845/assets/a8647aad699c0b8286625d0bba860873cb936c32.png";
const imgEllipse17 = "http://localhost:3845/assets/b41954dd7858b0ad1c0699454ff03bab1fdc4f3d.png";
const imgEllipse13 = "http://localhost:3845/assets/1447f142b4c6a11180a331925393d53396661562.png";
const imgEllipse19 = "http://localhost:3845/assets/8c3cfca9dea1755f265b3b26136f1e1a41bbd36b.png";
const imgImg44492 = "http://localhost:3845/assets/3d9c63e439c097fd35375eee418847add198ba5e.png";
const imgRectangle3 = "http://localhost:3845/assets/5c48669b89b932b67810151ad0e742bb4c5a4ec6.png";
const imgHome = "http://localhost:3845/assets/770d6e8de263da4c03f4e35592767143b42b118e.svg";
const imgShoppingBag = "http://localhost:3845/assets/1eecf7ef8412c1f7eff5133baff9c8d9a3e03da6.svg";
const imgShoppingCart = "http://localhost:3845/assets/4aab5a9f06367897d9c75fe4f12fa26a336c118e.svg";
const imgUser = "http://localhost:3845/assets/2cca44153aa7147baae8f4ea673f094d77907545.svg";

export default function FigmaExactView({ onSelectProduct, onSelectTeam, onOpenCart, onOpenAuth, onNavigateShop }) {
  const [siteImages, setSiteImages] = useState(defaultImages);

  useEffect(() => {
    async function loadSiteImages() {
      try {
        const snap = await get(ref(rtdb, 'siteConfig/images'));
        if (snap.exists()) {
          const val = snap.val();
          const mapped = {};
          Object.keys(val).forEach(k => {
            if (val[k]?.url) mapped[k] = val[k].url;
          });
          setSiteImages(prev => ({ ...prev, ...mapped }));
        }
      } catch (e) {}
    }
    loadSiteImages();
  }, []);
  const figmaJerseys = [
    {
      id: "figma-1",
      name: "BARCELONA HOME 26/27",
      type: "Concept · Fan version",
      price: 750,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de",
      team: "Barcelona"
    },
    {
      id: "figma-2",
      name: "BARCELONA AWAY 26/27",
      type: "Concept · Fan version",
      price: 750,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790334116027_pfan_0_IMG_3915.png?alt=media&token=8c2058d5-2b95-4926-8960-1b2ce77d29eb",
      team: "Barcelona"
    },
    {
      id: "figma-3",
      name: "BARCELONA HOME 24/25",
      type: "Fan version · S–XXL",
      price: 650,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030635314_1_IMG_6074.jpeg?alt=media&token=f8e8d995-63d7-4c57-aef4-948d93e6533d",
      team: "Barcelona"
    },
    {
      id: "figma-4",
      name: "BARCELONA AWAY 24/25",
      type: "Fan version · S–XXL",
      price: 650,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030642038_2_IMG_6072.jpeg?alt=media&token=d0ba389d-4214-44ec-b2b3-c0dbdb548678",
      team: "Barcelona"
    },
    {
      id: "figma-5",
      name: "BARCELONA HOME 23/24",
      type: "Fan version · S–XXL",
      price: 650,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030648696_3_IMG_6073.jpeg?alt=media&token=90f31fe5-1bb0-4522-aada-9db03fbcfab8",
      team: "Barcelona"
    },
    {
      id: "figma-6",
      name: "BARCELONA AWAY 23/24",
      type: "Fan version · S–XL",
      price: 650,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030675022_4_IMG_6071.jpeg?alt=media&token=ab978713-fa93-4b20-a8f2-a69b2f5c6aaf",
      team: "Barcelona"
    },
    {
      id: "figma-7",
      name: "BARCELONA HOME 08/09",
      type: "Retro · S–XXL",
      price: 899,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1777010842917_0_IMG_3702.jpeg?alt=media&token=1797da70-902b-42e8-9682-7feb6c89d4ef",
      team: "Barcelona"
    },
    {
      id: "figma-8",
      name: "BARCELONA HOME 14/15",
      type: "Retro · S–XXL",
      price: 899,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1777324422299_0_IMG_4061.jpeg?alt=media&token=f94be5a7-75e9-486d-bf07-92135cb38132",
      team: "Barcelona"
    },
    {
      id: "figma-9",
      name: "BARCELONA THIRD 24/25",
      type: "Fan version · S–XL",
      price: 700,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1777348522170_0_IMG_4080.jpeg?alt=media&token=86b339ae-0b9b-41e0-b926-fe7a4fccecc8",
      team: "Barcelona"
    },
    {
      id: "figma-10",
      name: "BARCELONA TRAINING",
      type: "Training jersey · S–XXL",
      price: 650,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1778510513151_0_IMG_5263.jpeg?alt=media&token=17bad7fd-0018-4016-9fa2-5aedc6c3d09d",
      team: "Barcelona"
    }
  ];

  return (
    <div style={{ width: '100%', maxWidth: '393px', margin: '0 auto', background: '#FFFFFF', position: 'relative', overflowX: 'hidden', minHeight: '4924px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      {/* Top Header Logo */}
      <div style={{ position: 'absolute', top: '16px', left: '7px', width: '128px', height: '47px', zIndex: 10 }}>
        <img src={imgImg44492} alt="Jersify Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Hero Banner 1 */}
      <div style={{ position: 'absolute', top: '68px', left: 0, width: '393px', height: '510px' }}>
        <img src={siteImages.heroBanner1 || siteImages.heroBanner2 || defaultImages.heroBanner1} alt="Hero Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* SHOP BY CLUB JERSEYS */}
      <p style={{ position: 'absolute', top: '597px', left: '19px', fontFamily: 'Karla', fontSize: '22.68px', color: '#000000' }}>
        SHOP BY
      </p>
      <p style={{ position: 'absolute', top: '624px', left: '19px', fontFamily: 'Inter', fontWeight: 600, fontSize: '22.68px', color: '#000000' }}>
        CLUB JERSEYS
      </p>

      {/* Club Crest Badges Grid */}
      <div style={{ position: 'absolute', top: '673px', left: '19px', width: '356px', height: '166px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <img onClick={() => onSelectTeam && onSelectTeam('Barcelona')} src={imgEllipse12} alt="Barcelona" style={{ width: '70px', height: '70px', cursor: 'pointer' }} />
          <img onClick={() => onSelectTeam && onSelectTeam('Real Madrid')} src={imgEllipse16} alt="Real Madrid" style={{ width: '70px', height: '70px', cursor: 'pointer' }} />
          <img onClick={() => onSelectTeam && onSelectTeam('Man City')} src={imgEllipse17} alt="Man City" style={{ width: '70px', height: '70px', cursor: 'pointer' }} />
          <img onClick={() => onSelectTeam && onSelectTeam('Liverpool')} src={imgEllipse13} alt="Liverpool" style={{ width: '70px', height: '70px', cursor: 'pointer' }} />

          <img onClick={() => onSelectTeam && onSelectTeam('AC Milan')} src={imgEllipse18} alt="AC Milan" style={{ width: '70px', height: '70px', cursor: 'pointer' }} />
          <img onClick={() => onSelectTeam && onSelectTeam('Bayern Munich')} src={imgEllipse14} alt="Bayern Munich" style={{ width: '70px', height: '70px', cursor: 'pointer' }} />
          <img onClick={() => onSelectTeam && onSelectTeam('Man United')} src={imgEllipse15} alt="Man United" style={{ width: '70px', height: '70px', cursor: 'pointer' }} />
          <img onClick={() => onSelectTeam && onSelectTeam('Juventus')} src={imgEllipse19} alt="Juventus" style={{ width: '70px', height: '70px', cursor: 'pointer' }} />
        </div>
      </div>

      {/* WEAR YOUR IDENTITY Banner */}
      <div style={{ position: 'absolute', top: '864px', left: 0, width: '393px', height: '162px' }}>
        <img src={siteImages.wearYourIdentity || defaultImages.wearYourIdentity} alt="Wear Your Identity" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* NOT BASIC Spotlight Banner */}
      <div style={{ position: 'absolute', top: '1038px', left: 0, width: '393px', height: '510px' }}>
        <img src={siteImages.notBasicSpotlight || defaultImages.notBasicSpotlight} alt="Not Basic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Merchandising Section */}
      <div style={{ position: 'absolute', top: '1532px', left: 0, width: '393px', height: '2565px', padding: '0 19px' }}>
        {/* Curated for the season */}
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontFamily: 'Karla', fontWeight: 600, fontSize: '25px', color: '#111111', marginBottom: '16px' }}>
            Curated for the season
          </h2>
          <div style={{ marginBottom: '16px', borderRadius: '2px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
            <img src={siteImages.curatedSeasonPkg || defaultImages.curatedSeasonPkg} alt="Premium Packaging" style={{ width: '100%', height: '333px', objectFit: 'cover' }} />
          </div>
          <div style={{ background: '#F5F5F5', borderRadius: '2px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <img src={siteImages.qualityYouCanWear || defaultImages.qualityYouCanWear} alt="Quality you can wear" style={{ width: '100%', height: '131px', objectFit: 'cover' }} />
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
            <img src={siteImages.retroBanner1 || defaultImages.retroBanner1} alt="Retro 1" style={{ width: '168px', height: '360px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #E5E7EB' }} />
            <img src={siteImages.retroBanner2 || defaultImages.retroBanner2} alt="Retro 2" style={{ width: '168px', height: '360px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #E5E7EB' }} />
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
              <img src={siteImages.lifestyleClubs || defaultImages.lifestyleClubs} alt="Clubs" style={{ width: '207px', height: '166px', objectFit: 'cover' }} />
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
              <img src={siteImages.lifestyleNationals || defaultImages.lifestyleNationals} alt="Nationals" style={{ width: '136px', height: '166px', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        {/* Product Catalog Grid (10 Jerseys) */}
        <div style={{ marginTop: '60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {figmaJerseys.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelectProduct(item)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ width: '166px', height: '210px', background: '#F3F2EF', borderRadius: '2px', overflow: 'hidden' }}>
                  <img src={item.imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

          <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '28px' }}>
            <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#737373', marginBottom: '16px' }}>
              You’ve seen all 10 jerseys
            </p>
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
        <button onClick={onOpenCart} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <img src={imgShoppingCart} alt="Bag" style={{ width: '20px', height: '20px' }} />
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
