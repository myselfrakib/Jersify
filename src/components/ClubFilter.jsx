import React from 'react';
import { CLUBS_DATA } from '../data/clubsData';

export default function ClubFilter({ activeClub, onSelectClub }) {
  return (
    <section className="container" style={{ paddingTop: '2.5rem', paddingBottom: '1.5rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <p className="section-pretitle">SHOP BY</p>
        <h2 className="section-title">CLUB JERSEYS</h2>
      </div>

      <div className="clubs-row">
        {/* All Clubs Option */}
        <div 
          className={`club-badge-btn ${activeClub === null ? 'active' : ''}`}
          onClick={() => onSelectClub(null)}
        >
          <div className="club-logo-wrap" style={{ background: '#111827', color: '#FFFFFF' }}>
            <span style={{ fontFamily: 'var(--font-inter)', fontWeight: '900', fontSize: '1.1rem' }}>
              ALL
            </span>
          </div>
          <span className="club-name">All Teams</span>
        </div>

        {/* Individual Clubs */}
        {CLUBS_DATA.map((club) => (
          <div 
            key={club.id}
            className={`club-badge-btn ${activeClub === club.id ? 'active' : ''}`}
            onClick={() => onSelectClub(activeClub === club.id ? null : club.id)}
          >
            <div className="club-logo-wrap">
              <img src={club.logoUrl} alt={club.name} className="club-logo-img" />
            </div>
            <span className="club-name">{club.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
