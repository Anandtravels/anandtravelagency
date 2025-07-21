import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, DollarSign, Settings, AlertCircle, Clock, User } from 'lucide-react';
import { useEServiceFeeManagement } from '@/hooks/useEServiceFeeManagement';
import { E_SERVICE_TYPES } from '@/types/eservices';

interface EServiceFeeManagementProps {
  user: any;
  formatFirebaseTimestamp: (timestamp: any) => string;
}

const EServiceFeeManagement = ({ user, formatFirebaseTimestamp }: EServiceFeeManagementProps) => {
  const { toast } = useToast();
  const {
    feeSettings,
    loading,
    updateServiceFee,
    updateAllFees,
    toggleServiceStatus,
    getServiceFee,
    isServiceActive
  } = useEServiceFeeManagement();

  const [editingFees, setEditingFees] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize editing state with current fees
  const initializeEditing = () => {
    const currentFees: Record<string, string> = {};
    Object.keys(E_SERVICE_TYPES).forEach(serviceType => {
      currentFees[serviceType] = getServiceFee(serviceType);
    });
    setEditingFees(currentFees);
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingFees({});
    setIsEditing(false);
  };

  // Save all changes
  const saveChanges = async () => {
    if (!user || user.email !== 'admin@anandtravels.com') {
      toast({
        title: 'Unauthorized',
        description: 'You do not have permission to update fees',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log('Updating all fees:', editingFees);
      await updateAllFees(editingFees, user.email);
      setIsEditing(false);
      setEditingFees({});
      
      toast({
        title: 'Success',
        description: 'Service fees updated successfully',
      });
    } catch (error) {
      console.error('Error saving fees:', error);
      toast({
        title: 'Error',
        description: 'Failed to update service fees. Check console for details.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle fee change
  const handleFeeChange = (serviceType: string, newFee: string) => {
    setEditingFees(prev => ({
      ...prev,
      [serviceType]: newFee
    }));
  };

  // Handle service status toggle
  const handleStatusToggle = async (serviceType: string, isActive: boolean) => {
    if (!user || user.email !== 'admin@anandtravels.com') {
      toast({
        title: 'Unauthorized',
        description: 'You do not have permission to update service status',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log(`Toggling service status for ${serviceType} to ${isActive ? 'active' : 'inactive'}`);
      await toggleServiceStatus(serviceType, isActive, user.email);
      toast({
        title: 'Success',
        description: `Service ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update service status. Check console for details.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent"></div>
        <span className="ml-2">Loading fee settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-travel-blue-dark" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">E-Service Fee Management</h2>
            <p className="text-gray-600">Set and manage fees for all E-Service applications</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={initializeEditing} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Edit Fees
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button 
                onClick={saveChanges} 
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Important Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-orange-800">Important Notice</h3>
              <p className="text-sm text-orange-700 mt-1">
                Changes to service fees will be immediately reflected on the website and all new applications. 
                Existing applications will retain their original fee structure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Fee Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(E_SERVICE_TYPES).map(([serviceType, serviceInfo]) => {
          const isActive = isServiceActive(serviceType);
          const currentFee = isEditing ? editingFees[serviceType] : getServiceFee(serviceType);
          const settings = feeSettings[serviceType];

          return (
            <Card key={serviceType} className={`${!isActive ? 'opacity-60' : ''} border-2 hover:border-travel-blue-dark transition-colors`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{serviceInfo.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{serviceInfo.label}</CardTitle>
                      <CardDescription className="text-sm">{serviceInfo.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={isActive ? "default" : "secondary"}>
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Switch
                      checked={isActive}
                      onCheckedChange={(checked) => handleStatusToggle(serviceType, checked)}
                      disabled={!user || user.email !== 'admin@anandtravels.com'}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Current Fee */}
                <div>
                  <Label className="text-sm font-medium">Service Fee</Label>
                  {isEditing ? (
                    <Textarea
                      value={currentFee || ''}
                      onChange={(e) => handleFeeChange(serviceType, e.target.value)}
                      placeholder="Enter service fee (e.g., ₹500 or As per bank charges)"
                      className="mt-1 min-h-[80px] resize-none"
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded border">
                      <p className="font-medium text-travel-blue-dark">{currentFee}</p>
                    </div>
                  )}
                </div>

                {/* Additional Service Info */}
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <div><strong>Processing Time:</strong> {serviceInfo.estimatedTime}</div>
                  <div><strong>Required Docs:</strong> {serviceInfo.documents.slice(0, 2).join(', ')}
                    {serviceInfo.documents.length > 2 && ` +${serviceInfo.documents.length - 2} more`}
                  </div>
                </div>

                {/* Last Updated Info */}
                {settings?.lastUpdated && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Updated: {formatFirebaseTimestamp(settings.lastUpdated)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>By: {settings.updatedBy}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      {isEditing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h3 className="font-medium text-blue-800">Quick Fee Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    Object.keys(E_SERVICE_TYPES).forEach(serviceType => {
                      if (serviceType.includes('bank') || serviceType.includes('fd')) {
                        handleFeeChange(serviceType, 'As per bank charges');
                      }
                    });
                  }}
                  className="text-blue-700 border-blue-300"
                >
                  Set Bank Services: "As per bank charges"
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleFeeChange('pan_card', '₹107 (New) / ₹107 (Reissue)');
                    handleFeeChange('aadhaar_pvc', '₹50');
                  }}
                  className="text-blue-700 border-blue-300"
                >
                  Reset Government Fees
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleFeeChange('passport', '₹1,500 (36 pages) / ₹2,000 (60 pages)');
                  }}
                  className="text-blue-700 border-blue-300"
                >
                  Reset Passport Fees
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Settings className="h-5 w-5" />
            Fee Setting Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="space-y-2 text-sm">
            <li>• Use clear, specific fee amounts (e.g., "₹107" instead of just "107")</li>
            <li>• For variable fees, use descriptive text (e.g., "As per bank charges")</li>
            <li>• Include multiple fee tiers if applicable (e.g., "₹1,500 (36 pages) / ₹2,000 (60 pages)")</li>
            <li>• Changes take effect immediately across the website</li>
            <li>• All fee changes are logged with timestamps</li>
            <li>• Use the status toggle to activate/deactivate services as needed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default EServiceFeeManagement;
