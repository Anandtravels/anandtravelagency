import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

interface SidebarCounts {
  bookings: number;
  packageBookings: number;
  hotelBookings: number;
  messages: number;
  agents: number;
  eservices: number;
  visaApplications: number;
  pendingBookings: number;
  todayBookings: number;
  advanceBookings: number;
  whatsappUnread: number;
}

interface AdminDataSubscription {
  unsubscribe: () => void;
  getCounts: () => SidebarCounts;
}

export class AdminDataService {
  private static instance: AdminDataService;
  private counts: SidebarCounts = {
    bookings: 0,
    packageBookings: 0,
    hotelBookings: 0,
    messages: 0,
    agents: 0,
    eservices: 0,
    visaApplications: 0,
    pendingBookings: 0,
    todayBookings: 0,
    advanceBookings: 0,
    whatsappUnread: 0
  };
  private subscribers: Set<(counts: SidebarCounts) => void> = new Set();
  private unsubscribeFunctions: (() => void)[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AdminDataService {
    if (!AdminDataService.instance) {
      AdminDataService.instance = new AdminDataService();
    }
    return AdminDataService.instance;
  }

  public initialize(user: any): void {
    if (this.isInitialized || !user) {
      return;
    }

    // Check if user is admin
    if (user.email !== 'admin@anandtravels.com') {
      console.warn('User is not admin, skipping admin data initialization');
      return;
    }

    this.setupListeners();
    this.isInitialized = true;
  }

  private setupListeners(): void {
    const today = new Date().toISOString().split('T')[0];

    try {
      // Bookings listener
      const bookingsQuery = query(collection(db, 'bookings'));
      const unsubBookings = onSnapshot(bookingsQuery, 
        (snapshot) => {
          const bookingDocs = snapshot.docs;
          const totalBookings = bookingDocs.length;
          
          const pendingBookings = bookingDocs.filter(doc => {
            const data = doc.data();
            return !data.status || data.status === 'pending';
          }).length;

          const todayBookings = bookingDocs.filter(doc => {
            const data = doc.data();
            const createdAt = data.created_at?.toDate();
            if (!createdAt) return false;
            const bookingDate = createdAt.toISOString().split('T')[0];
            return bookingDate === today;
          }).length;

          const advanceBookings = bookingDocs.filter(doc => {
            const data = doc.data();
            return data.advance_booking === true;
          }).length;

          this.updateCounts({ 
            bookings: totalBookings,
            pendingBookings,
            todayBookings,
            advanceBookings
          });
        },
        (error) => {
          console.error('Error fetching bookings:', error);
          this.handleFirestoreError('bookings', error);
        }
      );
      this.unsubscribeFunctions.push(unsubBookings);

      // Package bookings listener
      const packageBookingsQuery = query(collection(db, 'package_bookings'));
      const unsubPackageBookings = onSnapshot(packageBookingsQuery, 
        (snapshot) => {
          this.updateCounts({ packageBookings: snapshot.docs.length });
        },
        (error) => {
          console.error('Error fetching package bookings:', error);
          this.handleFirestoreError('package_bookings', error);
        }
      );
      this.unsubscribeFunctions.push(unsubPackageBookings);

      // Hotel bookings listener
      const hotelBookingsQuery = query(collection(db, 'hotel_bookings'));
      const unsubHotelBookings = onSnapshot(hotelBookingsQuery, 
        (snapshot) => {
          this.updateCounts({ hotelBookings: snapshot.docs.length });
        },
        (error) => {
          console.error('Error fetching hotel bookings:', error);
          this.handleFirestoreError('hotel_bookings', error);
        }
      );
      this.unsubscribeFunctions.push(unsubHotelBookings);

      // Messages listener
      const messagesQuery = query(collection(db, 'contact_messages'));
      const unsubMessages = onSnapshot(messagesQuery, 
        (snapshot) => {
          this.updateCounts({ messages: snapshot.docs.length });
        },
        (error) => {
          console.error('Error fetching messages:', error);
          this.handleFirestoreError('contact_messages', error);
        }
      );
      this.unsubscribeFunctions.push(unsubMessages);

      // E-Services listener
      const eservicesQuery = query(collection(db, 'eservice_requests'));
      const unsubEservices = onSnapshot(eservicesQuery, 
        (snapshot) => {
          this.updateCounts({ eservices: snapshot.docs.length });
        },
        (error) => {
          console.error('Error fetching e-service requests:', error);
          this.handleFirestoreError('eservice_requests', error);
        }
      );
      this.unsubscribeFunctions.push(unsubEservices);

      // Visa Applications listener
      const visaApplicationsQuery = query(collection(db, 'visa-services'));
      const unsubVisaApplications = onSnapshot(visaApplicationsQuery, 
        (snapshot) => {
          this.updateCounts({ visaApplications: snapshot.docs.length });
        },
        (error) => {
          console.error('Error fetching visa applications:', error);
          this.handleFirestoreError('visa-services', error);
        }
      );
      this.unsubscribeFunctions.push(unsubVisaApplications);

      // Agents listener
      const agentsQuery = query(collection(db, 'agents'));
      const unsubAgents = onSnapshot(agentsQuery, 
        (snapshot) => {
          this.updateCounts({ agents: snapshot.docs.length });
        },
        (error) => {
          console.error('Error fetching agents:', error);
          this.handleFirestoreError('agents', error);
        }
      );
      this.unsubscribeFunctions.push(unsubAgents);

      // WhatsApp conversations unread listener
      const whatsappConvosQuery = query(collection(db, 'whatsapp_conversations'));
      const unsubWhatsApp = onSnapshot(whatsappConvosQuery,
        (snapshot) => {
          let totalUnread = 0;
          snapshot.docs.forEach(doc => {
            totalUnread += doc.data().unreadCount || 0;
          });
          this.updateCounts({ whatsappUnread: totalUnread });
        },
        (error) => {
          console.error('Error fetching whatsapp conversations:', error);
          this.handleFirestoreError('whatsapp_conversations', error);
        }
      );
      this.unsubscribeFunctions.push(unsubWhatsApp);

    } catch (error) {
      console.error('Error setting up admin data listeners:', error);
    }
  }

  private handleFirestoreError(collection: string, error: any): void {
    console.error(`Firestore error for ${collection}:`, error);
    
    // Check if it's a permission error
    if (error.code === 'permission-denied') {
      console.warn(`Permission denied for ${collection}. User may not be properly authenticated as admin.`);
    }
    
    // You could emit an error event here if needed
  }

  private updateCounts(partialCounts: Partial<SidebarCounts>): void {
    this.counts = { ...this.counts, ...partialCounts };
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.counts));
  }

  public subscribe(callback: (counts: SidebarCounts) => void): () => void {
    this.subscribers.add(callback);
    
    // Immediately call with current counts
    callback(this.counts);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public getCounts(): SidebarCounts {
    return { ...this.counts };
  }

  public destroy(): void {
    this.unsubscribeFunctions.forEach(unsub => unsub());
    this.unsubscribeFunctions = [];
    this.subscribers.clear();
    this.isInitialized = false;
  }

  public reset(): void {
    this.destroy();
    this.counts = {
      bookings: 0,
      packageBookings: 0,
      hotelBookings: 0,
      messages: 0,
      agents: 0,
      eservices: 0,
      visaApplications: 0,
      pendingBookings: 0,
      todayBookings: 0,
      advanceBookings: 0,
      whatsappUnread: 0
    };
  }
}

export const adminDataService = AdminDataService.getInstance();
