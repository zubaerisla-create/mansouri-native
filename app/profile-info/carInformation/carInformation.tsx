import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/src/hooks/useTranslation';
import { AppText as Text } from '@/src/components/AppText';

export default function CarInfoScreen() {
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const [model, setModel] = useState('Bugatti');
  const [plate, setPlate] = useState('ABC345');
  const [selectedColor, setSelectedColor] = useState<string | null>('Black');

  const colors = [
    { name: 'White', hex: '#FFFFFF', border: '#E0E0E0', key: 'colorWhite' },
    { name: 'Black', hex: '#000000', key: 'colorBlack' },
    { name: 'Silver', hex: '#C0C0C0', key: 'colorSilver' },
    { name: 'Blue', hex: '#4169E1', key: 'colorBlue' },
    { name: 'Red', hex: '#FF0000', key: 'colorRed' },
    { name: 'Green', hex: '#008000', key: 'colorGreen' },
    { name: 'Brown', hex: '#8B4513', key: 'colorBrown' },
    { name: 'Other', hex: '#6A5ACD', key: 'colorOther' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={28} color="#000" />
        </TouchableOpacity>
        <Text bold style={[styles.title, isRTL && { marginStart: 0, marginEnd: 12 }]}>{t('carInformation')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instruction */}
        <View style={[styles.infoBox, isRTL && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="car-outline" size={28} color="#FF6200" />
          <Text style={[styles.infoText, isRTL && { marginLeft: 0, marginRight: 12, textAlign: 'right' }]}>
            {t('carDetailsInst')}
          </Text>
        </View>

        {/* Car Model */}
        <View style={styles.field}>
          <Text bold style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('carModel')}</Text>
          <TextInput
            style={[styles.input, isRTL && { textAlign: 'right' }]}
            value={model}
            onChangeText={setModel}
            placeholder={t('carModel')}
            autoCapitalize="words"
          />
        </View>

        {/* Car Color */}
        <View style={styles.field}>
          <Text bold style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('carColor')}</Text>

          <View style={[styles.colorGrid, isRTL && { flexDirection: 'row-reverse' }]}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color.name}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color.hex },
                  color.name === 'White' && { borderWidth: 1, borderColor: color.border },
                  selectedColor === color.name && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color.name)}
              >
                {selectedColor === color.name && (
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
          <Text bold style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('plateNumber')}</Text>
          <TextInput
            style={[styles.input, isRTL && { textAlign: 'right' }]}
            value={plate}
            onChangeText={setPlate}
            placeholder={t('examplePlate')}
            autoCapitalize="characters"
            maxLength={10}
          />
          <Text style={[styles.hint, isRTL && { textAlign: 'right' }]}>{t('examplePlate')}</Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity 
        style={styles.saveButton} 
        activeOpacity={0.8}
        onPress={() => {
          console.log('Saving car info:', { model, selectedColor, plate });
          router.back();
        }}
      >
        <Text bold style={styles.saveText}>{t('save')}</Text>
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