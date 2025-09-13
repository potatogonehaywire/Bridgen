    import tkinter as tk
    from tkinter import ttk, messagebox
    import requests
    import threading
    import time

    API = "http://127.0.0.1:5055"

    def api_get(path):
        r = requests.get(API + path, timeout=5)
        r.raise_for_status()
        return r.json()["data"]

    def api_post(path, json):
        r = requests.post(API + path, json=json, timeout=5)
        r.raise_for_status()
        return r.json()["data"]

    class App(tk.Tk):
        def __init__(self):
            super().__init__()
            self.title("Zoom Role Tracker")
            self.geometry("520x420")
            self.resizable(False, False)

            self.meeting_ids = ["", "", ""]
            self._build_ui()
            self._start_refresh_loop()

        def _build_ui(self):
            title = ttk.Label(self, text="Select a call and then map a Meeting ID", font=("Arial", 15))
            title.pack(pady=10)

            self.frames = []
            for i in range(3):
                f = ttk.Frame(self, padding=10)
                f.pack(fill="x", pady=5)

                ttk.Label(f, text=f"Call {i+1}", width=8).grid(row=0, column=0, sticky="w")
                ttk.Label(f, text="Meeting ID:").grid(row=0, column=1, sticky="e")
                eid = ttk.Entry(f, width=24)
                eid.grid(row=0, column=2, padx=5)
                map_btn = ttk.Button(f, text="Map", command=lambda idx=i, e=eid: self.map_meeting(idx, e.get()))
                map_btn.grid(row=0, column=3, padx=5)

                        join_btn = ttk.Button(f, text="Simulate Join", command=lambda idx=i: self.simulate_join(idx))
                        join_btn.grid(row=0, column=4, padx=5)

                        counts = ttk.Label(f, text="person: 0 | teacher: 0 | is_youth: 0 | tutor: 0")
                        counts.grid(row=1, column=0, columnspan=5, sticky="w", pady=5)

                        self.frames.append((eid, counts))

                    btns = ttk.Frame(self, padding=10)
                    btns.pack(fill="x", pady=5)
                    ttk.Button(btns, text="Reset All", command=self.reset_all).pack(side="left", padx=5)
                    ttk.Button(btns, text="Refresh Now", command=self.refresh_counts).pack(side="left", padx=5)
                    ttk.Label(self, text="Tip: Run the camera detector to increment roles via webcam.", foreground="#666").pack(pady=5)

                def map_meeting(self, idx, meeting_id):
                    if not meeting_id:
                        messagebox.showerror("Error", "Enter a Meeting ID first.")
                        return
                    try:
                        api_post("/map-call", {"meeting_id": meeting_id, "index": idx})
                        self.meeting_ids[idx] = meeting_id
                        messagebox.showinfo("Mapped", f"Meeting {meeting_id} -> Call {idx+1}")
                    except Exception as e:
                        messagebox.showerror("Error", str(e))

                def simulate_join(self, idx):
                    # Simulate clicking a “Join Room”: increment a default person role
                    try:
                        api_post("/increment", {"index": idx, "roles": ["person"]})
                        self.refresh_counts()
                    except Exception as e:
                        messagebox.showerror("Error", str(e))

                def reset_all(self):
                    try:
                        api_post("/reset", {})
                        self.refresh_counts()
                    except Exception as e:
                        messagebox.showerror("Error", str(e))

                def refresh_counts(self):
                    try:
                        data = api_get("/calls")
                        calls = data["calls"]
                        for i, (_, counts_lbl) in enumerate(self.frames):
                            c = calls[i]
                            counts_lbl.config(text=f"person: {c['person']} | teacher: {c['teacher']} | is_youth: {c['is_youth']} | tutor: {c['tutor']}")
                    except Exception as e:
                        # Silent fail into status bar
                        print("Refresh error:", e)

                    def _start_refresh_loop(self):
                    def loop():
                        while True:
                            time.sleep(2)
                            self.refresh_counts()
                    t = threading.Thread(target=loop, daemon=True)
                    t.start()

                    if __name__ == "__main__":
                    App().mainloop()