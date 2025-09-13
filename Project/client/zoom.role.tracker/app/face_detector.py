import tkinter as tk
from tkinter import ttk
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib.pyplot as plt
import requests
import threading
import time

API = "http://127.0.0.1:5055"

def fetch_calls():
    r = requests.get(API + "/calls", timeout=5)
    r.raise_for_status()
    return r.json()["data"]["calls"]

class Dashboard(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Role Distribution Dashboard")
        self.geometry("800x500")
        self._build_plot()
        self._start_refresh_loop()

    def _build_plot(self):
        self.fig, self.ax = plt.subplots(figsize=(8, 4))
        self.canvas = FigureCanvasTkAgg(self.fig, master=self)
        self.canvas_widget = self.canvas.get_tk_widget()
        self.canvas_widget.pack(fill="both", expand=True)
        self.ax.set_title("Role Distribution Across Calls")
        self.ax.set_ylabel("Count")

    def refresh(self):
        calls = fetch_calls()
        roles = ["person", "teacher", "is_youth", "tutor"]
        self.ax.clear()
        self.ax.set_title("Role Distribution Across Calls")
        self.ax.set_ylabel("Count")
        width = 0.2
        x = range(len(roles))
        for i, call in enumerate(calls):
            counts = [call[r] for r in roles]
            xs = [xi + i * width for xi in x]
            self.ax.bar(xs, counts, width=width, label=f"Call {i+1}")
        self.ax.set_xticks([xi + width for xi in x])
        self.ax.set_xticklabels(roles)
        self.ax.legend()
        self.canvas.draw()

    def _start_refresh_loop(self):
        def loop():
            while True:
                time.sleep(2)
                try:
                    self.refresh()
                except Exception:
                    pass
        threading.Thread(target=loop, daemon=True).start()

if __name__ == "__main__":
    Dashboard().mainloop()