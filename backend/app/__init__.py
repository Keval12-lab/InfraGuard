from flask import Flask, jsonify
from flask_cors import CORS

from .settings import Settings


def create_app() -> Flask:
    settings = Settings.from_environment()
    app = Flask(__name__)
    app.config["APP_NAME"] = settings.app_name

    CORS(app, resources={r"/api/*": {"origins": settings.cors_origins}})

    @app.get("/api/health")
    def health_check():
        return jsonify({
            "status": "ok",
            "message": "InfraGuard Backend Running",
        })

    return app