import { useState, useEffect } from 'react'
import { signInAnonymously } from 'firebase/auth'
import { auth } from './firebase-config'
import PaginaMapa from './pages/PaginaMapa'
import './App.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    signInAnonymously(auth)
      .then(() => {
        setUser(auth.currentUser)
      })
      .catch((error) => {
        console.error('Error de autenticación:', error)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    )
  }

  return <PaginaMapa />
}
