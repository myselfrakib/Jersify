import React from 'react';
import { ArrowRight } from 'lucide-react';
import { FIGMA_ASSETS } from '../data/clubsData';

export default function GoodOldKitsSection({ onFilterRetro }) {
  return (
    <section className="container" style={{ padding: '2.5rem 1rem' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p className="section-pretitle">Old Jerseys, Forever relevant.</p>
          <h2 className="section-title">GOOD OLD KITS</h2>
        </div>
        <button 
          className="btn btn-outline" 
          onClick={onFilterRetro}
          style={{ color: '#111827', borderColor: '#111827', padding: '0.5rem 1.25rem' }}
        >
          View All Retro <ArrowRight size={16} />
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        <div 
          onClick={onFilterRetro}
          style={{
            position: 'relative',
            height: '420px',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            cursor: 'pointer',
            border: '1px solid var(--color-border)'
          }}
        >
          <img 
            src={FIGMA_ASSETS.goodOldKits1} 
            alt="Classic Vintage Kit"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '1.5rem',
            color: '#FFFFFF'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-accent)', letterSpacing: '0.1em' }}>
              VINTAGE COLLECTION
            </span>
            <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: '1.4rem', fontWeight: '800' }}>
              GOOD OLD KITS
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#D1D5DB' }}>
              Classic Roma & European throwbacks
            </p>
          </div>
        </div>

        <div 
          onClick={onFilterRetro}
          style={{
            position: 'relative',
            height: '420px',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            cursor: 'pointer',
            border: '1px solid var(--color-border)'
          }}
        >
          <img 
            src={FIGMA_ASSETS.goodOldKits2} 
            alt="Retro Football Heritage"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '1.5rem',
            color: '#FFFFFF'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-accent)', letterSpacing: '0.1em' }}>
              HERITAGE EDITIONS
            </span>
            <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: '1.4rem', fontWeight: '800' }}>
              RETRO CLASSICS
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#D1D5DB' }}>
              Barcelona, AC Milan & historic kits
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
