import React, { useState } from 'react';
import { X, Trash2, ArrowRight, Tag, ShoppingBag } from 'lucide-react';
import ImageWithSpinner from './ImageWithSpinner';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  onProceedToCheckout,
  user,
  onRequireLogin
}) {
  if (!isOpen) return null;

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const validCoupons = {
    'JERSIFY100': { type: 'flat', value: 100, desc: '₹100 OFF' },
    'PORTU': { type: 'flat', value: 100, desc: '₹100 OFF' },
    'DHRUBOTARA50': { type: 'flat', value: 50, desc: '₹50 OFF' },
    'JERSIFY99': { type: 'percent', value: 20, desc: '20% OFF' }
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (validCoupons[code]) {
      setAppliedCoupon({ code, ...validCoupons[code] });
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'flat') {
      discount = appliedCoupon.value;
    } else if (appliedCoupon.type === 'percent') {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
    }
  }

  const shipping = subtotal > 1999 || cartItems.length === 0 ? 0 : 69;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} />
            <h2 className="drawer-title">YOUR BAG ({cartItems.reduce((a, b) => a + b.quantity, 0)})</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <ShoppingBag size={32} color="#9CA3AF" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                Your bag is empty
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.5rem' }}>
                Explore our official football kits and add your favorites.
              </p>
              <button className="btn btn-primary" onClick={onClose}>
                Explore Shop
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {cartItems.map((item, idx) => {
                let itemImg = item.imgUrl || item.imageUrl || item.img || item.image || item.selectedImage;
                if (!itemImg && item.images) {
                  if (typeof item.images === 'string') itemImg = item.images;
                  else if (Array.isArray(item.images)) itemImg = item.images[0];
                  else if (typeof item.images === 'object') itemImg = Object.values(item.images)[0];
                }
                return (
                  <div key={idx} className="cart-item">
                    <ImageWithSpinner 
                      src={itemImg} 
                      alt={item.name} 
                      className="cart-item-img" 
                      style={{ width: '76px', height: '95px', flexShrink: 0, borderRadius: 'var(--radius-sm, 6px)' }}
                    />
                    
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-meta">
                        Size: <strong>{item.selectedSize || 'M'}</strong> | ₹{item.price}
                      </p>

                      {(item.customName || item.customNumber) && (
                        <span style={{ fontSize: '0.72rem', background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', marginBottom: '0.4rem', fontWeight: 700 }}>
                          PRINT: {item.customName} #{item.customNumber}
                        </span>
                      )}

                      <div className="cart-qty-row">
                        <div className="qty-control">
                          <button className="qty-btn" onClick={() => onUpdateQty(idx, item.quantity - 1)}>-</button>
                          <span className="qty-val">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => onUpdateQty(idx, item.quantity + 1)}>+</button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 800, fontSize: '0.95rem' }}>
                            ₹{item.price * item.quantity}
                          </span>
                          <button 
                            onClick={() => onRemoveItem(idx)}
                            style={{ color: '#9CA3AF', transition: 'color 0.2s ease' }}
                            onMouseOver={(e) => e.target.style.color = '#EF4444'}
                            onMouseOut={(e) => e.target.style.color = '#9CA3AF'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            {/* Promo Code Input */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flexGrow: 1 }}>
                  <input
                    type="text"
                    placeholder="Coupon (e.g. PORTU)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                      fontSize: '0.82rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      textTransform: 'uppercase'
                    }}
                  />
                  <Tag size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                </div>
                <button 
                  onClick={handleApplyCoupon}
                  className="btn btn-accent"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <p style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>
                  ✓ Code {appliedCoupon.code} applied ({appliedCoupon.desc})
                </p>
              )}
              {couponError && (
                <p style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600, marginTop: '4px' }}>
                  {couponError}
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981', fontWeight: 700 }}>
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                <span>Shipping</span>
                <span>{shipping === 0 ? <strong style={{ color: '#10B981' }}>FREE</strong> : `₹${shipping}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.1rem', color: '#111827', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                <span>TOTAL</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', height: '48px', fontSize: '0.9rem' }}
              onClick={() => {
                onClose();
                if (!user) {
                  if (onRequireLogin) onRequireLogin();
                  return;
                }
                onProceedToCheckout({ cartItems, subtotal, discount, shipping, total, appliedCoupon });
              }}
            >
              Checkout <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
