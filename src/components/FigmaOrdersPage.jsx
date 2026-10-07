import React, { useEffect, useState } from 'react';
import { rtdb, ref, get } from '../firebase';

const imgJerseyPhoto = "http://localhost:3845/assets/f43a4e3b049382f36975b7b65e8e9cbd3e4c9715.png";
const imgBack = "http://localhost:3845/assets/5477904d734c4ea184f72d77c9401d63dfc00eba.svg";
const imgShoppingBag = "http://localhost:3845/assets/722dc33ce4e6a8b7e63a5465d96ac31089753cbf.svg";
const imgHelp = "http://localhost:3845/assets/b7733692eadca0a450bc20abcf29479cd70463b3.svg";
const imgOpenHelp = "http://localhost:3845/assets/c927a7e20e5a97c89fe05a37697866529705c469.svg";
const imgHome = "http://localhost:3845/assets/770d6e8de263da4c03f4e35592767143b42b118e.svg";
const imgUser = "http://localhost:3845/assets/2cca44153aa7147baae8f4ea673f094d77907545.svg";

export default function FigmaOrdersPage({ 
  user,
  onBack, 
  onOpenCart, 
  onNavigateHome, 
  onNavigateShop 
}) {
  const [realOrders, setRealOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      try {
        setLoading(true);
        const ordersSnapshot = await get(ref(rtdb, 'orders'));
        if (ordersSnapshot.exists()) {
          const allOrders = ordersSnapshot.val();
          const userOrdersList = Object.values(allOrders).filter(
            o => o.userId === user.uid || o.email === user.email
          );
          setRealOrders(userOrdersList);
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
    <div style={{ width: '100%', maxWidth: '393px', margin: '0 auto', background: '#FFFFFF', position: 'relative', overflowX: 'hidden', minHeight: '1450px', paddingBottom: '60px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      {/* Orders Navigation Header */}
      <div style={{ borderBottom: '1px solid #E5E7EB', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <img src={imgBack} alt="Back" style={{ width: '22px', height: '22px' }} />
        </button>
        <p style={{ fontFamily: 'Karla', fontSize: '18px', color: '#111111' }}>
          My orders
        </p>
        <button onClick={onOpenCart} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <img src={imgShoppingBag} alt="Bag" style={{ width: '22px', height: '22px' }} />
        </button>
      </div>

      {/* Orders Heading */}
      <div style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '24px', color: '#111111' }}>
            Your orders
          </h1>
          <div style={{ background: '#EDDBDB', padding: '5px 10px' }}>
            <span style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333' }}>
              Sample orders
            </span>
          </div>
        </div>
        <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280', lineHeight: '18px' }}>
          Track deliveries, returns and past orders
        </p>
        <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#6B7280', lineHeight: '17px' }}>
          Illustrative orders, not purchase history.
        </p>
      </div>

      {/* Active orders Section */}
      <div style={{ padding: '12px 24px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '20px', color: '#111111' }}>
            Active orders
          </h2>
          <span style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>
            2 orders
          </span>
        </div>

        {/* Order 1: #DEMO-1003 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', color: '#111111' }}>
                #DEMO-1003
              </span>
              <div style={{ background: '#EDDBDB', padding: '5px 10px' }}>
                <span style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333' }}>
                  In transit
                </span>
              </div>
            </div>
            <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>
              Placed 1 Oct 2026
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '88px', height: '127px', flexShrink: 0 }}>
              <img src={imgJerseyPhoto} alt="Argentina Jersey" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontFamily: 'Karla', fontSize: '14px', color: '#111111', lineHeight: '19px' }}>
                ARGENTINA HOME 26/27 | FAN VERSION
              </h4>
              <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>
                Size: M  ·  Qty: 1
              </p>
              <p style={{ fontFamily: 'Karla', fontSize: '16px', color: '#111111' }}>
                ₹650
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', color: '#111111' }}>
              Estimated delivery · 5 Oct
            </p>
            <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280', lineHeight: '18px' }}>
              Dispatched 2 Oct · On the way to you
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'Karla', fontSize: '14px', color: '#333333' }}>Order total · 1 item</p>
              <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#6B7280' }}>Taxes included · Shipping ₹0</p>
            </div>
            <span style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '18px', color: '#111111' }}>
              ₹650
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ flex: 1, height: '44px', background: '#000000', color: '#FFFFFF', border: 'none', fontFamily: 'Karla', fontSize: '14px', cursor: 'pointer' }}>
              Track order
            </button>
            <button style={{ flex: 1, height: '44px', background: '#FFFFFF', color: '#111111', border: '0.7px solid #000000', fontFamily: 'Karla', fontSize: '14px', cursor: 'pointer' }}>
              View details
            </button>
          </div>
        </div>

        <div style={{ height: '1px', background: '#E5E7EB', width: '100%' }} />

        {/* Order 2: #DEMO-0923 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', color: '#111111' }}>
                #DEMO-0923
              </span>
              <div style={{ background: '#EDDBDB', padding: '5px 10px' }}>
                <span style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333' }}>
                  Return requested
                </span>
              </div>
            </div>
            <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>
              Placed 23 Sep 2026
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '88px', height: '127px', flexShrink: 0 }}>
              <img src={imgJerseyPhoto} alt="Argentina Jersey" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontFamily: 'Karla', fontSize: '14px', color: '#111111', lineHeight: '19px' }}>
                ARGENTINA HOME 26/27 | FAN VERSION
              </h4>
              <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>
                Size: L  ·  Qty: 1
              </p>
              <p style={{ fontFamily: 'Karla', fontSize: '16px', color: '#111111' }}>
                ₹650
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', color: '#111111' }}>
              Pickup scheduled · 4 Oct
            </p>
            <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280', lineHeight: '18px' }}>
              Delivered 27 Sep · Return requested 2 Oct
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'Karla', fontSize: '14px', color: '#333333' }}>Order total · 1 item</p>
              <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#6B7280' }}>Taxes included · Shipping ₹0</p>
            </div>
            <span style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '18px', color: '#111111' }}>
              ₹650
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ flex: 1, height: '44px', background: '#000000', color: '#FFFFFF', border: 'none', fontFamily: 'Karla', fontSize: '14px', cursor: 'pointer' }}>
              Track return
            </button>
            <button style={{ flex: 1, height: '44px', background: '#FFFFFF', color: '#111111', border: '0.7px solid #000000', fontFamily: 'Karla', fontSize: '14px', cursor: 'pointer' }}>
              View details
            </button>
          </div>
        </div>
      </div>

      {/* Past orders Section */}
      <div style={{ borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '20px', color: '#111111' }}>
            Past orders
          </h2>
          <span style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>
            1 order
          </span>
        </div>

        {/* Order 3: #DEMO-0925 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', color: '#111111' }}>
                #DEMO-0925
              </span>
              <div style={{ background: '#F9FAFB', padding: '5px 10px', border: '1px solid #E5E7EB' }}>
                <span style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333' }}>
                  Delivered
                </span>
              </div>
            </div>
            <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>
              Placed 25 Sep 2026
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '88px', height: '127px', flexShrink: 0 }}>
              <img src={imgJerseyPhoto} alt="Argentina Jersey" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontFamily: 'Karla', fontSize: '14px', color: '#111111', lineHeight: '19px' }}>
                ARGENTINA HOME 26/27 | FAN VERSION
              </h4>
              <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>
                Size: M  ·  Qty: 1
              </p>
              <p style={{ fontFamily: 'Karla', fontSize: '16px', color: '#111111' }}>
                ₹650
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', color: '#111111' }}>
              Delivered · 30 Sep
            </p>
            <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280', lineHeight: '18px' }}>
              Package delivered · Paid online
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'Karla', fontSize: '14px', color: '#333333' }}>Order total · 1 item</p>
              <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#6B7280' }}>Taxes included · Shipping ₹0</p>
            </div>
            <span style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '18px', color: '#111111' }}>
              ₹650
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ flex: 1, height: '44px', background: '#FFFFFF', color: '#111111', border: '0.7px solid #000000', fontFamily: 'Karla', fontSize: '14px', cursor: 'pointer' }}>
              View details
            </button>
            <button style={{ flex: 1, height: '44px', background: '#FFFFFF', color: '#111111', border: '0.7px solid #000000', fontFamily: 'Karla', fontSize: '14px', cursor: 'pointer' }}>
              Request a return
            </button>
          </div>
        </div>
      </div>

      {/* Help & Support Footer */}
      <div style={{ padding: '24px 24px 32px' }}>
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
