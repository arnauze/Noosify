import os
import psycopg2

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, status, HTTPException
from passlib.hash import bcrypt
from typing import List
from utils import extract_text

from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_google_genai import ChatGoogleGenerativeAI
import asyncio

from models import CreateUser, LogUser

POSTGRES_CONN = {
    "host": os.getenv("PGHOST", "db"),
    "database": os.getenv("PGDATABASE", "postgres"),
    "user": os.getenv("PGUSER", "postgres"),
    "password": os.getenv("PGPASSWORD", "postgres"),
    "port": os.getenv("PGPORT", "5432")
}

# Create the LLM
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

# Prompt template for summarization
prompt = PromptTemplate(
    input_variables=["text"],
    template="Fais moi un résumé simple et concis de ce texte:\n\n{text}"
)
chain = LLMChain(llm=llm, prompt=prompt)

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