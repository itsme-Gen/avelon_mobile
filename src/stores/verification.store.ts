import { create } from "zustand";
import * as kycService from "@/services/kyc.service";

// ─── Types ──────────────────────────────────────────────────

export interface BasicInfoData {
  dateOfBirth: string;
  gender: string;
  civilStatus: string;
  educationLevel: string;
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  province: string;
  provinceCode: string;
  cityTown: string;
  cityCode: string;
  barangay: string;
  barangayCode: string;
}

export interface ContactInfoData {
  contactNumber: string;
  secondaryEmail: string;
}

export interface IdDocumentsData {
  idType: string;
  frontUri: string | null;
  backUri: string | null;
  signatureUri: string | null;
  proofOfIncomeUri: string | null;
  proofOfAddressUri: string | null;
  selfieUri: string | null;
}

type VerificationState = {
  isVerified: boolean;
  kycStatus: string | null; // 'VERIFIED' | 'PENDING_KYC' | 'APPROVED' | 'REJECTED' etc.

  // Form data persisted across verification screens
  basicInfo: BasicInfoData;
  contactInfo: ContactInfoData;
  idDocuments: IdDocumentsData;

  // Actions
  markVerified: () => void;
  resetVerification: () => void;
  setKycStatus: (status: string) => void;
  checkKycStatus: () => Promise<void>;
  setBasicInfo: (data: BasicInfoData) => void;
  setContactInfo: (data: ContactInfoData) => void;
  setIdDocuments: (data: Partial<IdDocumentsData>) => void;
  resetFormData: () => void;
};

const initialBasicInfo: BasicInfoData = {
  dateOfBirth: "",
  gender: "",
  civilStatus: "",
  educationLevel: "",
  country: "",
  countryCode: "",
  region: "",
  regionCode: "",
  province: "",
  provinceCode: "",
  cityTown: "",
  cityCode: "",
  barangay: "",
  barangayCode: "",
};

const initialContactInfo: ContactInfoData = {
  contactNumber: "",
  secondaryEmail: "",
};

const initialIdDocuments: IdDocumentsData = {
  idType: '',
  frontUri: null,
  backUri: null,
  signatureUri: null,
  proofOfIncomeUri: null,
  proofOfAddressUri: null,
  selfieUri: null,
};

export const useVerificationStore = create<VerificationState>((set) => ({
  isVerified: false,
  kycStatus: null,

  basicInfo: { ...initialBasicInfo },
  contactInfo: { ...initialContactInfo },
  idDocuments: { ...initialIdDocuments },

  markVerified: () => set({ isVerified: true, kycStatus: "APPROVED" }),
  resetVerification: () => set({ isVerified: false, kycStatus: null }),
  setKycStatus: (status) =>
    set({
      kycStatus: status,
      isVerified: status === "APPROVED" || status === "CONNECTED",
    }),
  checkKycStatus: async () => {
    try {
      const result = await kycService.getKycStatus();
      if (result.success && result.data) {
        const status = result.data.status;
        set({
          kycStatus: status,
          isVerified: status === "APPROVED" || status === "CONNECTED",
        });
      }
    } catch {
      // Keep current state on error
    }
  },
  setBasicInfo: (data) => set({ basicInfo: data }),
  setContactInfo: (data) => set({ contactInfo: data }),
  setIdDocuments: (data) =>
    set((state) => ({
      idDocuments: { ...state.idDocuments, ...data },
    })),
  resetFormData: () =>
    set({
      basicInfo: { ...initialBasicInfo },
      contactInfo: { ...initialContactInfo },
      idDocuments: { ...initialIdDocuments },
    }),
}));
