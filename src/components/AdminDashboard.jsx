import React, { useState, useEffect, useMemo } from 'react';
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
  getDownloadURL,
  onValue
} from '../firebase';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import ImageWithSpinner from './ImageWithSpinner';


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

const CLUB_OPTIONS = [
  "Barcelona", "Real Madrid", "Man City", "Liverpool", "Man United",
  "Arsenal", "Chelsea", "Tottenham", "PSG", "Bayern Munich",
  "Borussia Dortmund", "AC Milan", "Inter Milan", "Juventus",
  "Atletico Madrid", "Napoli", "AS Roma", "Benfica", "Porto", "Ajax",
  "Inter Miami", "Al Nassr", "Al Hilal", "Al Ittihad", "Flamengo",
  "Boca Juniors", "River Plate"
];

const NATIONAL_OPTIONS = [
  "Argentina", "Portugal", "France", "Brazil", "England",
  "Germany", "Spain", "Italy", "Netherlands", "Japan",
  "Morocco", "Croatia", "Belgium", "Uruguay", "Colombia", "Mexico"
];


const DEFAULT_TEAM_CONFIG = {
  'Barcelona': {
    name: 'FC BARCELONA',
    subtitle: 'La Liga · Spain',
    founded: '1899',
    stadium: 'Spotify Camp Nou',
    logo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
    banner: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
    description: 'Explore official Blaugrana kits and retro classics for this season.'
  },
  'Real Madrid': {
    name: 'REAL MADRID CF',
    subtitle: 'La Liga · Spain',
    founded: '1902',
    stadium: 'Santiago Bernabéu',
    logo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
    banner: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
    description: 'Discover Los Blancos official home, away and special edition kits with 15-time Champions League heritage.'
  },
  'Argentina': {
    name: 'ARGENTINA',
    subtitle: 'CONMEBOL · World Champions',
    founded: '1893',
    stadium: 'Estadio MÁS Monumental',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Association_Argentine_de_Football_logo.svg',
    banner: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
    description: 'Wear the iconic Albiceleste stripes with 3-star World Cup champion badges and authentic fan versions.'
  },
  'Man City': {
    name: 'MANCHESTER CITY',
    subtitle: 'Premier League · England',
    founded: '1880',
    stadium: 'Etihad Stadium',
    logo: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
    banner: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
    description: 'Explore Cityzens modern home and away kits designed for pitch performance and lifestyle wear.'
  },
  'Liverpool': {
    name: 'LIVERPOOL FC',
    subtitle: 'Premier League · England',
    founded: '1892',
    stadium: 'Anfield Stadium',
    logo: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
    banner: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
    description: 'You will never walk alone with the legendary Anfield red kits and classic edition jerseys.'
  },
  'AC Milan': {
    name: 'AC MILAN',
    subtitle: 'Serie A · Italy',
    founded: '1899',
    stadium: 'San Siro Stadium',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/AC_Milan_logo.svg',
    banner: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
    description: 'Rossoneri classic red & black stripes engineered for performance and Italian football heritage.'
  },
  'Bayern Munich': {
    name: 'BAYERN MUNICH',
    subtitle: 'Bundesliga · Germany',
    founded: '1900',
    stadium: 'Allianz Arena',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
    banner: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
    description: 'Mia San Mia. Experience Bavaria legendary red home and away kits with 33 Bundesliga titles.'
  },
  'Man United': {
    name: 'MANCHESTER UNITED',
    subtitle: 'Premier League · England',
    founded: '1878',
    stadium: 'Old Trafford',
    logo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
    banner: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
    description: 'The Theatre of Dreams red devil jerseys, retro classics and official fan versions.'
  },
  'Juventus': {
    name: 'JUVENTUS FC',
    subtitle: 'Serie A · Italy',
    founded: '1897',
    stadium: 'Allianz Stadium Turin',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg',
    banner: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
    description: 'Bianconeri iconic black & white stripes crafted with modern lifestyle aesthetics.'
  }
};

export default function AdminDashboard({
  adminUser,
  adminData,
  onSignOut,
  onNavigateHome
}) {
  const [activeTab, setActiveTab] = useState('images'); // 'images' | 'clubs' | 'products' | 'orders' | 'users'

  // Image Control State & Upload State
  const [indexImages, setIndexImages] = useState(DEFAULT_INDEX_IMAGES);
  const [homepageOrder, setHomepageOrder] = useState([]);
  const [imagesSavedToast, setImagesSavedToast] = useState(false);
  const [uploadingState, setUploadingState] = useState({});


  // Clubs & Nations Banners State
  const [teamBanners, setTeamBanners] = useState(DEFAULT_TEAM_CONFIG);
  const [teamsSavedToast, setTeamsSavedToast] = useState(false);
  const [uploadingTeamState, setUploadingTeamState] = useState({});
  const [newClubName, setNewClubName] = useState('');
  const [newClubType, setNewClubType] = useState('club'); // 'club' | 'national'

  // Dynamically include all added clubs & nations from teamBanners
  const availableClubOptions = useMemo(() => {
    const customClubs = Object.keys(teamBanners).filter((key) => {
      const item = teamBanners[key];
      const isNation = item?.type === 'national' || NATIONAL_OPTIONS.includes(key);
      return !isNation;
    });
    return Array.from(new Set([...CLUB_OPTIONS, ...customClubs]));
  }, [teamBanners]);

  const availableNationalOptions = useMemo(() => {
    const customNations = Object.keys(teamBanners).filter((key) => {
      const item = teamBanners[key];
      const isNation = item?.type === 'national' || NATIONAL_OPTIONS.includes(key);
      return isNation;
    });
    return Array.from(new Set([...NATIONAL_OPTIONS, ...customNations]));
  }, [teamBanners]);

  const handleQuickAddTeamFromProduct = async (name, type) => {
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    if (teamBanners[cleanName]) {
      alert(`"${cleanName}" is already registered!`);
      return;
    }
    const isNation = type === 'national';
    const updated = {
      ...teamBanners,
      [cleanName]: {
        name: cleanName.toUpperCase(),
        type: type,
        subtitle: isNation ? 'National Team · World Football' : 'Official Collection',
        founded: '2026',
        stadium: isNation ? 'National Stadium' : 'Home Stadium',
        logo: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
        banner: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
        description: `Official ${isNation ? 'national' : 'club'} kits for ${cleanName}.`
      }
    };
    setTeamBanners(updated);
    try {
      await set(ref(rtdb, 'siteConfig/teamBanners'), updated);
      sessionStorage.setItem('jersify_team_banners', JSON.stringify(updated));
    } catch (e) { }
    alert(`Saved "${cleanName}" to registered ${isNation ? 'Nations' : 'Clubs'}!`);
  };

  // Products State & Upload State
  const [productsList, setProductsList] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [uploadingProductImg, setUploadingProductImg] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    teamType: 'club', // 'club' | 'national'
    team: 'Barcelona',
    categoryTag: 'this season', // 'this season' | 'retro' | 'hot picks'
    version: 'fan', // 'player' | 'fan'
    price: 750,
    imgUrl: '',
    images: [],
    badge: 'NEW',
    description: ''
  });
  const [newImageUrlInput, setNewImageUrlInput] = useState('');

  // Orders State & Details Modal State
  const [ordersList, setOrdersList] = useState([]);
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [orderSortOption, setOrderSortOption] = useState('newest'); // 'newest' | 'oldest' | 'total-high' | 'total-low' | 'customer'
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedModalItemIndices, setSelectedModalItemIndices] = useState([]);

  // Shopping List State (Items marked for procurement)
  const [shoppingList, setShoppingList] = useState(() => {
    try {
      const cached = sessionStorage.getItem('jersify_shopping_list');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  // Users & Admins State
  const [usersList, setUsersList] = useState([]);

  // Fetch RTDB configuration, products, orders, shopping list & users with realtime onValue listeners
  useEffect(() => {
    // 1. Realtime listener for siteConfig/images
    const unsubImages = onValue(ref(rtdb, 'siteConfig/images'), (snap) => {
      if (snap.exists()) {
        const merged = { ...DEFAULT_INDEX_IMAGES, ...snap.val() };
        setIndexImages(merged);
        sessionStorage.setItem('jersify_site_images', JSON.stringify(merged));
      }
    }, () => { });

    // 2. Realtime listener for siteConfig/teamBanners
    const unsubTeams = onValue(ref(rtdb, 'siteConfig/teamBanners'), (snap) => {
      if (snap.exists()) {
        const merged = { ...DEFAULT_TEAM_CONFIG, ...snap.val() };
        setTeamBanners(merged);
        sessionStorage.setItem('jersify_team_banners', JSON.stringify(merged));
      }
    }, () => { });

    // 3. Realtime listener for products
    const unsubProds = onValue(ref(rtdb, 'products'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const items = Object.keys(val).map(k => ({ id: k, ...val[k] }));
        setProductsList(items);
        sessionStorage.setItem('jersify_products', JSON.stringify(items));
      } else {
        setProductsList(INITIAL_PRODUCTS);
      }
    }, () => { });

    // 4. Realtime listener for orders
    const unsubOrders = onValue(ref(rtdb, 'orders'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const items = Object.keys(val).map(k => ({ id: k, ...val[k] }));
        setOrdersList(items);
        sessionStorage.setItem('jersify_orders', JSON.stringify(items));
      } else {
        setOrdersList([]);
      }
    }, () => { });

    // 5. Realtime listener for shopping list
    const unsubShoppingList = onValue(ref(rtdb, 'siteConfig/shoppingList'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const list = Array.isArray(val) ? val : Object.keys(val).map(k => ({ id: k, ...val[k] }));
        setShoppingList(list);
        sessionStorage.setItem('jersify_shopping_list', JSON.stringify(list));
      } else {
        setShoppingList([]);
        sessionStorage.removeItem('jersify_shopping_list');
      }
    }, () => { });

    // 6. Realtime listener for users & admins
    const unsubAdmins = onValue(ref(rtdb, 'admins'), () => loadUsersAndAdmins(), () => { });
    const unsubUsers = onValue(ref(rtdb, 'users'), () => loadUsersAndAdmins(), () => { });

    async function loadUsersAndAdmins() {
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
      } catch (e) { }
    }

    // 7. Realtime listener for homepage product sequence
    const unsubOrder = onValue(ref(rtdb, 'siteConfig/homepageOrder'), (snap) => {
      if (snap.exists() && Array.isArray(snap.val())) {
        setHomepageOrder(snap.val());
      }
    }, () => { });

    loadUsersAndAdmins();

    return () => {
      unsubImages();
      unsubTeams();
      unsubProds();
      unsubOrders();
      unsubShoppingList();
      unsubAdmins();
      unsubUsers();
      unsubOrder();
    };
  }, []);

  // Sync selected modal item indices whenever order modal opens
  useEffect(() => {
    if (selectedOrderModal) {
      if (Array.isArray(selectedOrderModal.items) && selectedOrderModal.items.length > 0) {
        setSelectedModalItemIndices(selectedOrderModal.items.map((_, i) => i));
      } else {
        setSelectedModalItemIndices([0]);
      }
    } else {
      setSelectedModalItemIndices([]);
    }
  }, [selectedOrderModal]);

  // Image Save Handler for Index Page
  const handleSaveImages = async () => {
    try {
      await set(ref(rtdb, 'siteConfig/images'), indexImages);
      setImagesSavedToast(true);
      setTimeout(() => setImagesSavedToast(false), 3000);
    } catch (err) {
      alert('Failed to save image configuration to RTDB: ' + err.message);
    }
  };

  const handleSaveHomepageOrder = async (newOrder) => {
    try {
      const orderToSave = newOrder || (homepageOrder.length >= 10 ? homepageOrder : productsList.slice(0, 10).map(p => p.id));
      await set(ref(rtdb, 'siteConfig/homepageOrder'), orderToSave);
      setImagesSavedToast(true);
      setTimeout(() => setImagesSavedToast(false), 3000);
    } catch (err) {
      alert('Failed to save homepage product order: ' + err.message);
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

  // Save Team Banners Config
  const handleSaveTeamBanners = async () => {
    try {
      await set(ref(rtdb, 'siteConfig/teamBanners'), teamBanners);
      setTeamsSavedToast(true);
      setTimeout(() => setTeamsSavedToast(false), 3000);
    } catch (err) {
      alert('Failed to save team banners to RTDB: ' + err.message);
    }
  };

  const handleTeamFieldChange = (teamKey, field, val) => {
    setTeamBanners(prev => ({
      ...prev,
      [teamKey]: {
        ...(prev[teamKey] || {}),
        [field]: val
      }
    }));
  };

  const handleFileUploadForTeamField = async (teamKey, field, file) => {
    if (!file) return;
    const stateKey = `${teamKey}_${field}`;
    setUploadingTeamState(prev => ({ ...prev, [stateKey]: true }));
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const sRef = storageRef(storage, `siteConfig/teamBanners/${teamKey}_${field}_${Date.now()}_${cleanFileName}`);
      await uploadBytes(sRef, file);
      const downloadUrl = await getDownloadURL(sRef);
      handleTeamFieldChange(teamKey, field, downloadUrl);
    } catch (err) {
      alert('Failed to upload team image: ' + err.message);
    } finally {
      setUploadingTeamState(prev => ({ ...prev, [stateKey]: false }));
    }
  };

  const handleAddNewClub = () => {
    if (!newClubName.trim()) return;
    const key = newClubName.trim();
    if (teamBanners[key]) {
      alert('Club/Nation already exists!');
      return;
    }
    const isNation = newClubType === 'national';
    setTeamBanners(prev => ({
      ...prev,
      [key]: {
        name: key.toUpperCase(),
        type: newClubType,
        subtitle: isNation ? 'National Team · World Football' : 'Official Collection',
        founded: '2026',
        stadium: isNation ? 'National Stadium' : 'Home Stadium',
        logo: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
        banner: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
        description: `Official ${isNation ? 'national' : 'club'} kits for ${key}.`
      }
    }));
    setNewClubName('');
  };

  // Upload single or multiple image files directly to Firebase Storage for Product (Max 5 images)
  const handleMultipleFileUploadForProduct = async (files) => {
    if (!files || files.length === 0) return;
    const currentImgs = Array.isArray(productForm.images) && productForm.images.length > 0
      ? [...productForm.images]
      : (productForm.imgUrl ? [productForm.imgUrl] : []);

    const spaceLeft = 5 - currentImgs.length;
    if (spaceLeft <= 0) {
      alert('Maximum 5 images allowed per product.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, spaceLeft);
    if (files.length > spaceLeft) {
      alert(`Only uploading ${spaceLeft} image(s) to maintain the maximum 5 images limit.`);
    }

    setUploadingProductImg(true);
    try {
      const uploadedUrls = [];
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const sRef = storageRef(storage, `products/${Date.now()}_${i}_${cleanFileName}`);
        await uploadBytes(sRef, file);
        const downloadUrl = await getDownloadURL(sRef);
        uploadedUrls.push(downloadUrl);
      }
      setProductForm(prev => {
        const existing = Array.isArray(prev.images) && prev.images.length > 0
          ? [...prev.images]
          : (prev.imgUrl ? [prev.imgUrl] : []);
        const updatedImages = [...existing, ...uploadedUrls].slice(0, 5);
        return {
          ...prev,
          images: updatedImages,
          imgUrl: updatedImages[0] || prev.imgUrl || ''
        };
      });
    } catch (err) {
      alert('Failed to upload image(s) to Firebase Storage: ' + err.message);
    } finally {
      setUploadingProductImg(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrlInput.trim()) return;
    const currentImgs = Array.isArray(productForm.images) && productForm.images.length > 0
      ? [...productForm.images]
      : (productForm.imgUrl ? [productForm.imgUrl] : []);

    if (currentImgs.length >= 5) {
      alert('Maximum 5 images allowed per product.');
      return;
    }

    const trimmed = newImageUrlInput.trim();
    setProductForm(prev => {
      const existing = Array.isArray(prev.images) && prev.images.length > 0
        ? [...prev.images]
        : (prev.imgUrl ? [prev.imgUrl] : []);
      const updatedImages = [...existing, trimmed].slice(0, 5);
      return {
        ...prev,
        images: updatedImages,
        imgUrl: updatedImages[0] || prev.imgUrl || trimmed
      };
    });
    setNewImageUrlInput('');
  };

  const handleRemoveProductImage = (indexToRemove) => {
    setProductForm(prev => {
      const currentImgs = Array.isArray(prev.images) && prev.images.length > 0
        ? [...prev.images]
        : (prev.imgUrl ? [prev.imgUrl] : []);
      const updatedImages = currentImgs.filter((_, idx) => idx !== indexToRemove);
      const newMainUrl = updatedImages[0] || '';
      return {
        ...prev,
        images: updatedImages,
        imgUrl: updatedImages.includes(prev.imgUrl) ? prev.imgUrl : newMainUrl
      };
    });
  };

  const handleSetMainProductImage = (indexToMain) => {
    setProductForm(prev => {
      const currentImgs = Array.isArray(prev.images) && prev.images.length > 0
        ? [...prev.images]
        : (prev.imgUrl ? [prev.imgUrl] : []);
      if (indexToMain > 0 && indexToMain < currentImgs.length) {
        const [targetImg] = currentImgs.splice(indexToMain, 1);
        currentImgs.unshift(targetImg);
      }
      return {
        ...prev,
        images: currentImgs,
        imgUrl: currentImgs[0] || prev.imgUrl || ''
      };
    });
  };

  // Product Handlers
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const imagesArr = (Array.isArray(productForm.images) && productForm.images.length > 0
        ? productForm.images
        : (productForm.imgUrl ? [productForm.imgUrl] : [])).slice(0, 5);
      const mainImgUrl = imagesArr[0] || productForm.imgUrl || '';

      if (!mainImgUrl) {
        alert('Please upload or add at least one product image.');
        return;
      }

      const inferredTeamType = productForm.teamType || (NATIONAL_OPTIONS.includes(productForm.team) ? 'national' : 'club');

      const finalProductData = {
        ...productForm,
        teamType: inferredTeamType,
        images: imagesArr,
        imgUrl: mainImgUrl
      };

      if (editingProductId) {
        await update(ref(rtdb, `products/${editingProductId}`), finalProductData);
        setProductsList(prev => prev.map(p => p.id === editingProductId ? { ...p, ...finalProductData } : p));
      } else {
        const newRef = push(ref(rtdb, 'products'));
        const newProd = { ...finalProductData, id: newRef.key };
        await set(newRef, newProd);
        setProductsList(prev => [newProd, ...prev]);
      }

      // Automatically register team to teamBanners if not yet registered
      const teamKey = (productForm.team || '').trim();
      if (teamKey && !teamBanners[teamKey]) {
        const isNation = inferredTeamType === 'national';
        const newTeamEntry = {
          name: teamKey.toUpperCase(),
          type: inferredTeamType,
          subtitle: isNation ? 'National Team · World Football' : 'Official Collection',
          founded: '2026',
          stadium: isNation ? 'National Stadium' : 'Home Stadium',
          logo: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
          banner: 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
          description: `Official ${isNation ? 'national' : 'club'} kits for ${teamKey}.`
        };
        try {
          await set(ref(rtdb, `siteConfig/teamBanners/${teamKey}`), newTeamEntry);
          setTeamBanners(prev => ({ ...prev, [teamKey]: newTeamEntry }));
        } catch (e) { }
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

  // Sorted and Filtered Customer Orders (Latest at Top by default)
  const sortedOrders = useMemo(() => {
    let list = [...ordersList];

    // Status filter
    if (orderStatusFilter !== 'all') {
      list = list.filter(o => (o.status || 'confirmed').toLowerCase() === orderStatusFilter.toLowerCase());
    }

    // Search query filter
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      list = list.filter(o =>
        (o.id && String(o.id).toLowerCase().includes(q)) ||
        (o.orderId && String(o.orderId).toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.phone && String(o.phone).toLowerCase().includes(q)) ||
        (o.email && o.email.toLowerCase().includes(q))
      );
    }

    // Sorting: Newest/Latest First by default!
    list.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (Number(a.id) || 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (Number(b.id) || 0);

      if (orderSortOption === 'newest') return timeB - timeA;
      if (orderSortOption === 'oldest') return timeA - timeB;
      if (orderSortOption === 'total-high') return (Number(b.total) || 0) - (Number(a.total) || 0);
      if (orderSortOption === 'total-low') return (Number(a.total) || 0) - (Number(b.total) || 0);
      if (orderSortOption === 'customer') return (a.customerName || '').localeCompare(b.customerName || '');
      return timeB - timeA;
    });

    return list;
  }, [ordersList, orderSortOption, orderStatusFilter, orderSearchQuery]);

  // Shopping List Actions
  const handleSaveShoppingList = async (updatedList) => {
    setShoppingList(updatedList);
    sessionStorage.setItem('jersify_shopping_list', JSON.stringify(updatedList));
    try {
      await set(ref(rtdb, 'siteConfig/shoppingList'), updatedList);
    } catch (e) {
      console.error('Failed to sync shopping list to RTDB:', e);
    }
  };

  const handleAddItemsFromModal = async (itemsToAdd) => {
    if (!itemsToAdd || itemsToAdd.length === 0) {
      alert('Please select at least one item from the order to add to the shopping list.');
      return;
    }

    const orderId = selectedOrderModal?.orderId || selectedOrderModal?.id || 'Direct';
    const customer = selectedOrderModal?.customerName || 'Customer';

    const newEntries = itemsToAdd.map((item, idx) => {
      const entryId = `shop_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`;
      return {
        id: entryId,
        productId: item.id || item.productId || '',
        name: item.name || item.title || 'Football Kit',
        size: item.size || item.selectedSize || 'M',
        team: item.team || '',
        version: item.version || item.type || 'Fan Version',
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        imgUrl: item.imgUrl || item.image || item.images?.[0] || 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de',
        orderId: orderId,
        customerName: customer,
        status: 'pending', // 'pending' | 'shopped'
        addedAt: Date.now()
      };
    });

    const updated = [...newEntries, ...shoppingList];
    await handleSaveShoppingList(updated);
    alert(`Successfully added ${newEntries.length} product(s) to the Shopping List!`);
  };

  const handleRemoveShoppingListItem = async (itemId) => {
    const updated = shoppingList.filter(item => item.id !== itemId);
    await handleSaveShoppingList(updated);
  };

  const handleToggleShoppingItemStatus = async (itemId) => {
    const updated = shoppingList.map(item => {
      if (item.id === itemId) {
        return { ...item, status: item.status === 'shopped' ? 'pending' : 'shopped' };
      }
      return item;
    });
    await handleSaveShoppingList(updated);
  };

  const formatDMY = (val, includeTime = false) => {
    if (!val) return 'Recent';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const dateStr = `${dd}/${mm}/${yyyy}`;
    if (!includeTime) return dateStr;
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr}, ${timeStr}`;
  };

  const handleClearShoppingList = async () => {
    if (window.confirm('Are you sure you want to clear all items from the shopping list?')) {
      await handleSaveShoppingList([]);
    }
  };

  const handleDownloadPDF = () => {
    if (shoppingList.length === 0) {
      alert('Shopping list is currently empty.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download/print the PDF shopping list.');
      return;
    }

    const totalQty = shoppingList.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
    const uniqueOrders = new Set(shoppingList.map(i => i.orderId).filter(Boolean)).size;
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const dateStr = `${dd}/${mm}/${yyyy}`;
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Jersify_Shopping_List_${dd}_${mm}_${yyyy}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #111111;
              padding: 28px;
              background: #FFFFFF;
            }
            .header-bar {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-bottom: 2.5px solid #111111;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .brand-title {
              font-size: 24px;
              font-weight: 900;
              letter-spacing: 2px;
              color: #111111;
            }
            .brand-sub {
              font-size: 11px;
              color: #6B7280;
              font-weight: 700;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              margin-top: 3px;
            }
            .meta-info {
              text-align: right;
              font-size: 12px;
              color: #4B5563;
              line-height: 1.5;
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-bottom: 22px;
            }
            .card {
              background: #F9FAFB;
              border: 1px solid #E5E7EB;
              border-radius: 4px;
              padding: 10px 14px;
            }
            .card-label {
              font-size: 10px;
              font-weight: 700;
              color: #6B7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .card-val {
              font-size: 18px;
              font-weight: 800;
              color: #111111;
              margin-top: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            thead tr {
              background: #111111;
              color: #FFFFFF;
            }
            th {
              padding: 10px 8px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              text-align: left;
            }
            td {
              padding: 10px 8px;
              border-bottom: 1px solid #E5E7EB;
              vertical-align: middle;
            }
            tr:nth-child(even) td {
              background: #FAFAFA;
            }
            .badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 3px;
              font-weight: 700;
              font-size: 11px;
            }
            .size-badge {
              background: #111111;
              color: #FFFFFF;
              font-size: 12px;
              min-width: 28px;
              text-align: center;
            }
            .qty-badge {
              background: #DCFCE7;
              color: #166534;
              font-weight: 800;
              font-size: 12px;
              padding: 3px 10px;
              border-radius: 9999px;
            }
            .check-box {
              width: 18px;
              height: 18px;
              border: 1.5px solid #111111;
              border-radius: 2px;
              margin: 0 auto;
            }
            .footer-note {
              margin-top: 30px;
              padding-top: 12px;
              border-top: 1px solid #E5E7EB;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #9CA3AF;
            }
            @media print {
              body { padding: 10mm; }
              @page { size: portrait; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <div class="brand-title">JERSIFY</div>
              <div class="brand-sub">PROCUREMENT & SHOPPING LIST</div>
            </div>
            <div class="meta-info">
              <div><strong>Generated:</strong> ${dateStr} at ${timeStr}</div>
              <div><strong>Total Items:</strong> ${shoppingList.length} products</div>
            </div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-label">TOTAL ITEMS NEEDED</div>
              <div class="card-val">${shoppingList.length}</div>
            </div>
            <div class="card">
              <div class="card-label">TOTAL UNITS / PIECES</div>
              <div class="card-val">${totalQty} pcs</div>
            </div>
            <div class="card">
              <div class="card-label">CUSTOMER ORDERS</div>
              <div class="card-val">${uniqueOrders} orders</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">#</th>
                <th>Product Description</th>
                <th>Team</th>
                <th>Version</th>
                <th style="text-align: center; width: 60px;">Size</th>
                <th style="text-align: center; width: 60px;">Qty</th>
                <th>Order Ref</th>
                <th>Customer</th>
                <th style="text-align: center; width: 60px;">Bought</th>
              </tr>
            </thead>
            <tbody>
              ${shoppingList.map((item, idx) => `
                <tr>
                  <td style="text-align: center; color: #6B7280;">${idx + 1}</td>
                  <td><strong>${item.name}</strong></td>
                  <td>${item.team || '—'}</td>
                  <td>${item.version || 'Fan Version'}</td>
                  <td style="text-align: center;"><span class="badge size-badge">${item.size || 'M'}</span></td>
                  <td style="text-align: center;"><span class="badge qty-badge">${item.quantity || 1}</span></td>
                  <td><span style="font-family: monospace; font-size: 11px;">#${item.orderId || 'Direct'}</span></td>
                  <td>${item.customerName || 'Customer'}</td>
                  <td style="text-align: center;"><div class="check-box"></div></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer-note">
            <span>Jersify Order Fulfillment & Inventory Procurement</span>
            <span>Check off each item once procured from supplier/market</span>
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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

      {/* Navigation Tabs (6 Separated Tabs) */}
      <div style={{ display: 'flex', background: '#F3F4F6', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('images')}
          style={{ flex: 1, padding: '14px 10px', border: 'none', background: activeTab === 'images' ? '#FFFFFF' : 'transparent', borderBottom: activeTab === 'images' ? '3px solid #111111' : 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          🖼️ Index Page Images ({Object.keys(indexImages).length})
        </button>
        <button
          onClick={() => setActiveTab('clubs')}
          style={{ flex: 1, padding: '14px 10px', border: 'none', background: activeTab === 'clubs' ? '#FFFFFF' : 'transparent', borderBottom: activeTab === 'clubs' ? '3px solid #111111' : 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          🛡️ Clubs & Nations ({Object.keys(teamBanners).length})
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
          onClick={() => setActiveTab('shopping-list')}
          style={{ flex: 1, padding: '14px 10px', border: 'none', background: activeTab === 'shopping-list' ? '#FFFFFF' : 'transparent', borderBottom: activeTab === 'shopping-list' ? '3px solid #111111' : 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          🛒 Shopping list {shoppingList.length > 0 ? `(${shoppingList.length})` : ''}
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
                      <ImageWithSpinner src={item.url} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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

          {/* Homepage 10 Products Sequence Controller */}
          <div style={{ marginTop: '32px', borderTop: '2px solid #E5E7EB', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111111', margin: 0 }}>Homepage 10 Products Sequence Controller</h3>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0' }}>Re-order or pick which 10 products appear on the main index page.</p>
              </div>
              <button
                onClick={() => handleSaveHomepageOrder()}
                style={{ background: '#000000', color: '#FFFFFF', padding: '10px 20px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
              >
                💾 Save Homepage Product Sequence
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#F9FAFB', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
              {Array.from({ length: 10 }).map((_, idx) => {
                const currentSequence = homepageOrder.length >= 10 ? homepageOrder : productsList.slice(0, 10).map(p => p.id);
                const currentSelectedId = currentSequence[idx] || (productsList[idx] ? productsList[idx].id : '');
                const selectedProd = productsList.find(p => String(p.id) === String(currentSelectedId)) || productsList[idx];

                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FFFFFF', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: '#111111', minWidth: '32px' }}>
                      #{idx + 1}
                    </span>

                    <div style={{ width: '42px', height: '42px', background: '#F3F4F6', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
                      {selectedProd && (
                        <ImageWithSpinner src={selectedProd.imgUrl} alt={selectedProd.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <select
                        value={currentSelectedId}
                        onChange={(e) => {
                          const newId = e.target.value;
                          const updated = [...currentSequence];
                          updated[idx] = newId;
                          setHomepageOrder(updated);
                          handleSaveHomepageOrder(updated);
                        }}
                        style={{ width: '100%', height: '36px', padding: '0 8px', border: '1px solid #D1D5DB', borderRadius: '2px', fontSize: '13px', fontWeight: 600, color: '#111111' }}
                      >
                        {productsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ₹{p.price} ({p.team || 'General'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        disabled={idx === 0}
                        onClick={() => {
                          if (idx === 0) return;
                          const currentArr = [...currentSequence];
                          const temp = currentArr[idx];
                          currentArr[idx] = currentArr[idx - 1];
                          currentArr[idx - 1] = temp;
                          setHomepageOrder(currentArr);
                          handleSaveHomepageOrder(currentArr);
                        }}
                        style={{ padding: '6px 10px', fontSize: '12px', fontWeight: 700, background: idx === 0 ? '#E5E7EB' : '#111111', color: idx === 0 ? '#9CA3AF' : '#FFFFFF', border: 'none', borderRadius: '2px', cursor: idx === 0 ? 'default' : 'pointer' }}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        disabled={idx === 9}
                        onClick={() => {
                          if (idx === 9) return;
                          const currentArr = [...currentSequence];
                          const temp = currentArr[idx];
                          currentArr[idx] = currentArr[idx + 1];
                          currentArr[idx + 1] = temp;
                          setHomepageOrder(currentArr);
                          handleSaveHomepageOrder(currentArr);
                        }}
                        style={{ padding: '6px 10px', fontSize: '12px', fontWeight: 700, background: idx === 9 ? '#E5E7EB' : '#111111', color: idx === 9 ? '#9CA3AF' : '#FFFFFF', border: 'none', borderRadius: '2px', cursor: idx === 9 ? 'default' : 'pointer' }}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}


      {/* TAB 2: CLUBS & NATIONS PAGE IMAGE CONTROLLER */}
      {activeTab === 'clubs' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111111' }}>Clubs & Nations Page Image Controller</h2>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>Manage hero banners, crest logos, stadium titles & descriptions for every club and national team page.</p>
            </div>
            <button
              onClick={handleSaveTeamBanners}
              style={{ background: '#000000', color: '#FFFFFF', padding: '10px 20px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
            >
              💾 Save All Club Banners
            </button>
          </div>

          {teamsSavedToast && (
            <div style={{ background: '#D1FAE5', color: '#065F46', padding: '12px', fontWeight: 700, fontSize: '14px' }}>
              ✓ Club page banners and descriptions saved to Realtime Database successfully!
            </div>
          )}

          {/* Quick Add New Club / Nation Bar */}
          <div style={{ background: '#F3F4F6', padding: '14px 18px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#111111' }}>+ Add New Entry:</span>

            {/* Select Club or Nation */}
            <select
              value={newClubType}
              onChange={(e) => setNewClubType(e.target.value)}
              style={{ height: '36px', padding: '0 10px', border: '1.5px solid #111111', fontSize: '13px', fontWeight: 700, background: '#FFFFFF', cursor: 'pointer' }}
            >
              <option value="club">🛡️ Club</option>
              <option value="national">🌐 Nation</option>
            </select>

            <input
              type="text"
              placeholder={newClubType === 'national' ? "e.g. France or Brazil" : "e.g. PSG or Arsenal"}
              value={newClubName}
              onChange={(e) => setNewClubName(e.target.value)}
              style={{ height: '36px', padding: '0 10px', border: '1px solid #D1D5DB', width: '220px', fontSize: '13px' }}
            />
            <button
              onClick={handleAddNewClub}
              style={{ background: '#111111', color: '#FFFFFF', border: 'none', padding: '8px 16px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              Create {newClubType === 'national' ? 'Nation' : 'Club'} Entry
            </button>
          </div>

          {/* Cards Grid for Each Club / Nation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
            {Object.keys(teamBanners).map(teamKey => {
              const team = teamBanners[teamKey];
              const isNation = team.type === 'national' || NATIONAL_OPTIONS.includes(teamKey);
              return (
                <div key={teamKey} style={{ border: '1.5px solid #111111', padding: '18px', borderRadius: '4px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111111', margin: 0 }}>{teamKey}</h3>
                      <select
                        value={team.type || (isNation ? 'national' : 'club')}
                        onChange={(e) => handleTeamFieldChange(teamKey, 'type', e.target.value)}
                        style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', border: '1px solid #D1D5DB', background: '#F9FAFB', cursor: 'pointer' }}
                      >
                        <option value="club">🛡️ Club</option>
                        <option value="national">🌐 Nation</option>
                      </select>
                    </div>
                    <span style={{ fontSize: '11px', background: isNation ? '#EFF6FF' : '#F3F4F6', color: isNation ? '#1D4ED8' : '#111827', padding: '3px 8px', fontWeight: 700, borderRadius: '2px' }}>
                      {isNation ? 'NATION Showcase Page' : 'CLUB Showcase Page'}
                    </span>
                  </div>

                  {/* 1. Hero Banner Image (Aspect 16:9 / 393x220px) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#111111' }}>1. HERO BANNER IMAGE</label>
                      <span style={{ fontSize: '10px', background: '#EDDBDB', padding: '2px 6px', fontWeight: 700 }}>Aspect: 16:9 (393x220px)</span>
                    </div>
                    <div style={{ width: '100%', height: '120px', background: '#111111', overflow: 'hidden', borderRadius: '2px', position: 'relative' }}>
                      <ImageWithSpinner src={team.banner} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <input
                        type="text"
                        value={team.banner || ''}
                        onChange={(e) => handleTeamFieldChange(teamKey, 'banner', e.target.value)}
                        placeholder="Banner URL..."
                        style={{ flex: 1, height: '34px', padding: '0 8px', border: '1px solid #D1D5DB', fontSize: '11px', fontFamily: 'monospace' }}
                      />
                      <label style={{ background: '#111111', color: '#FFFFFF', padding: '6px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                        {uploadingTeamState[`${teamKey}_banner`] ? '⏳...' : '📁 Upload Banner'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUploadForTeamField(teamKey, 'banner', e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* 2. Club Logo / Crest Image (Aspect 1:1) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#111111' }}>2. CLUB CREST LOGO</label>
                      <span style={{ fontSize: '10px', background: '#EDDBDB', padding: '2px 6px', fontWeight: 700 }}>Aspect: 1:1 Crest (64x64px)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '56px', height: '56px', background: '#F3F4F6', borderRadius: '50%', padding: '4px', border: '1px solid #E5E7EB', flexShrink: 0 }}>
                        <ImageWithSpinner src={team.logo} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                          type="text"
                          value={team.logo || ''}
                          onChange={(e) => handleTeamFieldChange(teamKey, 'logo', e.target.value)}
                          placeholder="Logo Crest URL..."
                          style={{ height: '34px', padding: '0 8px', border: '1px solid #D1D5DB', fontSize: '11px', fontFamily: 'monospace' }}
                        />
                        <label style={{ background: '#111111', color: '#FFFFFF', padding: '4px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'inline-block', width: 'fit-content' }}>
                          {uploadingTeamState[`${teamKey}_logo`] ? '⏳ Uploading...' : '📁 Upload Crest Logo'}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUploadForTeamField(teamKey, 'logo', e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 3. Club Details Inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700 }}>DISPLAY NAME</label>
                      <input type="text" value={team.name || ''} onChange={(e) => handleTeamFieldChange(teamKey, 'name', e.target.value)} style={{ height: '34px', padding: '0 8px', border: '1px solid #D1D5DB', fontSize: '12px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700 }}>LEAGUE / SUBTITLE</label>
                      <input type="text" value={team.subtitle || ''} onChange={(e) => handleTeamFieldChange(teamKey, 'subtitle', e.target.value)} style={{ height: '34px', padding: '0 8px', border: '1px solid #D1D5DB', fontSize: '12px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700 }}>FOUNDED YEAR</label>
                      <input type="text" value={team.founded || ''} onChange={(e) => handleTeamFieldChange(teamKey, 'founded', e.target.value)} style={{ height: '34px', padding: '0 8px', border: '1px solid #D1D5DB', fontSize: '12px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700 }}>HOME STADIUM</label>
                      <input type="text" value={team.stadium || ''} onChange={(e) => handleTeamFieldChange(teamKey, 'stadium', e.target.value)} style={{ height: '34px', padding: '0 8px', border: '1px solid #D1D5DB', fontSize: '12px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700 }}>CLUB DESCRIPTION</label>
                    <textarea value={team.description || ''} onChange={(e) => handleTeamFieldChange(teamKey, 'description', e.target.value)} style={{ height: '50px', padding: '6px 8px', border: '1px solid #D1D5DB', fontSize: '12px', fontFamily: 'Karla' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS LIST MANAGER */}
      {activeTab === 'products' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111111' }}>Catalogue Product Manager</h2>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>Add and manage jersey products with team selection (Club vs National) and up to 5 product gallery images.</p>
            </div>
            <button
              onClick={() => {
                setProductForm({ name: '', teamType: 'club', team: 'Barcelona', categoryTag: 'this season', version: 'fan', price: 750, imgUrl: '', images: [], badge: 'NEW', description: '' });
                setNewImageUrlInput('');
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

              {/* Category Type Toggle: Club vs National */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#FFFFFF', padding: '12px', border: '1px solid #D1D5DB' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#111111' }}>1. SELECT CATEGORY TYPE *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultClub = CLUB_OPTIONS[0];
                      setProductForm(prev => ({
                        ...prev,
                        teamType: 'club',
                        team: CLUB_OPTIONS.includes(prev.team) ? prev.team : defaultClub
                      }));
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      border: (productForm.teamType || 'club') === 'club' ? '2px solid #111111' : '1px solid #D1D5DB',
                      background: (productForm.teamType || 'club') === 'club' ? '#111111' : '#F9FAFB',
                      color: (productForm.teamType || 'club') === 'club' ? '#FFFFFF' : '#374151',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    🛡️ Club Team
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultNational = NATIONAL_OPTIONS[0];
                      setProductForm(prev => ({
                        ...prev,
                        teamType: 'national',
                        team: NATIONAL_OPTIONS.includes(prev.team) ? prev.team : defaultNational
                      }));
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      border: productForm.teamType === 'national' ? '2px solid #111111' : '1px solid #D1D5DB',
                      background: productForm.teamType === 'national' ? '#111111' : '#F9FAFB',
                      color: productForm.teamType === 'national' ? '#FFFFFF' : '#374151',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    🌐 National Team
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>PRODUCT NAME *</label>
                  <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="BARCELONA HOME 26/27" style={{ height: '38px', padding: '0 10px', border: '1px solid #D1D5DB' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>
                    {productForm.teamType === 'national' ? 'NATIONAL TEAM NAME *' : 'CLUB TEAM NAME *'}
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      value={productForm.team}
                      onChange={(e) => setProductForm({ ...productForm, team: e.target.value })}
                      style={{ flex: 1, height: '38px', padding: '0 10px', border: '1px solid #D1D5DB', background: '#FFFFFF', fontWeight: 600, fontSize: '13px' }}
                    >
                      {(productForm.teamType === 'national' ? availableNationalOptions : availableClubOptions).map(opt => {
                        const isAdded = !!teamBanners[opt];
                        return (
                          <option key={opt} value={opt}>
                            {opt} {isAdded ? '★ (Added)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <input
                      type="text"
                      placeholder={productForm.teamType === 'national' ? "Or type nation..." : "Or type club..."}
                      value={productForm.team}
                      onChange={(e) => setProductForm({ ...productForm, team: e.target.value })}
                      style={{ flex: 1, height: '38px', padding: '0 10px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                    />
                  </div>
                  {productForm.team && !teamBanners[productForm.team.trim()] && (
                    <button
                      type="button"
                      onClick={() => handleQuickAddTeamFromProduct(productForm.team, productForm.teamType || 'club')}
                      style={{ alignSelf: 'flex-start', marginTop: '4px', background: '#10B981', color: '#FFFFFF', border: 'none', padding: '5px 10px', fontSize: '11px', fontWeight: 700, borderRadius: '2px', cursor: 'pointer' }}
                    >
                      + Save &quot;{productForm.team}&quot; as registered {productForm.teamType === 'national' ? 'Nation' : 'Club'}
                    </button>
                  )}
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

              {/* Product Images (Max 5 Images with 1st as Primary Cover) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#FFFFFF', padding: '12px', border: '1px solid #D1D5DB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#111111' }}>
                    PRODUCT IMAGES GALLERY (Up to 5 Images - 1st is Primary Cover) *
                  </label>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: (Array.isArray(productForm.images) ? productForm.images.length : (productForm.imgUrl ? 1 : 0)) >= 5 ? '#DC2626' : '#10B981' }}>
                    {(Array.isArray(productForm.images) && productForm.images.length > 0 ? productForm.images.length : (productForm.imgUrl ? 1 : 0))} / 5 attached
                  </span>
                </div>

                {/* Gallery Thumbnails List */}
                {((Array.isArray(productForm.images) && productForm.images.length > 0) || productForm.imgUrl) && (
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '6px 0' }}>
                    {(Array.isArray(productForm.images) && productForm.images.length > 0
                      ? productForm.images
                      : [productForm.imgUrl]
                    ).slice(0, 5).map((imgUrl, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '84px', height: '84px', border: idx === 0 ? '2px solid #10B981' : '1px solid #D1D5DB', borderRadius: '4px', overflow: 'hidden', background: '#F9FAFB', flexShrink: 0 }}>
                        <ImageWithSpinner src={imgUrl} alt={`Product ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        <span style={{ position: 'absolute', top: '2px', left: '2px', background: idx === 0 ? '#10B981' : '#374151', color: '#FFFFFF', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '2px' }}>
                          {idx === 0 ? 'PRIMARY' : `#${idx + 1}`}
                        </span>
                        <div style={{ position: 'absolute', bottom: '2px', left: '2px', right: '2px', display: 'flex', gap: '2px' }}>
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetMainProductImage(idx)}
                              style={{ flex: 1, background: 'rgba(0,0,0,0.85)', color: '#FFFFFF', border: 'none', fontSize: '8px', fontWeight: 700, padding: '3px 0', cursor: 'pointer', borderRadius: '2px' }}
                              title="Set as Primary Cover Image"
                            >
                              ★ Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage(idx)}
                            style={{ flex: 1, background: '#EF4444', color: '#FFFFFF', border: 'none', fontSize: '9px', fontWeight: 700, padding: '3px 0', cursor: 'pointer', borderRadius: '2px' }}
                            title="Remove Image"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload or Add URL Inputs (Max 5 enforced) */}
                {((Array.isArray(productForm.images) ? productForm.images.length : (productForm.imgUrl ? 1 : 0)) < 5) ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    <label style={{
                      background: '#111111',
                      color: '#FFFFFF',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '2px'
                    }}>
                      {uploadingProductImg ? '⏳ Uploading Files...' : '📁 Upload Image File(s)'}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleMultipleFileUploadForProduct(e.target.files);
                          }
                        }}
                      />
                    </label>

                    <div style={{ display: 'flex', flex: 1, minWidth: '240px', gap: '4px' }}>
                      <input
                        type="text"
                        value={newImageUrlInput}
                        onChange={(e) => setNewImageUrlInput(e.target.value)}
                        placeholder="Or paste image URL here..."
                        style={{ flex: 1, height: '36px', padding: '0 10px', border: '1px solid #D1D5DB', fontSize: '12px', fontFamily: 'monospace' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        style={{ background: '#374151', color: '#FFFFFF', border: 'none', padding: '0 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Add URL
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#FEF3C7', color: '#92400E', padding: '8px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '2px' }}>
                    ✓ Maximum limit of 5 images reached. To change images, remove an existing thumbnail or click "★ Primary" to set the cover image.
                  </div>
                )}
                {uploadingProductImg && <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>Uploading image files to Firebase Storage...</span>}
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
            {productsList.map(p => {
              const pImages = (Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.imgUrl ? [p.imgUrl] : [])).slice(0, 5);
              const isNation = NATIONAL_OPTIONS.includes(p.team);
              const pType = p.teamType || (isNation ? 'national' : 'club');

              return (
                <div key={p.id} style={{ border: '1px solid #E5E7EB', padding: '14px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ height: '160px', width: '100%', background: '#F5F5F5', overflow: 'hidden', position: 'relative' }}>
                    <ImageWithSpinner src={p.imgUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <span style={{ position: 'absolute', top: '6px', left: '6px', background: pType === 'national' ? '#2563EB' : '#111111', color: '#FFFFFF', fontSize: '9px', fontWeight: 800, padding: '2px 6px', textTransform: 'uppercase', borderRadius: '2px' }}>
                      {pType === 'national' ? '🌐 NATIONAL' : '🛡️ CLUB'}
                    </span>
                    <span style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.75)', color: '#FFFFFF', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '2px' }}>
                      📷 {pImages.length}/5
                    </span>
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
                        const existingImages = (Array.isArray(p.images) && p.images.length > 0
                          ? [...p.images]
                          : (p.imgUrl ? [p.imgUrl] : [])).slice(0, 5);
                        const inferredType = p.teamType || (NATIONAL_OPTIONS.includes(p.team) ? 'national' : 'club');
                        setProductForm({
                          ...p,
                          teamType: inferredType,
                          images: existingImages,
                          imgUrl: p.imgUrl || existingImages[0] || ''
                        });
                        setNewImageUrlInput('');
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
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER ORDERS (SEPARATED TAB) */}
      {activeTab === 'orders' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111111' }}>Customer Orders Management</h2>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>View live customer orders with sorting, filters, product details, and shopping list management.</p>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, background: '#F3F4F6', color: '#374151', padding: '6px 12px', borderRadius: '4px' }}>
              Showing {sortedOrders.length} of {ordersList.length} Order(s)
            </span>
          </div>

          {/* Orders Sort & Filter Controls Toolbar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '14px', borderRadius: '4px' }}>
            {/* Sort Orders Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#4B5563', whiteSpace: 'nowrap' }}>Sort By:</label>
              <select
                value={orderSortOption}
                onChange={(e) => setOrderSortOption(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #111111', background: '#FFFFFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Karla' }}
              >
                <option value="newest">⚡ Latest Orders First (Default)</option>
                <option value="oldest">⌛ Oldest Orders First</option>
                <option value="total-high">💰 Total: High to Low</option>
                <option value="total-low">🏷️ Total: Low to High</option>
                <option value="customer">👤 Customer Name (A-Z)</option>
              </select>
            </div>

            {/* Status Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 180px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#4B5563', whiteSpace: 'nowrap' }}>Status:</label>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #D1D5DB', background: '#FFFFFF', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'Karla' }}
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Search Input */}
            <div style={{ flex: '1 1 220px' }}>
              <input
                type="text"
                placeholder="Search Order ID, Customer, Phone..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', border: '1px solid #D1D5DB', fontSize: '13px', fontFamily: 'Karla' }}
              />
            </div>

            {(orderStatusFilter !== 'all' || orderSearchQuery || orderSortOption !== 'newest') && (
              <button
                onClick={() => {
                  setOrderStatusFilter('all');
                  setOrderSearchQuery('');
                  setOrderSortOption('newest');
                }}
                style={{ padding: '8px 12px', background: '#E5E7EB', color: '#374151', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', borderRadius: '3px' }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {ordersList.length === 0 ? (
            <div style={{ padding: '30px', background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#6B7280', fontSize: '14px', textAlign: 'center' }}>
              No live customer orders found in Realtime Database yet.
            </div>
          ) : sortedOrders.length === 0 ? (
            <div style={{ padding: '30px', background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#6B7280', fontSize: '14px', textAlign: 'center' }}>
              No orders matched your selected filters or search query.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {sortedOrders.map((o, idx) => (
                <div key={o.id} style={{ border: '1px solid #E5E7EB', padding: '16px', background: '#F9FAFB', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#111111', color: '#FFFFFF', padding: '2px 8px', borderRadius: '3px', fontSize: '12px', fontWeight: 800 }}>
                          SL #{idx + 1}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '16px', color: '#111111' }}>Order #{o.orderId || o.id}</span>
                        <span style={{
                          background: o.status === 'delivered' ? '#D1FAE5' : o.status === 'dispatched' ? '#DBEAFE' : o.status === 'cancelled' ? '#FEE2E2' : '#FEF3C7',
                          color: o.status === 'delivered' ? '#065F46' : o.status === 'dispatched' ? '#1E40AF' : o.status === 'cancelled' ? '#991B1B' : '#92400E',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          borderRadius: '3px',
                          textTransform: 'uppercase'
                        }}>
                          {o.status || 'confirmed'}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Placed on: {formatDMY(o.createdAt, true)}</p>
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

      {/* TAB: SHOPPING LIST (PROCUREMENT) */}
      {activeTab === 'shopping-list' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header & Main Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111111', margin: 0 }}>Shopping List</h2>
                <span style={{ background: '#10B981', color: '#FFFFFF', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                  {shoppingList.length} Items Needed
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0' }}>
                Products marked for procurement from customer orders. View required sizes, quantities, and download the print/PDF shopping list.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleDownloadPDF}
                disabled={shoppingList.length === 0}
                style={{
                  background: shoppingList.length === 0 ? '#9CA3AF' : '#111111',
                  color: '#FFFFFF',
                  padding: '10px 18px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: shoppingList.length === 0 ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                📥 Download PDF of List
              </button>

              {shoppingList.length > 0 && (
                <button
                  onClick={handleClearShoppingList}
                  style={{
                    background: '#FEE2E2',
                    color: '#991B1B',
                    padding: '10px 14px',
                    border: '1px solid #FECACA',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '14px 18px', borderRadius: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL PRODUCTS</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#111111', marginTop: '2px' }}>{shoppingList.length}</div>
            </div>
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '14px 18px', borderRadius: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL UNITS / PCS</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                {shoppingList.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0)} pcs
              </div>
            </div>
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '14px 18px', borderRadius: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ORDERS COVERED</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#111111', marginTop: '2px' }}>
                {new Set(shoppingList.map(i => i.orderId).filter(Boolean)).size} orders
              </div>
            </div>
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '14px 18px', borderRadius: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SOURCING PROGRESS</span>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#111111', marginTop: '8px' }}>
                {shoppingList.filter(i => i.status === 'shopped').length} / {shoppingList.length} Sourced
              </div>
            </div>
          </div>

          {/* List Content */}
          {shoppingList.length === 0 ? (
            <div style={{ padding: '60px 20px', background: '#F9FAFB', border: '1px dashed #D1D5DB', borderRadius: '6px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '40px' }}>🛒</span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111111', margin: 0 }}>Your Shopping List is Empty</h3>
              <p style={{ fontSize: '13px', color: '#6B7280', maxWidth: '460px', margin: 0 }}>
                Products marked for need to shop from orders will appear here. Go to the <strong>Customer Orders</strong> tab, click <strong>View Order Details</strong> on any order, and click <strong>Add to Shopping List</strong>.
              </p>
              <button
                onClick={() => setActiveTab('orders')}
                style={{ background: '#111111', color: '#FFFFFF', padding: '9px 18px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', borderRadius: '4px', marginTop: '6px' }}
              >
                Go to Customer Orders →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px' }}>
                <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 700 }}>
                  Click checkbox or status badge to mark items as procured/shopped.
                </span>
                <span style={{ fontSize: '12px', color: '#111111', fontWeight: 700 }}>
                  {shoppingList.filter(i => i.status !== 'shopped').length} Pending Procurement
                </span>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', background: '#FFFFFF' }}>
                  <thead>
                    <tr style={{ background: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '12px 14px', width: '40px', textAlign: 'center' }}>STATUS</th>
                      <th style={{ padding: '12px 14px', width: '60px' }}>IMAGE</th>
                      <th style={{ padding: '12px 14px' }}>PRODUCT & DETAILS</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', width: '90px' }}>SIZE</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', width: '80px' }}>QTY</th>
                      <th style={{ padding: '12px 14px' }}>ORDER REF</th>
                      <th style={{ padding: '12px 14px' }}>CUSTOMER</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right', width: '100px' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shoppingList.map((item, idx) => {
                      const isShopped = item.status === 'shopped';
                      return (
                        <tr
                          key={item.id || idx}
                          style={{
                            borderBottom: '1px solid #F3F4F6',
                            background: isShopped ? '#F9FAFB' : '#FFFFFF',
                            opacity: isShopped ? 0.75 : 1
                          }}
                        >
                          {/* Checkbox toggle */}
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isShopped}
                              onChange={() => handleToggleShoppingItemStatus(item.id)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10B981' }}
                              title={isShopped ? 'Mark as Pending' : 'Mark as Sourced/Shopped'}
                            />
                          </td>

                          {/* Image */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ width: '50px', height: '50px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                              <ImageWithSpinner
                                src={item.imgUrl || "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de"}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            </div>
                          </td>

                          {/* Product & Details */}
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#111111', textDecoration: isShopped ? 'line-through' : 'none' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                              {item.team ? `Team: ${item.team} · ` : ''}Version: {item.version || 'Fan Version'}
                            </div>
                          </td>

                          {/* Size */}
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span style={{
                              background: '#111111',
                              color: '#FFFFFF',
                              padding: '4px 10px',
                              borderRadius: '3px',
                              fontWeight: 800,
                              fontSize: '12px'
                            }}>
                              {item.size || 'M'}
                            </span>
                          </td>

                          {/* Qty */}
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span style={{
                              background: '#DCFCE7',
                              color: '#166534',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontWeight: 800,
                              fontSize: '12px'
                            }}>
                              {item.quantity || 1} pcs
                            </span>
                          </td>

                          {/* Order Ref */}
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#2563EB' }}>
                              #{item.orderId || 'Direct'}
                            </span>
                            {item.addedAt && (
                              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                                Added: {formatDMY(item.addedAt)}
                              </div>
                            )}
                          </td>

                          {/* Customer */}
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontWeight: 600, color: '#374151' }}>
                              {item.customerName || 'Customer'}
                            </span>
                          </td>

                          {/* Action */}
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleRemoveShoppingListItem(item.id)}
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid #EF4444',
                                color: '#EF4444',
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                borderRadius: '3px'
                              }}
                              title="Remove from shopping list"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: REGISTERED USERS & ADMINS (SEPARATED TAB) */}
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
                  <p><strong>Order Date:</strong> {formatDMY(selectedOrderModal.createdAt, true)}</p>
                </div>
                <p style={{ fontSize: '13px', margin: 0 }}><strong>Address:</strong> {selectedOrderModal.address}</p>
              </div>

              {/* Purchased Products Items Section with Images */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#111111' }}>
                    Ordered Products & Items ({Array.isArray(selectedOrderModal.items) ? selectedOrderModal.items.length : 1})
                  </h4>
                  {Array.isArray(selectedOrderModal.items) && selectedOrderModal.items.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedModalItemIndices(selectedOrderModal.items.map((_, i) => i))}
                        style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      >
                        Select All
                      </button>
                      <span style={{ color: '#D1D5DB' }}>|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedModalItemIndices([])}
                        style={{ background: 'none', border: 'none', color: '#6B7280', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      >
                        Deselect All
                      </button>
                    </div>
                  )}
                </div>

                {Array.isArray(selectedOrderModal.items) && selectedOrderModal.items.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedOrderModal.items.map((item, idx) => {
                      const isSelected = selectedModalItemIndices.includes(idx);
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: isSelected ? '1px solid #10B981' : '1px solid #E5E7EB',
                            padding: '10px',
                            borderRadius: '4px',
                            background: isSelected ? '#F0FDF4' : '#FFFFFF',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* Item Select Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedModalItemIndices(prev =>
                                prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                              );
                            }}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10B981', flexShrink: 0 }}
                            title="Select to add to Shopping List"
                          />

                          <div style={{ width: '55px', height: '55px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                            <ImageWithSpinner
                              src={item.imgUrl || item.image || "https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/products%2F1790168539400_pfan_0_53D6DCBB-4039-49B7-97F4-62BA557B52B9.png?alt=media&token=96bede60-268d-47a1-b9e3-2ec020a024de"}
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>

                          <div style={{ flex: 1 }}>
                            <h5 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#111111' }}>{item.name || item.title}</h5>
                            <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                              Team: {item.team || 'Standard'} · Size: <span style={{ fontWeight: 800, color: '#111111' }}>{item.size || 'M'}</span> · Version: {item.version || 'Fan'}
                            </p>
                            <p style={{ fontSize: '12px', color: '#111111', fontWeight: 700, margin: '2px 0 0' }}>
                              Quantity: {item.quantity || 1} x ₹{item.price}
                            </p>
                          </div>

                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '15px', color: '#111111' }}>
                              ₹{(item.quantity || 1) * (item.price || 0)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddItemsFromModal([item])}
                              style={{
                                padding: '3px 8px',
                                background: '#FFFFFF',
                                border: '1px solid #10B981',
                                color: '#059669',
                                borderRadius: '3px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                              title="Directly add this single item to shopping list"
                            >
                              + Add to List
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
            <div style={{ borderTop: '1px solid #E5E7EB', padding: '14px 20px', background: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                {Array.isArray(selectedOrderModal.items) && selectedOrderModal.items.length > 1 ? (
                  <span>
                    <strong>{selectedModalItemIndices.length}</strong> of {selectedOrderModal.items.length} item(s) selected
                  </span>
                ) : (
                  <span>Ready to add to procurement list</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    let itemsToAdd = [];
                    if (Array.isArray(selectedOrderModal.items) && selectedOrderModal.items.length > 0) {
                      itemsToAdd = selectedOrderModal.items.filter((_, idx) => selectedModalItemIndices.includes(idx));
                    } else {
                      itemsToAdd = [{
                        name: selectedOrderModal.productName || selectedOrderModal.title || `Order #${selectedOrderModal.orderId || selectedOrderModal.id}`,
                        price: selectedOrderModal.total,
                        quantity: 1,
                        size: selectedOrderModal.size || 'M',
                        version: selectedOrderModal.version || 'Fan',
                        team: selectedOrderModal.team || 'Standard'
                      }];
                    }

                    if (itemsToAdd.length === 0) {
                      alert('Please select at least 1 product using the checkboxes to add to the shopping list.');
                      return;
                    }
                    handleAddItemsFromModal(itemsToAdd);
                  }}
                  style={{
                    background: '#10B981',
                    color: '#FFFFFF',
                    padding: '8px 18px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  🛒 Add to Shopping List {selectedModalItemIndices.length > 0 && Array.isArray(selectedOrderModal.items) && selectedOrderModal.items.length > 1 ? `(${selectedModalItemIndices.length})` : ''}
                </button>

                <button
                  onClick={() => setSelectedOrderModal(null)}
                  style={{ background: '#111111', color: '#FFFFFF', padding: '8px 20px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  Close Order Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
