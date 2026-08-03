"""
InfraGuard Enterprise Report API Routes.

Endpoints for generating and downloading PDF & CSV reports
using live SQLite infrastructure data.
"""

import logging
from flask import Blueprint, send_file, request, jsonify

from ..services.report_service import (
    generate_infrastructure_summary_pdf,
    generate_asset_inventory_pdf,
    generate_asset_inventory_csv,
    generate_discovery_history_pdf,
    generate_discovery_history_csv,
    generate_monitoring_summary_pdf,
)

logger = logging.getLogger("infraguard.routes.reports")
reports_bp = Blueprint("reports", __name__, url_prefix="/api/v1/reports")


# ─── PDF Endpoints ────────────────────────────────────────────────────────────

@reports_bp.route("/infrastructure-summary/pdf", methods=["GET", "OPTIONS"])
def download_infrastructure_summary_pdf():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    try:
        org = request.args.get("org", None)
        buf = generate_infrastructure_summary_pdf(org_name=org)
        return send_file(
            buf, mimetype="application/pdf",
            as_attachment=True,
            download_name="InfraGuard_Infrastructure_Summary.pdf",
        )
    except Exception as e:
        logger.error(f"[Report Error] Infrastructure Summary PDF: {e}")
        return jsonify({"status": "error", "message": "Failed to generate report."}), 500


@reports_bp.route("/asset-inventory/pdf", methods=["GET", "OPTIONS"])
def download_asset_inventory_pdf():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    try:
        org = request.args.get("org", None)
        buf = generate_asset_inventory_pdf(org_name=org)
        return send_file(
            buf, mimetype="application/pdf",
            as_attachment=True,
            download_name="InfraGuard_Asset_Inventory.pdf",
        )
    except Exception as e:
        logger.error(f"[Report Error] Asset Inventory PDF: {e}")
        return jsonify({"status": "error", "message": "Failed to generate report."}), 500


@reports_bp.route("/discovery-history/pdf", methods=["GET", "OPTIONS"])
def download_discovery_history_pdf():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    try:
        org = request.args.get("org", None)
        buf = generate_discovery_history_pdf(org_name=org)
        return send_file(
            buf, mimetype="application/pdf",
            as_attachment=True,
            download_name="InfraGuard_Discovery_History.pdf",
        )
    except Exception as e:
        logger.error(f"[Report Error] Discovery History PDF: {e}")
        return jsonify({"status": "error", "message": "Failed to generate report."}), 500


@reports_bp.route("/monitoring-summary/pdf", methods=["GET", "OPTIONS"])
def download_monitoring_summary_pdf():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    try:
        org = request.args.get("org", None)
        buf = generate_monitoring_summary_pdf(org_name=org)
        return send_file(
            buf, mimetype="application/pdf",
            as_attachment=True,
            download_name="InfraGuard_Monitoring_Summary.pdf",
        )
    except Exception as e:
        logger.error(f"[Report Error] Monitoring Summary PDF: {e}")
        return jsonify({"status": "error", "message": "Failed to generate report."}), 500


# ─── CSV Endpoints ────────────────────────────────────────────────────────────

@reports_bp.route("/asset-inventory/csv", methods=["GET", "OPTIONS"])
def download_asset_inventory_csv():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    try:
        data = generate_asset_inventory_csv()
        return (
            data,
            200,
            {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": "attachment; filename=InfraGuard_Asset_Inventory.csv",
            },
        )
    except Exception as e:
        logger.error(f"[Report Error] Asset Inventory CSV: {e}")
        return jsonify({"status": "error", "message": "Failed to generate CSV."}), 500


@reports_bp.route("/discovery-history/csv", methods=["GET", "OPTIONS"])
def download_discovery_history_csv():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    try:
        data = generate_discovery_history_csv()
        return (
            data,
            200,
            {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": "attachment; filename=InfraGuard_Discovery_History.csv",
            },
        )
    except Exception as e:
        logger.error(f"[Report Error] Discovery History CSV: {e}")
        return jsonify({"status": "error", "message": "Failed to generate CSV."}), 500
