import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="phone-number" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="employee-login" />
    </Stack>
  );
}
