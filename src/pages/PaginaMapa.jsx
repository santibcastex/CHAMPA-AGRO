import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase-config'
import PaginaRegistro from './PaginaRegistro'
import { MapPin, Phone, Leaf, Plus } from 'lucide-react'
import './PaginaMapa.css'

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const ZONAS = {
  'Bragado': { lat: -35.111, lng: -60.483 },
  'Salto': { lat: -34.750, lng: -61.616 },
  'Chacabuco': { lat: -34.783, lng: -60.633 },
  'La Plata': { lat: -34.921, lng: -57.954 },
  'Tandil': { lat: -37.318, lng: -59.137 },
  'Pergamino': { lat: -33.887, lng: -60.559 },
  'Tres Arroyos': { lat: -38.365, lng: -60.280 },
  'Coronel Suárez': { lat: -37.994, lng: -61.982 },
}

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const yellowIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e)
    }
  })
  return null
}

export default function PaginaMapa() {
  const [agronomos, setAgronomos] = useState([])
  const [mostrarRegistro, setMostrarRegistro] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedZones, setSelectedZones] = useState([])

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'agronomos'),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setAgronomos(data)
        setLoading(false)
      },
      (error) => {
        console.error('Error cargando agronomos:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const handleMapClick = (e) => {
    const clickedLat = e.latlng.lat
    const clickedLng = e.latlng.lng

    let closestZona = null
    let minDistance = Infinity

    Object.entries(ZONAS).forEach(([zona, coords]) => {
      const distance = Math.sqrt(
        Math.pow(coords.lat - clickedLat, 2) + Math.pow(coords.lng - clickedLng, 2)
      )
      if (distance < minDistance) {
        minDistance = distance
        closestZona = zona
      }
    })

    if (closestZona && minDistance < 1) {
      if (selectedZones.includes(closestZona)) {
        setSelectedZones(selectedZones.filter(z => z !== closestZona))
      } else {
        setSelectedZones([...selectedZones, closestZona])
      }
    }
  }

  const clearSelection = () => {
    setSelectedZones([])
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando mapa...</p>
      </div>
    )
  }

  return (
    <div className="mapa-container">
      <header className="header">
        <h1>CHAMPA AGRO</h1>
        <p className="subtitle">{agronomos.length} agronomos activos</p>
        {selectedZones.length > 0 && (
          <div className="zones-selected">
            <span>{selectedZones.length} zona{selectedZones.length !== 1 ? 's' : ''} seleccionada{selectedZones.length !== 1 ? 's' : ''}</span>
            <button onClick={clearSelection} className="btn-clear">Limpiar</button>
          </div>
        )}
      </header>

      <MapContainer
        center={[-35.0, -63.0]}
        zoom={6}
        scrollWheelZoom={true}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={handleMapClick} />

        {/* Marcadores de agronomos */}
        {agronomos.map((agro) => {
          const zonas = agro.zonas || [agro.zona]
          return zonas.map((zona, idx) => {
            const coords = ZONAS[zona]
            if (!coords) return null
            return (
              <Marker
                key={`${agro.id}-${idx}`}
                position={[coords.lat, coords.lng]}
                icon={greenIcon}
              >
                <Popup>
                  <div className="popup-content">
                    <h3>{agro.nombre}</h3>
                    <div className="popup-row">
                      <MapPin size={14} />
                      <span>{zona}</span>
                    </div>
                    <div className="popup-row">
                      <Phone size={14} />
                      <a href={`tel:${agro.telefono}`}>{agro.telefono}</a>
                    </div>
                    {agro.tipoUsuario && (
                      <div className="popup-row">
                        <span className="badge">{agro.tipoUsuario}</span>
                      </div>
                    )}
                    {agro.cultivos?.length > 0 && (
                      <div className="popup-row">
                        <Leaf size={14} />
                        <span>{agro.cultivos.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })
        })}

        {/* Marcadores de zonas seleccionadas */}
        {selectedZones.map(zona => {
          const coords = ZONAS[zona]
          return (
            <Marker
              key={`selected-${zona}`}
              position={[coords.lat, coords.lng]}
              icon={yellowIcon}
            >
              <Popup>
                <strong>{zona}</strong> (seleccionada)
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      <div className="fab-container">
        {selectedZones.length > 0 && (
          <button
            className="btn-registrar"
            onClick={() => setMostrarRegistro(true)}
            title="Registrarse con zonas seleccionadas"
          >
            <span>{selectedZones.join(', ')}</span>
          </button>
        )}
        <button
          className="btn-agregar"
          onClick={() => setMostrarRegistro(true)}
          title="Agregar/editar perfil"
        >
          <Plus size={24} />
        </button>
      </div>

      {mostrarRegistro && (
        <PaginaRegistro
          onClose={() => setMostrarRegistro(false)}
          zonesPreselected={selectedZones}
        />
      )}
    </div>
  )
}
