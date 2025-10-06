import * as SplashScreen from "expo-splash-screen";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { useRootNavigationState } from "expo-router";
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore errors during dev/hot reload */
});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { checkAuth, user, token, hydrated } = useAuthStore();
  const [isSplashReady, setIsSplashReady] = useState(false);
  const navState = useRootNavigationState(); // <-- readiness gate
  // console.log(segments);

  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  // useEffect(() => {
  //   if (fontsLoaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [fontsLoaded]);

  // ensure preventAutoHideAsync completed (await it inside effect)
  useEffect(() => {
    let mounted = true;
    async function prepareSplash() {
      try {
        // this ensures the splash is actually kept visible before we render
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        // sometimes throws in dev/hot reload; ignore but still continue
        console.warn("preventAutoHideAsync failed:", e);
      } finally {
        if (mounted) setIsSplashReady(true);
      }
    }
    prepareSplash();
    return () => {
      mounted = false;
    };
  }, []);

  // Hide splash only when both the prevent call finished AND fonts are loaded
  useEffect(() => {
    async function hideIfReady() {
      if (isSplashReady && fontsLoaded) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn("hideAsync failed:", e);
        }
      }
    }
    hideIfReady();
  }, [isSplashReady, fontsLoaded]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // wait until the root navigation is ready
    if (!navState?.key || !hydrated) return;
    const inAuthScreen = segments[0] === "(auth)";
    // const isSignedIn = user && token;
    const isSignedIn = !!user && !!token;
    if (!inAuthScreen && !isSignedIn) {
      router.replace("/(auth)");
    } else if (isSignedIn && inAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [user, token, segments, router, navState?.key, hydrated]);
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
