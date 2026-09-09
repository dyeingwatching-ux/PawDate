import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function MatchModal({ visible, pet, onClose, onViewProfile, isDarkMode }) {
  if (!pet) return null;

  const modalBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subtitleColor = isDarkMode ? '#94a3b8' : '#64748b';
  const cardBg = isDarkMode ? '#0f172a' : '#f8f9fa';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: modalBg }]}>
          {/* Confetti & Hearts Header */}
          <Text style={styles.celebrationEmoji}>🎉 🐾 ❤️</Text>
          <Text style={[styles.matchTitle, { color: isDarkMode ? '#f472b6' : '#ec4899' }]}>
            It's a Paw Match!
          </Text>
          <Text style={[styles.matchSubtitle, { color: subtitleColor }]}>
            You sent a playdate request to
          </Text>

          {/* Pet Highlight Box */}
          <View style={[styles.petHighlight, { backgroundColor: cardBg }]}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>{pet.emoji || '🐾'}</Text>
            </View>
            <Text style={[styles.petName, { color: textColor }]}>{pet.name}</Text>
            <Text style={[styles.petDetails, { color: subtitleColor }]}>
              {pet.breed} • {pet.age} {pet.age === 1 ? 'yr' : 'yrs'}
            </Text>
            <Text style={[styles.petLocation, { color: isDarkMode ? '#60a5fa' : '#2563eb' }]}>
              📍 {pet.location}
            </Text>
            {pet.playStyle && (
              <Text style={[styles.playStylePreview, { color: textColor }]} numberOfLines={2}>
                {pet.playStyle}
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            {onViewProfile && (
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => {
                  onClose();
                  onViewProfile(pet);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.profileButtonText}>👀 View Profile</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.continueButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>✨ Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: Math.min(width - 48, 360),
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  celebrationEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  matchTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  matchSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  petHighlight: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#ec4899',
  },
  avatarEmoji: {
    fontSize: 44,
  },
  petName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  petDetails: {
    fontSize: 13,
    marginBottom: 4,
  },
  petLocation: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  playStylePreview: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },
  buttonGroup: {
    width: '100%',
    gap: 10,
  },
  profileButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
