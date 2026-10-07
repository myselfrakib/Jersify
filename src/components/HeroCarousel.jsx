import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_BANNERS } from '../data/clubsData';

export default function HeroCarousel({ onShopNow }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % HERO_BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + HERO_BANNERS.length) % HERO_BANNERS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % HERO_BANNERS.length);
  };

  return (
    <div className="hero-slider">
      {HERO_BANNERS.map((banner, idx) => (
        <div 
          key={banner.id}
          className={`hero-slide ${idx === currentIndex ? 'active' : ''}`}
        >
          <img src={banner.image} alt={banner.title} className="hero-bg-img" />
          <div className="hero-overlay" />
          
          <div className="container" style={{ position: 'relative', zIndex: 10, width: '100%' }}>
            <div className="hero-content">
              <p className="hero-subtitle">{banner.subtitle}</p>
              <h1 className="hero-title">{banner.title}</h1>
              <p className="hero-tagline">{banner.tagline}</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-accent" onClick={onShopNow}>
                  {banner.ctaText}
                </button>
                <button className="btn btn-outline" onClick={onShopNow}>
                  View Catalog
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Carousel Arrow Controls */}
      <button 
        onClick={handlePrev}
        style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(4px)',
          color: '#FFFFFF',
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
      >
        <ChevronLeft size={24} />
      </button>

      <button 
        onClick={handleNext}
        style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(4px)',
          color: '#FFFFFF',
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
      >
        <ChevronRight size={24} />
      </button>

      {/* Carousel Dots */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        gap: '8px'
      }}>
        {HERO_BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            style={{
              width: idx === currentIndex ? '28px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: idx === currentIndex ? 'var(--color-accent)' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
}
