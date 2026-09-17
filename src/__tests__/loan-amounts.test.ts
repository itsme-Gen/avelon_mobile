import { amountOwed, formatEth } from '@/utils/loan-amounts';

describe('amountOwed', () => {
  it('uses the exact total the backend sends', () => {
    expect(amountOwed({ totalOwed: '0.050328767123287671', principalOwed: '9', interestOwed: '9', feesOwed: '9' }))
      .toBe('0.050328767123287671');
  });

  it('adds the parts to the wei when no total is sent', () => {
    // Floats lose the last digits here, which is what left loans open
    expect(amountOwed({ principalOwed: '0.05', interestOwed: '0.000328767123287671', feesOwed: '0' }))
      .toBe('0.050328767123287671');
  });

  it('includes extension fees', () => {
    expect(amountOwed({ principalOwed: '0.2', interestOwed: '0.000986301369863013', feesOwed: '0.002' }))
      .toBe('0.202986301369863013');
  });

  it('reports nothing owed as "0"', () => {
    expect(amountOwed({ principalOwed: '0', interestOwed: '0', feesOwed: '0' })).toBe('0');
  });

  it('treats missing parts as zero', () => {
    expect(amountOwed({ principalOwed: '0.01' })).toBe('0.01');
  });
});

describe('formatEth', () => {
  it('rounds for display only', () => {
    expect(formatEth('0.050328767123287671')).toBe('0.050329 ETH');
  });

  it('shows a tiny remainder instead of zero', () => {
    expect(formatEth('0.000000007123287671')).toBe('<0.000001 ETH');
  });
});
