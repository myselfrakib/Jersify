import React, { useState, useEffect } from 'react';
import FigmaExactView from './components/FigmaExactView';
import FigmaShopPage from './components/FigmaShopPage';
import FigmaProductPage from './components/FigmaProductPage';
import FigmaProfilePage from './components/FigmaProfilePage';
import FigmaOrdersPage from './components/FigmaOrdersPage';
import FigmaSavedAddressesPage from './components/FigmaSavedAddressesPage';
import FigmaTeamPage from './components/FigmaTeamPage';
import FigmaLoginPage from './components/FigmaLoginPage';
import FigmaSignupPage from './components/FigmaSignupPage';
import FigmaCheckoutPage from './components/FigmaCheckoutPage';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/AdminDashboard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import WishlistDrawer from './components/WishlistDrawer';

import { INITIAL_PRODUCTS } from './data/initialProducts';
import { auth, onAuthStateChanged, db, collection, getDocs } from './firebase';

export default function App() {
  // Page Navigation State: 'home' | 'shop' | 'product' | 'profile' | 'orders' | 'addresses' | 'team' | 'login' | 'signup' | 'checkout' | 'admin-login' | 'admin-dashboard'
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('Barcelona');
  const [adminData, setAdminData] = useState(null);

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('jersify_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('jersify_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  const [toasts, setToasts] = useState([]);

  // Centralized Navigation with URL Hash Deep Linking
  const navigateTo = (page, param = null, options = {}) => {
    let targetHash = `#${page}`;
    if (page === 'product' && param) {
      const prodId = typeof param === 'object' ? param.id : param;
      targetHash = `#product/${prodId}`;
      if (typeof param === 'object') {
        setSelectedProduct(param);
        try {
          sessionStorage.setItem('jersify_active_product', JSON.stringify(param));
        } catch (e) {}
      }
    } else if (page === 'team' && param) {
      targetHash = `#team/${encodeURIComponent(param)}`;
      setSelectedTeam(param);
      try {
        sessionStorage.setItem('jersify_active_team', param);
      } catch (e) {}
    }

    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
    setCurrentPage(page);

    if (options.scrollToTop !== false) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Synchronize route with URL hash & handle Refresh / Deep Linking
  useEffect(() => {
    const handleRouteFromHash = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '');
      if (!rawHash || rawHash === 'home') {
        setCurrentPage('home');
        return;
      }

      if (rawHash.startsWith('product/')) {
        const prodId = rawHash.replace('product/', '');
        setCurrentPage('product');
        try {
          const cachedProductStr = sessionStorage.getItem('jersify_active_product');
          if (cachedProductStr) {
            const cachedProduct = JSON.parse(cachedProductStr);
            if (cachedProduct?.id === prodId) {
              setSelectedProduct(cachedProduct);
              return;
            }
          }
          const cachedProds = sessionStorage.getItem('jersify_products');
          const list = cachedProds ? JSON.parse(cachedProds) : INITIAL_PRODUCTS;
          const found = list.find((p) => p.id === prodId);
          if (found) {
            setSelectedProduct(found);
          } else {
            setSelectedProduct({
              id: prodId,
              name: prodId.toUpperCase().replace(/-/g, ' '),
              price: 750,
              type: 'Fan version · S–XXL'
            });
          }
        } catch (e) {
          setSelectedProduct({
            id: prodId,
            name: prodId.toUpperCase().replace(/-/g, ' '),
            price: 750,
            type: 'Fan version · S–XXL'
          });
        }
        return;
      }

      if (rawHash.startsWith('team/')) {
        const teamName = decodeURIComponent(rawHash.replace('team/', ''));
        setSelectedTeam(teamName);
        setCurrentPage('team');
        return;
      }

      const validPages = [
        'shop', 'profile', 'orders', 'addresses', 'login', 'signup',
        'checkout', 'admin-login', 'admin-dashboard'
      ];

      if (validPages.includes(rawHash)) {
        setCurrentPage(rawHash);
      } else {
        setCurrentPage('home');
      }
    };

    handleRouteFromHash();
    window.addEventListener('hashchange', handleRouteFromHash);
    return () => window.removeEventListener('hashchange', handleRouteFromHash);
  }, []);

  // Save scroll position per route & restore on refresh / navigation
  useEffect(() => {
    const handleScroll = () => {
      const currentRoute = window.location.hash || '#home';
      sessionStorage.setItem(`scroll_${currentRoute}`, window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const currentRoute = window.location.hash || '#home';
    const savedY = sessionStorage.getItem(`scroll_${currentRoute}`);
    if (savedY !== null) {
      const scrollPos = parseInt(savedY, 10);
      if (scrollPos > 0) {
        setTimeout(() => {
          window.scrollTo({ top: scrollPos, behavior: 'auto' });
        }, 80);
      }
    }
  }, [currentPage, selectedProduct?.id, selectedTeam]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('jersify_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('jersify_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleAddToCart = (productToAdd) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.id === productToAdd.id &&
          item.selectedSize === productToAdd.selectedSize &&
          item.customName === productToAdd.customName &&
          item.customNumber === productToAdd.customNumber
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += productToAdd.quantity || 1;
        return updated;
      }
      return [...prev, productToAdd];
    });
    showToast(`Added ${productToAdd.name} to Bag!`);
  };

  const handleUpdateQty = (index, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    showToast('Item removed from bag');
  };

  const handleToggleWishlist = (product) => {
    const isSaved = wishlist.some((item) => item.id === product.id);
    if (isSaved) {
      setWishlist((prev) => [...prev].filter((item) => item.id !== product.id));
      showToast('Removed from wishlist');
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast('Saved to wishlist ❤️');
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* FIGMA MOBILE PAGES ROUTER */}
      {currentPage === 'home' && (
        <FigmaExactView
          cartCount={cartCount}
          onSelectProduct={(p) => navigateTo('product', p)}
          onSelectTeam={(t) => navigateTo('team', t)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => navigateTo(user ? 'profile' : 'login')}
          onNavigateShop={() => navigateTo('shop')}
        />
      )}

      {currentPage === 'shop' && (
        <FigmaShopPage
          cartCount={cartCount}
          onSelectProduct={(p) => navigateTo('product', p)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => navigateTo(user ? 'profile' : 'login')}
          onNavigateHome={() => navigateTo('home')}
        />
      )}

      {currentPage === 'product' && (
        <FigmaProductPage
          product={selectedProduct}
          cartItems={cartItems}
          cartCount={cartCount}
          onBack={() => navigateTo('shop')}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onSelectProduct={(p) => navigateTo('product', p)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => navigateTo(user ? 'profile' : 'login')}
          onNavigateHome={() => navigateTo('home')}
        />
      )}

      {currentPage === 'profile' && (
        <FigmaProfilePage
          user={user}
          onSignOut={async () => {
            if (user) {
              await auth.signOut();
              setUser(null);
            }
            navigateTo('login');
          }}
          onOpenLogin={() => navigateTo('login')}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenOrders={() => navigateTo('orders')}
          onOpenAddresses={() => navigateTo('addresses')}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onNavigateHome={() => navigateTo('home')}
          onNavigateShop={() => navigateTo('shop')}
        />
      )}

      {currentPage === 'orders' && (
        <FigmaOrdersPage
          user={user}
          onBack={() => navigateTo('profile')}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigateHome={() => navigateTo('home')}
          onNavigateShop={() => navigateTo('shop')}
        />
      )}

      {currentPage === 'addresses' && (
        <FigmaSavedAddressesPage
          onBack={() => navigateTo('profile')}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigateHome={() => navigateTo('home')}
          onNavigateShop={() => navigateTo('shop')}
        />
      )}

      {currentPage === 'team' && (
        <FigmaTeamPage
          teamName={selectedTeam}
          onBack={() => navigateTo('home')}
          onSelectProduct={(p) => navigateTo('product', p)}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigateHome={() => navigateTo('home')}
          onNavigateShop={() => navigateTo('shop')}
        />
      )}

      {currentPage === 'login' && (
        <FigmaLoginPage
          user={user}
          onBack={() => navigateTo('profile')}
          onUserChanged={(u) => setUser(u)}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigateHome={() => navigateTo('home')}
          onNavigateShop={() => navigateTo('shop')}
          onNavigateSignup={() => navigateTo('signup')}
          onOpenAdminLogin={() => navigateTo('admin-login')}
        />
      )}

      {currentPage === 'signup' && (
        <FigmaSignupPage
          user={user}
          onBack={() => navigateTo('profile')}
          onUserChanged={(u) => setUser(u)}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigateHome={() => navigateTo('home')}
          onNavigateShop={() => navigateTo('shop')}
          onNavigateLogin={() => navigateTo('login')}
        />
      )}

      {currentPage === 'admin-login' && (
        <AdminLoginPage
          onBack={() => navigateTo('login')}
          onAdminAuthenticated={(authUser, valData) => {
            setAdminData(valData);
            navigateTo('admin-dashboard');
          }}
        />
      )}

      {currentPage === 'admin-dashboard' && (
        <AdminDashboard
          adminUser={user}
          adminData={adminData}
          onSignOut={() => {
            setAdminData(null);
            navigateTo('admin-login');
          }}
          onNavigateHome={() => navigateTo('home')}
        />
      )}

      {currentPage === 'checkout' && (
        <FigmaCheckoutPage
          user={user}
          cartItems={cartItems}
          checkoutData={checkoutData}
          onBack={() => navigateTo('home')}
          onOrderSuccess={() => {
            setCartItems([]);
            localStorage.removeItem('jersify_cart');
            showToast('Order confirmed! 🎉');
          }}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigateHome={() => navigateTo('home')}
          onNavigateShop={() => navigateTo('shop')}
        />
      )}

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveCartItem}
        user={user}
        onRequireLogin={() => {
          showToast('Please log in to proceed to checkout!');
          navigateTo('login');
        }}
        onProceedToCheckout={(data) => {
          if (!user) {
            showToast('Please log in to proceed to checkout!');
            navigateTo('login');
            return;
          }
          setCheckoutData(data);
          navigateTo('checkout');
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlist}
        onRemoveWishlist={handleToggleWishlist}
        onQuickAdd={(p) => handleAddToCart({ ...p, selectedSize: 'M', quantity: 1 })}
        onSelectProduct={(p) => {
          navigateTo('product', p);
          setIsWishlistOpen(false);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        checkoutData={checkoutData}
        user={user}
        onOrderSuccess={() => {
          setCartItems([]);
          localStorage.removeItem('jersify_cart');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onUserChanged={(u) => setUser(u)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUserChanged={(u) => setUser(u)}
      />
    </div>
  );
}
