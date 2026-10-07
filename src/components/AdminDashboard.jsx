import React, { useState, useEffect } from 'react';
import { rtdb, ref, get, set, update, push, remove, signOut, auth } from '../firebase';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const DEFAULT_INDEX_IMAGES = {
  heroBanner1: { label: "Hero Slider Banner 1", aspect: "16:9 (393x220px)", url: "http://localhost:3845/assets/4a5bf1256465888e3f8ad578d93f2194a847b287.png" },
  heroBanner2: { label: "Hero Slider Banner 2", aspect: "16:9 (393x220px)", url: "http://localhost:3845/assets/08eaae9b8d6f047ba9b1bf816be8279c23ca5b79.png" },
  heroBanner3: { label: "Hero Slider Banner 3", aspect: "16:9 (393x220px)", url: "http://localhost:3845/assets/b4ca2f4a5332624caba58bcf3f92587c23c71169.png" },
  wearYourIdentity: { label: "Wear Your Identity Banner", aspect: "2.4:1 (393x162px)", url: "http://localhost:3845/assets/aa1cf1709f82c4b2a1cf7ce45b739d3379b0e0e7.png" },
  notBasicSpotlight: { label: "Not Basic Spotlight Banner", aspect: "3:4 (393x510px)", url: "http://localhost:3845/assets/3d9c63e439c097fd35375eee418847add198ba5e.png" },
  curatedSeasonPkg: { label: "Curated Season Main Packaging", aspect: "4:3 (393x333px)", url: "http://localhost:3845/assets/c7321852f457d9b37da7803950e5e2379a736556.png" },
  qualityYouCanWear: { label: "Quality You Can Wear Short Banner", aspect: "3:1 (393x131px)", url: "http://localhost:3845/assets/855ef2d489a779d01e498ba93cd96f51680e222c.png" },
  retroBanner1: { label: "Good Old Kits Retro Banner 1", aspect: "1:2.1 (168x360px)", url: "http://localhost:3845/assets/64269d952e03e2cfe6b2f34338cedcfd8c20be9c.png" },
  retroBanner2: { label: "Good Old Kits Retro Banner 2", aspect: "1:2.1 (168x360px)", url: "http://localhost:3845/assets/1b0f4742125549062a00a04d67497746c3a4fd77.png" },
  lifestyleClubs: { label: "Lifestyle Clubs Banner", aspect: "5:4 (207x166px)", url: "http://localhost:3845/assets/5ba9af2b698fca31703a423d73a073f2012857c6.png" },
  lifestyleNationals: { label: "Lifestyle Nationals Banner", aspect: "4:5 (136x166px)", url: "http://localhost:3845/assets/f44f755c468bd086a40ef40d4bb7c4c9d3301587.png" }
};

export default function AdminDashboard({
  adminUser,
  adminData,
  onSignOut,
  onNavigateHome
}) {
  const [activeTab, setActiveTab] = useState('images'); // 'images' | 'products' | 'orders'

  // Image Control State
  const [indexImages, setIndexImages] = useState(DEFAULT_INDEX_IMAGES);
  const [imagesSavedToast, setImagesSavedToast] = useState(false);

  // Products State
  const [productsList, setProductsList] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const [productForm, setProductForm] = useState({
    name: '',
    team: 'Barcelona',
    categoryTag: 'this season', // 'this season' | 'retro' | 'hot picks'
    version: 'fan', // 'player' | 'fan'
    price: 750,
    imgUrl: '',
    badge: 'NEW',
    description: ''
  });

  // Orders & Users State
  const [ordersList, setOrdersList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Fetch RTDB configuration, products, orders & users
  useEffect(() => {
    async function loadAdminData() {
      // 1. Fetch site images config
      try {
        const imgSnap = await get(ref(rtdb, 'siteConfig/images'));
        if (imgSnap.exists()) {
          setIndexImages(prev => ({ ...prev, ...imgSnap.val() }));
        }
      } catch (e) {}

      // 2. Fetch products
      try {
        const prodSnap = await get(ref(rtdb, 'products'));
        if (prodSnap.exists()) {
          const val = prodSnap.val();
          const items = Object.keys(val).map(k => ({ id: k, ...val[k] }));
          setProductsList(items);
        } else {
          setProductsList(INITIAL_PRODUCTS);
        }
      } catch (e) {
        setProductsList(INITIAL_PRODUCTS);
      }

      // 3. Fetch orders
      try {
        const ordersSnap = await get(ref(rtdb, 'orders'));
        if (ordersSnap.exists()) {
          const val = ordersSnap.val();
          const items = Object.keys(val).map(k => ({ id: k, ...val[k] }));
          setOrdersList(items);
        }
      } catch (e) {}

      // 4. Fetch users & admins
      try {
        const usersSnap = await get(ref(rtdb, 'users'));
        const adminsSnap = await get(ref(rtdb, 'admins'));
        let combined = [];
        if (usersSnap.exists()) {
          combined = Object.values(usersSnap.val()).map(u => ({ ...u, accountType: 'User' }));
        }
        if (adminsSnap.exists()) {
          const adminsArr = Object.values(adminsSnap.val()).map(a => ({ ...a, accountType: 'Admin' }));
          combined = [...adminsArr, ...combined];
        }
        setUsersList(combined);
      } catch (e) {}
    }

    loadAdminData();
  }, []);

  // Image Save Handler
  const handleSaveImages = async () => {
    try {
      await set(ref(rtdb, 'siteConfig/images'), indexImages);
      setImagesSavedToast(true);
      setTimeout(() => setImagesSavedToast(false), 3000);
    } catch (err) {
      alert('Failed to save image configuration to RTDB: ' + err.message);
    }
  };

  const handleImageChange = (key, newUrl) => {
    setIndexImages(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        url: newUrl
      }
    }));
  };

  // Product Handlers
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProductId) {
        await update(ref(rtdb, `products/${editingProductId}`), productForm);
        setProductsList(prev => prev.map(p => p.id === editingProductId ? { ...p, ...productForm } : p));
      } else {
        const newRef = push(ref(rtdb, 'products'));
        const newProd = { ...productForm, id: newRef.key };
        await set(newRef, newProd);
        setProductsList(prev => [newProd, ...prev]);
      }
      setIsAddingProduct(false);
      setEditingProductId(null);
    } catch (err) {
      alert('Failed to save product to RTDB: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await remove(ref(rtdb, `products/${id}`));
      setProductsList(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await update(ref(rtdb, `orders/${orderId}`), { status: newStatus });
      setOrdersList(prev => prev.map(o => o.id === orderId || o.orderId === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status in RTDB: ' + err.message);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto', background: '#FFFFFF', minHeight: '900px', boxShadow: '0 0 20px rgba(0,0,0,0.1)', fontFamily: 'Karla, sans-serif' }}>
      {/* Dashboard Top Header */}
      <div style={{ background: '#111111', color: '#FFFFFF', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, letterSpacing: '1px' }}>● ADMIN CONTROL PANEL</span>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '2px 0 0' }}>Jersify Executive Suite</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', fontWeight: 700 }}>{adminData?.name || adminUser?.displayName || 'Admin'}</p>
            <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{adminUser?.email}</p>
          </div>
          <button
            onClick={onSignOut}
            style={{ background: '#DC2626', color: '#FFFFFF', border: 'none', padding: '8px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', background: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
        <button
          onClick={() => setActiveTab('images')}
          style={{ flex: 1, padding: '14px', border: 'none', background: activeTab === 'images' ? '#FFFFFF' : 'transparent', borderBottom: activeTab === 'images' ? '3px solid #111111' : 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
        >
          🖼️ Index Page Images
        </button>
        <button
          onClick={() => setActiveTab('products')}
          style={{ flex: 1, padding: '14px', border: 'none', background: activeTab === 'products' ? '#FFFFFF' : 'transparent', borderBottom: activeTab === 'products' ? '3px solid #111111' : 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
        >
          👕 List Products ({productsList.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{ flex: 1, padding: '14px', border: 'none', background: activeTab === 'orders' ? '#FFFFFF' : 'transparent', borderBottom: activeTab === 'orders' ? '3px solid #111111' : 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
        >
          📦 Orders & Users ({ordersList.length})
        </button>
      </div>

      {/* TAB 1: INDEX PAGE IMAGES MANAGER */}
      {activeTab === 'images' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111111' }}>Index Page Image Controller</h2>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>Update home page banners with explicit aspect ratio guidelines listed beside each header.</p>
            </div>
            <button
              onClick={handleSaveImages}
              style={{ background: '#000000', color: '#FFFFFF', padding: '10px 20px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
            >
              💾 Save All Image Changes
            </button>
          </div>

          {imagesSavedToast && (
            <div style={{ background: '#D1FAE5', color: '#065F46', padding: '12px', fontWeight: 700, fontSize: '14px' }}>
              ✓ Home page images saved to Realtime Database successfully!
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
            {Object.keys(indexImages).map(key => {
              const item = indexImages[key];
              return (
                <div key={key} style={{ border: '1px solid #E5E7EB', padding: '16px', borderRadius: '4px', background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Image Header with Aspect Ratio */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#111111' }}>
                      {item.label}
                    </span>
                    <span style={{ background: '#EDDBDB', color: '#333333', padding: '4px 8px', fontSize: '11px', fontWeight: 700 }}>
                      Aspect: {item.aspect}
                    </span>
                  </div>

                  {/* Image Preview Box */}
                  <div style={{ width: '100%', height: '140px', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {item.url ? (
                      <img src={item.url} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#9CA3AF', fontSize: '12px' }}>No Image URL Provided</span>
                    )}
                  </div>

                  {/* URL Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#4B5563' }}>IMAGE URL (http:// or https://)</label>
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => handleImageChange(key, e.target.value)}
                      style={{ height: '38px', padding: '0 10px', border: '1px solid #D1D5DB', fontSize: '12px', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS LIST MANAGER */}
      {activeTab === 'products' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111111' }}>Catalogue Product Manager</h2>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>Add and manage jersey products with team, version, category, and description fields.</p>
            </div>
            <button
              onClick={() => {
                setProductForm({ name: '', team: 'Barcelona', categoryTag: 'this season', version: 'fan', price: 750, imgUrl: '', badge: 'NEW', description: '' });
                setEditingProductId(null);
                setIsAddingProduct(true);
              }}
              style={{ background: '#000000', color: '#FFFFFF', padding: '10px 18px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
            >
              + Add New Jersey
            </button>
          </div>

          {/* Add / Edit Form Modal */}
          {isAddingProduct && (
            <form onSubmit={handleSaveProduct} style={{ background: '#F9FAFB', border: '1.5px solid #111111', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '18px' }}>{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>PRODUCT NAME *</label>
                  <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="BARCELONA HOME 26/27" style={{ height: '38px', padding: '0 10px', border: '1px solid #D1D5DB' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>CLUB / NATION *</label>
                  <select value={productForm.team} onChange={(e) => setProductForm({ ...productForm, team: e.target.value })} style={{ height: '38px', padding: '0 10px', border: '1px solid #D1D5DB', background: '#FFFFFF' }}>
                    <option value="Barcelona">Barcelona</option>
                    <option value="Real Madrid">Real Madrid</option>
                    <option value="Argentina">Argentina</option>
                    <option value="PSG">PSG</option>
                    <option value="Man City">Man City</option>
                    <option value="Liverpool">Liverpool</option>
                    <option value="Arsenal">Arsenal</option>
                    <option value="Chelsea">Chelsea</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>SEASON / RETRO / HOT PICKS *</label>
                  <select value={productForm.categoryTag} onChange={(e) => setProductForm({ ...productForm, categoryTag: e.target.value })} style={{ height: '38px', padding: '0 10px', border: '1px solid #D1D5DB', background: '#FFFFFF' }}>
                    <option value="this season">this season</option>
                    <option value="retro">retro</option>
                    <option value="hot picks">hot picks</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>PLAYER / FAN VERSION *</label>
                  <select value={productForm.version} onChange={(e) => setProductForm({ ...productForm, version: e.target.value })} style={{ height: '38px', padding: '0 10px', border: '1px solid #D1D5DB', background: '#FFFFFF' }}>
                    <option value="fan">Fan version</option>
                    <option value="player">Player version</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>PRICE (₹) *</label>
                  <input type="number" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} style={{ height: '38px', padding: '0 10px', border: '1px solid #D1D5DB' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>PRODUCT IMAGE URL *</label>
                <input type="text" required value={productForm.imgUrl} onChange={(e) => setProductForm({ ...productForm, imgUrl: e.target.value })} placeholder="https://firebasestorage..." style={{ height: '38px', padding: '0 10px', border: '1px solid #D1D5DB' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>DESCRIPTION</label>
                <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Official team jersey specifications..." style={{ height: '60px', padding: '8px 10px', border: '1px solid #D1D5DB', fontFamily: 'Karla' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ background: '#000000', color: '#FFFFFF', padding: '10px 20px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Save Product</button>
                <button type="button" onClick={() => setIsAddingProduct(false)} style={{ background: '#FFFFFF', border: '1px solid #000000', padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          )}

          {/* Products Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {productsList.map(p => (
              <div key={p.id} style={{ border: '1px solid #E5E7EB', padding: '14px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ height: '160px', width: '100%', background: '#F5F5F5', overflow: 'hidden' }}>
                  <img src={p.imgUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '14px', color: '#111111' }}>{p.name}</h4>
                    <p style={{ fontSize: '12px', color: '#6B7280' }}>{p.team} · <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{p.categoryTag}</span></p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>₹{p.price}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={() => {
                      setProductForm(p);
                      setEditingProductId(p.id);
                      setIsAddingProduct(true);
                    }}
                    style={{ flex: 1, padding: '6px', background: '#FFFFFF', border: '1px solid #111111', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    style={{ flex: 1, padding: '6px', background: '#FFFFFF', border: '1px solid #EF4444', color: '#EF4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS & USERS MANAGER */}
      {activeTab === 'orders' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111111' }}>Orders & Database Users</h2>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>Real-time orders placed by customers and registered users from RTDB.</p>
          </div>

          {/* Orders Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Recent Customer Orders</h3>
            {ordersList.length === 0 ? (
              <div style={{ padding: '20px', background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#6B7280', fontSize: '14px' }}>
                No live customer orders found in RTDB. Orders placed at checkout will appear here automatically.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ordersList.map(o => (
                  <div key={o.id} style={{ border: '1px solid #E5E7EB', padding: '16px', background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: '#111111' }}>#{o.orderId || o.id}</span>
                      <select
                        value={o.status || 'confirmed'}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        style={{ padding: '4px 8px', border: '1px solid #111111', fontFamily: 'Karla', fontWeight: 700, fontSize: '12px', background: '#FFFFFF' }}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <p style={{ fontSize: '13px', color: '#374151' }}>Customer: <strong>{o.customerName}</strong> ({o.email || 'No email'}) · Phone: {o.phone}</p>
                    <p style={{ fontSize: '12px', color: '#6B7280' }}>Shipping Address: {o.address}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, borderTop: '1px solid #E5E7EB', paddingTop: '6px' }}>
                      <span>Payment: {o.paymentMethod || 'ONLINE'}</span>
                      <span>Total: ₹{o.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registered Users Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Registered Users & Admin Roles</h3>
            <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
                    <th style={{ padding: '10px 14px' }}>NAME</th>
                    <th style={{ padding: '10px 14px' }}>EMAIL</th>
                    <th style={{ padding: '10px 14px' }}>ROLE</th>
                    <th style={{ padding: '10px 14px' }}>STATUS (isAdmin)</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{u.name || 'Jersify Fan'}</td>
                      <td style={{ padding: '10px 14px' }}>{u.email}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: u.accountType === 'Admin' ? '#FEF3C7' : '#F3F4F6', color: u.accountType === 'Admin' ? '#92400E' : '#374151', padding: '2px 6px', fontWeight: 700, fontSize: '11px' }}>
                          {u.role || u.accountType}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ color: (u.status === true || u.isAdmin === true) ? '#10B981' : '#6B7280', fontWeight: 700 }}>
                          {(u.status === true || u.isAdmin === true) ? 'isAdmin == true' : 'isAdmin == false'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
