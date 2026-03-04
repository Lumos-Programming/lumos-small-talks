import * as admin from 'firebase-admin';

// Initialize Firebase lazily
function initializeFirebase() {
  if (!admin.apps.length) {
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      // Emulator mode (for tests)
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'test-project',
      });
    } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Local development with service account key
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Cloud Run or GCE: Use Application Default Credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
  }
}

// Lazy getter for db
function getDb() {
  initializeFirebase();
  return admin.firestore();
}

export type Talk = {
  id: string;
  title: string;
  description: string;
  presenterUid: string;
  presenterName: string;
  presenterAvatar: string;
  order: number;
  createdAt: admin.firestore.Timestamp;
};

export type WeekData = {
  weekString: string;
  eventStartTime: string;
  talks: Talk[];
};

export async function getWeekData(weekId: string): Promise<WeekData> {
  const doc = await getDb().collection('weeks').doc(weekId).get();
  if (!doc.exists) {
    return {
      weekString: weekId,
      eventStartTime: '21:00',
      talks: [],
    };
  }
  return doc.data() as WeekData;
}

export async function addTalk(
  weekId: string,
  talkData: Omit<Talk, 'id' | 'createdAt' | 'order' | 'presenterUid'>,
  userId: string
): Promise<void> {
  const db = getDb();
  const weekRef = db.collection('weeks').doc(weekId);

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(weekRef);
    let talks: Talk[] = [];
    if (doc.exists) {
      talks = (doc.data() as WeekData).talks || [];
    }

    // Check if user already has a talk registered for this week
    const existingTalk = talks.find(t => t.presenterUid === userId);
    if (existingTalk) {
      throw new Error('週に1件まで発表を登録できます');
    }

    const newTalk: Talk = {
      ...talkData,
      id: crypto.randomUUID(),
      presenterUid: userId, // Ensure ID matches session
      order: talks.length + 1,
      createdAt: admin.firestore.Timestamp.now(),
    };

    talks.push(newTalk);

    transaction.set(weekRef, {
      weekString: weekId,
      eventStartTime: '21:00',
      talks: talks,
    }, { merge: true });
  });
}

export async function updateTalk(
  weekId: string,
  talkId: string,
  updates: Partial<Pick<Talk, 'title' | 'description'>>,
  userId: string
): Promise<void> {
  const db = getDb();
  const weekRef = db.collection('weeks').doc(weekId);

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(weekRef);
    if (!doc.exists) throw new Error('Week not found');

    const data = doc.data() as WeekData;
    const talks = data.talks.map((t) => {
      if (t.id === talkId) {
        if (t.presenterUid !== userId) throw new Error('Unauthorized');
        return { ...t, ...updates };
      }
      return t;
    });

    transaction.update(weekRef, { talks });
  });
}

export async function deleteTalk(
  weekId: string,
  talkId: string,
  userId: string
): Promise<void> {
  const db = getDb();
  const weekRef = db.collection('weeks').doc(weekId);

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(weekRef);
    if (!doc.exists) return;

    const data = doc.data() as WeekData;
    const talkToDelete = data.talks.find(t => t.id === talkId);
    if (!talkToDelete) return;
    if (talkToDelete.presenterUid !== userId) throw new Error('Unauthorized');

    const talks = data.talks.filter((t) => t.id !== talkId);
    transaction.update(weekRef, { talks });
  });
}
