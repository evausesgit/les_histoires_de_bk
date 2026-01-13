import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksApi } from '../services/api'

function NewBookPage() {
  const navigate = useNavigate()
  const [styles, setStyles] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    original_text: '',
    style: 'narratif'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStyles()
  }, [])

  const loadStyles = async () => {
    try {
      const response = await booksApi.getStyles()
      setStyles(response.data)
    } catch (err) {
      console.error('Erreur chargement styles:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError('Le titre est requis')
      return
    }
    if (!formData.original_text.trim()) {
      setError('Le texte original est requis')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await booksApi.createBook(formData)
      navigate(`/book/${response.data.id}`)
    } catch (err) {
      setError('Erreur lors de la creation du livre')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Creer un nouveau livre</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="form-group">
            <label>Titre du livre</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Les Aventures de..."
            />
          </div>

          <div className="form-group">
            <label>Description (optionnel)</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Une breve description de votre histoire..."
            />
          </div>

          <div className="form-group">
            <label>Votre texte / vos idees</label>
            <textarea
              value={formData.original_text}
              onChange={(e) => setFormData({ ...formData, original_text: e.target.value })}
              placeholder="Ecrivez ici votre histoire, vos idees, le fil conducteur de votre recit... L'IA va transformer ce texte en chapitres de livre."
              rows={10}
            />
          </div>

          <div className="form-group">
            <label>Style d'ecriture</label>
            <div className="style-selector">
              {styles.map(style => (
                <div
                  key={style.id}
                  className={`style-option ${formData.style === style.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, style: style.id })}
                >
                  <h4>{style.name}</h4>
                  <p>{style.description}</p>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creation en cours...' : 'Creer le livre'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewBookPage
