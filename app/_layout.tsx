import { LanguageProvider } from "@/src/context/LanguageContext";
import { CartProvider } from "@/src/context/CartContext";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync(); // Expo splash তাৎক্ষণিক সরিয়ে দাও

    const timer = setTimeout(() => {
      setSplash(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (splash) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FF5101]">
        <Image source={require('@/assets/images/splash-screen.png')} />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </CartProvider>
    </LanguageProvider>
  );
}