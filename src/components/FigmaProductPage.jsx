import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const imgSlide1 = "http://localhost:3845/assets/f43a4e3b049382f36975b7b65e8e9cbd3e4c9715.png";
const imgImg44493 = "http://localhost:3845/assets/3d9c63e439c097fd35375eee418847add198ba5e.png";
const imgHome = "http://localhost:3845/assets/770d6e8de263da4c03f4e35592767143b42b118e.svg";
const imgShoppingBag = "http://localhost:3845/assets/1eecf7ef8412c1f7eff5133baff9c8d9a3e03da6.svg";
const imgShoppingCart = "http://localhost:3845/assets/4aab5a9f06367897d9c75fe4f12fa26a336c118e.svg";
const imgUser = "http://localhost:3845/assets/2cca44153aa7147baae8f4ea673f094d77907545.svg";

export default function FigmaProductPage({ 
  product, 
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

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const recProducts = [
    {
      id: "rec-1",
      name: "BARCELONA HOME 26/27",
      price: 750,
      type: "Concept · Fan version",
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
      customName,
      customNumber,
      quantity: 1
    });
  };

  return (
    <div style={{ width: '100%', maxWidth: '393px', margin: '0 auto', background: '#FFFFFF', position: 'relative', overflowX: 'hidden', minHeight: '1600px', paddingBottom: '60px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      {/* Top Header Logo & Back Action */}
      <div style={{ position: 'absolute', top: '24px', left: '10px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 20 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={16} />
          </button>
        )}
        <div style={{ width: '128px', height: '47px', cursor: 'pointer' }} onClick={onNavigateHome}>
          <img src={imgImg44493} alt="Jersify" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Hero Product Carousel Image */}
      <div style={{ position: 'relative', top: '70px', width: '393px', height: '568px', background: '#F3F2EF' }}>
        <img 
          src={currentProduct.imgUrl || imgSlide1} 
          alt={currentProduct.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        
        {/* Carousel Slide Indicators */}
        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
          {[0, 1, 2, 3].map((idx) => (
            <div 
              key={idx}
              onClick={() => setActiveSlide(idx)}
              style={{
                width: '20px',
                height: '4px',
                background: idx === activeSlide ? '#000000' : '#D1D5DB',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* Product Information Container */}
      <div style={{ padding: '24px', paddingTop: '80px' }}>
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

        {/* Custom Jersey Name & Number Printing */}
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px', padding: '12px', marginBottom: '20px' }}>
          <label style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '12px', color: '#111827', display: 'block', marginBottom: '6px' }}>
            CUSTOM PRINTING (NAME & NUMBER)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="NAME (e.g. MESSI)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value.toUpperCase())}
              maxLength={12}
              style={{ flex: 2, padding: '6px 10px', fontSize: '12px', border: '1px solid #E5E7EB', borderRadius: '2px', outline: 'none' }}
            />
            <input
              type="number"
              placeholder="NO. (10)"
              value={customNumber}
              onChange={(e) => setCustomNumber(e.target.value)}
              maxLength={3}
              style={{ flex: 1, padding: '6px 10px', fontSize: '12px', border: '1px solid #E5E7EB', borderRadius: '2px', outline: 'none' }}
            />
          </div>
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
                <div style={{ width: '166px', height: '210px', background: '#D9D9D9', borderRadius: '2px', overflow: 'hidden' }}>
                  <img src={rec.imgUrl} alt={rec.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
