import sys
import os
import uvicorn

# Add project root to sys.path
project_root = os.path.dirname(__file__)
sys.path.insert(0, project_root)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)