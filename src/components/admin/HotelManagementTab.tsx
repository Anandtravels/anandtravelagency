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
  Car
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
import { useHotelManagement, useRoomTypeManagement } from "@/hooks/useHotelManagement";
import { Hotel, HotelFormData, RoomType, RoomTypeFormData } from "@/types/hotel";
import { useToast } from "@/hooks/use-toast";

interface HotelManagementTabProps {
  user: any;
}

const HotelManagementTab = ({ user }: HotelManagementTabProps) => {
  const { toast } = useToast();
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
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hotel Management</h2>
          <p className="text-gray-600 mt-1">Manage hotels and room types</p>
        </div>
        <Button onClick={() => openHotelModal()} className="bg-travel-orange hover:bg-travel-orange/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Hotel
        </Button>
      </div>

      <Tabs defaultValue="hotels" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hotels">Hotels ({hotels.length})</TabsTrigger>
          <TabsTrigger value="rooms">Room Types ({roomTypes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="hotels" className="space-y-4">
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
          ) : hotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotels.map((hotel) => (
                <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hotels found</h3>
                <p className="text-gray-600 mb-4">Start by adding your first hotel.</p>
                <Button onClick={() => openHotelModal()}>Add Hotel</Button>
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
    </div>
  );
};

export default HotelManagementTab;
