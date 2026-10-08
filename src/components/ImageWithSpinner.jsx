import React, { useState } from 'react';

export default function ImageWithSpinner({ 
  src, 
  alt = '', 
  style = {}, 
  containerStyle = {},
  className = '',
  objectFit = 'cover',
  onClick,
  spinnerSize,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fallbackSrc = "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de";
  const imageSrc = hasError || !src ? fallbackSrc : src;

  return (
    <div 
      className={className}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden', 
        ...containerStyle,
        ...style 
      }}
    >
      <style>{`
        @keyframes jersifySkeletonShimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>

      {!isLoaded && !hasError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, #EAEAEA 25%, #F5F5F5 50%, #EAEAEA 75%)',
          backgroundSize: '200% 100%',
          animation: 'jersifySkeletonShimmer 1.4s infinite linear',
          zIndex: 2
        }} />
      )}

      <img
        src={imageSrc}
        alt={alt}
        onClick={onClick}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          setIsLoaded(true);
          setHasError(true);
          if (e.target.src !== fallbackSrc) {
            e.target.src = fallbackSrc;
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: objectFit,
          opacity: 1,
          transition: 'opacity 0.35s ease-in-out',
          cursor: onClick ? 'pointer' : 'default'
        }}
        {...props}
      />
    </div>
  );
}

