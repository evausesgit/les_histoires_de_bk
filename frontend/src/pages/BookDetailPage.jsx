import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { booksApi } from '../services/api'

function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newChapter, setNewChapter] = useState({ original_content: '' })
  const [showAddChapter, setShowAddChapter] = useState(false)
  const [readingChapter, setReadingChapter] = useState(null)
  const [showOriginal, setShowOriginal] = useState(false)

  useEffect(() => {
    loadBook()
    loadChapters()
  }, [id])

  const loadBook = async () => {
    try {
      const response = await booksApi.getBook(id)
      setBook(response.data)
    } catch (err) {
      setError('Livre non trouve')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadChapters = async () => {
    try {
      const response = await booksApi.getChapters(id)
      setChapters(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddChapter = async (e) => {
    e.preventDefault()
    if (!newChapter.original_content.trim()) {
      setError('Le contenu du chapitre est requis')
      return
    }

    try {
      const chapterNumber = chapters.length + 1
      const response = await booksApi.createChapter(id, {
        original_content: newChapter.original_content,
        number: chapterNumber
      })
      setChapters([...chapters, response.data])
      setNewChapter({ original_content: '' })
      setShowAddChapter(false)
      setError(null)
    } catch (err) {
      setError('Erreur lors de l\'ajout du chapitre')
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'generated') {
      return <span style={{
        background: '#4CAF50',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.8rem'
      }}>Genere</span>
    }
    return <span style={{
      background: '#FF9800',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '0.8rem'
    }}>En attente</span>
  }

  const openReader = (chapter) => {
    setReadingChapter(chapter)
    setShowOriginal(false)
  }

  const closeReader = () => {
    setReadingChapter(null)
    setShowOriginal(false)
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!book) {
    return <div className="alert alert-error">Livre non trouve</div>
  }

  // Mode lecture plein ecran
  if (readingChapter) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#faf8f5',
        padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          background: 'white',
          padding: '60px 50px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          fontFamily: 'Georgia, serif'
        }}>
          <button
            onClick={closeReader}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'sans-serif'
            }}
          >
            Fermer
          </button>

          <h1 style={{
            textAlign: 'center',
            fontSize: '1.8rem',
            marginBottom: '10px',
            color: '#333'
          }}>
            {readingChapter.title || `Chapitre ${readingChapter.number}`}
          </h1>

          <p style={{
            textAlign: 'center',
            color: '#888',
            marginBottom: '40px',
            fontStyle: 'italic'
          }}>
            {book.title}
          </p>

          <div style={{
            lineHeight: '1.9',
            fontSize: '1.1rem',
            color: '#333',
            textAlign: 'justify',
            whiteSpace: 'pre-wrap'
          }}>
            {readingChapter.generated_content || 'Ce chapitre est en attente de generation...'}
          </div>

          {/* Bouton pour voir le texte original */}
          <div style={{ marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              style={{
                background: 'none',
                border: '1px solid #ccc',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#666',
                fontFamily: 'sans-serif',
                fontSize: '0.9rem'
              }}
            >
              {showOriginal ? 'Masquer le texte original' : 'Voir le texte original'}
            </button>

            {showOriginal && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: '#f9f9f9',
                borderRadius: '8px',
                fontSize: '0.95rem',
                color: '#666',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6'
              }}>
                <strong style={{ display: 'block', marginBottom: '10px' }}>Texte original :</strong>
                {readingChapter.original_content}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
        Retour a la liste
      </button>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h2>{book.title}</h2>
        {book.description && <p style={{ color: '#666', marginBottom: '15px' }}>{book.description}</p>}
        <p><strong>Style:</strong> {book.style}</p>

        <div style={{ marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={() => setShowAddChapter(true)}>
            Ajouter un chapitre
          </button>
        </div>
      </div>

      {showAddChapter && (
        <div className="card">
          <h3>Nouveau chapitre</h3>
          <form onSubmit={handleAddChapter}>
            <div className="form-group">
              <label>Contenu original du chapitre {chapters.length + 1}</label>
              <textarea
                value={newChapter.original_content}
                onChange={(e) => setNewChapter({ original_content: e.target.value })}
                placeholder="Ecrivez le contenu brut de ce chapitre..."
                rows={6}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Ajouter</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddChapter(false)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Chapitres ({chapters.length})</h3>

        <div style={{
          background: '#e3f2fd',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: '4px solid #2196F3'
        }}>
          <strong>Comment ca marche :</strong><br/>
          Les chapitres "En attente" seront generes par Claude quand vous lui demanderez.<br/>
          Dites simplement "genere les chapitres en attente" dans le chat.
        </div>

        {chapters.length === 0 ? (
          <p style={{ color: '#888' }}>Aucun chapitre pour le moment. Ajoutez votre premier chapitre !</p>
        ) : (
          <div className="chapters-list">
            {chapters.map(chapter => (
              <div key={chapter.id} className="chapter-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <h4>
                    Chapitre {chapter.number}
                    {chapter.title && `: ${chapter.title}`}
                  </h4>
                  {getStatusBadge(chapter.status)}
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => openReader(chapter)}
                  disabled={chapter.status !== 'generated'}
                  style={{
                    opacity: chapter.status !== 'generated' ? 0.5 : 1
                  }}
                >
                  Lire
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BookDetailPage
