export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  cover?: string;
  isFirstLogin: boolean;
  role: string;
}

export interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isOwnProfile: boolean;
  error: string | null;
}

export interface ProfileInfoProps {
  profile: UserProfile | null;
  isOwnProfile: boolean;
  isLoading: boolean;
}

export interface ProfileHeaderProps {
  profile: UserProfile | null;
  username: string;
  isLoading: boolean;
  isOwnProfile: boolean;
}

export interface ProfileActionsProps {
  isOwnProfile: boolean;
  isLoading: boolean;
  isError: boolean;
}