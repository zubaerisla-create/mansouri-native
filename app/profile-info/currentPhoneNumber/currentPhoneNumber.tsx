// PhoneNumberScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  useWindowDimensions,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { ChevronDown, X } from 'lucide-react-native';
import { AppText as Text } from "@/src/components/AppText";
import { useTranslation } from "@/src/hooks/useTranslation";

// Country data type
interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

// Sample country data (you can expand this list)
const COUNTRIES: Country[] = [
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
];

export default function PhoneNumberScreen() {
  const { t, isRTL } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { height } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();

  const isButtonActive = phoneNumber.length >= 1 && !isSubmitting;

  // Responsive scaling factors
  const isSmallScreen = height < 700;
  const isLargeScreen = height > 800;
  
  // Responsive font sizes
  const getResponsiveFontSize = (baseSize: number) => {
    if (isSmallScreen) return baseSize * 0.9;
    if (isLargeScreen) return baseSize * 1.1;
    return baseSize;
  };

  // Responsive spacing
  const getResponsiveSpacing = (baseSpacing: number) => {
    if (isSmallScreen) return baseSpacing * 0.8;
    if (isLargeScreen) return baseSpacing * 1.2;
    return baseSpacing;
  };

  // Responsive padding
  const responsivePadding = getResponsiveSpacing(24);
  const responsiveMarginTop = getResponsiveSpacing(64);
  const responsiveInputPadding = getResponsiveSpacing(14);

  // Filter countries based on search
  const filteredCountries = searchQuery 
    ? COUNTRIES.filter(country => 
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.dialCode.includes(searchQuery) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : COUNTRIES;

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsCountryModalVisible(false);
    setSearchQuery('');
    // Focus on phone input after country selection
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Validate phone number
  const validatePhoneNumber = (number: string): boolean => {
    // Remove all non-digit characters
    const cleanedNumber = number.replace(/\D/g, '');
    
    // Basic validation - check if it's a valid length (usually 7-15 digits)
    // You can adjust this based on your requirements
    if (cleanedNumber.length < 7 || cleanedNumber.length > 15) {
      return false;
    }
    
    // Additional validation based on country code if needed
    switch (selectedCountry.code) {
      case 'SA': // Saudi Arabia
        return cleanedNumber.length === 9; // Saudi numbers are 9 digits without country code
      case 'US':
        return cleanedNumber.length === 10; // US numbers are 10 digits
      case 'IN':
        return cleanedNumber.length === 10; // Indian numbers are 10 digits
      default:
        return cleanedNumber.length >= 7 && cleanedNumber.length <= 15;
    }
  };

  // Format phone number
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format based on country
    switch (selectedCountry.code) {
      case 'SA': // Saudi Arabia format: 5XX XXX XXXX
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
      case 'US': // US format: (XXX) XXX-XXXX
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      default:
        // Default formatting: groups of 3 or 4 digits
        const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
        if (!match) return cleaned;
        const groups = match.slice(1).filter(Boolean);
        return groups.join(' ');
    }
  };

  // Handle phone number change
  const handlePhoneNumberChange = (value: string) => {
    // Remove any formatting for storage
    const cleaned = value.replace(/\D/g, '');
    setPhoneNumber(cleaned);
    setError(null); // Clear any previous errors
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 1) {
      setError(t('phoneErrorEmpty'));
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError(t('phoneErrorInvalid'));
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Format the phone number for display
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      
      // Here you would typically make an API call to send OTP
      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to OTP verification screen
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { 
          phoneNumber: `${selectedCountry.dialCode}${phoneNumber}`,
          formattedPhoneNumber: `${selectedCountry.dialCode} ${formattedPhoneNumber}`,
          countryCode: selectedCountry.code 
        }
      });

    } catch (err) {
      console.error('Error submitting phone number:', err);
      Alert.alert(
        t('error'),
        t('tryAgainError'),
        [{ text: t('ok') }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard submit
  const handleKeyPress = ({ nativeEvent }: any) => {
    if (nativeEvent.key === 'Enter' || nativeEvent.key === 'done') {
      handleSubmit();
    }
  };

  // Render country item in modal
  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      className="flex-row items-center py-3 px-4 border-b border-gray-100 active:bg-gray-50"
      onPress={() => handleCountrySelect(item)}
    >
      <Text className={`text-2xl ${isRTL ? 'ml-3' : 'mr-3'}`}>{item.flag}</Text>
      <Text className={`flex-1 text-gray-800 font-medium ${isRTL ? 'text-right' : 'text-left'}`} style={{ fontSize: getResponsiveFontSize(16) }}>
        {item.name}
      </Text>
      <Text className="text-gray-600" style={{ fontSize: getResponsiveFontSize(16) }}>
        {item.dialCode}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-4 md:px-8" style={{ paddingHorizontal: responsivePadding }}>
            <View className="flex-1 justify-between min-h-[500]">
              
              {/* Top Section */}
    <View className="pt-16">
  {/* Logo */}
  <Image
    source={require('@/assets/images/artboard.png')}
    style={{
      width: 120,
      
      resizeMode: 'contain',
      alignSelf: 'center',
      marginBottom: getResponsiveSpacing(20),
    }}
  />

  {/* Title */}
  <Text bold
    className={`text-gray-800 font-semibold ${isRTL ? 'text-right' : 'text-left'}`}
    style={{ 
      fontSize: getResponsiveFontSize(22),
      marginBottom: getResponsiveSpacing(2)
    }}
  >
    {t('phoneNumberTitle')}
  </Text>

  {/* Subtitle */}
  <Text 
    className={`text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}
    style={{ 
      fontSize: getResponsiveFontSize(16),
      marginBottom: getResponsiveSpacing(40),
      lineHeight: getResponsiveFontSize(24)
    }}
  >
    {t('enterYourPhoneNumberSubtitle')}
  </Text>

  {/* Input Container */}
  <View className="w-full max-w-md mx-auto">
    <View 
      className={`flex-row items-center border rounded-xl px-4 bg-gray-50 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      style={{ 
        paddingVertical: responsiveInputPadding,
        minHeight: getResponsiveSpacing(56)
      }}
    >
      {/* Country Code Selector */}
      <TouchableOpacity
        className={`flex-row items-center active:opacity-70 ${isRTL ? 'ml-3' : 'mr-3'}`}
        onPress={() => setIsCountryModalVisible(true)}
        activeOpacity={0.7}
        disabled={isSubmitting}
      >
        <Text 
          className={isRTL ? "ml-1.5" : "mr-1.5"}
          style={{ fontSize: getResponsiveFontSize(24) }}
        >
          {selectedCountry.flag}
        </Text>
        <Text bold
          className={`font-medium text-gray-800 ${isRTL ? 'ml-1' : 'mr-1'}`}
          style={{ fontSize: getResponsiveFontSize(18) }}
        >
          {selectedCountry.dialCode}
        </Text>
        <ChevronDown size={getResponsiveFontSize(18)} color="#4B5563" />
      </TouchableOpacity>

      {/* Separator */}
      <View 
        className="w-px mx-3 bg-gray-300"
        style={{ height: getResponsiveSpacing(24) }}
      />

      {/* Phone input */}
      <TextInput
        ref={inputRef}
        className={`flex-1 text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}
        style={{ 
          fontSize: getResponsiveFontSize(18),
          minHeight: getResponsiveSpacing(24)
        }}
        placeholder={t('enterPhoneNumber')}
        placeholderTextColor="#9CA3AF"
        keyboardType="phone-pad"
        maxLength={15}
        value={formatPhoneNumber(phoneNumber)}
        onChangeText={handlePhoneNumberChange}
        onKeyPress={handleKeyPress}
        autoFocus={!isSmallScreen}
        returnKeyType="done"
        enablesReturnKeyAutomatically
        blurOnSubmit={false}
        editable={!isSubmitting}
      />
    </View>

    {/* Error message */}
    {error && (
      <Text 
        className="text-red-500 text-center mt-2"
        style={{ 
          fontSize: getResponsiveFontSize(14),
          lineHeight: getResponsiveFontSize(20)
        }}
      >
        {error}
      </Text>
    )}

    {/* Helper text */}
    <Text 
      className="text-gray-500 text-center mt-3"
      style={{ 
        fontSize: getResponsiveFontSize(14),
        lineHeight: getResponsiveFontSize(20)
      }}
    >
      {t('verificationHelper2')}
    </Text>
  </View>
</View>


              {/* Bottom Button */}
              <View 
                className="w-full max-w-md mx-auto"
                style={{ 
                  marginBottom: Platform.OS === 'ios' ? getResponsiveSpacing(20) : getResponsiveSpacing(32),
                  marginTop: getResponsiveSpacing(20)
                }}
              >
                <TouchableOpacity
                  className={`
                    w-full rounded-full items-center justify-center
                    ${isButtonActive ? 'bg-orange-500' : 'bg-orange-300'}
                    ${isSubmitting ? 'opacity-70' : ''}
                  `}
                  style={{ 
                    paddingVertical: getResponsiveSpacing(16),
                    minHeight: getResponsiveSpacing(56)
                  }}
                  disabled={!isButtonActive || isSubmitting}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <Text bold
                      className="text-white font-semibold"
                      style={{ fontSize: getResponsiveFontSize(18) }}
                    >
                      {t('sending')}
                    </Text>
                  ) : (
                    <Text bold
                      className="text-white font-semibold"
                      style={{ fontSize: getResponsiveFontSize(18) }}
                    >
                      {t('continue')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Selection Modal */}
      <Modal
        visible={isCountryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCountryModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsCountryModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableWithoutFeedback>
              <View 
                className="bg-white rounded-t-3xl max-h-3/4"
                style={{ 
                  paddingBottom: Platform.OS === 'ios' ? 34 : 20,
                }}
              >
                {/* Modal Header */}
                <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
                  <Text bold
                    className="text-gray-800 font-semibold"
                    style={{ fontSize: getResponsiveFontSize(20) }}
                  >
                    {t('selectCountry')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsCountryModalVisible(false)}
                    className="p-2"
                    activeOpacity={0.7}
                  >
                    <X size={getResponsiveFontSize(24)} color="#4B5563" />
                  </TouchableOpacity>
                </View>

                {/* Search Input */}
                <View className="px-4 py-3 border-b border-gray-200">
                  <TextInput
                    className={`bg-gray-100 rounded-lg px-4 py-3 text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}
                    style={{ fontSize: getResponsiveFontSize(16) }}
                    placeholder={t('searchCountry')}
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus={true}
                  />
                </View>

                {/* Countries List */}
                <FlatList
                  data={filteredCountries}
                  renderItem={renderCountryItem}
                  keyExtractor={(item) => item.code}
                  showsVerticalScrollIndicator={true}
                  className="max-h-96"
                  ListEmptyComponent={
                    <View className="py-8 items-center">
                      <Text className="text-gray-500" style={{ fontSize: getResponsiveFontSize(16) }}>
                        {t('noCountries')}
                      </Text>
                    </View>
                  }
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}4