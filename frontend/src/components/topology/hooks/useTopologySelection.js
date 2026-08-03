import { useState, useCallback } from "react";

/**
 * Custom hook to isolate and manage node selection, property drawer,
 * and modal dialog state parameters for the network topology page.
 */
export function useTopologySelection() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [activePassportId, setActivePassportId] = useState(null);
  const [activeSnmpId, setActiveSnmpId] = useState(null);

  const handleSelectNode = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return {
    selectedNode,
    setSelectedNode,
    handleSelectNode,
    handleClearSelection,
    activePassportId,
    setActivePassportId,
    activeSnmpId,
    setActiveSnmpId,
  };
}
