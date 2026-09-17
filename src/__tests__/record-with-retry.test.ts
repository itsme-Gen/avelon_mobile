import { recordWithRetry } from '@/utils/record-with-retry';

const notYet = { success: false, error: 'Transaction is not successful or lacks 1 confirmation(s)' };

describe('recordWithRetry', () => {
  it('retries while the transaction is still confirming', async () => {
    const submit = jest.fn()
      .mockResolvedValueOnce(notYet)
      .mockResolvedValueOnce({ success: false, error: 'This repayment is still being processed. Check again in a minute.' })
      .mockResolvedValueOnce({ success: true });

    const result = await recordWithRetry(submit, { attempts: 5, delayMs: 0 });

    expect(result.success).toBe(true);
    expect(submit).toHaveBeenCalledTimes(3);
  });

  it('retries a network failure', async () => {
    const submit = jest.fn()
      .mockResolvedValueOnce({ success: false, error: 'Network error. Please try again.' })
      .mockResolvedValueOnce({ success: true });
    expect((await recordWithRetry(submit, { attempts: 3, delayMs: 0 })).success).toBe(true);
  });

  it('stops at once on a real refusal', async () => {
    const submit = jest.fn().mockResolvedValue({ success: false, error: 'Transaction sender is not the verified borrower wallet' });

    const result = await recordWithRetry(submit, { attempts: 5, delayMs: 0 });

    expect(result.success).toBe(false);
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('gives up after the last attempt', async () => {
    const submit = jest.fn().mockResolvedValue(notYet);
    const result = await recordWithRetry(submit, { attempts: 3, delayMs: 0 });
    expect(result.success).toBe(false);
    expect(submit).toHaveBeenCalledTimes(3);
  });
});
