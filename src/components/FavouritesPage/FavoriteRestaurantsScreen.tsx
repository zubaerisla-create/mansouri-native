import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Heart, ChevronRight, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCart } from '@/src/context/CartContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import { AppText as Text } from '../AppText';

export default function FavoriteRestaurantsScreen() {
  const router = useRouter();
  const { favorites, removeFavorite } = useCart();
  const { t, isRTL } = useTranslation();

  const handleRemoveFavorite = (restaurantId: string, restaurantName: string) => {
    Alert.alert(
      t('removeFromFavs'),
      t('confirmRemoveFav').replace('{name}', restaurantName),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('remove'),
          style: 'destructive',
          onPress: () => {
            removeFavorite(restaurantId);
          },
        },
      ]
    );
  };

  const handleRestaurantPress = (restaurantId: string) => {
    router.push(`/restaurant/${restaurantId}`);
  };

  const getCuisineEmoji = (cuisine: string) => {
    switch (cuisine.toLowerCase()) {
      case 'burgers':
        return '🍔';
      case 'pizza':
      case 'italian':
        return '🍕';
      case 'chinese':
        return '🍜';
      case 'mexican':
        return '🌮';
      case 'indian':
        return '🍛';
      case 'sushi':
      case 'japanese':
        return '🍣';
      case 'seafood':
        return '🐟';
      case 'desserts':
        return '🍰';
      case 'coffee':
        return '☕';
      default:
        return '🍴';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text bold style={{ fontSize: 24, fontWeight: '700', textAlign: isRTL ? 'right' : 'left' }}>
          {t('favRestaurants')}
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 4, textAlign: isRTL ? 'right' : 'left' }}>
          {favorites.length} {favorites.length === 1 ? t('restaurantSaved') : t('restaurantsSaved')}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        {favorites.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
            <Heart size={64} color="#ccc" />
            <Text style={{ fontSize: 18, color: '#666', marginTop: 16, textAlign: 'center' }}>
              {t('noFavs')}
            </Text>
            <Text style={{ fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
              {t('addFavHint')}
            </Text>
          </View>
        ) : (
          favorites.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              activeOpacity={0.7}
              onPress={() => handleRestaurantPress(restaurant.id)}
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
              }}
            >
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 16, flex: 1 }}>
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: restaurant.image }}
                    style={{ width: 60, height: 60, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: -5,
                      [isRTL ? 'left' : 'right']: -5,
                      backgroundColor: 'white',
                      borderRadius: 10,
                      width: 24,
                      height: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#eee',
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>
                      {getCuisineEmoji(restaurant.cuisine)}
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text 
                      bold
                      style={{ 
                        fontSize: 16, 
                        fontWeight: '600', 
                        color: '#000',
                        flex: 1,
                        [isRTL ? 'marginLeft' : 'marginRight']: 8,
                        textAlign: isRTL ? 'right' : 'left'
                      }}
                      numberOfLines={1}
                    >
                      {restaurant.name}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(restaurant.id, restaurant.name);
                      }}
                      style={{ padding: 4 }}
                    >
                      <Trash2 size={18} color="#ff4d4d" />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ fontSize: 14, color: '#666', marginTop: 2, textAlign: isRTL ? 'right' : 'left' }}>
                    {restaurant.cuisine}
                  </Text>
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginTop: 4, gap: 12 }}>
                
               
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}