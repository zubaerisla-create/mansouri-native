import { useCart } from "@/src/context/CartContext";
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

// Type Definitions
interface RestaurantItem {
  id: string;
  name: string;
  description: string;
  calories: number;
  price: string;
  image: string;
  category: "main" | "sides";
  hasOffer?: boolean;
}

interface Restaurant {
  id: string;
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
type FilterType = "All" | "Offer" | "Main" | "Sides";
type ViewMode = "list" | "grid";

export default function RestaurantDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { getTotalItems, toggleFavorite, isFavorite } = useCart();
  const cartCount = getTotalItems();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [isRestaurantFavorite, setIsRestaurantFavorite] = useState(false);

  // Pagination states
  const [displayedItems, setDisplayedItems] = useState<RestaurantItem[]>([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [filteredItems, setFilteredItems] = useState<RestaurantItem[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreItems, setHasMoreItems] = useState(true);

  // Load restaurant data
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const res = await api.getRestaurant(id as string);
        const foundRestaurant = res?.data || res; // handle potential nesting
        if (foundRestaurant) {
          // Normalize API properties if needed
          const formattedRestaurant = {
            ...foundRestaurant,
            name: foundRestaurant.brand_name || foundRestaurant.name,
            cuisine: foundRestaurant.short_description || foundRestaurant.cuisine || foundRestaurant.category_name,
            image: foundRestaurant.logo || foundRestaurant.image,
            items: foundRestaurant.items || [],
          };

          setRestaurant(formattedRestaurant);
          setFilteredItems(formattedRestaurant.items);
          setDisplayedItems(formattedRestaurant.items.slice(0, itemsPerPage));
          setIsRestaurantFavorite(isFavorite(formattedRestaurant.id || id as string));
        } else {
          setRestaurant(null);
        }
      } catch (err) {
        console.error("Error fetching restaurant:", err);
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id, isFavorite]);

  // Apply filters & search
  useEffect(() => {
    if (!restaurant) return;

    let items = restaurant.items;

    // Apply category filter
    if (activeFilter === "Offer") {
      items = items.filter((item) => item.hasOffer);
    } else if (activeFilter === "Main") {
      items = items.filter((item) => item.category === "main");
    } else if (activeFilter === "Sides") { 
      items = items.filter((item) => item.category === "sides");
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query),
      );
    }

    // Update filtered items
    setFilteredItems(items);

    // Reset pagination when filter/search changes
    setPage(1);
    setDisplayedItems(items.slice(0, itemsPerPage));
    setHasMoreItems(items.length > itemsPerPage);
  }, [activeFilter, searchQuery, restaurant]);

  // Load more items
  const loadMoreItems = () => {
    if (loadingMore || !hasMoreItems || !filteredItems.length) return;

    setLoadingMore(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = 0;
      const endIndex = nextPage * itemsPerPage;
      const nextItems = filteredItems.slice(startIndex, endIndex);

      setDisplayedItems(nextItems);
      setPage(nextPage);
      setHasMoreItems(endIndex < filteredItems.length);
      setLoadingMore(false);
    }, 500);
  };

  // Clear search function
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleToggleFavorite = () => {
    if (restaurant) {
      const restaurantInfo = {
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        image: restaurant.image,
        rating: restaurant.rating,
        deliveryTime: restaurant.deliveryTime,
      };
      toggleFavorite(restaurantInfo);
      setIsRestaurantFavorite(!isRestaurantFavorite);

      Alert.alert(
        isRestaurantFavorite ? "Removed from favorites" : "Added to favorites",
        isRestaurantFavorite
          ? `${restaurant.name} has been removed from your favorites`
          : `${restaurant.name} has been added to your favorites`,
      );
    }
  };

  const handleShare = async (platform?: string) => {
    if (!restaurant) return;

    const shareUrl = Linking.createURL(`/restaurant/${restaurant.id}`);
    const message = `Check out ${restaurant.name} on FoodApp! ${restaurant.cuisine} • ⭐${restaurant.rating} • ${restaurant.deliveryTime} min delivery\n${shareUrl}`;

    if (platform === "more") {
      try {
        const result = await Share.share({
          message: message,
          title: `Share ${restaurant.name}`,
        });
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            console.log("Shared with activity type:", result.activityType);
          } else {
            console.log("Shared successfully");
          }
        } else if (result.action === Share.dismissedAction) {
          console.log("Share dismissed");
        }
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

  const renderListItem = ({ item }: { item: RestaurantItem }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        router.push(`/restaurant/item/${item.id}?id=${id}`);
      }}
    >
      <View className="flex-row items-center py-4 border-b border-gray-100 px-4">
        <Image
          source={{ uri: item.image }}
          className="w-24 h-24 rounded-xl mr-4"
          resizeMode="cover"
        />
        <View className="flex-1">
          <View className="flex-row items-center justify-between p-1 ">
            <Text className="text-base font-semibold text-black">
              {item.name}
            </Text>
            <View className="flex-row items-center gap-1 bg-[#FF791A1A] p-1 rounded-xl ">
              <Feather name="clock" size={16} color="#f97316" />
              <Text className="text-orange-500">+12</Text>
            </View>
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
                {item.price?.toString().includes('SAR') ? item.price : `${item.price || 0} SAR`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }: { item: RestaurantItem }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      className="w-[48%] mb-4"
      onPress={() => {
        router.push(`/restaurant/item/${item.id}?id=${id}`);
      }}
    >
      <View className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <View className="relative">
          <Image
            source={{ uri: item.image }}
            className="w-full h-40"
            resizeMode="cover"
          />
          {item.hasOffer && (
            <View className="absolute top-2 left-2 bg-green-500 px-2 py-1 rounded-md">
              <Text className="text-white text-xs font-semibold">Offer</Text>
            </View>
          )}
          <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded">
            <Text className="text-white text-xs">🔥 {item.calories}</Text>
          </View>
        </View>
        <View className="p-3">
          <Text className="text-sm font-semibold text-black" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-xs text-gray-600 mt-1" numberOfLines={2}>
            {item.description}
          </Text>
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-base font-bold text-gray-900">
              {item.price?.toString().includes('SAR') ? item.price : `${item.price || 0} SAR`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!hasMoreItems && filteredItems.length > 0) {
      return (
        <View className="py-4 items-center">
          <Text className="text-gray-500 text-sm">
            Showing all {filteredItems.length} items
          </Text>
        </View>
      );
    }

    if (loadingMore) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#f97316" />
          <Text className="text-gray-500 text-sm mt-2">
            Loading more items...
          </Text>
        </View>
      );
    }

    if (hasMoreItems && filteredItems.length > 0) {
      return (
        <TouchableOpacity onPress={loadMoreItems} className="py-4 items-center">
          <Text className="text-orange-600 font-semibold">
            Load More ({filteredItems.length - displayedItems.length} more)
          </Text>
          <Text className="text-gray-500 text-xs mt-1">
            Showing {displayedItems.length} of {filteredItems.length} items
          </Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-lg text-gray-600 mt-2">
          Loading restaurant...
        </Text>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Feather name="alert-circle" size={48} color="#f97316" />
        <Text className="text-xl text-gray-600 mt-4">
          Restaurant not found 😔
        </Text>
        <TouchableOpacity
          className="mt-6 bg-orange-600 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Image */}
      <Image
        source={{ uri: restaurant.image }}
        className="w-full h-64"
        resizeMode="cover"
      />

      {/* Main Content */}
      <FlatList
        data={displayedItems}
        keyExtractor={(item) => item.id}
        key={viewMode}
        numColumns={viewMode === "grid" ? 2 : 1}
        columnWrapperStyle={
          viewMode === "grid"
            ? { justifyContent: "space-between", paddingHorizontal: 16 }
            : undefined
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={() => (
          <View className="px-4 mt-20 pb-4">
            {/* Restaurant Info Card */}
            <View className="bg-white rounded-2xl p-5 shadow-lg -mt-10 mb-6 border border-gray-100">
              <View className="flex-row justify-between">
                <Text className="text-2xl font-bold text-black">
                  {restaurant.name}
                </Text>
                <View className="flex-row items-center">
                  <Feather name="clock" size={16} color="#c24343" />
                  <Text className="ml-1 text-sm text-gray-600">
                    Average: {restaurant.deliveryTime} min
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2 mt-1">
                <Text className="text-base text-gray-600">
                  {restaurant.cuisine}
                </Text>
                {restaurant.discount && (
                  <View className="bg-green-100 px-2 py-1 rounded-full">
                    <Text className="text-xs font-medium text-green-700">
                      {restaurant.discount}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row mt-4 gap-4">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Distance</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {restaurant.distance}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Hours</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {restaurant.hours}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Min Order</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {restaurant.minOrder}
                  </Text>
                </View>
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
                {(["All", "Offer", "Main", "Sides"] as FilterType[]).map(
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
        )}
        renderItem={viewMode === "list" ? renderListItem : renderGridItem}
        ListEmptyComponent={() => (
          <View className="py-10 items-center">
            <Feather name="search" size={48} color="#ccc" />
            <Text className="text-gray-500 text-base mt-2">No items found</Text>
            <Text className="text-gray-400 text-sm mt-1">
              {searchQuery
                ? `No items matching "${searchQuery}"`
                : "Try a different filter"}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                onPress={handleClearSearch}
                className="mt-4 bg-gray-100 px-4 py-2 rounded-lg"
              >
                <Text className="text-gray-700 font-medium">Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListFooterComponent={renderFooter}
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
              Share {restaurant.name} with your friends
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
