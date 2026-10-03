import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import executions, examples, ai

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AlgoViz API",
    description="Production-grade DSA Code Visualizer Platform Backend",
    version="1.0.0"
)

cors_env = os.getenv("CORS_ORIGINS", "*")
if cors_env.strip() == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()]
    for default_origin in ["http://localhost:3000", "http://127.0.0.1:3000"]:
        if default_origin not in allowed_origins:
            allowed_origins.append(default_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(executions.router)
app.include_router(examples.router)
app.include_router(ai.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "algoviz-api"}

if __name__ == "__main__":
    import uvicorn
    worker_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../services/execution-worker"))
    api_dir = os.path.dirname(os.path.abspath(__file__))
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, reload_dirs=[api_dir, worker_dir])
