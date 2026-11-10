import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MISSION_LEVELS } from '../../pages/MissionDeck';

describe('Mission Deck evidence game', () => {
  it('has three sequential challenges with one evidence-supported answer each', () => {
    expect(MISSION_LEVELS).toHaveLength(3);
    for (const level of MISSION_LEVELS) {
      expect(level.choices.filter((choice) => choice.correct)).toHaveLength(1);
      expect(level.choices.length).toBeGreaterThanOrEqual(3);
      expect(level.sourceTo).toMatch(/^\/models\//);
      expect(level.debrief.trim().length).toBeGreaterThan(30);
      expect(level.choices.every((choice) => choice.feedback.trim().length > 30)).toBe(true);
    }
  });

  it('bundles the CC0 guide mesh and the named animations the game uses', () => {
    const modelPath = resolve(process.cwd(), 'public/models/mission-guide-robocat.glb');
    const bytes = readFileSync(modelPath);
    expect(bytes.subarray(0, 4).toString('ascii')).toBe('glTF');
    expect(bytes.readUInt32LE(4)).toBe(2);
    expect(bytes.readUInt32LE(8)).toBe(bytes.length);
    const jsonSize = bytes.readUInt32LE(12);
    expect(bytes.subarray(16, 20).toString('ascii')).toBe('JSON');
    const gltf = JSON.parse(bytes.subarray(20, 20 + jsonSize).toString('utf8')) as {
      animations?: Array<{ name: string; channels: unknown[] }>;
      skins?: unknown[];
      meshes?: unknown[];
    };
    const clips = new Set(gltf.animations?.map((animation) => animation.name));
    expect(gltf.meshes?.length).toBeGreaterThan(0);
    expect(gltf.skins?.length).toBeGreaterThan(0);
    expect(clips.has('Idle')).toBe(true);
    expect(clips.has('Walk')).toBe(true);
    expect(clips.has('Special')).toBe(true);

    const register = JSON.parse(readFileSync(resolve(process.cwd(), 'public/models/attribution.json'), 'utf8')) as {
      assets: Array<{ file: string; licenseNote: string }>;
    };
    const asset = register.assets.find((entry) => entry.file === '/models/mission-guide-robocat.glb');
    expect(asset?.licenseNote).toContain('CC0 1.0');
  });
});
