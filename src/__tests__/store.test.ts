import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStore } from '../store';
import LZString from 'lz-string';

describe('useStore loadFromUrlHash', () => {
  beforeEach(() => {
    // Clear hash before each test
    window.location.hash = '';
    // Reset store to default state if possible
    // useStore.getState().setNodes([]);
    // useStore.getState().setEdges([]);
  });

  it('handles invalid compressed string gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // A string that is not valid Base64/URI encoded for LZString might return null or empty
    window.location.hash = '#!!!invalid!!!';

    useStore.getState().loadFromUrlHash();

    // Should not throw, and should not update nodes/edges from default
    expect(useStore.getState().nodes).toBeDefined();
    // It shouldn't necessarily call console.error if LZString just returns null
    consoleSpy.mockRestore();
  });

  it('handles invalid JSON string gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const invalidJson = '{"nodes": [], "edges": }'; // Malformed JSON
    const compressed = LZString.compressToEncodedURIComponent(invalidJson);
    window.location.hash = `#${compressed}`;

    useStore.getState().loadFromUrlHash();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to parse URL hash', expect.any(SyntaxError));
    consoleSpy.mockRestore();
  });

  it('handles valid hash but missing required fields', () => {
    const invalidData = JSON.stringify({ nodes: [] }); // missing edges
    const compressed = LZString.compressToEncodedURIComponent(invalidData);
    window.location.hash = `#${compressed}`;

    const initialNodes = useStore.getState().nodes;
    useStore.getState().loadFromUrlHash();

    // Should not update the state
    expect(useStore.getState().nodes).toEqual(initialNodes);
  });

  it('handles valid hash and updates state', () => {
    const validData = {
      nodes: [{ id: 'test-node', position: { x: 0, y: 0 }, data: { label: 'Test', teamType: 'stream-aligned' } }],
      edges: []
    };
    const json = JSON.stringify(validData);
    const compressed = LZString.compressToEncodedURIComponent(json);
    window.location.hash = `#${compressed}`;

    useStore.getState().loadFromUrlHash();

    expect(useStore.getState().nodes).toHaveLength(1);
    expect(useStore.getState().nodes[0].id).toBe('test-node');
  });

  it('returns early if no hash is present', () => {
    window.location.hash = '';
    const initialNodes = useStore.getState().nodes;

    useStore.getState().loadFromUrlHash();

    expect(useStore.getState().nodes).toEqual(initialNodes);
  });
});
