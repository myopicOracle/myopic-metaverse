# Myopic Metaverse: Built on Ethereum & Three.js, Powered by AI

An interactive 3D web application that serves as a proof-of-concept for a metaverse where users can securely manage digital assets, powered by AI and built on Ethereum and Three.js.

## Introduction & Project Vision

As a developer passionate about the intersection of emerging technologies, I embarked on this project to deepen my understanding of the Web3 space. "Myopic Metaverse" is a hands-on exploration of how secure blockchain identity, generative AI, and immersive web experiences can converge. My central idea was to explore what makes a metaverse truly valuable: true digital ownership. To that end, the core feature I implemented was Sign-In With Ethereum (SIWE) authentication. By integrating MetaMask, I was able to create a secure link between a user's real-world identity (their wallet) and their presence in the digital world, setting the stage for future implementation of fungible digital assets.

This project is a "build in public" effort to document my progress, share my learnings, and showcase my skills to potential employers and collaborators.

![The Myopic Metaverse Live Demo](/assets/myopicmetaverse-demo.gif)

### [**Live Demo on Google Cloud Run**](https://the-metaverse-by-myopicoracle-demo-v3-565993571311.us-west1.run.app)


## Key Features & Technologies

*   **Secure Authentication:** Implemented Sign-In With Ethereum (SIWE) using MetaMask, allowing users to authenticate with their blockchain wallet. This provides a decentralized and secure alternative to traditional login systems and establishes a foundation for on-chain interactions.
*   **Interactive AI Characters:** Developed dynamic NPCs using the Google Gemini API. I created a prompt engineering framework that defines distinct roles, personalities, and contextual knowledge for each character, enabling more natural and engaging conversations than static scripts.
*   **3D Environment & Controls:** The 3D environment and characters were adapted from a [Three.js artifact by Anthropic](https://claude.ai/artifacts/inspiration/c33e575f-5228-4058-aa78-a998bad7ec71). The original single-page vanilla JavaScript implementation was refactored into modular TypeScript within a React.js framework, and first-person controls were added using the Pointer Lock API for an immersive user experience.
*   **Modern Frontend Architecture:** To accelerate development, the project uses a build-less frontend that loads React 19 and Three.js directly from a CDN via importmaps, demonstrating a lightweight and rapidly deployable approach.

## Technology Stack

| Category      | Technology/Library                                                              |
|---------------|---------------------------------------------------------------------------------|
| **Frontend**  | React 19                                                                        |
| **3D/Graphics**| Three.js                                                                        |
| **AI**        | Google Gemini API (`@google/genai`)                                             |
| **Auth**      | Sign-In with Ethereum (SIWE) / MetaMask                                         |
| **Deployment**| Build-less architecture with dependencies served from `esm.sh` CDN via importmaps |

## Architectural Overview

The application is built on a modern, build-free frontend stack. This minimalist setup avoids the need for a local bundler (like Webpack or Vite) and a `node_modules` folder, simplifying the development environment.

The core architecture consists of a main `App.tsx` component that functions as a router, conditionally rendering either the `AuthScreen` or the `MetaversePage` based on the user's authentication status.

## Core Concepts in Detail

### Authentication (AuthScreen.tsx & siweApi.ts)

The user initiates login by clicking the "Sign-In with Ethereum" button. This triggers a client-side SIWE implementation:
1.  It checks for the presence of `window.ethereum` to ensure MetaMask (or a similar provider) is available.
2.  It requests the user's wallet address via `eth_requestAccounts`.
3.  A unique, human-readable message is constructed, and the user is prompted to sign it using `personal_sign`. This action does not incur gas fees.

*Note: For this demo, the signature is not verified on a backend. A successful signature is treated as a successful login. In a production environment, the signature would be sent to a server for cryptographic verification.*

### The Metaverse (MetaversePage.tsx)

This component is responsible for the entire 3D experience. It uses a hybrid approach, embedding a large, self-contained vanilla Three.js script within a React component's `useEffect` hook. This pattern allows the imperative, stateful nature of a Three.js animation loop to coexist with React's declarative lifecycle.

### AI-Powered Dialogue System

1.  **Triggering Dialogue:** Pressing 'E' near an NPC opens a dialogue UI panel.
2.  **Prompt Engineering:** When the user selects a dialogue option or submits a custom question, a detailed prompt is constructed and sent to the Gemini API. This prompt is carefully engineered to include role-playing instructions, personality context, domain knowledge, and specific output formatting instructions (JSON).
3.  **API Call & Response Handling:** The request is made using `ai.models.generateContent` with `responseMimeType: "application/json"`. The component parses the JSON from the API's text response, including logic to strip markdown code fences.
4.  **Fallback Mechanism:** A robust, hard-coded fallback system is in place. If the API call fails or returns invalid data, this function provides a sensible, pre-written response based on keywords in the user's query and the specific character's persona.

## Getting Started

**Prerequisites:** Node.js

1.  Clone the repository:
    ```bash
    git clone https://github.com/myopicOracle/myopic-metaverse.git
    cd myopic-metaverse
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set the `GEMINI_API_KEY` in a `.env.local` file. Create the file if it doesn't exist.
    ```
    GEMINI_API_KEY=your_api_key_here
    ```
4.  Run the app:
    ```bash
    npm run dev
    ```

## Future Work

*   **Backend Signature Verification:** Implement a backend service to cryptographically verify the SIWE signature for a truly secure authentication process.
*   **NFT Integration:** Introduce NFTs as in-game assets, allowing users to own and trade items within the metaverse.
*   **Multiplayer Functionality:** Integrate a real-time communication layer (e.g., WebSockets) to enable multiple users to interact in the same environment.
*   **Enhanced AI:** Explore more advanced AI models and techniques for even more dynamic and context-aware NPC interactions.
