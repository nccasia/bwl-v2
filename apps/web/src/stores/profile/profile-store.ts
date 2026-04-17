import { create } from "zustand";
import { UserProfile, ProfileState } from "@/types/profile/profile";

interface ProfileStore extends ProfileState {
    setProfile: (profile: UserProfile | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setIsOwnProfile: (isOwnProfile: boolean) => void;
    reset: () => void;
}

const initialState: ProfileState = {
    profile: null,
    isLoading: true,
    isOwnProfile: false,
    error: null,
};

export const useProfileStore = create<ProfileStore>((set) => ({
    ...initialState,
    setProfile: (profile) => set({ profile }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setIsOwnProfile: (isOwnProfile) => set({ isOwnProfile }),
    reset: () => set(initialState),
}));