import Header from "@/src/components/Home/HomePageHeader/Header";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    ScrollView,
    TouchableOpacity,
    View,
} from "react-native";
import { AppText as Text } from "@/src/components/AppText";
import { useTranslation } from "@/src/hooks/useTranslation";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = [
  { id: "1", name: "Burgers", icon: "🍔" },
  { id: "2", name: "Pizza", icon: "🍕" },
  { id: "3", name: "Shawarma", icon: "🥙" },
  { id: "4", name: "Asian", icon: "🍜" },
];

const nearbyRestaurants = [
  {
    id: "1",
    name: "Burger House",
    cuisine: "Burgers",
    rating: 4.5,
    deliveryTime: "25",
    minOrder: "25 SAR",
    distance: "0.8 km",
    discount: "20% off first order",
    image:
      "https://shorturl.at/RnOWh",
  },
  {
    id: "2",
    name: "Shawarma Express",
    cuisine: "Shawarma",
    rating: 4.7,
    deliveryTime: "20",
    minOrder: "20 SAR",
    distance: "1.2 km",
    discount: "",
    image:
      "https://shorturl.at/p1glq",
  },
  {
    id: "3",
    name: "Pizza Palace",
    cuisine: "Pizza",
    rating: 4.7,
    deliveryTime: "20",
    minOrder: "20 SAR",
    distance: "1.2 km",
    discount: "15% off",
    image:
      "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=800&auto=format&fit=crop",
  },
  {
    id: "4",
    name: "Asian Delight",
    cuisine: "Asian",
    rating: 4.3,
    deliveryTime: "30",
    minOrder: "30 SAR",
    distance: "1.5 km",
    discount: "",
    image:
      "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=800&auto=format&fit=crop",
  },
];

export default function HomeScreen() {
  const [filteredRestaurants, setFilteredRestaurants] =
    useState(nearbyRestaurants);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

  const handleSearch = (text: string) => {
    setSearchText(text);
    applyFilters(text, selectedCategory);
  };

  const handleCategory = (category: string) => {
    const newCategory = selectedCategory === category ? "" : category;
    setSelectedCategory(newCategory);
    applyFilters(searchText, newCategory);
  };

  const applyFilters = (search: string, category: string) => {
    let list = nearbyRestaurants;

    if (search.trim() !== "") {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.cuisine.toLowerCase().includes(q),
      );
    }

    if (category !== "") {
      const cat = category.toLowerCase();
      list = list.filter((item) => item.cuisine.toLowerCase().includes(cat));
    }

    setFilteredRestaurants(list);
  };

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

          {filteredRestaurants.length === 0 ? (
            <Text className="text-center text-gray-500 mt-8 text-base">
              {t('noResult')}
            </Text>
          ) : (
            <FlatList
              data={filteredRestaurants}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View className="h-4" />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: "/restaurant/[id]",
                      params: { id: item.id },
                    });
                  }}
                  activeOpacity={0.9}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-black/10 mb-2"
                >
                  <View className="flex-row items-center gap-6 ps-4">
                    {/* Image on the left side */}
                    <View className="w-28 rounded-full">
                      <Image
                        source={{ uri: item.image }}
                        className="w-full h-28 rounded-xl"
                        resizeMode="cover"
                      />
                    </View>

                    {/* Details on the right side */}
                    <View className="flex-1 ">
                      <Text className="text-lg font-bold text-black">
                        {item.name}
                      </Text>
                      <Text className="text-sm text-gray-600 mt-1">
                        {item.cuisine}
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
                            {item.rating}
                          </Text>
                        </View>
                     
                      </View>

                 <View className="flex-row items-center gap-4" >
                       <View className="flex-row items-center ">
                        <Feather name="map-pin" size={14} color="#666" />
                        <Text className="ms-1 text-xs text-gray-500">
                          {item.distance}
                        </Text>
                      </View>

                      <Text className=" text-sm text-gray-600">
                        {t('minOrder')}{item.minOrder}
                      </Text>
                 </View>
</View>
                      
                    </View>

                  </View>

<Text className="border-1 bg-gray-100 h-1 mt-4" ></Text>




                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}