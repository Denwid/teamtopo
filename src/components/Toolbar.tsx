import { useState } from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import { LayoutList, Lock, Unlock, Link2, Trash2, Download, Upload } from 'lucide-react';
import { useStore } from "../store";
import type { InteractionMode } from '../store';
import { runLayout } from '../layout';

export default function Toolbar() {
  const {
    nodes,
    edges,
    setNodes,
    exportToUrlHash,
    updateNodeData,
    toggleNodeLock,
    updateEdgeData,
  } = useStore();
  const { getNodes, getEdges } = useReactFlow();

  const [loadingLayout, setLoadingLayout] = useState(false);

  // Selected state
  const selectedNode = nodes.find((n) => n.selected);
  const selectedEdge = edges.find((e) => e.selected);

  const handleAutoLayout = async () => {
    setLoadingLayout(true);
    try {
      const layoutedNodes = await runLayout(getNodes() as any, getEdges() as any);
      setNodes(layoutedNodes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLayout(false);
    }
  };

  const handleExportUrl = () => {
    exportToUrlHash();
    alert('Topology exported to URL! You can copy the URL to share or save.');
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, edges }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "team-topology.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const parsed = JSON.parse(result);
        if (parsed.nodes && parsed.edges) {
          useStore.setState({ nodes: parsed.nodes, edges: parsed.edges });
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      useStore.setState((state) => ({
        nodes: state.nodes.filter((n) => n.id !== selectedNode.id),
      }));
    }
  };

  const handleDeleteEdge = () => {
    if (selectedEdge) {
      useStore.setState((state) => ({
        edges: state.edges.filter((e) => e.id !== selectedEdge.id),
      }));
    }
  };

  return (
    <Panel position="top-right" className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-2 min-w-[200px]">
      <div className="flex gap-2 mb-2 pb-2 border-b border-gray-100 justify-between">
        <button
          onClick={handleAutoLayout}
          disabled={loadingLayout}
          className="flex items-center justify-center p-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
          title="Auto Layout (ELK)"
        >
          <LayoutList className={`w-4 h-4 ${loadingLayout ? 'animate-pulse' : ''}`} />
        </button>
        <div className="flex gap-1">
          <button
            onClick={handleExportUrl}
            className="flex items-center justify-center p-2 rounded hover:bg-gray-100 text-blue-600 transition-colors"
            title="Save to URL Hash"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center justify-center p-2 rounded hover:bg-gray-100 text-green-600 transition-colors"
            title="Export JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          <label className="flex items-center justify-center p-2 rounded hover:bg-gray-100 text-orange-600 transition-colors cursor-pointer" title="Import JSON">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>
      </div>

      {selectedNode ? (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase">Selected Node</label>
          <input
            type="text"
            value={selectedNode.data.label as string}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
            className="w-full text-sm p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex justify-between mt-1">
            <button
              onClick={() => toggleNodeLock(selectedNode.id)}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                selectedNode.data.locked
                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              {selectedNode.data.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {selectedNode.data.locked ? 'Unlock' : 'Lock'}
            </button>
            <button
              onClick={handleDeleteNode}
              className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Node"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : selectedEdge ? (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase">Interaction Mode</label>
          <select
            value={selectedEdge.data?.interactionMode || 'undefined'}
            onChange={(e) => updateEdgeData(selectedEdge.id, { interactionMode: e.target.value as InteractionMode })}
            className="w-full text-sm p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="collaboration">Collaboration</option>
            <option value="x-as-a-service">X-as-a-Service</option>
            <option value="facilitating">Facilitating</option>
            <option value="undefined">Undefined</option>
          </select>
          <div className="flex justify-end mt-1">
            <button
              onClick={handleDeleteEdge}
              className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Edge"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-400 text-center py-2 italic">Select a node or edge to edit</div>
      )}
    </Panel>
  );
}
