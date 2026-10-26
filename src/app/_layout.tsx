import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

void SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn("Failed to prevent splash screen from auto-hiding:", error);
});

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync().catch((error) => {
      console.warn("Failed to hide splash screen:", error);
    });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: "#000",
        },
      }}
    />
  );
}
