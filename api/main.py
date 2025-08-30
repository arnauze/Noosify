import os
import psycopg2

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, status, HTTPException
from passlib.hash import bcrypt
from typing import List
from utils import extract_text

from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_google_genai import ChatGoogleGenerativeAI

from models import CreateUser, LogUser

POSTGRES_CONN = {
    "host": os.getenv("PGHOST", "db"),
    "database": os.getenv("PGDATABASE", "postgres"),
    "user": os.getenv("PGUSER", "postgres"),
    "password": os.getenv("PGPASSWORD", "postgres"),
    "port": os.getenv("PGPORT", "5432")
}

# Instantiation du LLM
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
prompt = PromptTemplate(
    input_variables=["text"],
    template="Fais moi un résumé simple et concis de ce texte:\n\n{text}"
)
chain = LLMChain(llm=llm, prompt=prompt)

app = FastAPI()

@app.post("/users/create")
def create_user(body: CreateUser):
    """
    Create a new user in the system.

    - Hashes the provided password using bcrypt
    - Inserts the new user into the database.
    - Returns the created username.

    Args:
        body (CreateUser): Pydantic model containing `username` and `password`.

    Returns:
        dict: {
            "success": True,
            "user": {"username": str},
            "error": None
        }

    Raises:
        HTTPException: 500 if database insert fails.
    """
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
            "username": ret[0]
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
    """
    Authenticate a user by verifying credentials.

    - Checks if the provided username exists.
    - Verifies the password against the stored bcrypt hash.
    - Returns the username if authentication succeeds.

    Args:
        body (LogUser): Pydantic model containing `username` and `password`.

    Returns:
        dict: {
            "success": True,
            "user": {"username": str}
        }

    Raises:
        HTTPException:
            - 401 if invalid credentials.
            - 500 if database query fails.
    """
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

@app.get("/users/{userId}")
async def get_user(userId: str):
    """
    Retrieve user details along with their uploaded documents.

    - Fetches username and associated documents from the database.

    Args:
        userId (str): The username to look up.

    Returns:
        dict: {
            "success": True,
            "user": {
                "username": str,
                "documents": List[dict]
            }
        }

    Raises:
        HTTPException:
            - 401 if username not found.
            - 500 if database query fails.
    """
    try:
        conn = psycopg2.connect(**POSTGRES_CONN)
        cur = conn.cursor()

        cur.execute("""
            SELECT 
                u.username,
                u.password,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', d.id,
                            'summary', d.summary,
                            'filename', d.filename,
                            'updated_at', d.updated_at
                        ) 
                    ) FILTER (WHERE d.id IS NOT NULL),
                    '[]'::json
                ) AS documents
            FROM users u
            LEFT JOIN document d ON u.username = d.user_id
            WHERE u.username = %s
            GROUP BY u.username, u.password;
        """, (userId,))
        ret = cur.fetchone()
        cur.close()
        conn.close()

        if not ret:
            raise HTTPException(status_code=401, detail="Invalid username")

        username, hashed_password, documents = ret

        return {"success": True, "user": {"username": username, "documents": documents}}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error when getting user: {e}",
        )

@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...), username: str = Form(...)):
    """
    Upload and summarize documents for a user.

    - Accepts multiple file types (PDF, DOCX, TXT).
    - Extracts text content using helper function `extract_text`.
    - Summarizes the content with the LLM chain.
    - Stores document info (summary, filename) in the database.

    Args:
        files (List[UploadFile]): Uploaded files.
        username (str): The user who uploaded the files.

    Returns:
        dict: {
            "success": True
        }

    Raises:
        HTTPException: 500 if processing or database insertion fails.
    """
    summary = ""
    try:

        conn = psycopg2.connect(**POSTGRES_CONN)
        cur = conn.cursor()

        for file in files:
            text = await extract_text(file)

            # Generate summary with LLM
            summary = await chain.arun(text=text)

            cur.execute(
                "INSERT INTO document (user_id, summary, filename) VALUES (%s, %s, %s) RETURNING id",
                (username, summary, file.filename)
            )
            
        conn.commit()
        cur.close()
        conn.close()
            
        return {"success": True}

    except Exception as e:
        print("ERROR:")
        print(e)
        raise HTTPException(status_code=500, detail=str(e))