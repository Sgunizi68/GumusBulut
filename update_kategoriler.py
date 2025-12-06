import sqlite3
import os
import sys

# Set stdout encoding to UTF-8
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Get the absolute path to the database file
db_path = os.path.abspath('backend/app.db')

try:
    # Connect to the SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # List tables
    print(f"Looking for tables in: {db_path}")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    if not tables:
        print("No tables found in the database.")
    else:
        print("Tables in the database:")
        for table in tables:
            print(f"- {table[0]}")

except sqlite3.Error as e:
    print(f"Database error: {e}")

finally:
    # Close the connection
    if conn:
        conn.close()
