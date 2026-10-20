"""
Standalone Educational Catalog Builder Script.
Builds and validates the verified public health educational resource catalog (data/raw/health_resources.json)
derived from authenticated public clinical guidelines (NHLBI, AHA, ACSM, WHO, CDC).
"""

import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
CATALOG_DEST = os.path.join(BASE_DIR, "data", "raw", "health_resources.json")


def build_catalog():
    print(f"[*] Building educational catalog at {CATALOG_DEST}...")
    from scripts.download_data import build_verified_resource_catalog
    build_verified_resource_catalog()
    print("[+] Successfully compiled verified health resources catalog.")


if __name__ == "__main__":
    build_catalog()
