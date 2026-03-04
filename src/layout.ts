import ELK from 'elkjs/lib/elk.bundled.js';
import type { AppNode, AppEdge } from './store';

const elk = new ELK();

// Build hierarchical graph for ELK
export async function runLayout(nodes: AppNode[], edges: AppEdge[]): Promise<AppNode[]> {
  const rootNodes: AppNode[] = nodes.filter((n) => !n.parentId);

  // Helper to map react-flow node to ELK node
  const buildElkNode = (n: AppNode): any => {
    let width = 150;
    let height = 50;

    if (n.type === 'group') {
      width = n.measured?.width || 300;
      height = n.measured?.height || 200;
    }

    const children = nodes.filter((child) => child.parentId === n.id);

    return {
      id: n.id,
      width,
      height,
      layoutOptions: n.data.locked ? { 'elk.position': `(${n.position.x},${n.position.y})` } : {},
      children: children.length > 0 ? children.map(buildElkNode) : undefined,
    };
  };

  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '60',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    },
    children: rootNodes.map(buildElkNode),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };

  try {
    const layoutedGraph = await elk.layout(elkGraph);

    const resultNodes: AppNode[] = [];
    const applyLayout = (elkNodes: any[]) => {
      for (const elkNode of elkNodes) {
        const originalNode = nodes.find((n) => n.id === elkNode.id);
        if (originalNode) {
          if (!originalNode.data.locked) {
            resultNodes.push({
              ...originalNode,
              position: {
                x: elkNode.x || 0,
                y: elkNode.y || 0,
              },
              ...(originalNode.type === 'group' && elkNode.width && elkNode.height
                ? {
                    style: { ...originalNode.style, width: elkNode.width, height: elkNode.height },
                  }
                : {}),
            });
          } else {
            resultNodes.push(originalNode);
          }

          if (elkNode.children) {
            applyLayout(elkNode.children);
          }
        }
      }
    };

    if (layoutedGraph.children) {
      applyLayout(layoutedGraph.children);
      return resultNodes;
    }
  } catch (error) {
    console.error('ELK Layout error:', error);
  }

  return nodes;
}
