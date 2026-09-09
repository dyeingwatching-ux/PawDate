import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function PetCard({ pet = {}, onPress, isRequested = false, isDarkMode = false }) {
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const borderColor = isDarkMode ? '#334155' : '#f1f5f9';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subtitleColor = isDarkMode ? '#94a3b8' : '#64748b';
  const badgeBg = isDarkMode ? '#064e3b' : '#dcfce7';
  const badgeText = isDarkMode ? '#6ee7b7' : '#15803d';

  const petName = pet.name || 'Unnamed Pet';
  const petBreed = pet.breed || 'Mixed Breed';
  const petAgeText = pet.age != null ? `${pet.age} ${pet.age === 1 ? 'yr' : 'yrs'}` : '';
  const petLocation = pet.location || 'Local Area';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor: isRequested ? '#22c55e' : borderColor },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Emoji Avatar */}
        <View style={[styles.avatarBox, { backgroundColor: isDarkMode ? '#334155' : '#f1f5f9' }]}>
          <Text style={styles.avatarEmoji}>{pet.emoji || '🐾'}</Text>
        </View>

        {/* Pet Information */}
        <View style={styles.infoBox}>
          <View style={styles.nameRow}>
            <Text style={[styles.petName, { color: textColor }]} numberOfLines={1}>
              {petName}
            </Text>
            {isRequested && (
              <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                <Text style={[styles.badgeLabel, { color: badgeText }]}>✓ Matched</Text>
              </View>
            )}
          </View>
          <Text style={[styles.petSubtitle, { color: subtitleColor }]} numberOfLines={1}>
            {petBreed}{petAgeText ? ` • ${petAgeText}` : ''}
          </Text>
          <Text style={[styles.locationText, { color: subtitleColor }]} numberOfLines={1}>
            📍 {petLocation}
          </Text>
        </View>

        {/* Chevron */}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  infoBox: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 6,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  petSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: '#94a3b8',
    fontWeight: '600',
  },
});