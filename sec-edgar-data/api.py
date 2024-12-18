from fastapi import FastAPI, Query
from database.db_utils import get_connection
from typing import List
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

@app.get("/")
def root():
    return {"message": "SEC Data API is running!"}

@app.get("/search")
def search_companies(query: str = Query(..., min_length=1)):
    """
    Search companies by name or ticker.
    """
    sql = """
    SELECT name, ticker, cik
    FROM companies
    WHERE LOWER(name) LIKE %s OR LOWER(ticker) LIKE %s
    LIMIT 10;
    """
    values = (f"%{query.lower()}%", f"%{query.lower()}%")
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(sql, values)
        results = cursor.fetchall()
        cursor.close()
        conn.close()

        # Format results
        companies = [{"name": row[0], "ticker": row[1], "cik": row[2]} for row in results]
        return {"results": companies}

    except Exception as e:
        return {"error": str(e)}
