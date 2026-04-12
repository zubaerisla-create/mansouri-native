import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/src/hooks/useRedux';
import { addCar } from '@/src/store/slices/carSlice';
import { AppText as Text } from '@/src/components/AppText';

export default function AddCarScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.car);
  
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [selectedColor, setSelectedColor] = useState<{name: string, hex: string} | null>(null);

  const colors = [
    { name: 'White', hex: '#FFFFFF', border: '#E0E0E0' },
    { name: 'Black', hex: '#000000' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Blue', hex: '#4169E1' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Green', hex: '#008000' },
    { name: 'Brown', hex: '#8B4513' },
    { name: 'Other', hex: '#6A5ACD' },
  ];

  const handleSave = async () => {
    if (!model || !plate || !selectedColor) {
      Alert.alert('Required', 'Please fill all details and select a color');
      return;
    }

    try {
      const result = await dispatch(addCar({
        car_model: model,
        plate_number: plate,
        car_color: selectedColor.hex
      })).unwrap();
      
      console.log('Car added successfully:', result);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to add car');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text bold style={styles.title}>Car Information</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instruction */}
        <View style={styles.infoBox}>
          <Ionicons name="car-outline" size={28} color="#FF6200" />
          <Text style={styles.infoText}>
            We need your car details for curbside pickup
          </Text>
        </View>

        {/* Car Model */}
        <View style={styles.field}>
          <Text bold style={styles.label}>Car Model</Text>
          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            placeholder="Enter car model (e.g. Toyota Camry)"
            autoCapitalize="words"
            editable={!isLoading}
          />
        </View>

        {/* Car Color */}
        <View style={styles.field}>
          <Text bold style={styles.label}>Car Color</Text>

          <View style={styles.colorGrid}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color.name}
                disabled={isLoading}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color.hex },
                  color.name === 'White' && { borderWidth: 1, borderColor: color.border },
                  selectedColor?.name === color.name && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor?.name === color.name && (
                  <Ionicons 
                    name="checkmark" 
                    size={20} 
                    color={color.name === 'Black' || color.name === 'Other' ? '#fff' : '#000'} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Plate Number */}
        <View style={styles.field}>
          <Text bold style={styles.label}>Plate Number</Text>
          <TextInput
            style={styles.input}
            value={plate}
            onChangeText={setPlate}
            placeholder="Example: ABC1234"
            autoCapitalize="characters"
            maxLength={10}
            editable={!isLoading}
          />
          <Text style={styles.hint}>Example: ABC1234</Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveButton, isLoading && { opacity: 0.7 }]} 
        activeOpacity={0.8}
        onPress={handleSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text bold style={styles.saveText}>Save</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F2',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#FF6200',
  },
  hint: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#FF6200',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});