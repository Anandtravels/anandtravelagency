import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/auth';
import { useToast } from './use-toast';
import { HotelService } from '../services/hotelService';
import { Hotel, HotelFormData, RoomType, RoomTypeFormData } from '../types/hotel';

export const useHotelManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // Load hotels
  useEffect(() => {
    const unsubscribe = HotelService.onHotelsChange((hotelsData) => {
      setHotels(hotelsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Create hotel
  const createHotel = useCallback(async (hotelData: HotelFormData): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create hotels",
        variant: "destructive"
      });
      return null;
    }

    try {
      const hotelId = await HotelService.createHotel(hotelData, user.email || '');
      toast({
        title: "Hotel Created",
        description: "Hotel has been created successfully",
      });
      return hotelId;
    } catch (error) {
      console.error('Error creating hotel:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create hotel. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast]);

  // Update hotel
  const updateHotel = useCallback(async (hotelId: string, hotelData: Partial<HotelFormData>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update hotels",
        variant: "destructive"
      });
      return false;
    }

    try {
      await HotelService.updateHotel(hotelId, hotelData, user.email || '');
      toast({
        title: "Hotel Updated",
        description: "Hotel has been updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating hotel:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update hotel. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  // Delete hotel
  const deleteHotel = useCallback(async (hotelId: string): Promise<boolean> => {
    if (!user || user.email !== 'admin@anandtravels.com') {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to delete hotels",
        variant: "destructive"
      });
      return false;
    }

    try {
      await HotelService.deleteHotel(hotelId);
      toast({
        title: "Hotel Deleted",
        description: "Hotel has been deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error deleting hotel:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete hotel. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  // Get hotel by ID
  const getHotel = useCallback(async (hotelId: string): Promise<Hotel | null> => {
    try {
      return await HotelService.getHotel(hotelId);
    } catch (error) {
      console.error('Error getting hotel:', error);
      toast({
        title: "Error",
        description: "Failed to fetch hotel details",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  return {
    hotels,
    loading,
    selectedHotel,
    setSelectedHotel,
    createHotel,
    updateHotel,
    deleteHotel,
    getHotel
  };
};

export const useRoomTypeManagement = (hotelId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);

  // Load room types
  const loadRoomTypes = useCallback(async (targetHotelId: string) => {
    setLoading(true);
    try {
      const roomTypesData = await HotelService.getRoomTypesByHotel(targetHotelId);
      setRoomTypes(roomTypesData);
    } catch (error) {
      console.error('Error loading room types:', error);
      toast({
        title: "Loading Failed",
        description: "Failed to load room types",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (hotelId) {
      loadRoomTypes(hotelId);
    }
  }, [hotelId, loadRoomTypes]);

  // Create room type
  const createRoomType = useCallback(async (roomTypeData: RoomTypeFormData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create room types",
        variant: "destructive"
      });
      return false;
    }

    try {
      await HotelService.createRoomType(roomTypeData);
      toast({
        title: "Room Type Created",
        description: "Room type has been created successfully",
      });
      
      // Reload room types
      if (roomTypeData.hotelId) {
        loadRoomTypes(roomTypeData.hotelId);
      }
      
      return true;
    } catch (error) {
      console.error('Error creating room type:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create room type. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, loadRoomTypes]);

  // Update room type
  const updateRoomType = useCallback(async (roomTypeId: string, roomTypeData: Partial<RoomTypeFormData>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update room types",
        variant: "destructive"
      });
      return false;
    }

    try {
      await HotelService.updateRoomType(roomTypeId, roomTypeData);
      toast({
        title: "Room Type Updated",
        description: "Room type has been updated successfully",
      });
      
      // Reload room types if hotelId is available
      if (hotelId) {
        loadRoomTypes(hotelId);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating room type:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update room type. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, hotelId, loadRoomTypes]);

  // Delete room type
  const deleteRoomType = useCallback(async (roomTypeId: string): Promise<boolean> => {
    if (!user || user.email !== 'admin@anandtravels.com') {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to delete room types",
        variant: "destructive"
      });
      return false;
    }

    try {
      await HotelService.deleteRoomType(roomTypeId);
      toast({
        title: "Room Type Deleted",
        description: "Room type has been deleted successfully",
      });
      
      // Reload room types if hotelId is available
      if (hotelId) {
        loadRoomTypes(hotelId);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting room type:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete room type. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, hotelId, loadRoomTypes]);

  return {
    roomTypes,
    loading,
    loadRoomTypes,
    createRoomType,
    updateRoomType,
    deleteRoomType
  };
};
