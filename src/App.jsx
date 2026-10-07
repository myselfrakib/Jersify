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
          onSelectProduct={(p) => {
            setSelectedProduct(p);
            setCurrentPage('product');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectTeam={(t) => {
            setSelectedTeam(t);
            setCurrentPage('team');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => {
            setCurrentPage(user ? 'profile' : 'login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateShop={() => {
            setCurrentPage('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'shop' && (
        <FigmaShopPage
          onSelectProduct={(p) => {
            setSelectedProduct(p);
            setCurrentPage('product');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => {
            setCurrentPage(user ? 'profile' : 'login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateHome={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'product' && (
        <FigmaProductPage
          product={selectedProduct}
          allProducts={products}
          onBack={() => setCurrentPage('shop')}
          onAddToCart={handleAddToCart}
          onSelectProduct={(p) => {
            setSelectedProduct(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => {
            setCurrentPage(user ? 'profile' : 'login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateHome={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
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
            setCurrentPage('login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenLogin={() => {
            setCurrentPage('login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenOrders={() => {
            setCurrentPage('orders');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAddresses={() => {
            setCurrentPage('addresses');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onNavigateHome={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateShop={() => {
            setCurrentPage('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'orders' && (
        <FigmaOrdersPage
          user={user}
          onBack={() => {
            setCurrentPage('profile');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigateHome={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateShop={() => {
            setCurrentPage('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'addresses' && (
        <FigmaSavedAddressesPage
          onBack={() => {
            setCurrentPage('profile');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigateHome={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateShop={() => {
            setCurrentPage('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'team' && (
        <FigmaTeamPage
          teamName={selectedTeam}
          onBack={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectProduct={(p) => {
            setSelectedProduct(p);
            setCurrentPage('product');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigateHome={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateShop={() => {
            setCurrentPage('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'login' && (
        <FigmaLoginPage
          user={user}
          onBack={() => {
            setCurrentPage('profile');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onUserChanged={(u) => setUser(u)}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigateHome={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateShop={() => {
            setCurrentPage('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateSignup={() => {
            setCurrentPage('signup');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAdminLogin={() => {
            setCurrentPage('admin-login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'signup' && (
        <FigmaSignupPage
          user={user}
          onBack={() => {
            setCurrentPage('profile');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onUserChanged={(u) => setUser(u)}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigateHome={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateShop={() => {
            setCurrentPage('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateLogin={() => {
            setCurrentPage('login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'admin-login' && (
        <AdminLoginPage
          onBack={() => {
            setCurrentPage('login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onAdminAuthenticated={(authUser, valData) => {
            setAdminData(valData);
            setCurrentPage('admin-dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'admin-dashboard' && (
        <AdminDashboard
          adminUser={user}
          adminData={adminData}
          onSignOut={() => {
            setAdminData(null);
            setCurrentPage('admin-login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateHome={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'checkout' && (
        <FigmaCheckoutPage
          user={user}
          cartItems={cartItems}
          checkoutData={checkoutData}
          onBack={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOrderSuccess={() => {
            setCartItems([]);
            localStorage.removeItem('jersify_cart');
            showToast('Order confirmed! 🎉');
          }}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigateHome={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateShop={() => {
            setCurrentPage('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
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
          setCurrentPage('login');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onProceedToCheckout={(data) => {
          if (!user) {
            showToast('Please log in to proceed to checkout!');
            setCurrentPage('login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          setCheckoutData(data);
          setCurrentPage('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlist}
        onRemoveWishlist={handleToggleWishlist}
        onQuickAdd={(p) => handleAddToCart({ ...p, selectedSize: 'M', quantity: 1 })}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setCurrentPage('product');
          setIsWishlistOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
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
