import { useEffect, useState } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import { motion } from "framer-motion";
import { FaSearch, FaChevronDown, FaChevronRight, FaUser } from "react-icons/fa";
import apiClient from "../../../api/apiClient"; // ✅ Correct import

// ==================== Type Definitions ====================

interface AgentNode {
  id: number;
  name: string;
  level: number;
  children: AgentNode[];
}

interface ApiAgentNode {
  id: number;
  full_name: string;
  user_id?: number;
  agent_type?: string;
  city?: string;
  state?: string;
  downlines?: ApiAgentNode[];
}

// ==================== Component ====================

const AdminAgentHierarchyTreeView = () => {
  // ==================== State Management ====================
  
  const [trees, setTrees] = useState<AgentNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== Helper Functions ====================

  const toggleNode = (id: string): void => {
    setExpandedNodes((prev): Set<string> => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const transformTree = (node: ApiAgentNode, level: number = 1): AgentNode => ({
    id: node.id,
    name: node.full_name,
    level,
    children: Array.isArray(node.downlines) 
      ? node.downlines.map((child: ApiAgentNode) => transformTree(child, level + 1))
      : [],
  });

  // ==================== API Call with apiClient ====================

  useEffect(() => {
    const fetchTrees = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        // ✅ Using apiClient (automatically handles auth and headers)
        const res = await apiClient.get<ApiAgentNode[]>("/mlm/admin-tree/");
        
        // ✅ Debug log to see response
        console.log("Admin tree response:", res.data);
        
        const formatted = res.data.map((root: ApiAgentNode) =>
          transformTree(root)
        );

        setTrees(formatted);
        
        // ✅ Auto-expand first level for better UX
        formatted.forEach(tree => {
          setExpandedNodes(prev => {
            const newSet = new Set(prev);
            newSet.add(tree.id.toString());
            return newSet;
          });
        });

      } catch (error: any) {
        console.error("Admin tree error:", error);
        
        // ✅ Better error handling
        if (error.response?.status === 401) {
          setError("Your session has expired. Please login again.");
        } else if (error.response?.status === 403) {
          setError("You don't have permission to view admin trees.");
        } else {
          setError(error.response?.data?.message || "Failed to load agent trees");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrees();
  }, []);

  // ==================== Search Filter ====================

  const filteredTrees = trees.filter((node) =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==================== Render Functions ====================

  const renderTree = (node: AgentNode): React.ReactElement => {
    const isExpanded = expandedNodes.has(node.id.toString());
    const hasChildren = node.children.length > 0;

    return (
      <TreeNode
        key={node.id}
        label={
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`
              p-4 bg-white rounded-xl shadow border 
              hover:shadow-lg transition-all duration-200
              ${hasChildren ? 'border-blue-200' : 'border-gray-100'}
            `}>
              <div className="flex items-center gap-3">
                {hasChildren && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode(node.id.toString());
                    }}
                    className="text-gray-600 hover:text-gray-800 focus:outline-none 
                             p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? (
                      <FaChevronDown size={14} />
                    ) : (
                      <FaChevronRight size={14} />
                    )}
                  </button>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-400" size={16} />
                    <p className="font-semibold text-gray-800">{node.name}</p>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Level {node.level} • {node.children.length} Downlines
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        }
      >
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {node.children.map((child) => renderTree(child))}
          </motion.div>
        )}
      </TreeNode>
    );
  };

  // ==================== Loading State ====================

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-2xl shadow-md">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent 
                          rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading agent trees...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== Error State ====================

  if (error) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-2xl shadow-md">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                     transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ==================== Main Render ====================

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-2xl shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-700">
          All Agent Networks
        </h2>
        <p className="text-sm text-gray-500">
          Total Root Agents: {trees.length}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search agent by name..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setSearchTerm(e.target.value)
          }
          className="w-full p-3 pl-10 pr-4 border rounded-xl focus:ring-2 
                   focus:ring-blue-500 bg-white shadow-sm text-sm"
        />
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 
                           text-gray-400" size={16} />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 
                     text-gray-400 hover:text-gray-600 text-sm"
          >
            Clear
          </button>
        )}
      </div>

      {/* Trees Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 
                    overflow-x-auto min-h-[400px]">
        {filteredTrees.length > 0 ? (
          <div className="space-y-8">
            {filteredTrees.map((root) => (
              <div key={root.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                <Tree
                  lineWidth={"2px"}
                  lineColor={"#d1d5db"}
                  lineBorderRadius={"10px"}
                  lineStyle={"dashed"}
                  label={
                    <motion.div 
                      className="inline-block px-6 py-3 bg-blue-600 text-white 
                               rounded-xl shadow-lg mb-6"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      <p className="font-semibold">Root Agent</p>
                      <p className="text-xs text-blue-100">{root.name}</p>
                    </motion.div>
                  }
                >
                  {renderTree(root)}
                </Tree>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">
              {searchTerm ? "No matching agents found" : "No agents found"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm 
                         font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAgentHierarchyTreeView;