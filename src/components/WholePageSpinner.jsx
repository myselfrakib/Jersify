import React, { useState, useEffect, useRef } from 'react';

// Keep track of visited route keys so we don't re-show the loading overlay on back/forward or revisited pages
const visitedRouteKeys = new Set();

/**
 * WholePageSpinner
 * A whole-page loading overlay that stays visible while page images are loading.
 * Ensures a silky-smooth transition once images are loaded, with zero disturbance
 * to the rest of the application.
 */
export default function WholePageSpinner({
  triggerKey,
  containerRef,
  minDuration = 400,
  maxTimeout = 9000,
  isLoading = false,
  onlyOncePerRoute = true
}) {
  const isAlreadyVisited = Boolean(onlyOncePerRoute && triggerKey && visitedRouteKeys.has(triggerKey));
  const [isVisible, setIsVisible] = useState(() => !isAlreadyVisited);
  const [isFading, setIsFading] = useState(false);
  const lastKeyRef = useRef(triggerKey);

  useEffect(() => {
    // If this route was already loaded and visited, skip the spinner completely
    if (onlyOncePerRoute && triggerKey && visitedRouteKeys.has(triggerKey)) {
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
        }, 360);
      }, remainingMin);
    };

    // Safety timeout in case an asset hangs indefinitely
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
        }, 120);
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
        // Wait a 220ms grace window to verify no dynamic state changes re-trigger loading
        if (completionDebounceTimer) clearTimeout(completionDebounceTimer);
        completionDebounceTimer = setTimeout(() => {
          if (isCancelled || isLoading) return;
          const recheckImages = getImages();
          if (recheckImages.length > 0 && recheckImages.every(isImageDone)) {
            finishLoading();
          }
        }, 220);
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
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isFading ? 0 : 1,
        transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: isFading ? 'none' : 'auto',
        userSelect: 'none'
      }}
    >
      <style>{`
        @keyframes jersifyOuterSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes jersifyInnerSpin {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes jersifyPulseDot {
          0%, 100% { transform: scale(0.85); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes jersifyShimmerBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '32px'
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 900,
            fontSize: '24px',
            letterSpacing: '0.25em',
            color: '#111827',
            textTransform: 'uppercase'
          }}
        >
          JERSIFY
        </span>
        <span
          style={{
            fontFamily: 'Karla, sans-serif',
            fontWeight: 700,
            fontSize: '10px',
            letterSpacing: '0.2em',
            color: '#D4AF37',
            textTransform: 'uppercase',
            marginTop: '4px'
          }}
        >
          AUTHENTIC FOOTBALL KITS
        </span>
      </div>

      {/* Sleek Dual Spinner */}
      <div
        style={{
          position: 'relative',
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Outer Gold/Dark Ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid #F3F4F6',
            borderTop: '3px solid #D4AF37',
            borderRight: '3px solid #111827',
            animation: 'jersifyOuterSpin 0.9s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite'
          }}
        />

        {/* Inner Counter-Rotating Ring */}
        <div
          style={{
            position: 'absolute',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '2.5px solid transparent',
            borderBottom: '2.5px solid #D4AF37',
            borderLeft: '2.5px solid #111827',
            animation: 'jersifyInnerSpin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite'
          }}
        />

        {/* Center Pulse Dot */}
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#D4AF37',
            animation: 'jersifyPulseDot 1.4s ease-in-out infinite'
          }}
        />
      </div>

      {/* Shimmer Progress Line */}
      <div
        style={{
          marginTop: '28px',
          width: '120px',
          height: '2px',
          background: '#F3F4F6',
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            animation: 'jersifyShimmerBar 1.2s infinite ease-in-out'
          }}
        />
      </div>
    </div>
  );
}
