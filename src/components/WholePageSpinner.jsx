import React, { useState, useEffect, useRef } from 'react';

// Keep track of visited route keys so we don't re-show the loading overlay on back/forward or revisited pages
const visitedRouteKeys = new Set();

/**
 * Mark a route key as pre-warmed / pre-cached so navigation into it is instant.
 */
export const markRoutePrewarmed = (key) => {
  if (key) {
    visitedRouteKeys.add(key);
    const base = key.split('_')[0];
    if (base) visitedRouteKeys.add(base);
  }
};

/**
 * WholePageSpinner
 * A whole-page loading overlay that stays visible while page images are loading.
 * Translucent overlay with a small clean spinner in the center.
 */
export default function WholePageSpinner({
  triggerKey,
  containerRef,
  minDuration = 80,
  maxTimeout = 2500,
  isLoading,
  onlyOncePerRoute = true
}) {
  const routeBase = triggerKey ? triggerKey.split('_')[0] : '';
  const isAlreadyVisited = Boolean(
    isLoading === undefined &&
    onlyOncePerRoute &&
    triggerKey &&
    (visitedRouteKeys.has(triggerKey) || visitedRouteKeys.has(routeBase))
  );

  const [isVisible, setIsVisible] = useState(() => {
    if (typeof isLoading === 'boolean') return isLoading;
    return !isAlreadyVisited;
  });
  const [isFading, setIsFading] = useState(false);
  const prevLoadingRef = useRef(isLoading);

  // Direct synchronization when isLoading prop is explicitly controlled (e.g. homepage image loading)
  useEffect(() => {
    if (typeof isLoading === 'boolean') {
      if (isLoading) {
        setIsVisible(true);
        setIsFading(false);
      } else if (prevLoadingRef.current === true && !isLoading) {
        // Smoothly fade out when loading completes
        setIsFading(true);
        const timer = setTimeout(() => {
          setIsVisible(false);
          setIsFading(false);
          if (triggerKey && onlyOncePerRoute) {
            visitedRouteKeys.add(triggerKey);
            if (routeBase) visitedRouteKeys.add(routeBase);
          }
        }, 180);
        return () => clearTimeout(timer);
      }
      prevLoadingRef.current = isLoading;
    }
  }, [isLoading, triggerKey, routeBase, onlyOncePerRoute]);

  // Fallback DOM image detector when isLoading is NOT explicitly controlled
  useEffect(() => {
    if (typeof isLoading === 'boolean') return;

    if (onlyOncePerRoute && triggerKey && (visitedRouteKeys.has(triggerKey) || visitedRouteKeys.has(routeBase))) {
      setIsVisible(false);
      setIsFading(false);
      return;
    }

    let isCancelled = false;
    let fadeTimer = null;
    let completionDebounceTimer = null;
    let observer = null;
    const startTime = Date.now();

    setIsVisible(true);
    setIsFading(false);

    const finishLoading = () => {
      if (isCancelled) return;
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      if (onlyOncePerRoute && triggerKey) {
        visitedRouteKeys.add(triggerKey);
        if (routeBase) visitedRouteKeys.add(routeBase);
      }

      const elapsed = Date.now() - startTime;
      const remainingMin = Math.max(0, minDuration - elapsed);

      fadeTimer = setTimeout(() => {
        if (isCancelled) return;
        setIsFading(true);
        fadeTimer = setTimeout(() => {
          if (isCancelled) return;
          setIsVisible(false);
          setIsFading(false);
        }, 160);
      }, remainingMin);
    };

    const safetyTimer = setTimeout(() => {
      if (!isCancelled) {
        finishLoading();
      }
    }, maxTimeout);

    const trackedImgs = new WeakSet();

    const getContainer = () => {
      return (
        containerRef?.current ||
        document.getElementById('jersify-page-container') ||
        document.body
      );
    };

    const getImages = () => {
      const container = getContainer();
      if (!container) return [];

      if (triggerKey && String(triggerKey).startsWith('home')) {
        const homepageCriticalImages = Array.from(
          container.querySelectorAll('#hero-banner-carousel img, [data-hero-banners] img, #club-badges-container img, [data-club-badges] img')
        ).filter((img) => {
          const src = img.getAttribute('src') || img.src;
          return src && !src.startsWith('data:image/svg+xml') && !src.startsWith('data:image/gif');
        });

        if (homepageCriticalImages.length > 0) return homepageCriticalImages;
      }

      // On product detail page, only evaluate the main hero product image (not recommendations)
      if (triggerKey && String(triggerKey).startsWith('product')) {
        const mainProductImages = Array.from(
          container.querySelectorAll('#product-main-carousel img, [data-main-product-image] img, img[data-main-product-image]')
        ).filter((img) => {
          const src = img.getAttribute('src') || img.src;
          return src && !src.startsWith('data:image/svg+xml') && !src.startsWith('data:image/gif');
        });

        if (mainProductImages.length > 0) return mainProductImages.slice(0, 1);
      }

      // On shop catalog page, evaluate top visible above-the-fold cards
      if (triggerKey && String(triggerKey).startsWith('shop')) {
        const topShopCards = Array.from(
          container.querySelectorAll('[data-product-card] img, .shop-product-img')
        ).filter((img) => {
          const src = img.getAttribute('src') || img.src;
          return src && !src.startsWith('data:image/svg+xml') && !src.startsWith('data:image/gif');
        });

        if (topShopCards.length > 0) return topShopCards.slice(0, 2);
      }

      return Array.from(container.querySelectorAll('img')).filter((img) => {
        const src = img.getAttribute('src') || img.src;
        return src && !src.startsWith('data:image/svg+xml') && !src.startsWith('data:image/gif');
      });
    };

    const isImageDone = (img) => {
      return img.complete && (img.naturalWidth > 0 || img.__jersifyError);
    };

    const evaluateImages = () => {
      if (isCancelled) return;
      const images = getImages();
      if (images.length === 0) {
        if (completionDebounceTimer) clearTimeout(completionDebounceTimer);
        completionDebounceTimer = setTimeout(() => {
          if (isCancelled) return;
          finishLoading();
        }, 40);
        return;
      }

      images.forEach((img) => {
        if (!trackedImgs.has(img)) {
          trackedImgs.add(img);
          if (!isImageDone(img)) {
            const onSettled = () => evaluateImages();
            img.addEventListener('load', onSettled, { once: true });
            img.addEventListener('error', () => {
              img.__jersifyError = true;
              onSettled();
            }, { once: true });
          }
        }
      });

      const allLoaded = images.every(isImageDone);
      if (allLoaded) {
        if (completionDebounceTimer) clearTimeout(completionDebounceTimer);
        completionDebounceTimer = setTimeout(() => {
          if (isCancelled) return;
          finishLoading();
        }, 40);
      }
    };

    const initialCheckTimer = setTimeout(() => {
      if (isCancelled) return;
      const container = getContainer();
      if (container) {
        try {
          observer = new MutationObserver(() => evaluateImages());
          observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'srcset']
          });
        } catch (e) {}
      }
      evaluateImages();
    }, 50);

    return () => {
      isCancelled = true;
      clearTimeout(initialCheckTimer);
      clearTimeout(safetyTimer);
      if (completionDebounceTimer) clearTimeout(completionDebounceTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
      if (observer) observer.disconnect();
    };
  }, [triggerKey, minDuration, maxTimeout, containerRef, isLoading, routeBase, onlyOncePerRoute]);

  if (!isVisible) return null;

  return (
    <div
      id="jersify-whole-page-spinner"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isFading ? 0 : 1,
        transition: 'opacity 0.18s ease',
        pointerEvents: isFading ? 'none' : 'auto',
        userSelect: 'none'
      }}
    >
      <style>{`
        @keyframes jersifyCenterSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Small Clean Center Spinner */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '3px solid rgba(0, 0, 0, 0.12)',
          borderTopColor: '#111111',
          animation: 'jersifyCenterSpin 0.7s linear infinite'
        }}
      />
    </div>
  );
}
