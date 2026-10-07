import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageWithSpinner from './ImageWithSpinner';

export default function ProductModal({ 
  product, 
  cartItems = [],
  onClose, 
  onAddToCart,
  onUpdateQty,
  isWishlisted, 
  onToggleWishlist 
}) {
  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [product.imgUrl];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const selectedImage = images[activeImageIndex] || images[0];
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);


  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const cartIndex = Array.isArray(cartItems)
    ? cartItems.findIndex(item => String(item.id) === String(product.id) && item.selectedSize === selectedSize)
    : -1;
  const existingInCart = cartIndex > -1 ? cartItems[cartIndex] : null;

  const handleAdd = () => {
    onAddToCart({
      ...product,
      selectedSize,
      quantity
    });
    onClose();
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', width: '95%' }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(4px)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          padding: '1.5rem'
        }}>
          {/* Left Column: Gallery */}
          <div>
            <div style={{
              width: '100%',
              paddingTop: '110%',
              position: 'relative',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              background: '#F3F2EF',
              marginBottom: '1rem'
            }}>
              <ImageWithSpinner 
                src={selectedImage} 
                alt={product.name}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }} 
              />

              {/* Prev Image Arrow */}
              {images.length > 1 && (
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                  aria-label="Previous Image"
                >
                  <ChevronLeft size={18} color="#111111" />
                </button>
              )}

              {/* Next Image Arrow */}
              {images.length > 1 && (
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                  aria-label="Next Image"
                >
                  <ChevronRight size={18} color="#111111" />
                </button>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                {images.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: activeImageIndex === idx ? '2px solid #111827' : '1px solid var(--color-border)',
                      opacity: activeImageIndex === idx ? 1 : 0.7,
                      flexShrink: 0
                    }}
                  >
                    <ImageWithSpinner src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* Right Column: Product Details & Controls */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {product.team}
            </span>
            <h2 style={{ fontFamily: 'var(--font-inter)', fontWeight: 800, fontSize: '1.5rem', color: '#111827', margin: '0.25rem 0 0.5rem' }}>
              {product.name}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 900, fontSize: '1.6rem', color: '#111827' }}>
                ₹{product.price}
              </span>
              <span style={{ fontSize: '0.8rem', background: '#F3F4F6', color: '#4B5563', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                {product.type || 'Fan Version'}
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {product.description}
            </p>

            {/* Size Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>SELECT SIZE</label>
                <span style={{ fontSize: '0.8rem', color: '#6B7280', textDecoration: 'underline', cursor: 'pointer' }}>Size Guide</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      width: '46px',
                      height: '42px',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedSize === size ? '2px solid #111827' : '1px solid var(--color-border)',
                      background: selectedSize === size ? '#111827' : '#FFFFFF',
                      color: selectedSize === size ? '#FFFFFF' : '#111827',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

                {/* Quantity Selector & Action Buttons */}

            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
              <div className="qty-control" style={{ height: '48px' }}>
                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="qty-val" style={{ minWidth: '32px', textAlign: 'center' }}>{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              {existingInCart && existingInCart.quantity > 0 ? (
                <div style={{
                  flexGrow: 1,
                  height: '48px',
                  background: '#000000',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 10px'
                }}>
                  <button
                    type="button"
                    onClick={() => onUpdateQty && onUpdateQty(cartIndex, existingInCart.quantity - 1)}
                    style={{
                      background: 'transparent',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '22px',
                      fontWeight: 700,
                      width: '36px',
                      height: '100%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Decrease quantity"
                  >
                    −
                  </button>
                  <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>IN BAG:</span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, background: '#222222', padding: '1px 8px', borderRadius: '4px' }}>
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
                      fontSize: '22px',
                      fontWeight: 700,
                      width: '36px',
                      height: '100%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Increase quantity"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={handleAdd}
                  style={{ flexGrow: 1, height: '48px' }}
                >
                  <ShoppingBag size={18} /> Add To Bag
                </button>
              )}

              <button 
                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={() => onToggleWishlist(product)}
                style={{ position: 'relative', top: 0, right: 0, width: '48px', height: '48px', border: '1px solid var(--color-border)' }}
              >
                <Heart size={20} fill={isWishlisted ? "#EF4444" : "none"} color={isWishlisted ? "#EF4444" : "#111827"} />
              </button>
            </div>

            {/* Product Guarantees */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', fontSize: '0.78rem', color: '#6B7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={16} color="#10B981" /> 100% Authentic
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Truck size={16} color="#3B82F6" /> Fast Delivery
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RefreshCw size={16} color="#8B5CF6" /> Easy Exchange
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
