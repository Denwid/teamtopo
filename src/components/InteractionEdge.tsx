import { BaseEdge, getBezierPath } from "@xyflow/react";
import type { Edge, EdgeProps } from '@xyflow/react';
import type { InteractionEdgeData } from '../store';

const INTERACTION_STYLES: Record<string, string> = {
  'collaboration': 'stroke-purple-600', // Usually diagonal stripes, but simple stroke here, maybe dashes
  'x-as-a-service': 'stroke-gray-500',  // Usually solid line
  'facilitating': 'stroke-green-500',   // Usually dotted line
  'undefined': 'stroke-gray-400',
};

export default function InteractionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
}: EdgeProps<Edge<InteractionEdgeData, "interaction">>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const interactionMode = data?.interactionMode || 'undefined';
  const colorClass = INTERACTION_STYLES[interactionMode] || INTERACTION_STYLES['undefined'];


  let strokeDasharray = '';
  if (interactionMode === 'collaboration') {
     strokeDasharray = '5 5';
  } else if (interactionMode === 'facilitating') {
     strokeDasharray = '2 4';
  } else if (interactionMode === 'x-as-a-service') {
     strokeDasharray = '';
  } else {
     strokeDasharray = '4 4';
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        id={id}
        style={{ ...(style as object), strokeDasharray }}
        className={`${colorClass} stroke-2 transition-all ${selected ? 'stroke-blue-700 stroke-[3px]' : ''}`}
        markerEnd={style?.markerEnd}
      />
      {/* Invisible thicker edge for easier clicking */}
      <BaseEdge
        path={edgePath}
        id={`${id}-hitbox`}
        style={{ ...style }}
        className={`stroke-transparent stroke-[15px] hover:stroke-gray-200/50 cursor-pointer`}
      />
      {interactionMode !== 'undefined' && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x="-40"
            y="-10"
            width="80"
            height="20"
            rx="10"
            className="fill-white stroke-gray-200 stroke-1"
          />
          <text
            y="4"
            className="text-[10px] font-medium fill-gray-700 text-center uppercase tracking-wider"
            textAnchor="middle"
          >
            {interactionMode.replace(/-/g, ' ')}
          </text>
        </g>
      )}
    </>
  );
}
