# Aangan: The Courtyard (V2)

A meditative idle game where you restore life to a forgotten courtyard. No numbers, just vibes.

## Features (V2)
-   **Realistic Visuals**: High-quality digital art assets for a deeply immersive experience.
-   **Evolving Audio**: A generative ambient soundscape that grows richer as the garden comes to life.
-   **Educational**: Click on objects like the Tulsi plant or Rangoli to learn about their cultural significance.
-   **Dynamic Progression**: Water the earth to see it transform from dry cracked soil to a lush sanctuary.

## How to Play
1.  **Interact**: Click/Tap anywhere to water the earth.
2.  **Listen**: Use headphones for the best experience. The soundscape evolves.
3.  **Learn**: Click on the Tulsi, Rangoli, or Peacock to read about them.

## Tech Stack
-   **Frontend**: Vanilla HTML5 Canvas & Web Audio API. 
-   **Assets**: AI-generated imagery (DALL-E 3) for the courtyard elements.
-   **Container**: Built on `cgr.dev/chainguard/nginx:latest` for a secure, minimal footprint.

## Running the Game

### Using Docker (Recommended)
1.  **Build the image**:
    ```bash
    docker build -t aangan .
    ```

2.  **Run the container**:
    ```bash
    docker run -p 8080:8080 aangan
    ```

3.  Open `http://localhost:8080`.

### Local Development
Simply open `index.html` in your browser. Note: Audio requires user interaction (click) to start due to browser policies.
