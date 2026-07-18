import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request

DB_PATH = Path(__file__).parent / "db.sqlite3"
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

app = Flask(__name__)


def get_connection():
    return sqlite3.connect(DB_PATH)


def init_db():
    with get_connection() as conn:
        conn.execute(
            "CREATE TABLE IF NOT EXISTS health_check ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "checked_at TEXT NOT NULL)"
        )
        conn.execute(
            "CREATE TABLE IF NOT EXISTS users ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "username TEXT NOT NULL UNIQUE, "
            "email TEXT NOT NULL UNIQUE, "
            "created_at TEXT NOT NULL)"
        )


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.get("/api/db-check")
def db_check():
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        conn.execute("INSERT INTO health_check (checked_at) VALUES (?)", (now,))
        row = conn.execute(
            "SELECT checked_at FROM health_check ORDER BY id DESC LIMIT 1"
        ).fetchone()
    return jsonify(status="ok", dbTime=row[0])


@app.post("/api/users")
def create_user():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip()

    if not username or not email:
        return jsonify(status="error", message="username and email are required"), 400
    if not EMAIL_RE.match(email):
        return jsonify(status="error", message="invalid email format"), 400

    now = datetime.now(timezone.utc).isoformat()
    try:
        with get_connection() as conn:
            conn.execute(
                "INSERT INTO users (username, email, created_at) VALUES (?, ?, ?)",
                (username, email, now),
            )
    except sqlite3.IntegrityError:
        return jsonify(status="error", message="username or email already exists"), 409

    return jsonify(status="ok", username=username, email=email), 201


if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=5000)
