'use client';

import { useState, useRef, useEffect } from 'react';
import { PlusCircle, Trash2, Save, Upload, ClipboardList, UserCheck, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ProcessNode {
  id: string;
  type: string; // 'start', 'end', 'task', 'approval', 'projectNode', 'approvalNode', 'decision', 'merge'
  label: string;
  description: string;
  position: { x: number; y: number };
  assignee?: string; // For simple task/approval, can be one main person
  status?: 'pending' | 'completed' | 'rejected';
  color?: string;
  isDeletable?: boolean; // Added to control deletion
  isEditable?: boolean; // Added to control editability of core props

  // Fields for Approval Node
  approvalType?: 'single' | 'all' | 'sequential' | 'majority';
  approvers?: string[]; // Array of user IDs or role IDs
  approvalOrder?: string[]; // For sequential approval
  dueDate?: string; // ISO date string or relative string like "2 days"
  reminderRules?: { daysBefore: number; repeat?: boolean }[];
  escalationRules?: { afterDays: number; escalateTo?: string; autoAction?: 'approve' | 'reject' };
  requireCommentsForRejection?: boolean;
  allowCommentsForApproval?: boolean;

  // Fields for Project Node
  projectLead?: string; // User ID or name
  tasks?: string; // Simple text area for now, can be structured later e.g., { id: string, name: string, assignee?: string, dueDate?: string, status: string }[]
  overallDueDate?: string; // ISO date string
  projectResources?: { name: string, link: string }[];
}

interface ProcessConnection {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

interface ProcessDesignerProps {
  processType: 'project' | 'approval';
  flowId?: string;
  businessFlowId?: string;
  onSave: (data: { nodes: ProcessNode[], connections: ProcessConnection[], metadata: any }) => void;
  onPublish?: () => void;
  onCancel: () => void;
}

// Standardized node types available for the designer
const commonNodeTypes = [
  { id: 'start', label: '开始节点', color: 'bg-blue-400', type: 'start', isDeletable: false, isEditable: false },
  { id: 'end', label: '结束节点', color: 'bg-blue-400', type: 'end', isDeletable: false, isEditable: false },
  { id: 'projectNode', label: '项目节点', color: 'bg-blue-600', type: 'task' }, // Changed to blue
  { id: 'approvalNode', label: '审批节点', color: 'bg-red-600', type: 'approval' }, // Changed to red
  { id: 'conditionBranch', label: '条件分支', color: 'bg-purple-600', type: 'branch_trigger' }, // User visible option
  // Internal types for branching structure, not directly added by user from palette:
  { id: 'decision', label: '条件判断', color: 'bg-purple-400', type: 'decision', isDeletable: true, isEditable: true },
  { id: 'merge', label: '合并点', color: 'bg-purple-400', type: 'merge', isDeletable: true, isEditable: true },
];

const NODE_WIDTH = 180;
const NODE_HEIGHT = 70; // minHeight, actual might vary
const VERTICAL_SPACING = 100; // Increased for better vertical spacing
const HORIZONTAL_SPACING_BRANCH = 200; // Increased for better branch separation

// Helper to generate unique IDs
const generateUniqueId = (prefix = 'id_') => `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function ProcessDesigner({ 
  processType, 
  flowId, 
  businessFlowId,
  onSave, 
  onPublish, 
  onCancel 
}: ProcessDesignerProps) {
  const [nodes, setNodes] = useState<ProcessNode[]>(() => {
    const startNode: ProcessNode = { 
      id: 'start', 
      type: 'start', 
      label: '开始', 
      description: '流程开始', 
      position: { x: 400, y: 100 }, // Adjusted for better centering
      color: commonNodeTypes.find(n=>n.id==='start')?.color,
      isDeletable: false,
      isEditable: false,
    };
    const endNode: ProcessNode = { 
      id: 'end', 
      type: 'end', 
      label: '结束', 
      description: '流程结束', 
      position: { x: 400, y: 300 }, // Adjusted for better centering and spacing
      color: commonNodeTypes.find(n=>n.id==='end')?.color,
      isDeletable: false,
      isEditable: false,
    };
    return [startNode, endNode];
  });
  const [connections, setConnections] = useState<ProcessConnection[]>(() => [
    { id: generateUniqueId('conn_'), source: 'start', target: 'end' }
  ]);
  const [selectedNode, setSelectedNode] = useState<ProcessNode | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<ProcessConnection | null>(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [newNodePosition, setNewNodePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 2000, height: 1500 });
  const [zoom, setZoom] = useState(0.8); // Slightly zoomed out for better view
  const [pan, setPan] = useState({ x: 100, y: 50 }); // Initial pan to center the content better
  const [processName, setProcessName] = useState('新流程');
  const [processDescription, setProcessDescription] = useState('');
  const [isLoadingName, setIsLoadingName] = useState(false);
  
  const [isAddNodePopoverOpen, setIsAddNodePopoverOpen] = useState(false);
  const [addNodePopoverAnchor, setAddNodePopoverAnchor] = useState<HTMLElement | null>(null);
  const [currentConnectionToSplit, setCurrentConnectionToSplit] = useState<ProcessConnection | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // If it's a new flow (no flowId) and a businessFlowId is provided,
    // fetch the businessFlow name to set as default processName.
    if (!flowId && businessFlowId) {
      setIsLoadingName(true);
      fetch(`/api/feishu/business-flows?id=${businessFlowId}`) // Assuming API can fetch by ID
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch business flow details');
        })
        .then(data => {
          // Assuming the API returns the flow directly if ID is provided, or a list
          const flowName = Array.isArray(data.businessFlows) ? data.businessFlows.find((bf: any) => bf.id === businessFlowId)?.name : data?.name;
          if (flowName) {
            setProcessName(flowName);
          }
        })
        .catch(err => {
          console.error("Error fetching business flow name:", err);
          setProcessName(`新流程 (业务流: ${businessFlowId.substring(0,5)}...)`); // Fallback name
        })
        .finally(() => setIsLoadingName(false));
    } else if (flowId) {
      // Logic to load existing flow data (nodes, connections, name, description)
      // This would typically involve another fetch call using flowId
      // For now, we assume processName might be part of loaded data or kept as is if not loaded
    } else {
      setProcessName('新流程'); // Default for entirely new, unlinked flow
    }
  }, [flowId, businessFlowId]);
  
  // Use the standardized commonNodeTypes for the palette
  const nodeTypes = commonNodeTypes;
  
  const addNodeFromPalette = (nodeTemplate: typeof commonNodeTypes[0]) => {
    const newNode: ProcessNode = {
      id: generateUniqueId('node_'),
      type: nodeTemplate.type,
      label: nodeTemplate.label,
      description: '',
      position: { ...newNodePosition, x: newNodePosition.x + Math.random()*10, y: newNodePosition.y + Math.random()*10 }, // Slight offset to avoid perfect overlap
      color: nodeTemplate.color,
      isDeletable: true,
      isEditable: true,
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
    setIsNodeModalOpen(true);
  };
  
  const selectNode = (node: ProcessNode) => {
    setSelectedNode(node);
    setIsNodeModalOpen(true);
  };
  
  const selectConnection = (connection: ProcessConnection) => {
    setSelectedConnection(connection);
    setIsConnectionModalOpen(true);
  };
  
  const updateNode = (updatedNode: ProcessNode) => {
    setNodes(nodes.map(node => 
      node.id === updatedNode.id ? updatedNode : node
    ));
    setIsNodeModalOpen(false);
  };
  
  const updateConnection = (updatedConnection: ProcessConnection) => {
    setConnections(connections.map(conn => 
      conn.id === updatedConnection.id ? updatedConnection : conn
    ));
    setIsConnectionModalOpen(false);
  };
  
  const deleteNode = (nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) return;

    if (nodeToDelete.isDeletable === false || nodeToDelete.type === 'start' || nodeToDelete.type === 'end') {
      console.warn("Start, End, or non-deletable nodes cannot be deleted.");
      return;
    }

    let nodesToRemove = [nodeId];
    let connectionsToRemove: string[] = [];

    if (nodeToDelete.type === 'decision') {
      // Find direct children of the decision node (branch nodes)
      const outgoingConns = connections.filter(c => c.source === nodeId);
      const branchNodeIds = outgoingConns.map(c => c.target);
      
      connectionsToRemove.push(...outgoingConns.map(c => c.id));
      nodesToRemove.push(...branchNodeIds);

      // For each branch node, find its connection to a merge node
      // and potentially mark the merge node for deletion if it becomes orphaned.
      const mergeNodeCandidates: { [key: string]: number } = {}; // mergeNodeId: count of incoming branch connections

      for (const branchNodeId of branchNodeIds) {
        const connsFromBranch = connections.filter(c => c.source === branchNodeId);
        connectionsToRemove.push(...connsFromBranch.map(c => c.id));
        for (const conn of connsFromBranch) {
          if (nodes.find(n => n.id === conn.target)?.type === 'merge') {
            mergeNodeCandidates[conn.target] = (mergeNodeCandidates[conn.target] || 0) + 1;
          }
        }
      }

      // Check if merge nodes should be removed
      for (const mergeId in mergeNodeCandidates) {
        const mergeNode = nodes.find(n => n.id === mergeId);
        if (mergeNode) {
          // Count total incoming connections to this merge node from *any* source
          const totalIncomingToMerge = connections.filter(c => c.target === mergeId).length;
          // Count incoming connections from the branches we are about to delete
          const incomingFromTheseBranches = connections.filter(c => c.target === mergeId && branchNodeIds.includes(c.source)).length;

          if (totalIncomingToMerge === incomingFromTheseBranches) {
            // If all incoming connections to this merge node are from the branches we are deleting, remove the merge node
            nodesToRemove.push(mergeId);
            // Also remove connections originating from this merge node
            const connsFromMerge = connections.filter(c => c.source === mergeId);
            connectionsToRemove.push(...connsFromMerge.map(c => c.id));
          }
        }
      }
    }

    setNodes(prevNodes => prevNodes.filter(node => !nodesToRemove.includes(node.id)));
    setConnections(prevConns => 
      prevConns.filter(conn => 
        !nodesToRemove.includes(conn.source) && 
        !nodesToRemove.includes(conn.target) &&
        !connectionsToRemove.includes(conn.id)
      )
    );
  };
  
  const deleteConnection = (connectionId: string) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (canvasRef.current && e.target === canvasRef.current.firstChild) { // Check if click is on canvas background
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;      
      setNewNodePosition({ x, y });
      setSelectedNode(null); // Deselect any node
      setSelectedConnection(null); // Deselect any connection
    }
  };
  
  const startDragging = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setIsDragging(true);
    setDraggedNodeId(nodeId);
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      
      setDragOffset({
        x: node.position.x - mouseX,
        y: node.position.y - mouseY
      });
    }
  };
  
  const continueDragging = (e: React.MouseEvent) => {
    if (!isDragging || !draggedNodeId || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    
    setNodes(nodes.map(node => {
      if (node.id === draggedNodeId) {
        return {
          ...node,
          position: {
            x: mouseX + dragOffset.x,
            y: mouseY + dragOffset.y
          }
        };
      }
      return node;
    }));
  };
  
  const stopDragging = () => {
    setIsDragging(false);
    setDraggedNodeId(null);
  };
  
  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };
  
  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleSave = () => {
    onSave({
      nodes,
      connections,
      metadata: {
        name: processName,
        description: processDescription,
        processType: processType, // Original overall type selected by user
        businessFlowId,
        id: flowId || `flow_${Date.now()}`,
        lastModified: new Date().toISOString()
      }
    });
  };
  
  const renderConnections = () => {
    return connections.map(connection => {
      const sourceNode = nodes.find(node => node.id === connection.source);
      const targetNode = nodes.find(node => node.id === connection.target);
      
      if (!sourceNode || !targetNode) return null;
      
      const sourceX = sourceNode.position.x + NODE_WIDTH / 2; 
      const sourceY = sourceNode.position.y + NODE_HEIGHT; 
      const targetX = targetNode.position.x + NODE_WIDTH / 2;
      const targetY = targetNode.position.y;
      
      // Path: M (move to) sx,sy L (line to) tx,ty (straight line for now)
      // For curved lines: C (cubic bezier) sx,sy c1x,c1y c2x,c2y tx,ty
      // const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
      // Simple bezier curve control points
      const cp1x = sourceX;
      const cp1y = sourceY + VERTICAL_SPACING / 1.5;
      const cp2x = targetX;
      const cp2y = targetY - VERTICAL_SPACING / 1.5;
      const path = `M ${sourceX} ${sourceY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`;

      const midX = (sourceX + targetX) / 2;
      const midY = (sourceY + targetY) / 2; // Midpoint of the straight line for button
       // For Bezier, true midpoint is harder. Approximate with path's bounding box or use t=0.5
      const t = 0.5; // Parameter for Bezier curve midpoint
      const btnX = Math.pow(1 - t, 3) * sourceX + 3 * Math.pow(1 - t, 2) * t * cp1x + 3 * (1 - t) * Math.pow(t, 2) * cp2x + Math.pow(t, 3) * targetX;
      const btnY = Math.pow(1 - t, 3) * sourceY + 3 * Math.pow(1 - t, 2) * t * cp1y + 3 * (1 - t) * Math.pow(t, 2) * cp2y + Math.pow(t, 3) * targetY;

      return (
        <g key={connection.id} className="connection-group">
          <path 
            d={path} 
            fill="none" 
            stroke={selectedConnection?.id === connection.id ? "#3b82f6" : "#9ca3af"} 
            strokeWidth="2.5"
            markerEnd="url(#arrowhead)"
            onClick={() => selectConnection(connection)}
            className="cursor-pointer"
          />
          {connection.label && (
            <text
              x={(sourceX + targetX) / 2} // Simple midpoint for label
              y={(sourceY + targetY) / 2 - 8}
              textAnchor="middle"
              fill="#666"
              fontSize="12"
              className="pointer-events-none"
            >
              {connection.label}
            </text>
          )}
          {/* Add Node Button on Connection */}
          <Popover open={isAddNodePopoverOpen && currentConnectionToSplit?.id === connection.id} onOpenChange={(open: boolean) => {
            if (!open) {
              setIsAddNodePopoverOpen(false);
              setCurrentConnectionToSplit(null);
              setAddNodePopoverAnchor(null);
            }
          }}>
            <PopoverTrigger asChild>
               <foreignObject x={btnX - 15} y={btnY - 15} width="30" height="30">
                 <button
                    title="添加节点"
                    className="p-0 w-7 h-7 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center hover:bg-blue-50 hover:border-blue-600 hover:scale-110 shadow-md text-blue-600 hover:text-blue-800 add-node-btn-on-connection transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentConnectionToSplit(connection);
                      setAddNodePopoverAnchor(e.currentTarget);
                      setIsAddNodePopoverOpen(true);
                    }}
                  >
                    <PlusCircle size={16} />
                  </button>
               </foreignObject>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-2 space-y-1 shadow-lg bg-white rounded-md border border-gray-200 z-50"
              align="center"
              side="bottom"
              sideOffset={5}
              avoidCollisions={true}
            >
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm h-9 px-2 font-medium hover:bg-blue-50 hover:text-blue-700 flex items-center" 
                onClick={() => {
                  handleNodeInsertion('projectNode');
                  setIsAddNodePopoverOpen(false);
                }}
              >
                <ClipboardList size={16} className="mr-2" />
                <span>项目节点</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm h-9 px-2 font-medium hover:bg-red-50 hover:text-red-700 flex items-center" 
                onClick={() => {
                  handleNodeInsertion('approvalNode');
                  setIsAddNodePopoverOpen(false);
                }}
              >
                <UserCheck size={16} className="mr-2" />
                <span>审批节点</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm h-9 px-2 font-medium hover:bg-purple-50 hover:text-purple-700 flex items-center" 
                onClick={() => {
                  handleNodeInsertion('conditionBranch');
                  setIsAddNodePopoverOpen(false);
                }}
              >
                <GitFork size={16} className="mr-2" />
                <span>条件分支</span>
              </Button>
            </PopoverContent>
          </Popover>
        </g>
      );
    });
  };

  const handleNodeInsertion = (nodeTypeToInsert: 'projectNode' | 'approvalNode' | 'conditionBranch') => {
    console.log(`Inserting node type: ${nodeTypeToInsert}`);
    setIsAddNodePopoverOpen(false);
    if (!currentConnectionToSplit) {
      console.error("No connection selected to split");
      return;
    }

    const sourceNode = nodes.find(n => n.id === currentConnectionToSplit.source);
    const targetNode = nodes.find(n => n.id === currentConnectionToSplit.target);

    if (!sourceNode || !targetNode) {
      console.error("Source or target node not found");
      return;
    }

    let newNodesToAdd: ProcessNode[] = [];
    let newConnectionsToAdd: ProcessConnection[] = [];
    
    // Calculate midpoint for initial placement
    const midX = (sourceNode.position.x + targetNode.position.x) / 2;
    const midY = (sourceNode.position.y + targetNode.position.y) / 2;

    if (nodeTypeToInsert === 'projectNode' || nodeTypeToInsert === 'approvalNode') {
      const nodeTemplate = commonNodeTypes.find(nt => nt.id === nodeTypeToInsert);
      if (!nodeTemplate) return;

      const newNode: ProcessNode = {
        id: generateUniqueId('node_'),
        type: nodeTemplate.type,
        label: nodeTemplate.label,
        description: '',
        position: { x: midX - NODE_WIDTH/2, y: midY - NODE_HEIGHT/2 },
        color: nodeTemplate.color,
        isDeletable: true,
        isEditable: true,
      };

      newNodesToAdd = [newNode];
      
      // Create connections from source to new node and from new node to target
      newConnectionsToAdd = [
        { 
          id: generateUniqueId('conn_'), 
          source: currentConnectionToSplit.source, 
          target: newNode.id 
        },
        { 
          id: generateUniqueId('conn_'), 
          source: newNode.id, 
          target: currentConnectionToSplit.target 
        }
      ];

      // Update nodes positions
      const nodeShift = NODE_HEIGHT + VERTICAL_SPACING;
      setNodes(prevNodes => 
        prevNodes.map(n => {
          if (n.id === newNode.id) return newNode;
          if (n.position.y > sourceNode.position.y) {
            return { ...n, position: { ...n.position, y: n.position.y + nodeShift } };
          }
          return n;
        }).concat(newNodesToAdd)
      );

    } else if (nodeTypeToInsert === 'conditionBranch') {
      // Create decision node
      const decisionNode: ProcessNode = {
        id: generateUniqueId('decision_'),
        type: 'decision',
        label: '条件判断',
        description: '',
        position: { x: midX - NODE_WIDTH/2, y: midY - NODE_HEIGHT/2 },
        color: commonNodeTypes.find(nt => nt.type === 'decision')?.color,
        isDeletable: true,
        isEditable: true,
      };

      // Create two branch nodes
      const branchSpacing = HORIZONTAL_SPACING_BRANCH;
      const branch1: ProcessNode = {
        id: generateUniqueId('branch1_'),
        type: 'task',
        label: '分支 A',
        description: '',
        position: { 
          x: midX - branchSpacing - NODE_WIDTH/2, 
          y: midY + VERTICAL_SPACING 
        },
        color: commonNodeTypes.find(nt => nt.type === 'task')?.color,
        isDeletable: true,
        isEditable: true,
      };

      const branch2: ProcessNode = {
        id: generateUniqueId('branch2_'),
        type: 'task',
        label: '分支 B',
        description: '',
        position: { 
          x: midX + branchSpacing - NODE_WIDTH/2, 
          y: midY + VERTICAL_SPACING 
        },
        color: commonNodeTypes.find(nt => nt.type === 'task')?.color,
        isDeletable: true,
        isEditable: true,
      };

      // Create merge node
      const mergeNode: ProcessNode = {
        id: generateUniqueId('merge_'),
        type: 'merge',
        label: '合并',
        description: '',
        position: { 
          x: midX - NODE_WIDTH/2, 
          y: midY + (VERTICAL_SPACING * 2) + NODE_HEIGHT 
        },
        color: commonNodeTypes.find(nt => nt.type === 'merge')?.color,
        isDeletable: true,
        isEditable: true,
      };

      newNodesToAdd = [decisionNode, branch1, branch2, mergeNode];

      // Create all necessary connections
      newConnectionsToAdd = [
        { 
          id: generateUniqueId('conn_'), 
          source: currentConnectionToSplit.source, 
          target: decisionNode.id 
        },
        { 
          id: generateUniqueId('conn_'), 
          source: decisionNode.id, 
          target: branch1.id,
          label: '条件 A' 
        },
        { 
          id: generateUniqueId('conn_'), 
          source: decisionNode.id, 
          target: branch2.id,
          label: '条件 B' 
        },
        { 
          id: generateUniqueId('conn_'), 
          source: branch1.id, 
          target: mergeNode.id 
        },
        { 
          id: generateUniqueId('conn_'), 
          source: branch2.id, 
          target: mergeNode.id 
        },
        { 
          id: generateUniqueId('conn_'), 
          source: mergeNode.id, 
          target: currentConnectionToSplit.target 
        }
      ];

      // Update nodes positions
      const totalShift = (VERTICAL_SPACING * 2) + (NODE_HEIGHT * 2);
      setNodes(prevNodes => 
        prevNodes.map(n => {
          if (newNodesToAdd.find(nn => nn.id === n.id)) return n;
          if (n.position.y > sourceNode.position.y) {
            return { ...n, position: { ...n.position, y: n.position.y + totalShift } };
          }
          return n;
        }).concat(newNodesToAdd)
      );
    }
    
    // Remove the original connection and add new ones
    setConnections(prevConnections => [
      ...prevConnections.filter(conn => conn.id !== currentConnectionToSplit.id),
      ...newConnectionsToAdd
    ]);
    
    // If nodes were not updated in branch specific logic, update them here
    if (!(nodeTypeToInsert === 'projectNode' || nodeTypeToInsert === 'approvalNode' || nodeTypeToInsert === 'conditionBranch' && newNodesToAdd.length > 0)) {
       setNodes(prevNodes => prevNodes.concat(newNodesToAdd.filter(nn => !prevNodes.find(pn => pn.id === nn.id))));
    }

    setCurrentConnectionToSplit(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex justify-between items-center p-4 border-b bg-white">
        <div className="flex items-center space-x-4">
          <Input 
            value={isLoadingName ? "加载中..." : processName}
            onChange={(e) => setProcessName(e.target.value)}
            className="w-64 text-lg font-semibold"
            placeholder="流程名称"
            disabled={isLoadingName}
          />
          <div className="text-sm text-gray-500">
            (类型: {processType === 'project' ? '项目流' : '审批流'})
          </div>
          <Input
            value={processDescription}
            onChange={(e) => setProcessDescription(e.target.value)}
            className="w-80 text-sm"
            placeholder="输入流程描述..."
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={zoomOut} title="缩小"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></Button>
          <span className="text-sm w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" onClick={zoomIn} title="放大"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></Button>
          <Button variant="outline" size="sm" onClick={onCancel}>取消</Button>
          <Button variant="default" size="sm" onClick={handleSave} disabled={isLoadingName}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
          {/* Publish button can be re-enabled when functionality is added */}
          {/* {onPublish && (
            <Button variant="secondary" size="sm" onClick={onPublish}>
              <Upload className="w-4 h-4 mr-2" />
              发布
            </Button>
          )} */}
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Node Palette - Removing this entire sidebar as requested */}
        
        {/* Canvas */}
        <div 
          className="flex-1 relative overflow-hidden bg-dots"
          onClick={handleCanvasClick} // For deselecting or setting new node position
          onMouseMove={continueDragging}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging} // Also stop dragging if mouse leaves canvas
          ref={canvasRef}
        >
          <div 
            className="absolute transition-transform origin-top-left" // Removed unnecessary width/height for direct child
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              width: `${canvasSize.width}px`, // Apply canvas size here for the drawing area
              height: `${canvasSize.height}px`,
            }}
          >
            <svg width={canvasSize.width} height={canvasSize.height} className="absolute top-0 left-0 pointer-events-none">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9.5" // Adjusted for better arrow tip centering
                  refY="3.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
                </marker>
              </defs>
              {renderConnections()}
            </svg>
            
            {nodes.map(node => (
              <div 
                key={node.id}
                className={`absolute cursor-grab border rounded-lg shadow-lg text-white p-1 ${node.color || 'bg-slate-500'} hover:shadow-xl active:cursor-grabbing`}
                style={{ 
                  left: node.position.x,
                  top: node.position.y,
                  width: NODE_WIDTH, 
                  minHeight: NODE_HEIGHT,
                }}
                onClick={(e) => { e.stopPropagation(); selectNode(node); }}
                onMouseDown={(e) => startDragging(e, node.id)}
              >
                <div className="p-2">
                  <div className="font-semibold text-sm truncate" title={node.label}>{node.label}</div>
                  {node.description && <div className="text-xs opacity-80 mt-1 truncate" title={node.description}>{node.description}</div>}
                  {node.assignee && (
                    <div className="text-xs mt-1 opacity-70">负责人: {node.assignee}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Node Edit Modal */}
      <Dialog open={isNodeModalOpen} onOpenChange={setIsNodeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              编辑 "{selectedNode?.label || '节点'}"
            </DialogTitle>
          </DialogHeader>
          
          {selectedNode && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="node-label" className="text-right text-sm">名称</Label>
                <Input
                  id="node-label"
                  value={selectedNode.label}
                  onChange={(e) => setSelectedNode({ ...selectedNode, label: e.target.value })}
                  className="col-span-3 text-sm"
                  disabled={selectedNode.isEditable === false}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="node-description" className="text-right text-sm">描述</Label>
                <Textarea
                  id="node-description"
                  value={selectedNode.description}
                  onChange={(e) => setSelectedNode({ ...selectedNode, description: e.target.value })}
                  className="col-span-3 text-sm" rows={3}
                  disabled={selectedNode.isEditable === false}
                />
              </div>
              
              {(selectedNode.type === 'task' || selectedNode.type === 'approval' || selectedNode.type === 'projectNode' || selectedNode.type === 'approvalNode') && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="node-assignee" className="text-right text-sm">负责人</Label>
                  <Input
                    id="node-assignee"
                    value={selectedNode.assignee || ''}
                    onChange={(e) => setSelectedNode({ ...selectedNode, assignee: e.target.value })}
                    className="col-span-3 text-sm"
                    placeholder="输入负责人名称"
                    disabled={selectedNode.isEditable === false}
                  />
                </div>
              )}

              {/* Additional fields for Approval Node */}
              {(selectedNode.type === 'approval' || selectedNode.type === 'approvalNode') && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="approval-type" className="text-right text-sm">审批类型</Label>
                    <Select
                      value={selectedNode.approvalType || 'single'}
                      onValueChange={(value) => setSelectedNode({ ...selectedNode, approvalType: value as ProcessNode['approvalType'] })}
                      disabled={selectedNode.isEditable === false}
                    >
                      <SelectTrigger className="col-span-3 text-sm">
                        <SelectValue placeholder="选择审批类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">单人审批 (一人通过即可)</SelectItem>
                        <SelectItem value="all">会签 (所有人需通过)</SelectItem>
                        <SelectItem value="sequential">依次审批 (按顺序)</SelectItem>
                        <SelectItem value="majority">多数表决</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="node-approvers" className="text-right text-sm">审批人</Label>
                    <Input
                      id="node-approvers"
                      value={(selectedNode.approvers || []).join(', ')}
                      onChange={(e) => setSelectedNode({ ...selectedNode, approvers: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                      className="col-span-3 text-sm"
                      placeholder="输入审批人ID/角色, 逗号分隔"
                      disabled={selectedNode.isEditable === false}
                    />
                  </div>
                  {/* We can add a more sophisticated user/role selector component here later */}

                  {selectedNode.approvalType === 'sequential' && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="node-approval-order" className="text-right text-sm">审批顺序</Label>
                      <Input
                        id="node-approval-order"
                        value={(selectedNode.approvalOrder || []).join(', ')}
                        onChange={(e) => setSelectedNode({ ...selectedNode, approvalOrder: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                        className="col-span-3 text-sm"
                        placeholder="按顺序输入审批人ID/角色"
                        disabled={selectedNode.isEditable === false}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="node-due-date" className="text-right text-sm">截止日期</Label>
                    <Input
                      id="node-due-date"
                      type="text" // Could be date or text for relative dates like "2 days"
                      value={selectedNode.dueDate || ''}
                      onChange={(e) => setSelectedNode({ ...selectedNode, dueDate: e.target.value })}
                      className="col-span-3 text-sm"
                      placeholder="例如: 2023-12-31 或 2天后"
                      disabled={selectedNode.isEditable === false}
                    />
                  </div>
                  
                  {/* Placeholders for Reminder and Escalation Rules - complex UI, to be detailed later */}
                  {/* <div className="text-sm text-gray-500 col-span-4">提醒规则和升级规则的配置区域...</div> */}

                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-span-1"></div> {/* Spacer */}
                    <div className="col-span-3 space-y-2">
                       <div className="flex items-center space-x-2">
                        <Input
                          type="checkbox"
                          id="node-require-rejection-comments"
                          checked={selectedNode.requireCommentsForRejection || false}
                          onChange={(e) => setSelectedNode({ ...selectedNode, requireCommentsForRejection: e.target.checked })}
                          className="h-4 w-4"
                          disabled={selectedNode.isEditable === false}
                        />
                        <Label htmlFor="node-require-rejection-comments" className="text-sm font-normal">拒绝时必须填写评论</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="checkbox"
                          id="node-allow-approval-comments"
                          checked={selectedNode.allowCommentsForApproval || false}
                          onChange={(e) => setSelectedNode({ ...selectedNode, allowCommentsForApproval: e.target.checked })}
                          className="h-4 w-4"
                          disabled={selectedNode.isEditable === false}
                        />
                        <Label htmlFor="node-allow-approval-comments" className="text-sm font-normal">允许通过时填写评论</Label>
                      </div>
                    </div>
                  </div>

                </>
              )}

              {/* Additional fields for Project Node (type: 'task') */}
              {(selectedNode.type === 'task') && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-lead" className="text-right text-sm">项目负责人</Label>
                    <Input
                      id="project-lead"
                      value={selectedNode.projectLead || ''}
                      onChange={(e) => setSelectedNode({ ...selectedNode, projectLead: e.target.value })}
                      className="col-span-3 text-sm"
                      placeholder="输入项目负责人ID/名称"
                      disabled={selectedNode.isEditable === false}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-tasks" className="text-right text-sm">任务列表</Label>
                    <Textarea
                      id="project-tasks"
                      value={selectedNode.tasks || ''}
                      onChange={(e) => setSelectedNode({ ...selectedNode, tasks: e.target.value })}
                      className="col-span-3 text-sm" rows={4}
                      placeholder="每行一个任务描述&#10;后续可升级为结构化任务管理"
                      disabled={selectedNode.isEditable === false}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-overall-due-date" className="text-right text-sm">项目截止日</Label>
                    <Input
                      id="project-overall-due-date"
                      type="date"
                      value={selectedNode.overallDueDate || ''}
                      onChange={(e) => setSelectedNode({ ...selectedNode, overallDueDate: e.target.value })}
                      className="col-span-3 text-sm"
                      disabled={selectedNode.isEditable === false}
                    />
                  </div>
                   {/* Placeholder for projectResources - can add UI for key-value or list input later */}
                </>
              )}
              {/* TODO: Add more specific fields based on node.type if needed */}
            </div>
          )}
          
          <DialogFooter className="mt-2 flex justify-between items-center">
            {(selectedNode?.type !== 'start' && selectedNode?.type !== 'end' && selectedNode?.isDeletable !== false) && (
                <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                        if (selectedNode) deleteNode(selectedNode.id);
                        setIsNodeModalOpen(false);
                    }}
                    >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    删除节点
                </Button>
            )}
            {!(selectedNode?.type !== 'start' && selectedNode?.type !== 'end' && selectedNode?.isDeletable !== false) && <div className="flex-grow"></div>} {/* Pushes cancel/save to right if delete is not shown*/}
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsNodeModalOpen(false)}>取消</Button>
              <Button 
                size="sm"
                onClick={() => { if (selectedNode) updateNode(selectedNode); }}
              >
                确认更改
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Connection Edit Modal (Simplified) */}
      <Dialog open={isConnectionModalOpen} onOpenChange={setIsConnectionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑连接属性</DialogTitle>
          </DialogHeader>
          
          {selectedConnection && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="connection-label" className="text-right text-sm">标签</Label>
                <Input
                  id="connection-label"
                  value={selectedConnection.label || ''}
                  onChange={(e) => setSelectedConnection({ ...selectedConnection, label: e.target.value })}
                  className="col-span-3 text-sm"
                  placeholder="例如：是、否、通过"
                />
              </div>
              
              {/* Conditional field example - adjust condition based on source/target node types */}
              {( 
                selectedConnection && 
                (nodes.find(n=>n.id === selectedConnection.source)?.type === 'decision' || 
                 nodes.find(n=>n.id === selectedConnection.source)?.type === 'approvalNode')
              ) && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="connection-condition" className="text-right text-sm">分支条件</Label>
                  <Textarea
                    id="connection-condition"
                    value={selectedConnection.condition || ''}
                    onChange={(e) => setSelectedConnection({ ...selectedConnection, condition: e.target.value })}
                    className="col-span-3 text-sm" rows={2}
                    placeholder="例如：金额 > 10000"
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="mt-2 flex justify-between items-center">
             <Button 
                variant="ghost" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                    if (selectedConnection) deleteConnection(selectedConnection.id);
                    setIsConnectionModalOpen(false);
                }}
                >
                <Trash2 className="w-4 h-4 mr-1.5" />
                删除连接
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsConnectionModalOpen(false)}>取消</Button>
              <Button 
                size="sm"
                onClick={() => { if (selectedConnection) updateConnection(selectedConnection); }}
              >
                确认更改
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
       {/* CSS for dot background */}
      <style jsx global>{`
        .bg-dots {
          background-image: radial-gradient(#9ca3af 0.7px, transparent 1px);
          background-size: 20px 20px;
          background-color: #f8fafc;
        }
        .connection-group:hover .add-node-btn-on-connection {
          opacity: 1;
          transform: scale(1.1);
        }
        .add-node-btn-on-connection {
          opacity: 0;
          transform: scale(0.9);
          transition: all 0.2s ease-in-out;
        }
        .connection-group {
          cursor: pointer;
        }
        .connection-group:hover path {
          stroke-width: 3;
          stroke: #3b82f6;
        }
      `}</style>
    </div>
  );
} 