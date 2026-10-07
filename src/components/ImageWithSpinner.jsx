import React, { useState } from 'react';

export default function ImageWithSpinner({ 
  src, 
  alt = '', 
  style = {}, 
  containerStyle = {},
  className = '',
  objectFit = 'cover',
  onClick,
  spinnerSize = '24px',
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
      {!isLoaded && !hasError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2
        }}>
          <div style={{
            width: spinnerSize,
            height: spinnerSize,
            border: '2px solid #E5E7EB',
            borderTop: '2px solid #111111',
            borderRadius: '50%',
            animation: 'jersifySpin 0.7s linear infinite'
          }} />
          <style>{`
            @keyframes jersifySpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
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

