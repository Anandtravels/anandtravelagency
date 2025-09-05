import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminData } from "@/hooks/useAdminData";
import { useBookingManagement } from "@/hooks/useBookingManagement";
import { useTicketAssignment } from "@/hooks/useTicketAssignment";
import { useEditBookingModal } from "@/hooks/use-edit-booking-modal";
import { useWhatsAppModal } from "@/hooks/use-whatsapp-modal";
import { useAdminNavigation } from "@/hooks/useAdminNavigation";
import { formatFirebaseTimestamp } from "@/utils/adminHelpers";
import AdminLayout from "@/components/admin/AdminLayout";
import WhatsAppMessageModal from "@/components/admin/WhatsAppMessageModal";
import EditBookingModal from "@/components/admin/EditBookingModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingsTab from "@/components/BookingsTab";
import PackageBookingsTab from "@/components/PackageBookingsTab";
import MessagesManagementTab from "@/components/MessagesManagementTab";
import AgentManagementTab from "@/components/AgentManagementTab";
import EServicesManagementTab from "@/components/EServicesManagementTab";
import VisaApplicationsTab from "@/components/admin/VisaApplicationsTab";
import PackageManagementTab from "@/components/admin/PackageManagementTab";
import VisitorAnalytics from "@/components/admin/VisitorAnalytics";
import HotelBookingsTab from "@/components/admin/HotelBookingsTab";
import HotelManagementTab from "@/components/admin/HotelManagementTab";
import HotelAgentsTab from "@/components/admin/HotelAgentsTab";
import { BarChart3 } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, handleSignOut } = useAdminAuth();
  const { bookings, agents, loading: dataLoading, adminNotes, setAdminNotes } = useAdminData();
  const { updateBookingStatus, deleteBookings, handleNoteChange, debouncedNoteUpdate } = useBookingManagement(setAdminNotes);
  const { assignTicket, assignPackageTicket } = useTicketAssignment(bookings, agents);
  const { editModalOpen, setEditModalOpen, editBooking, editFormData, setEditFormData, openEditModal, handleSaveEdit } = useEditBookingModal();
  const { whatsappModal, setWhatsappModal, currentBooking, messageDetails, setMessageDetails, handleWhatsapp, sendWhatsappMessage } = useWhatsAppModal();
  const { activeTab, handleTabChange } = useAdminNavigation();

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.email !== 'admin@anandtravels.com') {
        navigate("/admin-login", { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    return () => {
      debouncedNoteUpdate.cancel();
    };
  }, [debouncedNoteUpdate]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  if (authLoading || !user || user.email !== 'admin@anandtravels.com') {
    return null; // Or a loading spinner
  }

  return (
    <AdminLayout userEmail={user?.email} onSignOut={handleSignOut}>
      {/* Show Dashboard/Analytics when no hash or empty hash */}
      {(!location.hash || location.hash === '') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Overview and analytics</p>
                </div>
              </div>
            </div>
          </div>
          <VisitorAnalytics />
        </div>
      )}

      {/* Show tab content when hash is present */}
      {location.hash && (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-full">
          <TabsContent value="bookings" className="space-y-6">
            <BookingsTab
              user={user}
              bookings={bookings}
              bookingLoading={dataLoading}
              adminNotes={adminNotes}
              setAdminNotes={setAdminNotes}
              agents={agents}
              formatFirebaseTimestamp={formatFirebaseTimestamp}
              handleNoteChange={handleNoteChange}
              updateBookingStatus={updateBookingStatus}
              deleteBookings={deleteBookings}
              openEditModal={openEditModal}
              handleCall={handleCall}
              handleEmail={handleEmail}
              handleWhatsapp={handleWhatsapp}
              assignTicket={assignTicket}
            />
          </TabsContent>

          <TabsContent value="package-bookings" className="space-y-6">
            <PackageBookingsTab
              user={user}
              agents={agents}
              adminNotes={adminNotes}
              setAdminNotes={setAdminNotes}
              handleCall={handleCall}
              handleEmail={handleEmail}
              handleWhatsapp={handleWhatsapp}
              formatFirebaseTimestamp={formatFirebaseTimestamp}
              assignPackageTicket={assignPackageTicket}
            />
          </TabsContent>

          <TabsContent value="package-management" className="space-y-6">
            <PackageManagementTab 
              user={user}
            />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <MessagesManagementTab 
              user={user} 
              formatFirebaseTimestamp={formatFirebaseTimestamp}
            />
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <AgentManagementTab 
              user={user} 
              formatFirebaseTimestamp={formatFirebaseTimestamp}
            />
          </TabsContent>

          <TabsContent value="eservices" className="space-y-6">
            <EServicesManagementTab 
              user={user} 
              formatFirebaseTimestamp={formatFirebaseTimestamp}
            />
          </TabsContent>

          <TabsContent value="visa-applications" className="space-y-6">
            <VisaApplicationsTab 
              user={user} 
              formatFirebaseTimestamp={formatFirebaseTimestamp}
            />
          </TabsContent>

          <TabsContent value="hotel-bookings" className="space-y-6">
            <HotelBookingsTab 
              user={user}
            />
          </TabsContent>

          <TabsContent value="hotel-management" className="space-y-6">
            <HotelManagementTab 
              user={user}
            />
          </TabsContent>

          <TabsContent value="hotel-agents" className="space-y-6">
            <HotelAgentsTab 
              user={user}
            />
          </TabsContent>
        </Tabs>
      )}

      <WhatsAppMessageModal
        isOpen={whatsappModal}
        onOpenChange={setWhatsappModal}
        currentBooking={currentBooking}
        messageDetails={messageDetails}
        setMessageDetails={setMessageDetails}
        onSendMessage={sendWhatsappMessage}
      />

      <EditBookingModal
        isOpen={editModalOpen}
        onOpenChange={setEditModalOpen}
        booking={editBooking}
        formData={editFormData}
        onFormChange={(e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value })}
        onSave={handleSaveEdit}
      />
    </AdminLayout>
  );
};

export default Admin;