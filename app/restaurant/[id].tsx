import { useCart } from "@/src/hooks/useCart";
import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/src/services/api";

import { MenuItem, Category, MenuResponse } from "@/src/types";

type FilterType = "All" | "Offer";
type ViewMode = "list" | "grid";

interface ExtendedMenuItem extends MenuItem {
  hasOffer?: boolean;
}

export default function RestaurantDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { getTotalItems, toggleFavorite, isFavorite } = useCart();
  const cartCount = getTotalItems();

  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [branchImage, setBranchImage] = useState("");
  
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [isRestaurantFavorite, setIsRestaurantFavorite] = useState(false);

  // Fetch menu data function
  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: MenuResponse = await api.getRestaurantMenu(id as string);
      if (res.success) {
        setCategories(res.data);
        setFilteredCategories(res.data);
        setDisplayedCategories(res.data);
        setRestaurantName(res.meta.branch_name);
        // Fallback image if needed
        setBranchImage(""); 
        setIsRestaurantFavorite(isFavorite(id as string));
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred while loading the menu.';
      setError(errorMessage);
      console.error("Error fetching menu:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load menu data on mount
  useEffect(() => {
    fetchMenuData();
  }, [id, isFavorite]);

  // Apply filters & search
  useEffect(() => {
    let filtered = categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item => {
        // Search filter
        const matchesSearch = !searchQuery.trim() || 
          item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase().trim());
        
        // Category filter (if needed, but here we show all categories that have matching items)
        const matchesFilter = activeFilter === "All" || (activeFilter === "Offer" && (item as ExtendedMenuItem).hasOffer);

        return matchesSearch && matchesFilter;
      })
    })).filter(cat => cat.items.length > 0);

    setFilteredCategories(filtered);
    setDisplayedCategories(filtered);
  }, [activeFilter, searchQuery, categories]);

  // Load more items
  

  // Clear search function
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleToggleFavorite = () => {
    // Basic favorite logic since we don't have the full restaurant info in this screen yet
    toggleFavorite({
      id: id as string,
      name: restaurantName,
      image: branchImage,
      cuisine: "",
      rating: 0,
      deliveryTime: "",
    });
    setIsRestaurantFavorite(!isRestaurantFavorite);

    Alert.alert(
      isRestaurantFavorite ? "Removed from favorites" : "Added to favorites",
      isRestaurantFavorite
        ? `${restaurantName} has been removed from your favorites`
        : `${restaurantName} has been added to your favorites`,
    );
  };

  const handleShare = async (platform?: string) => {
    const shareUrl = Linking.createURL(`/restaurant/${id}`);
    const message = `Check out ${restaurantName} on FoodApp!\n${shareUrl}`;

    if (platform === "more") {
      try {
        await Share.share({
          message: message,
          title: `Share ${restaurantName}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      Alert.alert(
        "Coming Soon",
        `Sharing to ${platform} will be available soon!`,
      );
    }

    setShareModalVisible(false);
  };

  const renderListItem = ({ item }: { item: MenuItem | (Category & { isHeader: boolean }) }) => {
    if ('isHeader' in item) {
      return (
        <View className="bg-gray-50 px-4 py-3 mt-4">
          <Text className="text-xl font-bold text-gray-900">{item.category_name}</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          router.push(`/restaurant/item/${item.id}?id=${id}`);
        }}
      >
        <View className="flex-row items-center py-4 border-b border-gray-100 px-4">
          <Image
            source={{ uri: item.image || "https://placehold.co/150x150/png" }}
            className="w-24 h-24 rounded-xl mr-4"
            resizeMode="cover"
          />
          <View className="flex-1">
            <View className="flex-row items-center justify-between p-1 ">
              <Text className="text-base font-semibold text-black">
                {item.name}
              </Text>
            </View>

            <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
              {item.description}
            </Text>

            <View className="flex-row items-center justify-between p-2">
              <Text className="text-xs text-orange-500">
                🔥 {item.calories} Calories
              </Text>

              <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-orange-500">
                  {parseFloat(item.price).toFixed(2)} SAR
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const flattenedData = displayedCategories.flatMap(cat => [
    { ...cat, isHeader: true, id: `header-${cat.category_id}` },
    ...cat.items
  ]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-lg text-gray-600 mt-2">
          Loading menu...
        </Text>
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
              Unable to Load Menu
            </Text>
            <Text className="text-base text-gray-600 mt-3 text-center leading-5">
              {error}
            </Text>
            <View className="flex-row gap-3 mt-6 w-full">
              <TouchableOpacity
                onPress={() => {
                  setError(null);
                  setLoading(true);
                  fetchMenuData();
                }}
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Image */}
      <Image
        source={{ uri: branchImage || "https://placehold.co/400x300/png" }}
        className="w-full h-64"
        resizeMode="cover"
      />

      {/* Main Content */}
      <FlatList
        data={flattenedData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <View className="px-4 mt-20 pb-4">
            {/* Restaurant Info Card */}
            <View className="bg-white rounded-2xl p-5 shadow-lg -mt-10 mb-6 border border-gray-100">
              <View className="flex-row justify-between">
                <Text className="text-2xl font-bold text-black" numberOfLines={2}>
                  {restaurantName}
                </Text>
              </View>
              <View className="flex-row items-center gap-2 mt-1">
                <Text className="text-base text-gray-600">
                  Branch ID: {id}
                </Text>
              </View>
            </View>

            {/* Search Bar */}
            <View className="relative mb-4">
              <Feather
                name="search"
                size={20}
                color="#999"
                style={{ position: "absolute", left: 16, top: 14, zIndex: 10 }}
              />
              <TextInput
                className="bg-gray-100 rounded-xl py-3 pl-12 pr-12 text-base"
                placeholder="Search menu items..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearSearch}
                  style={{
                    position: "absolute",
                    right: 16,
                    top: 14,
                    zIndex: 10,
                  }}
                >
                  <Feather name="x" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Items Header + View Toggle */}
            <View className="flex-row items-center justify-between mb-4 p-1">
              <Text className="text-lg font-semibold text-gray-900">Items</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list" ? "bg-orange-600" : "bg-gray-200"
                  }`}
                >
                  <Feather
                    name="list"
                    size={20}
                    color={viewMode === "list" ? "white" : "#666"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid" ? "bg-orange-600" : "bg-gray-200"
                  }`}
                >
                  <Feather
                    name="grid"
                    size={20}
                    color={viewMode === "grid" ? "white" : "#666"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              <View className="flex-row gap-3">
                {(["All", "Offer"] as FilterType[]).map(
                  (filter) => (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => setActiveFilter(filter)}
                      className={`px-4 py-2 rounded-full ${
                        activeFilter === filter
                          ? "bg-orange-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          activeFilter === filter
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </ScrollView>
          </View>
        }
        renderItem={renderListItem}
        ListEmptyComponent={() => (
          <View className="py-10 items-center">
            <Feather name="search" size={48} color="#ccc" />
            <Text className="text-gray-500 text-base mt-2">No items found</Text>
          </View>
        )}
      />

      {/* Floating Cart Button */}
      <TouchableOpacity
        onPress={() => {
          router.push("/order-process/cart/cart");
        }}
        className="absolute bottom-24 right-6 bg-orange-600 w-16 h-16 rounded-full items-center justify-center shadow-2xl border-2 border-white"
      >
        <Feather name="shopping-cart" size={28} color="white" />
        {cartCount > 0 && (
          <View className="absolute -top-2 -right-2 bg-red-500 min-w-[24px] h-6 rounded-full items-center justify-center border-2 border-white">
            <Text className="text-white text-xs font-bold px-2">
              {cartCount > 99 ? "99+" : cartCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Top Right Actions */}
      <View className="absolute top-12 right-4 flex-row gap-3">
        <TouchableOpacity
          className="bg-white p-3 rounded-full shadow-lg"
          onPress={handleToggleFavorite}
        >
          <Feather
            name="heart"
            size={24}
            color={isRestaurantFavorite ? "#FF4D4F" : "#666"}
            fill={isRestaurantFavorite ? "#FF4D4F" : "transparent"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white p-3 rounded-full shadow-lg"
          onPress={() => setShareModalVisible(true)}
        >
          <Feather name="share-2" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-4 bg-white p-3 rounded-full shadow-lg"
      >
        <Feather name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      {/* Share Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={shareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Share Restaurant
              </Text>
              <TouchableOpacity onPress={() => setShareModalVisible(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-600 mb-6">
              Share {restaurantName} with your friends
            </Text>

            <View className="flex-row justify-around mb-8">
              <TouchableOpacity
                className="items-center"
                onPress={() => handleShare("WhatsApp")}
              >
                <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-2">
                  <Feather name="message-circle" size={28} color="#25D366" />
                </View>
                <Text className="text-sm text-gray-700">WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center"
                onPress={() => handleShare("Facebook")}
              >
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-2">
                  <Feather name="facebook" size={28} color="#1877F2" />
                </View>
                <Text className="text-sm text-gray-700">Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center"
                onPress={() => handleShare("Twitter")}
              >
                <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-2">
                  <Feather name="twitter" size={28} color="#1DA1F2" />
                </View>
                <Text className="text-sm text-gray-700">Twitter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center"
                onPress={() => handleShare("Instagram")}
              >
                <View className="w-16 h-16 bg-pink-100 rounded-full items-center justify-center mb-2">
                  <Feather name="instagram" size={28} color="#E4405F" />
                </View>
                <Text className="text-sm text-gray-700">Instagram</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center py-4 border-t border-gray-200"
              onPress={() => handleShare("more")}
            >
              <Feather name="more-horizontal" size={20} color="#666" />
              <Text className="ml-2 text-gray-700 font-medium">
                More Options
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
