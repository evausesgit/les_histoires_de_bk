import { Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NewBookPage from './pages/NewBookPage'
import BookDetailPage from './pages/BookDetailPage'

function App() {
  return (
    <div>
      <header>
        <div className="container">
          <h1>Les Histoires de BK</h1>
          <p>Transformez vos idees en chapitres de livre avec l'aide de l'IA</p>
          <nav>
            <Link to="/">Mes Livres</Link>
            <Link to="/new">Nouveau Livre</Link>
          </nav>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new" element={<NewBookPage />} />
          <Route path="/book/:id" element={<BookDetailPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
