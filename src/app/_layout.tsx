import { SplashScreen, Stack } from "expo-router";

void SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn("Failed to prevent splash screen from auto-hiding:", error);
});

export default function RootLayout() {
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
