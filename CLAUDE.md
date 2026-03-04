# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lumos Small Talks is a Lightning Talk (LT) program management application for weekly Monday 21:00 presentations. The app is built with Next.js 15 and uses:
- **Frontend**: React 19, Next.js App Router, TailwindCSS
- **Backend**: Next.js Server Actions, Firebase Admin SDK
- **Database**: Firestore (weeks collection with embedded talks arrays)
- **Authentication**: NextAuth v5 with Discord OAuth (guild membership verification)
- **Testing**: Vitest with Firebase Emulator

## Commands

### Development
```bash
pnpm install         # Install dependencies
pnpm dev            # Start development server on http://localhost:3000
pnpm build          # Build for production
pnpm start          # Start production server
pnpm lint           # Run ESLint
```

### Testing
```bash
pnpm test           # Run Vitest tests with Firebase emulator
                    # Requires Java for Firebase emulator
```

**Note**: Tests automatically start the Firestore emulator on port 8080 via `firebase emulators:exec`.

### Manual Emulator
```bash
firebase emulators:start  # Start Firebase emulators manually (port 8080)
```

## Architecture

### Data Model
The app uses a **denormalized Firestore structure** where each week document contains an embedded array of talks:

```
weeks/{weekId}
  ├─ weekString: "2026-W09"
  ├─ eventStartTime: "21:00"
  └─ talks: [
       {
         id: uuid,
         title: string,
         description: string (markdown),
         presenterUid: string,
         presenterName: string,
         presenterAvatar: string,
         order: number,
         createdAt: Timestamp
       }
     ]
```

Week IDs follow ISO week format: `YYYY-Www` (e.g., `2026-W09`). The `getWeekId()` utility in `lib/utils.ts` generates this using date-fns.

### Core Data Operations (lib/firebase.ts)

All CRUD operations use **Firestore transactions** to prevent race conditions:

- `getWeekData(weekId)`: Fetches week document, returns empty structure if not exists
- `addTalk(weekId, talkData, userId)`: Appends talk to array, auto-assigns order
- `updateTalk(weekId, talkId, updates, userId)`: Updates specific talk with ownership check
- `deleteTalk(weekId, talkId, userId)`: Removes talk with ownership check

**Important**: All mutations verify `presenterUid === userId` to enforce ownership.

**Firebase Initialization**:
- **Emulator mode**: Uses `FIRESTORE_EMULATOR_HOST` (for tests)
- **Local development**: Uses service account key (`FIREBASE_PRIVATE_KEY` + `FIREBASE_CLIENT_EMAIL`)
- **Cloud Run/GCE**: Uses Application Default Credentials (ADC) automatically when private key is not provided

### Authentication Flow (lib/auth.ts)

NextAuth is configured with Discord provider and custom callbacks:

1. User signs in with Discord OAuth (scopes: `identify` + `guilds`)
2. `signIn` callback fetches user's guild memberships via Discord API
3. Access is granted only if user is member of `DISCORD_GUILD_ID`
4. `session` callback adds user ID to session for ownership checks

Environment variables required:
- `AUTH_SECRET`, `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`
- `DISCORD_GUILD_ID` (optional, bypasses guild check if not set)
- `FIREBASE_PROJECT_ID` (always required)
- `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (only for local development; omit on Cloud Run to use ADC)

### Page Structure

**Public Page (`app/page.tsx`)**:
- Displays all talks for a given week (sorted by `order`)
- No authentication required
- Uses `?week=2026-W09` query param for navigation
- Server-side rendered with `getWeekData()`

**Submit/Manage Page (`app/submit/page.tsx`)**:
- Requires Discord authentication
- Shows only user's own talks for selected week
- Uses Server Actions for add/update/delete operations
- Calls `revalidatePath()` to refresh both `/submit` and `/` after mutations

**Key Pattern**: Both pages use `WeekNavigator` component for week-based navigation.

### Component Architecture

- **LTCard**: Displays individual talk with markdown support (react-markdown + remark-gfm)
  - Shows edit/delete buttons only when `isOwner={true}`
- **SubmitForm**: Handles both create and edit modes
  - Controlled form with title + markdown description
  - Uses `editingTalk` prop to switch between modes
- **ManageTalks**: Container for user's talks list + submit form
  - Manages `editingTalk` state for inline editing
- **WeekNavigator**: Prev/next week navigation using `getRelativeWeekId()`

### UI Components (`components/ui/index.tsx`)

Centralized exports for shadcn-style components:
- Badge, Button, Card (CardHeader, CardTitle, CardContent)
- Input, Textarea
- All use `class-variance-authority` for variants

Use the `cn()` utility from `lib/utils.ts` for className merging.

## Testing Strategy

Tests are in `lib/firebase.test.ts` and use:
- Firebase Rules Unit Testing SDK (`@firebase/rules-unit-testing`)
- Firestore emulator (auto-started by `vitest.config.ts` setup)
- Test isolation: Each test clears emulator data

When writing tests:
1. Initialize test Firestore with `initializeTestEnvironment()`
2. Use `testEnv.authenticatedContext(userId)` for auth simulation
3. Test transaction behavior (concurrent adds, ownership checks)

## Deployment

This app is designed for **Google Cloud Run** deployment:

1. Enable Firestore in Native Mode
2. Create service account with `Cloud Datastore User` role
3. Set environment variables in Cloud Run
4. Build Docker image and deploy

See README.md for detailed gcloud commands.

## Key Conventions

- **Week IDs**: Always use `getWeekId()` or `getRelativeWeekId(offset)` from `lib/utils.ts`
- **Ownership**: All mutations in `lib/firebase.ts` enforce `presenterUid` checks
- **Revalidation**: After any data mutation, call `revalidatePath('/submit')` and `revalidatePath('/')`
- **Markdown**: Talk descriptions support GitHub Flavored Markdown via react-markdown
- **Transactions**: Always use Firestore transactions for array mutations to prevent race conditions