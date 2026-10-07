import React from 'react';
import { FIGMA_ASSETS } from '../data/clubsData';

export default function NotBasicBanner({ onExplore }) {
  return (
    <section className="container" style={{ padding: '1.5rem 1rem' }}>
      <div 
        onClick={onExplore}
        style={{
          position: 'relative',
          height: '480px',
          width: '100%',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)'
        }}
        className="editorial-card"
      >
        <img 
          src={FIGMA_ASSETS.notBasic} 
          alt="Not Basic - Real Madrid" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '2rem',
          color: '#FFFFFF'
        }}>
          <span style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.2em',
            color: 'var(--color-accent)',
            textTransform: 'uppercase',
            marginBottom: '0.25rem'
          }}>
            SPOTLIGHT COLLECTION
          </span>
          
          <h2 style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '2.5rem',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '0.5rem'
          }}>
            Not Basic
          </h2>
          
          <p style={{
            fontSize: '1rem',
            color: '#E5E7EB',
            maxWidth: '500px',
            marginBottom: '1.25rem'
          }}>
            Football elevation for every student & fan. Crafted with gold detailing and embroidered crests.
          </p>

          <button className="btn btn-accent" style={{ width: 'fit-content' }}>
            Shop Spotlights
          </button>
        </div>
      </div>
    </section>
  );
}
