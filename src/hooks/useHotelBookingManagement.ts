import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/auth';
import { useToast } from './use-toast';
import { HotelService } from '../services/hotelService';
import { HotelBooking, HotelAgent } from '../types/hotel';

export const useHotelBookingManagement = (agentEmail?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<HotelBooking | null>(null);

  // Load bookings
  useEffect(() => {
    const filters = agentEmail ? { agentEmail } : undefined;
    
    const unsubscribe = HotelService.onHotelBookingsChange((bookingsData) => {
      setBookings(bookingsData);
      setLoading(false);
    }, filters);

    return unsubscribe;
  }, [agentEmail]);

  // Create booking
  const createBooking = useCallback(async (bookingData: Omit<HotelBooking, 'id' | 'created_at'>): Promise<string | null> => {
    try {
      const bookingId = await HotelService.createHotelBooking(bookingData);
      toast({
        title: "Booking Created",
        description: "Hotel booking has been created successfully",
      });
      return bookingId;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Update booking
  const updateBooking = useCallback(async (bookingId: string, bookingData: Partial<HotelBooking>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update bookings",
        variant: "destructive"
      });
      return false;
    }

    try {
      await HotelService.updateHotelBooking(bookingId, bookingData, user.email || '');
      toast({
        title: "Booking Updated",
        description: "Hotel booking has been updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update booking. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  // Update booking status
  const updateBookingStatus = useCallback(async (
    bookingId: string, 
    status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  ): Promise<boolean> => {
    return updateBooking(bookingId, { bookingStatus: status });
  }, [updateBooking]);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId: string, reason: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to cancel bookings",
        variant: "destructive"
      });
      return false;
    }

    try {
      await HotelService.cancelHotelBooking(bookingId, reason, user.email || '');
      toast({
        title: "Booking Cancelled",
        description: "Hotel booking has been cancelled successfully",
      });
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  // Assign booking to agent
  const assignToAgent = useCallback(async (bookingId: string, agentEmail: string): Promise<boolean> => {
    if (!user || user.email !== 'admin@anandtravels.com') {
      toast({
        title: "Unauthorized",
        description: "Only admins can assign bookings to agents",
        variant: "destructive"
      });
      return false;
    }

    return updateBooking(bookingId, {
      assignedAgent: agentEmail,
      assignedAt: new Date()
    });
  }, [user, toast, updateBooking]);

  // Check room availability
  const checkAvailability = useCallback(async (
    roomTypeId: string,
    checkInDate: string,
    checkOutDate: string,
    numberOfRooms: number
  ): Promise<boolean> => {
    try {
      return await HotelService.checkRoomAvailability(roomTypeId, checkInDate, checkOutDate, numberOfRooms);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast({
        title: "Availability Check Failed",
        description: "Failed to check room availability",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Get bookings with filters
  const getFilteredBookings = useCallback((filters: {
    status?: string;
    hotelId?: string;
    dateRange?: { start: string; end: string };
  }) => {
    let filtered = bookings;

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.bookingStatus === filters.status);
    }

    if (filters.hotelId) {
      filtered = filtered.filter(booking => booking.hotelId === filters.hotelId);
    }

    if (filters.dateRange) {
      filtered = filtered.filter(booking => {
        const checkIn = new Date(booking.checkInDate);
        const rangeStart = new Date(filters.dateRange!.start);
        const rangeEnd = new Date(filters.dateRange!.end);
        return checkIn >= rangeStart && checkIn <= rangeEnd;
      });
    }

    return filtered;
  }, [bookings]);

  // Get booking statistics
  const getBookingStats = useCallback(() => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.bookingStatus === 'pending').length;
    const confirmed = bookings.filter(b => b.bookingStatus === 'confirmed').length;
    const checkedIn = bookings.filter(b => b.bookingStatus === 'checked_in').length;
    const completed = bookings.filter(b => b.bookingStatus === 'checked_out').length;
    const cancelled = bookings.filter(b => b.bookingStatus === 'cancelled').length;
    
    const totalRevenue = bookings
      .filter(b => b.bookingStatus !== 'cancelled')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return {
      total,
      pending,
      confirmed,
      checkedIn,
      completed,
      cancelled,
      totalRevenue
    };
  }, [bookings]);

  return {
    bookings,
    loading,
    selectedBooking,
    setSelectedBooking,
    createBooking,
    updateBooking,
    updateBookingStatus,
    cancelBooking,
    assignToAgent,
    checkAvailability,
    getFilteredBookings,
    getBookingStats
  };
};

export const useHotelAgentManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agents, setAgents] = useState<HotelAgent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load agents
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const agentsData = await HotelService.getHotelAgents();
        setAgents(agentsData);
      } catch (error) {
        console.error('Error loading agents:', error);
        toast({
          title: "Loading Failed",
          description: "Failed to load hotel agents",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, [toast]);

  // Create agent
  const createAgent = useCallback(async (agentData: Omit<HotelAgent, 'id' | 'created_at'>): Promise<boolean> => {
    if (!user || user.email !== 'admin@anandtravels.com') {
      toast({
        title: "Unauthorized",
        description: "Only admins can create hotel agents",
        variant: "destructive"
      });
      return false;
    }

    try {
      await HotelService.createHotelAgent(agentData, user.email || '');
      toast({
        title: "Agent Created",
        description: "Hotel agent has been created successfully",
      });
      
      // Reload agents
      const agentsData = await HotelService.getHotelAgents();
      setAgents(agentsData);
      
      return true;
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create hotel agent. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  // Update agent
  const updateAgent = useCallback(async (agentId: string, agentData: Partial<HotelAgent>): Promise<boolean> => {
    if (!user || user.email !== 'admin@anandtravels.com') {
      toast({
        title: "Unauthorized",
        description: "Only admins can update hotel agents",
        variant: "destructive"
      });
      return false;
    }

    try {
      await HotelService.updateHotelAgent(agentId, agentData);
      toast({
        title: "Agent Updated",
        description: "Hotel agent has been updated successfully",
      });
      
      // Reload agents
      const agentsData = await HotelService.getHotelAgents();
      setAgents(agentsData);
      
      return true;
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update hotel agent. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  // Delete agent
  const deleteAgent = useCallback(async (agentId: string): Promise<boolean> => {
    if (!user || user.email !== 'admin@anandtravels.com') {
      toast({
        title: "Unauthorized",
        description: "Only admins can delete hotel agents",
        variant: "destructive"
      });
      return false;
    }

    try {
      await HotelService.deleteHotelAgent(agentId);
      toast({
        title: "Agent Deleted",
        description: "Hotel agent has been deleted successfully",
      });
      
      // Reload agents
      const agentsData = await HotelService.getHotelAgents();
      setAgents(agentsData);
      
      return true;
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete hotel agent. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  return {
    agents,
    loading,
    createAgent,
    updateAgent,
    deleteAgent
  };
};
