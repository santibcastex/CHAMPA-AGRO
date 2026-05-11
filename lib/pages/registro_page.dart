import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class PaginaRegistro extends StatefulWidget {
  const PaginaRegistro({Key? key}) : super(key: key);

  @override
  State<PaginaRegistro> createState() => _PaginaRegistroState();
}

class _PaginaRegistroState extends State<PaginaRegistro> {
  final _formKey = GlobalKey<FormState>();
  String nombre = '';
  String telefono = '';
  String zona = 'Bragado';
  List<String> cultivos = [];
  final db = FirebaseFirestore.instance;
  bool _cargando = false;

  final List<String> zonasDisponibles = [
    'Bragado',
    'Salto',
    'Chacabuco',
    'La Plata',
    'Tandil',
    'Pergamino',
    'Tres Arroyos',
    'Coronel Suárez'
  ];

  final List<String> cultivosDisponibles = [
    'Trigo',
    'Soja',
    'Maíz',
    'Girasol',
    'Cebada',
    'Avena',
    'Pastura'
  ];

  void _guardar() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();

      setState(() => _cargando = true);

      try {
        // Crear usuario anónimo si no existe
        final auth = FirebaseAuth.instance;
        if (auth.currentUser == null) {
          await auth.signInAnonymously();
        }

        final uid = auth.currentUser!.uid;

        await db.collection('agronomos').doc(uid).set({
          'nombre': nombre,
          'telefono': telefono,
          'zona': zona,
          'cultivos': cultivos,
          'estado': 'Activo',
          'actualizado': FieldValue.serverTimestamp(),
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✓ Datos guardados correctamente'),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 2),
            ),
          );
          Navigator.pop(context);
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } finally {
        if (mounted) {
          setState(() => _cargando = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mi perfil')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                decoration: InputDecoration(
                  labelText: 'Nombre',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person),
                ),
                onSaved: (val) => nombre = val ?? '',
                validator: (val) =>
                    val?.isEmpty ?? true ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                decoration: InputDecoration(
                  labelText: 'Teléfono',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.phone),
                  prefixText: '+54 ',
                ),
                keyboardType: TextInputType.phone,
                onSaved: (val) => telefono = '+54${val ?? ''}',
                validator: (val) =>
                    val?.isEmpty ?? true ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                decoration: InputDecoration(
                  labelText: 'Zona de trabajo',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.location_on),
                ),
                value: zona,
                items: zonasDisponibles
                    .map((z) => DropdownMenuItem(value: z, child: Text(z)))
                    .toList(),
                onChanged: (val) => setState(() => zona = val ?? zona),
              ),
              const SizedBox(height: 20),
              Text(
                'Cultivos que manejás',
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: cultivosDisponibles.map((cultivo) {
                  final seleccionado = cultivos.contains(cultivo);
                  return FilterChip(
                    label: Text(cultivo),
                    selected: seleccionado,
                    onSelected: (val) {
                      setState(() {
                        if (val) {
                          cultivos.add(cultivo);
                        } else {
                          cultivos.remove(cultivo);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _cargando ? null : _guardar,
                icon: _cargando
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.check),
                label: Text(_cargando ? 'Guardando...' : 'Guardar'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
