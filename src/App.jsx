import React, { useState, useEffect, useRef } from 'react';
import WholePageSpinner from './components/WholePageSpinner';
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
import { auth, onAuthStateChanged, db, rtdb, ref, update, get } from './firebase';
import { runSequentialPagePreload } from './utils/pagePreloader';

export default function App() {
  // Page Navigation State: 'home' | 'shop' | 'product' | 'profile' | 'orders' | 'addresses' | 'team' | 'login' | 'signup' | 'checkout' | 'admin-login' | 'admin-dashboard'
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('Barcelona');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_active_category');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [adminData, setAdminData] = useState(null);

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('jersify_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('jersify_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Fast pre-verified Auth & Profile states (initialized synchronously from cache)
  const [user, setUser] = useState(() => {
    if (auth?.currentUser) return auth.currentUser;
    try {
      const cached = localStorage.getItem('jersify_auth_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const cached = localStorage.getItem('jersify_user_profile') || sessionStorage.getItem('jersify_user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const isHomeCachedInitially = (() => {
    try {
      return (
        sessionStorage.getItem('jersify_home_cached') === 'true' ||
        Boolean(window.__jersify_home_loaded)
      );
    } catch {
      return false;
    }
  })();
  const hasHomeLoadedRef = useRef(isHomeCachedInitially);
  const [isHomeImagesLoading, setIsHomeImagesLoading] = useState(!isHomeCachedInitially);
  const [hasVisitedHome, setHasVisitedHome] = useState(currentPage === 'home' || isHomeCachedInitially);

  useEffect(() => {
    if (currentPage === 'home') {
      setHasVisitedHome(true);
    }
  }, [currentPage]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  const [toasts, setToasts] = useState([]);
  const pageContentRef = useRef(null);

  // Check for payment redirect callback return parameters from jersifybooking.html
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentId = searchParams.get('paymentId') || searchParams.get('razorpay_payment_id');
    const oid = searchParams.get('oid');
    if (paymentId || (oid && searchParams.get('amt'))) {
      setCartItems([]);
      localStorage.removeItem('jersify_cart');

      if (oid) {
        try {
          update(ref(rtdb, `orders/${oid}`), {
            status: 'confirmed',
            paymentStatus: 'Paid Online',
            paymentId: paymentId || 'PAID_ONLINE',
            updatedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn('Failed to update confirmed order status:', e);
        }
      }

      showToast('Payment Successful! Order Confirmed 🎉');
      navigateTo('orders');

      const cleanUrl = window.location.origin + window.location.pathname + '#orders';
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

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
    } else if (page === 'shop') {
      if (param) {
        const catName = typeof param === 'object' ? (param.name || param.id) : param;
        targetHash = `#shop/category/${encodeURIComponent(catName)}`;
        setSelectedCategoryFilter(param);
        try {
          sessionStorage.setItem('jersify_active_category', JSON.stringify(param));
        } catch (e) {}
      } else {
        targetHash = '#shop';
        setSelectedCategoryFilter(null);
        try {
          sessionStorage.removeItem('jersify_active_category');
        } catch (e) {}
      }
    }

    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
    if (page === 'home' && !hasHomeLoadedRef.current) {
      setIsHomeImagesLoading(true);
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

      if (rawHash.startsWith('shop/category/')) {
        const catName = decodeURIComponent(rawHash.replace('shop/category/', ''));
        setCurrentPage('shop');
        setSelectedCategoryFilter(catName);
        return;
      }

      const validPages = [
        'shop', 'profile', 'orders', 'addresses', 'login', 'signup',
        'checkout', 'admin-login', 'admin-dashboard'
      ];

      if (validPages.includes(rawHash)) {
        if (rawHash === 'shop') {
          // Keep current category filter if exists or let user clear
        }
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

  // When homepage is loaded successfully:
  // Preload and save other pages one by one (shop -> cart -> profile) in local cache
  // for butter-smooth, instant redirects
  useEffect(() => {
    if (currentPage === 'home' && !isHomeImagesLoading) {
      runSequentialPagePreload({ user });
    }
  }, [currentPage, isHomeImagesLoading, user]);

  // Proactively fetch & verify auth state on homepage & pre-fetch profile data for instant profile loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const minimalAuth = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          };
          localStorage.setItem('jersify_auth_user', JSON.stringify(minimalAuth));

          // Fetch full user profile & saved addresses upfront on homepage
          const userSnap = await get(ref(rtdb, `users/${currentUser.uid}`));
          if (userSnap.exists()) {
            const profileData = userSnap.val();
            setUserProfile(profileData);
            localStorage.setItem('jersify_user_profile', JSON.stringify(profileData));
            try {
              sessionStorage.setItem('jersify_user_profile', JSON.stringify(profileData));
            } catch (e) {}
            if (profileData.addresses) {
              const addrList = Array.isArray(profileData.addresses)
                ? profileData.addresses
                : Object.values(profileData.addresses);
              localStorage.setItem('jersify_saved_addresses', JSON.stringify(addrList));
            }
          } else {
            const fallbackProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Member'),
              email: currentUser.email
            };
            setUserProfile(fallbackProfile);
            localStorage.setItem('jersify_user_profile', JSON.stringify(fallbackProfile));
          }
        } catch (e) {
          console.warn('Background profile prefetch fallback:', e);
        }
      } else {
        localStorage.removeItem('jersify_auth_user');
        localStorage.removeItem('jersify_user_profile');
        try {
          sessionStorage.removeItem('jersify_user_profile');
        } catch (e) {}
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAuth = () => {
    const isAuthed = Boolean(user || localStorage.getItem('jersify_auth_user'));
    navigateTo(isAuthed ? 'profile' : 'login');
  };
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

      {/* Whole Page Image Loading Spinner - Never shown for homepage once loaded */}
      {!(currentPage === 'home' && hasHomeLoadedRef.current) && (
        <WholePageSpinner
          triggerKey={`${currentPage}_${selectedProduct?.id || ''}_${selectedTeam || ''}`}
          containerRef={pageContentRef}
          isLoading={currentPage === 'home' ? (isHomeImagesLoading && !hasHomeLoadedRef.current) : undefined}
          minDuration={80}
          maxTimeout={2500}
        />
      )}

      {/* Main Page Container */}
      <div id="jersify-page-container" ref={pageContentRef} style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* CACHED HOMEPAGE VIEW - Retained in DOM for 0ms instantaneous redirect */}
        {hasVisitedHome && (
          <div
            id="cached-home-view"
            style={{
              display: currentPage === 'home' ? 'block' : 'none',
              width: '100%'
            }}
          >
            <FigmaExactView
              cartCount={cartCount}
              isActive={currentPage === 'home'}
              onSelectProduct={(p) => navigateTo('product', p)}
              onSelectTeam={(t) => navigateTo('team', t)}
              onSelectCategory={(c) => navigateTo('shop', c)}
              onOpenCart={() => setIsCartOpen(true)}
              onOpenAuth={handleOpenAuth}
              onNavigateShop={() => navigateTo('shop')}
              onLoadingChange={(loading) => {
                if (!loading) {
                  hasHomeLoadedRef.current = true;
                  try {
                    sessionStorage.setItem('jersify_home_cached', 'true');
                    localStorage.setItem('jersify_home_cached', 'true');
                  } catch {}
                  setIsHomeImagesLoading(false);
                } else if (!hasHomeLoadedRef.current) {
                  setIsHomeImagesLoading(true);
                }
              }}
            />
          </div>
        )}

        {currentPage === 'shop' && (
        <FigmaShopPage
          cartCount={cartCount}
          selectedCategoryFilter={selectedCategoryFilter}
          onClearCategoryFilter={() => {
            setSelectedCategoryFilter(null);
            try { sessionStorage.removeItem('jersify_active_category'); } catch (e) {}
            if (window.location.hash.startsWith('#shop/category/')) {
              window.location.hash = '#shop';
            }
          }}
          onSelectProduct={(p) => navigateTo('product', p)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={handleOpenAuth}
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
          onOpenAuth={handleOpenAuth}
          onNavigateHome={() => navigateTo('home')}
        />
      )}

      {currentPage === 'profile' && (
        <FigmaProfilePage
          user={user}
          userProfile={userProfile}
          onSignOut={async () => {
            if (user) {
              try { await auth.signOut(); } catch (e) {}
              setUser(null);
              setUserProfile(null);
              localStorage.removeItem('jersify_auth_user');
              localStorage.removeItem('jersify_user_profile');
              try {
                sessionStorage.removeItem('jersify_user_profile');
              } catch (e) {}
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
          user={user}
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
          onUserChanged={(u) => {
            setUser(u);
            if (u) {
              const minimal = {
                uid: u.uid,
                email: u.email,
                displayName: u.displayName,
                photoURL: u.photoURL
              };
              localStorage.setItem('jersify_auth_user', JSON.stringify(minimal));
            } else {
              localStorage.removeItem('jersify_auth_user');
              localStorage.removeItem('jersify_user_profile');
              setUserProfile(null);
            }
          }}
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
          onUserChanged={(u) => {
            setUser(u);
            if (u) {
              const minimal = {
                uid: u.uid,
                email: u.email,
                displayName: u.displayName,
                photoURL: u.photoURL
              };
              localStorage.setItem('jersify_auth_user', JSON.stringify(minimal));
            } else {
              localStorage.removeItem('jersify_auth_user');
              localStorage.removeItem('jersify_user_profile');
              setUserProfile(null);
            }
          }}
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
      </div>

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
