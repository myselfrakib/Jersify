import { rtdb, ref, get } from '../firebase';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { INITIAL_CATEGORIES } from '../data/categoriesData';
import { markRoutePrewarmed } from '../components/WholePageSpinner';

// Set of all image URLs preloaded in this browser session
const preloadedImageUrls = new Set();

/**
 * Preload and decode an image into the browser's HTTP/memory cache.
 */
export function preloadImage(url) {
  if (!url || typeof url !== 'string' || preloadedImageUrls.has(url)) {
    return Promise.resolve();
  }
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return Promise.resolve();
  }

  preloadedImageUrls.add(url);
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    if (img.complete) {
      if (img.decode) {
        img.decode().then(resolve).catch(resolve);
      } else {
        resolve();
      }
    } else {
      img.onload = () => {
        if (img.decode) {
          img.decode().then(resolve).catch(resolve);
        } else {
          resolve();
        }
      };
      img.onerror = () => resolve();
    }
  });
}

/**
 * Helper to safely save state to both localStorage and sessionStorage.
 */
export function saveToLocalCache(key, data) {
  try {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    localStorage.setItem(key, str);
    sessionStorage.setItem(key, str);
  } catch (err) {
    console.warn(`[Preloader] Failed to save cache for ${key}:`, err);
  }
}

/**
 * Helper to safely load state from sessionStorage or localStorage fallback.
 */
export function loadFromLocalCache(key, fallback = null) {
  try {
    const stored = sessionStorage.getItem(key) || localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Step 1: Preload Shop Page
 * - Fetches products, categories, shoppingPageOrder
 * - Pre-caches product jersey images and category thumbnails
 * - Saves state in local cache for instant zero-delay navigation
 */
export async function preloadShopPage() {
  try {
    // 1. Fetch & Cache Products Catalog
    let products = loadFromLocalCache('jersify_products', null);
    if (!products || products.length === 0) {
      const prodsSnap = await get(ref(rtdb, 'products'));
      if (prodsSnap.exists()) {
        const val = prodsSnap.val();
        products = Object.keys(val).map(k => ({ id: k, ...val[k] }));
      } else {
        products = INITIAL_PRODUCTS;
      }
    }
    if (products && products.length > 0) {
      saveToLocalCache('jersify_products', products);
    }

    // 2. Fetch & Cache Categories
    let categories = loadFromLocalCache('jersify_categories', null);
    if (!categories || categories.length === 0) {
      const catsSnap = await get(ref(rtdb, 'categories'));
      if (catsSnap.exists()) {
        const val = catsSnap.val();
        categories = Object.keys(val).map(k => ({ id: k, ...val[k] }));
      } else {
        categories = INITIAL_CATEGORIES;
      }
    }
    if (categories && categories.length > 0) {
      saveToLocalCache('jersify_categories', categories);
    }

    // 3. Fetch & Cache Shopping Page Sequence Order
    let shoppingOrder = loadFromLocalCache('jersify_shopping_page_order', null);
    if (!shoppingOrder) {
      const orderSnap = await get(ref(rtdb, 'siteConfig/shoppingPageOrder'));
      if (orderSnap.exists()) {
        shoppingOrder = orderSnap.val();
      } else {
        shoppingOrder = { fan: [], player: [], retro: [] };
      }
    }
    if (shoppingOrder) {
      saveToLocalCache('jersify_shopping_page_order', shoppingOrder);
    }

    // 4. Pre-cache Top Product Images for Shop View (Fan, Player, Retro)
    const imagesToPreload = [];
    if (Array.isArray(products)) {
      // Preload the first 16 products for the shop page
      products.slice(0, 16).forEach(p => {
        if (p.imgUrl) imagesToPreload.push(p.imgUrl);
      });
    }

    if (Array.isArray(categories)) {
      categories.forEach(c => {
        if (c.imageUrl) imagesToPreload.push(c.imageUrl);
      });
    }

    // Preload top images in parallel
    await Promise.allSettled(imagesToPreload.map(preloadImage));

    // Mark Shop as pre-warmed & cached
    saveToLocalCache('jersify_shop_cached', 'true');
    markRoutePrewarmed('shop');
    markRoutePrewarmed('shop__');
  } catch (err) {
    console.warn('[Preloader] Error during shop page preload:', err);
  }
}

/**
 * Step 2: Preload Cart Page & Cart Drawer Assets
 * - Ensures cart items are stored in cache
 * - Pre-caches cart thumbnails and bag icons
 */
export async function preloadCartPage() {
  try {
    const rawCart = localStorage.getItem('jersify_cart');
    const cartItems = rawCart ? JSON.parse(rawCart) : [];

    // Pre-cache images of any items already in user's cart
    const cartImages = [];
    if (Array.isArray(cartItems)) {
      cartItems.forEach(item => {
        if (item.imgUrl) cartImages.push(item.imgUrl);
      });
    }

    await Promise.allSettled(cartImages.map(preloadImage));

    saveToLocalCache('jersify_cart_cached', 'true');
    markRoutePrewarmed('cart');
    markRoutePrewarmed('cart__');
  } catch (err) {
    console.warn('[Preloader] Error during cart page preload:', err);
  }
}

/**
 * Step 3: Preload Profile Page
 * - If user logged in, fetches profile & saved addresses & orders
 * - Pre-caches profile SVG icons and assets
 * - Saves into local cache for 0ms profile load
 */
export async function preloadProfilePage({ user }) {
  try {
    const currentUserId = user?.uid || (() => {
      try {
        const cached = localStorage.getItem('jersify_auth_user');
        return cached ? JSON.parse(cached)?.uid : null;
      } catch {
        return null;
      }
    })();

    if (currentUserId) {
      // 1. Fetch User Profile & Addresses
      const userSnap = await get(ref(rtdb, `users/${currentUserId}`));
      if (userSnap.exists()) {
        const profileData = userSnap.val();
        saveToLocalCache('jersify_user_profile', profileData);

        if (profileData.addresses) {
          const addrList = Array.isArray(profileData.addresses)
            ? profileData.addresses
            : Object.values(profileData.addresses);
          saveToLocalCache('jersify_saved_addresses', addrList);
        }
      }

      // 2. Fetch User Orders
      const ordersSnap = await get(ref(rtdb, 'orders'));
      if (ordersSnap.exists()) {
        const allOrders = Object.values(ordersSnap.val() || {});
        const userEmailLower = user?.email ? user.email.toLowerCase() : '';
        const userPhoneClean = user?.phoneNumber ? user.phoneNumber.replace(/[^0-9]/g, '').slice(-10) : '';

        const userOrders = allOrders.filter(o => {
          const matchUid = o.userId === currentUserId;
          const matchEmail = (o.email && userEmailLower && o.email.toLowerCase() === userEmailLower) ||
                             (o.userEmail && userEmailLower && o.userEmail.toLowerCase() === userEmailLower);
          const matchPhone = userPhoneClean && o.phone && o.phone.replace(/[^0-9]/g, '').slice(-10) === userPhoneClean;
          return matchUid || matchEmail || matchPhone;
        });

        saveToLocalCache('jersify_cached_orders', userOrders);
      }
    }

    saveToLocalCache('jersify_profile_cached', 'true');
    markRoutePrewarmed('profile');
    markRoutePrewarmed('profile__');
  } catch (err) {
    console.warn('[Preloader] Error during profile page preload:', err);
  }
}

let isPreloadingSequenceStarted = false;

/**
 * Sequential page preloader:
 * Runs right after the homepage is successfully loaded.
 * Loads other pages one by one: shop -> cart -> profile,
 * and saves each into local cache for butter-smooth navigation.
 */
export async function runSequentialPagePreload({ user }) {
  if (isPreloadingSequenceStarted) return;
  isPreloadingSequenceStarted = true;

  // Small initial pause after homepage load so user interaction remains ultra-responsive
  await new Promise(r => setTimeout(r, 150));

  // 1. Preload Shop Page
  await preloadShopPage();

  // Brief pause between pages
  await new Promise(r => setTimeout(r, 180));

  // 2. Preload Cart Page
  await preloadCartPage();

  // Brief pause between pages
  await new Promise(r => setTimeout(r, 180));

  // 3. Preload Profile Page
  await preloadProfilePage({ user });
}
