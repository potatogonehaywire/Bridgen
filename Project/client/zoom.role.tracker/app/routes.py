from flask import request
from .bad_words import sanitize_message, contains_bad_words

@api_bp.post("/chat")
def chat():
    data = request.get_json(silent=True) or {}
    msg = data.get("message", "").strip()
    if not msg:
        return jsonify({"ok": False, "error": "Empty message"}), 400

    if contains_bad_words(msg):
        return jsonify({"ok": True, "filtered": True, "message": sanitize_message(msg)}), 200
    else:
        return jsonify({"ok": True, "filtered": False, "message": msg}), 200