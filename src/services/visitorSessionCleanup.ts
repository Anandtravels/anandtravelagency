import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  Timestamp
} from 'firebase/firestore';

// Service to clean up inactive visitor sessions
export class VisitorSessionCleanup {
  private static INACTIVE_THRESHOLD_MINUTES = 5; // Consider session inactive after 5 minutes

  // Clean up sessions that haven't had activity in the last 5 minutes
  public static async cleanupInactiveSessions(): Promise<void> {
    try {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - this.INACTIVE_THRESHOLD_MINUTES);

      const sessionsRef = collection(db, 'visitor_sessions');
      const q = query(
        sessionsRef,
        where('lastActivity', '<', Timestamp.fromDate(fiveMinutesAgo))
      );

      const snapshot = await getDocs(q);
      
      const deletionPromises = snapshot.docs.map(sessionDoc => 
        deleteDoc(doc(db, 'visitor_sessions', sessionDoc.id))
      );

      await Promise.all(deletionPromises);
      
      if (snapshot.docs.length > 0) {
        console.log(`Cleaned up ${snapshot.docs.length} inactive visitor sessions`);
      }
    } catch (error) {
      console.error('Error cleaning up inactive sessions:', error);
    }
  }

  // Start periodic cleanup (runs every 2 minutes)
  public static startPeriodicCleanup(): NodeJS.Timeout {
    return setInterval(() => {
      this.cleanupInactiveSessions();
    }, 2 * 60 * 1000); // 2 minutes
  }
}

export default VisitorSessionCleanup;
