import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DetailRow({ icon, label, value, isDarkMode }) {
  const labelColor = isDarkMode ? '#94a3b8' : '#64748b';
  const valueColor = isDarkMode ? '#f1f5f9' : '#0f172a';
  const borderColor = isDarkMode ? '#334155' : '#f1f5f9';

  return (
    <View style={[styles.row, { borderBottomColor: borderColor }]}>
      <Text style={[styles.label, { color: labelColor }]}>
        {icon ? `${icon} ` : ''}{label}
      </Text>
      <Text style={[styles.value, { color: valueColor }]}>
        {value != null && String(value).trim() !== '' ? value : '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
});