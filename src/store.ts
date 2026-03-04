import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from '@xyflow/react';
import LZString from 'lz-string';

export type TeamType =
  | 'stream-aligned'
  | 'enabling'
  | 'complicated-subsystem'
  | 'platform'
  | 'undefined';

export type InteractionMode =
  | 'collaboration'
  | 'x-as-a-service'
  | 'facilitating'
  | 'undefined';

export type TeamNodeData = {
  label: string;
  teamType: TeamType;
  locked?: boolean;
};

export type GroupNodeData = {
  label: string;
  locked?: boolean;
};

export type AppNode = Node<TeamNodeData, 'team'> | Node<GroupNodeData, 'group'>;

export type InteractionEdgeData = {
  interactionMode: InteractionMode;
};

export type AppEdge = Edge<InteractionEdgeData, 'interaction'>;

type AppState = {
  nodes: AppNode[];
  edges: AppEdge[];
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange<AppEdge>;
  onConnect: OnConnect;
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: AppEdge[]) => void;
  addNode: (node: AppNode) => void;
  updateNodeData: (id: string, data: Partial<TeamNodeData | GroupNodeData>) => void;
  toggleNodeLock: (id: string) => void;
  updateEdgeData: (id: string, data: Partial<InteractionEdgeData>) => void;
  exportToUrlHash: () => void;
  loadFromUrlHash: () => void;
};

const defaultNodes: AppNode[] = [
  {
    id: '1',
    type: 'team',
    position: { x: 100, y: 100 },
    data: { label: 'Stream Team A', teamType: 'stream-aligned' },
  },
  {
    id: '2',
    type: 'team',
    position: { x: 400, y: 100 },
    data: { label: 'Platform Team', teamType: 'platform' },
  },
];

const defaultEdges: AppEdge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'interaction',
    data: { interactionMode: 'x-as-a-service' },
  },
];

export const useStore = create<AppState>((set, get) => ({
  nodes: defaultNodes,
  edges: defaultEdges,
  onNodesChange: (changes: NodeChange<AppNode>[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange<AppEdge>[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({ ...connection, type: 'interaction', data: { interactionMode: 'collaboration' } }, get().edges) as AppEdge[],
    });
  },
  setNodes: (nodes: AppNode[]) => {
    set({ nodes });
  },
  setEdges: (edges: AppEdge[]) => {
    set({ edges });
  },
  addNode: (node: AppNode) => {
    set({ nodes: [...get().nodes, node] });
  },
  updateNodeData: (id: string, data: Partial<TeamNodeData | GroupNodeData>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, ...data } as any,
          };
        }
        return node;
      }),
    });
  },
  toggleNodeLock: (id: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          const locked = !node.data.locked;
          return {
            ...node,
            data: { ...node.data, locked } as TeamNodeData | GroupNodeData,
            draggable: !locked,
          } as AppNode;
        }
        return node;
      }),
    });
  },
  updateEdgeData: (id: string, data: Partial<InteractionEdgeData>) => {
    set({
      edges: get().edges.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            data: { ...edge.data, ...data } as any,
          };
        }
        return edge;
      }),
    });
  },
  exportToUrlHash: () => {
    const { nodes, edges } = get();
    const json = JSON.stringify({ nodes, edges });
    const compressed = LZString.compressToEncodedURIComponent(json);
    window.location.hash = compressed;
  },
  loadFromUrlHash: () => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(hash);
      if (decompressed) {
        const parsed = JSON.parse(decompressed);
        if (parsed.nodes && parsed.edges) {
          set({ nodes: parsed.nodes, edges: parsed.edges });
        }
      }
    } catch (e) {
      console.error('Failed to parse URL hash', e);
    }
  },
}));
