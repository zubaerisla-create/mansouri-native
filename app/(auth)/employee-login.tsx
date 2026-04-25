import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lock, User } from 'lucide-react-native';
import { useAuth } from '@/src/hooks/useAuth';

export default function EmployeeLoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { employeeLogin, error, clearError } = useAuth();
  const router = useRouter();
  const { height } = useWindowDimensions();

  const isSmall = height < 680;
  const scale = isSmall ? 0.88 : height > 850 ? 1.06 : 1;
  const fs = (n: number) => Math.round(n * scale);
  const sp = (n: number) => Math.round(n * scale);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;

    try {
      setIsSubmitting(true);
      const success = await employeeLogin(username.trim(), password.trim(), { showAlert: false });
      if (success) {
        // Redirect will happen in the hook or handled here
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReady = username.trim().length > 0 && password.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.content, { paddingHorizontal: sp(24) }]}>
          <Image
            source={require('@/assets/images/artboard.png')}
            style={[styles.logo, { marginTop: sp(isSmall ? 12 : 28), marginBottom: sp(18) }]}
            resizeMode="contain"
          />

          <Text style={[styles.title, { fontSize: fs(24), marginBottom: sp(4) }]}>
            Employee Login
          </Text>
          <Text style={[styles.subtitle, { fontSize: fs(14), marginBottom: sp(26) }]}>
            Sign in to access your dashboard
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <User size={fs(20)} color="#6B7280" style={styles.icon} />
              <TextInput
                style={[styles.input, { fontSize: fs(16) }]}
                placeholder="Username"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (error) clearError();
                }}
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>

            <View style={[styles.inputWrapper, { marginTop: sp(16) }]}>
              <Lock size={fs(20)} color="#6B7280" style={styles.icon} />
              <TextInput
                style={[styles.input, { fontSize: fs(16) }]}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) clearError();
                }}
                secureTextEntry
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>
          </View>

          {error && (
            <Text 
              style={{ 
                color: '#EF4444', 
                textAlign: 'center', 
                marginTop: sp(16),
                fontSize: fs(14),
                fontWeight: '500'
              }}
            >
              {error}
            </Text>
          )}
        </View>

        <View style={[styles.footer, { paddingHorizontal: sp(24), paddingBottom: sp(Platform.OS === 'ios' ? 16 : 28) }]}>
          <TouchableOpacity
            style={[
              styles.btn,
              { paddingVertical: sp(15), minHeight: sp(52) },
              isReady && !isSubmitting ? styles.btnActive : styles.btnDim,
            ]}
            onPress={handleLogin}
            disabled={!isReady || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.btnTxt, { fontSize: fs(16) }]}>Login</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ marginTop: sp(16), alignItems: 'center' }}
            onPress={() => router.replace('/(auth)/phone-number')}
          >
            <Text style={{ color: '#6B7280', fontSize: fs(14), fontWeight: '500' }}>
              Back to Customer Login
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  content: { flex: 1 },

  logo: { width: 110, height: 44, alignSelf: 'center' },
  title: { color: '#111827', fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { color: '#6B7280', lineHeight: 20 },

  inputContainer: { marginTop: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    color: '#111827',
    fontWeight: '500',
  },

  footer: { paddingTop: 12 },
  btn: { width: '100%', borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  btnActive: {
    backgroundColor: '#F97316',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDim: { backgroundColor: '#FDBA74' },
  btnTxt: { color: '#fff', fontWeight: '700', letterSpacing: 0.3 },
});
