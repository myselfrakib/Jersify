export const FIGMA_ASSETS = {
  hero1: "http://localhost:3845/assets/4a5bf1256465888e3f8ad578d93f2194a847b287.png",
  hero2: "http://localhost:3845/assets/08eaae9b8d6f047ba9b1bf816be8279c23ca5b79.png",
  hero3: "http://localhost:3845/assets/b4ca2f4a5332624caba58bcf3f92587c23c71169.png",
  wearYourIdentity: "http://localhost:3845/assets/aa1cf1709f82c4b2a1cf7ce45b739d3379b0e0e7.png",
  jersifyLogoHeader: "http://localhost:3845/assets/3d9c63e439c097fd35375eee418847add198ba5e.png",
  notBasic: "http://localhost:3845/assets/5c48669b89b932b67810151ad0e742bb4c5a4ec6.png",
  editorialPackaging: "http://localhost:3845/assets/c7321852f457d9b37da7803950e5e2379a736556.png",
  editorialQuality: "http://localhost:3845/assets/855ef2d489a779d01e498ba93cd96f51680e222c.png",
  goodOldKits1: "http://localhost:3845/assets/64269d952e03e2cfe6b2f34338cedcfd8c20be9c.png",
  goodOldKits2: "http://localhost:3845/assets/1b0f4742125549062a00a04d67497746c3a4fd77.png",
  lifestyleClubs: "http://localhost:3845/assets/5ba9af2b698fca31703a423d73a073f2012857c6.png",
  lifestyleNationals: "http://localhost:3845/assets/f44f755c468bd086a40ef40d4bb7c4c9d3301587.png"
};

export const CLUBS_DATA = [
  {
    id: "barcelona",
    name: "Barcelona",
    shortName: "BAR",
    teamQuery: "Barcelona",
    logoUrl: "http://localhost:3845/assets/39ab2a4dd213aa9206bf0e36859faf18175daef5.png",
    fallbackLogo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg"
  },
  {
    id: "real-madrid",
    name: "Real Madrid",
    shortName: "RMA",
    teamQuery: "Real Madrid",
    logoUrl: "http://localhost:3845/assets/a8647aad699c0b8286625d0bba860873cb936c32.png",
    fallbackLogo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg"
  },
  {
    id: "man-city",
    name: "Man City",
    shortName: "MCI",
    teamQuery: "Manchester City",
    logoUrl: "http://localhost:3845/assets/b41954dd7858b0ad1c0699454ff03bab1fdc4f3d.png",
    fallbackLogo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg"
  },
  {
    id: "liverpool",
    name: "Liverpool",
    shortName: "LIV",
    teamQuery: "Liverpool",
    logoUrl: "http://localhost:3845/assets/1447f142b4c6a11180a331925393d53396661562.png",
    fallbackLogo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg"
  },
  {
    id: "ac-milan",
    name: "AC Milan",
    shortName: "ACM",
    teamQuery: "AC Milan",
    logoUrl: "http://localhost:3845/assets/4272137932a53bd9f16f8d60ee1548cf5f975643.png",
    fallbackLogo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/AC_Milan_logo.svg"
  },
  {
    id: "bayern",
    name: "Bayern Munich",
    shortName: "BAY",
    teamQuery: "Bayern",
    logoUrl: "http://localhost:3845/assets/06e03a5ac717eff1a306d8fc3fda648e08d0fa89.png",
    fallbackLogo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg"
  },
  {
    id: "man-utd",
    name: "Man United",
    shortName: "MUN",
    teamQuery: "Manchester United",
    logoUrl: "http://localhost:3845/assets/2097926c577d6098c40d8d445adb1e14fcc3438b.png",
    fallbackLogo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
  },
  {
    id: "juventus",
    name: "Juventus",
    shortName: "JUV",
    teamQuery: "Juventus",
    logoUrl: "http://localhost:3845/assets/8c3cfca9dea1755f265b3b26136f1e1a41bbd36b.png",
    fallbackLogo: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg"
  }
];

export const HERO_BANNERS = [
  {
    id: 1,
    title: "WEAR THE GAME",
    tagline: "Football elevation for the modern fan",
    subtitle: "AUTHENTIC & FAN EDITION KITS 25/26",
    ctaText: "Shop New Arrivals",
    image: FIGMA_ASSETS.hero1
  },
  {
    id: 2,
    title: "WEAR YOUR IDENTITY.",
    tagline: "Crafted for those who live for the sport",
    subtitle: "LIMITED CONCEPT KITS & RETRO KITS",
    ctaText: "Explore Collection",
    image: FIGMA_ASSETS.hero2
  },
  {
    id: 3,
    title: "NOT BASIC.",
    tagline: "Unmatched quality with premium moisture-wicking fabric",
    subtitle: "CUSTOM NAME & NUMBER PRINTING",
    ctaText: "Customise Jersey",
    image: FIGMA_ASSETS.hero3
  }
];

export const CATEGORIES = [
  { id: "all", label: "All Jerseys" },
  { id: "club-kits", label: "Club Kits" },
  { id: "national-kits", label: "National Kits" },
  { id: "retro", label: "Retro Classics" },
  { id: "player-version", label: "Player Version" }
];
