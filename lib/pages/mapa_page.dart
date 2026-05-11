import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'registro_page.dart';

class PaginaMapa extends StatefulWidget {
  const PaginaMapa({Key? key}) : super(key: key);

  @override
  State<PaginaMapa> createState() => _PaginaMapaState();
}

class _PaginaMapaState extends State<PaginaMapa> {
  late GoogleMapController mapController;
  Set<Marker> marcadores = {};
  final db = FirebaseFirestore.instance;

  final Map<String, LatLng> zonas = {
    'Bragado': LatLng(-35.111, -60.483),
    'Salto': LatLng(-34.750, -61.616),
    'Chacabuco': LatLng(-34.783, -60.633),
    'La Plata': LatLng(-34.921, -57.954),
    'Tandil': LatLng(-37.318, -59.137),
    'Pergamino': LatLng(-33.887, -60.559),
    'Tres Arroyos': LatLng(-38.365, -60.280),
    'Coronel Suárez': LatLng(-37.994, -61.982),
  };

  @override
  void initState() {
    super.initState();
    _cargarAgronomos();
  }

  void _cargarAgronomos() {
    db.collection('agronomos').snapshots().listen((snapshot) {
      Set<Marker> nuevosMarcadores = {};

      for (var doc in snapshot.docs) {
        final data = doc.data();
        final zona = data['zona'] as String?;
        final coords = zonas[zona];

        if (coords != null) {
          nuevosMarcadores.add(
            Marker(
              markerId: MarkerId(doc.id),
              position: coords,
              infoWindow: InfoWindow(
                title: data['nombre'] ?? 'Sin nombre',
                snippet: '${zona}\n${data['telefono'] ?? ''}',
              ),
              onTap: () => _mostrarDetalle(data),
            ),
          );
        }
      }

      setState(() => marcadores = nuevosMarcadores);
    });
  }

  void _mostrarDetalle(Map<String, dynamic> agro) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              agro['nombre'] ?? 'Sin nombre',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.phone, size: 18),
                const SizedBox(width: 8),
                SelectableText(agro['telefono'] ?? 'Sin teléfono'),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.location_on, size: 18),
                const SizedBox(width: 8),
                Text(agro['zona'] ?? 'Sin zona'),
              ],
            ),
            if (agro['cultivos'] != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Row(
                  children: [
                    const Icon(Icons.local_florist, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        (agro['cultivos'] as List).join(', '),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('CHAMPA AGRO'),
        centerTitle: true,
        elevation: 0,
      ),
      body: GoogleMap(
        onMapCreated: (controller) => mapController = controller,
        initialCameraPosition: const CameraPosition(
          target: LatLng(-35.0, -63.0),
          zoom: 6.5,
        ),
        markers: marcadores,
        zoomControlsEnabled: true,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const PaginaRegistro()),
        ),
        tooltip: 'Agregar/editar perfil',
        child: const Icon(Icons.add),
      ),
    );
  }

  @override
  void dispose() {
    mapController.dispose();
    super.dispose();
  }
}
