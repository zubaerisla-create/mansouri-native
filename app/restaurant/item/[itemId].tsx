import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  Image, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useCart } from '@/src/context/CartContext';
import api from '@/src/services/api';

// টাইপ ডেফিনিশন
interface RestaurantItem {
  id: string;
  name: string;
  description: string;
  calories: number;
  price: string;
  image: string;
  category: 'main' | 'sides';
  hasOffer?: boolean;
}

interface Restaurant {
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  minOrder: string;
  distance: string;
  hours: string;
  discount?: string;
  image: string;
  items: RestaurantItem[];
}


type SpicyLevel = 'None' | 'Hot' | 'Extra Hot';

export default function ItemDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    id?: string; 
    itemId?: string;
    restaurantId?: string;
  }>();

  const { addToCart, getTotalItems } = useCart();
  const cartCount = getTotalItems();
  
  // ডিবাগ করার জন্য console.log
  console.log('Params:', params);
  
  // Params থেকে ডাটা নেওয়া - multiple ways
  const restaurantId = params.id || params.restaurantId || '1';
  const itemId = params.itemId || '1';

  const [item, setItem] = useState<RestaurantItem | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [size, setSize] = useState<'Regular' | 'Large'>('Regular');
  const [quantity, setQuantity] = useState(1);
  const [extraCheese, setExtraCheese] = useState(false);
  const [bacon, setBacon] = useState(false);
  const [avocado, setAvocado] = useState(false);
  const [spicy, setSpicy] = useState<SpicyLevel>('None');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        console.log('Looking for restaurant:', restaurantId, 'item:', itemId);

        const res = await api.getRestaurant(restaurantId as string);
        const foundRestaurant = res?.data || res;
        
        if (foundRestaurant) {
          const formattedRestaurant = {
            ...foundRestaurant,
            name: foundRestaurant.brand_name || foundRestaurant.name,
            cuisine: foundRestaurant.short_description || foundRestaurant.cuisine || foundRestaurant.category_name,
            image: foundRestaurant.logo || foundRestaurant.image,
            items: foundRestaurant.items || [],
          };
          setRestaurant(formattedRestaurant);
          
          let foundItem = formattedRestaurant.items?.find((i: any) => i.id?.toString() === itemId || i.uuid === itemId);
          
          if (!foundItem) {
            try {
               const itemRes = await api.getRestaurantItem(itemId as string);
               foundItem = itemRes?.data || itemRes;
            } catch (err) {
               console.log("Could not fetch individual item", err);
            }
          }

          if (foundItem) {
            setItem({
               ...foundItem,
               name: foundItem.brand_name || foundItem.name,
               description: foundItem.short_description || foundItem.description,
               image: foundItem.logo || foundItem.image,
            });
          } else if (formattedRestaurant.items?.length > 0) {
            // fallback to first item
            setItem(formattedRestaurant.items[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching item resources:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [restaurantId, itemId]);

  // Calculate total price
  const calculateTotal = () => {
    if (!item) return 0;
    
    // SAR রিমুভ করা
    const priceStr = item.price?.toString().replace(' SAR', '').trim() || '0';
    const basePrice = parseFloat(priceStr) || 0;
    
    let total = basePrice;
    
    // Size adjustments
    if (size === 'Large') total += 5;
    
    // Add-ons
    if (extraCheese) total += 3;
    if (bacon) total += 5;
    if (avocado) total += 4;
    
    // Spicy level adjustments
    if (spicy === 'Hot') total += 3;
    if (spicy === 'Extra Hot') total += 5;
    
    // Apply quantity
    total *= quantity;
    
    return total;
  };

  const handleAddToCart = () => {
    if (!item || !restaurant) return;

    const priceStr = item.price?.toString().replace(' SAR', '').trim() || '0';
    let finalPrice = parseFloat(priceStr) || 0;

    if (size === 'Large') finalPrice += 5;
    if (extraCheese) finalPrice += 3;
    if (bacon) finalPrice += 5;
    if (avocado) finalPrice += 4;
    if (spicy === 'Hot') finalPrice += 3;
    if (spicy === 'Extra Hot') finalPrice += 5;

    const cartItem = {
      id: item.id,
      restaurantId,
      restaurantName: restaurant.name,
      name: item.name,
      price: finalPrice,
      quantity,
      size,
      extras: { extraCheese, bacon, avocado },
      spicyLevel: spicy,
      image: item.image,
    };

    // Add to cart context
    addToCart(cartItem);
    
    const total = calculateTotal();
    
    console.log('Added to cart:', cartItem);
    
    // Navigate to cart page immediately after adding
    router.push('/order-process/cart/cart');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-xl text-gray-600">Loading item details...</Text>
      </SafeAreaView>
    );
  }

  if (!item || !restaurant) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <View className="items-center">
          <Feather name="alert-circle" size={64} color="#ff6b6b" />
          <Text className="text-xl text-gray-600 mt-4">Item not found</Text>
          <Text className="text-gray-500 mt-2">Restaurant ID: {restaurantId}</Text>
          <Text className="text-gray-500">Item ID: {itemId}</Text>
          <TouchableOpacity 
            className="mt-6 bg-blue-500 px-6 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white text-lg">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const total = calculateTotal();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Item Image */}
        <Image
          source={{ uri: item.image }}
          className="w-full h-80"
          resizeMode="cover"
          defaultSource={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop' }}
        />

        {/* Restaurant Info */}
        <View className="px-5 pb-2 border-b border-gray-100">
       
        </View>

        {/* Item Details */}
        <View className="p-5">
          <Text className="text-3xl font-bold text-gray-900">{item.name}</Text>
          <Text className="text-gray-600 mt-3 text-base leading-6">
            {item.description}
          </Text>
          
          <View className="flex-row items-center justify-between mt-6">
            <View className="flex-row items-center">
              <View className='flex-col' >
                <Text className="text-gray-500">Calories</Text>
                <Text className='font-bold text-gray-900' >
                  {item.calories} calories
                </Text>
              </View>
            </View>

            <View className='flex-col' >
              <Text className="text-gray-500">Dietary Info</Text>
              <Text className="font-bold text-gray-900">
                Beef
              </Text>
            </View>
          </View>

          {/* Size Selection - FIXED SECTION */}
          <View className="mt-8">
            <View className='flex-row items-center justify-between p-2' >
              <Text className="text-xl font-semibold text-gray-900">Size</Text>
              <Text className='text-red-600 p-2 rounded-full bg-red-100' >Required</Text>
            </View>
            <View className="bg-gray-50 rounded-xl p-4">
              {[
                { label: 'Regular', key: 'Regular' as const, price: 0 },
                { label: 'Large', key: 'Large' as const, price: 5 },
              ].map((sizeOption, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSize(sizeOption.key)}
                  className={`flex-row items-center justify-between py-4 ${index < 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${size === sizeOption.key ? 'bg-orange-500 border-orange-500' : 'border-gray-400'}`}>
                      {size === sizeOption.key && <Feather name="check" size={14} color="white" />}
                    </View>
                    <Text className="text-base">{sizeOption.label}</Text>
                  </View>
                  {sizeOption.price > 0 && (
                    <Text className="text-orange-600 font-medium">+{sizeOption.price} SAR</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Add-ons */}
          <View className="mt-8">
            <Text className="text-xl font-semibold text-gray-900 mb-4">Add-ons</Text>
            <View className="bg-gray-50 rounded-xl p-4">
              {[
                { label: 'Extra Cheese', price: 3, state: extraCheese, setter: setExtraCheese },
                { label: 'Bacon', price: 5, state: bacon, setter: setBacon },
                { label: 'Avocado', price: 4, state: avocado, setter: setAvocado },
              ].map((addon, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => addon.setter(!addon.state)}
                  className={`flex-row items-center justify-between py-4 ${index < 2 ? 'border-b border-gray-200' : ''}`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${addon.state ? 'bg-orange-500 border-orange-500' : 'border-gray-400'}`}>
                      {addon.state && <Feather name="check" size={14} color="white" />}
                    </View>
                    <Text className="text-base">{addon.label}</Text>
                  </View>
                  <Text className="text-orange-600 font-medium">+{addon.price} SAR</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Spicy Level - FIXED SECTION */}
          <View className="mt-8">
            <Text className="text-xl font-semibold text-gray-900 mb-4">Spicy Level</Text>
            <View className="bg-gray-50 rounded-xl p-4">
              {[
                { label: 'None', level: 'None' as SpicyLevel, price: 0 },
                { label: 'Hot', level: 'Hot' as SpicyLevel, price: 3 },
                { label: 'Extra Hot', level: 'Extra Hot' as SpicyLevel, price: 5 },
              ].map((spicyOption, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSpicy(spicyOption.level)}
                  className={`flex-row items-center justify-between py-4 ${index < 2 ? 'border-b border-gray-200' : ''}`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${spicy === spicyOption.level ? 'bg-orange-500 border-orange-500' : 'border-gray-400'}`}>
                      {spicy === spicyOption.level && <Feather name="check" size={14} color="white" />}
                    </View>
                    <Text className="text-base">{spicyOption.label}</Text>
                  </View>
                  {spicyOption.price > 0 && (
                    <Text className="text-orange-600 font-medium">+{spicyOption.price} SAR</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity & Add to Cart */}
          <View className="mt-10 mb-8">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-semibold text-gray-900">Quantity</Text>
              <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                <TouchableOpacity 
                  onPress={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3"
                >
                  <Feather name="minus" size={24} color="#666" />
                </TouchableOpacity>
                <Text className="text-xl font-bold mx-6 min-w-[30px] text-center">{quantity}</Text>
                <TouchableOpacity 
                  onPress={() => setQuantity(q => q + 1)}
                  className="px-3"
                >
                  <Feather name="plus" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

    
            {/* Add to Cart Button */}
            <TouchableOpacity
              onPress={handleAddToCart}
              className="bg-orange-600 py-5 rounded-xl items-center shadow-lg"
            >
              <Text className="text-white text-xl font-bold">
                Add to Cart • {total.toFixed(2)} SAR
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-4 bg-white p-3 rounded-full shadow-lg"
      >
        <Feather name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      {/* Floating Cart Button with Count */}
      <TouchableOpacity
        onPress={() => router.push('/order-process/cart/cart')}
        className="absolute bottom-6 right-6 bg-orange-600 w-16 h-16 rounded-full items-center justify-center shadow-2xl border-2 border-white"
      >
        <Feather name="shopping-cart" size={28} color="white" />
        {cartCount > 0 && (
          <View className="absolute -top-2 -right-2 bg-red-500 min-w-[24px] h-6 rounded-full items-center justify-center border-2 border-white">
            <Text className="text-white text-xs font-bold px-2">
              {cartCount > 99 ? '99+' : cartCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}