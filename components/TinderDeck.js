import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

export default function TinderDeck({
  pets = [],
  onSwipeRight,
  onSwipeLeft,
  onPressPet,
  isRequested = () => false,
  isDarkMode = false,
  categoryName = 'All Pets',
  onResetDeck,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]); // Stack of previous indices
  const isSwiping = useRef(false);

  // Position value for the top card
  const position = useRef(new Animated.ValueXY()).current;

  // Mutable refs to prevent stale closure bugs in PanResponder
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const petsRef = useRef(pets);
  petsRef.current = pets;

  const onSwipeRightRef = useRef(onSwipeRight);
  onSwipeRightRef.current = onSwipeRight;

  const onSwipeLeftRef = useRef(onSwipeLeft);
  onSwipeLeftRef.current = onSwipeLeft;

  const forceSwipeRef = useRef(null);

  // Reset index only when pet IDs or category actually change
  const petIdsString = pets.map((p) => p.id).join(',');
  useEffect(() => {
    setCurrentIndex(0);
    setHistory([]);
    isSwiping.current = false;
    position.setValue({ x: 0, y: 0 });
  }, [petIdsString, categoryName]);

  // Handle swipe completion
  const onSwipeComplete = useCallback(
    (direction, pet) => {
      isSwiping.current = false;
      position.setValue({ x: 0, y: 0 });

      const idx = currentIndexRef.current;
      setHistory((prev) => [...prev, { index: idx, pet, direction }]);
      setCurrentIndex((prev) => prev + 1);

      if (direction === 'right') {
        if (onSwipeRightRef.current) onSwipeRightRef.current(pet);
      } else {
        if (onSwipeLeftRef.current) onSwipeLeftRef.current(pet);
      }
    },
    [position]
  );

  // Reset card back to center if swipe didn't cross threshold
  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      tension: 40,
      useNativeDriver: false,
    }).start(() => {
      isSwiping.current = false;
    });
  }, [position]);

  // Programmatic swipe animation
  const forceSwipe = useCallback(
    (direction, dy = 0) => {
      const idx = currentIndexRef.current;
      const currentPets = petsRef.current;

      if (isSwiping.current || idx >= currentPets.length) return;
      isSwiping.current = true;

      const currentPet = currentPets[idx];
      const targetX = direction === 'right' ? SCREEN_WIDTH + 120 : -SCREEN_WIDTH - 120;

      Animated.timing(position, {
        toValue: { x: targetX, y: dy },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: false,
      }).start(() => {
        onSwipeComplete(direction, currentPet);
      });
    },
    [onSwipeComplete, position]
  );

  forceSwipeRef.current = forceSwipe;

  // PanResponder configuration for gesture tracking
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10;
      },
      onPanResponderGrant: () => {
        // Start dragging
      },
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          if (forceSwipeRef.current) forceSwipeRef.current('right', gesture.dy);
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          if (forceSwipeRef.current) forceSwipeRef.current('left', gesture.dy);
        } else {
          resetPosition();
        }
      },
      onPanResponderTerminate: () => {
        resetPosition();
      },
    })
  ).current;

  // Undo / Rewind the last swiped pet
  const handleUndo = () => {
    if (history.length === 0 || isSwiping.current) return;

    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setCurrentIndex(last.index);
    position.setValue({ x: 0, y: 0 });
  };

  // Card transform styles
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ['-25deg', '0deg', '25deg'],
  });

  const animatedCardStyle = {
    transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
  };

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Theme colors
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const cardBorder = isDarkMode ? '#334155' : '#e2e8f0';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subtitleColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tagBg = isDarkMode ? '#334155' : '#f1f5f9';
  const actionBtnBg = isDarkMode ? '#1e293b' : '#ffffff';

  // Render when no more cards left
  if (currentIndex >= pets.length) {
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={[styles.emptyTitle, { color: textColor }]}>You're All Caught Up!</Text>
          <Text style={[styles.emptySubtitle, { color: subtitleColor }]}>
            You've reviewed all available {categoryName} playmates.
          </Text>

          <TouchableOpacity
            style={styles.restartBtn}
            onPress={() => {
              setCurrentIndex(0);
              setHistory([]);
              if (onResetDeck) onResetDeck();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.restartBtnText}>🔄 Shuffle & Start Over</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.deckWrapper}>
      {/* Card Stack Area */}
      <View style={styles.cardsContainer}>
        {pets
          .map((pet, i) => {
            if (i < currentIndex) return null;
            if (i > currentIndex + 2) return null;

            const isTop = i === currentIndex;
            const isSecond = i === currentIndex + 1;
            const isThird = i === currentIndex + 2;

            const requested = isRequested(pet.id);

            // Sub-card scaling & offset for 3D deck perspective
            const stackStyle = isSecond
              ? {
                  transform: [{ scale: 0.95 }, { translateY: 12 }],
                  opacity: 0.85,
                  zIndex: 2,
                }
              : isThird
              ? {
                  transform: [{ scale: 0.9 }, { translateY: 24 }],
                  opacity: 0.65,
                  zIndex: 1,
                }
              : {
                  zIndex: 3,
                };

            if (isTop) {
              return (
                <Animated.View
                  key={pet.id}
                  style={[
                    styles.card,
                    { backgroundColor: cardBg, borderColor: cardBorder },
                    animatedCardStyle,
                    stackStyle,
                  ]}
                  {...panResponder.panHandlers}
                >
                  {/* LIKE STAMP OVERLAY */}
                  <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}>
                    <Text style={styles.likeStampText}>PLAYDATE ❤️</Text>
                  </Animated.View>

                  {/* NOPE STAMP OVERLAY */}
                  <Animated.View style={[styles.stamp, styles.nopeStamp, { opacity: nopeOpacity }]}>
                    <Text style={styles.nopeStampText}>PASS ✖️</Text>
                  </Animated.View>

                  {/* Top Header / Avatar Banner */}
                  <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => onPressPet && onPressPet(pet)}
                    activeOpacity={0.9}
                  >
                    <View
                      style={[
                        styles.avatarBox,
                        { backgroundColor: isDarkMode ? '#0f172a' : '#eff6ff' },
                      ]}
                    >
                      <Text style={styles.cardAvatarEmoji}>{pet.emoji || '🐾'}</Text>
                    </View>

                    {requested && (
                      <View style={styles.requestedBadge}>
                        <Text style={styles.requestedBadgeText}>❤️ Requested</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Pet Info Body */}
                  <View style={styles.cardBody}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.petName, { color: textColor }]}>{pet.name}</Text>
                      <View style={styles.ageBadge}>
                        <Text style={styles.ageBadgeText}>
                          {pet.age != null ? `${pet.age} ${pet.age === 1 ? 'yr' : 'yrs'}` : '1 yr'}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[styles.breedText, { color: isDarkMode ? '#60a5fa' : '#2563eb' }]}
                    >
                      {pet.breed}
                    </Text>

                    <View style={styles.locationRow}>
                      <Text style={[styles.locationText, { color: subtitleColor }]}>
                        📍 {pet.location || 'Local Area'}
                      </Text>
                    </View>

                    {pet.playStyle && (
                      <View style={[styles.playStyleBox, { backgroundColor: tagBg }]}>
                        <Text
                          style={[styles.playStyleText, { color: textColor }]}
                          numberOfLines={2}
                        >
                          {pet.playStyle}
                        </Text>
                      </View>
                    )}

                    {pet.bio && (
                      <Text style={[styles.bioText, { color: subtitleColor }]} numberOfLines={2}>
                        "{pet.bio}"
                      </Text>
                    )}
                  </View>

                  {/* Tap to View Full Profile Hint */}
                  <TouchableOpacity
                    style={[styles.tapHintBtn, { borderTopColor: cardBorder }]}
                    onPress={() => onPressPet && onPressPet(pet)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tapHintText,
                        { color: isDarkMode ? '#93c5fd' : '#2563eb' },
                      ]}
                    >
                      Tap for full profile & info ➔
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            }

            // Static background cards in the deck
            return (
              <View
                key={pet.id}
                style={[
                  styles.card,
                  { backgroundColor: cardBg, borderColor: cardBorder },
                  stackStyle,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.avatarBox,
                      { backgroundColor: isDarkMode ? '#0f172a' : '#eff6ff' },
                    ]}
                  >
                    <Text style={styles.cardAvatarEmoji}>{pet.emoji || '🐾'}</Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.petName, { color: textColor }]}>{pet.name}</Text>
                  <Text
                    style={[styles.breedText, { color: isDarkMode ? '#60a5fa' : '#2563eb' }]}
                  >
                    {pet.breed}
                  </Text>
                </View>
              </View>
            );
          })
          .reverse()}
      </View>

      {/* Tinder Bottom Action Controls */}
      <View style={styles.actionsBar}>
        {/* Undo / Rewind */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.undoButton,
            { backgroundColor: actionBtnBg },
            history.length === 0 && styles.disabledButton,
          ]}
          onPress={handleUndo}
          disabled={history.length === 0}
          activeOpacity={0.7}
        >
          <Text style={styles.undoIcon}>⏪</Text>
        </TouchableOpacity>

        {/* Pass / Dislike (Swipe Left) */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.passButton,
            { backgroundColor: actionBtnBg },
          ]}
          onPress={() => forceSwipe('left')}
          activeOpacity={0.7}
        >
          <Text style={styles.passIcon}>✕</Text>
        </TouchableOpacity>

        {/* Info / Profile Details */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.infoButton,
            { backgroundColor: actionBtnBg },
          ]}
          onPress={() => {
            const currentPet = pets[currentIndex];
            if (currentPet && onPressPet) {
              onPressPet(currentPet);
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.infoIcon}>ℹ️</Text>
        </TouchableOpacity>

        {/* Like / Playdate (Swipe Right) */}
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => forceSwipe('right')}
          activeOpacity={0.7}
        >
          <Text style={styles.likeIcon}>❤️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  deckWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  cardsContainer: {
    width: SCREEN_WIDTH - 36,
    height: SCREEN_HEIGHT * 0.54,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    justifyContent: 'space-between',
  },
  cardHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
    paddingBottom: 10,
    position: 'relative',
  },
  avatarBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardAvatarEmoji: {
    fontSize: 56,
  },
  requestedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  requestedBadgeText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  petName: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  ageBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ageBadgeText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
  },
  breedText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  playStyleBox: {
    padding: 10,
    borderRadius: 14,
    marginBottom: 8,
  },
  playStyleText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  bioText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  tapHintBtn: {
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tapHintText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Swipe Stamps
  stamp: {
    position: 'absolute',
    top: 24,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 3,
  },
  likeStamp: {
    left: 20,
    borderColor: '#22c55e',
    transform: [{ rotate: '-18deg' }],
  },
  likeStampText: {
    color: '#22c55e',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  nopeStamp: {
    right: 20,
    borderColor: '#ef4444',
    transform: [{ rotate: '18deg' }],
  },
  nopeStampText: {
    color: '#ef4444',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  // Bottom Action Buttons
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  actionButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  undoButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderColor: '#f59e0b',
    borderWidth: 1.5,
  },
  undoIcon: {
    fontSize: 18,
  },
  passButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  passIcon: {
    color: '#ef4444',
    fontSize: 26,
    fontWeight: '900',
  },
  infoButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderColor: '#3b82f6',
    borderWidth: 1.5,
  },
  infoIcon: {
    fontSize: 18,
  },
  likeButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#22c55e',
  },
  likeIcon: {
    fontSize: 30,
  },
  disabledButton: {
    opacity: 0.35,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    minHeight: SCREEN_HEIGHT * 0.45,
  },
  emptyCard: {
    width: '100%',
    padding: 28,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  restartBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  restartBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
