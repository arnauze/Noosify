import os
import psycopg2

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from passlib.hash import bcrypt

from models import CreateUser, LogUser

POSTGRES_CONN = {
    "host": os.getenv("PGHOST", "db"),
    "database": os.getenv("PGDATABASE", "postgres"),
    "user": os.getenv("PGUSER", "postgres"),
    "password": os.getenv("PGPASSWORD", "postgres"),
    "port": os.getenv("PGPORT", "5432")
}

app = FastAPI()

@app.post("/users/create")
def create_user(body: CreateUser):
    try:
        conn = psycopg2.connect(**POSTGRES_CONN)
        cur = conn.cursor()

        # hash password before storing
        hashed_password = bcrypt.hash(body.password)

        cur.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s) RETURNING username, password",
            (body.username, hashed_password)
        )

        # From tuple to dict
        ret = cur.fetchone()
        user = {
            "id": ret[0],
            "username": ret[1]
        }

        # Committing and closing the connection
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error while creating new user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error while creating new user: {e}",
        )

    return {"success": True, "user": user, "error": None}


@app.post("/users/login")
def login_user(body: LogUser):
    try:
        conn = psycopg2.connect(**POSTGRES_CONN)
        cur = conn.cursor()

        cur.execute("SELECT username, password FROM users WHERE username = %s", (body.username,))
        ret = cur.fetchone()
        cur.close()
        conn.close()

        if not ret:
            raise HTTPException(status_code=401, detail="Invalid username or password")

        username, hashed_password = ret

        # compare plain password with stored hash
        if not bcrypt.verify(body.password, hashed_password):
            raise HTTPException(status_code=401, detail="Invalid username or password")

        return {"success": True, "user": {"username": username}}
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during login: {e}",
        )