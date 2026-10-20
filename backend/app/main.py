"""
Main FastAPI Application Entrypoint.
Initializes database tables, configures CORS, mounts API routes,
and provides startup health instrumentation.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.database.connection import Base, engine
from backend.app.api.routes import router as api_router
from backend.app.models.db_models import ResourceModel
import json
import os


# Ensure tables exist immediately upon module load
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database Schema
    Base.metadata.create_all(bind=engine)

    # Seed resources into database if table is empty
    catalog_path = os.path.join(settings.DATA_DIR, "raw", "health_resources.json")
    if os.path.exists(catalog_path):
        from backend.app.database.connection import SessionLocal
        db = SessionLocal()
        try:
            count = db.query(ResourceModel).count()
            if count == 0:
                with open(catalog_path, "r", encoding="utf-8") as f:
                    resources = json.load(f)
                for r in resources:
                    db_res = ResourceModel(
                        item_id=r["item_id"],
                        title=r["title"],
                        description=r["description"],
                        category=r["category"],
                        tags_json=json.dumps(r.get("tags", [])),
                        source=r["source"],
                        source_url=r["source_url"],
                        intended_audience=r.get("intended_audience"),
                        relevant_context=r.get("relevant_context"),
                        contraindication_notes=r.get("contraindication_notes"),
                        evidence_level=r.get("evidence_level"),
                        last_verified_at=r.get("last_verified_at")
                    )
                    db.add(db_res)
                db.commit()
                print(f"[+] Seeded {len(resources)} educational resources into database.")
        except Exception as e:
            print(f"[!] Database seed notice: {e}")
            db.rollback()
        finally:
            db.close()

    yield
    # Shutdown logic if any
    print("[*] Application shutdown gracefully.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Advanced Personalized Healthcare Recommendation Analytics with Hybrid Machine Learning, Risk Stratification, and Safety-Aware Filtering.",
    lifespan=lifespan
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes under both /api and /api/v1
app.include_router(api_router, prefix=settings.API_PREFIX)
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_health": f"{settings.API_PREFIX}/health",
        "database": "MySQL"
    }


@app.get("/api/v1/models")
@app.get("/api/models")
def get_models_alias():
    from backend.app.api.routes import get_model_version
    return get_model_version()


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": str(exc),
            "path": request.url.path
        }
    )
