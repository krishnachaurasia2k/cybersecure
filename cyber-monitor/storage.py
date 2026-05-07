import csv
import os

LOG_FILE = "logs/network_logs.csv"

os.makedirs("logs", exist_ok=True)


def setup_log_file():
    with open(LOG_FILE, "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([
            "Time",
            "Source IP",
            "Destination IP",
            "Protocol",
            "Port",
            "Risk"
        ])


def save_log(packet_info):
    with open(LOG_FILE, "a", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([
            packet_info["time"],
            packet_info["source_ip"],
            packet_info["destination_ip"],
            packet_info["protocol"],
            packet_info["port"],
            packet_info["risk"]
        ])
