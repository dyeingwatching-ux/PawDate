# 🐾 PawDate - MockAPI Setup & Configuration Guide

This guide explains how to set up and configure a **MockAPI** resource for the **PawDate** mobile application (Sprint 2).

---

## 1. Create a Free Account on MockAPI
1. Navigate to [https://mockapi.io/](https://mockapi.io/).
2. Sign up or log in using your GitHub or Google account.

---

## 2. Create a New Project
1. In the MockAPI dashboard, click **"New Project"**.
2. **Project Name**: `PawDate API`
3. **API Prefix**: `api/v1`
4. Click **"Create"**.

---

## 3. Create the `pets` Resource Schema
1. Inside your project, click **"New Resource"**.
2. **Resource Name**: `pets`
3. Define the following schema fields:

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | String / Auto | Unique identifier |
| `name` | String | Pet name (e.g., "Whiskers", "Mochi") |
| `breed` | String | Pet breed/species (e.g., "Persian Cat", "Beagle") |
| `age` | Number | Pet age in years |
| `location` | String | Location / City (e.g., "Colombo 07") |
| `playStyle` | String | Activity preference & energy level |
| `bio` | String | Pet personality description |
| `emoji` | String | Avatar emoji (e.g., "🐕", "🐈", "🐰") |
| `createdAt` | Date / String | Timestamp of creation |

4. Click **"Create"**.

---

## 4. REST API Endpoints Overview
MockAPI will automatically generate the following RESTful endpoints:

- `GET https://<your-project-id>.mockapi.io/api/v1/pets` — Fetch all pets.
- `GET https://<your-project-id>.mockapi.io/api/v1/pets/:id` — Fetch single pet details.
- `POST https://<your-project-id>.mockapi.io/api/v1/pets` — Register a new pet.
- `PUT https://<your-project-id>.mockapi.io/api/v1/pets/:id` — Update pet information.
- `DELETE https://<your-project-id>.mockapi.io/api/v1/pets/:id` — Remove a pet.

---

## 5. Connecting the App to your MockAPI URL
You have two easy ways to use your MockAPI endpoint in the application:

### Option A: Via Settings in the App (Recommended for Demos)
1. Open the PawDate app.
2. Tap the **⚙️ Settings** icon in the top right corner.
3. Paste your MockAPI Base URL under **"Custom MockAPI Base URL"** (e.g., `https://67c336b91851890165aeef6c.mockapi.io/api/v1`).
4. Tap **"💾 Save Configuration"**.
5. Tap **"🚀 Seed MockAPI with Sample Pets (12)"** to automatically populate your API with the 12 sample pets!

### Option B: In Code
In [services/petService.js](file:///c:/Users/ASUS/Downloads/PawDate-main/PawDate-main/services/petService.js), update the default constant:
```javascript
const DEFAULT_API_BASE_URL = 'https://YOUR_MOCKAPI_ID.mockapi.io/api/v1';
```
