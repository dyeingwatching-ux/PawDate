import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoadingView({ message = 'Fetching playdates...', isDarkMode = false }) {
  const bgColor = isDarkMode ? '#1e293b' : '#f8f9fa';
  const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
  const subtextColor = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={styles.emoji}>🐾</Text>
      <ActivityIndicator size="large" color="#2563eb" style={styles.spinner} />
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
      <Text style={[styles.subtext, { color: subtextColor }]}>Connecting to MockAPI cloud...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  spinner: {
    marginVertical: 12,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
});
