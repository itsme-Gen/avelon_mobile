import { create } from "zustand";

type VerificationState = {
  isVerified: boolean;
  markVerified: () => void;
  resetVerification: () => void;
};

export const useVerificationStore = create<VerificationState>((set) => ({
  isVerified: false,
  markVerified: () => set({ isVerified: true }),
  resetVerification: () => set({ isVerified: false }),
}));
