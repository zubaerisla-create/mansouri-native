import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  onSearch?: (query: string) => void; // parent e search query pathanor jonno
}

export default function Header({ onSearch }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Location + Profile Row */}
      <View style={styles.topRow}>
        <Image
          style={styles.profileImage}
          source={require('@/assets/images/splash-screen.png')} // tor splash image
        />
        <TouchableOpacity 
          style={styles.locationContainer}
          onPress={() => router.push('/explore/map')}
          activeOpacity={0.7}
        >
          <Feather name="map-pin" size={20} color="#4169E1" />
          <Text style={styles.locationText}>Al Rimal District, Riyadh</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input with Icon */}
      
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants or food"
          placeholderTextColor="#999"
          onChangeText={onSearch} // eta use koro – real search
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16, // py-12 ~ padding 48px, but RN e moderate rakha better
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  searchContainer: {
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48, // Left padding increased for icon
    fontSize: 16,
    color: '#333',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 10,
  },
});