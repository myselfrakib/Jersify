import React, { useState, useEffect, useRef } from 'react';

/**
 * WholePageSpinner
 * A whole-page loading overlay that stays visible while page images are loading.
 * Ensures a silky-smooth transition once images are loaded, with zero disturbance
 * to the rest of the application.
 */
export default function WholePageSpinner({
  triggerKey,
  containerRef,
  minDuration = 300,
  maxTimeout = 2200
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const lastKeyRef = useRef(triggerKey);

  useEffect(() => {
    let isCancelled = false;
    const startTime = Date.now();

    // Show spinner when triggerKey changes (navigation or initial mount)
    setIsVisible(true);
    setIsFading(false);
    lastKeyRef.current = triggerKey;

    const finishLoading = () => {
      if (isCancelled) return;
      const elapsed = Date.now() - startTime;
      const remainingMin = Math.max(0, minDuration - elapsed);

      setTimeout(() => {
        if (isCancelled) return;
        setIsFading(true);
        setTimeout(() => {
          if (isCancelled) return;
          setIsVisible(false);
          setIsFading(false);
        }, 360);
      }, remainingMin);
    };

    // Wait 40ms for React to render new page DOM
    const initTimer = setTimeout(() => {
      if (isCancelled) return;

      const container =
        containerRef?.current ||
        document.getElementById('jersify-page-container') ||
        document.body;

      if (!container) {
        finishLoading();
        return;
      }

      // Collect all <img> tags that have a remote source
      const getPageImages = () => {
        return Array.from(container.querySelectorAll('img')).filter((img) => {
          const src = img.getAttribute('src') || img.src;
          return src && !src.startsWith('data:image/svg+xml');
        });
      };

      const trackedImages = new Set();
      const imagePromises = [];

      const trackImage = (img) => {
        if (!img || trackedImages.has(img)) return;
        trackedImages.add(img);

        // If image is already fully loaded from cache
        if (img.complete && img.naturalWidth > 0) {
          return;
        }

        imagePromises.push(
          new Promise((resolve) => {
            const onDone = () => resolve();
            img.addEventListener('load', onDone, { once: true });
            img.addEventListener('error', onDone, { once: true });
          })
        );
      };

      // Initial batch of images in DOM
      getPageImages().forEach(trackImage);

      // Also observe dynamically inserted images (e.g. Firebase RTDB sync)
      let observer = null;
      try {
        observer = new MutationObserver((mutations) => {
          if (isCancelled) return;
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'IMG') {
                  trackImage(node);
                } else if (node.querySelectorAll) {
                  node.querySelectorAll('img').forEach(trackImage);
                }
              }
            }
          }
        });

        observer.observe(container, {
          childList: true,
          subtree: true
        });
      } catch (e) {
        // MutationObserver fallback
      }

      // If no remote images were pending, finish smoothly
      if (imagePromises.length === 0) {
        if (observer) observer.disconnect();
        finishLoading();
        return;
      }

      // Wait for all tracked images with max safety timeout
      const allLoaded = Promise.all(imagePromises);
      const safetyTimeout = new Promise((resolve) =>
        setTimeout(resolve, maxTimeout)
      );

      Promise.race([allLoaded, safetyTimeout]).then(() => {
        if (observer) observer.disconnect();
        finishLoading();
      });
    }, 40);

    return () => {
      isCancelled = true;
      clearTimeout(initTimer);
    };
  }, [triggerKey, minDuration, maxTimeout, containerRef]);

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
