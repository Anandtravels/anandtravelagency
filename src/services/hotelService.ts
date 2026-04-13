import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  onSnapshot,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sendPushNotification } from '../utils/sendPushNotification';
import { 
  Hotel, 
  RoomType, 
  HotelBooking, 
  HotelAgent, 
  RoomAvailability, 
  HotelFormData, 
  RoomTypeFormData,
  HotelSearchFilters 
} from '../types/hotel';

export class HotelService {
  // Hotel Management
  static async createHotel(hotelData: HotelFormData, createdBy: string): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'hotels'), {
        ...hotelData,
        rating: 0,
        reviews: 0,
        priceRange: { min: 0, max: 0 },
        created_at: serverTimestamp(),
        created_by: createdBy,
        coordinates: null
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating hotel:', error);
      throw error;
    }
  }

  static async bulkCreateHotels(hotelsData: HotelFormData[], createdBy: string): Promise<{ successCount: number; failCount: number; errors: string[] }> {
    const batch = writeBatch(db);
    const errors: string[] = [];
    let successCount = 0;
    let failCount = 0;

    try {
      // Firestore batch has a limit of 500 operations
      const batchSize = 500;
      const batches = [];
      
      for (let i = 0; i < hotelsData.length; i += batchSize) {
        const currentBatch = writeBatch(db);
        const chunk = hotelsData.slice(i, i + batchSize);
        
        chunk.forEach((hotelData) => {
          try {
            const docRef = doc(collection(db, 'hotels'));
            currentBatch.set(docRef, {
              ...hotelData,
              rating: 0,
              reviews: 0,
              priceRange: { min: 0, max: 0 },
              created_at: serverTimestamp(),
              created_by: createdBy,
              coordinates: null
            });
            successCount++;
          } catch (error) {
            failCount++;
            errors.push(`Failed to add ${hotelData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        });
        
        batches.push(currentBatch);
      }

      // Commit all batches
      for (const batch of batches) {
        await batch.commit();
      }

      return { successCount, failCount, errors };
    } catch (error) {
      console.error('Error in bulk hotel creation:', error);
      throw error;
    }
  }

  static async updateHotel(hotelId: string, hotelData: Partial<HotelFormData>, updatedBy: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'hotels', hotelId), {
        ...hotelData,
        updated_at: serverTimestamp(),
        updated_by: updatedBy
      });
    } catch (error) {
      console.error('Error updating hotel:', error);
      throw error;
    }
  }

  static async deleteHotel(hotelId: string): Promise<void> {
    try {
      // Delete all room types first
      const roomTypesQuery = query(collection(db, 'room_types'), where('hotelId', '==', hotelId));
      const roomTypesSnapshot = await getDocs(roomTypesQuery);
      
      const batch = writeBatch(db);
      roomTypesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete the hotel
      batch.delete(doc(db, 'hotels', hotelId));
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      throw error;
    }
  }

  static async getHotel(hotelId: string): Promise<Hotel | null> {
    try {
      const docSnap = await getDoc(doc(db, 'hotels', hotelId));
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          created_at: docSnap.data().created_at?.toDate() || new Date()
        } as Hotel;
      }
      return null;
    } catch (error) {
      console.error('Error getting hotel:', error);
      throw error;
    }
  }

  static async getAllHotels(): Promise<Hotel[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'hotels'), orderBy('created_at', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date()
      })) as Hotel[];
    } catch (error) {
      console.error('Error getting hotels:', error);
      throw error;
    }
  }

  static async searchHotels(filters: HotelSearchFilters): Promise<Hotel[]> {
    try {
      let hotelsQuery = query(collection(db, 'hotels'), where('status', '==', 'active'));
      
      if (filters.city) {
        hotelsQuery = query(hotelsQuery, where('city', '==', filters.city));
      }
      
      if (filters.rating) {
        hotelsQuery = query(hotelsQuery, where('rating', '>=', filters.rating));
      }
      
      // Add ordering
      const sortField = filters.sortBy || 'rating';
      const sortDirection = filters.sortOrder || 'desc';
      hotelsQuery = query(hotelsQuery, orderBy(sortField, sortDirection));
      
      const querySnapshot = await getDocs(hotelsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date()
      })) as Hotel[];
    } catch (error) {
      console.error('Error searching hotels:', error);
      throw error;
    }
  }

  // Room Type Management
  static async createRoomType(roomTypeData: RoomTypeFormData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'room_types'), {
        ...roomTypeData,
        availableRooms: roomTypeData.totalRooms,
        created_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating room type:', error);
      throw error;
    }
  }

  static async updateRoomType(roomTypeId: string, roomTypeData: Partial<RoomTypeFormData>): Promise<void> {
    try {
      await updateDoc(doc(db, 'room_types', roomTypeId), {
        ...roomTypeData,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating room type:', error);
      throw error;
    }
  }

  static async getRoomTypesByHotel(hotelId: string): Promise<RoomType[]> {
    try {
      // Try with full query first (requires composite index)
      try {
        const querySnapshot = await getDocs(
          query(
            collection(db, 'room_types'), 
            where('hotelId', '==', hotelId),
            where('status', '==', 'active'),
            orderBy('pricePerNight', 'asc')
          )
        );
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate() || new Date()
        })) as RoomType[];
      } catch (indexError) {
        // Fallback: simpler query without orderBy (doesn't require composite index)
        console.warn('Composite index missing, using fallback query for room types');
        const querySnapshot = await getDocs(
          query(
            collection(db, 'room_types'), 
            where('hotelId', '==', hotelId)
          )
        );
        const roomTypes = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            created_at: doc.data().created_at?.toDate() || new Date()
          })) as RoomType[];
        
        // Filter active and sort in memory
        return roomTypes
          .filter(rt => rt.status === 'active')
          .sort((a, b) => a.pricePerNight - b.pricePerNight);
      }
    } catch (error) {
      console.error('Error getting room types:', error);
      throw error;
    }
  }

  static async deleteRoomType(roomTypeId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'room_types', roomTypeId));
    } catch (error) {
      console.error('Error deleting room type:', error);
      throw error;
    }
  }

  // Booking Management
  static async createHotelBooking(bookingData: Omit<HotelBooking, 'id' | 'created_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'hotel_bookings'), {
        ...bookingData,
        created_at: serverTimestamp()
      });

      // Send push notification to admin
      sendPushNotification('new_hotel_booking', {
        guestName: bookingData.guestName,
        hotelName: bookingData.hotelName,
        checkInDate: bookingData.checkInDate,
        bookingId: docRef.id
      });
      
      // Update room availability only if roomTypeId is provided (not for direct inquiries)
      if (bookingData.roomTypeId && bookingData.roomTypeId.trim() !== '') {
        await this.updateRoomAvailability(
          bookingData.roomTypeId, 
          bookingData.checkInDate, 
          bookingData.checkOutDate, 
          -bookingData.numberOfRooms
        );
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating hotel booking:', error);
      throw error;
    }
  }

  static async updateHotelBooking(bookingId: string, bookingData: Partial<HotelBooking>, updatedBy: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'hotel_bookings', bookingId), {
        ...bookingData,
        updated_at: serverTimestamp(),
        updated_by: updatedBy
      });
    } catch (error) {
      console.error('Error updating hotel booking:', error);
      throw error;
    }
  }

  static async cancelHotelBooking(bookingId: string, reason: string, cancelledBy: string): Promise<void> {
    try {
      const bookingDoc = await getDoc(doc(db, 'hotel_bookings', bookingId));
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }
      
      const booking = bookingDoc.data() as HotelBooking;
      
      // Update booking status
      await updateDoc(doc(db, 'hotel_bookings', bookingId), {
        bookingStatus: 'cancelled',
        cancellationReason: reason,
        updated_at: serverTimestamp(),
        updated_by: cancelledBy
      });
      
      // Restore room availability
      await this.updateRoomAvailability(
        booking.roomTypeId, 
        booking.checkInDate, 
        booking.checkOutDate, 
        booking.numberOfRooms
      );
    } catch (error) {
      console.error('Error cancelling hotel booking:', error);
      throw error;
    }
  }

  static async getHotelBookings(filters?: { hotelId?: string; agentEmail?: string; status?: string }): Promise<HotelBooking[]> {
    try {
      let bookingsQuery = query(collection(db, 'hotel_bookings'), orderBy('created_at', 'desc'));
      
      if (filters?.hotelId) {
        bookingsQuery = query(bookingsQuery, where('hotelId', '==', filters.hotelId));
      }
      
      if (filters?.agentEmail) {
        bookingsQuery = query(bookingsQuery, where('assignedAgent', '==', filters.agentEmail));
      }
      
      if (filters?.status) {
        bookingsQuery = query(bookingsQuery, where('bookingStatus', '==', filters.status));
      }
      
      const querySnapshot = await getDocs(bookingsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date()
      })) as HotelBooking[];
    } catch (error) {
      console.error('Error getting hotel bookings:', error);
      throw error;
    }
  }

  static async getHotelBooking(bookingId: string): Promise<HotelBooking | null> {
    try {
      const docRef = doc(db, 'hotel_bookings', bookingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          created_at: docSnap.data().created_at?.toDate() || new Date()
        } as HotelBooking;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching hotel booking:', error);
      throw error;
    }
  }

  // Room Availability Management
  static async updateRoomAvailability(
    roomTypeId: string, 
    startDate: string, 
    endDate: string, 
    roomChange: number
  ): Promise<void> {
    // Skip if roomTypeId is empty or invalid
    if (!roomTypeId || roomTypeId.trim() === '') {
      console.log('Skipping room availability update - no room type specified');
      return;
    }
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const batch = writeBatch(db);
      
      for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const availabilityRef = doc(db, 'room_availability', `${roomTypeId}_${dateStr}`);
        
        const availabilityDoc = await getDoc(availabilityRef);
        if (availabilityDoc.exists()) {
          const currentData = availabilityDoc.data();
          batch.update(availabilityRef, {
            availableRooms: Math.max(0, currentData.availableRooms + roomChange),
            bookedRooms: Math.max(0, currentData.bookedRooms - roomChange)
          });
        } else {
          // Get room type to initialize availability
          const roomTypeDoc = await getDoc(doc(db, 'room_types', roomTypeId));
          if (roomTypeDoc.exists()) {
            const roomType = roomTypeDoc.data() as RoomType;
            batch.set(availabilityRef, {
              roomTypeId,
              date: dateStr,
              availableRooms: Math.max(0, roomType.totalRooms + roomChange),
              blockedRooms: 0,
              bookedRooms: Math.max(0, -roomChange),
              basePrice: roomType.pricePerNight
            });
          }
        }
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error updating room availability:', error);
      throw error;
    }
  }

  static async checkRoomAvailability(
    roomTypeId: string, 
    checkInDate: string, 
    checkOutDate: string, 
    numberOfRooms: number
  ): Promise<boolean> {
    try {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      
      for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const availabilityDoc = await getDoc(doc(db, 'room_availability', `${roomTypeId}_${dateStr}`));
        
        if (availabilityDoc.exists()) {
          const availability = availabilityDoc.data();
          if (availability.availableRooms < numberOfRooms) {
            return false;
          }
        } else {
          // Check room type total rooms
          const roomTypeDoc = await getDoc(doc(db, 'room_types', roomTypeId));
          if (roomTypeDoc.exists()) {
            const roomType = roomTypeDoc.data() as RoomType;
            if (roomType.totalRooms < numberOfRooms) {
              return false;
            }
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking room availability:', error);
      throw error;
    }
  }

  // Hotel Agent Management
  static async createHotelAgent(agentData: Omit<HotelAgent, 'id' | 'created_at'>, createdBy: string): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'hotel_agents'), {
        ...agentData,
        created_at: serverTimestamp(),
        created_by: createdBy
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating hotel agent:', error);
      throw error;
    }
  }

  static async updateHotelAgent(agentId: string, agentData: Partial<HotelAgent>): Promise<void> {
    try {
      await updateDoc(doc(db, 'hotel_agents', agentId), {
        ...agentData,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating hotel agent:', error);
      throw error;
    }
  }

  static async getHotelAgents(): Promise<HotelAgent[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'hotel_agents'), orderBy('created_at', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date()
      })) as HotelAgent[];
    } catch (error) {
      console.error('Error getting hotel agents:', error);
      throw error;
    }
  }

  static async deleteHotelAgent(agentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'hotel_agents', agentId));
    } catch (error) {
      console.error('Error deleting hotel agent:', error);
      throw error;
    }
  }

  // Analytics and Statistics
  static async getHotelStats(): Promise<any> {
    try {
      const hotelsSnapshot = await getDocs(collection(db, 'hotels'));
      const bookingsSnapshot = await getDocs(collection(db, 'hotel_bookings'));
      
      const hotels = hotelsSnapshot.docs.map(doc => doc.data());
      const bookings = bookingsSnapshot.docs.map(doc => doc.data());
      
      const activeHotels = hotels.filter(h => h.status === 'active');
      const pendingBookings = bookings.filter(b => b.bookingStatus === 'pending');
      const totalRevenue = bookings
        .filter(b => b.bookingStatus !== 'cancelled')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      
      return {
        totalHotels: hotels.length,
        activeHotels: activeHotels.length,
        totalBookings: bookings.length,
        pendingBookings: pendingBookings.length,
        totalRevenue,
        averageRating: activeHotels.reduce((sum, h) => sum + (h.rating || 0), 0) / activeHotels.length || 0,
        occupancyRate: 0 // Calculate based on availability data
      };
    } catch (error) {
      console.error('Error getting hotel stats:', error);
      throw error;
    }
  }

  // Real-time listeners
  static onHotelsChange(callback: (hotels: Hotel[]) => void): () => void {
    return onSnapshot(
      query(collection(db, 'hotels'), orderBy('created_at', 'desc')),
      (snapshot) => {
        const hotels = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate() || new Date()
        })) as Hotel[];
        callback(hotels);
      }
    );
  }

  static onHotelBookingsChange(callback: (bookings: HotelBooking[]) => void, filters?: any): () => void {
    let bookingsQuery = query(collection(db, 'hotel_bookings'), orderBy('created_at', 'desc'));
    
    if (filters?.agentEmail) {
      bookingsQuery = query(bookingsQuery, where('assignedAgent', '==', filters.agentEmail));
    }
    
    return onSnapshot(bookingsQuery, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date()
      })) as HotelBooking[];
      callback(bookings);
    });
  }
}
