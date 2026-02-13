# TalentAI Pro

TalentAI Pro is a next-generation recruitment platform featuring AI Avatar interviews. This project is built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## Project Structure

- **`/app`**: Contains the App Router pages and layouts.
  - `(auth)`: Authentication routes (Login, Register).
  - `(dashboard)`: Company dashboard for managing positions and candidates.
  - `(candidate)`: Candidate portal for job applications and interview simulation.
  - `global.css`: Global styles and Tailwind directives.
  - `layout.tsx`: Root layout with providers.

- **`/components`**: Reusable UI components.
  - `ui/`: Core design system components (Button, Card, Input, Tabs, etc.) built with shadcn/ui.
  - `features/`: Specialized feature components like `AvatarInterviewer`.

- **`/lib`**: Utilities and state management.
  - `store/`: Zustand stores for global state (e.g., `auth-store.ts`).
  - `utils.ts`: Helper functions (class merging).

## Key Features Implemented

1.  **AI Avatar Interviewer** (`components/features/avatar-interviewer.tsx`):
    -   Simulates a video interview with an AI agent.
    -   Includes listening states, timers, and simulated voice interaction.
    -   Uses a 3D avatar placeholder from DiceBear.

2.  **Candidate Portal** (`app/(candidate)/candidate/page.tsx`):
    -   Dashboard view with application status.
    -   Full interactive interview flow.
    -   Progress tracking and instruction steps.

3.  **Design System**:
    -   Custom Tailwind configuration with a professional color palette (Blue/Green/Purple).
    -   Dark mode compatible (configured in `globals.css`).

## Getting Started

1.  **Install Dependencies**:
    Since this project was initialized manually, run:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Development Notes

-   **State Management**: We use `zustand` for managing authentication and application state.
-   **Mock Data**: The application currently uses inline mock data and `faker-js` (referenced in package.json) for demonstration purposes.
-   **Icons**: We use `lucide-react` for all iconography.
