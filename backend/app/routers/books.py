from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from ..models import Book, Chapter, get_db

router = APIRouter(prefix="/api/books", tags=["books"])

# Styles disponibles (sans appel API)
STYLES = [
    {"id": "narratif", "name": "Narratif", "description": "un style narratif classique, fluide et immersif"},
    {"id": "poetique", "name": "Poetique", "description": "un style poetique et lyrique, avec des metaphores"},
    {"id": "suspense", "name": "Suspense", "description": "un style thriller/suspense, avec du rythme et de la tension"},
    {"id": "jeunesse", "name": "Jeunesse", "description": "un style adapte aux enfants et adolescents"},
    {"id": "fantastique", "name": "Fantastique", "description": "un style fantastique/fantasy, atmosphere magique"},
    {"id": "humoristique", "name": "Humoristique", "description": "un style humoristique et leger"},
    {"id": "historique", "name": "Historique", "description": "un style historique avec attention aux details d'epoque"},
    {"id": "contemporain", "name": "Contemporain", "description": "un style moderne et realiste"}
]


class BookCreate(BaseModel):
    title: str
    description: Optional[str] = None
    original_text: str
    style: str = "narratif"


class ChapterCreate(BaseModel):
    original_content: str
    number: int


class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    original_content: Optional[str] = None
    generated_content: Optional[str] = None
    status: Optional[str] = None


class BookResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    original_text: Optional[str]
    style: str
    created_at: str
    chapters_count: int

    class Config:
        from_attributes = True


class ChapterResponse(BaseModel):
    id: int
    book_id: int
    number: int
    title: Optional[str]
    original_content: Optional[str]
    generated_content: Optional[str]
    status: str

    class Config:
        from_attributes = True


@router.get("/styles")
def list_styles():
    """Liste tous les styles disponibles."""
    return STYLES


@router.get("/pending-chapters")
def list_pending_chapters(db: Session = Depends(get_db)):
    """Liste tous les chapitres en attente de generation."""
    chapters = db.query(Chapter).filter(Chapter.status == "pending").all()
    result = []
    for chapter in chapters:
        book = db.query(Book).filter(Book.id == chapter.book_id).first()
        result.append({
            "chapter_id": chapter.id,
            "book_id": chapter.book_id,
            "book_title": book.title if book else "Inconnu",
            "book_style": book.style if book else "narratif",
            "book_description": book.description if book else "",
            "chapter_number": chapter.number,
            "original_content": chapter.original_content,
            "created_at": chapter.created_at.isoformat()
        })
    return result


@router.post("/", response_model=BookResponse)
def create_book(book: BookCreate, db: Session = Depends(get_db)):
    """Cree un nouveau livre."""
    db_book = Book(
        title=book.title,
        description=book.description,
        original_text=book.original_text,
        style=book.style
    )
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return BookResponse(
        id=db_book.id,
        title=db_book.title,
        description=db_book.description,
        original_text=db_book.original_text,
        style=db_book.style,
        created_at=db_book.created_at.isoformat(),
        chapters_count=0
    )


@router.get("/", response_model=List[BookResponse])
def list_books(db: Session = Depends(get_db)):
    """Liste tous les livres."""
    books = db.query(Book).all()
    return [
        BookResponse(
            id=book.id,
            title=book.title,
            description=book.description,
            original_text=book.original_text,
            style=book.style,
            created_at=book.created_at.isoformat(),
            chapters_count=len(book.chapters)
        )
        for book in books
    ]


@router.get("/{book_id}", response_model=BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)):
    """Recupere un livre par son ID."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Livre non trouve")
    return BookResponse(
        id=book.id,
        title=book.title,
        description=book.description,
        original_text=book.original_text,
        style=book.style,
        created_at=book.created_at.isoformat(),
        chapters_count=len(book.chapters)
    )


@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db)):
    """Supprime un livre."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Livre non trouve")
    db.delete(book)
    db.commit()
    return {"message": "Livre supprime"}


@router.get("/{book_id}/chapters", response_model=List[ChapterResponse])
def list_chapters(book_id: int, db: Session = Depends(get_db)):
    """Liste tous les chapitres d'un livre."""
    chapters = db.query(Chapter).filter(Chapter.book_id == book_id).order_by(Chapter.number).all()
    return [
        ChapterResponse(
            id=ch.id,
            book_id=ch.book_id,
            number=ch.number,
            title=ch.title,
            original_content=ch.original_content,
            generated_content=ch.generated_content,
            status=ch.status or "pending"
        )
        for ch in chapters
    ]


@router.post("/{book_id}/chapters", response_model=ChapterResponse)
def create_chapter(book_id: int, chapter: ChapterCreate, db: Session = Depends(get_db)):
    """Cree un nouveau chapitre (en attente de generation)."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Livre non trouve")

    db_chapter = Chapter(
        book_id=book_id,
        number=chapter.number,
        original_content=chapter.original_content,
        status="pending"
    )
    db.add(db_chapter)
    db.commit()
    db.refresh(db_chapter)
    return ChapterResponse(
        id=db_chapter.id,
        book_id=db_chapter.book_id,
        number=db_chapter.number,
        title=db_chapter.title,
        original_content=db_chapter.original_content,
        generated_content=db_chapter.generated_content,
        status=db_chapter.status
    )


@router.put("/{book_id}/chapters/{chapter_id}", response_model=ChapterResponse)
def update_chapter(
    book_id: int,
    chapter_id: int,
    update: ChapterUpdate,
    db: Session = Depends(get_db)
):
    """Met a jour un chapitre (titre, contenu genere, statut)."""
    chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id,
        Chapter.book_id == book_id
    ).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapitre non trouve")

    if update.title is not None:
        chapter.title = update.title
    if update.original_content is not None:
        chapter.original_content = update.original_content
    if update.generated_content is not None:
        chapter.generated_content = update.generated_content
    if update.status is not None:
        chapter.status = update.status

    db.commit()
    db.refresh(chapter)
    return ChapterResponse(
        id=chapter.id,
        book_id=chapter.book_id,
        number=chapter.number,
        title=chapter.title,
        original_content=chapter.original_content,
        generated_content=chapter.generated_content,
        status=chapter.status or "pending"
    )


@router.delete("/{book_id}/chapters/{chapter_id}")
def delete_chapter(book_id: int, chapter_id: int, db: Session = Depends(get_db)):
    """Supprime un chapitre."""
    chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id,
        Chapter.book_id == book_id
    ).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapitre non trouve")
    db.delete(chapter)
    db.commit()
    return {"message": "Chapitre supprime"}
