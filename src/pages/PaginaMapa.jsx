import { useState, useEffect } from 'react'
import { GoogleMap, LoadScript, MarkerF, InfoWindowF, MarkerClustererF } from '@react-google-maps/api'
import { collection, onSnapshot } from 'firebase/firestore'
import { db, GOOGLE_MAPS_API_KEY } from '../firebase-config'
import PaginaRegistro from './PaginaRegistro'
import { MapPin, Phone, Leaf, Plus, Trash2 } from 'lucide-react'
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
  const [selectedZones, setSelectedZones] = useState([])
  const [mapClicked, setMapClicked] = useState(null)

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

  const handleMapClick = (e) => {
    const clickedLat = e.latLng.lat()
    const clickedLng = e.latLng.lng()

    // Encontrar la zona más cercana
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

    if (closestZona && minDistance < 1) { // Distancia máxima de ~1 grado
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

  const openRegistroWithZones = () => {
    // Pasar zonas seleccionadas al registro
    setMostrarRegistro(true)
  }

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
        {selectedZones.length > 0 && (
          <div className="zones-selected">
            <span>{selectedZones.length} zona{selectedZones.length !== 1 ? 's' : ''} seleccionada{selectedZones.length !== 1 ? 's' : ''}</span>
            <button onClick={clearSelection} className="btn-clear">Limpiar</button>
          </div>
        )}
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
          onClick={handleMapClick}
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

          {/* Marcadores de zonas seleccionadas */}
          {selectedZones.map(zona => (
            <MarkerF
              key={`selected-${zona}`}
              position={ZONAS[zona]}
              title={zona}
              icon={{
                path: 'M0-48c-9.8 0-20 7.9-20 17.6C-20-15.6 0 0 0 0s20-15.6 20-30.4C20-40.1 9.8-48 0-48z',
                fillColor: '#fbbf24',
                fillOpacity: 1,
                strokeColor: '#f59e0b',
                strokeWeight: 2,
                scale: 1.5,
              }}
              onClick={() => setInfoWindow({ zona, coords: ZONAS[zona] })}
            />
          ))}

          {infoWindow && (
            <InfoWindowF
              position={infoWindow.coords}
              onCloseClick={() => setInfoWindow(null)}
            >
              <div className="info-window">
                <h3>{infoWindow.nombre || infoWindow.zona}</h3>
                {infoWindow.nombre && (
                  <>
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
                  </>
                )}
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </LoadScript>

      <div className="fab-container">
        {selectedZones.length > 0 && (
          <button
            className="btn-registrar"
            onClick={openRegistroWithZones}
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
