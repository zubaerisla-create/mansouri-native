import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Image, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useCart } from '@/src/hooks/useCart';
import api from '@/src/services/api';
import { MenuItem, MenuResponse, ModifierGroup, ModifierOption } from '@/src/types';

// No local type defs needed, using src/types


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
  // IDs from params
  const restaurantId = params.id || params.restaurantId;
  const itemId = params.itemId;

  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({}); // groupId -> optionIds[]

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!restaurantId || !itemId) {
        throw new Error(`Missing restaurant (${restaurantId}) or item (${itemId}) ID`);
      }

      console.log(`Fetching details for item ${itemId} from restaurant ${restaurantId}`);
      const item = await api.getRestaurantItem(restaurantId, itemId);
      console.log('Fetched item details:', item);
      
      setItem({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
        calories: item.calories,
        dietary_info: item.dietary_info || [],
        modifier_groups: item.modifier_groups || [],
        image: item.image || item.photo
      });
      
      // Initialize selected options with defaults or empty based on min_select
      const initialOptions: Record<string, string[]> = {};
      (item.modifier_groups || []).forEach((group: any) => {
        initialOptions[group.id] = [];
      });
      setSelectedOptions(initialOptions);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load item details. Please try again.';
      setError(errorMessage);
      console.error("Error fetching item details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, [restaurantId, itemId]);

  const calculateTotal = useMemo(() => {
    if (!item) return 0;
    let total = parseFloat(item.price);

    // Sum up all selected options
    Object.values(selectedOptions).flat().forEach(optionId => {
      // Find the option price
      for (const group of item.modifier_groups) {
        const option = group.options.find(o => o.id === optionId);
        if (option) {
          total += parseFloat(option.price);
          break;
        }
      }
    });

    return total * quantity;
  }, [item, selectedOptions, quantity]);

  const toggleOption = (groupId: string, optionId: string, group: ModifierGroup) => {
    setSelectedOptions(prev => {
      const current = prev[groupId] || [];
      const isSelected = current.includes(optionId);
      
      let next: string[];
      if (isSelected) {
        // Can only deselect if we are above min_select (optional groups usually have min=0)
        next = current.filter(id => id !== optionId);
      } else {
        // Check max_select rule
        if (group.max_select === 1) {
          // Radio behavior: replace existing
          next = [optionId];
        } else {
          // Checkbox behavior: add if below max
          if (current.length < group.max_select) {
            next = [...current, optionId];
          } else {
            // Alert user?
            return prev;
          }
        }
      }
      return { ...prev, [groupId]: next };
    });
  };

  const validateSelection = () => {
    if (!item) return false;
    for (const group of item.modifier_groups) {
      const selections = selectedOptions[group.id] || [];
      if (selections.length < group.min_select) {
        Alert.alert('Required Selection', `Please select at least ${group.min_select} from ${group.name}`);
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!item || !restaurantId) {
      console.warn("Item or Restaurant ID missing:", { item, restaurantId });
      return;
    }
    
    if (!validateSelection()) return;

    try {
      const payload = {
        branch_id: restaurantId,
        menu_item_id: item.id,
        quantity,
        selected_options: Object.values(selectedOptions).flat()
      };

      console.log("Adding to cart with payload:", payload);
      await (addToCart(payload) as any).unwrap();
      
      Alert.alert('Success', 'Item added to cart!');
      router.push('/order-process/cart/cart');
    } catch (err) {
      console.error("Failed to add to cart:", err);
      Alert.alert('Error', typeof err === 'string' ? err : 'Failed to add item to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-xl text-gray-600">Loading item details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-red-50 rounded-2xl p-6 border border-red-200 items-center">
            <Feather name="alert-circle" size={48} color="#dc2626" />
            <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
              Unable to Load Item
            </Text>
            <Text className="text-base text-gray-600 mt-3 text-center leading-5">
              {error}
            </Text>
            <View className="flex-row gap-3 mt-6 w-full">
              <TouchableOpacity
                onPress={fetchItemDetails}
                className="flex-1 bg-orange-600 rounded-lg py-3"
              >
                <Text className="text-white font-semibold text-center">
                  Try Again
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex-1 bg-gray-300 rounded-lg py-3"
              >
                <Text className="text-gray-800 font-semibold text-center">
                  Go Back
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
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

  const total = calculateTotal;

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

          {/* Dynamic Modifier Groups */}
          {item.modifier_groups.map((group) => (
            <View key={group.id} className="mt-8">
              <View className='flex-row items-center justify-between p-2' >
                <Text className="text-xl font-semibold text-gray-900">{group.name}</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-gray-500 text-xs">
                    {group.min_select > 0 ? `Select min ${group.min_select}` : 'Optional'}
                  </Text>
                  {group.min_select > 0 && (
                    <Text className='text-red-600 p-2 rounded-full bg-red-100 text-xs' >Required</Text>
                  )}
                </View>
              </View>
              <View className="bg-gray-50 rounded-xl p-4">
                {group.options.map((option, index) => {
                  const isSelected = (selectedOptions[group.id] || []).includes(option.id);
                  const isRadio = group.max_select === 1;

                  return (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => toggleOption(group.id, option.id, group)}
                      className={`flex-row items-center justify-between py-4 ${index < group.options.length - 1 ? 'border-b border-gray-200' : ''}`}
                    >
                      <View className="flex-row items-center">
                        <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-400'}`}>
                          {isSelected && <Feather name={isRadio ? "circle" : "check"} size={14} color="white" />}
                        </View>
                        <Text className="text-base">{option.name}</Text>
                      </View>
                      {parseFloat(option.price) > 0 && (
                        <Text className="text-orange-600 font-medium">+{parseFloat(option.price).toFixed(2)} SAR</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

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