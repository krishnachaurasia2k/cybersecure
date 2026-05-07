from collections import defaultdict
import time

packet_count = defaultdict(list)

SUSPICIOUS_PORTS = [22, 23, 3389, 445] 


def detect_threat(source_ip, protocol, port):
    current_time = time.time()

    packet_count[source_ip].append(current_time)

    # keep only last 60 seconds traffic
    packet_count[source_ip] = [
        t for t in packet_count[source_ip]
        if current_time - t <= 60
    ]

    if port in SUSPICIOUS_PORTS:
        return "Suspicious Port"

    if len(packet_count[source_ip]) > 100:
        return "High Traffic"

    if protocol == "OTHER":
        return "Unknown Protocol"

    return "Normal"
