from __future__ import annotations

BASELINE = {"temperature": 72, "vibration": 0.22, "rpm": 2500, "pressure": 30}

WEIGHTS = {"temperature": 0.35, "vibration": 0.35, "rpm": 0.15, "pressure": 0.15}

MAX_DEVIATION = {
    "temperature": 60,
    "vibration": 0.8,
    "rpm": 1500,
    "pressure": 40,
}


def compute_health(temperature: float, vibration: float, rpm: float, pressure: float) -> dict:
    readings = {"temperature": temperature, "vibration": vibration, "rpm": rpm, "pressure": pressure}
    penalty = 0.0
    for key, baseline in BASELINE.items():
        deviation = abs(readings[key] - baseline)
        capped = min(deviation / MAX_DEVIATION[key], 1.0)
        penalty += capped * WEIGHTS[key]
    health = max(0, round(100 - penalty * 100))
    prob = max(0, min(100, round(100 - health)))
    if health >= 85:
        level = "NORMAL"
    elif health >= 60:
        level = "WARNING"
    elif health >= 30:
        level = "ANOMALY"
    else:
        level = "CRITICAL"
    days = max(0, round(health / 15))
    return {
        "health_score": health,
        "failure_probability": prob,
        "risk_level": level,
        "estimated_days_remaining": days,
        "recommendation": "Schedule immediate maintenance" if level == "CRITICAL" else "Monitor closely" if level == "ANOMALY" else "No action needed",
    }
