from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import init_db
from .routers import books

app = FastAPI(
    title="Les Histoires de BK",
    description="API pour générer des livres chapitre par chapitre avec l'aide de l'IA",
    version="1.0.0"
)

# Configuration CORS pour React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(books.router)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def root():
    return {
        "message": "Bienvenue sur l'API Les Histoires de BK",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {"status": "ok"}
