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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

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
        src={src}
        alt={alt}
        onClick={onClick}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setIsLoaded(true);
          setHasError(true);
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: objectFit,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.35s ease-in-out',
          cursor: onClick ? 'pointer' : 'default'
        }}
        {...props}
      />
    </div>
  );
}

