/**
 * KYC Service (API Client)
 * Handles KYC profile submission, document uploads, and verification status.
 */
import { File } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { API_BASE_URL } from '@/config';
import { authenticatedFetch } from './authenticated-fetch';
import { getAccessToken } from '@/utils/storage';

// The backend validates the extension and the MIME type separately, so a PNG
// labelled image/jpeg is rejected. Derive the type from the name.
const MIME_BY_EXTENSION: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
};

/**
 * Turn an image URI into something Expo's FormData encoder accepts.
 *
 * SDK 54 replaced the global fetch, and its encoder handles only a string, a Blob
 * or an object exposing bytes(). React Native's classic { uri, name, type } part
 * throws "Unsupported FormDataPart implementation", so read the file here and pass
 * the bytes along with the name and type the backend checks.
 */
async function toFilePart(uri: string, fallbackName: string) {
    let source = uri;
    let name = new File(uri).name || fallbackName;
    let extension = extensionOf(name);

    // iPhone library photos can be HEIC, which the backend does not accept.
    // Re-encode anything that is not already a supported type.
    if (!MIME_BY_EXTENSION[extension]) {
        const converted = await manipulateAsync(uri, [], { format: SaveFormat.JPEG, compress: 0.9 });
        source = converted.uri;
        name = `${name.slice(0, name.length - extension.length) || 'photo'}.jpg`;
        extension = '.jpg';
    }

    const bytes = new Uint8Array(await new File(source).arrayBuffer());

    return {
        name,
        type: MIME_BY_EXTENSION[extension],
        bytes: async () => bytes,
    };
}

function extensionOf(name: string): string {
    const dot = name.lastIndexOf('.');
    return dot > 0 ? name.slice(dot).toLowerCase() : '';
}

// ─── Types ──────────────────────────────────────────────────

export interface KycProfileData {
    firstName: string;
    middleName?: string;
    lastName: string;
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

        const response = await authenticatedFetch(url, {
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
        const response = await authenticatedFetch(`${API_BASE_URL}/kyc/profile`, {
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
        const first = await postDocument(imageUri, documentType);
        if (first.status !== 409) return first.result;

        // A document of this type is left from an earlier attempt (the app was
        // closed mid-flow, or the user retook the photo). Replace it if the
        // backend still allows that, which it does unless it was approved.
        const replaced = await deletePendingDocument(documentType);
        if (!replaced) return first.result;

        return (await postDocument(imageUri, documentType)).result;
    } catch (error) {
        console.error('[KYC] Document upload error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

async function postDocument(imageUri: string, documentType: string) {
    const formData = new FormData();
    formData.append(
        'file',
        (await toFilePart(imageUri, `${documentType}_${Date.now()}.jpg`)) as any,
    );
    formData.append('type', documentType);

    // Content-Type is left to fetch so it can add the multipart boundary
    const response = await authenticatedFetch(`${API_BASE_URL}/kyc/documents`, {
        method: 'POST',
        headers: await authHeaders(),
        body: formData,
    });
    const body = await response.json();

    const result: { success: boolean; data?: DocumentUploadResponse['data']; error?: string } = response.ok
        ? { success: true, data: body.data }
        : { success: false, error: body.error?.message || 'Failed to upload document' };
    return { status: response.status, result };
}

async function deletePendingDocument(documentType: string): Promise<boolean> {
    const list = await authenticatedFetch(`${API_BASE_URL}/kyc/documents`, {
        method: 'GET',
        headers: await authHeaders(),
    });
    if (!list.ok) return false;
    const documents = ((await list.json()).data ?? []) as { id: string; type: string; status: string }[];
    const existing = documents.find((d) => d.type === documentType && d.status === 'PENDING');
    if (!existing) return false;

    const removed = await authenticatedFetch(`${API_BASE_URL}/kyc/documents/${encodeURIComponent(existing.id)}`, {
        method: 'DELETE',
        headers: await authHeaders(),
    });
    return removed.ok;
}

/**
 * Submit KYC for AI verification (after all documents are uploaded)
 */
export async function submitKyc(): Promise<{ success: boolean; data?: KycSubmitResponse['data']; error?: string }> {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/kyc/submit`, {
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

        formData.append(
            'file',
            (await toFilePart(selfieUri, `selfie_${Date.now()}.jpg`)) as any,
        );

        const response = await authenticatedFetch(`${API_BASE_URL}/kyc/verify/face`, {
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
        const response = await authenticatedFetch(`${API_BASE_URL}/kyc/status`, {
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
