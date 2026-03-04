import type { DragEvent } from 'react';

import type { TeamType } from '../store';
import { Users, Layers, Activity, CircleDashed, SquareDashed } from 'lucide-react';

export default function Sidebar() {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string, teamType?: TeamType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    if (teamType) {
      event.dataTransfer.setData('application/teamType', teamType);
    }
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          Team Topologies
        </h1>
        <p className="text-xs text-gray-500 mt-1">Drag and drop shapes onto the canvas.</p>
      </div>

      <div className="p-4 flex-1">
        <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Teams</h2>
        <div className="flex flex-col gap-3 mb-6">

          <div
            className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded cursor-grab hover:bg-yellow-100 transition-colors"
            onDragStart={(e) => onDragStart(e, 'team', 'stream-aligned')}
            draggable
          >
            <Activity className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Stream-Aligned</span>
          </div>

          <div
            className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded cursor-grab hover:bg-purple-100 transition-colors"
            onDragStart={(e) => onDragStart(e, 'team', 'enabling')}
            draggable
          >
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Enabling Team</span>
          </div>

          <div
            className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded cursor-grab hover:bg-orange-100 transition-colors"
            onDragStart={(e) => onDragStart(e, 'team', 'complicated-subsystem')}
            draggable
          >
            <Activity className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Complicated Subsystem</span>
          </div>

          <div
            className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded cursor-grab hover:bg-blue-100 transition-colors"
            onDragStart={(e) => onDragStart(e, 'team', 'platform')}
            draggable
          >
            <Layers className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Platform Team</span>
          </div>

          <div
            className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-300 border-dashed rounded cursor-grab hover:bg-gray-100 transition-colors"
            onDragStart={(e) => onDragStart(e, 'team', 'undefined')}
            draggable
          >
            <CircleDashed className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Undefined Team</span>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Groups</h2>
        <div className="flex flex-col gap-3">
          <div
            className="flex items-center gap-3 p-3 bg-gray-50 bg-opacity-50 border-2 border-gray-400 border-dashed rounded cursor-grab hover:bg-gray-100 transition-colors"
            onDragStart={(e) => onDragStart(e, 'group')}
            draggable
          >
            <SquareDashed className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Group</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
        Tip: Select an edge to change the interaction mode.
      </div>
    </aside>
  );
}
