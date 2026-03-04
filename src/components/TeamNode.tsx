import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from '@xyflow/react';
import type { TeamNodeData } from '../store';

const TEAM_COLORS: Record<string, { bg: string; stroke: string }> = {
  'stream-aligned': { bg: 'fill-yellow-200', stroke: 'stroke-yellow-500' },
  'enabling': { bg: 'fill-purple-200', stroke: 'stroke-purple-500' },
  'complicated-subsystem': { bg: 'fill-orange-200', stroke: 'stroke-orange-500' },
  'platform': { bg: 'fill-blue-200', stroke: 'stroke-blue-500' },
  'undefined': { bg: 'fill-gray-200', stroke: 'stroke-gray-500' },
};

export default function TeamNode({ data, selected }: NodeProps<Node<TeamNodeData, "team">>) {
  const { teamType, label, locked } = data;
  const colors = TEAM_COLORS[teamType] || TEAM_COLORS['undefined'];

  const renderShape = () => {
    switch (teamType) {
      case 'stream-aligned':
        return (
          <rect
            x="0"
            y="0"
            width="150"
            height="50"
            rx="25"
            className={`${colors.bg} ${colors.stroke} stroke-2 transition-all duration-200 ${selected ? 'stroke-4 stroke-blue-700' : ''}`}
          />
        );
      case 'enabling':
        return (
          <ellipse
            cx="75"
            cy="25"
            rx="75"
            ry="25"
            className={`${colors.bg} ${colors.stroke} stroke-2 transition-all duration-200 ${selected ? 'stroke-4 stroke-blue-700' : ''}`}
          />
        );
      case 'complicated-subsystem':
        return (
          <polygon
            points="0,25 25,0 125,0 150,25 125,50 25,50"
            className={`${colors.bg} ${colors.stroke} stroke-2 transition-all duration-200 ${selected ? 'stroke-4 stroke-blue-700' : ''}`}
          />
        );
      case 'platform':
        return (
          <rect
            x="0"
            y="0"
            width="150"
            height="50"
            className={`${colors.bg} ${colors.stroke} stroke-2 transition-all duration-200 ${selected ? 'stroke-4 stroke-blue-700' : ''}`}
          />
        );
      default:
        // undefined team
        return (
          <rect
            x="0"
            y="0"
            width="150"
            height="50"
            strokeDasharray="4 4"
            className={`${colors.bg} ${colors.stroke} stroke-2 transition-all duration-200 ${selected ? 'stroke-4 stroke-blue-700' : ''}`}
          />
        );
    }
  };

  return (
    <div className={`relative ${locked ? 'opacity-80' : ''}`}>
      <svg width="150" height="50" className="drop-shadow-sm overflow-visible">
        {renderShape()}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center p-2 text-center pointer-events-none">
        <span className="text-xs font-semibold text-gray-800 break-words leading-tight">
          {label}
        </span>
      </div>

      {/* Target handle - usually top */}
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-gray-400 opacity-0 group-hover:opacity-100" />
      {/* Source handles - bottom, left, right */}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-gray-400 opacity-0 group-hover:opacity-100" />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 !bg-gray-400 opacity-0 group-hover:opacity-100" />
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 !bg-gray-400 opacity-0 group-hover:opacity-100" />
    </div>
  );
}
