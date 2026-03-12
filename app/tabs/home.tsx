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
  { id: "1", name: "burgers", icon: "🍔" },
  { id: "2", name: "pizza", icon: "🍕" },
  { id: "3", name: "shawarma", icon: "🥙" },
  { id: "4", name: "asian", icon: "🍜" },
];

const nearbyRestaurantsData = [
  {
    id: "1",
    nameKey: "burgerHouse",
    cuisineKey: "burgers",
    rating: 4.5,
    deliveryTime: "25",
    minOrderValue: 25,
    distanceValue: 0.8,
    discountKey: "offFirstOrder",
    image:
      "https://shorturl.at/RnOWh",
  },
  {
    id: "2",
    nameKey: "shawarmaExpress",
    cuisineKey: "shawarma",
    rating: 4.7,
    deliveryTime: "20",
    minOrderValue: 20,
    distanceValue: 1.2,
    discountKey: "",
    image:
      "https://shorturl.at/p1glq",
  },
  {
    id: "3",
    nameKey: "pizzaPalace",
    cuisineKey: "pizza",
    rating: 4.7,
    deliveryTime: "20",
    minOrderValue: 20,
    distanceValue: 1.2,
    discountKey: "off",
    image:
      "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=800&auto=format&fit=crop",
  },
  {
    id: "4",
    nameKey: "asianDelight",
    cuisineKey: "asian",
    rating: 4.3,
    deliveryTime: "30",
    minOrderValue: 30,
    distanceValue: 1.5,
    discountKey: "",
    image:
      "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=800&auto=format&fit=crop",
  },
];

export default function HomeScreen() {
  const { t, isRTL } = useTranslation();
  const [filteredRestaurants, setFilteredRestaurants] =
    useState(nearbyRestaurantsData);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const router = useRouter();


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
    let list = nearbyRestaurantsData;

    if (search.trim() !== "") {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          t(item.nameKey).toLowerCase().includes(q) ||
          t(item.cuisineKey).toLowerCase().includes(q)
      );
    }

    if (category !== "") {
      list = list.filter((item) => item.cuisineKey === category);
    }

    setFilteredRestaurants(list);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <Header onSearch={handleSearch} />

        {/* Categories Section */}
        <View style={{ marginTop: 20 }}>
          <View
            style={{
              paddingHorizontal: 20,
              flexDirection: isRTL ? "row-reverse" : "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Text bold style={{ fontSize: 18, fontWeight: "700" }}>
              {t("categories")}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 15, flexDirection: isRTL ? "row-reverse" : "row" }}
          >
            {categories.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleCategory(item.name)}
                style={{
                  alignItems: "center",
                  marginHorizontal: 8,
                  padding: 12,
                  borderRadius: 20,
                  backgroundColor:
                    selectedCategory === item.name ? "#FF6B00" : "#F5F5F5",
                  minWidth: 80,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                </View>
                <Text
                  bold
                  style={{
                    fontSize: 14,
                    color: selectedCategory === item.name ? "#FFF" : "#333",
                  }}
                >
                  {t(item.name)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Nearby Restaurants Section */}
        <View style={{ marginTop: 30 }}>
          <View
            style={{
              paddingHorizontal: 20,
              flexDirection: isRTL ? "row-reverse" : "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Text bold style={{ fontSize: 18, fontWeight: "700" }}>
              {t("nearbyRestaurants")}
            </Text>
            <TouchableOpacity>
              <Text style={{ color: "#FF6B00" }}>{t("seeAll")}</Text>
            </TouchableOpacity>
          </View>

          {filteredRestaurants.length === 0 ? (
            <View
              style={{ padding: 40, alignItems: "center", opacity: 0.5 }}
            >
              <Feather name="search" size={48} color="#ccc" />
              <Text style={{ marginTop: 10, fontSize: 16 }}>
                {t("noResult")}
              </Text>
            </View>
          ) : (
            filteredRestaurants.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => router.push(`/restaurant/${item.id}`)}
                style={{
                  marginHorizontal: 20,
                  marginBottom: 20,
                  backgroundColor: "#fff",
                  borderRadius: 15,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "#eee",
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  style={{ width: "100%", height: 180 }}
                />
                {item.discountKey && (
                  <View
                    style={{
                      position: "absolute",
                      top: 15,
                      [isRTL ? "right" : "left"]: 15,
                      backgroundColor: "#FF6B00",
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                    }}
                  >
                    <Text bold style={{ color: "#fff", fontSize: 12 }}>
                      {t(item.discountKey).replace('{percent}', '20%')}
                    </Text>
                  </View>
                )}
                <View style={{ padding: 15 }}>
                  <View
                    style={{
                      flexDirection: isRTL ? "row-reverse" : "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text bold style={{ fontSize: 18, fontWeight: "700" }}>
                      {t(item.nameKey)}
                    </Text>
                    <View
                      style={{
                        flexDirection: isRTL ? "row-reverse" : "row",
                        alignItems: "center",
                        backgroundColor: "#FFF9F5",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                      }}
                    >
                      <Feather name="star" size={14} color="#FF6B00" />
                      <Text
                        bold
                        style={{
                          fontSize: 14,
                          color: "#FF6B00",
                          [isRTL ? "marginRight" : "marginLeft"]: 4,
                        }}
                      >
                        {item.rating}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      color: "#666",
                      marginTop: 4,
                      textAlign: isRTL ? "right" : "left",
                    }}
                  >
                    {t(item.cuisineKey)} • {item.deliveryTime} {t("minutes")}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 10,
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Feather name="map-pin" size={14} color="#666" />
                      <Text style={{ fontSize: 12, color: "#666", marginLeft: 4 }}>
                        {item.distanceValue} {t("km")}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: "#999" }}>
                      {t("minOrder")}
                      <Text style={{ color: "#333", fontWeight: "600" }}>
                        {item.minOrderValue} {t("sar")}
                      </Text>
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
