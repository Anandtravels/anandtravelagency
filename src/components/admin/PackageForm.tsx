import { useState, useEffect } from "react";
import { PackageFormData, ItineraryDay } from "@/types/package";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, X } from "lucide-react";

interface PackageFormProps {
  initialData?: Partial<PackageFormData>;
  onSubmit: (data: PackageFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const PackageForm = ({ initialData, onSubmit, onCancel, loading = false }: PackageFormProps) => {
  const [formData, setFormData] = useState<PackageFormData>({
    title: '',
    images: [''],
    days: '',
    price: 0,
    location: '',
    category: 'domestic',
    overview: '',
    highlights: [''],
    inclusions: [''],
    exclusions: [''],
    itinerary: [{ day: 'Day 1', title: '', description: '' }],
    maxPeople: 10,
    duration: '',
    departureInfo: '',
    minAge: 0,
    featured: false,
    status: 'active',
    ...initialData
  });

  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: '',
        images: [''],
        days: '',
        price: 0,
        location: '',
        category: 'domestic',
        overview: '',
        highlights: [''],
        inclusions: [''],
        exclusions: [''],
        itinerary: [{ day: 'Day 1', title: '', description: '' }],
        maxPeople: 10,
        duration: '',
        departureInfo: '',
        minAge: 0,
        featured: false,
        status: 'active',
        ...initialData
      });
    }
  }, [initialData]);

  const handleInputChange = (field: keyof PackageFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'images' | 'highlights' | 'inclusions' | 'exclusions', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'images' | 'highlights' | 'inclusions' | 'exclusions') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'images' | 'highlights' | 'inclusions' | 'exclusions', index: number) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, [field]: newArray }));
    }
  };

  const handleItineraryChange = (index: number, field: keyof ItineraryDay, value: string) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[index] = { ...newItinerary[index], [field]: value };
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const addItineraryDay = () => {
    const dayNumber = formData.itinerary.length + 1;
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { day: `Day ${dayNumber}`, title: '', description: '' }]
    }));
  };

  const removeItineraryDay = (index: number) => {
    if (formData.itinerary.length > 1) {
      const newItinerary = formData.itinerary.filter((_, i) => i !== index);
      // Renumber the days
      const renumberedItinerary = newItinerary.map((item, i) => ({
        ...item,
        day: `Day ${i + 1}`
      }));
      setFormData(prev => ({ ...prev, itinerary: renumberedItinerary }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a package title');
      return;
    }
    
    if (formData.price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    if (!formData.location.trim()) {
      alert('Please enter package location');
      return;
    }

    // Filter out empty strings from arrays
    const cleanedData = {
      ...formData,
      images: formData.images.filter(img => img.trim() !== ''),
      highlights: formData.highlights.filter(item => item.trim() !== ''),
      inclusions: formData.inclusions.filter(item => item.trim() !== ''),
      exclusions: formData.exclusions.filter(item => item.trim() !== ''),
      itinerary: formData.itinerary.filter(item => item.title.trim() !== '' && item.description.trim() !== '')
    };

    await onSubmit(cleanedData);
  };

  const renderArrayInput = (
    field: 'images' | 'highlights' | 'inclusions' | 'exclusions',
    label: string,
    placeholder: string,
    isTextarea: boolean = false
  ) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      {formData[field].map((item, index) => (
        <div key={index} className="flex gap-2">
          {isTextarea ? (
            <Textarea
              value={item}
              onChange={(e) => handleArrayChange(field, index, e.target.value)}
              placeholder={placeholder}
              className="flex-1"
              rows={2}
            />
          ) : (
            <Input
              value={item}
              onChange={(e) => handleArrayChange(field, index, e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => removeArrayItem(field, index)}
            disabled={formData[field].length === 1}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addArrayItem(field)}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add {label.slice(0, -1)}
      </Button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Package Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter package title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value as 'domestic' | 'international')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domestic">Domestic</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Kerala, Goa, Dubai"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="days">Duration *</Label>
                  <Input
                    id="days"
                    value={formData.days}
                    onChange={(e) => handleInputChange('days', e.target.value)}
                    placeholder="e.g., 3N/4D"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    placeholder="Enter price"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="maxPeople">Maximum People</Label>
                  <Input
                    id="maxPeople"
                    type="number"
                    value={formData.maxPeople}
                    onChange={(e) => handleInputChange('maxPeople', Number(e.target.value))}
                    placeholder="Enter max people"
                    min="1"
                  />
                </div>
              </div>

              {renderArrayInput('images', 'Package Images', 'Enter image URL')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="overview">Overview</Label>
                <Textarea
                  id="overview"
                  value={formData.overview}
                  onChange={(e) => handleInputChange('overview', e.target.value)}
                  placeholder="Brief description of the package"
                  rows={4}
                />
              </div>

              {renderArrayInput('highlights', 'Highlights', 'Enter package highlight', true)}
              {renderArrayInput('inclusions', 'Inclusions', 'What\'s included in the package', true)}
              {renderArrayInput('exclusions', 'Exclusions', 'What\'s not included', true)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="itinerary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Day-wise Itinerary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.itinerary.map((day, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{day.day}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItineraryDay(index)}
                      disabled={formData.itinerary.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <Label>Day Title</Label>
                    <Input
                      value={day.title}
                      onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                      placeholder="Enter day title"
                    />
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={day.description}
                      onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                      placeholder="Describe the day's activities"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addItineraryDay}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Day
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Package Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Full Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="e.g., 4 Days, 3 Nights"
                  />
                </div>

                <div>
                  <Label htmlFor="departureInfo">Departure Info</Label>
                  <Input
                    id="departureInfo"
                    value={formData.departureInfo}
                    onChange={(e) => handleInputChange('departureInfo', e.target.value)}
                    placeholder="e.g., Daily departures"
                  />
                </div>

                <div>
                  <Label htmlFor="minAge">Minimum Age</Label>
                  <Input
                    id="minAge"
                    type="number"
                    value={formData.minAge}
                    onChange={(e) => handleInputChange('minAge', Number(e.target.value))}
                    placeholder="Minimum age"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as 'active' | 'inactive')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
                <Label htmlFor="featured">Featured Package</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-travel-blue-dark hover:bg-travel-blue-medium">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
              {initialData ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            initialData ? 'Update Package' : 'Create Package'
          )}
        </Button>
      </div>
    </form>
  );
};

export default PackageForm;
