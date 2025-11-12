# tr3s

**tr3s** is a real-time web application created as a Final Degree Project (TFG) for the "*Ciclo de Desarrollo de Aplicaciones Multiplataforma*", in Spain, Madrid.

![tr3s online preview](./frontend/src/assets/preview.png)

The project explores forms of digital communication beyond traditional messaging, focusing on shared presence. Inspired by platforms like [here.fm](https://here.fm/), **tr3s** offers interactive "*spaces*" where users can chat, share images, and co-exist digitally by seeing other users' cursors and activity in real-time.

The interface adopts a **NeoBrutalist** aesthetic, featuring a **responsive** design and an automatic **dark mode** based on system preferences.

## Key Features
- **Real-Time Spaces:** Create and manage interactive & real-time rooms.

- **Shared Presence**:

  - **Live Cursors:** View the mouse pointers of all users in the *space*, smoothed with Framer Motion.

  - **Typing Indicator:** Shows who is currently typing in the chat.

- **Chat:** An instant messaging system for each space.

- **Secure Authentication:** Complete user management (signup, login, profiles) powered by **Clerk**, including Google OAuth.

- **NeoBrutalist Design:** A distinctive interface built with Tailwind CSS and customized shadcn/ui components.

- **Dark Mode:** Automatic theme detection with a manual toggle.

## Tech Stack & Architecture
The project is structured as a monorepo (frontend and convex).

- **Runtime:** Bun (runtime, package manager, and bundler).
- **Frontend (SPA):**
  - **Framework:** React 19
  - **Bundler:** Vite
  - **Routing:** Tanstack Router
  - **Styling:** Tailwind CSS
  - **UI Components:** shadcn/ui
  - **Animation:** Framer Motion
- **Backend (BaaS):**
  - **Backend & Database:** Convex. Acts as the serverless backend and real-time SQL database. It provides real-time reactivity via WebSockets. ``Queries``, ``Mutations``, and ``Actions`` are all written in TypeScript.
  - **HTTP Endpoints:** Hono. Runs on Convex to handle incoming webhooks (e.g., user synchronization from Clerk).
- **Authentication:**
  - **User Management:** Clerk (frontend and backend).
- **Validation:**
  - **Zod:** Used for schema and data validation, in each communication of the front-end & back-end.

### Core Architecture Flow

1. **Client (React):** The frontend subscribes to Convex queries.
2. **Communication (WebSocket):** Convex uses WebSockets to push real-time updates to the client whenever data changes, eliminating the need for polling.
3. **Backend (Convex):** Manages all business logic, database state (underlying MySQL/PostgreSQL), and ACID transactions.
4. **Authentication (Clerk):** Clerk handles client-side sessions. When a user signs up or updates, Clerk sends a webhook to an HTTP endpoint.
5. **Webhooks (Hono):** A Hono server, running on Convex, receives this webhook, validates it (using svix and zod), and invokes a Convex action or mutation to synchronize the tr3s database with Clerk.

## Showcase

![Showcase 5](./frontend/src/assets/showcase5.png)

<details>
  <summary>See all</summary>

  ![Showcase 2](./frontend/src/assets/showcase2.png)

  ![Showcase 1](./frontend/src/assets/showcase1.png)

  ![Showcase 3](./frontend/src/assets/showcase3.png)

  ![Showcase 4](./frontend/src/assets/showcase4.png)

</details>



## Running Locally

### Prerequisites
- Install [Bun](https://bun.com/)
- You must create a project on [Convex](https://www.convex.dev/)
- You must create an application on [Clerk](https://clerk.com/)

### Installation

1. Clone the repository

2. Install all the dependencias (root and frontend):
    ```bash
    bun install
    ```
3. Envionment Variables:

    You will need to configure your API keys from Convex and Clerk.
    ```txt
    VITE_CONVEX_URL=
    CONVEX_URL=
    VITE_CLERK_PUBLISHABLE_KEY=
    CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=
    ```

4. Development

    You will need two terminals running simultaneously.
    1. **Terminal 1 (Convex Backend):** Starts the Convex development server. This will watch your /convex folder and sync your schema and functions.
        ```bash
        bun run dev:server
        ```
    2. **Terminal 2 (Vite Frontend):** Starts the Vite development server for the React SPA.
        ```bash
        bun run dev:frontend
        ```
<br>

The application will be available at [http://localhost:5173](http://localhost:5173) (or the port specified by Vite).
