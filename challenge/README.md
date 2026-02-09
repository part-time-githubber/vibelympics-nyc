# Aangan (आँगन): The Courtyard

A meditative idle game where you restore life to a forgotten courtyard. No numbers, just vibes.

## Features
-   **Realistic Visuals**: High-quality digital art assets for a deeply immersive experience.
-   **Evolving Audio**: A generative ambient soundscape that grows richer as the garden comes to life.
-   **Educational**: Click on objects like the Tulsi plant or Rangoli to learn about their cultural significance.
-   **Dynamic Progression**: Water the earth to see it transform from dry cracked soil to a lush sanctuary.
-   **Hidden Secrets**: Discover the hidden interactions with the Peacock, Rangoli, and the Mango Tree.

## Visual Journey
Aangan is about transformation.

| **The Beginning (Dry Earth)** | **The Destination (Lush Sanctuary)** |
| :---: | :---: |
| ![Begin State](begin_state.png) | ![End State](end_state.png) |

## Game Stages & Progression
Aangan unfolds based on your clicks.

-   **Stage 0 (0-5 clicks)**: The Courtyard is dry and barren.
-   **Stage 1 (5+ clicks)**: **Life Returns**. The background begins to turn lush green. The **Tulsi Pot** appears. Audio: Base drone + Fifth.
-   **Stage 2 (25+ clicks)**: **The Spirit Awakens**. Random events like the "Grandmother's Blessing" begin to occur (0.5% chance per click).
-   **Stage 3 (75+ clicks)**: **Prosperity**. The great **Mango Tree** grows in the background. The **Peacock** arrives. Rain (Monsoon) becomes possible (0.2% chance per click). Audio: High shimmering note added.
-   **Stage 4 (200+ clicks)**: **Celebration**. The **Rangoli** pattern appears on the floor. **The Mantra** quest becomes available.
-   **Stage 5 (400+ clicks)**: **Abundance**. Visuals are fully lush.
-   **Stage 6 (1000+ clicks)**: **Nirvana**. The cycle is complete.

## Secrets & Mechanics
The courtyard holds secrets for those who explore.

### 1. The Peacock's Dance (Hidden Auto-Clicker)
*   **Availability**: Stage 3+
*   **How to trigger**: Click the Peacock **5 times** rapidly while it walks.
*   **Mechanic**:
    *   If you stop clicking for **5 seconds**, the count resets and the peacock resumes walking.
    *   The peacock moves at a relaxed pace (1.125 speed).
*   **Effect**: The peacock dances (particle burst) and grants an **Auto-Clicker** (10 clicks/sec) for **5 seconds**.
*   **Visual**: Colorful feather particles (Blue, Green, Gold).

### 2. Rangoli Harmony (Festival Mode)
*   **Availability**: Stage 4+
*   **How to trigger**: Click the **exact center** of the Rangoli pattern (small hitbox).
*   **Effect**: "Festival of Lights" - A burst of Diya lights (gold particles) and a bonus of **100 clicks** (20 diyas x 5 clicks).
*   **Visual**: Rising orange fire particles.

### 3. The Mantra (Narrative Ending)
*   **Availability**: Stage 4+
*   **How to trigger**: Click the **Tulsi Pot** or the **Mango Tree**.
*   **Mechanic**:
    1.  **Gated**: You must be at least Stage 4.
    2.  **Cooldown**: You must wait **5 seconds** between revealing each word.
    3.  **Meditation**: You must click **5 times** on the object to reveal a single word.
    4.  **Sequence**: Collect all 6 words: *Peace, Life, Breath, Light, Void, Nirvana*.
*   **Ending**: Upon collecting the final word, the **Nirvana** ending is triggered. The screen fades to white, audio fades out, and a final message appears.

## Tech Stack
-   **Frontend**: Vanilla HTML5 Canvas & Web Audio API.
-   **Assets**: AI-generated imagery (DALL-E 3).
-   **Container**: Built on `cgr.dev/chainguard/nginx:latest` for a secure, minimal footprint.

## Running the Game

### Local Development
Simply open `index.html` in your browser.
*Note: Audio requires user interaction (click) to start due to browser autoplay policies.*

### Using Docker
1.  **Build the image**:
    ```bash
    docker build -t aangan .
    ```
2.  **Run the container**:
    ```bash
    docker run -p 8080:8080 aangan
    ```
3.  Open `http://localhost:8080`.

## Final message (not using vibe code)

(Gen) AI has been such a wonderful assistant for most of us in 2025.

May 2026 be the proliferation of good sensible uses of what otherwise could be a very dangerous race 🌎💕👍

We all have collective responsibility of keeping this world a happy place for our future generations 🌟🌈

#GenAI #MyTakeOnGenAI (https://www.linkedin.com/in/pankaj-tolani/recent-activity/all/)
