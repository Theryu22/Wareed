import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Hafar Al-Batin Hospitals with precise coordinates
const HAFAR_HOSPITALS = [
  {
    id: 1,
    name: 'مستشفى حفر الباطن العام',
    latitude: 28.4321, 
    longitude: 45.9632,
    address: 'حي الملك فهد، حفر الباطن'
  },
  {
    id: 2,
    name: 'مستشفى الملك خالد',
    latitude: 28.4287,
    longitude: 45.9618,
    address: 'حي المروج، حفر الباطن'
  },
  {
    id: 3,
    name: 'مستشفى الولادة والأطفال',
    latitude: 28.4305,
    longitude: 45.9673,
    address: 'حي النزهة، حفر الباطن'
  },
  {
    id: 4,
    name: 'مستشفى القوات المسلحة',
    latitude: 28.4362,
    longitude: 45.9591,
    address: 'حي العزيزية، حفر الباطن'
  }
];

// Calculate distance between coordinates (in km)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function HafarHospitalsMap() {
  const [location, setLocation] = useState(null);
  const [nearestHospitals, setNearestHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // Request location permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('السماح بالوصول للموقع مطلوب لعرض المستشفيات القريبة');
          return;
        }

        // Get current location
        let { coords } = await Location.getCurrentPositionAsync({});
        const userLocation = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setLocation(userLocation);

        // Calculate distances to Hafar hospitals
        const hospitalsWithDistance = HAFAR_HOSPITALS.map(hospital => ({
          ...hospital,
          distance: getDistance(
            userLocation.latitude,
            userLocation.longitude,
            hospital.latitude,
            hospital.longitude
          )
        }));

        // Sort by distance
        const nearest = hospitalsWithDistance
          .sort((a, b) => a.distance - b.distance);

        setNearestHospitals(nearest);

      } catch (err) {
        setError('حدث خطأ في تحديد موقعك في حفر الباطن');
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#075eec" />
        <Text style={styles.loadingText}>جاري البحث عن مستشفيات حفر الباطن القريبة...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={40} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setLoading(true)}
        >
          <Text style={styles.retryText}>حاول مرة أخرى</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            ...location,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* User Location */}
          <Marker coordinate={location} title="موقعك الحالي في حفر الباطن">
            <View style={styles.userMarker}>
              <Ionicons name="person" size={24} color="#075eec" />
            </View>
          </Marker>

          {/* Hafar Al-Batin Hospitals */}
          {nearestHospitals.map(hospital => (
            <Marker
              key={hospital.id}
              coordinate={{
                latitude: hospital.latitude,
                longitude: hospital.longitude
              }}
              title={hospital.name}
              description={`${hospital.address} (${hospital.distance.toFixed(1)} كم)`}
              onPress={() => setSelectedHospital(hospital)}
            >
              <View style={[
                styles.hospitalMarker,
                selectedHospital?.id === hospital.id && styles.selectedHospitalMarker
              ]}>
                <Ionicons name="medical" size={24} color="#fff" />
              </View>
            </Marker>
          ))}

          {/* Line to selected hospital */}
          {selectedHospital && (
            <Polyline
              coordinates={[
                location,
                {
                  latitude: selectedHospital.latitude,
                  longitude: selectedHospital.longitude
                }
              ]}
              strokeColor="#f44336"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>
      )}

      {/* Hospital Selection Panel */}
      <View style={styles.hospitalsPanel}>
        <Text style={styles.panelTitle}>مستشفيات حفر الباطن</Text>
        
        {nearestHospitals.map(hospital => (
          <TouchableOpacity
            key={hospital.id}
            style={[
              styles.hospitalItem,
              selectedHospital?.id === hospital.id && styles.selectedHospitalItem
            ]}
            onPress={() => setSelectedHospital(hospital)}
          >
            <Ionicons name="medical" size={20} color="#f44336" />
            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName}>{hospital.name}</Text>
              <Text style={styles.hospitalAddress}>{hospital.address}</Text>
              <Text style={styles.hospitalDistance}>
                {hospital.distance.toFixed(1)} كم من موقعك
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#075eec',
    padding: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userMarker: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#075eec',
  },
  hospitalMarker: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  selectedHospitalMarker: {
    backgroundColor: '#4caf50',
    transform: [{ scale: 1.2 }],
  },
  hospitalsPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '40%',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'right',
  },
  hospitalItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  selectedHospitalItem: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#075eec',
  },
  hospitalInfo: {
    flex: 1,
    marginRight: 10,
  },
  hospitalName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  hospitalAddress: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  hospitalDistance: {
    fontSize: 12,
    color: '#075eec',
    textAlign: 'right',
    marginTop: 3,
  },
});