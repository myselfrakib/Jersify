import React from 'react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import ImageWithSpinner from './ImageWithSpinner';

export default function ProductCard({ 
  product, 
  onSelectProduct, 
  isWishlisted, 
  onToggleWishlist,
  onQuickAdd
}) {
  return (
    <div className="product-card">
      <div className="product-media" onClick={() => onSelectProduct(product)} style={{ cursor: 'pointer' }}>
        <ImageWithSpinner 
          src={product.imgUrl || product.images?.[0]} 
          alt={product.name} 
          className="product-img"
        />


        {/* Badge Overlay */}
        {product.badge ? (
          <span className="product-badge">{product.badge}</span>
        ) : product.category === 'Retro' ? (
          <span className="product-badge" style={{ background: '#D4AF37', color: '#111' }}>RETRO</span>
        ) : product.playerVersion ? (
          <span className="product-badge" style={{ background: '#3B82F6' }}>PLAYER ISSUE</span>
        ) : null}

        {/* Wishlist Button */}
        <button 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={isWishlisted ? "#EF4444" : "none"} color={isWishlisted ? "#EF4444" : "#6B7280"} />
        </button>
      </div>

      <div className="product-info">
        <span className="product-team">{product.team}</span>
        <h3 className="product-title" onClick={() => onSelectProduct(product)} style={{ cursor: 'pointer' }}>
          {product.name}
        </h3>
        
        <p className="product-meta">
          {product.type || (product.category === 'Retro' ? 'Retro · Fan version' : 'Fan version · S–XXL')}
        </p>

        <div className="product-price-row">
          <span className="product-price">₹{product.price}</span>
          
          <button 
            className="icon-btn" 
            onClick={() => onQuickAdd(product)}
            title="Quick Add to Cart"
            style={{
              background: '#111827',
              color: '#FFFFFF',
              width: '32px',
              height: '32px'
            }}
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
