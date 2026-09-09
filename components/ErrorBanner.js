import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ErrorBanner({ message, isOffline, onRetry, isDarkMode }) {
  if (!message && !isOffline) return null;

  const bannerBg = isOffline ? (isDarkMode ? '#854d0e' : '#fef3c7') : (isDarkMode ? '#7f1d1d' : '#fee2e2');
  const textColor = isOffline ? (isDarkMode ? '#fef08a' : '#92400e') : (isDarkMode ? '#fca5a5' : '#991b1b');
  const buttonBg = isOffline ? '#d97706' : '#dc2626';

  return (
    <View style={[styles.container, { backgroundColor: bannerBg }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: textColor }]}>
          {isOffline ? '📡 Offline Mode (Cached Data)' : '⚠️ Connection Error'}
        </Text>
        <Text style={[styles.message, { color: textColor }]}>
          {isOffline
            ? 'Displaying local cache from AsyncStorage. Reconnect to sync with MockAPI.'
            : (message || 'Failed to reach MockAPI server.')}
        </Text>
      </View>
      {onRetry && (
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: buttonBg }]} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
  },
  retryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
