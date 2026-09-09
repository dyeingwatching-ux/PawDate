import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DetailRow from '../components/DetailRow';
import storageService from '../services/storageService';
import petService from '../services/petService';

export default function DetailScreen({ route, navigation, isDarkMode }) {
  const initialPet = route.params?.pet || {};
  const [pet, setPet] = useState(initialPet);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check persistent playdate status on mount
  useEffect(() => {
    let isMounted = true;
    const loadPlaydateStatus = async () => {
      if (!pet.id) return;
      const requested = await storageService.isPlaydateRequested(pet.id);
      if (isMounted) {
        setIsLiked(requested);
        setLikeCount(requested ? 1 : 0);
      }
    };
    loadPlaydateStatus();
    return () => {
      isMounted = false;
    };
  }, [pet.id]);

  const handlePlaydateToggle = async () => {
    if (!pet.id) return;
    try {
      const result = await storageService.togglePlaydateRequest(pet.id);
      setIsLiked(result.isRequested);
      setLikeCount(result.isRequested ? 1 : 0);

      if (result.isRequested) {
        Alert.alert(
          '🐾 Playdate Request Sent!',
          `You matched with ${pet.name || 'this pet'}! Your request has been saved locally. 🎉`
        );
      } else {
        Alert.alert('💔 Unmatched', `You cancelled the playdate request with ${pet.name || 'this pet'}.`);
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to update playdate status.');
    }
  };

  const handleEditPress = () => {
    navigation.navigate('AddEditPet', {
      pet,
      onPetUpdated: (updatedPet) => {
        setPet(updatedPet);
        if (route.params?.onPetUpdated) {
          route.params.onPetUpdated(updatedPet);
        }
      },
    });
  };

  const handleDeletePress = () => {
    if (!pet.id) return;
    Alert.alert(
      'Delete Pet Profile',
      `Are you sure you want to remove ${pet.name || 'this pet'} from PawDate? This will execute a DELETE request on MockAPI.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await petService.deletePet(pet.id);
              Alert.alert('Deleted', `${pet.name || 'Pet'} was successfully removed.`, [
                {
                  text: 'OK',
                  onPress: () => {
                    if (route.params?.onPetDeleted) {
                      route.params.onPetDeleted(pet.id);
                    }
                    navigation.goBack();
                  },
                },
              ]);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete pet from MockAPI.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Dynamic styles based on dark mode
  const bgColor = isDarkMode ? '#0f172a' : '#f8f9fa';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const bioBg = isDarkMode ? '#334155' : '#f1f5f9';
  const bioText = isDarkMode ? '#f1f5f9' : '#475569';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';

  const petName = pet.name || 'Unnamed Pet';
  const petBreed = pet.breed || 'Mixed Breed';
  const petLocation = pet.location || 'Local Area';
  const petAgeStr = pet.age != null ? `${pet.age} ${pet.age === 1 ? 'year' : 'years'} old` : 'Unknown';
  const petPlayStyle = pet.playStyle || 'Friendly & playful';
  const petBio = pet.bio || 'Looking for friends to play with!';

  const infoRows = [
    { icon: '🏷️', label: 'Breed', value: petBreed },
    { icon: '🎂', label: 'Age', value: petAgeStr },
    { icon: '📍', label: 'Location', value: petLocation },
    { icon: '🎾', label: 'Play Style', value: petPlayStyle },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: bgColor }]}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Pet Avatar & Name Card */}
        <View style={[styles.heroCard, { backgroundColor: cardBg, borderColor }]}>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: isDarkMode ? '#0f172a' : '#eff6ff' },
            ]}
          >
            <Text style={styles.avatarEmoji}>{pet.emoji || '🐾'}</Text>
          </View>
          <Text style={[styles.detailTitle, { color: textColor }]}>{petName}</Text>
          <Text style={[styles.detailBreed, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
            {petBreed} • {petLocation}
          </Text>
        </View>

        {/* Info Rows Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>📋 Pet Information</Text>
          {infoRows.map((row, index) => (
            <DetailRow
              key={index}
              icon={row.icon}
              label={row.label}
              value={row.value}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>

        {/* Personality & Bio */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>💬 Personality & Bio</Text>
          <View style={[styles.bioCard, { backgroundColor: bioBg }]}>
            <Text style={[styles.bioText, { color: bioText }]}>{petBio}</Text>
          </View>
        </View>

        {/* Playdate Button (AsyncStorage persistent) */}
        <TouchableOpacity
          style={[styles.playdateButton, isLiked && styles.playdateButtonActive]}
          onPress={handlePlaydateToggle}
          activeOpacity={0.8}
        >
          <Text style={styles.playdateButtonText}>
            {isLiked ? '✓ Playdate Requested! (Tap to cancel)' : '🐾 Send Playdate Request'}
          </Text>
        </TouchableOpacity>

        {/* Match Count Badge */}
        <View style={[styles.matchScoreContainer, { borderTopColor: borderColor }]}>
          <Text style={[styles.matchScoreLabel, { color: textColor }]}>
            🐾 Paw-some Connections
          </Text>
          <Text style={styles.matchScoreNumber}>
            {likeCount} {likeCount === 1 ? 'buddy' : 'buddies'} connected with {petName}
          </Text>
        </View>

        {/* CRUD Action Buttons: Edit (PUT) & Delete (DELETE) */}
        <View style={styles.crudActionRow}>
          <TouchableOpacity
            style={[
              styles.editButton,
              {
                borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              },
            ]}
            onPress={handleEditPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.editButtonText, { color: isDarkMode ? '#93c5fd' : '#2563eb' }]}>
              ✏️ Edit Profile (PUT)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deleteButton,
              {
                backgroundColor: isDarkMode ? '#450a0a' : '#fef2f2',
                borderColor: isDarkMode ? '#991b1b' : '#fca5a5',
              },
              isDeleting && { opacity: 0.6 },
            ]}
            onPress={handleDeletePress}
            disabled={isDeleting}
            activeOpacity={0.7}
          >
            {isDeleting ? (
              <ActivityIndicator color="#ef4444" size="small" />
            ) : (
              <Text
                style={[
                  styles.deleteButtonText,
                  { color: isDarkMode ? '#f87171' : '#dc2626' },
                ]}
              >
                🗑️ Delete (DELETE)
              </Text>
            )}
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
  heroCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarEmoji: {
    fontSize: 50,
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  detailBreed: {
    fontSize: 15,
    marginTop: 4,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bioCard: {
    padding: 14,
    borderRadius: 12,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
  },
  playdateButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  playdateButtonActive: {
    backgroundColor: '#16a34a',
    shadowColor: '#16a34a',
  },
  playdateButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  matchScoreContainer: {
    marginVertical: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  matchScoreLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  matchScoreNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 2,
  },
  crudActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
});