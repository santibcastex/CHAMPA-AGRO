import { useState, useEffect } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db, auth } from '../firebase-config'
import { X, Check } from 'lucide-react'
import './PaginaRegistro.css'

const TIPOS_USUARIO = [
  'Productor Agrícola',
  'Productor Ganadero',
  'Productor Mixto',
  'Ingeniero Agrónomo',
  'Veterinario',
  'Administrador',
  'Comercial Agropecuario',
  'Dirigente',
  'Agro-industria',
  'Comercio Exterior'
]

const ZONAS = ['Bragado', 'Salto', 'Chacabuco', 'La Plata', 'Tandil', 'Pergamino', 'Tres Arroyos', 'Coronel Suárez']
const CULTIVOS = ['Trigo', 'Soja', 'Maíz', 'Girasol', 'Cebada', 'Avena', 'Pastura']

export default function PaginaRegistro({ onClose, zonesPreselected = [] }) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [tipoUsuario, setTipoUsuario] = useState('Productor Agrícola')
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState(zonesPreselected)
  const [cultivosSeleccionados, setCultivosSeleccionados] = useState([])
  const [cargando, setCargando] = useState(false)
  const [cargandoDatos, setCargandoDatos] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  useEffect(() => {
    cargarDatos()
    if (zonesPreselected.length > 0) {
      setZonasSeleccionadas(zonesPreselected)
    }
  }, [zonesPreselected])

  const cargarDatos = async () => {
    try {
      const uid = auth.currentUser?.uid
      if (!uid) return

      const docRef = doc(db, 'agronomos', uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        setNombre(data.nombre || '')
        setTelefono(data.telefono?.replace('+54 ', '') || '')
        setTipoUsuario(data.tipoUsuario || 'Productor Agrícola')
        setZonasSeleccionadas(data.zonas || zonesPreselected)
        setCultivosSeleccionados(data.cultivos || [])
      }
    } catch (err) {
      console.error('Error cargando datos:', err)
    } finally {
      setCargandoDatos(false)
    }
  }

  const toggleZona = (zona) => {
    setZonasSeleccionadas(prev =>
      prev.includes(zona)
        ? prev.filter(z => z !== zona)
        : [...prev, zona]
    )
  }

  const toggleCultivo = (cultivo) => {
    setCultivosSeleccionados(prev =>
      prev.includes(cultivo)
        ? prev.filter(c => c !== cultivo)
        : [...prev, cultivo]
    )
  }

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')

    if (!nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    if (!telefono.trim()) {
      setError('El teléfono es requerido')
      return
    }

    if (zonasSeleccionadas.length === 0) {
      setError('Selecciona al menos una zona')
      return
    }

    setCargando(true)

    try {
      const uid = auth.currentUser?.uid
      if (!uid) throw new Error('No autenticado')

      await setDoc(doc(db, 'agronomos', uid), {
        nombre: nombre.trim(),
        telefono: `+54 ${telefono.trim()}`,
        tipoUsuario,
        zonas: zonasSeleccionadas,
        cultivos: cultivosSeleccionados,
        estado: 'Activo',
        actualizado: new Date().toISOString(),
      })

      setExito('✓ Perfil guardado correctamente')
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      setError(`Error: ${err.message}`)
    } finally {
      setCargando(false)
    }
  }

  if (cargandoDatos) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Mi perfil</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {exito && <div className="alert alert-success">{exito}</div>}

        <form onSubmit={guardar} className="registro-form">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="9 1234567 (sin +54 ni 0)"
            />
          </div>

          <div className="form-group">
            <label>¿Qué sos?</label>
            <select value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value)}>
              {TIPOS_USUARIO.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Zonas de trabajo (clickea en el mapa o selecciona aquí)</label>
            <div className="zonas-grid">
              {ZONAS.map(zona => (
                <button
                  key={zona}
                  type="button"
                  className={`chip ${zonasSeleccionadas.includes(zona) ? 'selected' : ''}`}
                  onClick={() => toggleZona(zona)}
                >
                  {zona}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Cultivos que manejás</label>
            <div className="cultivos-grid">
              {CULTIVOS.map(cultivo => (
                <button
                  key={cultivo}
                  type="button"
                  className={`chip ${cultivosSeleccionados.includes(cultivo) ? 'selected' : ''}`}
                  onClick={() => toggleCultivo(cultivo)}
                >
                  {cultivo}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <div className="spinner-small"></div>
                Guardando...
              </>
            ) : (
              <>
                <Check size={20} />
                Guardar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
