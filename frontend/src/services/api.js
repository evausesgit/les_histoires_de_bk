import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const booksApi = {
  // Styles
  getStyles: () => api.get('/books/styles'),

  // Books
  getBooks: () => api.get('/books/'),
  getBook: (id) => api.get(`/books/${id}`),
  createBook: (data) => api.post('/books/', data),
  deleteBook: (id) => api.delete(`/books/${id}`),

  // Chapters
  getChapters: (bookId) => api.get(`/books/${bookId}/chapters`),
  createChapter: (bookId, data) => api.post(`/books/${bookId}/chapters`, data),
  generateChapter: (bookId, chapterId) => api.post(`/books/${bookId}/chapters/${chapterId}/generate`),
  suggestStructure: (bookId) => api.post(`/books/${bookId}/suggest-structure`)
}

export default api
