---
description: Ensure the default python virtual environment is set up and active
---
1. Check if the virtual environment exists:
   ```bash
   ls .venv
   ```
2. If it does not exist, create it:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. If it exists, ensure it is activated in the current session (Antigravity should prefer using `.venv/bin/python` or sourcing activate).
