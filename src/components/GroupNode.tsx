import { NodeResizer } from "@xyflow/react";
import type { Node, NodeProps } from '@xyflow/react';
import type { GroupNodeData } from '../store';

export default function GroupNode({ data, selected }: NodeProps<Node<GroupNodeData, "group">>) {
  const { label, locked } = data;

  return (
    <>
      <NodeResizer minWidth={100} minHeight={100} isVisible={selected} />
      <div
        className={`w-full h-full border-2 border-dashed border-gray-400 bg-gray-50 bg-opacity-30 rounded-lg flex items-start justify-center pt-2 relative ${locked ? 'opacity-80' : ''}`}
      >
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest bg-white/70 px-2 rounded-full backdrop-blur-sm shadow-sm pointer-events-none">
          {label}
        </span>
      </div>
    </>
  );
}
