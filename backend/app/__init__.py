# pyrefly: ignore [missing-import]
from flask import Flask, jsonify, request
from flask_cors import CORS
import time
import os

START_TIME = time.time()

from .settings import Settings
from .database.db import init_db
from .routes.discovery import discovery_bp
from .routes.assets import assets_bp
from .routes.dashboard import dashboard_bp
from .routes.monitoring import monitoring_bp
from .routes.report import reports_bp
from .routes.intelligence import intelligence_bp
from .routes.workspace import workspace_bp
from .routes.timeline import timeline_bp
from .routes.asset_knowledge import passport_bp
from .routes.runbook import runbook_bp
from .routes.automation import automation_bp
from .routes.snmp import snmp_bp
from .routes.auth import auth_bp
from .routes.config_center import config_center_bp
from .routes.vault import vault_bp
from .services.monitoring_service import start_monitoring_engine


def create_app() -> Flask:
    settings = Settings.from_environment()
    app = Flask(__name__)
    app.config["APP_NAME"] = settings.app_name

    # Initialize SQLite Database tables
    init_db()

    # Start background monitoring daemon thread
    start_monitoring_engine()

    # Configure CORS dynamically based on settings
    CORS(app, resources={r"/api/*": {
        "origins": settings.cors_origins,
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }})

    # Register blueprints
    app.register_blueprint(discovery_bp)
    app.register_blueprint(assets_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(monitoring_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(intelligence_bp)
    app.register_blueprint(workspace_bp)
    app.register_blueprint(timeline_bp)
    app.register_blueprint(passport_bp)
    app.register_blueprint(runbook_bp)
    app.register_blueprint(automation_bp)
    app.register_blueprint(snmp_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(config_center_bp)
    app.register_blueprint(vault_bp)

    # Centralized Security and Generic Error Handlers
    from .utils.security import SecurityValidationError, log_security_event

    @app.errorhandler(SecurityValidationError)
    def handle_security_validation_error(e):
        log_security_event(
            event_name="request_validation_failure",
            status="blocked",
            details={"message": e.message, "path": request.path},
            level="WARNING"
        )
        return jsonify({
            "status": "error",
            "message": e.message
        }), 400

    @app.errorhandler(Exception)
    def handle_uncaught_exception(e):
        app.logger.error(f"[SYSTEM ERROR] Unhandled exception: {e}", exc_info=True)
        return jsonify({
            "status": "error",
            "message": "An internal application error occurred."
        }), 500

    @app.after_request
    def add_security_headers(response):
        # Dynamic CORS header fallback matching the whitelist
        origin = request.headers.get("Origin", "")
        if origin:
            if "*" in settings.cors_origins:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
            elif origin in settings.cors_origins:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"

        # Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = settings.security_csp

        # Configure HSTS dynamically; avoid HSTS lockout on local dev environments
        is_local = request.host.startswith("localhost") or request.host.startswith("127.0.0.1")
        if settings.security_hsts_enabled and not is_local:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response

    @app.get("/api/health")
    def health_check():
        try:
            from .database.db import get_db_connection
            conn = get_db_connection()
            conn.execute("SELECT 1")
            conn.close()
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"

        uptime_seconds = time.time() - START_TIME

        return jsonify({
            "status": "healthy" if db_status == "connected" else "degraded",
            "database": db_status,
            "version": "1.0.0",
            "uptime": round(uptime_seconds, 1),
            "environment": os.getenv("FLASK_ENV", "development")
        })

    @app.get("/api/version")
    def get_version():
        return jsonify({
            "version": "1.0.0"
        })

    @app.get("/api/system")
    def get_system_status():
        try:
            from .database.db import get_db_connection
            conn = get_db_connection()
            conn.execute("SELECT 1")
            conn.close()
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"

        uptime_seconds = time.time() - START_TIME

        return jsonify({
            "database": db_status,
            "uptime_seconds": round(uptime_seconds, 1),
            "build": "production-ready-v1.0.0",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
        })

    return app
