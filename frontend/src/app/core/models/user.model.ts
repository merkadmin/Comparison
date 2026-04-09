export type UserPrivilege = 'Regular' | 'Premium' | 'Admin' | 'Root';

export interface UserDto {
  id: number;
  userName: string;
  email: string;
  login: string;
  privilege: UserPrivilege;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}
