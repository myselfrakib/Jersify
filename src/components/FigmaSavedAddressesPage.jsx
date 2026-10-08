import React, { useState, useEffect } from 'react';
import { rtdb, ref, get, set } from '../firebase';
import { 
  imgBack, 
  imgShoppingBag, 
  imgHome, 
  imgUser, 
  imgMapPin 
} from '../assets/svgIcons';

const DEFAULT_ADDRESSES = [];

export default function FigmaSavedAddressesPage({
  user,
  onBack,
  onOpenCart,
  onNavigateHome,
  onNavigateShop
}) {
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('jersify_saved_addresses');
      return saved ? JSON.parse(saved) : DEFAULT_ADDRESSES;
    } catch (e) {
      return DEFAULT_ADDRESSES;
    }
  });

  useEffect(() => {
    if (user?.uid) {
      get(ref(rtdb, `users/${user.uid}/addresses`)).then(snap => {
        if (snap.exists()) {
          const val = snap.val();
          const list = Array.isArray(val) ? val : Object.values(val);
          if (list.length > 0) {
            setAddresses(list);
            localStorage.setItem('jersify_saved_addresses', JSON.stringify(list));
          }
        }
      }).catch(() => {});
    }
  }, [user?.uid]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tag: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  const saveToLocalStorage = async (updated) => {
    setAddresses(updated);
    try {
      localStorage.setItem('jersify_saved_addresses', JSON.stringify(updated));
    } catch (e) {}

    if (user?.uid) {
      try {
        const addrsMap = {};
        updated.forEach(a => { addrsMap[a.id] = a; });
        await set(ref(rtdb, `users/${user.uid}/addresses`), addrsMap);
      } catch (e) {}
    }
  };

  const handleSetDefault = (id) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    saveToLocalStorage(updated);
  };

  const handleDelete = (id) => {
    const updated = addresses.filter(addr => addr.id !== id);
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0].isDefault = true;
    }
    saveToLocalStorage(updated);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      tag: 'Home',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      phone: ''
    });
    setEditingId(null);
    setIsAddingNew(true);
  };

  const handleOpenEdit = (addr) => {
    setFormData({
      name: addr.name,
      tag: addr.tag || 'Home',
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone
    });
    setEditingId(addr.id);
    setIsAddingNew(true);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.line1 || !formData.pincode || !formData.phone) {
      alert('Please fill in all required fields.');
      return;
    }

    const rawPhone = formData.phone.trim();
    const cleanDigits = rawPhone.replace(/^\+?91\s*/, '').replace(/[^0-9]/g, '');
    const savedPhone = cleanDigits.length > 0 ? `+91 ${cleanDigits}` : rawPhone;
    const finalData = { ...formData, phone: savedPhone };

    if (editingId) {
      const updated = addresses.map(addr => {
        if (addr.id === editingId) {
          return { ...addr, ...finalData };
        }
        return addr;
      });
      saveToLocalStorage(updated);
    } else {
      const newAddr = {
        id: 'addr_' + Date.now(),
        ...finalData,
        isDefault: addresses.length === 0
      };
      saveToLocalStorage([...addresses, newAddr]);
    }
    setIsAddingNew(false);
    setEditingId(null);
  };

  return (
    <div style={{ width: '100%', maxWidth: '393px', margin: '0 auto', background: '#FFFFFF', position: 'relative', overflowX: 'hidden', minHeight: '850px', paddingBottom: '70px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      {/* Saved Addresses Navigation Header */}
      <div style={{ borderBottom: '1px solid #E5E7EB', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 19px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <img src={imgBack} alt="Back" style={{ width: '22px', height: '22px' }} />
        </button>
        <p style={{ fontFamily: 'Karla', fontSize: '18px', color: '#111111' }}>
          Saved addresses
        </p>
        <button onClick={onOpenCart} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <img src={imgShoppingBag} alt="Bag" style={{ width: '22px', height: '22px' }} />
        </button>
      </div>

      {/* Header Heading */}
      <div style={{ padding: '24px 19px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '24px', color: '#111111' }}>
            Your addresses
          </h1>
          <div style={{ background: '#EDDBDB', padding: '5px 10px' }}>
            <span style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333' }}>
              {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'}
            </span>
          </div>
        </div>
        <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280', lineHeight: '18px' }}>
          Manage your saved delivery locations for quick 1-click checkout.
        </p>

        {!isAddingNew && (
          <button
            onClick={handleOpenAdd}
            style={{
              width: '100%',
              height: '48px',
              background: '#000000',
              color: '#FFFFFF',
              fontFamily: 'Karla',
              fontWeight: 700,
              fontSize: '15px',
              border: 'none',
              marginTop: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            + Add new address
          </button>
        )}
      </div>

      {/* Add / Edit Address Form Modal/Inline */}
      {isAddingNew && (
        <form onSubmit={handleSaveForm} style={{ margin: '0 19px 24px', padding: '20px', border: '1px solid #111111', background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '18px', color: '#111111' }}>
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333', fontWeight: 700 }}>FULL NAME *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alex Morgan"
              style={{ height: '40px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333', fontWeight: 700 }}>TAG</label>
              <select
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                style={{ height: '40px', padding: '0 8px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px', background: '#FFFFFF' }}
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333', fontWeight: 700 }}>PINCODE *</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="400050"
                style={{ height: '40px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333', fontWeight: 700 }}>FLAT / HOUSE NO. / BUILDING *</label>
            <input
              type="text"
              value={formData.line1}
              onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
              placeholder="e.g. 42 Palm Crest Heights, Apt 4B"
              style={{ height: '40px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333', fontWeight: 700 }}>STREET / AREA / LOCALITY</label>
            <input
              type="text"
              value={formData.line2}
              onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
              placeholder="e.g. Bandra West, Hill Road"
              style={{ height: '40px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333', fontWeight: 700 }}>CITY</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Mumbai"
                style={{ height: '40px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333', fontWeight: 700 }}>STATE</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Maharashtra"
                style={{ height: '40px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#333333', fontWeight: 700 }}>MOBILE NUMBER *</label>
            <input
              type="tel"
              value={formData.phone.replace(/^\+?91\s*/, '')}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/^\+?91\s*/, '') })}
              placeholder="e.g. 98765 43210"
              style={{ height: '40px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              style={{ flex: 1, height: '44px', background: '#000000', color: '#FFFFFF', border: 'none', fontFamily: 'Karla', fontSize: '14px', cursor: 'pointer' }}
            >
              Save address
            </button>
            <button
              type="button"
              onClick={() => { setIsAddingNew(false); setEditingId(null); }}
              style={{ flex: 1, height: '44px', background: '#FFFFFF', color: '#111111', border: '0.7px solid #000000', fontFamily: 'Karla', fontSize: '14px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address Cards List */}
      <div style={{ padding: '0 19px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {addresses.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#6B7280', fontFamily: 'Karla', fontSize: '14px' }}>
            No saved addresses found. Click above to add one!
          </div>
        ) : (
          addresses.map((addr, index) => (
            <div key={addr.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ border: addr.isDefault ? '1.5px solid #111111' : '1px solid #E5E7EB', padding: '20px', background: '#FFFFFF', position: 'relative' }}>
                
                {/* Default & Tag Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={imgMapPin} alt="Pin" style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '16px', color: '#111111' }}>
                      {addr.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {addr.tag && (
                      <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '4px 8px', fontSize: '11px', fontFamily: 'Karla', fontWeight: 600 }}>
                        {addr.tag.toUpperCase()}
                      </span>
                    )}
                    {addr.isDefault && (
                      <span style={{ background: '#EDDBDB', color: '#333333', padding: '4px 8px', fontSize: '11px', fontFamily: 'Karla', fontWeight: 700 }}>
                        DEFAULT
                      </span>
                    )}
                  </div>
                </div>

                {/* Address Body */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'Karla', fontSize: '14px', color: '#4B5563', lineHeight: '20px' }}>
                  <p>{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p style={{ marginTop: '4px', color: '#111111', fontWeight: 500 }}>Phone: {addr.phone}</p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      style={{ background: 'none', border: 'none', color: '#111111', fontFamily: 'Karla', fontSize: '13px', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                    >
                      Set as default
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(addr)}
                    style={{ background: 'none', border: 'none', color: '#111111', fontFamily: 'Karla', fontSize: '13px', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', fontFamily: 'Karla', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0, marginLeft: 'auto' }}
                  >
                    Remove
                  </button>
                </div>

              </div>
              {index < addresses.length - 1 && <div style={{ height: '1px', background: '#E5E7EB', width: '100%' }} />}
            </div>
          ))
        )}
      </div>

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
