import React from 'react';

export default function Footer({ onSelectCategory }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <h2 className="footer-brand-title">JERSIFY</h2>
            <p className="footer-desc">
              Premium football jerseys, authentic club wear, retro throwbacks, and luxury streetwear for the global football community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="footer-col-title">Shop</h3>
            <ul className="footer-links">
              <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); onSelectCategory('all'); }}>All Collections</a></li>
              <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); onSelectCategory('club-kits'); }}>Club Kits</a></li>
              <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); onSelectCategory('national-kits'); }}>National Teams</a></li>
              <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); onSelectCategory('retro'); }}>Good Old Kits</a></li>
              <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); onSelectCategory('player-version'); }}>Player Issue Edition</a></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="footer-col-title">Support</h3>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Size Guide</a></li>
              <li><a href="#" className="footer-link">Shipping & Returns</a></li>
              <li><a href="#" className="footer-link">Track Order</a></li>
              <li><a href="#" className="footer-link">FAQ & Help Center</a></li>
              <li><a href="#" className="footer-link">Contact Support</a></li>
            </ul>
          </div>

          {/* Legal / Social */}
          <div>
            <h3 className="footer-col-title">About</h3>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Our Story</a></li>
              <li><a href="#" className="footer-link">Quality Guarantee</a></li>
              <li><a href="#" className="footer-link">Custom Printing</a></li>
              <li><a href="#" className="footer-link">Privacy Policy</a></li>
              <li><a href="#" className="footer-link">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} JERSIFY. All rights reserved. WEAR THE GAME.</p>
          <p style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Size Guide</span>
            <span>·</span>
            <span>Shipping & Returns</span>
            <span>·</span>
            <span>Help</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
