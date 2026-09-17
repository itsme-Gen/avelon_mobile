jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((uri: string) => ({
    name: uri.split('/').pop(),
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(4)),
  })),
}));
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({ uri: 'file:///cache/converted.jpg' }),
  SaveFormat: { JPEG: 'jpeg' },
}));
jest.mock('@/services/authenticated-fetch', () => ({ authenticatedFetch: jest.fn() }));
jest.mock('@/utils/storage', () => ({ getAccessToken: jest.fn().mockResolvedValue('token') }));

import { manipulateAsync } from 'expo-image-manipulator';
import { authenticatedFetch } from '@/services/authenticated-fetch';
import { uploadDocument } from '@/services/kyc.service';

const fetchMock = authenticatedFetch as jest.Mock;

function reply(status: number, body: unknown) {
  return { ok: status < 300, status, json: jest.fn().mockResolvedValue(body) };
}

beforeEach(() => jest.clearAllMocks());

describe('uploading a KYC document', () => {
  it('converts an iPhone HEIC photo to JPEG first', async () => {
    fetchMock.mockResolvedValueOnce(reply(201, { data: { id: 'd1' } }));
    const append = jest.spyOn(FormData.prototype, 'append');

    await uploadDocument('file:///photos/IMG_0001.HEIC', 'GOVERNMENT_ID');

    expect(manipulateAsync).toHaveBeenCalledWith('file:///photos/IMG_0001.HEIC', [], expect.objectContaining({ format: 'jpeg' }));
    const part = append.mock.calls.find(([key]) => key === 'file')![1] as unknown as { name: string; type: string };
    expect(part.name).toBe('IMG_0001.jpg');
    expect(part.type).toBe('image/jpeg');
    append.mockRestore();
  });

  it('replaces a document of the same type left from an earlier attempt', async () => {
    fetchMock
      .mockResolvedValueOnce(reply(409, { error: { code: 'ALREADY_EXISTS', message: 'You already have a pending GOVERNMENT_ID document.' } }))
      .mockResolvedValueOnce(reply(200, { data: [{ id: 'old', type: 'GOVERNMENT_ID', status: 'PENDING' }] }))
      .mockResolvedValueOnce(reply(200, { success: true }))
      .mockResolvedValueOnce(reply(201, { data: { id: 'new' } }));

    const result = await uploadDocument('file:///photos/id.jpg', 'GOVERNMENT_ID');

    expect(result).toEqual({ success: true, data: { id: 'new' } });
    expect(fetchMock.mock.calls[2][0]).toMatch(/\/kyc\/documents\/old$/);
    expect(fetchMock.mock.calls[2][1].method).toBe('DELETE');
  });

  it('does not delete an approved document', async () => {
    fetchMock
      .mockResolvedValueOnce(reply(409, { error: { code: 'ALREADY_EXISTS', message: 'You already have a approved GOVERNMENT_ID document.' } }))
      .mockResolvedValueOnce(reply(200, { data: [{ id: 'old', type: 'GOVERNMENT_ID', status: 'APPROVED' }] }));

    const result = await uploadDocument('file:///photos/id.jpg', 'GOVERNMENT_ID');

    expect(result.success).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
