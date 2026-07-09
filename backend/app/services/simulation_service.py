from __future__ import annotations
import random
import math
import time

MACHINE = "CNC-12"

BASELINE = {"temperature": 72, "vibration": 0.22, "rpm": 2500, "pressure": 30}

PHASE_CONFIG = {
    "normal":  {"mult": 1.0,  "jitter": 0.05},
    "warning": {"mult": 1.15, "jitter": 0.08},
    "anomaly": {"mult": 1.3,  "jitter": 0.10},
    "failure": {"mult": 1.5,  "jitter": 0.15},
}


def generate_reading(phase: str = "normal") -> dict:
    config = PHASE_CONFIG.get(phase, PHASE_CONFIG["normal"])
    ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    return {
        "timestamp": ts,
        "machine_id": MACHINE,
        "phase": phase.upper(),
        "temperature": round(BASELINE["temperature"] * config["mult"] * (1 + random.uniform(-config["jitter"], config["jitter"])), 1),
        "vibration": round(BASELINE["vibration"] * config["mult"] * (1 + random.uniform(-config["jitter"], config["jitter"])), 2),
        "rpm": int(BASELINE["rpm"] * config["mult"] * (1 + random.uniform(-config["jitter"], config["jitter"]))),
        "pressure": round(BASELINE["pressure"] * config["mult"] * (1 + random.uniform(-config["jitter"], config["jitter"])), 1),
    }
