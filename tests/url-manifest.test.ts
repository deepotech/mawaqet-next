import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Legacy URL Migration Manifest Integrity', () => {
  const manifestPath = path.join(__dirname, '../data/migration/legacy-urls.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  it('contains all 372 published legacy URLs', () => {
    expect(manifest.length).toBe(372);
  });

  it('contains zero duplicate source paths', () => {
    const sourcePaths = new Set();
    manifest.forEach((r: any) => {
      expect(sourcePaths.has(r.originalPath)).toBe(false);
      sourcePaths.add(r.originalPath);
    });
  });

  it('ensures all active destinations are unique', () => {
    const destPaths = new Set();
    const active = manifest.filter((r: any) => r.migrationAction === 'preserve_exact');
    active.forEach((r: any) => {
      expect(destPaths.has(r.proposedDestination)).toBe(false);
      destPaths.add(r.proposedDestination);
    });
  });

  it('ensures zero redirect loops', () => {
    manifest.forEach((r: any) => {
      if (r.migrationAction.includes('redirect')) {
        expect(r.originalPath).not.toBe(r.proposedDestination);
      }
    });
  });

  it('ensures zero redirect chains', () => {
    const redirectSources = new Set(
      manifest.filter((r: any) => r.migrationAction.includes('redirect')).map((r: any) => r.originalPath)
    );
    manifest.forEach((r: any) => {
      if (r.migrationAction.includes('redirect')) {
        expect(redirectSources.has(r.proposedDestination)).toBe(false);
      }
    });
  });

  it('guarantees 100% preservation of top 20 high-value organic landing pages', () => {
    const top20 = manifest.slice(0, 20);
    top20.forEach((item: any) => {
      expect(item.migrationAction).toBe('preserve_exact');
      expect(item.proposedDestination).toBe(item.originalPath);
      expect(item.gsc.clicks).toBeGreaterThanOrEqual(100);
    });
  });

  it('protects top city pages like Baghdad, Casablanca, Erbil, Najaf', () => {
    const baghdad = manifest.find((r: any) => r.originalPath === '/city/prayer-times-in-baghdad/');
    expect(baghdad).toBeDefined();
    expect(baghdad.gsc.clicks).toBe(1285);
    expect(baghdad.migrationAction).toBe('preserve_exact');

    const casablanca = manifest.find((r: any) => r.originalPath === '/city/prayer-times-in-casablanca/');
    expect(casablanca).toBeDefined();
    expect(casablanca.gsc.clicks).toBe(649);
    expect(casablanca.migrationAction).toBe('preserve_exact');
  });
});
