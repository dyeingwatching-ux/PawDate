import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import petService from '../services/petService';

const AVAILABLE_EMOJIS = ['🐕', '🐈', '🐩', '🐺', '🐶', '🐰', '🦁', '🦜', '🦮', '🌭', '🐱', '🐹', '🐾'];

export default function AddEditPetScreen({ route, navigation, isDarkMode }) {
  // If editing, existing pet is passed via route.params.pet
  const existingPet = route.params?.pet;
  const isEditing = Boolean(existingPet && existingPet.id);

  const [name, setName] = useState(existingPet?.name || '');
  const [breed, setBreed] = useState(existingPet?.breed || '');
  const [age, setAge] = useState(existingPet?.age != null ? String(existingPet.age) : '');
  const [location, setLocation] = useState(existingPet?.location || '');
  const [playStyle, setPlayStyle] = useState(existingPet?.playStyle || '');
  const [bio, setBio] = useState(existingPet?.bio || '');
  const [emoji, setEmoji] = useState(existingPet?.emoji || '🐕');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Theme colors
  const bgColor = isDarkMode ? '#0f172a' : '#f8f9fa';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const labelColor = isDarkMode ? '#cbd5e1' : '#334155';
  const inputBg = isDarkMode ? '#334155' : '#f8fafc';
  const borderColor = isDarkMode ? '#475569' : '#e2e8f0';

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Pet name is required';
    if (!breed.trim()) errs.breed = 'Breed is required';
    if (!age.trim()) {
      errs.age = 'Age is required';
    } else if (isNaN(age) || Number(age) <= 0) {
      errs.age = 'Enter a valid age in years (e.g. 2 or 1.5)';
    }
    if (!location.trim()) errs.location = 'Location is required';
    if (!playStyle.trim()) errs.playStyle = 'Play style is required';
    if (!bio.trim()) errs.bio = 'Bio/personality is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please complete all required fields correctly.');
      return;
    }

    setLoading(true);

    const petData = {
      name: name.trim(),
      breed: breed.trim(),
      age: Number(age),
      location: location.trim(),
      playStyle: playStyle.trim(),
      bio: bio.trim(),
      emoji,
    };

    try {
      if (isEditing) {
        // PUT request to MockAPI
        const updated = await petService.updatePet(existingPet.id, petData);
        Alert.alert('Success 🎉', `${updated.name}'s profile was updated successfully!`, [
          {
            text: 'OK',
            onPress: () => {
              // Notify previous screens and return
              if (route.params?.onPetUpdated) {
                route.params.onPetUpdated(updated);
              }
              navigation.goBack();
            },
          },
        ]);
      } else {
        // POST request to MockAPI
        const created = await petService.createPet(petData);
        Alert.alert('Success 🐾', `Welcome ${created.name} to PawDate!`, [
          {
            text: 'OK',
            onPress: () => {
              if (route.params?.onPetCreated) {
                route.params.onPetCreated(created);
              }
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', `Operation failed: ${error.message || 'Unable to save to MockAPI'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Description */}
          <Text style={[styles.title, { color: textColor }]}>
            {isEditing ? `✏️ Edit ${existingPet?.name || 'Pet'}'s Profile` : '✨ Register a New Pet'}
          </Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
            {isEditing
              ? 'Update your pet details to keep match data accurate.'
              : 'Add your furry friend to find playful buddies in your neighborhood.'}
          </Text>

          {/* Emoji Avatar Selector */}
          <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.label, { color: labelColor }]}>Choose Avatar Emoji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
              {AVAILABLE_EMOJIS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.emojiBtn,
                    emoji === item && styles.emojiBtnSelected,
                    { backgroundColor: emoji === item ? '#2563eb' : inputBg },
                  ]}
                  onPress={() => setEmoji(item)}
                >
                  <Text style={styles.emojiText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Form Fields Card */}
          <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
            {/* Pet Name */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: labelColor }]}>Pet Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                  errors.name && styles.inputError,
                ]}
                placeholder="e.g. Barnaby"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Breed */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: labelColor }]}>Breed / Species *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                  errors.breed && styles.inputError,
                ]}
                placeholder="e.g. Golden Retriever, Persian Cat"
                placeholderTextColor="#94a3b8"
                value={breed}
                onChangeText={(val) => {
                  setBreed(val);
                  if (errors.breed) setErrors({ ...errors, breed: null });
                }}
              />
              {errors.breed && <Text style={styles.errorText}>{errors.breed}</Text>}
            </View>

            {/* Age & Location Row */}
            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: labelColor }]}>Age (Years) *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: inputBg, color: textColor, borderColor },
                    errors.age && styles.inputError,
                  ]}
                  placeholder="e.g. 2.5"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={(val) => {
                    setAge(val);
                    if (errors.age) setErrors({ ...errors, age: null });
                  }}
                />
                {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
              </View>

              <View style={[styles.formGroup, { flex: 1.4, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: labelColor }]}>Location / City *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: inputBg, color: textColor, borderColor },
                    errors.location && styles.inputError,
                  ]}
                  placeholder="e.g. Colombo 04"
                  placeholderTextColor="#94a3b8"
                  value={location}
                  onChangeText={(val) => {
                    setLocation(val);
                    if (errors.location) setErrors({ ...errors, location: null });
                  }}
                />
                {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
              </View>
            </View>

            {/* Play Style */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: labelColor }]}>Favorite Play Style *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                  errors.playStyle && styles.inputError,
                ]}
                placeholder="e.g. 🎾 Loves fetch & park sprints"
                placeholderTextColor="#94a3b8"
                value={playStyle}
                onChangeText={(val) => {
                  setPlayStyle(val);
                  if (errors.playStyle) setErrors({ ...errors, playStyle: null });
                }}
              />
              {errors.playStyle && <Text style={styles.errorText}>{errors.playStyle}</Text>}
            </View>

            {/* Bio / Personality */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: labelColor }]}>Personality & Bio *</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                  errors.bio && styles.inputError,
                ]}
                placeholder="Describe personality, energy level, likes & dislikes..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                value={bio}
                onChangeText={(val) => {
                  setBio(val);
                  if (errors.bio) setErrors({ ...errors, bio: null });
                }}
              />
              {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>
                {isEditing ? '💾 Save Changes (PUT)' : '🐾 Create Profile (POST)'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={[styles.cancelBtnText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  emojiRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  emojiBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  emojiBtnSelected: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  emojiText: {
    fontSize: 24,
  },
  formGroup: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
