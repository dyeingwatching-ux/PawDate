# 🐾 PawDate — A Playdate Matcher for Lonely Pets

> **CSI2114 Mobile Application Development — Sprint 2 Feature-Complete Application**

PawDate is a React Native mobile application designed to connect lonely pets with compatible playmates in their local area. Built with Expo, MockAPI REST integration, and local AsyncStorage persistence.

---

## 🚀 Key Sprint 2 Features

### 1. 🌐 REST API Integration (MockAPI)
- **Read (`GET /pets`)**: Retrieves pet listings from MockAPI with network timeout handling.
- **Create (`POST /pets`)**: Registers a new pet profile via the Add Pet form.
- **Update (`PUT /pets/:id`)**: Modifies an existing pet's details.
- **Delete (`DELETE /pets/:id`)**: Removes a pet profile with confirmation alert.
- **Dynamic API Configuration**: Configure any custom MockAPI endpoint in Settings or use the pre-configured default.

### 2. 💾 Local Data Persistence (AsyncStorage)
- **Offline Pet Cache (`@pawdate_cached_pets`)**: Automatically caches fetched pets for instant load and offline resilience.
- **Playdate Requests (`@pawdate_playdate_requests`)**: Persistently saves matched/requested playdates.
- **User Settings (`@pawdate_user_settings`)**: Persistently stores Owner Name, Dark Mode preference, and API URL.

### 3. 🛡️ Robust UI & State Handling
- **Loading Indicators**: `ActivityIndicator` on data fetch and submitting forms.
- **Pull-to-Refresh**: Native `RefreshControl` to sync with MockAPI on demand.
- **Error & Offline Banners**: Interactive banner with a **"Retry"** button when network connection fails.
- **Empty States**: Helpful illustrations when search results or lists are empty.
- **Dark Mode**: High-contrast dark theme toggle with AsyncStorage persistence.

---

## 📱 Application Screens

1. **HomeScreen (`screens/HomeScreen.js`)**: Searchable list of pets, offline banner, match counters, pull-to-refresh, "+ Add Pet" action.
2. **DetailScreen (`screens/DetailScreen.js`)**: Pet profile, personality bio, playdate request toggle, Edit (PUT) and Delete (DELETE) actions.
3. **AddEditPetScreen (`screens/AddEditPetScreen.js`)**: Form with emoji avatar selector and input validation for creating and updating pets.
4. **SettingsScreen (`screens/SettingsScreen.js`)**: Owner name profile, Dark Mode toggle, custom MockAPI endpoint setting, one-tap seed data tool, and cache cleaner.

---

## 🛠️ Setup & Running Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Run with Expo
```bash
npx expo start
```
- Press `a` to run on Android emulator or connected device via Expo Go.
- Press `w` to open in Web browser.
- Press `i` to run on iOS simulator.

---

## 📄 Deliverable Documentation
- **[TECHNICAL_SUMMARY.md](file:///c:/Users/ASUS/Downloads/PawDate-main/PawDate-main/TECHNICAL_SUMMARY.md)**: 760+ word technical report covering architecture (LO2), REST API integration (LO3), local storage (LO4), and challenges.
- **[MOCKAPI_SETUP_GUIDE.md](file:///c:/Users/ASUS/Downloads/PawDate-main/PawDate-main/MOCKAPI_SETUP_GUIDE.md)**: Step-by-step instructions for MockAPI schema setup and API testing.
