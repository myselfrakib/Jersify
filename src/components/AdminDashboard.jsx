import React, { useState, useEffect } from 'react';
import { 
  rtdb, 
  ref, 
  get, 
  set, 
  update, 
  push, 
  remove, 
  signOut, 
  auth,
  storage,
  storageRef,
  uploadBytes,
  getDownloadURL
} from '../firebase';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const DEFAULT_INDEX_IMAGES = {
  heroBanner1: { label: "Hero Slider Banner 1", aspect: "16:9 (393x220px)", url: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de" },
  heroBanner2: { label: "Hero Slider Banner 2", aspect: "16:9 (393x220px)", url: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790334116027_pfan_0_IMG_3915.png?alt=media&token=8c2058d5-2b95-4926-8960-1b2ce77d29eb" },
  heroBanner3: { label: "Hero Slider Banner 3", aspect: "16:9 (393x220px)", url: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030635314_1_IMG_6074.jpeg?alt=media&token=f8e8d995-63d7-4c57-aef4-948d93e6533d" },
  wearYourIdentity: { label: "Wear Your Identity Banner", aspect: "2.4:1 (393x162px)", url: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030642038_2_IMG_6072.jpeg?alt=media&token=d0ba389d-4214-44ec-b2b3-c0dbdb548678" },
  notBasicSpotlight: { label: "Not Basic Spotlight Banner", aspect: "3:4 (393x510px)", url: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030648696_3_IMG_6073.jpeg?alt=media&token=90f31fe5-1bb0-4522-aada-9db03fbcfab8" },
  curatedSeasonPkg: { label: "Curated Season Main Packaging", aspect: "4:3 (393x333px)", url: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1781030675022_4_IMG_6071.jpeg?alt=media&token=ab978713-fa93-4b20-a8f2-a69b2f5c6aaf" },
  qualityYouCanWear: { label: "Quality You Can Wear Short Banner", aspect: "3:1 (393x131px)", url: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1777010842917_0_IMG_3702.jpeg?alt=media&token=1797da70-902b-42e8-9682-7feb6c89d4ef" },
  retroBanner1: { label: "Good Old Kits Retro Banner 1", aspect: "1:2.1 (168x360px)", url: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1777324422299_0_IMG_4061.jpeg?alt=media&token=f94be5a7-75e9-486d-bf07-92135cb38132" },
  retroBanner2: { label: "Good Old Kits Retro Banner 2", aspect: "1:2.1 (168x360px)", url: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1777348522170_0_IMG_4080.jpeg?alt=media&token=86b339ae-0b9b-41e0-b926-fe7a4fccecc8" },
  lifestyleClubs: { label: "Lifestyle Clubs Banner", aspect: "5:4 (207x166px)", url: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1778510513151_0_IMG_5263.jpeg?alt=media&token=17bad7fd-0018-4016-9fa2-5aedc6c3d09d" },
  lifestyleNationals: { label: "Lifestyle Nationals Banner", aspect: "4:5 (136x166px)", url: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de" },
  jersifyLogoHeader: { label: "Index Page Header Brand Logo", aspect: "Square Brand Logo (40x40px)", url: "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de" },
  clubLogoBarca: { label: "Club Crest: FC Barcelona", aspect: "1:1 Crest (64x64px)", url: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg" },
  clubLogoReal: { label: "Club Crest: Real Madrid", aspect: "1:1 Crest (64x64px)", url: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg" },
  clubLogoMilan: { label: "Club Crest: AC Milan", aspect: "1:1 Crest (64x64px)", url: "https://upload.wikimedia.org/wikipedia/commons/d/d0/AC_Milan_logo.svg" },
  clubLogoBayern: { label: "Club Crest: Bayern Munich", aspect: "1:1 Crest (64x64px)", url: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg" },
  clubLogoManUtd: { label: "Club Crest: Manchester United", aspect: "1:1 Crest (64x64px)", url: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg" },
  clubLogoManCity: { label: "Club Crest: Manchester City", aspect: "1:1 Crest (64x64px)", url: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg" },
  clubLogoLiverpool: { label: "Club Crest: Liverpool FC", aspect: "1:1 Crest (64x64px)", url: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg" },
  clubLogoJuventus: { label: "Club Crest: Juventus", aspect: "1:1 Crest (64x64px)", url: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg" }
};

export default function AdminDashboard({
  adminUser,
  adminData,
  onSignOut,
  onNavigateHome
}) {
  const [activeTab, setActiveTab] = useState('images'); // 'images' | 'products' | 'orders' | 'users'

  // Image Control State & Upload State
  const [indexImages, setIndexImages] = useState(DEFAULT_INDEX_IMAGES);
  const [imagesSavedToast, setImagesSavedToast] = useState(false);
  const [uploadingState, setUploadingState] = useState({});

  // Products State & Upload State
  const [productsList, setProductsList] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [uploadingProductImg, setUploadingProductImg] = useState(false);

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

  // Orders State & Details Modal State
  const [ordersList, setOrdersList] = useState([]);
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);

  // Users & Admins State
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

  // Upload image file directly to Firebase Storage for Index Banner
  const handleFileUploadForIndexImage = async (key, file) => {
    if (!file) return;
    setUploadingState(prev => ({ ...prev, [key]: true }));
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const sRef = storageRef(storage, `siteConfig/images/${key}_${Date.now()}_${cleanFileName}`);
      await uploadBytes(sRef, file);
      const downloadUrl = await getDownloadURL(sRef);
      handleImageChange(key, downloadUrl);
    } catch (err) {
      alert('Failed to upload image to Firebase Storage: ' + err.message);
    } finally {
      setUploadingState(prev => ({ ...prev, [key]: false }));
    }
  };

  // Upload image file directly to Firebase Storage for Product
  const handleFileUploadForProduct = async (file) => {
    if (!file) return;
    setUploadingProductImg(true);
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const sRef = storageRef(storage, `products/${Date.now()}_${cleanFileName}`);
      await uploadBytes(sRef, file);
      const downloadUrl = await getDownloadURL(sRef);
      setProductForm(prev => ({ ...prev, imgUrl: downloadUrl }));
    } catch (err) {
      alert('Failed to upload product image to Firebase Storage: ' + err.message);
    } finally {
      setUploadingProductImg(false);
    }
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
      setOrdersList(prev => prev.map(o => (o.id === orderId || o.orderId === orderId) ? { ...o, status: newStatus } : o));
      if (selectedOrderModal && (selectedOrderModal.id === orderId || selectedOrderModal.orderId === orderId)) {
        setSelectedOrderModal(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update status in RTDB: ' + err.message);
    }
  };

  const handleToggleAdminStatus = async (userUid, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      await update(ref(rtdb, `admins/${userUid}`), { status: nextStatus, isAdmin: nextStatus });
      setUsersList(prev => prev.map(u => u.uid === userUid ? { ...u, status: nextStatus, isAdmin: nextStatus } : u));
    } catch (err) {
      alert('Failed to update admin status: ' + err.message);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '980px', margin: '0 auto', background: '#FFFFFF', minHeight: '900px', boxShadow: '0 0 20px rgba(0,0,0,0.1)', fontFamily: 'Karla, sans-serif' }}>
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

      {/* Navigation Tabs (4 Separated Tabs) */}
      <div style={{ display: 'flex', background: '#F3F4F6', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('images')}
          style={{ flex: 1, padding: '14px 10px', border: 'none', background: activeTab === 'images' ? '#FFFFFF' : 'transparent', borderBottom: activeTab === 'images' ? '3px solid #111111' : 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          🖼️ Index Page Images ({Object.keys(indexImages).length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          style={{ flex: 1, padding: '14px 10px', border: 'none', background: activeTab === 'products' ? '#FFFFFF' : 'transparent', borderBottom: activeTab === 'products' ? '3px solid #111111' : 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          👕 Products ({productsList.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{ flex: 1, padding: '14px 10px', border: 'none', background: activeTab === 'orders' ? '#FFFFFF' : 'transparent', borderBottom: activeTab === 'orders' ? '3px solid #111111' : 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          📦 Customer Orders ({ordersList.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{ flex: 1, padding: '14px 10px', border: 'none', background: activeTab === 'users' ? '#FFFFFF' : 'transparent', borderBottom: activeTab === 'users' ? '3px solid #111111' : 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          👥 Registered Users ({usersList.length})
        </button>
      </div>

      {/* TAB 1: INDEX PAGE IMAGES MANAGER */}
      {activeTab === 'images' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111111' }}>Index Page Image Controller</h2>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>Update each and every image of the home page with aspect ratio guidelines & direct Firebase Storage uploads.</p>
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
                      <img src={item.url} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ color: '#9CA3AF', fontSize: '12px' }}>No Image URL Provided</span>
                    )}
                  </div>

                  {/* URL Input & Direct File Upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#4B5563' }}>IMAGE URL (or Upload File Below)</label>
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => handleImageChange(key, e.target.value)}
                        style={{ height: '38px', padding: '0 10px', border: '1px solid #D1D5DB', fontSize: '12px', fontFamily: 'monospace' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{
                        background: '#111111',
                        color: '#FFFFFF',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {uploadingState[key] ? '⏳ Uploading to Storage...' : '📁 Upload Image File'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUploadForIndexImage(key, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {uploadingState[key] && <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>Uploading...</span>}
                    </div>
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
                    <option value="AC Milan">AC Milan</option>
                    <option value="Bayern Munich">Bayern Munich</option>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>PRODUCT IMAGE *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    value={productForm.imgUrl}
                    onChange={(e) => setProductForm({ ...productForm, imgUrl: e.target.value })}
                    placeholder="IMAGE URL or Upload File ->"
                    style={{ flex: 1, height: '38px', padding: '0 10px', border: '1px solid #D1D5DB', fontFamily: 'monospace', fontSize: '12px' }}
                  />
                  <label style={{
                    background: '#111111',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {uploadingProductImg ? '⏳ Uploading...' : '📁 Upload File'}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUploadForProduct(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
                {uploadingProductImg && <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>Uploading to Firebase Storage...</span>}
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
                  <img src={p.imgUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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

      {/* TAB 3: CUSTOMER ORDERS (SEPARATED TAB) */}
      {activeTab === 'orders' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111111' }}>Customer Orders Management</h2>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>View live customer orders with full product details, shipping info and status updates.</p>
          </div>

          {ordersList.length === 0 ? (
            <div style={{ padding: '24px', background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#6B7280', fontSize: '14px', textAlign: 'center' }}>
              No live customer orders found in Realtime Database yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {ordersList.map(o => (
                <div key={o.id} style={{ border: '1px solid #E5E7EB', padding: '16px', background: '#F9FAFB', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '16px', color: '#111111' }}>Order #{o.orderId || o.id}</span>
                      <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Placed on: {o.createdAt ? new Date(o.createdAt).toLocaleString() : 'Recent'}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <select
                        value={o.status || 'confirmed'}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        style={{ padding: '6px 10px', border: '1px solid #111111', fontFamily: 'Karla', fontWeight: 700, fontSize: '13px', background: '#FFFFFF', cursor: 'pointer' }}
                      >
                        <option value="confirmed">Status: Confirmed</option>
                        <option value="dispatched">Status: Dispatched</option>
                        <option value="delivered">Status: Delivered</option>
                        <option value="cancelled">Status: Cancelled</option>
                      </select>

                      <button
                        onClick={() => setSelectedOrderModal(o)}
                        style={{ background: '#111111', color: '#FFFFFF', border: 'none', padding: '7px 14px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        👁️ View Order Details
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', borderTop: '1px solid #E5E7EB', paddingTop: '10px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>CUSTOMER</span>
                      <p style={{ fontWeight: 700, color: '#111111' }}>{o.customerName || 'Customer'}</p>
                      <p style={{ color: '#4B5563', fontSize: '12px' }}>{o.email || 'No email'} · {o.phone}</p>
                    </div>
                    <div>
                      <span style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>ITEMS SUMMARY</span>
                      <p style={{ fontWeight: 700, color: '#111111' }}>{Array.isArray(o.items) ? o.items.length : 1} Product(s)</p>
                      <p style={{ color: '#4B5563', fontSize: '12px' }}>Payment: {o.paymentMethod || 'ONLINE'}</p>
                    </div>
                    <div>
                      <span style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL AMOUNT</span>
                      <p style={{ fontWeight: 700, fontSize: '16px', color: '#059669' }}>₹{o.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REGISTERED USERS & ADMINS (SEPARATED TAB) */}
      {activeTab === 'users' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111111' }}>Registered Users & Admin Roles</h2>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>Database user profiles and restricted admin account authorization status.</p>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ padding: '12px 14px' }}>NAME</th>
                  <th style={{ padding: '12px 14px' }}>EMAIL</th>
                  <th style={{ padding: '12px 14px' }}>ACCOUNT TYPE</th>
                  <th style={{ padding: '12px 14px' }}>ADMIN STATUS (isAdmin)</th>
                  <th style={{ padding: '12px 14px' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u, i) => {
                  const isApprovedAdmin = (u.status === true || u.isAdmin === true || u.isAdmin === "true");
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{u.name || 'Jersify User'}</td>
                      <td style={{ padding: '12px 14px' }}>{u.email}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: u.accountType === 'Admin' ? '#FEF3C7' : '#E5E7EB', color: u.accountType === 'Admin' ? '#92400E' : '#374151', padding: '4px 8px', fontWeight: 700, fontSize: '11px', borderRadius: '3px' }}>
                          {u.role || u.accountType}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ color: isApprovedAdmin ? '#10B981' : '#6B7280', fontWeight: 700 }}>
                          {isApprovedAdmin ? '✓ isAdmin == true' : '✕ isAdmin == false'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {u.accountType === 'Admin' && u.uid && (
                          <button
                            onClick={() => handleToggleAdminStatus(u.uid, isApprovedAdmin)}
                            style={{ background: isApprovedAdmin ? '#FEE2E2' : '#D1FAE5', color: isApprovedAdmin ? '#991B1B' : '#065F46', border: '1px solid transparent', padding: '4px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', borderRadius: '3px' }}
                          >
                            {isApprovedAdmin ? 'Revoke Admin' : 'Approve Admin (isAdmin=true)'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL OVERLAY */}
      {selectedOrderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div style={{ background: '#111111', color: '#FFFFFF', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>ORDER DETAILS</span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Order #{selectedOrderModal.orderId || selectedOrderModal.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Status Bar */}
              <div style={{ background: '#F3F4F6', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Current Status: <span style={{ textTransform: 'uppercase', color: '#059669' }}>{selectedOrderModal.status || 'confirmed'}</span></span>
                <select
                  value={selectedOrderModal.status || 'confirmed'}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrderModal.id, e.target.value)}
                  style={{ padding: '6px 10px', border: '1px solid #111111', fontFamily: 'Karla', fontWeight: 700, fontSize: '12px', background: '#FFFFFF' }}
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Customer & Shipping Section */}
              <div style={{ border: '1px solid #E5E7EB', padding: '14px', borderRadius: '4px', background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#111111', borderBottom: '1px solid #E5E7EB', paddingBottom: '6px' }}>Customer & Shipping Address</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '13px' }}>
                  <p><strong>Name:</strong> {selectedOrderModal.customerName || 'Customer'}</p>
                  <p><strong>Phone:</strong> {selectedOrderModal.phone || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedOrderModal.email || 'N/A'}</p>
                  <p><strong>Payment Method:</strong> {selectedOrderModal.paymentMethod || 'ONLINE'}</p>
                </div>
                <p style={{ fontSize: '13px', margin: 0 }}><strong>Address:</strong> {selectedOrderModal.address}</p>
              </div>

              {/* Purchased Products Items Section with Images */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#111111' }}>Ordered Products & Items</h4>
                {Array.isArray(selectedOrderModal.items) && selectedOrderModal.items.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedOrderModal.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #E5E7EB', padding: '10px', borderRadius: '4px', background: '#FFFFFF' }}>
                        <div style={{ width: '60px', height: '60px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={item.imgUrl || item.image || "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de"} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#111111' }}>{item.name || item.title}</h5>
                          <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                            Team: {item.team || 'Standard'} · Size: <span style={{ fontWeight: 700 }}>{item.size || 'M'}</span> · Version: {item.version || 'Fan'}
                          </p>
                          <p style={{ fontSize: '12px', color: '#111111', fontWeight: 700, margin: '2px 0 0' }}>
                            Quantity: {item.quantity || 1} x ₹{item.price}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, fontSize: '15px', color: '#111111' }}>
                            ₹{(item.quantity || 1) * (item.price || 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: '#F3F4F6', fontSize: '13px', color: '#4B5563' }}>
                    Single Jersey Kit Order · Total: ₹{selectedOrderModal.total}
                  </div>
                )}
              </div>

              {/* Order Total Footer */}
              <div style={{ borderTop: '2px solid #111111', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', fontWeight: 700 }}>
                <span>Total Amount Paid:</span>
                <span style={{ fontSize: '20px', color: '#059669' }}>₹{selectedOrderModal.total}</span>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div style={{ borderTop: '1px solid #E5E7EB', padding: '12px 20px', background: '#F9FAFB', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedOrderModal(null)}
                style={{ background: '#111111', color: '#FFFFFF', padding: '8px 20px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', borderRadius: '4px' }}
              >
                Close Order Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
