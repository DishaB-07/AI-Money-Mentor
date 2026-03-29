import { collection, query, orderBy, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function subscribeToHistory(uid: string, callback: (history: any[]) => void) {
  const q = query(
    collection(db, `users/${uid}/history`),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(history);
  }, (error) => {
    console.error("Error subscribing to history:", error);
  });
}
