import React from 'react';
import { FIGMA_ASSETS } from '../data/clubsData';

export default function EditorialSection({ onExplore }) {
  return (
    <section className="container" style={{ padding: '2.5rem 1rem' }}>
      <div className="section-header">
        <h2 className="section-title">Curated for the season</h2>
      </div>

      <div className="editorial-grid">
        {/* Editorial Card 1 - Premium Packaging */}
        <div className="editorial-card" onClick={onExplore} style={{ cursor: 'pointer' }}>
          <img 
            src={FIGMA_ASSETS.editorialPackaging} 
            alt="Premium Packaging" 
            className="editorial-card-img" 
          />
          <div className="editorial-card-overlay">
            <span style={{ 
              fontFamily: 'var(--font-inter)', 
              fontSize: '0.7rem', 
              fontWeight: 800, 
              color: 'var(--color-accent)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}>
              SPECIAL PRESENTATION
            </span>
            <h3 className="editorial-card-title">PREMIUM PACKAGING</h3>
            <p className="editorial-card-desc">Unbox elegance with every jersey.</p>
          </div>
        </div>

        {/* Editorial Card 2 - Premium Quality */}
        <div className="editorial-card" onClick={onExplore} style={{ cursor: 'pointer' }}>
          <img 
            src={FIGMA_ASSETS.editorialQuality} 
            alt="Quality you can wear" 
            className="editorial-card-img" 
          />
          <div className="editorial-card-overlay">
            <span style={{ 
              fontFamily: 'var(--font-inter)', 
              fontSize: '0.7rem', 
              fontWeight: 800, 
              color: '#3B82F6',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}>
              CRAFTSMANSHIP
            </span>
            <h3 className="editorial-card-title">Quality you can wear</h3>
            <p className="editorial-card-desc">Premium quality, made to be worn with pride.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
