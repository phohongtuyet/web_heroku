import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

import serviceAccount  from './adminsdk.json';
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
export default db;





