import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  addDoc
} from 'firebase/firestore';
import { VisitorSessionCleanup } from './visitorSessionCleanup';

export interface VisitorSession {
  id: string;
  sessionId: string;
  userId?: string;
  userAgent: string;
  ipAddress?: string;
  currentPage: string;
  timestamp: any;
  lastActivity: any;
  isActive: boolean;
}

export interface VisitorStats {
  totalVisitors: number;
  liveUsers: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
}

class VisitorTracker {
  private sessionId: string;
  private sessionRef: any;
  private heartbeatInterval: any;
  private pageUnloadListener: any;
  private visibilityChangeListener: any;
  private static cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupSession();
    this.setupEventListeners();
    this.startCleanupService();
  }

  private startCleanupService() {
    // Only start cleanup service once (singleton pattern)
    if (!VisitorTracker.cleanupInterval) {
      VisitorTracker.cleanupInterval = VisitorSessionCleanup.startPeriodicCleanup();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async setupSession() {
    try {
      // Create session document
      this.sessionRef = doc(collection(db, 'visitor_sessions'), this.sessionId);
      
      await setDoc(this.sessionRef, {
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        currentPage: window.location.pathname,
        timestamp: serverTimestamp(),
        lastActivity: serverTimestamp(),
        isActive: true,
        startTime: new Date(),
        browser: this.getBrowserInfo(),
        device: this.getDeviceInfo()
      });

      // Start heartbeat to show user is active
      this.startHeartbeat();
      
      // Record visit in analytics collection
      await this.recordVisit();
    } catch (error: any) {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.warn('Visitor session tracking disabled (permission denied)');
      } else {
        console.error('Error setting up visitor session:', error);
      }
    }
  }

  private async recordVisit() {
    try {
      const today = new Date();
      const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      await addDoc(collection(db, 'visitor_analytics'), {
        sessionId: this.sessionId,
        date: dateString,
        timestamp: serverTimestamp(),
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        browser: this.getBrowserInfo(),
        device: this.getDeviceInfo(),
        referrer: document.referrer || 'direct'
      });
    } catch (error: any) {
      // Only log permission errors as warnings, not errors
      if (error.code === 'permission-denied') {
        console.warn('Visitor analytics recording disabled (permission denied)');
      } else {
        console.error('Error recording visit:', error);
      }
    }
  }

  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private getDeviceInfo(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'Tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'Mobile';
    return 'Desktop';
  }

  private startHeartbeat() {
    // Update last activity every 30 seconds
    this.heartbeatInterval = setInterval(async () => {
      if (this.sessionRef && !document.hidden) {
        try {
          await setDoc(this.sessionRef, {
            lastActivity: serverTimestamp(),
            currentPage: window.location.pathname,
            isActive: true
          }, { merge: true });
        } catch (error) {
          // Silently handle permission errors to avoid console spam
          if (error instanceof Error && error.message.includes('permission')) {
            // Stop the heartbeat if we have persistent permission issues
            if (this.heartbeatInterval) {
              clearInterval(this.heartbeatInterval);
              this.heartbeatInterval = null;
            }
          } else {
            console.error('Error updating heartbeat:', error);
          }
        }
      }
    }, 30000);
  }

  private setupEventListeners() {
    // Handle page unload
    this.pageUnloadListener = () => {
      this.endSession();
    };
    window.addEventListener('beforeunload', this.pageUnloadListener);

    // Handle visibility change (tab switching)
    this.visibilityChangeListener = () => {
      if (document.hidden) {
        this.pauseSession();
      } else {
        this.resumeSession();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityChangeListener);

    // Handle page navigation (SPA routing)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.updateCurrentPage();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.updateCurrentPage();
    };

    window.addEventListener('popstate', () => {
      this.updateCurrentPage();
    });
  }

  private async updateCurrentPage() {
    if (this.sessionRef) {
      try {
        await setDoc(this.sessionRef, {
          currentPage: window.location.pathname,
          lastActivity: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error('Error updating current page:', error);
      }
    }
  }

  private async pauseSession() {
    if (this.sessionRef) {
      try {
        await setDoc(this.sessionRef, {
          isActive: false,
          lastActivity: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error('Error pausing session:', error);
      }
    }
  }

  private async resumeSession() {
    if (this.sessionRef) {
      try {
        await setDoc(this.sessionRef, {
          isActive: true,
          lastActivity: serverTimestamp(),
          currentPage: window.location.pathname
        }, { merge: true });
      } catch (error) {
        console.error('Error resuming session:', error);
      }
    }
  }

  private async endSession() {
    try {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }

      if (this.sessionRef) {
        await deleteDoc(this.sessionRef);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  // Public method to get live visitor stats
  public static getLiveVisitorStats(callback: (stats: VisitorStats) => void) {
    const sessionsQuery = query(collection(db, 'visitor_sessions'));
    
    return onSnapshot(sessionsQuery, async (snapshot) => {
      const liveUsers = snapshot.docs.length;
      
      try {
        // Get total visitors from analytics
        const analyticsQuery = query(collection(db, 'visitor_analytics'));
        const analyticsSnapshot = await getDocs(analyticsQuery);
        const totalVisitors = analyticsSnapshot.docs.length;

        // Get today's sessions
        const today = new Date().toISOString().split('T')[0];
        const todayQuery = query(
          collection(db, 'visitor_analytics'),
          where('date', '==', today)
        );
        const todaySnapshot = await getDocs(todayQuery);
        const sessionsToday = todaySnapshot.docs.length;

        // Get this week's sessions
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoString = weekAgo.toISOString().split('T')[0];
        
        const weekQuery = query(
          collection(db, 'visitor_analytics'),
          where('date', '>=', weekAgoString)
        );
        const weekSnapshot = await getDocs(weekQuery);
        const sessionsThisWeek = weekSnapshot.docs.length;

        // Get this month's sessions
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const monthAgoString = monthAgo.toISOString().split('T')[0];
        
        const monthQuery = query(
          collection(db, 'visitor_analytics'),
          where('date', '>=', monthAgoString)
        );
        const monthSnapshot = await getDocs(monthQuery);
        const sessionsThisMonth = monthSnapshot.docs.length;

        callback({
          totalVisitors,
          liveUsers,
          sessionsToday,
          sessionsThisWeek,
          sessionsThisMonth
        });
      } catch (error) {
        console.error('Error fetching visitor stats:', error);
        callback({
          totalVisitors: 0,
          liveUsers,
          sessionsToday: 0,
          sessionsThisWeek: 0,
          sessionsThisMonth: 0
        });
      }
    });
  }

  // Cleanup method
  public destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.pageUnloadListener) {
      window.removeEventListener('beforeunload', this.pageUnloadListener);
    }

    if (this.visibilityChangeListener) {
      document.removeEventListener('visibilitychange', this.visibilityChangeListener);
    }

    // Clear cleanup service when last instance is destroyed
    if (VisitorTracker.cleanupInterval) {
      clearInterval(VisitorTracker.cleanupInterval);
      VisitorTracker.cleanupInterval = null;
    }

    this.endSession();
  }
}

export default VisitorTracker;
