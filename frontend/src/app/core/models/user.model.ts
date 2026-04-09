export type UserPrivilege = 'Regular' | 'Premium' | 'Admin' | 'Root';

export interface UserDto {
  id: number;
  userName: string;
  email: string;
  login: string;
  privilege: UserPrivilege;
  isActive: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface CreateUserRequest {
  userName: string;
  email: string;
  password: string;
  privilege: UserPrivilege;
  login?: string;
}
