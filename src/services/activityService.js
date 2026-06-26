import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocs, 
  writeBatch,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';

/**
 * Retrieves a specific activity by its code.
 * @param {string} code - Activity code
 * @returns {Promise<object|null>} Activity data or null
 */
export const getActivity = async (code) => {
  try {
    const docRef = doc(db, 'activities', code.toUpperCase());
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error("Error fetching activity: ", error);
    throw error;
  }
};

/**
 * Creates or updates an activity configuration.
 * @param {string} code - Activity code
 * @param {object} data - Activity configuration data
 */
export const saveActivity = async (code, data) => {
  try {
    const docRef = doc(db, 'activities', code.toUpperCase());
    await setDoc(docRef, {
      ...data,
      code: code.toUpperCase(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error("Error saving activity: ", error);
    throw error;
  }
};

/**
 * Deletes an activity and its config.
 * Note: Subcollections results/alerts will remain in Firestore but detached.
 * @param {string} code - Activity code
 */
export const deleteActivity = async (code) => {
  try {
    const docRef = doc(db, 'activities', code.toUpperCase());
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting activity: ", error);
    throw error;
  }
};

/**
 * Lists all active activities.
 * @returns {Promise<Array>} List of activities
 */
export const listActivities = async () => {
  try {
    const colRef = collection(db, 'activities');
    const snap = await getDocs(colRef);
    return snap.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error listing activities: ", error);
    throw error;
  }
};

/**
 * Registers a student entry (Lobby stage) under a specific activity.
 * @param {string} activityCode - Activity code
 * @param {string} name - Student's name
 * @returns {Promise<string>} Document ID of the registration
 */
export const registerStudent = async (activityCode, name) => {
  try {
    const colRef = collection(db, 'activities', activityCode.toUpperCase(), 'results');
    const docRef = await addDoc(colRef, {
      nombre: name,
      puntaje: 0,
      tiempo: '0:00',
      estado: 'registrado', // 'registrado' | 'completado' | 'descalificado' | 'tiempo expirado'
      fecha: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error registering student: ", error);
    throw error;
  }
};

/**
 * Updates a student's result record (completion, disqualification, or timeout).
 * @param {string} activityCode - Activity code
 * @param {string} docId - Student's session document ID
 * @param {object} updates - Fields to update
 */
export const updateStudentResult = async (activityCode, docId, updates) => {
  try {
    const docRef = doc(db, 'activities', activityCode.toUpperCase(), 'results', docId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating student result: ", error);
    throw error;
  }
};

/**
 * Saves a proctor warning alert.
 * @param {string} activityCode - Activity code
 * @param {object} alert - The alert object (studentName, type, message, createdAt)
 */
export const saveCheatingAlert = async (activityCode, alert) => {
  try {
    const colRef = collection(db, 'activities', activityCode.toUpperCase(), 'alerts');
    await addDoc(colRef, {
      ...alert,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving cheating alert: ", error);
    throw error;
  }
};

/**
 * Real-time listener for student results of a specific activity.
 * @param {string} activityCode - Activity code
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export const listenResults = (activityCode, callback) => {
  const colRef = collection(db, 'activities', activityCode.toUpperCase(), 'results');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(results);
  }, (error) => {
    console.error("Error listening to results: ", error);
  });
};

/**
 * Real-time listener for cheating alerts of a specific activity.
 * @param {string} activityCode - Activity code
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export const listenAlerts = (activityCode, callback) => {
  const colRef = collection(db, 'activities', activityCode.toUpperCase(), 'alerts');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(alerts);
  }, (error) => {
    console.error("Error listening to alerts: ", error);
  });
};

/**
 * Real-time listener for a single activity document (to track sessionActive state).
 * @param {string} activityCode - Activity code
 * @param {function} callback - Callback function with activity configuration
 * @returns {function} Unsubscribe function
 */
export const listenActivityConfig = (activityCode, callback) => {
  const docRef = doc(db, 'activities', activityCode.toUpperCase());
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Error listening to activity config: ", error);
  });
};

/**
 * Clears all results, alerts, and pauses the activity.
 * @param {string} activityCode - Activity code
 */
export const clearActivityData = async (activityCode) => {
  try {
    const resultsRef = collection(db, 'activities', activityCode.toUpperCase(), 'results');
    const alertsRef = collection(db, 'activities', activityCode.toUpperCase(), 'alerts');

    const resultsSnap = await getDocs(resultsRef);
    const alertsSnap = await getDocs(alertsRef);

    const batch = writeBatch(db);

    resultsSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    alertsSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Reset sessionActive state to false
    const activityDocRef = doc(db, 'activities', activityCode.toUpperCase());
    batch.update(activityDocRef, { sessionActive: false });

    await batch.commit();
    console.log(`Successfully cleared data for activity: ${activityCode}`);
  } catch (error) {
    console.error("Error clearing activity data: ", error);
    throw error;
  }
};
