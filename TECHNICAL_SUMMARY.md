# PawDate — Sprint 2 Technical Summary

**Course**: CSI2114 Mobile Application Development  
**Assessment**: Component 2 — Sprint 2 Feature-Complete App  
**Weight**: 20% | **Learning Outcomes**: LO2, LO3, LO4  
**Application Title**: PawDate — Playdate Matcher for Pets  

---

## 1. Application Architecture & Component Hierarchy

PawDate is built using **React Native** and **Expo**, employing a layered, modular software architecture designed for maintainability, separation of concerns, and offline resilience. The system architecture is organized into three distinct tiers:

1. **Presentation Layer (Screens & Components)**:
   - `App.js`: Root component encapsulating the `NavigationContainer`, React Navigation Native Stack (`@react-navigation/native-stack`), and global theme provider.
   - `HomeScreen`: Displays the searchable pet catalog, real-time match counters, pull-to-refresh mechanism, and quick navigation headers.
   - `DetailScreen`: Presents in-depth pet profile attributes, personality bios, playdate request toggles, and triggers for profile editing or deletion.
   - `AddEditPetScreen`: A reusable form interface providing input validation for registering new pets (`POST`) and updating existing records (`PUT`).
   - `SettingsScreen`: Controls user profile information, appearance settings (Dark Mode), custom MockAPI endpoint overrides, and cache management tools.
   - **Reusable UI Components**: `PetCard`, `DetailRow`, `LoadingView`, and `ErrorBanner` decouple visual presentation from screen logic.

2. **Service & Data Access Layer**:
   - `petService.js`: Encapsulates all asynchronous RESTful HTTP interactions with MockAPI, request timeouts, error catching, and offline cache synchronization.
   - `storageService.js`: An abstraction layer over `@react-native-async-storage/async-storage` handling local data persistence, cache retrieval, and preference storage.

3. **Remote & Local Storage Layer**:
   - Remote: **MockAPI** cloud REST backend (`/pets` endpoint).
   - Local: Device-level persistent key-value storage using **AsyncStorage**.

---

## 2. REST API Integration & CRUD Operations

PawDate establishes end-to-end integration with **MockAPI** (`https://mockapi.io/`), supporting full CRUD capabilities with standard HTTP semantics:

- **Read (`GET /pets` & `GET /pets/:id`)**: Fetches all pet listings or individual records. Upon successful network retrieval, data is normalized and automatically mirrored to the local cache.
- **Create (`POST /pets`)**: Triggered from `AddEditPetScreen`. Validates form parameters (name, breed, age, location, playStyle, bio, emoji) before transmitting JSON payloads to the API.
- **Update (`PUT /pets/:id`)**: Modifies existing pet entries on MockAPI and immediately synchronizes local application state.
- **Delete (`DELETE /pets/:id`)**: Triggered with confirmation dialogs on `DetailScreen`, removing records from MockAPI and the local cache.

### Network Error & Timeout Handling
To protect user experience on unstable mobile connections, network calls are governed by an `AbortController` timeout (10 seconds). In the event of network disruption, `petService` catches errors gracefully and activates the offline fallback mechanism.

---

## 3. Local Data Persistence Strategy (AsyncStorage)

Local persistence is implemented via `@react-native-async-storage/async-storage` across three critical entities:

1. **Pet Catalog Offline Caching (`@pawdate_cached_pets`)**: Every successful API fetch updates local storage. When the device is offline or the server is temporarily unreachable, PawDate seamlessly loads the cached pet catalog, displaying an offline banner rather than failing with an empty screen.
2. **Playdate Requests & Matches (`@pawdate_playdate_requests`)**: User interactions (such as sending a playdate invite or favoriting a pet) are persisted locally. When a user marks a pet as matched, the selection survives app restarts and updates badge indicators throughout the app.
3. **User Preferences & API Configuration (`@pawdate_user_settings`)**: Stores the user's name, active theme preference (Dark Mode vs Light Mode), and custom MockAPI URL overrides.

---

## 4. State Management, UI States & Edge Cases

The application strictly adheres to React Native best practices by utilizing core React hooks (`useState`, `useEffect`, `useCallback`):

- **Loading States**: `LoadingView` renders an `ActivityIndicator` during initial data retrieval, while action buttons show inline spinners during `POST`, `PUT`, and `DELETE` requests.
- **Pull-to-Refresh**: Integrated using React Native's `RefreshControl` on `HomeScreen`, allowing users to synchronize data on demand.
- **Empty States**: Customized empty states provide clear emoji illustrations and guidance when search queries yield zero results or when the database has no entries.
- **Error States**: `ErrorBanner` displays contextual warning alerts and provides an interactive **"Retry"** button to re-attempt server connection without restarting the app.

---

## 5. Challenges Encountered & Technical Decisions

1. **Offline-First Synchronization**:
   *Challenge*: Providing instant app load times while preventing stale data from overwriting live MockAPI updates.  
   *Decision*: Adopted a cache-then-network pattern where cached data renders immediately on startup, while fresh data from MockAPI is fetched in the background and seamlessly updates the UI.
2. **Seamless Endpoint Configuration**:
   *Challenge*: Ensuring evaluators can test the app using either their own MockAPI resource or the pre-configured base URL.  
   *Decision*: Designed a dynamic endpoint configuration in `SettingsScreen` coupled with a one-tap **"Seed MockAPI"** button to automatically populate test pets via REST `POST` calls.
3. **Theme Consistency**:
   *Challenge*: Ensuring theme consistency across deeply nested navigation stacks and dynamic modals.  
   *Decision*: Lifted dark mode state to `App.js` with direct persistence in AsyncStorage, providing seamless switching across all screens and components.
