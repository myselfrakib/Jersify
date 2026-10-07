import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { rtdb, ref, set } from '../firebase';

import { 
  imgBack, 
  imgShoppingBag, 
  imgHome, 
  imgUser 
} from '../assets/svgIcons';

export default function FigmaCheckoutPage({
  user,
  cartItems = [],
  checkoutData,
  onBack,
  onOrderSuccess,
  onOpenCart,
  onNavigateHome,
  onNavigateShop
}) {
  const items = checkoutData?.cartItems || cartItems;
  const subtotal = checkoutData?.subtotal || items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = checkoutData?.discount || 0;
  const shipping = checkoutData?.shipping !== undefined ? checkoutData.shipping : (subtotal > 1999 ? 0 : 69);
  const standardTotal = Math.max(0, subtotal - discount + shipping);

  // Partial COD calculation: 50% product price + 120 delivery charge paid now, 50% product price paid on delivery
  const productNetPrice = Math.max(0, subtotal - discount);
  const halfProductPrice = Math.round(productNetPrice * 0.5);
  const remainingProductPrice = productNetPrice - halfProductPrice;

  const partialCodPayNow = halfProductPrice + 120;
  const partialCodDueDelivery = remainingProductPrice;
  const partialCodTotal = partialCodPayNow + partialCodDueDelivery;

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    phone: '',
    pincode: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    paymentMethod: 'upi' // 'upi' | 'card' | 'partial_cod'
  });

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.line1 || !formData.pincode || !formData.phone) {
      alert('Please complete all required shipping fields.');
      return;
    }
    setShowPaymentGateway(true);
  };

  const handleCompletePayment = async () => {
    setIsProcessingPayment(true);
    const orderId = 'JRS-' + Math.floor(100000 + Math.random() * 900000);

    const isPartialCod = formData.paymentMethod === 'partial_cod';
    const paidNowAmt = isPartialCod ? partialCodPayNow : standardTotal;
    const dueOnDeliveryAmt = isPartialCod ? partialCodDueDelivery : 0;
    const orderTotalAmt = isPartialCod ? partialCodTotal : standardTotal;

    const newOrder = {
      orderId,
      customerName: formData.fullName,
      email: user?.email || 'fan@jersify.online',
      phone: formData.phone,
      address: `${formData.line1}, ${formData.line2 ? formData.line2 + ', ' : ''}${formData.city}, ${formData.state} - ${formData.pincode}`,
      paymentMethod: isPartialCod ? 'PARTIAL COD' : formData.paymentMethod.toUpperCase(),
      paymentStatus: isPartialCod ? `Partial Paid (₹${paidNowAmt} Online Advance, ₹${dueOnDeliveryAmt} Due on Delivery)` : 'Paid Online',
      paidNow: paidNowAmt,
      dueOnDelivery: dueOnDeliveryAmt,
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        selectedSize: i.selectedSize || 'M',
        customName: i.customName || '',
        customNumber: i.customNumber || ''
      })),
      subtotal,
      discount,
      shipping: isPartialCod ? 120 : shipping,
      total: orderTotalAmt,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      userId: user?.uid || 'authenticated-user'
    };

    try {
      await set(ref(rtdb, `orders/${orderId}`), newOrder);
    } catch (err) {
      console.warn('Saved order locally:', err);
    }

    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowPaymentGateway(false);
      setOrderSuccess(newOrder);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      if (onOrderSuccess) onOrderSuccess();
    }, 1500);
  };

  if (orderSuccess) {
    return (
      <div style={{ width: '100%', maxWidth: '393px', margin: '0 auto', background: '#FFFFFF', position: 'relative', overflowX: 'hidden', minHeight: '850px', paddingBottom: '70px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
        <div style={{ borderBottom: '1px solid #E5E7EB', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 19px' }}>
          <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '18px', color: '#111111' }}>
            Order Confirmed! 🎉
          </p>
        </div>

        <div style={{ padding: '32px 19px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ width: '72px', height: '72px', background: '#D1FAE5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '36px' }}>
            ✓
          </div>

          <div>
            <h2 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '24px', color: '#111111', marginBottom: '4px' }}>
              Thank you for your order!
            </h2>
            <p style={{ fontFamily: 'Karla', fontSize: '14px', color: '#6B7280' }}>
              Order #{orderSuccess.orderId} is confirmed and in production.
            </p>
          </div>

          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Karla', fontSize: '12px', color: '#6B7280' }}>DELIVERY ADDRESS</span>
              <span style={{ fontFamily: 'Karla', fontSize: '12px', color: '#10B981', fontWeight: 700 }}>EXPRESS DISPATCH</span>
            </div>
            <p style={{ fontFamily: 'Karla', fontSize: '14px', color: '#111111', fontWeight: 700 }}>
              {orderSuccess.customerName}
            </p>
            <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#4B5563', lineHeight: '18px' }}>
              {orderSuccess.address}
            </p>
            {orderSuccess.dueOnDelivery > 0 ? (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '10px', marginTop: '6px', fontSize: '12px', color: '#1E40AF' }}>
                <p><strong>Pay Now Online:</strong> ₹{orderSuccess.paidNow} (Advance + Delivery)</p>
                <p><strong>Due on Doorstep Delivery:</strong> ₹{orderSuccess.dueOnDelivery} (Cash)</p>
                <p style={{ fontWeight: 700, marginTop: '2px' }}>Total Order Value: ₹{orderSuccess.total}</p>
              </div>
            ) : (
              <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#111111', fontWeight: 600, marginTop: '4px' }}>
                Total Paid Online: ₹{orderSuccess.total} ({orderSuccess.paymentMethod})
              </p>
            )}
          </div>

          <button
            onClick={onNavigateHome}
            style={{ width: '100%', height: '48px', background: '#000000', color: '#FFFFFF', fontFamily: 'Karla', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', marginTop: '12px' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '393px', margin: '0 auto', background: '#FFFFFF', position: 'relative', overflowX: 'hidden', minHeight: '950px', paddingBottom: '70px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #E5E7EB', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 19px', position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 40 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <img src={imgBack} alt="Back" style={{ width: '22px', height: '22px' }} />
        </button>
        <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '18px', color: '#111111' }}>
          Checkout & Shipping
        </p>
        <button onClick={onOpenCart} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <img src={imgShoppingBag} alt="Bag" style={{ width: '22px', height: '22px' }} />
        </button>
      </div>

      <form onSubmit={handleProceedToPayment}>
        {/* Shipping Address Section */}
        <div style={{ padding: '24px 19px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '20px', color: '#111111' }}>
            1. Delivery Address
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#111111', fontWeight: 700 }}>FULL NAME *</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Morgan"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              style={{ height: '42px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#111111', fontWeight: 700 }}>MOBILE NUMBER *</label>
              <input
                type="text"
                required
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ height: '42px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#111111', fontWeight: 700 }}>PINCODE *</label>
              <input
                type="text"
                required
                placeholder="e.g. 400050"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                style={{ height: '42px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#111111', fontWeight: 700 }}>FLAT / HOUSE NO. / BUILDING *</label>
            <input
              type="text"
              required
              placeholder="e.g. 42 Palm Crest Heights, Apt 4B"
              value={formData.line1}
              onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
              style={{ height: '42px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#111111', fontWeight: 700 }}>STREET / AREA / LOCALITY</label>
            <input
              type="text"
              placeholder="e.g. Bandra West, Hill Road"
              value={formData.line2}
              onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
              style={{ height: '42px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#111111', fontWeight: 700 }}>CITY</label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                style={{ height: '42px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#111111', fontWeight: 700 }}>STATE</label>
              <input
                type="text"
                placeholder="e.g. Maharashtra"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                style={{ height: '42px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Order Summary Breakdown */}
        <div style={{ borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '20px 19px', background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '18px', color: '#111111' }}>
            2. Order Summary ({items.reduce((a,b) => a + (b.quantity || 1), 0)} items)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontFamily: 'Karla' }}>
                <span style={{ color: '#111111', fontWeight: 600 }}>
                  {item.name} ({item.selectedSize || 'M'}) x{item.quantity || 1}
                </span>
                <span style={{ fontWeight: 700, color: '#111111' }}>₹{item.price * (item.quantity || 1)}</span>
              </div>
            ))}
          </div>

          <div style={{ height: '1px', background: '#E5E7EB', margin: '4px 0' }} />

          {formData.paymentMethod === 'partial_cod' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: 'Karla', color: '#6B7280' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: 'Karla', color: '#10B981', fontWeight: 700 }}>
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: 'Karla', color: '#6B7280' }}>
                <span>Partial COD Handling & Delivery Fee</span>
                <span>₹120</span>
              </div>
              <div style={{ height: '1px', background: '#E5E7EB', margin: '2px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontFamily: 'Karla', fontWeight: 700, color: '#10B981' }}>
                <span>PAY NOW ONLINE (50% Product + ₹120 Fee)</span>
                <span>₹{partialCodPayNow}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontFamily: 'Karla', fontWeight: 700, color: '#2563EB' }}>
                <span>PAY ON DELIVERY (Remaining 50% Cash)</span>
                <span>₹{partialCodDueDelivery}</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: 'Karla', color: '#6B7280' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: 'Karla', color: '#10B981', fontWeight: 700 }}>
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: 'Karla', color: '#6B7280' }}>
                <span>Shipping</span>
                <span>{shipping === 0 ? <strong style={{ color: '#10B981' }}>FREE (Over ₹1999)</strong> : `₹${shipping}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontFamily: 'Karla', fontWeight: 700, color: '#111111', paddingTop: '6px', borderTop: '1px solid #E5E7EB' }}>
                <span>TOTAL AMOUNT</span>
                <span>₹{standardTotal}</span>
              </div>
            </>
          )}
        </div>

        {/* Payment Method Selector */}
        <div style={{ padding: '24px 19px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '20px', color: '#111111' }}>
            3. Payment Method
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ border: formData.paymentMethod === 'upi' ? '1.5px solid #111111' : '1px solid #E5E7EB', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: '#FFFFFF' }}>
              <input
                type="radio"
                name="payment"
                value="upi"
                checked={formData.paymentMethod === 'upi'}
                onChange={() => setFormData({ ...formData, paymentMethod: 'upi' })}
              />
              <div style={{ flexGrow: 1 }}>
                <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', color: '#111111' }}>
                  UPI / GPay / PhonePe / Paytm (Full Online)
                </p>
                <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#6B7280' }}>
                  Fast & secure 1-click payment with 100% buyer protection
                </p>
              </div>
            </label>

            <label style={{ border: formData.paymentMethod === 'card' ? '1.5px solid #111111' : '1px solid #E5E7EB', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: '#FFFFFF' }}>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={formData.paymentMethod === 'card'}
                onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
              />
              <div style={{ flexGrow: 1 }}>
                <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', color: '#111111' }}>
                  Credit / Debit Card / NetBanking
                </p>
                <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#6B7280' }}>
                  Visa, Mastercard, RuPay, Maestro & NetBanking
                </p>
              </div>
            </label>

            <label style={{ border: formData.paymentMethod === 'partial_cod' ? '1.5px solid #111111' : '1px solid #E5E7EB', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: formData.paymentMethod === 'partial_cod' ? '#F9FAFB' : '#FFFFFF' }}>
              <input
                type="radio"
                name="payment"
                value="partial_cod"
                checked={formData.paymentMethod === 'partial_cod'}
                onChange={() => setFormData({ ...formData, paymentMethod: 'partial_cod' })}
              />
              <div style={{ flexGrow: 1 }}>
                <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', color: '#111111' }}>
                  ⚡ Partial COD (50% Advance Online + ₹120 Delivery Fee, 50% Cash on Delivery)
                </p>
                <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#4B5563', marginTop: '2px' }}>
                  Pay <strong>₹{partialCodPayNow}</strong> now online (50% product + ₹120 delivery fee) & <strong>₹{partialCodDueDelivery}</strong> cash at doorstep delivery.
                </p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            style={{ width: '100%', height: '48px', background: '#000000', color: '#FFFFFF', fontFamily: 'Karla', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', marginTop: '8px' }}
          >
            {formData.paymentMethod === 'partial_cod'
              ? `PROCEED TO PAY ₹${partialCodPayNow} NOW (PARTIAL COD) →`
              : `PROCEED TO PAYMENT → ₹${standardTotal}`}
          </button>
        </div>
      </form>

      {/* Interactive Payment Gateway Overlay Modal */}
      {showPaymentGateway && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '360px', background: '#FFFFFF', padding: '24px', borderRadius: '4px', boxShadow: '0 10px 25px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontFamily: 'Karla', fontSize: '11px', color: '#6B7280', fontWeight: 700 }}>SECURE PAYMENT GATEWAY</span>
                <h3 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '18px', color: '#111111' }}>Jersify Pay</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '18px', color: '#111111' }}>₹{activePayNow}</span>
                {formData.paymentMethod === 'partial_cod' && (
                  <p style={{ fontSize: '10px', color: '#10B981', fontWeight: 700 }}>Partial COD Advance</p>
                )}
              </div>
            </div>

            {formData.paymentMethod === 'partial_cod' && (
              <div style={{ padding: '12px', background: '#FEF3C7', border: '1px solid #F59E0B', color: '#92400E', fontSize: '12px', fontFamily: 'Karla', lineHeight: '18px' }}>
                <strong>⚡ Partial COD Advance Payment</strong><br />
                Pay <strong>₹{partialCodPayNow}</strong> now online via UPI/Card to confirm order dispatch. Remaining balance <strong>₹{partialCodDueDelivery}</strong> will be collected at doorstep delivery.
              </div>
            )}

            {(formData.paymentMethod === 'upi' || formData.paymentMethod === 'partial_cod') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#374151', fontWeight: 700 }}>SELECT YOUR UPI APP FOR PAYMENT:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['gpay', 'phonepe', 'paytm'].map(app => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setSelectedUpiApp(app)}
                      style={{
                        padding: '10px 4px',
                        border: selectedUpiApp === app ? '2px solid #111111' : '1px solid #D1D5DB',
                        background: selectedUpiApp === app ? '#F3F4F6' : '#FFFFFF',
                        fontFamily: 'Karla',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        cursor: 'pointer'
                      }}
                    >
                      {app}
                    </button>
                  ))}
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <p style={{ fontFamily: 'Karla', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>UPI ID / VPA</p>
                  <p style={{ fontFamily: 'Karla', fontSize: '14px', fontWeight: 700, color: '#111111' }}>jersify.{formData.phone ? formData.phone.replace(/[^0-9]/g, '') : '9876543210'}@okaxis</p>
                </div>
              </div>
            )}

            {formData.paymentMethod === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Card Number (4000 0000 0000 0000)" style={{ height: '40px', padding: '0 10px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '13px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="MM/YY" style={{ flex: 1, height: '40px', padding: '0 10px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '13px' }} />
                  <input type="password" placeholder="CVV" style={{ flex: 1, height: '40px', padding: '0 10px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '13px' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleCompletePayment}
                style={{ flex: 1, height: '44px', background: '#000000', color: '#FFFFFF', border: 'none', fontFamily: 'Karla', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
              >
                {isProcessingPayment ? 'PROCESSING PAYMENT...' : `PAY ₹${activePayNow} NOW`}
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => setShowPaymentGateway(false)}
                style={{ height: '44px', padding: '0 16px', background: '#FFFFFF', color: '#111111', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '393px', height: '56px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 50 }}>
        <button onClick={onNavigateHome} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', background: 'none', border: 'none' }}>
          <img src={imgHome} alt="Home" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Home</span>
        </button>
        <button onClick={onNavigateShop} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', background: 'none', border: 'none' }}>
          <img src={imgShoppingBag} alt="Shop" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Shop</span>
        </button>
        <button onClick={onOpenCart} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', background: 'none', border: 'none' }}>
          <img src={imgShoppingBag} alt="Bag" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Bag</span>
        </button>
        <button onClick={onBack} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', background: 'none', border: 'none' }}>
          <img src={imgUser} alt="Profile" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', fontWeight: 500, color: '#111827' }}>Profile</span>
        </button>
      </div>
    </div>
  );
}
