import React from 'react';
import { FIGMA_ASSETS } from '../data/clubsData';

export default function LifestyleSection({ onSelectCategory }) {
  return (
    <section className="container" style={{ padding: '2.5rem 1rem' }}>
      <div className="section-header">
        <p className="section-pretitle">LIFESTYLE</p>
        <h2 className="section-title">Off the pitch</h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Lifestyle Card 1 - CLUBS */}
        <div 
          onClick={() => onSelectCategory('club-kits')}
          style={{
            background: '#F5F5F5',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            cursor: 'pointer',
            minHeight: '160px',
            transition: 'var(--transition-normal)'
          }}
          className="editorial-card"
        >
          <div style={{ width: '45%', height: '160px', flexShrink: 0 }}>
            <img 
              src={FIGMA_ASSETS.lifestyleClubs} 
              alt="Clubs Lifestyle"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ padding: '1.25rem', flexGrow: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-inter)', fontWeight: '800', fontSize: '1.2rem', color: '#111827', marginBottom: '0.25rem' }}>
              CLUBS
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              Elevated essentials for the city.
            </p>
          </div>
        </div>

        {/* Lifestyle Card 2 - NATIONALS */}
        <div 
          onClick={() => onSelectCategory('national-kits')}
          style={{
            background: '#F5F5F5',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            cursor: 'pointer',
            minHeight: '160px',
            transition: 'var(--transition-normal)'
          }}
          className="editorial-card"
        >
          <div style={{ padding: '1.25rem', flexGrow: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-inter)', fontWeight: '800', fontSize: '1.2rem', color: '#111827', marginBottom: '0.25rem' }}>
              NATIONALS
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              Finishing touches for the modern fan.
            </p>
          </div>
          <div style={{ width: '45%', height: '160px', flexShrink: 0 }}>
            <img 
              src={FIGMA_ASSETS.lifestyleNationals} 
              alt="Nationals Lifestyle"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
