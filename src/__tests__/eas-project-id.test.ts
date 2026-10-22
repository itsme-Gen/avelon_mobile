import { easProjectId } from '@/utils/eas-project-id';

const fromAppJson = { expoConfig: { extra: { eas: { projectId: '30f3b200-2ed7-4d3c-9fda-f54600564558' } } }, easConfig: null } as never;

describe('the EAS project used for push tokens', () => {
  it('comes from app.json when no override is set', () => {
    expect(easProjectId(undefined, fromAppJson)).toBe('30f3b200-2ed7-4d3c-9fda-f54600564558');
  });

  it('can be overridden from the environment', () => {
    expect(easProjectId('override-id', fromAppJson)).toBe('override-id');
  });

  it('falls back to the EAS build config, then to nothing', () => {
    expect(easProjectId('', { expoConfig: null, easConfig: { projectId: 'from-eas-build' } } as never)).toBe('from-eas-build');
    expect(easProjectId(undefined, { expoConfig: null, easConfig: null } as never)).toBeNull();
  });

  it("is set in this app's real config", () => {
    // The fallback is only useful if app.json actually carries the ID
    const appJson = require('../../app.json');
    expect(appJson.expo.extra.eas.projectId).toMatch(/^[0-9a-f-]{36}$/);
  });
});
