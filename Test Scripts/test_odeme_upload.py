import requests
import os

# Define the base URL of your FastAPI application
BASE_URL = "http://localhost:8000"

# Define the path to the CSV file
# Assuming Odeme-small.csv is in the same directory as this script
CSV_FILE_PATH = "Odeme-small.csv"

# Define a Sube_ID for testing. IMPORTANT: Replace with a valid Sube_ID.
SUBE_ID = 1 # YOUR_SUBE_ID_HERE

def test_upload_odeme_csv():
    if not os.path.exists(CSV_FILE_PATH):
        print(f"Error: CSV file not found at {CSV_FILE_PATH}")
        return

    url = f"{BASE_URL}/api/v1/odeme/upload-csv/?sube_id={SUBE_ID}"

    try:
        with open(CSV_FILE_PATH, "rb") as f:
            files = {"file": (CSV_FILE_PATH, f, "text/csv")}
            print(f"Sending POST request to {url} with file {CSV_FILE_PATH} and Sube_ID {SUBE_ID}...")
            response = requests.post(url, files=files)

        print(f"Status Code: {response.status_code}")
        print(f"Response JSON: {response.json()}")

        if response.status_code == 201:
            print("CSV upload successful!")
        else:
            print("CSV upload failed.")

    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the FastAPI application. Is it running?")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    test_upload_odeme_csv()
