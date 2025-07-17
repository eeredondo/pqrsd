from supabase import create_client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase URL y/o Key no están definidos en variables de entorno")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
