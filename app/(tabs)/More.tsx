// ProfileScreen.tsx
import { Feather, Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { AppText as Text } from "@/src/components/AppText";
import { useTranslation } from "@/src/hooks/useTranslation";

import { useAuth } from "@/src/hooks/useAuth";
import { useEffect } from "react";

export default function ProfileScreen() {
  const { t, language, toggleLanguage, isRTL } = useTranslation();
  const { user, getProfile, logout } = useAuth();

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header - User Card */}
        <View style={styles.userCard}>
          {/* Avatar Image */}
          <Image
            source={{ uri: user?.avatar || "https://shorturl.at/ZpXL2" }}
            style={styles.avatar}
          />

          <Text style={styles.userName}>{user?.full_name || t('guest')}</Text>

          <View style={styles.peepeBalanceRow}>
            <Text style={styles.peepeLabel}>{t('peepeBalance')}</Text>
            <Text style={styles.peepeValue}>68 SAR</Text>
          </View>
        </View>

        {/* Saved Cars */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View className="flex-row items-center gap-4">
              <Feather name="truck" size={20} color="#FF5101" />
              <Text bold style={styles.sectionTitle}>{t('savedCars')}</Text>
            </View>

            <TouchableOpacity style={styles.addBtn}>
              <Link href="/order-process/add-car/add-car">
                <Text bold style={styles.addBtnText}>{t('addCar')}</Text>
              </Link>
            </TouchableOpacity>
          </View>

          <View style={styles.carItem}>
            <Text style={styles.carName}>Mercedes-Benz SLR</Text>
            <View style={styles.carActions}>
              <TouchableOpacity>
                <Link href="/profile-info/carInformation/carInformation">
                  <Text bold style={styles.editText}>{t('edit')}</Text>
                </Link>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 12 }}>
                <Ionicons name="close" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.carItem}>
            <Text style={styles.carName}>Porsche 911</Text>
            <Text style={styles.carPlate}>2222222 Black - GHJ 4566</Text>
            <View style={styles.carActions}>
              <TouchableOpacity>
                <Link href="/profile-info/carInformation/carInformation">
                  <Text bold style={styles.editText}>{t('edit')}</Text>
                </Link>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 12 }}>
                <Ionicons name="close" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Settings Items */}
        <View style={styles.settingsSection}>
          {/* Language Toggle - No separate page needed for toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="language-outline"
                size={22}
                color="#FF5101"
                style={styles.settingIcon}
              />
              <Text style={styles.settingLabel}>{t('language')}</Text>
            </View>
            <View style={styles.langToggle}>
              <Text
                style={[
                  styles.langOption,
                  language === "en" && styles.langActive,
                ]}
              >
                EN
              </Text>
              <Switch
                value={language === "ar"}
                onValueChange={toggleLanguage}
                trackColor={{ false: "#d1d5db", true: "#FF5101" }}
                thumbColor={language === "ar" ? "#FF5101" : "#fff"}
              />
              <Text
                style={[
                  styles.langOption,
                  language === "ar" && styles.langActive,
                ]}
              >
                AR
              </Text>
            </View>
          </View>

          {/* Edit Profile */}
          <Link href="/profile-info/editProfile/editProfile" asChild>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="person-outline"
                  size={22}
                  color="#FF5101"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>{t('editProfile')}</Text>
              </View>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Link>

          {/* Help & Support */}
          <Link href="/profile-info/helpSupport/helpSupport" asChild>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="help-circle-outline"
                  size={22}
                  color="#FF5101"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>{t('helpSupport')}</Text>
              </View>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Link>

          {/* Privacy & Security */}
          <Link href="/profile-info/privacySecurity/privacySecurity" asChild>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color="#FF5101"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>{t('privacySecurity')}</Text>
              </View>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Link>

          {/* Register Your Brand */}
          <Link href="/profile-info/registerBrand/registerBrand" asChild>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="business-outline"
                  size={22}
                  color="#FF5101"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>
                  {t('registerBrand')}
                </Text>
              </View>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Link>

          {/* Account Deletion */}
          <Link href="/profile-info/accountDeletion/accountDeletion" asChild>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color="#FF5101"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>{t('accountDeletion')}</Text>
              </View>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Logout */}

        <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color="white"
            style={styles.logoutIcon}
          />
          <Text bold style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>{t('version')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  userCard: {
    backgroundColor: "#DE4600",
    padding: 24,
    paddingTop: 32,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  userName: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  peepeBalanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  peepeLabel: {
    color: "#fcfcfc",
    fontSize: 15,
    marginRight: 8,
  },
  peepeValue: {
    color: "#f1e8ce",
    fontSize: 18,
    fontWeight: "700",
  },
  whitePepeBtn: {
    backgroundColor: "rgba(165, 137, 137, 0.12)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  whitePepeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  whitePepeCode: {
    color: "#f3f5f7",
    fontSize: 13,
    marginTop: 2,
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  addBtn: {
    backgroundColor: "#FF5101",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  carItem: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  carName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  carPlate: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 4,
  },
  carActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    justifyContent: "flex-end",
  },
  editText: {
    color: "#3b82f6",
    fontWeight: "600",
  },

  settingsSection: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: "#1e293b",
  },
  langToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  langOption: {
    fontSize: 15,
    fontWeight: "500",
    color: "#94a3b8",
  },
  langActive: {
    color: "#FF5101",
    fontWeight: "700",
  },

  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },

  version: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 13,
    marginVertical: 24,
  },
});
