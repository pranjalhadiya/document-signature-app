import os
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL:
    raise Exception("SUPABASE_URL not found")

if not SUPABASE_KEY:
    raise Exception("SUPABASE_KEY not found")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)