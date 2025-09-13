from threading import Lock
from typing import Dict, List

TRACKED_ROLES = ["person", "teacher", "is_youth", "tutor"]

class ZoomCallTracker:
    def __init__(self, num_calls: int = 3):
        self.num_calls = num_calls
        self.calls: List[Dict[str, int]] = [
            {role: 0 for role in TRACKED_ROLES} for _ in range(num_calls)
        ]
        self.meeting_to_index: Dict[str, int] = {}
        self._lock = Lock()

    def reset(self, call_index: int = None):
        with self._lock:
            if call_index is None:
                for i in range(self.num_calls):
                    for role in TRACKED_ROLES:
                        self.calls[i][role] = 0
            else:
                for role in TRACKED_ROLES:
                    self.calls[call_index][role] = 0

    def set_mapping(self, meeting_id: str, index: int):
        if not (0 <= index < self.num_calls):
            raise ValueError("index out of range")
        with self._lock:
            self.meeting_to_index[meeting_id] = index

    def get_index_for_meeting(self, meeting_id: str) -> int:
        with self._lock:
            return self.meeting_to_index.get(meeting_id, None)

    def increment_roles(self, call_index: int, roles: List[str]):
        with self._lock:
            for r in roles:
                if r in TRACKED_ROLES:
                    self.calls[call_index][r] += 1

    def get_calls(self) -> List[Dict[str, int]]:
        with self._lock:
            return [dict(c) for c in self.calls]

# Global singleton
tracker = ZoomCallTracker()