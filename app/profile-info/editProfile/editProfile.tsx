import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { AppText as Text } from "@/src/components/AppText";
import { useTranslation } from "@/src/hooks/useTranslation";
import { useAuth } from '@/src/hooks/useAuth';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions with TypeScript types
const scale = (size: number): number => (width / 375) * size;
const verticalScale = (size: number): number => (height / 812) * size;
const moderateScale = (size: number, factor: number = 0.5): number => 
  size + (scale(size) - size) * factor;

export default function EditProfile() {
  const { t, isRTL } = useTranslation();
  const { user, updateProfile, isLoading } = useAuth();

  const [fullName, setFullName] = useState<string>(user?.full_name || '');
  const [username, setUsername] = useState<string>(user?.username || '');
  const [email, setEmail] = useState<string>(user?.email || '');

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    const success = await updateProfile({
      full_name: fullName,
      username: username || fullName.split(' ')[0], // Default username if empty
      email: email,
    });

    if (success) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className='pt-12' style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={scale(28)} color="#000" />
            </TouchableOpacity>
            <Text bold style={styles.headerTitle}>{t('editProfile')}</Text>
          </View>

          {/* Profile Picture + Edit Button */}
          <View style={styles.profilePicContainer}>
            <Image
              source={{
                uri: user?.avatar || 'https://i.pravatar.cc/300',
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="pencil" size={scale(18)} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('fullName')}</Text>
              <TextInput
                style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder={t('fullName')}
              />
            </View>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('username') || 'Username'}</Text>
              <TextInput
                style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                value={username}
                onChangeText={setUsername}
                placeholder={t('username') || 'Username'}
                autoCapitalize="none"
              />
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('phoneNumberTitle')}</Text>
              <View style={styles.phoneContainer}>
                <View style={styles.countryCode}>
                  <Text style={styles.code}>{user?.phone || '+966'}</Text>
                </View>
                <Link href="/profile-info/currentPhoneNumber/currentPhoneNumber" asChild>
                  <TouchableOpacity>
                    <Text style={styles.changeText}>{t('change')}</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            {/* Email (optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('emailOptional')}</Text>
              <TextInput
                style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text bold style={styles.saveButtonText}>{t('save')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(40),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    marginStart: scale(20),
  },
  profilePicContainer: {
    alignItems: 'center',
    marginTop: verticalScale(30),
    marginBottom: verticalScale(40),
    position: 'relative',
  },
  profileImage: {
    width: scale(110),
    height: scale(110),
    borderRadius: scale(55),
    borderWidth: scale(3),
    borderColor: '#ff8c00',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: verticalScale(8),
    right: width * 0.38,
    backgroundColor: '#ff8c00',
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: scale(3),
    borderColor: '#fff',
  },
  form: {
    paddingHorizontal: scale(24),
  },
  inputGroup: {
    marginBottom: verticalScale(24),
  },
  label: {
    fontSize: moderateScale(15),
    color: '#555',
    marginBottom: verticalScale(8),
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: scale(10),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    fontSize: moderateScale(16),
    backgroundColor: '#fafafa',
    minHeight: verticalScale(48),
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: scale(10),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    backgroundColor: '#fafafa',
    minHeight: verticalScale(48),
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: moderateScale(22),
    marginEnd: scale(8),
  },
  code: {
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
  changeText: {
    color: '#ff6200',
    fontWeight: '600',
    fontSize: moderateScale(15),
  },
  saveButton: {
    backgroundColor: '#ff6200',
    borderRadius: scale(12),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    marginTop: verticalScale(40),
    minHeight: verticalScale(56),
  },
  saveButtonText: {
    color: 'white',
    fontSize: moderateScale(17),
    fontWeight: 'bold',
  },
  saveButtonDisabled: {
    backgroundColor: '#ffba80',
  },
});
