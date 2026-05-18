import sys
from mac_vendor_lookup import MacLookup
mac = MacLookup()
try:
    print(mac.lookup("00:80:41:ae:fd:7e"))
except Exception as e:
    print(f"Error: {e}")
