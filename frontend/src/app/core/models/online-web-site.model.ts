export type WebSiteType = 'Store' | 'Viewer';

export interface OnlineWebSite {
  id?: number;
  name: string;
  url: string;
  logoUrl?: string;
  type: WebSiteType;
  country?: string;
  isActive?: boolean;
  createdAt?: Date;
}
