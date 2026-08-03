/**
 * Hierarchical layout algorithm for network topology.
 * Places nodes in 4 vertical levels:
 * - Level 0: WAN Link
 * - Level 1: Routers
 * - Level 2: Core Switch (or fallback virtual switch)
 * - Level 3: Endpoints
 *
 * Computes default coordinates and overlays custom dragged node positions.
 *
 * @param {Object} topoData - Raw topology data with devices and links
 * @param {Object} nodePositions - Key-value map of custom user-dragged coordinates { [id]: { x, y } }
 * @returns {Object} { nodes: Array, links: Array }
 */
export function calculateHierarchicalLayout(topoData, nodePositions = {}) {
  if (!topoData) return { nodes: [], links: [] };

  const { devices = [], links: rawLinks = [] } = topoData;

  const initialNodes = [
    {
      id: "internet_wan",
      hostname: "Internet WAN",
      ip_address: "WAN Link",
      device_type: "WAN",
      status: "Healthy",
      vendor: "Provider",
      level: 0,
      cpu: "N/A",
      ram: "N/A",
      latency: "1 ms",
      uptime: "365 Days",
      defaultX: 500,
      defaultY: 50,
    },
  ];

  // Classify
  const routers = devices.filter(
    (d) => d.device_type?.toLowerCase().includes("router") || d.ip_address?.endsWith(".1")
  );
  const switches = devices.filter(
    (d) =>
      d.device_type?.toLowerCase().includes("switch") ||
      d.hostname?.toLowerCase().includes("switch")
  );
  const endpoints = devices.filter((d) => !routers.includes(d) && !switches.includes(d));

  // Position Routers (Level 1)
  routers.forEach((r, idx) => {
    const step = 1000 / (routers.length + 1);
    initialNodes.push({
      ...r,
      level: 1,
      cpu: "12%",
      ram: "34%",
      latency: "2 ms",
      uptime: "45 Days",
      defaultX: (idx + 1) * step,
      defaultY: 140,
    });
  });

  // Core Switches (Level 2)
  const switchCount = switches.length > 0 ? switches.length : 1;
  if (switches.length === 0 && endpoints.length > 0) {
    initialNodes.push({
      id: "virtual_switch",
      hostname: "Core-Switch-01",
      ip_address: "192.168.29.2",
      device_type: "Switch",
      status: "Healthy",
      vendor: "Cisco (Virtual)",
      level: 2,
      cpu: "18%",
      ram: "45%",
      latency: "1 ms",
      uptime: "12 Days",
      defaultX: 500,
      defaultY: 250,
    });
  } else {
    switches.forEach((sw, idx) => {
      const step = 1000 / (switchCount + 1);
      initialNodes.push({
        ...sw,
        level: 2,
        cpu: "25%",
        ram: "50%",
        latency: "2 ms",
        uptime: "90 Days",
        defaultX: (idx + 1) * step,
        defaultY: 250,
      });
    });
  }

  // Endpoints (Level 3)
  endpoints.forEach((ep, idx) => {
    const step = 1000 / (endpoints.length + 1);
    initialNodes.push({
      ...ep,
      level: 3,
      cpu: ep.status === "Offline" ? "0%" : "8%",
      ram: ep.status === "Offline" ? "0%" : "28%",
      latency: ep.status === "Offline" ? "Timed Out" : "4 ms",
      uptime: ep.status === "Offline" ? "0 Days" : "15 Days",
      defaultX: (idx + 1) * step,
      defaultY: 370,
    });
  });

  // Map final node array with dragged state or default
  const mappedNodes = initialNodes.map((n) => {
    const pos = nodePositions[n.id];
    return {
      ...n,
      x: pos ? pos.x : n.defaultX,
      y: pos ? pos.y : n.defaultY,
    };
  });

  // Establish links
  const calculatedLinks = [];
  const l1Routers = mappedNodes.filter((n) => n.level === 1);
  const l2Switches = mappedNodes.filter((n) => n.level === 2);
  const l3Endpoints = mappedNodes.filter((n) => n.level === 3);

  // WAN -> Routers
  l1Routers.forEach((r) => {
    calculatedLinks.push({
      id: `wan-${r.id}`,
      source: "internet_wan",
      target: r.id,
      linkType: "Trunk",
    });
  });

  // Routers -> Switches
  l1Routers.forEach((r) => {
    l2Switches.forEach((s) => {
      calculatedLinks.push({
        id: `${r.id}-${s.id}`,
        source: r.id,
        target: s.id,
        linkType: "Trunk",
      });
    });
  });

  // Switches -> Endpoints
  l3Endpoints.forEach((e) => {
    const parentSwitch = l2Switches[0] || { id: "virtual_switch" };
    calculatedLinks.push({
      id: `${parentSwitch.id}-${e.id}`,
      source: parentSwitch.id,
      target: e.id,
      linkType: e.device_type?.toLowerCase().includes("wireless")
        ? "Wireless"
        : "Ethernet",
    });
  });

  // LLDP links
  rawLinks.forEach((rl) => {
    const targetNode = mappedNodes.find(
      (n) => n.hostname?.toLowerCase() === rl.neighbor_name?.toLowerCase()
    );
    if (targetNode) {
      calculatedLinks.push({
        id: `lldp-${rl.device_id}-${targetNode.id}`,
        source: rl.device_id,
        target: targetNode.id,
        label: rl.local_port,
        linkType: "Trunk",
        isLLDP: true,
      });
    }
  });

  return { nodes: mappedNodes, links: calculatedLinks };
}
