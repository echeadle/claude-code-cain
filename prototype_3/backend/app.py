import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request

DB_PATH = Path(__file__).parent / "db.sqlite3"
VALID_RATINGS = {"up", "down"}

app = Flask(__name__)


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    with get_connection() as conn:
        conn.execute(
            "CREATE TABLE IF NOT EXISTS songs ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "artist TEXT NOT NULL, "
            "title TEXT NOT NULL, "
            "album TEXT, "
            "thumbs_up INTEGER NOT NULL DEFAULT 0, "
            "thumbs_down INTEGER NOT NULL DEFAULT 0, "
            "UNIQUE(artist, title))"
        )
        conn.execute(
            "CREATE TABLE IF NOT EXISTS ratings ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "song_id INTEGER NOT NULL REFERENCES songs(id), "
            "visitor_id TEXT NOT NULL, "
            "rating TEXT NOT NULL CHECK (rating IN ('up','down')), "
            "created_at TEXT NOT NULL, "
            "UNIQUE(song_id, visitor_id))"
        )


def get_or_create_song(conn, artist, title, album):
    conn.execute(
        "INSERT OR IGNORE INTO songs (artist, title, album) VALUES (?, ?, ?)",
        (artist, title, album),
    )
    row = conn.execute(
        "SELECT id, thumbs_up, thumbs_down FROM songs WHERE artist = ? AND title = ?",
        (artist, title),
    ).fetchone()
    return row


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.get("/api/songs/rating")
def get_rating():
    artist = (request.args.get("artist") or "").strip()
    title = (request.args.get("title") or "").strip()
    visitor_id = (request.args.get("visitor_id") or "").strip()

    if not artist or not title:
        return jsonify(status="error", message="artist and title are required"), 400

    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, thumbs_up, thumbs_down FROM songs WHERE artist = ? AND title = ?",
            (artist, title),
        ).fetchone()

        if row is None:
            return jsonify(status="ok", thumbs_up=0, thumbs_down=0, user_rating=None)

        song_id, thumbs_up, thumbs_down = row
        user_rating = None
        if visitor_id:
            rating_row = conn.execute(
                "SELECT rating FROM ratings WHERE song_id = ? AND visitor_id = ?",
                (song_id, visitor_id),
            ).fetchone()
            if rating_row:
                user_rating = rating_row[0]

    return jsonify(
        status="ok", thumbs_up=thumbs_up, thumbs_down=thumbs_down, user_rating=user_rating
    )


@app.post("/api/songs/rate")
def rate_song():
    data = request.get_json(silent=True) or {}
    artist = (data.get("artist") or "").strip()
    title = (data.get("title") or "").strip()
    album = (data.get("album") or "").strip() or None
    visitor_id = (data.get("visitor_id") or "").strip()
    rating = (data.get("rating") or "").strip()

    if not artist or not title or not visitor_id:
        return jsonify(status="error", message="artist, title, and visitor_id are required"), 400
    if rating not in VALID_RATINGS:
        return jsonify(status="error", message="rating must be 'up' or 'down'"), 400

    now = datetime.now(timezone.utc).isoformat()

    with get_connection() as conn:
        song_id, thumbs_up, thumbs_down = get_or_create_song(conn, artist, title, album)

        try:
            conn.execute(
                "INSERT INTO ratings (song_id, visitor_id, rating, created_at) VALUES (?, ?, ?, ?)",
                (song_id, visitor_id, rating, now),
            )
        except sqlite3.IntegrityError:
            existing = conn.execute(
                "SELECT rating FROM ratings WHERE song_id = ? AND visitor_id = ?",
                (song_id, visitor_id),
            ).fetchone()
            return (
                jsonify(
                    status="error",
                    message="you have already rated this song",
                    thumbs_up=thumbs_up,
                    thumbs_down=thumbs_down,
                    user_rating=existing[0] if existing else None,
                ),
                409,
            )

        column = "thumbs_up" if rating == "up" else "thumbs_down"
        conn.execute(f"UPDATE songs SET {column} = {column} + 1 WHERE id = ?", (song_id,))
        row = conn.execute(
            "SELECT thumbs_up, thumbs_down FROM songs WHERE id = ?", (song_id,)
        ).fetchone()

    return (
        jsonify(status="ok", thumbs_up=row[0], thumbs_down=row[1], user_rating=rating),
        201,
    )


if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=5000)
