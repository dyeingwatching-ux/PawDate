import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PetCard from '../components/petcard';
import LoadingView from '../components/LoadingView';
import ErrorBanner from '../components/ErrorBanner';
import AnimalCategoryFilter, { getPetCategory, CATEGORIES } from '../components/AnimalCategoryFilter';
import TinderDeck from '../components/TinderDeck';
import MatchModal from '../components/MatchModal';
import petService from '../services/petService';
import storageService from '../services/storageService';

export default function HomeScreen({ navigation, isDarkMode }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [requestedPetIds, setRequestedPetIds] = useState([]);

  // Tinder Swiper & Category State
  const [viewMode, setViewMode] = useState('swipe'); // 'swipe' (Tinder) | 'list' (Classic)
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [matchedPet, setMatchedPet] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Fetch pets and playdate requests
  const fetchPets = useCallback(async (isPullRefresh = false) => {
    if (isPullRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage(null);

    try {
      // 1. Fetch from MockAPI / Local Cache
      const result = await petService.getAllPets();
      setPets(result.data || []);
      setIsOffline(Boolean(result.isOffline));
      if (result.error && !result.data?.length) {
        setErrorMessage(result.error);
      }

      // 2. Fetch locally stored playdate requests
      const requested = await storageService.getPlaydateRequests();
      setRequestedPetIds(requested);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to load pets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  // Reload requested badges and sync pets when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const requested = await storageService.getPlaydateRequests();
      setRequestedPetIds(requested);

      // Check if cache has updated (e.g. from Settings seed or clear)
      const cached = await storageService.getCachedPets();
      if (cached && Array.isArray(cached) && cached.length > 0) {
        setPets(cached);
      }
    });
    return unsubscribe;
  }, [navigation]);

  // Compute counts per category
  const categoryCounts = useMemo(() => {
    const counts = { all: pets.length, dog: 0, cat: 0, rabbit: 0, bird: 0, other: 0 };
    pets.forEach((p) => {
      const cat = getPetCategory(p);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [pets]);

  // Filter pets by animal category and search text
  const displayedPets = useMemo(() => {
    return pets.filter((pet) => {
      // 1. Category check
      if (selectedCategory !== 'all') {
        const cat = getPetCategory(pet);
        if (cat !== selectedCategory) return false;
      }

      // 2. Search check
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          pet.name?.toLowerCase().includes(q) ||
          pet.breed?.toLowerCase().includes(q) ||
          pet.location?.toLowerCase().includes(q) ||
          pet.playStyle?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [pets, selectedCategory, search]);

  // Tinder swipe right (Like / Request Playdate)
  const handleSwipeRight = async (pet) => {
    if (!pet || !pet.id) return;
    try {
      const petIdStr = String(pet.id);
      if (!requestedPetIds.includes(petIdStr)) {
        const result = await storageService.togglePlaydateRequest(pet.id);
        setRequestedPetIds(result.requests);
      }
      setMatchedPet(pet);
      setShowMatchModal(true);
    } catch (e) {
      console.warn('Failed to save swipe right like:', e);
    }
  };

  // Tinder swipe left (Pass)
  const handleSwipeLeft = (_pet) => {
    // Left swipe passes quietly
  };

  // Handlers for CRUD state sync
  const handlePetCreated = (newPet) => {
    if (!newPet) return;
    setPets((prev) => [newPet, ...prev.filter((p) => String(p.id) !== String(newPet.id))]);
  };

  const handlePetUpdated = (updatedPet) => {
    if (!updatedPet) return;
    setPets((prev) =>
      prev.map((p) => (String(p.id) === String(updatedPet.id) ? updatedPet : p))
    );
  };

  const handlePetDeleted = (deletedId) => {
    if (!deletedId) return;
    setPets((prev) => prev.filter((p) => String(p.id) !== String(deletedId)));
  };

  // Theming colors
  const bgColor = isDarkMode ? '#0f172a' : '#f8f9fa';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subtitleColor = isDarkMode ? '#94a3b8' : '#64748b';
  const inputBg = isDarkMode ? '#1e293b' : '#ffffff';
  const inputBorder = isDarkMode ? '#334155' : '#e2e8f0';

  const currentCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory);
  const currentCategoryLabel = currentCategoryObj ? currentCategoryObj.label : 'Pets';
  const currentCategoryEmoji = currentCategoryObj ? currentCategoryObj.emoji : '🐾';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.appTitle, { color: textColor }]}>🐾 PawDate</Text>
            <Text style={[styles.appTagline, { color: subtitleColor }]}>
              Find playmates for lonely pets
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addHeaderBtn}
              onPress={() =>
                navigation.navigate('AddEditPet', {
                  onPetCreated: handlePetCreated,
                })
              }
              activeOpacity={0.8}
            >
              <Text style={styles.addHeaderBtnText}>+ Add Pet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconButton,
                {
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                },
              ]}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 18 }}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Offline & Error Banner */}
        <ErrorBanner
          message={errorMessage}
          isOffline={isOffline}
          onRetry={() => fetchPets(false)}
          isDarkMode={isDarkMode}
        />

        {/* Mode Switcher: 🔥 Tinder Swiper vs 📋 List View */}
        <View
          style={[
            styles.modeSwitcher,
            { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.modeTab,
              viewMode === 'swipe' && [
                styles.modeTabActive,
                { backgroundColor: isDarkMode ? '#2563eb' : '#ffffff' },
              ],
            ]}
            onPress={() => setViewMode('swipe')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeTabText,
                {
                  color:
                    viewMode === 'swipe'
                      ? isDarkMode
                        ? '#ffffff'
                        : '#2563eb'
                      : isDarkMode
                      ? '#94a3b8'
                      : '#64748b',
                  fontWeight: viewMode === 'swipe' ? '800' : '600',
                },
              ]}
            >
              🔥 Match Swiper
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTab,
              viewMode === 'list' && [
                styles.modeTabActive,
                { backgroundColor: isDarkMode ? '#2563eb' : '#ffffff' },
              ],
            ]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeTabText,
                {
                  color:
                    viewMode === 'list'
                      ? isDarkMode
                        ? '#ffffff'
                        : '#2563eb'
                      : isDarkMode
                      ? '#94a3b8'
                      : '#64748b',
                  fontWeight: viewMode === 'list' ? '800' : '600',
                },
              ]}
            >
              📋 Browse All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Animal Selector (Category Filter Chips) */}
        <AnimalCategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          counts={categoryCounts}
          isDarkMode={isDarkMode}
        />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              { backgroundColor: inputBg, color: textColor, borderColor: inputBorder },
            ]}
            placeholder={`🔍 Search ${currentCategoryLabel.toLowerCase()} by name, breed...`}
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity style={styles.clearSearchBtn} onPress={() => setSearch('')}>
              <Text style={{ color: isDarkMode ? '#cbd5e1' : '#94a3b8', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Pet Counter Bar */}
        <View style={styles.counterRow}>
          <Text style={[styles.petCount, { color: subtitleColor }]}>
            {currentCategoryEmoji}{' '}
            {displayedPets.length} {displayedPets.length === 1 ? 'pet' : 'pets'} available
          </Text>
          {requestedPetIds.length > 0 && (
            <Text style={[styles.matchCounter, { color: '#16a34a' }]}>
              ❤️ {requestedPetIds.length} requested
            </Text>
          )}
        </View>

        {/* Main Content: Loading State vs Tinder Deck vs List View */}
        {loading ? (
          <LoadingView isDarkMode={isDarkMode} message="Loading pets from MockAPI..." />
        ) : viewMode === 'swipe' ? (
          /* Tinder Swiping Deck Mode */
          <TinderDeck
            pets={displayedPets}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onPressPet={(pet) =>
              navigation.navigate('Detail', {
                pet,
                onPetUpdated: handlePetUpdated,
                onPetDeleted: handlePetDeleted,
              })
            }
            isRequested={(id) => requestedPetIds.includes(String(id))}
            isDarkMode={isDarkMode}
            categoryName={currentCategoryLabel}
            onResetDeck={() => fetchPets(false)}
          />
        ) : (
          /* Classic List View Mode */
          <FlatList
            data={displayedPets}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <PetCard
                pet={item}
                isRequested={requestedPetIds.includes(String(item.id))}
                isDarkMode={isDarkMode}
                onPress={() =>
                  navigation.navigate('Detail', {
                    pet: item,
                    onPetUpdated: handlePetUpdated,
                    onPetDeleted: handlePetDeleted,
                  })
                }
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchPets(true)}
                colors={['#2563eb']}
                tintColor={isDarkMode ? '#60a5fa' : '#2563eb'}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>😢</Text>
                <Text style={[styles.emptyText, { color: textColor }]}>
                  {search
                    ? 'No pets match your search'
                    : `No ${currentCategoryLabel.toLowerCase()} available right now`}
                </Text>
                <Text style={[styles.emptySubtext, { color: subtitleColor }]}>
                  {search
                    ? 'Try searching with another keyword or location'
                    : 'Tap "+ Add Pet" to register a new pet in this category!'}
                </Text>
                {!search && (
                  <TouchableOpacity
                    style={styles.emptyAddBtn}
                    onPress={() =>
                      navigation.navigate('AddEditPet', {
                        onPetCreated: handlePetCreated,
                      })
                    }
                  >
                    <Text style={styles.emptyAddBtnText}>+ Register a Pet</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          />
        )}

        {/* Celebration Match Modal */}
        <MatchModal
          visible={showMatchModal}
          pet={matchedPet}
          isDarkMode={isDarkMode}
          onClose={() => setShowMatchModal(false)}
          onViewProfile={(pet) =>
            navigation.navigate('Detail', {
              pet,
              onPetUpdated: handlePetUpdated,
              onPetDeleted: handlePetDeleted,
            })
          }
        />
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addHeaderBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addHeaderBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  modeSwitcher: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginVertical: 6,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 13,
  },
  searchContainer: {
    position: 'relative',
    marginVertical: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 14,
    top: 12,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
    paddingHorizontal: 4,
  },
  petCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  matchCounter: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  emptyAddBtn: {
    marginTop: 18,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  emptyAddBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});