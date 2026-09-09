import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import storageService from '../services/storageService';
import petService from '../services/petService';

export default function SettingsScreen({ navigation, isDarkMode, setIsDarkMode }) {
  const [ownerName, setOwnerName] = useState('Pet Parent');
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Load saved settings from AsyncStorage
  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        const settings = await storageService.getUserSettings();
        if (isMounted) {
          setOwnerName(settings.ownerName || 'Pet Parent');
          setCustomApiUrl(settings.customApiUrl || '');
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDarkModeToggle = async (value) => {
    setIsDarkMode(value);
    await storageService.saveUserSettings({ isDarkMode: value });
  };

  const handleSaveProfile = async () => {
    try {
      await storageService.saveUserSettings({
        ownerName: ownerName.trim() || 'Pet Parent',
        customApiUrl: customApiUrl.trim(),
      });
      Alert.alert('Saved ✅', 'Your settings and MockAPI configuration have been updated.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Local Cache',
      'This will remove cached pets from AsyncStorage. Next time, the app will re-fetch fresh data from MockAPI.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            await storageService.clearCache();
            setIsClearing(false);
            Alert.alert('Cache Cleared', 'Local offline data has been cleared.');
          },
        },
      ]
    );
  };

  const handleSeedMockApi = async () => {
    Alert.alert(
      'Seed Sample Pets to MockAPI',
      'This will populate your MockAPI endpoint with initial sample pets (Whiskers, Mochi, Ollie, etc.) via POST requests.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed Now',
          onPress: async () => {
            setIsSeeding(true);
            try {
              const created = await petService.seedInitialPets();
              Alert.alert(
                'Seeding Complete 🎉',
                `Successfully created and cached ${created.length} sample pets!`
              );
            } catch (err) {
              Alert.alert('Seeding Error', err.message || 'Failed to seed sample pets.');
            } finally {
              setIsSeeding(false);
            }
          },
        },
      ]
    );
  };

  // Theming colors
  const containerBg = isDarkMode ? '#0f172a' : '#f8f9fa';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subtextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const inputBg = isDarkMode ? '#334155' : '#f8fafc';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: containerBg }]}>
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: containerBg }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: containerBg }]}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Text style={[styles.headerTitle, { color: textColor }]}>⚙️ PawDate Settings</Text>
        <Text style={[styles.headerSubtitle, { color: subtextColor }]}>
          Manage profile, theme, MockAPI endpoint & local storage
        </Text>

        {/* Profile Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>👤 Owner Profile</Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Pet Parent Name</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBg, color: textColor, borderColor },
              ]}
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="Enter your name"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Theme Preferences Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>🎨 App Appearance</Text>
          <View style={styles.switchRow}>
            <View>
              <Text style={[styles.label, { color: textColor }]}>Dark Mode</Text>
              <Text style={[styles.hintText, { color: subtextColor }]}>
                Persisted in AsyncStorage
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
              thumbColor={isDarkMode ? '#ffffff' : '#f8fafc'}
            />
          </View>
        </View>

        {/* MockAPI Endpoint Configuration Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>🌐 REST API Configuration</Text>
          <Text style={[styles.hintText, { color: subtextColor, marginBottom: 10 }]}>
            Connect your own MockAPI endpoint for testing:
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Custom MockAPI Base URL</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBg, color: textColor, borderColor },
              ]}
              value={customApiUrl}
              onChangeText={setCustomApiUrl}
              placeholder="e.g. https://xxxxxx.mockapi.io/api/v1"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={[styles.hintText, { color: subtextColor, marginTop: 4 }]}>
              Leave blank to use the pre-configured default MockAPI resource.
            </Text>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>💾 Save Configuration</Text>
          </TouchableOpacity>
        </View>

        {/* Developer & Offline Tools Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>🛠️ Storage & Data Tools</Text>

          {/* Seed MockAPI Button */}
          <TouchableOpacity
            style={[
              styles.toolBtn,
              { borderColor, backgroundColor: isDarkMode ? '#1e293b' : '#eff6ff' },
            ]}
            onPress={handleSeedMockApi}
            disabled={isSeeding}
            activeOpacity={0.7}
          >
            {isSeeding ? (
              <ActivityIndicator color="#2563eb" size="small" />
            ) : (
              <Text style={[styles.toolBtnText, { color: '#2563eb' }]}>
                🚀 Seed MockAPI with Sample Pets (12)
              </Text>
            )}
          </TouchableOpacity>

          {/* Clear Cache Button */}
          <TouchableOpacity
            style={[
              styles.toolBtn,
              { borderColor, marginTop: 8, backgroundColor: isDarkMode ? '#1e293b' : '#fef2f2' },
            ]}
            onPress={handleClearCache}
            disabled={isClearing}
            activeOpacity={0.7}
          >
            {isClearing ? (
              <ActivityIndicator color="#dc2626" size="small" />
            ) : (
              <Text style={[styles.toolBtnText, { color: '#dc2626' }]}>
                🧹 Clear Local AsyncStorage Cache
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.welcomeText, { color: subtextColor }]}>
            👋 Logged in as <Text style={{ fontWeight: 'bold' }}>{ownerName || 'Pet Parent'}</Text>
          </Text>
          <Text style={[styles.versionText, { color: subtextColor }]}>
            PawDate • Feature-Complete Production Ready
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Back to Pets</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  hintText: {
    fontSize: 12,
    lineHeight: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  toolBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  toolBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
  },
  versionText: {
    fontSize: 12,
    marginTop: 4,
  },
  backButton: {
    marginTop: 18,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});