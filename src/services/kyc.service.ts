/**
 * KYC Service (API Client)
 * Handles KYC profile submission, document uploads, and verification status.
 */
import { API_BASE_URL } from '@/config';
import { getAccessToken } from '@/utils/storage';

// ─── Types ──────────────────────────────────────────────────

export interface KycProfileData {
    dateOfBirth: string;
    gender: string;
    civilStatus: string;
    educationLevel: string;
    country: string;
    region?: string;
    province?: string;
    cityTown?: string;
    barangay?: string;
    contactNumber: string;
    secondaryEmail?: string;
    idType?: string;
}

export interface KycStatusResponse {
    success: boolean;
    data: {
        level: string;
        status: string;
        submittedAt: string | null;
        approvedAt: string | null;
        rejectionReason: string | null;
        creditScore: number | null;
        creditTier: string | null;
        documents: Record<string, any>;
        allDocuments: any[];
    };
}

export interface DocumentUploadResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        type: string;
        status: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        createdAt: string;
    };
}

export interface KycSubmitResponse {
    success: boolean;
    message: string;
    data: {
        status: string;
        submittedAt: string;
        documentCount: number;
    };
}

// ─── Helpers ────────────────────────────────────────────────

async function authHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    return {
        'Authorization': `Bearer ${token}`,
    };
}

async function authJsonHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

// ─── API Calls ──────────────────────────────────────────────

/**
 * Submit KYC profile info (basic + contact information)
 */
export async function submitKycProfile(data: KycProfileData): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const headers = await authJsonHeaders();
        const url = `${API_BASE_URL}/kyc/profile`;

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to save profile info' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[KYC] Profile submission error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Get saved KYC profile info
 */
export async function getKycProfile(): Promise<{ success: boolean; data?: KycProfileData; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/kyc/profile`, {
            method: 'GET',
            headers: await authJsonHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to get profile info' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[KYC] Get profile error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Upload a KYC document (image file)
 */
export async function uploadDocument(
    imageUri: string,
    documentType: 'GOVERNMENT_ID' | 'GOVERNMENT_ID_BACK' | 'E_SIGNATURE' | 'PROOF_OF_INCOME' | 'PROOF_OF_ADDRESS',
): Promise<{ success: boolean; data?: DocumentUploadResponse['data']; error?: string }> {
    try {
        const headers = await authHeaders();

        // Build multipart form data
        const formData = new FormData();

        // Extract filename from URI
        const fileName = imageUri.split('/').pop() || `${documentType}_${Date.now()}.jpg`;

        formData.append('file', {
            uri: imageUri,
            name: fileName,
            type: 'image/jpeg',
        } as any);
        formData.append('type', documentType);

        const response = await fetch(`${API_BASE_URL}/kyc/documents`, {
            method: 'POST',
            headers: {
                ...headers,
                // Don't set Content-Type — fetch will set it with the boundary for multipart
            },
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to upload document' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[KYC] Document upload error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Submit KYC for AI verification (after all documents are uploaded)
 */
export async function submitKyc(): Promise<{ success: boolean; data?: KycSubmitResponse['data']; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/kyc/submit`, {
            method: 'POST',
            headers: await authJsonHeaders(),
            body: JSON.stringify({}),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to submit KYC' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[KYC] Submit error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

// ─── Face Verification ──────────────────────────────────────

export interface FaceVerifyResult {
    passed: boolean;
    score: number;
    confidence: number;
    message: string | null;
}

/**
 * Upload a selfie and run face matching against the user's government ID.
 * The backend looks up the existing GOVERNMENT_ID document and calls the LLM service.
 */
export async function verifyFace(
    selfieUri: string,
): Promise<{ success: boolean; data?: FaceVerifyResult; error?: string }> {
    try {
        const headers = await authHeaders();
        const formData = new FormData();

        const fileName = selfieUri.split('/').pop() || `selfie_${Date.now()}.jpg`;
        formData.append('file', {
            uri: selfieUri,
            name: fileName,
            type: 'image/jpeg',
        } as any);

        const response = await fetch(`${API_BASE_URL}/kyc/verify/face`, {
            method: 'POST',
            headers,
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Face verification failed' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[KYC] Face verify error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Get current KYC status
 */
export async function getKycStatus(): Promise<{ success: boolean; data?: KycStatusResponse['data']; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/kyc/status`, {
            method: 'GET',
            headers: await authJsonHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to get KYC status' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[KYC] Status error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}
