import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export const CATEGORIES = [
  { id: 'all', label: 'All Pets', emoji: '🐾' },
  { id: 'dog', label: 'Dogs', emoji: '🐕' },
  { id: 'cat', label: 'Cats', emoji: '🐈' },
  { id: 'rabbit', label: 'Rabbits', emoji: '🐰' },
  { id: 'bird', label: 'Birds', emoji: '🦜' },
  { id: 'other', label: 'Other', emoji: '✨' },
];

/**
 * Helper function to categorize a pet based on emoji, breed, and name text
 */
export const getPetCategory = (pet) => {
  if (!pet) return 'other';
  const emoji = pet.emoji || '';
  const breed = (pet.breed || '').toLowerCase();
  const name = (pet.name || '').toLowerCase();

  // 1. Dog recognition
  if (
    emoji === '🐕' ||
    emoji === '🐶' ||
    emoji === '🐩' ||
    emoji === '🐺' ||
    emoji === '🦮' ||
    emoji === '🌭' ||
    breed.includes('dog') ||
    breed.includes('beagle') ||
    breed.includes('husky') ||
    breed.includes('poodle') ||
    breed.includes('labrador') ||
    breed.includes('bulldog') ||
    breed.includes('dachshund') ||
    breed.includes('chihuahua') ||
    breed.includes('retriever') ||
    breed.includes('golden') ||
    breed.includes('shepherd') ||
    breed.includes('terrier') ||
    breed.includes('pug') ||
    breed.includes('corgi') ||
    breed.includes('boxer') ||
    breed.includes('rottweiler') ||
    breed.includes('pitbull') ||
    breed.includes('dalmatian') ||
    breed.includes('samoyed') ||
    breed.includes('shiba') ||
    breed.includes('spaniel') ||
    breed.includes('maltese') ||
    breed.includes('pomeranian') ||
    breed.includes('pinscher') ||
    breed.includes('puppy') ||
    breed.includes('hound')
  ) {
    return 'dog';
  }

  // 2. Cat recognition
  if (
    emoji === '🐈' ||
    emoji === '😺' ||
    emoji === '🐱' ||
    emoji === '🦁' ||
    breed.includes('cat') ||
    breed.includes('tabby') ||
    breed.includes('persian') ||
    breed.includes('maine coon') ||
    breed.includes('siamese') ||
    breed.includes('shorthair') ||
    breed.includes('ragdoll') ||
    breed.includes('bengal') ||
    breed.includes('sphynx') ||
    breed.includes('british') ||
    breed.includes('scottish') ||
    breed.includes('kitten') ||
    breed.includes('feline')
  ) {
    return 'cat';
  }

  // 3. Rabbit / Rodent recognition
  if (
    emoji === '🐰' ||
    emoji === '🐇' ||
    emoji === '🐹' ||
    breed.includes('rabbit') ||
    breed.includes('lop') ||
    breed.includes('bunny') ||
    breed.includes('hamster') ||
    breed.includes('guinea pig') ||
    breed.includes('chinchilla')
  ) {
    return 'rabbit';
  }

  // 4. Bird recognition
  if (
    emoji === '🦜' ||
    emoji === '🐦' ||
    emoji === '🦅' ||
    emoji === '🦉' ||
    breed.includes('parrot') ||
    breed.includes('bird') ||
    breed.includes('grey') ||
    breed.includes('cockatiel') ||
    breed.includes('budgie') ||
    breed.includes('canary') ||
    breed.includes('cockatoo') ||
    breed.includes('macaw') ||
    breed.includes('finch')
  ) {
    return 'bird';
  }

  return 'other';
};

export default function AnimalCategoryFilter({
  selectedCategory = 'all',
  onSelectCategory,
  counts = {},
  isDarkMode = false,
}) {
  const bgActive = isDarkMode ? '#3b82f6' : '#2563eb';
  const textActive = '#ffffff';
  const bgInactive = isDarkMode ? '#1e293b' : '#ffffff';
  const textInactive = isDarkMode ? '#94a3b8' : '#475569';
  const borderInactive = isDarkMode ? '#334155' : '#e2e8f0';

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = counts[cat.id] ?? 0;

          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? bgActive : bgInactive,
                  borderColor: isSelected ? bgActive : borderInactive,
                },
                isSelected && styles.chipActiveShadow,
              ]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.chipLabel,
                  {
                    color: isSelected ? textActive : textInactive,
                    fontWeight: isSelected ? '700' : '600',
                  },
                ]}
              >
                {cat.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(255, 255, 255, 0.25)'
                        : isDarkMode
                        ? '#334155'
                        : '#f1f5f9',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: isSelected ? '#ffffff' : isDarkMode ? '#cbd5e1' : '#64748b' },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  chipActiveShadow: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  chipEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  chipLabel: {
    fontSize: 13,
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
