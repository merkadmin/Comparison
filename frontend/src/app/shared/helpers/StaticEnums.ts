export enum StoreType {
  Online = 'Online',
  Physical = 'Physical',
}

export enum SellingPriceType {
  Regular = 'Regular',
  Premium = 'Premium',
  Offer = 'Offer',
}

export enum UserRole {
  Regular = 0,
  Premium = 1,
  Admin = 2,
  Root = 3,
}

// ── Network Lookups ──────────────────────────────────────────────

export const NETWORK_TECHNOLOGIES = ['GSM', 'CDMA', 'HSPA', 'EVDO', 'LTE', '5G'] as const;
export type NetworkTechnology = typeof NETWORK_TECHNOLOGIES[number];

export const NETWORK_BANDS_2G = ['GSM 850', 'GSM 900', 'GSM 1800', 'GSM 1900', 'CDMA 800', 'CDMA 1900'] as const;
export type NetworkBand2G = typeof NETWORK_BANDS_2G[number];

export const NETWORK_BANDS_3G = ['HSDPA 800', 'HSDPA 850', 'HSDPA 900', 'HSDPA 1700', 'HSDPA 1900', 'HSDPA 2100', 'CDMA2000'] as const;
export type NetworkBand3G = typeof NETWORK_BANDS_3G[number];

export const NETWORK_BANDS_4G = [
  'B1', 'B2', 'B3', 'B4', 'B5', 'B7', 'B8', 'B12', 'B13', 'B14',
  'B17', 'B18', 'B19', 'B20', 'B25', 'B26', 'B28', 'B29', 'B30',
  'B32', 'B34', 'B38', 'B39', 'B40', 'B41', 'B42', 'B46', 'B48',
  'B66', 'B71',
] as const;
export type NetworkBand4G = typeof NETWORK_BANDS_4G[number];

export const NETWORK_BANDS_5G = [
  'N1', 'N2', 'N3', 'N5', 'N7', 'N8', 'N12', 'N20', 'N25', 'N26',
  'N28', 'N38', 'N40', 'N41', 'N48', 'N66', 'N71', 'N77', 'N78', 'N79',
  'N257', 'N258', 'N260', 'N261',
] as const;
export type NetworkBand5G = typeof NETWORK_BANDS_5G[number];

export const NETWORK_SPEEDS = [
  'HSPA', 'HSPA+', 'LTE', 'LTE Cat4', 'LTE Cat6', 'LTE Cat9',
  'LTE Cat11', 'LTE Cat12', 'LTE Cat16', 'LTE Cat18', 'LTE Cat19',
  'LTE Cat20', 'LTE Cat21', '5G',
] as const;
export type NetworkSpeed = typeof NETWORK_SPEEDS[number];