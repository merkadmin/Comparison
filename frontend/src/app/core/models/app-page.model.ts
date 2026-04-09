export interface AppPage {
  id: number;
  name: string;
  route: string;
  icon?: string;
  orderIndex: number;
  isActive: boolean;
  createdAt?: string;
}
