import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export const logActivity = async (action: string, description: string, status: string = "Success") => {
  try {
    const user = auth.currentUser;
    const userEmail = user?.email || "System";
    const userName = user?.displayName || userEmail;
    
    await addDoc(collection(db, "activity_logs"), {
      action,
      description,
      status,
      userName,
      userEmail,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error logging activity: ", error);
  }
};
