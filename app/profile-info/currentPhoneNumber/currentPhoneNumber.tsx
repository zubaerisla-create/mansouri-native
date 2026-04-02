import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  useWindowDimensions,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronDown, X, Search, Phone, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '@/src/hooks/useAuth';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  minDigits: number;
  maxDigits: number;
  example: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const COUNTRIES: Country[] = [
  { code: 'SA', name: 'Saudi Arabia',        dialCode: '+966', flag: '🇸🇦', minDigits: 9,  maxDigits: 9,  example: '501234567'   },
  { code: 'US', name: 'United States',        dialCode: '+1',   flag: '🇺🇸', minDigits: 10, maxDigits: 10, example: '2025551234'  },
  { code: 'GB', name: 'United Kingdom',       dialCode: '+44',  flag: '🇬🇧', minDigits: 10, maxDigits: 11, example: '7911123456'  },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', minDigits: 9,  maxDigits: 9,  example: '501234567'   },
  { code: 'IN', name: 'India',                dialCode: '+91',  flag: '🇮🇳', minDigits: 10, maxDigits: 10, example: '9123456789'  },
  { code: 'PK', name: 'Pakistan',             dialCode: '+92',  flag: '🇵🇰', minDigits: 10, maxDigits: 10, example: '3001234567'  },
  { code: 'EG', name: 'Egypt',                dialCode: '+20',  flag: '🇪🇬', minDigits: 10, maxDigits: 10, example: '1012345678'  },
  { code: 'JO', name: 'Jordan',               dialCode: '+962', flag: '🇯🇴', minDigits: 9,  maxDigits: 9,  example: '791234567'   },
  { code: 'KW', name: 'Kuwait',               dialCode: '+965', flag: '🇰🇼', minDigits: 8,  maxDigits: 8,  example: '51234567'    },
  { code: 'QA', name: 'Qatar',                dialCode: '+974', flag: '🇶🇦', minDigits: 8,  maxDigits: 8,  example: '33123456'    },
  { code: 'BH', name: 'Bahrain',              dialCode: '+973', flag: '🇧🇭', minDigits: 8,  maxDigits: 8,  example: '36001234'    },
  { code: 'OM', name: 'Oman',                 dialCode: '+968', flag: '🇴🇲', minDigits: 8,  maxDigits: 8,  example: '91234567'    },
  { code: 'BD', name: 'Bangladesh',           dialCode: '+880', flag: '🇧🇩', minDigits: 10, maxDigits: 10, example: '1712345678'  },
  { code: 'TR', name: 'Turkey',               dialCode: '+90',  flag: '🇹🇷', minDigits: 10, maxDigits: 10, example: '5321234567'  },
  { code: 'DE', name: 'Germany',              dialCode: '+49',  flag: '🇩🇪', minDigits: 10, maxDigits: 11, example: '15123456789' },
  { code: 'FR', name: 'France',               dialCode: '+33',  flag: '🇫🇷', minDigits: 9,  maxDigits: 9,  example: '612345678'   },
  { code: 'AU', name: 'Australia',            dialCode: '+61',  flag: '🇦🇺', minDigits: 9,  maxDigits: 9,  example: '412345678'   },
  { code: 'CA', name: 'Canada',               dialCode: '+1',   flag: '🇨🇦', minDigits: 10, maxDigits: 10, example: '4161234567'  },
  { code: 'NG', name: 'Nigeria',              dialCode: '+234', flag: '🇳🇬', minDigits: 10, maxDigits: 10, example: '8031234567'  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function digitsNeeded(digits: string, country: Country): number {
  if (digits.length > country.maxDigits) return -1; // too long
  return Math.max(0, country.minDigits - digits.length);
}

function formatDisplay(digits: string, countryCode: string): string {
  switch (countryCode) {
    case 'SA': case 'AE':
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0,2)} ${digits.slice(2)}`;
      return `${digits.slice(0,2)} ${digits.slice(2,5)} ${digits.slice(5,9)}`;
    case 'US': case 'CA':
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`;
    case 'IN': case 'BD': case 'PK': case 'EG': case 'TR': case 'NG':
      if (digits.length <= 5) return digits;
      return `${digits.slice(0,5)} ${digits.slice(5)}`;
    default: {
      const m = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,4})(\d*)$/);
      if (!m) return digits;
      return m.slice(1).filter(Boolean).join(' ');
    }
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PhoneNumberScreen() {
  const [phoneDigits, setPhoneDigits]         = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [modalVisible, setModalVisible]       = useState(false);
  const [searchQuery, setSearchQuery]         = useState('');
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [touched, setTouched]                 = useState(false);

  const inputRef   = useRef<TextInput>(null);
  const router     = useRouter();
  const { height } = useWindowDimensions();
  const { changePhone } = useAuth();

  const isSmall = height < 680;
  const scale   = isSmall ? 0.88 : height > 850 ? 1.06 : 1;
  const fs = (n: number) => Math.round(n * scale);
  const sp = (n: number) => Math.round(n * scale);

  // ── Derived ──────────────────────────────────────────────────────────────

  const needed    = digitsNeeded(phoneDigits, selectedCountry);
  const isTooLong = needed === -1;
  const isReady   = needed === 0;
  const displayVal = formatDisplay(phoneDigits, selectedCountry.code);

  type HintState = 'idle' | 'warn' | 'ok';
  const hintState: HintState = !touched ? 'idle' : isReady ? 'ok' : 'warn';

  const hintMessage = (() => {
    if (!touched) return null;
    if (isTooLong)  return `Too many digits — max ${selectedCountry.maxDigits} for ${selectedCountry.name}`;
    if (needed > 0) return `${needed} more digit${needed > 1 ? 's' : ''} needed for ${selectedCountry.name}`;
    return 'Looks good!';
  })();

  const filteredCountries = searchQuery.trim()
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.dialCode.includes(searchQuery) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : COUNTRIES;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const onCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country);
    setModalVisible(false);
    setSearchQuery('');
    setPhoneDigits('');
    setTouched(false);
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  const onPhoneChange = (value: string) => {
    const digits = getDigits(value).slice(0, selectedCountry.maxDigits + 1);
    setPhoneDigits(digits);
  };

  const onSubmit = async () => {
    Keyboard.dismiss();
    setTouched(true);
    if (!isReady) return;

    try {
      setIsSubmitting(true);
      const fullPhone = `${selectedCountry.dialCode}${phoneDigits}`;
      const success = await changePhone(fullPhone);

      if (success) {
        const formatted = formatDisplay(phoneDigits, selectedCountry.code);
        router.push({
          pathname: '/profile-info/verifyCode/verifyCode',
          params: {
            phoneNumber:          fullPhone,
            formattedPhoneNumber: `${selectedCountry.dialCode} ${formatted}`,
          },
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Content */}
        <View style={[styles.content, { paddingHorizontal: sp(24) }]}>

          <Image
            source={require('@/assets/images/artboard.png')}
            style={[styles.logo, { marginTop: sp(isSmall ? 12 : 28), marginBottom: sp(18) }]}
            resizeMode="contain"
          />

          <Text style={[styles.title, { fontSize: fs(24), marginBottom: sp(4) }]}>
            Phone Number
          </Text>
          <Text style={[styles.subtitle, { fontSize: fs(14), marginBottom: sp(26) }]}>
            Enter your number to receive a verification code
          </Text>

          {/* Input row */}
          <View style={[
            styles.inputRow,
            { paddingVertical: sp(12), minHeight: sp(54) },
            hintState === 'warn' ? styles.rowError
              : hintState === 'ok' ? styles.rowOk
              : styles.rowIdle,
          ]}>
            {/* Country picker */}
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.6}
              disabled={isSubmitting}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
            >
              <Text style={{ fontSize: fs(20) }}>{selectedCountry.flag}</Text>
              <Text style={[styles.dialCode, { fontSize: fs(15), marginLeft: 6 }]}>
                {selectedCountry.dialCode}
              </Text>
              <ChevronDown size={fs(14)} color="#6B7280" style={{ marginLeft: 2 }} />
            </TouchableOpacity>

            <View style={[styles.sep, { height: sp(22) }]} />

            {/* Phone input */}
            <TextInput
              ref={inputRef}
              style={[styles.textInput, { fontSize: fs(16) }]}
              placeholder={`e.g. ${formatDisplay(selectedCountry.example, selectedCountry.code)}`}
              placeholderTextColor="#C4C9D4"
              keyboardType="phone-pad"
              returnKeyType="done"
              value={displayVal}
              onChangeText={onPhoneChange}
              onSubmitEditing={onSubmit}   // ✅ Done key works
              blurOnSubmit={true}          // ✅ Keyboard dismisses on Done
              maxLength={selectedCountry.maxDigits + 5}
              editable={!isSubmitting}
              autoFocus={!isSmall}
            />

            {touched && (
              isReady
                ? <CheckCircle2 size={fs(18)} color="#22C55E" style={{ marginLeft: 8 }} />
                : <AlertCircle  size={fs(18)} color="#EF4444" style={{ marginLeft: 8 }} />
            )}
          </View>

          {/* Inline hint line */}
          {hintMessage && (
            <View style={[styles.hintBox, hintState === 'ok' ? styles.hintOk : styles.hintWarn]}>
              {hintState === 'ok'
                ? <CheckCircle2 size={fs(12)} color="#16A34A" style={{ marginRight: 5 }} />
                : <AlertCircle  size={fs(12)} color="#DC2626" style={{ marginRight: 5 }} />
              }
              <Text style={[styles.hintTxt, { fontSize: fs(12.5) }, hintState === 'ok' ? styles.hintTxtOk : styles.hintTxtWarn]}>
                {hintMessage}
              </Text>
            </View>
          )}

          {/* Requirements card — only when invalid after tapping Continue */}
          {touched && !isReady && (
            <View style={styles.reqCard}>
              <View style={styles.reqRow}>
                <Phone size={fs(12)} color="#F97316" style={{ marginRight: 6 }} />
                <Text style={[styles.reqTitle, { fontSize: fs(12.5) }]}>
                  {selectedCountry.flag}  {selectedCountry.name} requirements
                </Text>
              </View>
              <View style={styles.reqDivider} />
              <Text style={[styles.reqLine, { fontSize: fs(12) }]}>
                ● Digits required:{' '}
                <Text style={styles.reqBold}>
                  {selectedCountry.minDigits === selectedCountry.maxDigits
                    ? `${selectedCountry.minDigits}`
                    : `${selectedCountry.minDigits}–${selectedCountry.maxDigits}`}
                </Text>
              </Text>
              <Text style={[styles.reqLine, { fontSize: fs(12), marginTop: 4 }]}>
                ● You entered:{' '}
                <Text style={[styles.reqBold, { color: isTooLong ? '#EF4444' : '#F97316' }]}>
                  {phoneDigits.length} digit{phoneDigits.length !== 1 ? 's' : ''}
                </Text>
              </Text>
              <Text style={[styles.reqLine, { fontSize: fs(12), marginTop: 4 }]}>
                ● Example:{' '}
                <Text style={styles.reqBold}>
                  {selectedCountry.dialCode} {formatDisplay(selectedCountry.example, selectedCountry.code)}
                </Text>
              </Text>
            </View>
          )}

          {/* Idle helper */}
          {!touched && (
            <Text style={[styles.helper, { fontSize: fs(12.5), marginTop: sp(8) }]}>
              A one-time code will be sent to this number
            </Text>
          )}
        </View>

        {/* Continue button — always at bottom */}
        <View style={[styles.footer, { paddingHorizontal: sp(24), paddingBottom: sp(Platform.OS === 'ios' ? 16 : 28) }]}>
          <TouchableOpacity
            style={[
              styles.btn,
              { paddingVertical: sp(15), minHeight: sp(52) },
              isReady && !isSubmitting ? styles.btnActive : styles.btnDim,
            ]}
            onPress={onSubmit}
            activeOpacity={0.82}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={[styles.btnTxt, { fontSize: fs(16) }]}>Continue</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Country Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.sheet, { paddingBottom: Platform.OS === 'ios' ? 34 : 20 }]}>
                <View style={styles.handle} />

                <View style={styles.sheetHead}>
                  <Text style={[styles.sheetTitle, { fontSize: fs(17) }]}>Select Country</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <X size={fs(20)} color="#374151" />
                  </TouchableOpacity>
                </View>

                <View style={styles.searchRow}>
                  <Search size={fs(15)} color="#9CA3AF" style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.searchInput, { fontSize: fs(14) }]}
                    placeholder="Search country or dial code…"
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                  />
                </View>

                <FlatList
                  data={filteredCountries}
                  keyExtractor={item => item.code}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: 420 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.cRow, item.code === selectedCountry.code && styles.cRowSel]}
                      onPress={() => onCountrySelect(item)}
                      activeOpacity={0.65}
                    >
                      <Text style={{ fontSize: fs(20) }}>{item.flag}</Text>
                      <Text style={[styles.cName, { fontSize: fs(14) }]}>{item.name}</Text>
                      <Text style={[styles.cDial, { fontSize: fs(13) }]}>{item.dialCode}</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyBox}>
                      <Text style={{ color: '#9CA3AF', fontSize: fs(13) }}>No countries found</Text>
                    </View>
                  }
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#fff' },
  flex:    { flex: 1 },
  content: { flex: 1 },

  logo:     { width: 110, height: 44, alignSelf: 'center' },
  title:    { color: '#111827', fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { color: '#6B7280', lineHeight: 20 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
  },
  rowIdle:  { borderColor: '#D1D5DB' },
  rowError: { borderColor: '#EF4444', backgroundColor: '#FFF7F7' },
  rowOk:    { borderColor: '#22C55E', backgroundColor: '#F0FDF4' },

  picker:   { flexDirection: 'row', alignItems: 'center', paddingRight: 6 },
  dialCode: { color: '#111827', fontWeight: '600' },
  sep:      { width: 1, backgroundColor: '#D1D5DB', marginHorizontal: 12 },
  textInput: {
    flex: 1,
    color: '#111827',
    fontWeight: '500',
    letterSpacing: 0.4,
    paddingVertical: 0,
  },

  hintBox:    { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginTop: 7 },
  hintOk:     { backgroundColor: '#F0FDF4' },
  hintWarn:   { backgroundColor: '#FEF2F2' },
  hintTxt:    { flex: 1, lineHeight: 16 },
  hintTxtOk:  { color: '#16A34A' },
  hintTxtWarn:{ color: '#DC2626' },

  reqCard:    { backgroundColor: '#FFFBF5', borderWidth: 1, borderColor: '#FED7AA', borderRadius: 12, padding: 12, marginTop: 8 },
  reqRow:     { flexDirection: 'row', alignItems: 'center' },
  reqDivider: { height: 1, backgroundColor: '#FED7AA', marginVertical: 8 },
  reqTitle:   { color: '#92400E', fontWeight: '600' },
  reqLine:    { color: '#78350F' },
  reqBold:    { color: '#C2410C', fontWeight: '700' },

  helper: { color: '#9CA3AF', textAlign: 'center', lineHeight: 18 },

  footer: { paddingTop: 12 },
  btn:    { width: '100%', borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
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

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12 },
  handle:  { width: 38, height: 4, backgroundColor: '#D1D5DB', borderRadius: 4, alignSelf: 'center', marginBottom: 12 },
  sheetHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB',
  },
  sheetTitle: { color: '#111827', fontWeight: '700' },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 12,
    marginHorizontal: 16, marginVertical: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, color: '#111827', padding: 0 },

  cRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F3F4F6' },
  cRowSel: { backgroundColor: '#FFF7ED' },
  cName:   { flex: 1, color: '#111827', fontWeight: '500', marginLeft: 12 },
  cDial:   { color: '#6B7280', fontWeight: '500' },
  emptyBox: { paddingVertical: 36, alignItems: 'center' },
});