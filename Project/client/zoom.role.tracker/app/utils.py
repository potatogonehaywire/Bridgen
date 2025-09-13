    from flask import request, jsonify
    from .config import WEBHOOK_SECRET

    def verify_webhook(req: request) -> bool:
        """
        Placeholder verifier. In production,
        use Zoom's recommended verification (e.g., secret token or signature).
        """
        token = req.headers.get("X-Zoom-Token", "")
        return token == WEBHOOK_SECRET

    def json_ok(payload=None, status=200):
        return jsonify({"ok": True, "data": payload}), status

    def json_err(message, status=400):
        return jsonify({"ok": False, "error": message}), status