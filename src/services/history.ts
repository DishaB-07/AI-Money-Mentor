import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface HistoryData {
  type: 'score' | 'fire' | 'tax' | 'couple' | 'xray' | 'chat';
  data: any;
  insight?: string;
  title?: string;
}

export async function saveHistory(historyData: HistoryData) {
  if (!auth.currentUser) return null;

  try {
    const docRef = await addDoc(collection(db, 'history'), {
      ...historyData,
      userId: auth.currentUser.uid,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving history:", error);
    return null;
  }
}

export async function getRecentHistory(type?: string, maxItems: number = 5) {
  if (!auth.currentUser) return [];

  try {
    let q = query(
      collection(db, 'history'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(maxItems)
    );

    if (type) {
      q = query(
        collection(db, 'history'),
        where('userId', '==', auth.currentUser.uid),
        where('type', '==', type),
        orderBy('timestamp', 'desc'),
        limit(maxItems)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching recent history:", error);
    return [];
  }
}
