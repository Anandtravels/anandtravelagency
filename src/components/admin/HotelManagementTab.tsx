import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Home, 
  MapPin, 
  Star,
  Users,
  Camera,
  Bed,
  Wind,
  Wifi,
  Coffee,
  Car,
  Filter,
  Upload,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useHotelManagement, useRoomTypeManagement } from "@/hooks/useHotelManagement";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { Hotel, HotelFormData, RoomType, RoomTypeFormData } from "@/types/hotel";
import { useToast } from "@/hooks/use-toast";

interface HotelManagementTabProps {
  user: any;
}

const HotelManagementTab = ({ user }: HotelManagementTabProps) => {
  const { toast } = useToast();
  const { visibility, updatePageVisibility } = usePageVisibility();
  const {
    hotels,
    loading,
    createHotel,
    updateHotel,
    deleteHotel,
    selectedHotel,
    setSelectedHotel
  } = useHotelManagement();

  const {
    roomTypes,
    loading: roomTypesLoading,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    loadRoomTypes
  } = useRoomTypeManagement(selectedHotel?.id);

  // Modal states
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [roomTypeModalOpen, setRoomTypeModalOpen] = useState(false);
  const [jsonImportModalOpen, setJsonImportModalOpen] = useState(false);
  const [bulkUpdateModalOpen, setBulkUpdateModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  
  // JSON Import state
  const [jsonInput, setJsonInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
  // Bulk Update state
  const [bulkUpdateInput, setBulkUpdateInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  
  // Bulk selection state
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>([]);
  const [bulkStatusUpdate, setBulkStatusUpdate] = useState<'active' | 'inactive'>('active');

  // Form data
  const [hotelFormData, setHotelFormData] = useState<HotelFormData>({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    images: [],
    amenities: [],
    checkInTime: '14:00',
    checkOutTime: '11:00',
    policies: [],
    featured: false,
    status: 'active'
  });

  const [roomTypeFormData, setRoomTypeFormData] = useState<RoomTypeFormData>({
    hotelId: '',
    name: '',
    description: '',
    images: [],
    amenities: [],
    maxOccupancy: 2,
    pricePerNight: 0,
    totalRooms: 1,
    roomSize: '',
    bedType: '',
    hasAC: false,
    hasWiFi: false,
    hasBreakfast: false,
    status: 'active'
  });

  // Common amenities
  const commonAmenities = [
    'Free Wi-Fi', 'Air Conditioning', 'Parking', 'Restaurant', 
    'Room Service', 'Laundry', 'Spa', 'Gym', 'Swimming Pool',
    'Business Center', 'Airport Shuttle', 'Pet Friendly'
  ];

  // Bed types
  const bedTypes = [
    'Single Bed', 'Double Bed', 'Queen Bed', 'King Bed', 
    'Twin Beds', 'Sofa Bed', 'Bunk Bed'
  ];

  // Reset hotel form
  const resetHotelForm = () => {
    setHotelFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      images: [],
      amenities: [],
      priceRange: { min: 0, max: 0 },
      checkInTime: '14:00',
      checkOutTime: '11:00',
      policies: [],
      featured: false,
      status: 'active'
    });
    setEditingHotel(null);
  };

  // Reset room type form
  const resetRoomTypeForm = () => {
    setRoomTypeFormData({
      hotelId: '',
      name: '',
      description: '',
      images: [],
      amenities: [],
      maxOccupancy: 2,
      pricePerNight: 0,
      totalRooms: 1,
      roomSize: '',
      bedType: '',
      hasAC: false,
      hasWiFi: false,
      hasBreakfast: false,
      status: 'active'
    });
    setEditingRoomType(null);
  };

  // Open hotel modal for editing
  const openHotelModal = (hotel?: Hotel) => {
    if (hotel) {
      setEditingHotel(hotel);
      setHotelFormData({
        name: hotel.name,
        description: hotel.description,
        address: hotel.address,
        city: hotel.city,
        state: hotel.state,
        pincode: hotel.pincode,
        images: hotel.images,
        amenities: hotel.amenities,
        priceRange: hotel.priceRange || { min: 0, max: 0 },
        checkInTime: hotel.checkInTime,
        checkOutTime: hotel.checkOutTime,
        policies: hotel.policies,
        featured: hotel.featured,
        status: hotel.status
      });
    } else {
      resetHotelForm();
    }
    setHotelModalOpen(true);
  };

  // Open room type modal for editing
  const openRoomTypeModal = (roomType?: RoomType) => {
    if (roomType) {
      setEditingRoomType(roomType);
      setRoomTypeFormData({
        hotelId: roomType.hotelId,
        name: roomType.name,
        description: roomType.description,
        images: roomType.images,
        amenities: roomType.amenities,
        maxOccupancy: roomType.maxOccupancy,
        pricePerNight: roomType.pricePerNight,
        totalRooms: roomType.totalRooms,
        roomSize: roomType.roomSize || '',
        bedType: roomType.bedType,
        hasAC: roomType.hasAC,
        hasWiFi: roomType.hasWiFi,
        hasBreakfast: roomType.hasBreakfast,
        status: roomType.status
      });
    } else {
      resetRoomTypeForm();
      if (selectedHotel) {
        setRoomTypeFormData(prev => ({ ...prev, hotelId: selectedHotel.id }));
      }
    }
    setRoomTypeModalOpen(true);
  };

  // Handle hotel save
  const handleHotelSave = async () => {
    try {
      if (editingHotel) {
        const success = await updateHotel(editingHotel.id, hotelFormData);
        if (success) {
          setHotelModalOpen(false);
          resetHotelForm();
        }
      } else {
        const hotelId = await createHotel(hotelFormData);
        if (hotelId) {
          setHotelModalOpen(false);
          resetHotelForm();
        }
      }
    } catch (error) {
      console.error('Error saving hotel:', error);
    }
  };

  // Handle room type save
  const handleRoomTypeSave = async () => {
    try {
      if (editingRoomType) {
        const success = await updateRoomType(editingRoomType.id, roomTypeFormData);
        if (success) {
          setRoomTypeModalOpen(false);
          resetRoomTypeForm();
        }
      } else {
        const success = await createRoomType(roomTypeFormData);
        if (success) {
          setRoomTypeModalOpen(false);
          resetRoomTypeForm();
        }
      }
    } catch (error) {
      console.error('Error saving room type:', error);
    }
  };

  // Handle hotel delete
  const handleHotelDelete = async (hotelId: string) => {
    if (window.confirm('Are you sure you want to delete this hotel? This will also delete all room types.')) {
      const success = await deleteHotel(hotelId);
      if (success && selectedHotel?.id === hotelId) {
        setSelectedHotel(null);
      }
    }
  };

  // Handle checkbox selection
  const handleSelectHotel = (hotelId: string) => {
    setSelectedHotelIds(prev => 
      prev.includes(hotelId) 
        ? prev.filter(id => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedHotelIds.length === filteredHotels.length) {
      setSelectedHotelIds([]);
    } else {
      setSelectedHotelIds(filteredHotels.map(hotel => hotel.id));
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async () => {
    if (selectedHotelIds.length === 0) {
      toast({
        title: "No hotels selected",
        description: "Please select at least one hotel to update.",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`Are you sure you want to set ${selectedHotelIds.length} hotel(s) to ${bulkStatusUpdate}?`)) {
      try {
        let successCount = 0;
        for (const hotelId of selectedHotelIds) {
          const hotel = hotels.find(h => h.id === hotelId);
          if (hotel) {
            const success = await updateHotel(hotelId, { status: bulkStatusUpdate });
            if (success) successCount++;
          }
        }
        
        toast({
          title: "Bulk Update Complete",
          description: `Successfully updated ${successCount} hotel(s) to ${bulkStatusUpdate}.`,
        });
        
        setSelectedHotelIds([]);
      } catch (error) {
        console.error('Error updating hotels:', error);
        toast({
          title: "Error",
          description: "Failed to update some hotels.",
          variant: "destructive"
        });
      }
    }
  };

  // Handle JSON Import
  const handleJSONImport = async () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter JSON data to import.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);

    try {
      // Parse JSON
      const parsedData = JSON.parse(jsonInput);
      
      // Ensure it's an array
      const hotelsArray = Array.isArray(parsedData) ? parsedData : [parsedData];
      
      if (hotelsArray.length === 0) {
        toast({
          title: "No Data",
          description: "No hotel data found in JSON.",
          variant: "destructive"
        });
        setIsImporting(false);
        return;
      }

      // Validate and convert to HotelFormData
      const validHotels: HotelFormData[] = [];
      const errors: string[] = [];

      hotelsArray.forEach((item, index) => {
        const state = item.State || item.state || '';
        const city = item.City || item.city || '';
        const hotelName = item['Hotel Name'] || item.hotelName || item.name || '';

        if (!state || !city || !hotelName) {
          errors.push(`Row ${index + 1}: Missing required fields (State, City, Hotel Name)`);
          return;
        }

        // Create hotel data with defaults
        const hotelData: HotelFormData = {
          name: hotelName,
          description: item.description || `Welcome to ${hotelName}, a premier hotel in ${city}, ${state}.`,
          address: item.address || `${city}, ${state}`,
          city: city,
          state: state,
          pincode: item.pincode || item.pinCode || '',
          images: item.images || [],
          amenities: item.amenities || ['Free Wi-Fi', 'Air Conditioning', 'Room Service'],
          checkInTime: item.checkInTime || '14:00',
          checkOutTime: item.checkOutTime || '11:00',
          policies: item.policies || ['No smoking', 'Valid ID required at check-in'],
          featured: item.featured || false,
          status: item.status || 'active'
        };

        validHotels.push(hotelData);
      });

      if (errors.length > 0) {
        toast({
          title: "Validation Errors",
          description: `${errors.length} error(s) found. Check console for details.`,
          variant: "destructive"
        });
        console.error('JSON Import Validation Errors:', errors);
        setIsImporting(false);
        return;
      }

      // Create hotels
      let successCount = 0;
      let failCount = 0;

      for (const hotelData of validHotels) {
        try {
          const hotelId = await createHotel(hotelData);
          if (hotelId) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error('Error creating hotel:', hotelData.name, error);
          failCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${successCount} hotel(s).${failCount > 0 ? ` Failed to import ${failCount} hotel(s).` : ''}`,
        });
        
        // Clear input and close modal
        setJsonInput('');
        setJsonImportModalOpen(false);
      } else {
        toast({
          title: "Import Failed",
          description: "Failed to import any hotels. Check console for details.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('JSON Import Error:', error);
      toast({
        title: "Invalid JSON",
        description: error instanceof Error ? error.message : "Failed to parse JSON data.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Handle Bulk Update
  const handleBulkUpdate = async () => {
    if (!bulkUpdateInput.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter JSON data to update hotels.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Parse JSON
      const parsedData = JSON.parse(bulkUpdateInput);
      
      // Ensure it's an array
      const updatesArray = Array.isArray(parsedData) ? parsedData : [parsedData];
      
      if (updatesArray.length === 0) {
        toast({
          title: "No Data",
          description: "No hotel update data found in JSON.",
          variant: "destructive"
        });
        setIsUpdating(false);
        return;
      }

      // Process updates with detailed tracking
      let successCount = 0;
      let skippedCount = 0;
      let failCount = 0;
      const successMessages: string[] = [];
      const skippedMessages: string[] = [];
      const errorMessages: string[] = [];

      for (let i = 0; i < updatesArray.length; i++) {
        const updateData = updatesArray[i];
        const hotelName = updateData.hotel_name || updateData.hotelName || updateData.name;

        // Skip if no hotel name provided
        if (!hotelName) {
          skippedCount++;
          skippedMessages.push(`Row ${i + 1}: Missing hotel_name - skipped`);
          continue;
        }

        // Find hotel by name (case-insensitive)
        const hotel = hotels.find(h => h.name.toLowerCase().trim() === hotelName.toLowerCase().trim());
        
        // Skip if hotel not found
        if (!hotel) {
          skippedCount++;
          skippedMessages.push(`Row ${i + 1}: Hotel "${hotelName}" not found - skipped`);
          continue;
        }

        // Build update object with only provided fields
        const updateFields: Partial<HotelFormData> = {};
        let hasValidFields = false;

        // Handle price range
        if (updateData.price_range_in_INR || updateData.priceRange) {
          const priceData = updateData.price_range_in_INR || updateData.priceRange;
          if (priceData && typeof priceData === 'object') {
            updateFields.priceRange = {
              min: Number(priceData.basic_start || priceData.min || 0),
              max: Number(priceData.max_estimate || priceData.max || 0)
            };
            hasValidFields = true;
          }
        }

        // Handle images
        if (updateData.images !== undefined || updateData.image_url !== undefined) {
          const images = updateData.images || (updateData.image_url ? [updateData.image_url] : []);
          updateFields.images = Array.isArray(images) ? images : [images];
          hasValidFields = true;
        }

        // Handle other fields - only update if provided
        if (updateData.description !== undefined) {
          updateFields.description = String(updateData.description);
          hasValidFields = true;
        }
        if (updateData.address !== undefined) {
          updateFields.address = String(updateData.address);
          hasValidFields = true;
        }
        if (updateData.city !== undefined) {
          updateFields.city = String(updateData.city);
          hasValidFields = true;
        }
        if (updateData.state !== undefined || updateData.State !== undefined) {
          updateFields.state = String(updateData.state || updateData.State);
          hasValidFields = true;
        }
        if (updateData.pincode !== undefined || updateData.pinCode !== undefined) {
          updateFields.pincode = String(updateData.pincode || updateData.pinCode);
          hasValidFields = true;
        }
        if (updateData.checkInTime !== undefined) {
          updateFields.checkInTime = String(updateData.checkInTime);
          hasValidFields = true;
        }
        if (updateData.checkOutTime !== undefined) {
          updateFields.checkOutTime = String(updateData.checkOutTime);
          hasValidFields = true;
        }
        if (updateData.featured !== undefined) {
          updateFields.featured = Boolean(updateData.featured);
          hasValidFields = true;
        }
        if (updateData.status !== undefined) {
          updateFields.status = updateData.status as 'active' | 'inactive';
          hasValidFields = true;
        }
        if (updateData.amenities !== undefined) {
          updateFields.amenities = Array.isArray(updateData.amenities) 
            ? updateData.amenities 
            : [];
          hasValidFields = true;
        }

        // Skip if no valid update fields found
        if (!hasValidFields) {
          skippedCount++;
          skippedMessages.push(`Row ${i + 1}: No valid update fields for "${hotelName}" - skipped`);
          continue;
        }

        // Attempt to update hotel
        try {
          const success = await updateHotel(hotel.id, updateFields);
          if (success) {
            successCount++;
            successMessages.push(`Row ${i + 1}: "${hotelName}" updated successfully`);
          } else {
            failCount++;
            errorMessages.push(`Row ${i + 1}: Failed to update "${hotelName}" (service returned false)`);
          }
        } catch (error) {
          console.error(`Error updating hotel ${hotelName}:`, error);
          failCount++;
          errorMessages.push(`Row ${i + 1}: Exception while updating "${hotelName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Prepare detailed results summary
      const totalProcessed = successCount + skippedCount + failCount;
      const resultSummary = [];
      
      if (successCount > 0) resultSummary.push(`✓ ${successCount} updated`);
      if (skippedCount > 0) resultSummary.push(`⊘ ${skippedCount} skipped`);
      if (failCount > 0) resultSummary.push(`✗ ${failCount} failed`);

      // Log detailed results to console
      console.log('=== Bulk Update Results ===');
      console.log(`Total Entries: ${updatesArray.length}`);
      console.log(`Processed: ${totalProcessed}`);
      console.log(`Success: ${successCount}, Skipped: ${skippedCount}, Failed: ${failCount}`);
      
      if (successMessages.length > 0) {
        console.log('\n✓ Successfully Updated:');
        successMessages.forEach(msg => console.log(`  ${msg}`));
      }
      
      if (skippedMessages.length > 0) {
        console.log('\n⊘ Skipped Entries:');
        skippedMessages.forEach(msg => console.log(`  ${msg}`));
      }
      
      if (errorMessages.length > 0) {
        console.log('\n✗ Failed Updates:');
        errorMessages.forEach(msg => console.log(`  ${msg}`));
      }

      // Show appropriate toast based on results
      if (successCount > 0) {
        toast({
          title: "Bulk Update Complete",
          description: resultSummary.join(', ') + '. Check console for details.',
          variant: successCount === updatesArray.length ? "default" : "default"
        });
        
        // Clear input and close modal if all succeeded
        if (failCount === 0) {
          setBulkUpdateInput('');
          setBulkUpdateModalOpen(false);
        }
      } else if (skippedCount > 0 && failCount === 0) {
        toast({
          title: "All Entries Skipped",
          description: `${skippedCount} entries were skipped (not found or invalid). Check console for details.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Update Failed",
          description: `No hotels were updated. ${resultSummary.join(', ')}. Check console for details.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Bulk Update Error:', error);
      toast({
        title: "Invalid JSON",
        description: error instanceof Error ? error.message : "Failed to parse JSON data.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle amenity toggle
  const toggleAmenity = (amenity: string, type: 'hotel' | 'roomType') => {
    if (type === 'hotel') {
      setHotelFormData(prev => ({
        ...prev,
        amenities: prev.amenities.includes(amenity)
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      }));
    } else {
      setRoomTypeFormData(prev => ({
        ...prev,
        amenities: prev.amenities.includes(amenity)
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      }));
    }
  };

  // Add image URL
  const addImageUrl = (url: string, type: 'hotel' | 'roomType') => {
    if (!url.trim()) return;
    
    if (type === 'hotel') {
      setHotelFormData(prev => ({
        ...prev,
        images: [...prev.images, url.trim()]
      }));
    } else {
      setRoomTypeFormData(prev => ({
        ...prev,
        images: [...prev.images, url.trim()]
      }));
    }
  };

  // Remove image URL
  const removeImageUrl = (index: number, type: 'hotel' | 'roomType') => {
    if (type === 'hotel') {
      setHotelFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      setRoomTypeFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  // Get room types for selected hotel
  const selectedHotelRoomTypes = selectedHotel 
    ? roomTypes.filter(rt => rt.hotelId === selectedHotel.id)
    : [];

  // Get unique cities from hotels (sorted alphabetically)
  const uniqueCities = Array.from(new Set(hotels.map(hotel => hotel.city)))
    .filter(city => city) // Remove empty/null cities
    .sort((a, b) => a.localeCompare(b));

  // Filter hotels based on status and city
  const filteredHotels = hotels
    .filter(hotel => statusFilter === 'all' || hotel.status === statusFilter)
    .filter(hotel => cityFilter === 'all' || hotel.city === cityFilter);

  // Hotels page visibility
  const hotelsVisible = visibility?.hotels ?? true;

  const handleToggleHotelsPage = async () => {
    try {
      await updatePageVisibility('hotels', !hotelsVisible, user?.email || 'admin');
    } catch (error) {
      console.error('Error toggling hotels page:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Visibility Control */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            {hotelsVisible ? (
              <Eye className="h-5 w-5 text-green-600" />
            ) : (
              <EyeOff className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="font-medium text-gray-900">Hotels Page Visibility</p>
              <p className="text-sm text-gray-500">
                {hotelsVisible
                  ? 'Hotels page is live and visible to visitors'
                  : 'Hotels page is hidden from the website'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={hotelsVisible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
              {hotelsVisible ? 'ON' : 'OFF'}
            </Badge>
            <Switch
              checked={hotelsVisible}
              onCheckedChange={handleToggleHotelsPage}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hotel Management</h2>
          <p className="text-gray-600 mt-1">Manage hotels and room types</p>
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hotels</SelectItem>
              <SelectItem value="active">Active Hotels</SelectItem>
              <SelectItem value="inactive">Inactive Hotels</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {uniqueCities.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setJsonImportModalOpen(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import JSON
          </Button>
          <Button onClick={() => setBulkUpdateModalOpen(true)} variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Bulk Update
          </Button>
          <Button onClick={() => openHotelModal()} className="bg-travel-orange hover:bg-travel-orange/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Hotel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hotels" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hotels">
            Hotels ({filteredHotels.length}{statusFilter !== 'all' ? ` of ${hotels.length}` : ''})
          </TabsTrigger>
          <TabsTrigger value="rooms">Room Types ({roomTypes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="hotels" className="space-y-4">
          {/* Bulk Actions Bar */}
          {filteredHotels.length > 0 && (
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedHotelIds.length === filteredHotels.length && filteredHotels.length > 0}
                    onCheckedChange={handleSelectAll}
                    id="select-all"
                  />
                  <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                    Select All ({selectedHotelIds.length} selected)
                  </label>
                </div>
                
                {selectedHotelIds.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Select value={bulkStatusUpdate} onValueChange={(value: 'active' | 'inactive') => setBulkStatusUpdate(value)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Set Active</SelectItem>
                        <SelectItem value="inactive">Set Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleBulkStatusUpdate}
                      className="bg-travel-orange hover:bg-travel-orange/90"
                    >
                      Apply to {selectedHotelIds.length} Hotel{selectedHotelIds.length > 1 ? 's' : ''}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredHotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHotels.map((hotel) => (
                <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedHotelIds.includes(hotel.id)}
                      onCheckedChange={() => handleSelectHotel(hotel.id)}
                      className="bg-white border-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  <div 
                    className="h-48 bg-cover bg-center cursor-pointer"
                    style={{ 
                      backgroundImage: `url(${hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800'})` 
                    }}
                    onClick={() => setSelectedHotel(hotel)}
                  >
                    <div className="h-full bg-black bg-opacity-20 flex items-end">
                      <div className="p-4 w-full">
                        <div className="flex justify-between items-end">
                          <div>
                            {hotel.featured && (
                              <Badge className="bg-travel-orange text-white mb-2">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <Badge className={hotel.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                            {hotel.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                        {hotel.name}
                      </h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-600">
                          {hotel.rating > 0 ? hotel.rating.toFixed(1) : 'New'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{hotel.city}, {hotel.state}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {hotel.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {hotel.amenities.slice(0, 3).map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{hotel.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-600">Price Range</div>
                        <div className="text-lg font-bold text-travel-blue-dark">
                          ₹{hotel.priceRange.min.toLocaleString()} - ₹{hotel.priceRange.max.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openHotelModal(hotel)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleHotelDelete(hotel.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {hotels.length === 0 ? 'No hotels found' : `No ${statusFilter} hotels`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {hotels.length === 0 
                    ? 'Start by adding your first hotel.' 
                    : `There are no ${statusFilter} hotels. ${statusFilter === 'active' ? 'Try changing the filter or add a new hotel.' : 'Try changing the filter to see other hotels.'}`
                  }
                </p>
                {hotels.length === 0 && (
                  <Button onClick={() => openHotelModal()}>Add Hotel</Button>
                )}
                {hotels.length > 0 && (
                  <Button onClick={() => setStatusFilter('all')} variant="outline">
                    Show All Hotels
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Room Types</h3>
              {selectedHotel && (
                <p className="text-sm text-gray-600">for {selectedHotel.name}</p>
              )}
            </div>
            <Button 
              onClick={() => openRoomTypeModal()}
              disabled={!selectedHotel}
              className="bg-travel-orange hover:bg-travel-orange/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Room Type
            </Button>
          </div>

          {!selectedHotel ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Hotel</h3>
                <p className="text-gray-600">Choose a hotel from the Hotels tab to manage its room types.</p>
              </CardContent>
            </Card>
          ) : selectedHotelRoomTypes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedHotelRoomTypes.map((roomType) => (
                <Card key={roomType.id} className="overflow-hidden">
                  <div 
                    className="h-40 bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url(${roomType.images[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800'})` 
                    }}
                  >
                    <div className="h-full bg-black bg-opacity-20 flex items-end">
                      <div className="p-3 w-full">
                        <Badge className={roomType.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                          {roomType.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-lg mb-2">{roomType.name}</h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {roomType.description}
                    </p>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Max Occupancy:</span>
                        <span className="font-medium">{roomType.maxOccupancy} guests</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Rooms:</span>
                        <span className="font-medium">{roomType.totalRooms}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-medium">{roomType.availableRooms}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Bed Type:</span>
                        <span className="font-medium">{roomType.bedType}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      {roomType.hasAC && (
                        <div title="AC">
                          <Wind className="w-4 h-4 text-blue-500" />
                        </div>
                      )}
                      {roomType.hasWiFi && (
                        <div title="Wi-Fi">
                          <Wifi className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                      {roomType.hasBreakfast && (
                        <div title="Breakfast">
                          <Coffee className="w-4 h-4 text-orange-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xl font-bold text-travel-blue-dark">
                          ₹{roomType.pricePerNight.toLocaleString()}
                          <span className="text-sm font-normal text-gray-600">/night</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRoomTypeModal(roomType)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this room type?')) {
                              deleteRoomType(roomType.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Bed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No room types found</h3>
                <p className="text-gray-600 mb-4">Add room types for {selectedHotel.name}.</p>
                <Button onClick={() => openRoomTypeModal()}>Add Room Type</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Hotel Modal */}
      <Dialog open={hotelModalOpen} onOpenChange={setHotelModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Hotel Name *</label>
                <Input
                  value={hotelFormData.name}
                  onChange={(e) => setHotelFormData({ ...hotelFormData, name: e.target.value })}
                  placeholder="Enter hotel name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <Textarea
                  value={hotelFormData.description}
                  onChange={(e) => setHotelFormData({ ...hotelFormData, description: e.target.value })}
                  placeholder="Describe the hotel"
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <Textarea
                  value={hotelFormData.address}
                  onChange={(e) => setHotelFormData({ ...hotelFormData, address: e.target.value })}
                  placeholder="Full address"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <Input
                    value={hotelFormData.city}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <Input
                    value={hotelFormData.state}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">PIN Code *</label>
                <Input
                  value={hotelFormData.pincode}
                  onChange={(e) => setHotelFormData({ ...hotelFormData, pincode: e.target.value })}
                  placeholder="PIN Code"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Additional Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Check-in Time</label>
                  <Input
                    type="time"
                    value={hotelFormData.checkInTime}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, checkInTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Check-out Time</label>
                  <Input
                    type="time"
                    value={hotelFormData.checkOutTime}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, checkOutTime: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={hotelFormData.featured}
                  onCheckedChange={(checked) => setHotelFormData({ ...hotelFormData, featured: checked as boolean })}
                />
                <label htmlFor="featured" className="text-sm font-medium">Featured Hotel</label>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  value={hotelFormData.status}
                  onValueChange={(value) => setHotelFormData({ ...hotelFormData, status: value as 'active' | 'inactive' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2">Price Range (₹ per night)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                    <Input
                      type="number"
                      placeholder="Min price"
                      value={hotelFormData.priceRange?.min || ''}
                      onChange={(e) => setHotelFormData({ 
                        ...hotelFormData, 
                        priceRange: {
                          min: parseInt(e.target.value) || 0,
                          max: hotelFormData.priceRange?.max || 0
                        }
                      })}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                    <Input
                      type="number"
                      placeholder="Max price"
                      value={hotelFormData.priceRange?.max || ''}
                      onChange={(e) => setHotelFormData({ 
                        ...hotelFormData, 
                        priceRange: {
                          min: hotelFormData.priceRange?.min || 0,
                          max: parseInt(e.target.value) || 0
                        }
                      })}
                      min="0"
                    />
                  </div>
                </div>
              </div>
              
              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium mb-2">Amenities</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {commonAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`hotel-amenity-${amenity}`}
                        checked={hotelFormData.amenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity, 'hotel')}
                      />
                      <label htmlFor={`hotel-amenity-${amenity}`} className="text-sm">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Images</h3>
            <div className="space-y-2">
              {hotelFormData.images.map((image, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={image} readOnly className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImageUrl(index, 'hotel')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter image URL"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addImageUrl((e.target as HTMLInputElement).value, 'hotel');
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addImageUrl(input.value, 'hotel');
                    input.value = '';
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setHotelModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleHotelSave}>
              {editingHotel ? 'Update Hotel' : 'Create Hotel'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Room Type Modal */}
      <Dialog open={roomTypeModalOpen} onOpenChange={setRoomTypeModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoomType ? 'Edit Room Type' : 'Add New Room Type'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Hotel</label>
                <Select
                  value={roomTypeFormData.hotelId}
                  onValueChange={(value) => setRoomTypeFormData({ ...roomTypeFormData, hotelId: value })}
                  disabled={!!editingRoomType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Room Type Name *</label>
                <Input
                  value={roomTypeFormData.name}
                  onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, name: e.target.value })}
                  placeholder="e.g. Deluxe Room, Suite"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <Textarea
                  value={roomTypeFormData.description}
                  onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, description: e.target.value })}
                  placeholder="Describe the room type"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bed Type *</label>
                <Select
                  value={roomTypeFormData.bedType}
                  onValueChange={(value) => setRoomTypeFormData({ ...roomTypeFormData, bedType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bed type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bedTypes.map((bedType) => (
                      <SelectItem key={bedType} value={bedType}>
                        {bedType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Room Size</label>
                <Input
                  value={roomTypeFormData.roomSize}
                  onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, roomSize: e.target.value })}
                  placeholder="e.g. 300 sq ft"
                />
              </div>
            </div>

            {/* Pricing & Capacity */}
            <div className="space-y-4">
              <h3 className="font-semibold">Pricing & Capacity</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price per Night (₹) *</label>
                <Input
                  type="number"
                  min="0"
                  value={roomTypeFormData.pricePerNight}
                  onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, pricePerNight: Number(e.target.value) })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Max Occupancy *</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={roomTypeFormData.maxOccupancy}
                  onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, maxOccupancy: Number(e.target.value) })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Total Rooms *</label>
                <Input
                  type="number"
                  min="1"
                  value={roomTypeFormData.totalRooms}
                  onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, totalRooms: Number(e.target.value) })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  value={roomTypeFormData.status}
                  onValueChange={(value) => setRoomTypeFormData({ ...roomTypeFormData, status: value as 'active' | 'inactive' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Features */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">Features</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasAC"
                      checked={roomTypeFormData.hasAC}
                      onCheckedChange={(checked) => setRoomTypeFormData({ ...roomTypeFormData, hasAC: checked as boolean })}
                    />
                    <label htmlFor="hasAC" className="text-sm">Air Conditioning</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasWiFi"
                      checked={roomTypeFormData.hasWiFi}
                      onCheckedChange={(checked) => setRoomTypeFormData({ ...roomTypeFormData, hasWiFi: checked as boolean })}
                    />
                    <label htmlFor="hasWiFi" className="text-sm">Free Wi-Fi</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasBreakfast"
                      checked={roomTypeFormData.hasBreakfast}
                      onCheckedChange={(checked) => setRoomTypeFormData({ ...roomTypeFormData, hasBreakfast: checked as boolean })}
                    />
                    <label htmlFor="hasBreakfast" className="text-sm">Breakfast Included</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Amenities */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Additional Amenities</h3>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {commonAmenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`room-amenity-${amenity}`}
                    checked={roomTypeFormData.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity, 'roomType')}
                  />
                  <label htmlFor={`room-amenity-${amenity}`} className="text-sm">
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Images</h3>
            <div className="space-y-2">
              {roomTypeFormData.images.map((image, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={image} readOnly className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImageUrl(index, 'roomType')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter image URL"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addImageUrl((e.target as HTMLInputElement).value, 'roomType');
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addImageUrl(input.value, 'roomType');
                    input.value = '';
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setRoomTypeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoomTypeSave}>
              {editingRoomType ? 'Update Room Type' : 'Create Room Type'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* JSON Import Modal */}
      <Dialog open={jsonImportModalOpen} onOpenChange={setJsonImportModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Hotels from JSON</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Enter JSON data to import multiple hotels at once. Each hotel should have the following format:
              </p>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <pre className="text-xs overflow-x-auto">
{`[
  {
    "State": "Maharashtra",
    "City": "Mumbai",
    "Hotel Name": "Hilton Mumbai International Airport"
  },
  {
    "State": "Karnataka",
    "City": "Bangalore",
    "Hotel Name": "ITC Gardenia"
  }
]`}
                </pre>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                <strong>Required fields:</strong> State, City, Hotel Name
              </p>
              <p className="text-xs text-gray-500 mb-4">
                <strong>Optional fields:</strong> description, address, pincode, images (array), amenities (array), 
                checkInTime, checkOutTime, policies (array), featured (boolean), status ('active' or 'inactive')
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">JSON Data</label>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"State": "Maharashtra", "City": "Mumbai", "Hotel Name": "Hotel Name"}]'
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setJsonImportModalOpen(false);
                  setJsonInput('');
                }}
                disabled={isImporting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleJSONImport}
                disabled={isImporting}
                className="bg-travel-orange hover:bg-travel-orange/90"
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Hotels
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Modal */}
      <Dialog open={bulkUpdateModalOpen} onOpenChange={setBulkUpdateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Update Hotels</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Update multiple hotels at once. Provide hotel name and any fields you want to update:
              </p>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <pre className="text-xs overflow-x-auto">
{`[
  {
    "hotel_name": "Radisson Blu Resort Visakhapatnam",
    "price_range_in_INR": {
      "basic_start": 10100,
      "max_estimate": 20000
    },
    "description": "Updated description",
    "featured": true
  },
  {
    "hotel_name": "ITC Gardenia",
    "images": ["url1", "url2"],
    "amenities": ["Free Wi-Fi", "Pool", "Gym"]
  }
]`}
                </pre>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-xs text-gray-500">
                  <strong>Required:</strong> hotel_name (to identify which hotel to update)
                </p>
                <p className="text-xs text-gray-500">
                  <strong>Updatable fields:</strong> price_range_in_INR (or priceRange), images, image_url, 
                  description, address, city, state, pincode, checkInTime, checkOutTime, featured, status, amenities
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <p className="text-xs text-blue-700 font-medium mb-1">
                  ✓ Smart Processing
                </p>
                <p className="text-xs text-blue-600">
                  • Mismatched or invalid entries are automatically skipped<br/>
                  • Valid updates continue processing regardless of errors<br/>
                  • Detailed results shown in console and notification<br/>
                  • Hotel names are matched case-insensitively
                </p>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-xs text-amber-700 font-medium mb-1">
                  ⚠ Important Notes
                </p>
                <p className="text-xs text-amber-600">
                  • Only provided fields will be updated (partial updates supported)<br/>
                  • Hotels not found in database will be skipped<br/>
                  • Entries without valid fields will be ignored<br/>
                  • Check browser console for detailed processing log
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">JSON Data</label>
              <Textarea
                value={bulkUpdateInput}
                onChange={(e) => setBulkUpdateInput(e.target.value)}
                placeholder='[{"hotel_name": "Hotel Name", "price_range_in_INR": {"basic_start": 5000, "max_estimate": 10000}}]'
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setBulkUpdateModalOpen(false);
                  setBulkUpdateInput('');
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBulkUpdate}
                disabled={isUpdating}
                className="bg-travel-orange hover:bg-travel-orange/90"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Hotels
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotelManagementTab;
