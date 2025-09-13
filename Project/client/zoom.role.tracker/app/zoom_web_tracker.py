from flask import Flask, request
from .backend import tracker, TRACKED_ROLES
from .config import HOST, PORT, DEBUG
from .utils import verify_webhook, json_ok, json_err

app = Flask(__name__)

@app.get("/health")
def health():
    return json_ok({"status": "alive"})

@app.get("/calls")
def get_calls():
    return json_ok({"calls": tracker.get_calls()})

@app.post("/reset")
def reset():
    payload = request.get_json(silent=True) or {}
    idx = payload.get("index")
    if idx is None:
        tracker.reset()
    else:
        try:
            tracker.reset(int(idx))
        except Exception as e:
            return json_err(str(e), 400)
    return json_ok({"message": "reset"})

@app.post("/map-call")
def map_call():
    data = request.get_json(silent=True) or {}
    meeting_id = data.get("meeting_id")
    index = data.get("index")
    if meeting_id is None or index is None:
        return json_err("meeting_id and index required", 400)
    try:
        tracker.set_mapping(str(meeting_id), int(index))
    except Exception as e:
        return json_err(str(e), 400)
    return json_ok({"message": "mapped", "meeting_id": meeting_id, "index": index})

@app.post("/increment")
def increment():
    data = request.get_json(silent=True) or {}
    index = data.get("index")
    roles = data.get("roles", [])
    if index is None:
        return json_err("index required", 400)
    if not isinstance(roles, list):
        return json_err("roles must be a list", 400)
    try:
        tracker.increment_roles(int(index), roles)
    except Exception as e:
        return json_err(str(e), 400)
    return json_ok({"message": "incremented", "index": index, "roles": roles})

@app.post("/zoom-webhook")
def zoom_webhook():
    # Basic verification (placeholder)
    if not verify_webhook(request):
        return json_err("unauthorized", 401)

    event = request.json or {}
    payload = event.get("payload", {})
    obj = payload.get("object", {})

    meeting_id = str(obj.get("id") or obj.get("uuid") or "unknown")
    call_index = tracker.get_index_for_meeting(meeting_id)
    if call_index is None:
        # Fallback: simple deterministic assignment
        call_index = (abs(hash(meeting_id)) % 3)

    # Example: count participants by role field if provided,
    # else default to 'person'. Adjust mapping as needed for your Zoom app data.
    participants = obj.get("participants", []) or obj.get("participant_data", [])
    roles_to_increment = []
    for p in participants:
        role = p.get("role") or "person"
        if role not in TRACKED_ROLES:
            role = "person"
        roles_to_increment.append(role)

    if roles_to_increment:
        tracker.increment_roles(call_index, roles_to_increment)

    return json_ok({"meeting_id": meeting_id, "index": call_index, "added": roles_to_increment})

if __name__ == "__main__":
    app.run(host=HOST, port=PORT, debug=DEBUG)