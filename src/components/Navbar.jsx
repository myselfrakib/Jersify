import React, { useState } from 'react';
import { ShoppingBag, Heart, User, Search, X, SlidersHorizontal } from 'lucide-react';

export default function Navbar({ 
  cartCount, 
  wishlistCount, 
  onOpenCart, 
  onOpenWishlist, 
  onOpenAuth, 
  user, 
  searchQuery, 
  setSearchQuery,
  activeCategory,
  setActiveCategory
}) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="navbar">
      {/* Top Announcement Bar */}
      <div className="announcement-bar">
        <span>⚡ EXPRESS NATIONWIDE SHIPPING</span>
        <span className="accent">• FREE SHIPPING ON ORDERS OVER ₹1999</span>
        <span>• 100% AUTHENTIC QUALITY</span>
      </div>

      <div className="container">
        <div className="navbar-inner">
          {/* Logo Group */}
          <a href="#" className="logo-group" onClick={(e) => { e.preventDefault(); setActiveCategory('all'); setSearchQuery(''); }}>
            <span className="logo-title">JERSIFY</span>
            <span className="logo-tag">GAME</span>
          </a>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            <li>
              <button 
                className={`nav-link ${activeCategory === 'all' && !searchQuery ? 'active' : ''}`}
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              >
                Home
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeCategory === 'club-kits' ? 'active' : ''}`}
                onClick={() => { setActiveCategory('club-kits'); setSearchQuery(''); }}
              >
                Club Kits
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeCategory === 'national-kits' ? 'active' : ''}`}
                onClick={() => { setActiveCategory('national-kits'); setSearchQuery(''); }}
              >
                National Kits
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeCategory === 'retro' ? 'active' : ''}`}
                onClick={() => { setActiveCategory('retro'); setSearchQuery(''); }}
              >
                Retro Kits
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeCategory === 'player-version' ? 'active' : ''}`}
                onClick={() => { setActiveCategory('player-version'); setSearchQuery(''); }}
              >
                Player Version
              </button>
            </li>
          </ul>

          {/* Search Bar & Actions */}
          <div className="nav-actions">
            {/* Search Input Desktop */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search jerseys, teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.45rem 1rem 0.45rem 2.2rem',
                  fontSize: '0.85rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)',
                  outline: 'none',
                  width: '180px',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.target.style.width = '240px'}
                onBlur={(e) => { if (!searchQuery) e.target.style.width = '180px'; }}
              />
              <Search 
                size={16} 
                style={{ position: 'absolute', left: '10px', color: '#9CA3AF', pointerEvents: 'none' }} 
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', color: '#9CA3AF' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Wishlist Button */}
            <button 
              className="icon-btn" 
              onClick={onOpenWishlist}
              title="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
            </button>

            {/* Cart Button */}
            <button 
              className="icon-btn" 
              onClick={onOpenCart}
              title="Shopping Bag"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </button>

            {/* User Profile / Auth Button */}
            <button 
              className="icon-btn" 
              onClick={onOpenAuth}
              title={user ? user.displayName || user.email : "Account Login"}
              style={{
                background: user ? '#111827' : 'transparent',
                color: user ? '#FFFFFF' : '#111827'
              }}
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
