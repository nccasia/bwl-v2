export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  avatar?: string;
  isFirstLogin: boolean;
  role: string;
}

export interface MezonProfile {
  id: string;
  userName: string;
  displayName?: string;
  email: string;
  avatar?: string;
  isFirstLogin: boolean;
  role: string;
}