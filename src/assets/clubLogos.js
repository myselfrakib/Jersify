// Optimized local club crest assets for instant zero-latency loading

export const CLUB_LOGOS = {
  barcelona: '/clubs/barcelona.svg',
  realmadrid: '/clubs/realmadrid.svg',
  milan: '/clubs/milan.svg',
  bayern: '/clubs/bayern.svg',
  manunited: '/clubs/manunited.svg',
  mancity: '/clubs/mancity.svg',
  liverpool: '/clubs/liverpool.svg',
  juventus: '/clubs/juventus.svg'
};

/**
 * Resolves any club identifier or legacy Wikimedia URL to an instant local SVG asset.
 * If the input is already a custom uploaded URL (e.g. Firebase storage), it is preserved.
 */
export function getOptimizedClubLogo(logoUrlOrName) {
  if (!logoUrlOrName || typeof logoUrlOrName !== 'string') {
    return '/clubs/barcelona.svg';
  }

  const s = logoUrlOrName.toLowerCase();

  // If it's a slow remote Wikimedia SVG or standard club name, map to fast local asset
  if (s.includes('barca') || s.includes('barcelona')) {
    return CLUB_LOGOS.barcelona;
  }
  if (s.includes('real_madrid') || s.includes('real madrid') || s.includes('realmadrid')) {
    return CLUB_LOGOS.realmadrid;
  }
  if (s.includes('milan')) {
    return CLUB_LOGOS.milan;
  }
  if (s.includes('bayern')) {
    return CLUB_LOGOS.bayern;
  }
  if (s.includes('manchester_united') || s.includes('manchester united') || s.includes('man united') || s.includes('manutd')) {
    return CLUB_LOGOS.manunited;
  }
  if (s.includes('manchester_city') || s.includes('manchester city') || s.includes('man city') || s.includes('mancity')) {
    return CLUB_LOGOS.mancity;
  }
  if (s.includes('liverpool')) {
    return CLUB_LOGOS.liverpool;
  }
  if (s.includes('juventus')) {
    return CLUB_LOGOS.juventus;
  }

  return logoUrlOrName;
}
