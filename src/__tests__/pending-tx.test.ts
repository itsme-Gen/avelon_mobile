import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearPendingTx, getPendingTx, savePendingTx } from '@/utils/pending-tx';

beforeEach(() => AsyncStorage.clear());

describe('pending transactions', () => {
  it('keeps a signed hash until it is recorded', async () => {
    await savePendingTx('collateral', 'loan1', { hash: '0xabc' });
    expect(await getPendingTx('collateral', 'loan1')).toMatchObject({ hash: '0xabc' });

    await clearPendingTx('collateral', 'loan1');
    expect(await getPendingTx('collateral', 'loan1')).toBeNull();
  });

  it('keeps collateral and repayment hashes apart', async () => {
    await savePendingTx('collateral', 'loan1', { hash: '0xc' });
    await savePendingTx('repayment', 'loan1', { hash: '0xr', amount: '0.05' });

    expect(await getPendingTx('collateral', 'loan1')).toMatchObject({ hash: '0xc' });
    expect(await getPendingTx('repayment', 'loan1')).toMatchObject({ hash: '0xr', amount: '0.05' });
  });

  it('ignores a corrupted entry', async () => {
    await AsyncStorage.setItem('avelon:pending-tx:collateral:loan1', '{broken');
    expect(await getPendingTx('collateral', 'loan1')).toBeNull();
  });
});
