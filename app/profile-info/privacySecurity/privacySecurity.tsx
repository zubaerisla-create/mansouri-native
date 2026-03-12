import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text } from "@/src/components/AppText";
import { useTranslation } from "@/src/hooks/useTranslation";

const PrivacySecurity = () => {
  const { t, isRTL } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      {/* Header with safe area handling */}
      <View 
        className="flex-row items-center border-b border-gray-200 px-4"
        style={{ paddingTop: insets.top }}
      >
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="p-2"
        >
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={28} color="#000" />
        </TouchableOpacity>
        <Text bold className={`text-xl font-semibold flex-1 ${isRTL ? 'mr-4 text-right' : 'ml-4 text-left'}`}>
          {t('privacySecurityTitle')}
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-6">
          {/* Introduction Section */}
          <Text bold className={`text-lg font-semibold text-gray-800 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('privacyIntroTitle')}
          </Text>
          
          <Text className={`text-base text-gray-600 leading-relaxed mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('privacyIntroDesc')}
          </Text>

          {/* Information We Collect */}
          <Text bold className={`text-xl font-bold text-gray-900 mt-2 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('infoWeCollectTitle')}
          </Text>
          
          <Text className={`text-base text-gray-600 leading-relaxed mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('infoWeCollectDesc')}
          </Text>

          <View className={`flex-row mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('collectPhone')}
            </Text>
          </View>

          <View className={`flex-row mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('collectLocation')}
            </Text>
          </View>

          <View className={`flex-row mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('collectCar')}
            </Text>
          </View>

          <View className={`flex-row mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('collectOrder')}
            </Text>
          </View>

          <Text className={`text-sm text-gray-500 italic mt-2 mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('paymentProviderNote')}
          </Text>

          {/* How We Use Your Information */}
          <Text bold className={`text-xl font-bold text-gray-900 mt-2 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('howWeUseDataTitle')}
          </Text>
          
          <Text className={`text-base text-gray-600 leading-relaxed mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('howWeUseDataDesc')}
          </Text>

          <View className={`flex-row mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('useDataVerify')}
            </Text>
          </View>

          <View className={`flex-row mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('useDataShowRest')}
            </Text>
          </View>

          <View className={`flex-row mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('useDataNotify')}
            </Text>
          </View>

          <View className={`flex-row mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('useDataEnsureCurbside')}
            </Text>
          </View>

          <View className={`flex-row mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('useDataImproveApp')}
            </Text>
          </View>

          {/* Location Privacy */}
          <Text bold className={`text-xl font-bold text-gray-900 mt-2 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('locationPrivacyTitle')}
          </Text>

          <View className={`flex-row mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('locPrivacyExact')}
            </Text>
          </View>

          <View className={`flex-row mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('locPrivacyETA')}
            </Text>
          </View>

          <View className={`flex-row mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('locPrivacyNoMap')}
            </Text>
          </View>

          {/* Data Protection */}
          <Text bold className={`text-xl font-bold text-gray-900 mt-2 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('dataProtectionTitle')}
          </Text>
          
          <Text className={`text-base text-gray-600 leading-relaxed mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('dataProtectionDesc')}
          </Text>

          <View className={`flex-row mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('dataProtSecure')}
            </Text>
          </View>

          <View className={`flex-row mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('dataProtLimit')}
            </Text>
          </View>

          <View className={`flex-row mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
            <Text className={`text-base text-gray-600 flex-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('dataProtReg')}
            </Text>
          </View>

          {/* Final Note */}
          <Text bold className={`text-base text-gray-600 font-medium mt-4 mb-6 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('dataProtFinal')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default PrivacySecurity;