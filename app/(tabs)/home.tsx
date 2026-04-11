import Header from "@/src/components/Home/HomePageHeader/Header";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
    FlatList,
    Image,
    ScrollView,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import api from "@/src/services/api";
import { AppText as Text } from "@/src/components/AppText";
import { useTranslation } from "@/src/hooks/useTranslation";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = [
  { id: "1", name: "Burgers", icon: "🍔" },
  { id: "2", name: "Pizza", icon: "🍕" },
  { id: "3", name: "Shawarma", icon: "🥙" },
  { id: "4", name: "Asian", icon: "🍜" },
];

export default function HomeScreen() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { t } = useTranslation();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch from API
  useEffect(() => {
    fetchRestaurants(debouncedSearch);
  }, [debouncedSearch]);

  const fetchRestaurants = async (query: string) => {
    try {
      setLoading(true);
      setError("");
      const res = await api.searchRestaurants(query);
      setRestaurants(res?.data || []);
      setMeta(res?.meta || null);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch restaurants");
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleCategory = (category: string) => {
    const newCategory = selectedCategory === category ? "" : category;
    setSelectedCategory(newCategory);
  };

  const getFilteredRestaurants = () => {
    if (!selectedCategory) return restaurants;
    const cat = selectedCategory.toLowerCase();
    return restaurants.filter((item) => 
      item?.category_name?.toLowerCase().includes(cat) ||
      item?.cuisine?.toLowerCase().includes(cat)
    );
  };

  const filteredRestaurants = getFilteredRestaurants();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header onSearch={handleSearch} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-4">
          <Text className="text-xl font-bold text-black mb-3">{t('categories')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingEnd: 16 }}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.7}
                onPress={() => handleCategory(cat.name)}
                className={`items-center me-6 p-2 rounded-xl ${
                  selectedCategory === cat.name ? "bg-[#FF5101]" : ""
                }`}
              >
                <Text className="text-5xl mb-2">{cat.icon}</Text>
                <Text
                  className={`text-sm py-0 text-center ${
                    selectedCategory === cat.name
                      ? "text-white font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="px-4 mt-6 pb-6">
          <View className="flex-row justify-between p-2">
            <Text className="text-xl font-bold text-black mb-3">
              {t('nearbyRestaurants')}
            </Text>
            <Feather name="map-pin" size={20} color="#4169E1" />
          </View>

          {meta?.total !== undefined && (
            <Text className="text-sm text-gray-500 mb-2">
              {meta.total} {t('results found')} {meta.page && meta.total_pages ? `(Page ${meta.page} of ${meta.total_pages})` : ''}
            </Text>
          )}

          {loading ? (
            <View className="py-8">
               <ActivityIndicator size="large" color="#FF5101" />
            </View>
          ) : error ? (
            <Text className="text-center text-red-500 mt-8 text-base">
              {error}
            </Text>
          ) : filteredRestaurants.length === 0 ? (
            <Text className="text-center text-gray-500 mt-8 text-base">
              {t('noResult')}
            </Text>
          ) : (
            <FlatList
              data={filteredRestaurants}
              keyExtractor={(item) => item.id?.toString() || item.uuid || Math.random().toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View className="h-4" />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: "/restaurant/[id]",
                      params: { id: item.id || item.uuid },
                    });
                  }}
                  activeOpacity={0.9}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-black/10 mb-2"
                >
                  <View className="flex-row items-center gap-6 ps-4">
                    {/* Image on the left side */}
                    <View className="w-28 rounded-full">
                      <Image
                        source={{ uri: item.logo || "https://placehold.co/150x150/png" }}
                        className="w-full h-28 rounded-xl"
                        resizeMode="cover"
                      />
                    </View>

                    {/* Details on the right side */}
                    <View className="flex-1 ">
                      <Text className="text-lg font-bold text-black" numberOfLines={1}>
                        {item.brand_name || item.name}
                      </Text>
                      <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
                        {item.short_description || item.category_name}
                      </Text>

                      {item.discount ? (
                        <View className="mt-3 self-start bg-[#22C55E1A] px-3 py-1 rounded-full">
                          <Text className="text-green-500 text-xs font-medium">
                            {item.discount}
                          </Text>
                        </View>
                      ) : null}

                      <View className="flex-row gap-4 items-center mt-3" >
                        <View className="flex-row items-center">
                          <View className="flex-row items-center">
                            <Feather name="star" size={16} color="#FFD700" />
                            <Text className="ms-1 text-sm text-gray-800">
                              {item.rating || "4.0"}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-center gap-4" >
                          <View className="flex-row items-center ">
                            <Feather name="map-pin" size={14} color="#666" />
                            <Text className="ms-1 text-xs text-gray-500" numberOfLines={1} style={{maxWidth: 100}}>
                              {item.city ? `${item.city}, ${item.short_address || ''}` : (item.distance || "N/A")}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  <Text className="border-t-2 border-gray-100 h-1 mt-4" ></Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}