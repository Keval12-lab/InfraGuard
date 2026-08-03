import apiClient from "./apiClient";

const BASE = "/reports";

/**
 * Report service — triggers browser file downloads via the backend.
 * PDF endpoints return binary blobs; CSV endpoints return text.
 */
export const reportService = {
  downloadPdf: async (path, filename) => {
    const res = await apiClient.get(`${BASE}/${path}`, { responseType: "blob" });
    // apiClient interceptor unwraps .data, but for blobs we need the raw blob
    const blob = res instanceof Blob ? res : new Blob([res], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadCsv: async (path, filename) => {
    const res = await apiClient.get(`${BASE}/${path}`, { responseType: "blob" });
    const blob =
      res instanceof Blob ? res : new Blob([res], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // ─── Convenience wrappers ──────────────────────────────────────────
  infrastructureSummaryPdf: () =>
    reportService.downloadPdf(
      "infrastructure-summary/pdf",
      "InfraGuard_Infrastructure_Summary.pdf"
    ),

  assetInventoryPdf: () =>
    reportService.downloadPdf("asset-inventory/pdf", "InfraGuard_Asset_Inventory.pdf"),

  assetInventoryCsv: () =>
    reportService.downloadCsv("asset-inventory/csv", "InfraGuard_Asset_Inventory.csv"),

  discoveryHistoryPdf: () =>
    reportService.downloadPdf(
      "discovery-history/pdf",
      "InfraGuard_Discovery_History.pdf"
    ),

  discoveryHistoryCsv: () =>
    reportService.downloadCsv(
      "discovery-history/csv",
      "InfraGuard_Discovery_History.csv"
    ),

  monitoringSummaryPdf: () =>
    reportService.downloadPdf(
      "monitoring-summary/pdf",
      "InfraGuard_Monitoring_Summary.pdf"
    ),
};

export default reportService;
