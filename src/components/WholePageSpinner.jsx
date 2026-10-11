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
 * Ensures a silky-smooth transition once images are loaded, with zero disturbance
 * to the rest of the application.
 */
export default function WholePageSpinner({
  triggerKey,
  containerRef,
  minDuration = 80,
  maxTimeout = 2500,
  isLoading = false,
  onlyOncePerRoute = true
}) {
  const routeBase = triggerKey ? triggerKey.split('_')[0] : '';
  const isAlreadyVisited = Boolean(
    !isLoading && onlyOncePerRoute && triggerKey && (
      visitedRouteKeys.has(triggerKey) ||
      visitedRouteKeys.has(routeBase)
    )
  );
  const [isVisible, setIsVisible] = useState(() => !isAlreadyVisited);
  const [isFading, setIsFading] = useState(false);
  const lastKeyRef = useRef(triggerKey);

  useEffect(() => {
    // If this route was already loaded and visited in this session, skip the spinner completely
    const routeBase = triggerKey ? triggerKey.split('_')[0] : '';
    if (!isLoading && onlyOncePerRoute && triggerKey && (visitedRouteKeys.has(triggerKey) || visitedRouteKeys.has(routeBase))) {
      setIsVisible(false);
      setIsFading(false);
      return;
    }

    let isCancelled = false;
    let fadeTimer = null;
    let completionDebounceTimer = null;
    let observer = null;
    const startTime = Date.now();

    // Show spinner when visiting this route for the first time
    setIsVisible(true);
    setIsFading(false);
    lastKeyRef.current = triggerKey;

    const finishLoading = () => {
      if (isCancelled || isLoading) return;
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      if (onlyOncePerRoute && triggerKey) {
        visitedRouteKeys.add(triggerKey);
        const base = triggerKey.split('_')[0];
        if (base) {
          visitedRouteKeys.add(base);
        }
      }

      const elapsed = Date.now() - startTime;
      const remainingMin = Math.max(0, minDuration - elapsed);

      fadeTimer = setTimeout(() => {
        if (isCancelled || isLoading) return;
        setIsFading(true);
        fadeTimer = setTimeout(() => {
          if (isCancelled || isLoading) return;
          setIsVisible(false);
          setIsFading(false);
        }, 160);
      }, remainingMin);
    };

    // Safety timeout in case an asset hangs indefinitely (fast 2.5s maximum)
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

      // On homepage, evaluate both hero banner photos and club icons images
      if (triggerKey && String(triggerKey).startsWith('home')) {
        const homepageCriticalImages = Array.from(
          container.querySelectorAll('#hero-banner-carousel img, [data-hero-banners] img, #club-badges-container img, [data-club-badges] img')
        ).filter((img) => {
          const src = img.getAttribute('src') || img.src;
          return src && !src.startsWith('data:image/svg+xml') && !src.startsWith('data:image/gif');
        });

        if (homepageCriticalImages.length > 0) return homepageCriticalImages;

        const altHeroImages = Array.from(container.querySelectorAll('img')).filter((img) => {
          const alt = (img.getAttribute('alt') || '').toLowerCase();
          const src = img.getAttribute('src') || img.src;
          return (alt.includes('hero banner') || alt.includes('club')) && src && !src.startsWith('data:image/svg+xml');
        });

        if (altHeroImages.length > 0) return altHeroImages;
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

      // On shop catalog page, only evaluate top visible above-the-fold cards
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
      if (isCancelled || isLoading) return;

      const images = getImages();
      // If DOM has no heavy images (e.g. Profile page with SVG icons), allow quick completion
      if (images.length === 0) {
        if (completionDebounceTimer) clearTimeout(completionDebounceTimer);
        completionDebounceTimer = setTimeout(() => {
          if (isCancelled) return;
          const recheckImages = getImages();
          if (recheckImages.length === 0 || recheckImages.every(isImageDone)) {
            finishLoading();
          }
        }, 40);
        return;
      }

      // Attach listener to any newly discovered or uncompleted images
      images.forEach((img) => {
        if (!trackedImgs.has(img)) {
          trackedImgs.add(img);
          if (!isImageDone(img)) {
            const onSettled = () => {
              evaluateImages();
            };
            img.addEventListener('load', onSettled, { once: true });
            img.addEventListener('error', () => {
              img.__jersifyError = true;
              onSettled();
            }, { once: true });
          }
        }
      });

      // Check if all images are currently loaded
      const allLoaded = images.every(isImageDone);

      if (allLoaded) {
        // Fast 40ms grace window for smooth transition
        if (completionDebounceTimer) clearTimeout(completionDebounceTimer);
        completionDebounceTimer = setTimeout(() => {
          if (isCancelled || isLoading) return;
          const recheckImages = getImages();
          if (recheckImages.length > 0 && recheckImages.every(isImageDone)) {
            finishLoading();
          }
        }, 40);
      } else {
        // Still has pending images, clear any pending completion
        if (completionDebounceTimer) {
          clearTimeout(completionDebounceTimer);
          completionDebounceTimer = null;
        }
      }
    };

    // Initial check after short microtask render
    const initialCheckTimer = setTimeout(() => {
      if (isCancelled || isLoading) return;
      const container = getContainer();

      if (container) {
        try {
          observer = new MutationObserver(() => {
            evaluateImages();
          });

          observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'srcset']
          });
        } catch (e) {
          // Fallback if MutationObserver fails
        }
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
  }, [triggerKey, minDuration, maxTimeout, containerRef, isLoading]);

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
        transition: 'opacity 0.25s ease',
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

      {/* Simple Center Spinner */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid rgba(0, 0, 0, 0.1)',
          borderTopColor: '#111111',
          animation: 'jersifyCenterSpin 0.75s linear infinite'
        }}
      />
    </div>
  );
}
