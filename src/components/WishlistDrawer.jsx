import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

export default function WishlistDrawer({ 
  isOpen, 
  onClose, 
  wishlistItems, 
  onRemoveWishlist, 
  onQuickAdd,
  onSelectProduct
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} fill="#EF4444" color="#EF4444" />
            <h2 className="drawer-title">YOUR WISHLIST ({wishlistItems.length})</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {wishlistItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Heart size={32} color="#EF4444" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                Your wishlist is empty
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.5rem' }}>
                Tap the heart icon on any jersey to save it for later.
              </p>
              <button className="btn btn-primary" onClick={onClose}>
                Browse Jerseys
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {wishlistItems.map((item) => (
                <div key={item.id} className="cart-item" style={{ cursor: 'pointer' }} onClick={() => { onClose(); onSelectProduct(item); }}>
                  <img src={item.imgUrl || item.images?.[0]} alt={item.name} className="cart-item-img" />
                  
                  <div className="cart-item-info">
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-accent)' }}>{item.team}</span>
                    <h4 className="cart-item-name">{item.name}</h4>
                    <p className="cart-item-meta">₹{item.price}</p>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }} onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="btn btn-primary"
                        onClick={() => onQuickAdd(item)}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', height: '32px' }}
                      >
                        <ShoppingBag size={14} /> Add to Bag
                      </button>

                      <button 
                        onClick={() => onRemoveWishlist(item)}
                        style={{ color: '#9CA3AF', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
