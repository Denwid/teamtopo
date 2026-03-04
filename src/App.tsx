import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import type {


  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useStore } from './store';
import type { AppNode, TeamType } from './store';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import TeamNode from './components/TeamNode';
import GroupNode from './components/GroupNode';
import InteractionEdge from './components/InteractionEdge';

const nodeTypes: NodeTypes = {
  team: TeamNode,
  group: GroupNode,
};

const edgeTypes: EdgeTypes = {
  interaction: InteractionEdge
};

let id = 0;
const getId = () => `dndnode_${id++}`;

function AppFlow() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    loadFromUrlHash,
  } = useStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    loadFromUrlHash();
    // Re-check hash on popstate (back/forward)
    window.addEventListener('hashchange', loadFromUrlHash);
    return () => window.removeEventListener('hashchange', loadFromUrlHash);
  }, [loadFromUrlHash]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: AppNode) => {
      // Find if we dropped the node on a group
      const groups = nodes.filter((n) => n.type === 'group' && n.id !== node.id);

      let parentId: string | undefined = undefined;

      // Basic bounding box intersection check
      for (const group of groups) {
        if (!group.measured?.width || !group.measured?.height) continue;

        // Calculate absolute position of node (if it already has a parent, position is relative)
        let absoluteX = node.position.x;
        let absoluteY = node.position.y;

        if (node.parentId) {
          const parent = nodes.find(n => n.id === node.parentId);
          if (parent) {
             absoluteX += parent.position.x;
             absoluteY += parent.position.y;
          }
        }

        // Group position is absolute since groups can't have parents currently
        const groupLeft = group.position.x;
        const groupTop = group.position.y;
        const groupRight = groupLeft + group.measured.width;
        const groupBottom = groupTop + group.measured.height;

        // Is node center inside the group?
        const nodeCenterX = absoluteX + (node.measured?.width || 150) / 2;
        const nodeCenterY = absoluteY + (node.measured?.height || 50) / 2;

        if (
          nodeCenterX > groupLeft &&
          nodeCenterX < groupRight &&
          nodeCenterY > groupTop &&
          nodeCenterY < groupBottom
        ) {
          parentId = group.id;
          break; // Assign to first group found
        }
      }

      // If parentId changed, update the node
      if (node.parentId !== parentId) {
        const updatedNode = { ...node, parentId };

        // If assigning a new parent, convert position to relative
        if (parentId) {
           const parent = nodes.find(n => n.id === parentId);
           if (parent) {
             updatedNode.position = {
               x: node.position.x - parent.position.x,
               y: node.position.y - parent.position.y,
             };
           }
        } else if (node.parentId) {
           // If removing parent, convert position to absolute
           const oldParent = nodes.find(n => n.id === node.parentId);
           if (oldParent) {
             updatedNode.position = {
               x: node.position.x + oldParent.position.x,
               y: node.position.y + oldParent.position.y,
             };
           }
        }

        setNodes(nodes.map(n => n.id === node.id ? updatedNode : n));
      }
    },
    [nodes, setNodes]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const teamType = event.dataTransfer.getData('application/teamType') as TeamType;

      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Calculate drop position taking into account pan and zoom
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: AppNode = {
        id: getId(),
        type: type as 'team' | 'group',
        position,
        data: type === 'team'
          ? { label: `New ${teamType.replace(/-/g, ' ')}`, teamType, locked: false }
          : { label: 'New Group', locked: false },
        ...(type === 'group' ? {
          style: { width: 300, height: 200, zIndex: -1 },
        } : {}),
      } as AppNode;

      // Check if dropped inside an existing group
      let parentId: string | undefined = undefined;
      const groups = nodes.filter((n) => n.type === 'group');

      for (const group of groups) {
        if (!group.measured?.width || !group.measured?.height) continue;

        const groupLeft = group.position.x;
        const groupTop = group.position.y;
        const groupRight = groupLeft + group.measured.width;
        const groupBottom = groupTop + group.measured.height;

        if (
          position.x > groupLeft &&
          position.x < groupRight &&
          position.y > groupTop &&
          position.y < groupBottom
        ) {
          parentId = group.id;

          // Make relative
          newNode.position = {
            x: position.x - group.position.x,
            y: position.y - group.position.y,
          };
          newNode.parentId = parentId;
          break;
        }
      }

      setNodes([...nodes, newNode]);
    },
    [nodes, setNodes]
  );

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-gray-50 font-sans text-gray-800">
      <Sidebar />
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodeDragStop={onNodeDragStop}
          fitView
          className="bg-gray-50"
        >
          <Background color="#ccc" gap={20} />
          <Controls />
          <MiniMap zoomable pannable nodeStrokeColor="#4b5563" nodeColor="#e5e7eb" />
          <Toolbar />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppFlow />
    </ReactFlowProvider>
  );
}
