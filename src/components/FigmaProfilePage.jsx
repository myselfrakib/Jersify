import React from 'react';
import { 
  imgBack, 
  imgShoppingBag, 
  imgPackage, 
  imgChevronRight, 
  imgMapPin, 
  imgHeart, 
  imgCircleHelp, 
  imgLogOut, 
  imgHome, 
  imgUser 
} from '../assets/svgIcons';

export default function FigmaProfilePage({ 
  user, 
  userProfile,
  onSignOut,
  onOpenLogin, 
  onOpenCart, 
  onOpenOrders,
  onOpenAddresses,
  onOpenWishlist,
  onNavigateHome,
  onNavigateShop 
}) {
  const name = userProfile?.name || userProfile?.fullName || user?.displayName || (user?.email ? user.email.split('@')[0] : "Member");
  const email = userProfile?.email || user?.email || "";
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || (email ? email.substring(0, 2).toUpperCase() : "ME");

  return (
    <div style={{ width: '100%', maxWidth: '393px', margin: '0 auto', background: '#FFFFFF', position: 'relative', overflowX: 'hidden', minHeight: '850px', paddingBottom: '60px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      {/* Profile Navigation Bar */}
      <div style={{ borderBottom: '1px solid #E5E7EB', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 19px' }}>
        <button onClick={onNavigateHome} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <img src={imgBack} alt="Back" style={{ width: '22px', height: '22px' }} />
        </button>
        <p style={{ fontFamily: 'Karla', fontSize: '18px', color: '#111111' }}>
          My account
        </p>
        <button onClick={onOpenCart} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <img src={imgShoppingBag} alt="Bag" style={{ width: '22px', height: '22px' }} />
        </button>
      </div>

      {/* Profile Identity */}
      <div style={{ padding: '24px 19px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '24px', color: '#111111' }}>
            Your profile
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', background: '#EDDBDB', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Karla', fontSize: '24px', color: '#333333' }}>
              {initials}
            </span>
          </div>
          <div>
            <h2 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '20px', color: '#111111' }}>
              {name}
            </h2>
            {email && (
              <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>
                {email}
              </p>
            )}
          </div>
        </div>

        <button 
          onClick={onOpenOrders}
          style={{
            width: '100%',
            height: '48px',
            background: '#000000',
            color: '#FFFFFF',
            fontFamily: 'Karla',
            fontSize: '16px',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer'
          }}
        >
          Edit personal details
        </button>
      </div>

      {/* Account Destinations */}
      <div style={{ borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ padding: '20px 19px 12px' }}>
          <h3 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '20px', color: '#111111', marginBottom: '8px' }}>
            Your shopping
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* My orders */}
            <div 
              onClick={onOpenOrders}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '64px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6' }}
            >
              <img src={imgPackage} alt="My orders" style={{ width: '22px', height: '22px' }} />
              <div style={{ flexGrow: 1 }}>
                <p style={{ fontFamily: 'Karla', fontSize: '16px', color: '#111111' }}>My orders</p>
                <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>Track deliveries, returns and past orders</p>
              </div>
              <img src={imgChevronRight} alt="Chevron" style={{ width: '16px', height: '16px' }} />
            </div>

            {/* Saved addresses */}
            <div 
              onClick={onOpenAddresses}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '64px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6' }}
            >
              <img src={imgMapPin} alt="Saved addresses" style={{ width: '22px', height: '22px' }} />
              <div style={{ flexGrow: 1 }}>
                <p style={{ fontFamily: 'Karla', fontSize: '16px', color: '#111111' }}>Saved addresses</p>
                <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>Manage your delivery addresses</p>
              </div>
              <img src={imgChevronRight} alt="Chevron" style={{ width: '16px', height: '16px' }} />
            </div>

            {/* My bag */}
            <div 
              onClick={onOpenWishlist}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '64px', cursor: 'pointer' }}
            >
              <img src={imgHeart} alt="My bag" style={{ width: '22px', height: '22px' }} />
              <div style={{ flexGrow: 1 }}>
                <p style={{ fontFamily: 'Karla', fontSize: '16px', color: '#111111' }}>My bag</p>
                <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>Your saved jerseys, all in one place</p>
              </div>
              <img src={imgChevronRight} alt="Chevron" style={{ width: '16px', height: '16px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Help & support */}
      <div style={{ padding: '12px 19px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '64px', cursor: 'pointer' }}>
          <img src={imgCircleHelp} alt="Help & support" style={{ width: '22px', height: '22px' }} />
          <div style={{ flexGrow: 1 }}>
            <p style={{ fontFamily: 'Karla', fontSize: '16px', color: '#111111' }}>Help & support</p>
            <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>Shipping, returns and contact us</p>
          </div>
          <img src={imgChevronRight} alt="Chevron" style={{ width: '16px', height: '16px' }} />
        </div>
      </div>

      {/* Session Actions */}
      <div style={{ padding: '24px 19px', display: 'flex', flexDirection: 'column', gap: '16px', textOverflow: 'ellipsis' }}>
        {user ? (
          <button
            onClick={onSignOut}
            style={{
              width: '100%',
              height: '48px',
              border: '0.7px solid #000000',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: 'Karla',
              fontSize: '16px',
              color: '#111111',
              cursor: 'pointer'
            }}
          >
            <img src={imgLogOut} alt="Sign out" style={{ width: '18px', height: '18px' }} />
            Sign out
          </button>
        ) : (
          <button
            onClick={onOpenLogin || onSignOut}
            style={{
              width: '100%',
              height: '48px',
              background: '#000000',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: 'Karla',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Log in / Create account
          </button>
        )}

        <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333', textAlign: 'center', textDecoration: 'underline', cursor: 'pointer' }}>
          Privacy policy
        </p>
      </div>

      {/* Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '393px', height: '56px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 50 }}>
        <button onClick={onNavigateHome} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <img src={imgHome} alt="Home" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Home</span>
        </button>
        <button onClick={onNavigateShop} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <img src={imgShoppingBag} alt="Shop" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Shop</span>
        </button>
        <button onClick={onOpenCart} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <img src={imgShoppingBag} alt="Bag" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Bag</span>
        </button>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <img src={imgUser} alt="Profile" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', fontWeight: 500, color: '#111827' }}>Profile</span>
        </button>
      </div>
    </div>
  );
}
