import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { booksApi } from '../services/api'

function HomePage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      setLoading(true)
      const response = await booksApi.getBooks()
      setBooks(response.data)
    } catch (err) {
      setError('Erreur lors du chargement des livres')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('Voulez-vous vraiment supprimer ce livre ?')) {
      try {
        await booksApi.deleteBook(id)
        setBooks(books.filter(book => book.id !== id))
      } catch (err) {
        setError('Erreur lors de la suppression')
      }
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Mes Livres</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {books.length === 0 ? (
        <div className="empty-state">
          <h3>Aucun livre pour le moment</h3>
          <p>Commencez par creer votre premier livre !</p>
          <Link to="/new" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
            Creer un livre
          </Link>
        </div>
      ) : (
        <div className="books-grid">
          {books.map(book => (
            <Link to={`/book/${book.id}`} key={book.id} className="book-card">
              <h3>{book.title}</h3>
              {book.description && <p>{book.description}</p>}
              <div className="meta">
                <span>Style: {book.style}</span>
                <span> | {book.chapters_count} chapitre(s)</span>
              </div>
              <button
                className="btn btn-danger"
                style={{ marginTop: '15px' }}
                onClick={(e) => handleDelete(book.id, e)}
              >
                Supprimer
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage
