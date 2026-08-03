import { useState, useCallback } from "react";

/**
 * Custom hook to isolate and manage canvas zooming, panning, and background drags.
 * Exposes a clean 'state' and 'actions' API structure.
 */
export function useViewport() {
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.15, 2.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.15, 0.5));
  }, []);

  const handleResetZoom = useCallback((callback = null) => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    if (typeof callback === "function") {
      callback();
    }
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
      if (e.target.tagName === "svg" || e.target.id === "viewport-bg") {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    },
    [isPanning, panStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  return {
    state: {
      zoom,
      pan,
      isPanning,
      panStart,
    },
    actions: {
      setZoom,
      setPan,
      setIsPanning,
      handleZoomIn,
      handleZoomOut,
      handleResetZoom,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
    },
  };
}
