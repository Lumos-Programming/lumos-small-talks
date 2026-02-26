import { vi } from 'vitest';

// Mock environment variables
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.DISCORD_GUILD_ID = 'test-guild-id';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
