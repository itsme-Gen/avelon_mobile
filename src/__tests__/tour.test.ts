import AsyncStorage from '@react-native-async-storage/async-storage';
import { holePath, padRect, placeTooltip } from '@/components/tour/geometry';
import { introSteps, verifiedSteps } from '@/components/tour/steps';
import { loadTourState, saveTourState } from '@/components/tour/storage';

const phone = { width: 390, height: 844 };
const small = { width: 320, height: 568 };
const insets = { top: 47, bottom: 34 };
const card = { width: 320, height: 160 };

describe('spotlight geometry', () => {
  it('pads the measured element and keeps it on screen', () => {
    expect(padRect({ x: 20, y: 100, width: 350, height: 80 }, phone)).toEqual({ x: 12, y: 92, width: 366, height: 96 });
    expect(padRect({ x: 0, y: 0, width: 390, height: 40 }, phone)).toEqual({ x: 4, y: 4, width: 382, height: 44 });
  });

  it('cuts a rounded hole out of a full-screen rectangle', () => {
    const d = holePath(390, 844, 12, 92, 366, 96, 16);
    expect(d.startsWith('M0 0H390V844H0Z')).toBe(true);
    expect(d).toContain('M28 92H362A16 16 0 0 1 378 108');
    expect(d.match(/A/g)).toHaveLength(4);
  });

  it('dims the whole screen when there is no hole yet', () => {
    expect(holePath(390, 844, 195, 422, 0, 0, 16)).toBe('M0 0H390V844H0Z');
  });

  it('never rounds corners past half the hole', () => {
    expect(holePath(390, 844, 0, 0, 20, 10, 16)).toContain('A5 5');
  });
});

describe('tooltip placement', () => {
  it('goes below a target near the top', () => {
    const p = placeTooltip({ x: 12, y: 92, width: 366, height: 96 }, card, phone, insets);
    expect(p.placement).toBe('below');
    expect(p.top).toBe(92 + 96 + 12);
    expect(p.left).toBe(35);
  });

  it('goes above a target near the bottom, clear of the home indicator', () => {
    const p = placeTooltip({ x: 300, y: 760, width: 60, height: 60 }, card, phone, insets);
    expect(p.placement).toBe('above');
    expect(p.top).toBe(760 - 12 - 160);
    // follows the tab icon but stays inside the right edge
    expect(p.left).toBe(390 - 16 - 320);
  });

  it('fits a small phone by narrowing the card to the screen', () => {
    const p = placeTooltip({ x: 260, y: 40, width: 48, height: 40 }, card, small, { top: 20, bottom: 0 });
    expect(p.left).toBe(16);
    expect(p.placement).toBe('below');
  });

  it('centres the card when nothing was found to point at', () => {
    expect(placeTooltip(null, card, phone, insets)).toEqual({ left: 35, top: (844 - 160) / 2, placement: 'center' });
  });
});

describe('tour steps', () => {
  it('walks a verified borrower through the six areas plus applying', () => {
    expect(introSteps(true).map((s) => s.id)).toEqual(['home', 'apply', 'plans', 'wallet', 'records', 'bell', 'profile']);
  });

  it('shows an unverified borrower where to verify instead of where to apply', () => {
    const ids = introSteps(false).map((s) => s.id);
    expect(ids).toContain('verify');
    expect(ids).not.toContain('apply');
    expect(ids).toHaveLength(7);
  });

  it('revisits only what changes after verification', () => {
    expect(verifiedSteps().map((s) => s.id)).toEqual(['apply', 'plans', 'wallet']);
  });

  it('keeps every step short and gives tab steps a fallback target', () => {
    for (const step of introSteps(true)) {
      expect(step.title.length).toBeLessThanOrEqual(24);
      expect(step.body.split('. ').length).toBeLessThanOrEqual(2);
      expect(step.body.length).toBeLessThanOrEqual(80);
      if (['plans', 'wallet', 'records', 'profile'].includes(step.id)) expect(step.fallbackTarget).toMatch(/^tab-/);
    }
  });
});

describe('tour storage', () => {
  beforeEach(() => AsyncStorage.clear());

  it('starts fresh for a user it has never seen', async () => {
    expect(await loadTourState('u1')).toEqual({ introDone: false, sawVerified: false });
  });

  it('remembers completion per user', async () => {
    await saveTourState('u1', { introDone: true, sawVerified: false });
    expect(await loadTourState('u1')).toEqual({ introDone: true, sawVerified: false });
    expect(await loadTourState('u2')).toEqual({ introDone: false, sawVerified: false });
  });

  it('treats unreadable storage as a fresh install', async () => {
    await AsyncStorage.setItem('avelon:tour:v1:u3', '{not json');
    expect(await loadTourState('u3')).toEqual({ introDone: false, sawVerified: false });
  });
});

describe('tour storage on slow native writes', () => {
  it('reports the tour as done straight away, before the write lands', async () => {
    const setItem = AsyncStorage.setItem as jest.Mock;
    let release: () => void = () => {};
    setItem.mockImplementationOnce(() => new Promise<void>((r) => { release = r; }));
    const saving = saveTourState('slow-user', { introDone: true, sawVerified: false });
    expect(await loadTourState('slow-user')).toEqual({ introDone: true, sawVerified: false });
    release();
    await saving;
  });
});
