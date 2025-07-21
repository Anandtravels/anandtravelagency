import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Settings, Bell, MessageSquare, Phone } from 'lucide-react';

interface NotificationSettingsProps {
  user: any;
}

const NotificationSettings = ({ user }: NotificationSettingsProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    whatsappNotifications: true,
    emailNotifications: false,
    smsNotifications: false,
    instantAssignmentNotification: true,
    dailyDigest: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'admin_settings', 'notifications'));
      if (settingsDoc.exists()) {
        setSettings(prev => ({ ...prev, ...settingsDoc.data() }));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!user || user.email !== 'admin@anandtravels.com') {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to change these settings.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'admin_settings', 'notifications'), {
        ...settings,
        updatedAt: new Date(),
        updatedBy: user.email
      });

      toast({
        title: "Settings Saved",
        description: "Notification preferences have been updated successfully."
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save notification settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Settings className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Agent Notification Settings</h1>
          <p className="text-sm text-gray-500">Configure how agents receive assignment notifications</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Assignment Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                WhatsApp Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Send instant WhatsApp messages to agents when bookings are assigned
              </p>
            </div>
            <Switch
              checked={settings.whatsappNotifications}
              onCheckedChange={(value) => handleSettingChange('whatsappNotifications', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Instant Assignment Alert
              </Label>
              <p className="text-sm text-gray-500">
                Send immediate notifications when bookings are assigned
              </p>
            </div>
            <Switch
              checked={settings.instantAssignmentNotification}
              onCheckedChange={(value) => handleSettingChange('instantAssignmentNotification', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Send email notifications for assignment updates
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-gray-500">
                Send SMS alerts for urgent assignments
              </p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(value) => handleSettingChange('smsNotifications', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Daily Digest</Label>
              <p className="text-sm text-gray-500">
                Send daily summary of assignments to agents
              </p>
            </div>
            <Switch
              checked={settings.dailyDigest}
              onCheckedChange={(value) => handleSettingChange('dailyDigest', value)}
            />
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={saveSettings} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>WhatsApp notifications require agents to have valid phone numbers in their profile</span>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>Notifications are sent automatically when bookings are assigned to agents</span>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>Agents can see their assigned bookings in real-time on their dashboard</span>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>Notification settings apply to all agent assignments across the system</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
