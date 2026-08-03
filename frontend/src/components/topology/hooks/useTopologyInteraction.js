import { useState, useCallback, useRef } from "react";

/**
 * Parses coordinate positions from an SVG transform translate string.
 * @param {string} transformStr - SVG attribute value, e.g. "translate(250,140)"
 * @returns {Object} { x: number, y: number }
 */
function parseTranslation(transformStr) {
  if (!transformStr) return { x: 0, y: 0 };
  const matches = transformStr.match(/translate\(([^,\s]+)[,\s]+([^)]+)\)/);
  if (matches && matches.length === 3) {
    return { x: parseFloat(matches[1]), y: parseFloat(matches[2]) };
  }
  return { x: 0, y: 0 };
}

/**
 * Custom hook to isolate and manage node interactions (hover tooltips, selection events,
 * and high-performance drag-and-drop mechanics using RAF).
 */
export function useTopologyInteraction({ svgRef, viewportState }) {
  // Hover & Tooltip State
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Dragging State
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [nodePositions, setNodePositions] = useState({});

  const currentDragPosRef = useRef(null);
  const rafId = useRef(null);

  // Hover Handlers
  const handleNodeMouseEnter = useCallback(
    (e, node) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      setHoveredNode(node);
      setTooltipPos({
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top + 15,
      });
    },
    [svgRef]
  );

  const handleNodeMouseMove = useCallback(
    (e) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top + 15,
      });
    },
    [svgRef]
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  // Node Drag Life Cycle
  const handleNodeMouseDown = useCallback((e, nodeId) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);

    // Read the current position of the node
    const nodeEl = document.getElementById(`node-${nodeId}`);
    if (nodeEl) {
      currentDragPosRef.current = parseTranslation(nodeEl.getAttribute("transform"));
    }
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!draggedNodeId || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const { zoom, pan } = viewportState;

      // Calculate coordinates relative to SVG canvas container taking zoom and pan into account
      const canvasX = (e.clientX - rect.left - pan.x) / zoom;
      const canvasY = (e.clientY - rect.top - pan.y) / zoom;

      currentDragPosRef.current = { x: canvasX, y: canvasY };

      // Request Animation Frame to optimize painting performance
      if (!rafId.current) {
        rafId.current = window.requestAnimationFrame(() => {
          // Direct DOM update on the node element
          const nodeEl = document.getElementById(`node-${draggedNodeId}`);
          if (nodeEl) {
            nodeEl.setAttribute(
              "transform",
              `translate(${currentDragPosRef.current.x}, ${currentDragPosRef.current.y})`
            );
          }

          // Direct DOM update on all connected links
          const linkEls = document.querySelectorAll(
            `[data-source="${draggedNodeId}"], [data-target="${draggedNodeId}"]`
          );
          linkEls.forEach((linkEl) => {
            const sourceId = linkEl.getAttribute("data-source");
            const targetId = linkEl.getAttribute("data-target");

            const sourceEl = document.getElementById(`node-${sourceId}`);
            const targetEl = document.getElementById(`node-${targetId}`);

            if (sourceEl && targetEl) {
              const srcPos = parseTranslation(sourceEl.getAttribute("transform"));
              const tgtPos = parseTranslation(targetEl.getAttribute("transform"));

              const midY = (srcPos.y + tgtPos.y) / 2;
              const pathD = `M ${srcPos.x},${srcPos.y} C ${srcPos.x},${midY} ${tgtPos.x},${midY} ${tgtPos.x},${tgtPos.y}`;
              linkEl.setAttribute("d", pathD);
            }
          });

          rafId.current = null;
        });
      }
    },
    [draggedNodeId, svgRef, viewportState]
  );

  const handleMouseUp = useCallback(() => {
    if (draggedNodeId && currentDragPosRef.current) {
      setNodePositions((prev) => ({
        ...prev,
        [draggedNodeId]: currentDragPosRef.current,
      }));
    }
    setDraggedNodeId(null);
    if (rafId.current) {
      window.cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, [draggedNodeId]);

  const resetPositions = useCallback(() => {
    setNodePositions({});
  }, []);

  return {
    state: {
      hoveredNode,
      tooltipPos,
      draggedNodeId,
      nodePositions,
    },
    actions: {
      setNodePositions,
      handleNodeMouseEnter,
      handleNodeMouseMove,
      handleNodeMouseLeave,
      handleNodeMouseDown,
      handleMouseMove,
      handleMouseUp,
      resetPositions,
    },
  };
}
