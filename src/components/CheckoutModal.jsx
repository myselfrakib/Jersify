import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard, Truck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rtdb, ref, set } from '../firebase';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  checkoutData, 
  user,
  onOrderSuccess 
}) {
  if (!isOpen || !checkoutData) return null;

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'partial_cod'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  // Partial COD Calculations
  const subtotal = checkoutData.subtotal || 0;
  const discount = checkoutData.discount || 0;
  const productNetPrice = Math.max(0, subtotal - discount);
  const halfProduct = Math.round(productNetPrice * 0.5);
  const remainingProduct = productNetPrice - halfProduct;
  const partialPaidNow = halfProduct + 120;
  const partialDueOnDelivery = remainingProduct;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderId = 'JRS-' + Date.now();
    const isPartial = formData.paymentMethod === 'partial_cod';

    const paidNowAmt = isPartial ? partialPaidNow : checkoutData.total;
    const dueOnDeliveryAmt = isPartial ? partialDueOnDelivery : 0;
    const rawPhone = formData.phone.trim();
    const cleanDigits = rawPhone.replace(/^\+?91\s*/, '').replace(/[^0-9]/g, '');
    const savedPhone = cleanDigits.length > 0 ? `+91 ${cleanDigits}` : rawPhone;

    const newOrder = {
      orderId,
      customerName: formData.name,
      email: formData.email,
      phone: savedPhone,
      address: fullAddress,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      paymentMethod: isPartial ? 'PARTIAL COD' : formData.paymentMethod.toUpperCase(),
      items: checkoutData.cartItems,
      subtotal: checkoutData.subtotal,
      discount: checkoutData.discount,
      shipping: checkoutData.shipping,
      total: checkoutData.total,
      paidNowAmount: paidNowAmt,
      dueOnDeliveryAmount: dueOnDeliveryAmt,
      status: 'pending',
      createdAt: new Date().toISOString(),
      userId: user?.uid || 'guest'
    };

    try {
      // Save order to Realtime Database (RTDB)
      await set(ref(rtdb, `orders/${orderId}`), newOrder);
    } catch (err) {
      console.warn('Saved order locally due to fallback:', err);
    }

    const payload = {
      items: checkoutData.cartItems,
      address: fullAddress,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      country: 'India',
      subtotal: checkoutData.subtotal,
      discount: checkoutData.discount,
      shipping: checkoutData.shipping,
      paymentMethod: formData.paymentMethod,
      uid: user?.uid || 'guest',
      userEmail: user?.email || formData.email,
      name: formData.name,
      phone: savedPhone,
      email: formData.email,
      selectedSize: checkoutData.cartItems?.[0]?.selectedSize || 'M',
      ...(isPartial && {
        pcodCharge: 120,
        pcodPayNow: partialPaidNow,
        pcodPayOnDelivery: partialDueOnDelivery
      })
    };

    const dataB64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const bookingBase = isLocal ? '/jersifybooking.html' : 'https://waveridrentals.vercel.app/jersifybooking.html';

    const bookingUrl = `${bookingBase}?oid=${encodeURIComponent(orderId)}`
      + `&amt=${paidNowAmt}`
      + `&n=${encodeURIComponent(formData.name)}`
      + `&e=${encodeURIComponent(formData.email)}`
      + `&ph=${encodeURIComponent(savedPhone)}`
      + `&sz=${encodeURIComponent(checkoutData.cartItems?.[0]?.selectedSize || 'M')}`
      + `&uid=${encodeURIComponent(user?.uid || 'guest')}`
      + `&ue=${encodeURIComponent(formData.email)}`
      + `&pm=${encodeURIComponent(formData.paymentMethod)}`
      + `&d=${encodeURIComponent(dataB64)}`;

    window.location.href = bookingUrl;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            background: '#F3F4F6',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {orderComplete ? (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <CheckCircle2 size={64} color="#10B981" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-inter)', fontWeight: 800, fontSize: '1.6rem', color: '#111827', marginBottom: '0.5rem' }}>
              ORDER CONFIRMED!
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '1.5rem' }}>
              Order ID: <strong style={{ color: '#111827' }}>{orderComplete.orderId}</strong>
            </p>

            <div style={{ background: '#F9FAFB', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '1rem', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <p><strong>Deliver to:</strong> {orderComplete.customerName}</p>
              <p>{orderComplete.address}, {orderComplete.city} - {orderComplete.pincode}</p>
              <p style={{ marginTop: '0.5rem' }}><strong>Payment Method:</strong> {orderComplete.paymentMethod === 'partial_cod' ? 'Partial COD' : orderComplete.paymentMethod.toUpperCase()}</p>
              {orderComplete.paymentMethod === 'partial_cod' ? (
                <p><strong>Paid Now:</strong> ₹{orderComplete.paidNowAmount} | <strong>Due at Delivery:</strong> ₹{orderComplete.dueOnDeliveryAmount}</p>
              ) : (
                <p><strong>Total Amount:</strong> ₹{orderComplete.total}</p>
              )}
            </div>

            <button className="btn btn-primary" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div style={{ padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-inter)', fontWeight: 800, fontSize: '1.3rem', textTransform: 'uppercase', marginBottom: '1.25rem', color: '#111827' }}>
              CHECKOUT DETAILS
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>FULL NAME</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PHONE NUMBER</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>DELIVERY ADDRESS</label>
                <textarea
                  name="address"
                  required
                  rows={2}
                  placeholder="Flat/House No., Street Name, Landmark"
                  value={formData.address}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>CITY</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>STATE</label>
                  <input
                    type="text"
                    name="state"
                    required
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PINCODE</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    placeholder="400001"
                    value={formData.pincode}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, display: 'block', marginBottom: '0.5rem' }}>PAYMENT METHOD</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: formData.paymentMethod === 'partial_cod' ? '2px solid #111827' : '1px solid var(--color-border)',
                    background: formData.paymentMethod === 'partial_cod' ? '#F9FAFB' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="partial_cod" 
                      checked={formData.paymentMethod === 'partial_cod'} 
                      onChange={handleChange}
                    />
                    <Truck size={18} /> Partial COD (50% + ₹120 now)
                  </label>

                  <label style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: formData.paymentMethod === 'online' ? '2px solid #111827' : '1px solid var(--color-border)',
                    background: formData.paymentMethod === 'online' ? '#F9FAFB' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="online" 
                      checked={formData.paymentMethod === 'online'} 
                      onChange={handleChange}
                    />
                    <CreditCard size={18} /> Full Prepaid Online
                  </label>
                </div>

                {formData.paymentMethod === 'partial_cod' && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '4px', fontSize: '0.8rem', color: '#92400E' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Pay Now Online (50% product + ₹120 delivery):</span>
                      <strong>₹{partialPaidNow}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Pay at Delivery (50% balance product):</span>
                      <strong>₹{partialDueOnDelivery}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Total Highlight */}
              <div style={{ background: '#111827', color: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 700 }}>
                    {formData.paymentMethod === 'partial_cod' ? 'PAY NOW ONLINE' : 'TOTAL PAYABLE'}
                  </span>
                  <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 900, fontSize: '1.4rem' }}>
                    ₹{formData.paymentMethod === 'partial_cod' ? partialPaidNow : checkoutData.total}
                  </p>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-accent" 
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem' }}
                >
                  {isSubmitting ? 'Processing...' : 'Place Order Now'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
