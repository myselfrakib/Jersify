import React from 'react';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onOpenCart, onOpenAuth, cartCount }) {
  return (
    <nav className="bottom-nav">
      <button 
        className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      <button 
        className={`bottom-nav-item ${activeTab === 'shop' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('shop');
          const shopElem = document.getElementById('shop-section');
          if (shopElem) shopElem.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <ShoppingBag size={20} />
        <span>Shop</span>
      </button>

      <button 
        className={`bottom-nav-item ${activeTab === 'bag' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('bag');
          onOpenCart();
        }}
        style={{ position: 'relative' }}
      >
        <ShoppingCart size={20} />
        {cartCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '25%',
            background: '#111827',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: 'bold',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {cartCount}
          </span>
        )}
        <span>Bag</span>
      </button>

      <button 
        className={`bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('profile');
          onOpenAuth();
        }}
      >
        <User size={20} />
        <span>Profile</span>
      </button>
    </nav>
  );
}
