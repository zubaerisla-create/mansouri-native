import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const GOOGLE_MAPS_APIKEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE'; // User needs to replace this

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: any[];
}

export default function MapExploreScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [region, setRegion] = useState<Region | null>(null);

  const mapRef = useRef<MapView>(null);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      const initialRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
      setRegion(initialRegion);
      
      fetchNearbyRestaurants(currentLocation.coords.latitude, currentLocation.coords.longitude);
    })();
  }, []);

  const fetchNearbyRestaurants = async (lat: number, lng: number) => {
    if (GOOGLE_MAPS_APIKEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      // Use mock data if no API key is provided
      const mockData: Restaurant[] = [
        {
          id: '1',
          name: 'Burger House',
          rating: 4.5,
          vicinity: 'Al Rimal, Riyadh',
          geometry: { location: { lat: lat + 0.002, lng: lng + 0.002 } }
        },
        {
          id: '2',
          name: 'Shawarma Express',
          rating: 4.7,
          vicinity: 'Al Rimal, Riyadh',
          geometry: { location: { lat: lat - 0.002, lng: lng + 0.003 } }
        },
        {
          id: '3',
          name: 'Pizza Palace',
          rating: 4.2,
          vicinity: 'Al Rimal, Riyadh',
          geometry: { location: { lat: lat + 0.003, lng: lng - 0.001 } }
        }
      ];
      setRestaurants(mockData);
      setLoading(false);
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=restaurant&key=${GOOGLE_MAPS_APIKEY}`;
      const response = await axios.get(url);
      if (response.data.results) {
        setRestaurants(response.data.results);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      Alert.alert('Error', 'Failed to fetch nearby restaurants');
    } finally {
      setLoading(false);
    }
  };

  const onMarkerPress = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    const index = restaurants.findIndex(r => r.id === restaurant.id);
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
    animateToLocation(restaurant.geometry.location.lat, restaurant.geometry.location.lng);
  };

  const animateToLocation = (lat: number, lng: number) => {
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000);
  };

  const openInMaps = (restaurant: Restaurant) => {
    const lat = restaurant.geometry.location.lat;
    const lng = restaurant.geometry.location.lng;
    const label = restaurant.name;
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
    });

    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Could not open maps application');
        }
      });
    }
  };

  const renderRestaurantCard = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={[
        styles.card,
        selectedRestaurant?.id === item.id && styles.selectedCard
      ]}
      onPress={() => {
        setSelectedRestaurant(item);
        animateToLocation(item.geometry.location.lat, item.geometry.location.lng);
      }}
      activeOpacity={0.9}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating || 'N/A'}</Text>
          </View>
        </View>
        <Text style={styles.cardAddress} numberOfLines={1}>{item.vicinity}</Text>
        
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.directionBtn}
            onPress={() => setShowRoute(true)}
          >
            <Feather name="navigation" size={16} color="#fff" />
            <Text style={styles.directionBtnText}>Direction</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mapsBtn}
            onPress={() => openInMaps(item)}
          >
            <Feather name="external-link" size={16} color="#FF6B00" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Finding nearby restaurants...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Restaurants</Text>
        <View style={{ width: 40 }} />
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region || undefined}
        showsUserLocation
        showsMyLocationButton
      >
        {restaurants.map(restaurant => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude: restaurant.geometry.location.lat,
              longitude: restaurant.geometry.location.lng,
            }}
            onPress={() => onMarkerPress(restaurant)}
          >
            <View style={[
              styles.markerContainer,
              selectedRestaurant?.id === restaurant.id && styles.selectedMarker
            ]}>
              <Ionicons name="restaurant" size={18} color="#fff" />
            </View>
            <Callout tooltip>
              <View style={styles.callout}>
                <Text  style={styles.calloutName}>{restaurant.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.calloutRating}>{restaurant.rating || 'N/A'}</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}

        {showRoute && location && selectedRestaurant && GOOGLE_MAPS_APIKEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' && (
          <MapViewDirections
            origin={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            destination={{
              latitude: selectedRestaurant.geometry.location.lat,
              longitude: selectedRestaurant.geometry.location.lng,
            }}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="#FF6B00"
            onReady={result => {
              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: {
                  right: width / 10,
                  bottom: height / 4,
                  left: width / 10,
                  top: height / 10,
                },
              });
            }}
          />
        )}
      </MapView>

      <View style={styles.bottomContainer}>
        <FlatList
          ref={flatListRef}
          data={restaurants}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={renderRestaurantCard}
          contentContainerStyle={styles.flatListContent}
          snapToInterval={width * 0.8 + 20}
          decelerationRate="fast"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  markerContainer: {
    backgroundColor: '#FF6B00',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedMarker: {
    backgroundColor: '#000',
    transform: [{ scale: 1.2 }],
  },
  callout: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    width: 150,
    borderWidth: 1,
    borderColor: '#eee',
  },
  calloutName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  calloutRating: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  flatListContent: {
    paddingHorizontal: 10,
  },
  card: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedCard: {
    borderColor: '#FF6B00',
    borderWidth: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600',
  },
  cardAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  directionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    marginRight: 10,
  },
  directionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  mapsBtn: {
    backgroundColor: '#FFF5EB',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0CC',
  },
});
