import React from 'react';

import { 
  imgHome, 
  imgShoppingBag, 
  imgUser, 
  imgSearchIcon, 
  imgShoppingCart 
} from '../assets/svgIcons';

const imgJersifyLogo = "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de";
const imgAccountButton = imgUser;
const imgShoppingBagButton = imgShoppingBag;

export default function FigmaShopPage({ onSelectProduct, onOpenCart, onOpenAuth, onNavigateHome }) {
  const shopJerseys = [
    {
      id: "shop-1",
      name: "BARCELONA HOME 26/27",
      type: "Concept · Fan version",
      price: 750,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de",
      team: "Barcelona"
    },
    {
      id: "shop-2",
      name: "BARCELONA AWAY 26/27",
      type: "Concept · Fan version",
      price: 750,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790334116027_pfan_0_IMG_3915.png?alt=media&token=8c2058d5-2b95-4926-8960-1b2ce77d29eb",
      team: "Barcelona"
    },
    {
      id: "shop-3",
      name: "BARCELONA HOME 24/25",
      type: "Fan version · S–XXL",
      price: 650,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030635314_1_IMG_6074.jpeg?alt=media&token=f8e8d995-63d7-4c57-aef4-948d93e6533d",
      team: "Barcelona"
    },
    {
      id: "shop-4",
      name: "BARCELONA AWAY 24/25",
      type: "Fan version · S–XXL",
      price: 650,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030642038_2_IMG_6072.jpeg?alt=media&token=d0ba389d-4214-44ec-b2b3-c0dbdb548678",
      team: "Barcelona"
    },
    {
      id: "shop-5",
      name: "BARCELONA HOME 23/24",
      type: "Fan version · S–XXL",
      price: 650,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030648696_3_IMG_6073.jpeg?alt=media&token=90f31fe5-1bb0-4522-aada-9db03fbcfab8",
      team: "Barcelona"
    },
    {
      id: "shop-6",
      name: "BARCELONA AWAY 23/24",
      type: "Fan version · S–XL",
      price: 650,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030675022_4_IMG_6071.jpeg?alt=media&token=ab978713-fa93-4b20-a8f2-a69b2f5c6aaf",
      team: "Barcelona"
    },
    {
      id: "shop-7",
      name: "BARCELONA HOME 08/09",
      type: "Retro · S–XXL",
      price: 899,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1777010842917_0_IMG_3702.jpeg?alt=media&token=1797da70-902b-42e8-9682-7feb6c89d4ef",
      team: "Barcelona"
    },
    {
      id: "shop-8",
      name: "BARCELONA HOME 14/15",
      type: "Retro · S–XXL",
      price: 899,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1777324422299_0_IMG_4061.jpeg?alt=media&token=f94be5a7-75e9-486d-bf07-92135cb38132",
      team: "Barcelona"
    },
    {
      id: "shop-9",
      name: "BARCELONA THIRD 24/25",
      type: "Fan version · S–XL",
      price: 700,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1777348522170_0_IMG_4080.jpeg?alt=media&token=86b339ae-0b9b-41e0-b926-fe7a4fccecc8",
      team: "Barcelona"
    },
    {
      id: "shop-10",
      name: "BARCELONA TRAINING",
      type: "Training jersey · S–XXL",
      price: 650,
      imgUrl: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1778510513151_0_IMG_5263.jpeg?alt=media&token=17bad7fd-0018-4016-9fa2-5aedc6c3d09d",
      team: "Barcelona"
    }
  ];

  return (
    <div style={{ width: '100%', maxWidth: '393px', margin: '0 auto', background: '#FFFFFF', position: 'relative', overflowX: 'hidden', minHeight: '1604px', paddingBottom: '60px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      {/* Store Navigation Header */}
      <div style={{ borderBottom: '1px solid #E5E7EB', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px' }}>
        <div style={{ width: '116px', height: '43px', cursor: 'pointer' }} onClick={onNavigateHome}>
          <img src={imgJersifyLogo} alt="Jersify" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
      <div style={{ padding: '20px 24px 18px', borderBottom: '1px solid #E5E7EB' }}>
        <h1 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '28px', color: '#111111', lineHeight: '32px' }}>
          Shop
        </h1>
      </div>

      {/* Product Listing Grid */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {shopJerseys.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelectProduct(item)}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <div style={{ width: '166.5px', height: '210px', background: '#F3F2EF', borderRadius: '2px', overflow: 'hidden' }}>
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
