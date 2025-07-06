## Brain Metaverse - Technical Documentation

### 1. Project Overview

The Brain Metaverse is an interactive 3D web application simulating the Brainbot Inc. office. It serves as a proof-of-concept demonstrating a blend of modern web technologies, including Web3 authentication, real-time 3D graphics, and generative AI for character interaction. Users sign in with their Ethereum wallet and can then navigate the virtual space, exploring the environment and engaging in dynamic conversations with AI-powered non-player characters (NPCs) representing key company stakeholders.

### 2. Technology Stack & Architecture

The application is built on a modern, build-free frontend stack.

*   **Frontend Library:** **React 19** is used for structuring the UI into components.
*   **3D Graphics:** **Three.js** is used for creating and rendering the entire 3D scene, including the environment, characters, and animations.
*   **Generative AI:** The **Google Gemini API** (`@google/genai`) powers the conversational AI of the NPCs.
*   **Authentication:** **Sign-In with Ethereum (SIWE)** is implemented for secure, wallet-based authentication via MetaMask.
*   **Dependencies:** All major dependencies (`react`, `three`, `@google/genai`) are loaded directly in the browser via an **`importmap`** from the `esm.sh` CDN. This minimalist setup avoids the need for a local bundler (like Webpack or Vite) and a `node_modules` folder, simplifying the development environment.

The core architecture consists of a main `App.tsx` component that functions as a router, conditionally rendering either the `AuthScreen` or the `MetaversePage` based on the user's authentication status.

### 3. Core Components & Logic

#### 3.1. Authentication (`AuthScreen.tsx` & `siweApi.ts`)

*   **Flow:** The user initiates login by clicking the "Sign-In with Ethereum" button. This triggers the `siweApi`.
*   **`siweApi.ts`:** This is a simplified, client-side SIWE implementation.
    1.  It checks for the presence of `window.ethereum` to ensure MetaMask (or a similar provider) is available.
    2.  It requests the user's wallet address via `eth_requestAccounts`.
    3.  A unique, human-readable message is constructed, and the user is prompted to sign it using `personal_sign`. This action does not incur gas fees.
    4.  **Note:** For this demo, the signature is **not** verified on a backend. A successful signature is treated as a successful login. In a production environment, the signature would be sent to a server for cryptographic verification.

#### 3.2. The Metaverse (`MetaversePage.tsx`)

This is the most complex component, responsible for the entire 3D experience. It uses a hybrid approach, embedding a large, self-contained vanilla Three.js script within a React component's `useEffect` hook. This pattern allows the imperative, stateful nature of a Three.js animation loop to coexist with React's declarative lifecycle.

*   **3D Scene Construction:**
    *   The environment (floor, walls, office furniture, props) is generated procedurally using Three.js primitives (`BoxGeometry`, `PlaneGeometry`, `CylinderGeometry`) and standard materials.
    *   Lighting is a combination of `AmbientLight` for base illumination and `DirectionalLight` to cast realistic shadows.
    *   Characters are also procedurally generated `THREE.Group` objects, with their properties (name, role, personality) stored in the `userData` object.

*   **Player Controls & Interaction:**
    *   Movement is handled via keyboard events (WASD), which update a player velocity vector.
    *   Camera orientation is controlled by mouse movement (using the Pointer Lock API for a first-person experience) or arrow keys.
    *   An `animate` loop checks for proximity between the player and NPCs. If the player is close enough, an interaction prompt appears.

*   **AI-Powered Dialogue System:**
    *   **Triggering Dialogue:** Pressing 'E' near an NPC opens a dialogue UI panel.
    *   **Prompt Engineering:** When the user selects a dialogue option or submits a custom question, a detailed prompt is constructed and sent to the Gemini API. This prompt is carefully engineered to include:
        *   **Role-playing instructions:** `You are roleplaying as [Character Name], [Role]...`
        *   **Personality context:** Traits like "visionary and charismatic" are included.
        *   **Domain knowledge:** Key concepts of the "Brain Metaverse" project are provided as context.
        *   **Output Formatting:** The prompt explicitly requests a response in a specific JSON format (`{"response": "..."}`).
    *   **API Call:** The request is made using `ai.models.generateContent` with `responseMimeType: "application/json"`.
    *   **Response Handling:** The component parses the JSON from the API's text response. It includes logic to strip markdown code fences (` ```json ... ``` `) that the model might add.
    *   **Fallback Mechanism:** A robust, hard-coded fallback system (`generateFallbackResponse`) is in place. If the API call fails or returns invalid data, this function provides a sensible, pre-written response based on keywords in the user's query and the specific character's persona. This ensures a graceful user experience even during API outages.