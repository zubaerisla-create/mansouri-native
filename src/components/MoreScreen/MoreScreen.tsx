import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MoreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header / User Card */}
      <View className="bg-orange-500 px-5 pt-9 pb-6 items-center">
        <Text className="text-white text-2xl font-bold">Mohammad Mamil</Text>
        
        <View className="flex-row items-center mt-1.5 space-x-2">
          <Text className="text-white text-base font-medium">+966 5XXXXXXX</Text>
          <View className="w-1.5 h-1.5 bg-white rounded-full" />
          <Text className="text-white text-base font-medium">68 SAR</Text>
        </View>

        <Text className="text-white/90 text-sm mt-1">Pepeep Balance: 68 SAR</Text>
      </View>

      <View className="px-5 pt-6 space-y-6">
        {/* Saved Cars Section */}
        <View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-800">Saved Cars</Text>
            <TouchableOpacity>
              <Text className="text-orange-500 font-medium">Add New Car</Text>
            </TouchableOpacity>
          </View>

          {/* Car Item 1 */}
          <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="font-semibold text-gray-800">Mercedes-Benz 300 SLR</Text>
                <Text className="text-gray-500 text-sm mt-0.5">White • AAA2222</Text>
              </View>
              <View className="flex-row space-x-3">
                <TouchableOpacity>
                  <Text className="text-blue-600 font-medium">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className="text-red-500 font-medium">×</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Car Item 2 */}
          <View className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="font-semibold text-gray-800">Porsche 911</Text>
                <Text className="text-gray-500 text-sm mt-0.5">Black • GHJ-4566</Text>
              </View>
              <View className="flex-row space-x-3">
                <TouchableOpacity>
                  <Text className="text-blue-600 font-medium">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className="text-red-500 font-medium">×</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="space-y-4">
          <TouchableOpacity className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center space-x-3">
              <Text className="text-xl">🌐</Text>
              <Text className="text-gray-800 text-base font-medium">Language</Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Text className="text-gray-600 font-medium">EN</Text>
              <Text className="text-orange-500 font-bold">AR</Text>
            </View>
          </TouchableOpacity>

          {[
            "Edit profile",
            "Help & Support",
            "Privacy & Security",
            "Register Your Brand with us",
            "Account Deletion",
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              className="flex-row items-center justify-between py-3 border-t border-gray-100"
            >
              <Text className="text-gray-800 text-base font-medium">
                {item}
              </Text>
              <Text className="text-gray-400 text-xl">›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity className="mt-8 mb-10 items-center">
          <Text className="text-red-500 text-lg font-semibold">
            [+] Logout
          </Text>
        </TouchableOpacity>

        {/* Footer version */}
        <Text className="text-center text-gray-400 text-xs mb-6">
          Pepeep v1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
}