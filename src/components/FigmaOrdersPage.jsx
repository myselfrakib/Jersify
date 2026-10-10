import React, { useEffect, useState } from 'react';
import { rtdb, ref, get } from '../firebase';
import { 
  imgBack, 
  imgShoppingBag, 
  imgCircleHelp as imgHelp, 
  imgChevronRight as imgOpenHelp, 
  imgHome, 
  imgUser, 
  imgJerseyPhoto 
} from '../assets/svgIcons';

export default function FigmaOrdersPage({ 
  user,
  onBack, 
  onOpenCart, 
  onNavigateHome, 
  onNavigateShop 
}) {
  const [realOrders, setRealOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('jersify_cached_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const ordersSnapshot = await get(ref(rtdb, 'orders'));
        if (ordersSnapshot.exists()) {
          const allOrdersMap = ordersSnapshot.val();
          const allOrders = Object.values(allOrdersMap);
          let filtered = [];

          if (user) {
            const userPhoneClean = user.phoneNumber ? user.phoneNumber.replace(/[^0-9]/g, '').slice(-10) : '';
            const userEmailLower = user.email ? user.email.toLowerCase() : '';

            filtered = allOrders.filter(o => {
              const matchUid = o.userId === user.uid;
              const matchEmail = (o.email && userEmailLower && o.email.toLowerCase() === userEmailLower) ||
                                 (o.userEmail && userEmailLower && o.userEmail.toLowerCase() === userEmailLower);
              const matchPhone = userPhoneClean && o.phone && o.phone.replace(/[^0-9]/g, '').slice(-10) === userPhoneClean;
              return matchUid || matchEmail || matchPhone;
            });
          } else {
            try {
              const localOrderIds = JSON.parse(localStorage.getItem('jersify_placed_orders') || '[]');
              if (localOrderIds.length > 0) {
                filtered = allOrders.filter(o => localOrderIds.includes(o.orderId || o.id));
              }
            } catch (e) {}
          }

          // Sort by date descending
          filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
            const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
            return dateB - dateA;
          });

          setRealOrders(filtered);
          try {
            localStorage.setItem('jersify_cached_orders', JSON.stringify(filtered));
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Could not fetch real RTDB orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  return (
    <div style={{ width: '100%', maxWidth: '393px', margin: '0 auto', background: '#FFFFFF', position: 'relative', overflowX: 'hidden', minHeight: '850px', paddingBottom: '70px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      {/* Orders Navigation Header */}
      <div style={{ borderBottom: '1px solid #E5E7EB', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 19px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <img src={imgBack} alt="Back" style={{ width: '22px', height: '22px' }} />
        </button>
        <p style={{ fontFamily: 'Karla', fontSize: '18px', color: '#111111', fontWeight: 700 }}>
          My Orders
        </p>
        <button onClick={onOpenCart} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <img src={imgShoppingBag} alt="Bag" style={{ width: '22px', height: '22px' }} />
        </button>
      </div>

      {/* Orders Heading */}
      <div style={{ padding: '24px 19px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '24px', color: '#111111' }}>
            Your Orders
          </h1>
          <div style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '4px 10px', borderRadius: '4px' }}>
            <span style={{ fontFamily: 'Karla', fontSize: '12px', color: '#111111', fontWeight: 700 }}>
              {realOrders.length} {realOrders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </div>
        </div>
        <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280', lineHeight: '18px' }}>
          Track deliveries, items and past purchase history
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px 19px', textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: '#111111', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>Fetching your orders…</p>
        </div>
      ) : realOrders.length === 0 ? (
        <div style={{ padding: '60px 19px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '4px' }}>📦</div>
          <h3 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '18px', color: '#111111' }}>
            No orders placed yet
          </h3>
          <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280', maxWidth: '260px', lineHeight: '18px' }}>
            When you place orders, they will automatically appear here with live tracking and item details.
          </p>
          <button
            onClick={onNavigateShop}
            style={{ marginTop: '12px', padding: '12px 24px', background: '#000000', color: '#FFFFFF', border: 'none', fontFamily: 'Karla', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}
          >
            Explore Jerseys →
          </button>
        </div>
      ) : (
        <div style={{ padding: '0 19px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {realOrders.map((order, idx) => {
            const orderId = order.orderId || order.id || `JRS-${idx + 1}`;
            const isPartial = order.paymentMethod === 'PARTIAL COD' || order.paymentMethod === 'partial_cod';
            const formatDMY = (val) => {
              if (!val) return 'Recent';
              const d = new Date(val);
              if (isNaN(d.getTime())) return String(val);
              const dd = String(d.getDate()).padStart(2, '0');
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const yyyy = d.getFullYear();
              return `${dd}/${mm}/${yyyy}`;
            };
            const orderDate = order.createdAt ? formatDMY(order.createdAt) : 'Recent';
            const orderItemsList = Array.isArray(order.items) ? order.items : [];

            return (
              <div key={orderId} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '10px' }}>
                  <div>
                    <span style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', color: '#111111' }}>
                      #{orderId}
                    </span>
                    <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                      Placed on {orderDate}
                    </p>
                  </div>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: order.status === 'delivered' ? '#D1FAE5' : (order.status === 'cancelled' ? '#FEE2E2' : '#FEF3C7'),
                    color: order.status === 'delivered' ? '#065F46' : (order.status === 'cancelled' ? '#991B1B' : '#92400E'),
                    fontFamily: 'Karla',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {statusText}
                  </div>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {orderItemsList.length > 0 ? (
                    orderItemsList.map((item, itemIdx) => (
                      <div key={itemIdx} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{ width: '70px', height: '90px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', background: '#F3F4F6' }}>
                          <img
                            src={item.imgUrl || item.imageUrl || item.img || imgJerseyPhoto}
                            alt={item.name || 'Jersey'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = imgJerseyPhoto; }}
                          />
                        </div>
                        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <h4 style={{ fontFamily: 'Karla', fontWeight: 600, fontSize: '14px', color: '#111111', lineHeight: '18px' }}>
                            {item.name || 'Football Kit'}
                          </h4>
                          <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#6B7280' }}>
                            Size: {item.selectedSize || item.size || 'M'} · Qty: {item.quantity || item.qty || 1}
                          </p>
                          <p style={{ fontFamily: 'Karla', fontSize: '14px', fontWeight: 700, color: '#111111' }}>
                            ₹{item.price * (item.quantity || item.qty || 1)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>Order items processing</p>
                  )}
                </div>

                {/* Address & Payment Info */}
                <div style={{ background: '#F9FAFB', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', fontFamily: 'Karla', color: '#4B5563', lineHeight: '16px' }}>
                  <p><strong>Deliver to:</strong> {order.customerName || 'Customer'} ({order.phone || ''})</p>
                  <p style={{ marginTop: '2px' }}>{order.address || ''}</p>
                  {isPartial ? (
                    <p style={{ marginTop: '4px', color: '#92400E', fontWeight: 600 }}>
                      ⚡ Partial COD: ₹{order.paidNow || order.paidNowAmount || 0} Paid Online · ₹{order.dueOnDelivery || order.dueOnDeliveryAmount || 0} Cash on Delivery
                    </p>
                  ) : (
                    <p style={{ marginTop: '4px', color: '#059669', fontWeight: 600 }}>
                      ✓ Paid Online (Full)
                    </p>
                  )}
                </div>

                {/* Total & Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid #F3F4F6' }}>
                  <span style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>
                    Total ({orderItemsList.reduce((acc, i) => acc + (i.quantity || i.qty || 1), 0)} items)
                  </span>
                  <span style={{ fontFamily: 'Karla', fontWeight: 800, fontSize: '18px', color: '#111111' }}>
                    ₹{order.total || order.subtotal || 0}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ flex: 1, height: '40px', background: '#000000', color: '#FFFFFF', border: 'none', fontFamily: 'Karla', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    Track Order
                  </button>
                  <button style={{ flex: 1, height: '40px', background: '#FFFFFF', color: '#111111', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Help & Support Footer */}
      <div style={{ padding: '24px 19px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '64px', cursor: 'pointer', marginBottom: '8px' }}>
          <img src={imgHelp} alt="Help" style={{ width: '22px', height: '22px' }} />
          <div style={{ flexGrow: 1 }}>
            <p style={{ fontFamily: 'Karla', fontSize: '16px', color: '#111111' }}>Need help with an order?</p>
            <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>Shipping, returns and contact us</p>
          </div>
          <img src={imgOpenHelp} alt="Chevron" style={{ width: '16px', height: '16px' }} />
        </div>

        <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333', textAlign: 'center', textDecoration: 'underline', cursor: 'pointer' }}>
          Shipping & returns
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
        <button onClick={onBack} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <img src={imgUser} alt="Profile" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', fontWeight: 500, color: '#111827' }}>Profile</span>
        </button>
      </div>
    </div>
  );
}
