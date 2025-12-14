import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  onSnapshot
} from 'firebase/firestore';

export interface ClickEvent {
  buttonName: string;
  page: string;
  date: string;
  timestamp: any;
  userAgent: string;
  device: string;
  sessionId: string;
}

export interface ClickStats {
  todayClicks: number;
  weekClicks: number;
  monthClicks: number;
  totalClicks: number;
}

// Generate or retrieve session ID for the user
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('click_session_id');
  if (!sessionId) {
    sessionId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('click_session_id', sessionId);
  }
  return sessionId;
};

// Get device info
const getDeviceInfo = (): string => {
  const userAgent = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'Tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'Mobile';
  return 'Desktop';
};

// Track a button click
export const trackButtonClick = async (buttonName: string): Promise<void> => {
  try {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    await addDoc(collection(db, 'button_clicks'), {
      buttonName,
      page: window.location.pathname,
      date: dateString,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      device: getDeviceInfo(),
      sessionId: getSessionId()
    });
  } catch (error: any) {
    // Handle permission errors gracefully
    if (error.code === 'permission-denied') {
      console.warn('Click tracking disabled (permission denied)');
    } else {
      console.error('Error tracking click:', error);
    }
  }
};

// Get unique visitors count based on unique session IDs for today/week/month
export const getClickStats = async (): Promise<ClickStats> => {
  try {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Calculate week ago date
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoString = weekAgo.toISOString().split('T')[0];
    
    // Calculate month ago date
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthAgoString = monthAgo.toISOString().split('T')[0];
    
    // Get today's unique visitors (unique session IDs)
    const todayQuery = query(
      collection(db, 'button_clicks'),
      where('date', '==', todayString)
    );
    const todaySnapshot = await getDocs(todayQuery);
    const todaySessions = new Set(todaySnapshot.docs.map(doc => doc.data().sessionId));
    
    // Get week's unique visitors
    const weekQuery = query(
      collection(db, 'button_clicks'),
      where('date', '>=', weekAgoString)
    );
    const weekSnapshot = await getDocs(weekQuery);
    const weekSessions = new Set(weekSnapshot.docs.map(doc => doc.data().sessionId));
    
    // Get month's unique visitors
    const monthQuery = query(
      collection(db, 'button_clicks'),
      where('date', '>=', monthAgoString)
    );
    const monthSnapshot = await getDocs(monthQuery);
    const monthSessions = new Set(monthSnapshot.docs.map(doc => doc.data().sessionId));
    
    // Get total unique visitors
    const allQuery = query(collection(db, 'button_clicks'));
    const allSnapshot = await getDocs(allQuery);
    const allSessions = new Set(allSnapshot.docs.map(doc => doc.data().sessionId));
    
    return {
      todayClicks: todaySessions.size,
      weekClicks: weekSessions.size,
      monthClicks: monthSessions.size,
      totalClicks: allSessions.size
    };
  } catch (error) {
    console.error('Error fetching click stats:', error);
    return {
      todayClicks: 0,
      weekClicks: 0,
      monthClicks: 0,
      totalClicks: 0
    };
  }
};

// Real-time listener for click stats
export const getLiveClickStats = (callback: (stats: ClickStats) => void): (() => void) => {
  const clicksQuery = query(collection(db, 'button_clicks'));
  
  return onSnapshot(clicksQuery, async (snapshot) => {
    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      // Calculate week ago date
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoString = weekAgo.toISOString().split('T')[0];
      
      // Calculate month ago date
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthAgoString = monthAgo.toISOString().split('T')[0];
      
      const allDocs = snapshot.docs;
      
      // Filter and count unique sessions for each time period
      const todaySessions = new Set<string>();
      const weekSessions = new Set<string>();
      const monthSessions = new Set<string>();
      const allSessions = new Set<string>();
      
      allDocs.forEach(doc => {
        const data = doc.data();
        const sessionId = data.sessionId;
        const date = data.date;
        
        allSessions.add(sessionId);
        
        if (date === todayString) {
          todaySessions.add(sessionId);
        }
        
        if (date >= weekAgoString) {
          weekSessions.add(sessionId);
        }
        
        if (date >= monthAgoString) {
          monthSessions.add(sessionId);
        }
      });
      
      callback({
        todayClicks: todaySessions.size,
        weekClicks: weekSessions.size,
        monthClicks: monthSessions.size,
        totalClicks: allSessions.size
      });
    } catch (error) {
      console.error('Error processing click stats:', error);
      callback({
        todayClicks: 0,
        weekClicks: 0,
        monthClicks: 0,
        totalClicks: 0
      });
    }
  });
};
