import { CartProvider } from "@/src/context/CartContext";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { loadStoredAuth } from "@/src/features/auth/authSlice";
import { store } from "@/src/store";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { Provider } from "react-redux";
import "../global.css";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const segments = useSegments();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Restore authentication state
    dispatch(loadStoredAuth() as any);
    
    const prepare = async () => {
      try {
        // Wait for a bit to show splash
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    if (!appReady) return;

    const inAuthGroup = segments[0] === '(auth)' || segments[0] === undefined;

    if (isAuthenticated && inAuthGroup) {
      // If logged in and in auth screens (or index), go home
      router.replace('/(tabs)/home');
    } else if (!isAuthenticated && !inAuthGroup) {
      // If not logged in and in protected screens, go to login
      router.replace('/(auth)/phone-number');
    }
  }, [isAuthenticated, segments, appReady]);

  if (!appReady) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FF5101]">
        <Image 
          source={require('@/assets/images/splash-screen.png')} 
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <CartProvider>
          <InitialLayout />
        </CartProvider>
      </LanguageProvider>
    </Provider>
  );
}