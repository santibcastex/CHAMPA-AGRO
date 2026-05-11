import { useState, useEffect } from 'react'
import { GoogleMap, LoadScript, MarkerF, InfoWindowF, MarkerClustererF } from '@react-google-maps/api'
import { collection, onSnapshot } from 'firebase/firestore'
import { db, GOOGLE_MAPS_API_KEY } from '../firebase-config'
import PaginaRegistro from './PaginaRegistro'
import { MapPin, Phone, Leaf, Plus } from 'lucide-react'
import './PaginaMapa.css'

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

export default function PaginaMapa() {
  const [agronomos, setAgronomos] = useState([])
  const [infoWindow, setInfoWindow] = useState(null)
  const [mostrarRegistro, setMostrarRegistro] = useState(false)
  const [loading, setLoading] = useState(true)

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

  const marcadores = agronomos.map(agro => {
    const zona = agro.zona
    const coords = ZONAS[zona]
    return coords ? { ...agro, coords } : null
  }).filter(Boolean)

  if (loading && agronomos.length === 0) {
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
      </header>

      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          zoom={6.5}
          center={{ lat: -35.0, lng: -63.0 }}
          mapContainerClassName="map-container"
          options={{
            fullscreenControl: true,
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          <MarkerClustererF>
            {(clusterer) =>
              marcadores.map((agro) => (
                <MarkerF
                  key={agro.id}
                  position={agro.coords}
                  clusterer={clusterer}
                  title={agro.nombre}
                  onClick={() => setInfoWindow(agro)}
                />
              ))
            }
          </MarkerClustererF>

          {infoWindow && (
            <InfoWindowF
              position={infoWindow.coords}
              onCloseClick={() => setInfoWindow(null)}
            >
              <div className="info-window">
                <h3>{infoWindow.nombre}</h3>
                <div className="info-row">
                  <MapPin size={16} />
                  <span>{infoWindow.zona}</span>
                </div>
                <div className="info-row">
                  <Phone size={16} />
                  <a href={`tel:${infoWindow.telefono}`}>{infoWindow.telefono}</a>
                </div>
                {infoWindow.cultivos?.length > 0 && (
                  <div className="info-row">
                    <Leaf size={16} />
                    <span>{infoWindow.cultivos.join(', ')}</span>
                  </div>
                )}
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </LoadScript>

      <button
        className="btn-agregar"
        onClick={() => setMostrarRegistro(true)}
        title="Agregar/editar perfil"
      >
        <Plus size={24} />
      </button>

      {mostrarRegistro && (
        <PaginaRegistro
          onClose={() => setMostrarRegistro(false)}
        />
      )}
    </div>
  )
}
