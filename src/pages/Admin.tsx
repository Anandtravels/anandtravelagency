import { useState, useEffect, useCallback, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { collection, getDocs, orderBy, query, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Checkbox } from "@/components/ui/checkbox";
import { TrashIcon, PencilIcon, Check, X, Phone, Mail, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import debounce from 'lodash/debounce';

const Admin = () => {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State declarations - keep all useState hooks together
  const [bookings, setBookings] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    from: '',
    to: '',
    journey_date: '',
    passengers: '',
    additional_requirements: '',
    booking_type: ''
  });

  // Memoized functions - use useMemo for derived values
  const combinedLoading = useMemo(() => bookingLoading || contactsLoading, [bookingLoading, contactsLoading]);

  // Callbacks - use useCallback for functions passed as props or used in effects
  const debouncedNoteUpdate = useCallback(
    debounce(async (id: string, note: string, collectionName: string) => {
      try {
        await updateDoc(doc(db, collectionName, id), {
          admin_notes: note,
          updated_at: serverTimestamp()
        });
      } catch (error) {
        console.error("Error updating note:", error);
        toast({
          title: "Update Failed",
          description: "Failed to save note",
          variant: "destructive"
        });
      }
    }, 1000),
    [toast]
  );

  const handleNoteChange = useCallback((id: string, note: string) => {
    setAdminNotes(prev => ({
      ...prev,
      [id]: note
    }));
    debouncedNoteUpdate(id, note, 'bookings');
  }, [debouncedNoteUpdate]);

  const handleMessageNoteChange = useCallback((id: string, note: string) => {
    setAdminNotes(prev => ({
      ...prev,
      [id]: note
    }));
    debouncedNoteUpdate(id, note, 'contact_submissions');
  }, [debouncedNoteUpdate]);

  // Effects - keep all useEffect hooks together
  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!user || user.email !== 'admin@anandtravels.com') {
          navigate("/admin-login", { replace: true });
        } else {
          setupRealtimeListeners();
        }
      }
    };
    checkAuth();
  }, [user, loading, navigate]);

  useEffect(() => {
    return () => {
      debouncedNoteUpdate.cancel();
    };
  }, [debouncedNoteUpdate]);

  const formatFirebaseTimestamp = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    if (timestamp.seconds) {
      return format(new Date(timestamp.seconds * 1000), "dd MMM yyyy, HH:mm");
    }
    
    try {
      return format(new Date(timestamp), "dd MMM yyyy, HH:mm");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const setupRealtimeListeners = () => {
    // Set up real-time listener for bookings
    const bookingsQuery = query(
      collection(db, 'bookings'),
      orderBy('created_at', 'desc')
    );

    const bookingsUnsubscribe = onSnapshot(bookingsQuery, 
      (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => {
          const data = doc.data();
          // Update adminNotes state with existing notes
          setAdminNotes(prev => ({
            ...prev,
            [doc.id]: data.admin_notes || ''
          }));
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate() || new Date()
          };
        });
        setBookings(bookingsData);
        setBookingLoading(false);
      },
      (error) => {
        console.error("Error listening to bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load booking data",
          variant: "destructive",
        });
      }
    );

    // Set up real-time listener for contact messages
    const contactsQuery = query(
      collection(db, 'contact_submissions'),
      orderBy('created_at', 'desc')
    );

    const contactsUnsubscribe = onSnapshot(contactsQuery, 
      (snapshot) => {
        const contactsData = snapshot.docs.map(doc => {
          const data = doc.data();
          setAdminNotes(prev => ({
            ...prev,
            [doc.id]: data.admin_notes || ''
          }));
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate() || new Date()
          };
        });
        setContacts(contactsData);
        setContactsLoading(false);
      },
      (error) => {
        console.error("Error listening to contacts:", error);
        toast({
          title: "Error",
          description: "Failed to load contact messages",
          variant: "destructive",
        });
      }
    );

    // Return cleanup function
    return () => {
      bookingsUnsubscribe();
      contactsUnsubscribe();
    };
  };

  if (!user || user.email !== 'admin@anandtravels.com') {
    return null;
  }

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
      navigate("/admin-login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Sign out failed: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'pending' | 'completed') => {
    try {
      // First verify admin auth
      if (!user || user.email !== 'admin@anandtravels.com') {
        throw new Error('Unauthorized access');
      }

      await updateDoc(doc(db, 'bookings', bookingId), { 
        status,
        updated_at: serverTimestamp(),
        updated_by: user.email
      });

      toast({
        title: "Status Updated",
        description: "Booking status has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update booking status. Please check your permissions.",
        variant: "destructive"
      });
    }
  };

  const deleteBookings = async (ids: string[]) => {
    if (!window.confirm('Are you sure you want to delete the selected bookings?')) return;

    try {
      // First verify admin auth
      if (!user || user.email !== 'admin@anandtravels.com') {
        throw new Error('Unauthorized access');
      }

      await Promise.all(ids.map(id => deleteDoc(doc(db, 'bookings', id))));
      setSelectedBookings([]);
      
      toast({
        title: "Deleted Successfully",
        description: "Selected bookings have been deleted",
      });
    } catch (error) {
      console.error("Error deleting bookings:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete bookings. Please check your permissions.",
        variant: "destructive"
      });
    }
  };

  const deleteMessages = async (ids: string[]) => {
    if (!window.confirm('Are you sure you want to delete the selected messages?')) return;

    try {
      if (!user || user.email !== 'admin@anandtravels.com') {
        throw new Error('Unauthorized access');
      }

      await Promise.all(ids.map(id => deleteDoc(doc(db, 'contact_submissions', id))));
      setSelectedMessages([]);
      
      toast({
        title: "Deleted Successfully",
        description: "Selected messages have been deleted",
      });
    } catch (error) {
      console.error("Error deleting messages:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete messages. Please check your permissions.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (booking: any) => {
    setEditingId(booking.id);
    setEditFormData({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      from: booking.from,
      to: booking.to,
      journey_date: booking.journey_date || '',
      passengers: booking.passengers || '',
      additional_requirements: booking.additional_requirements || '',
      booking_type: booking.booking_type || ''  // Add this field
    });
  };

  const handleSaveEdit = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        ...editFormData,
        updated_at: serverTimestamp()
      });
      setEditingId(null);
      toast({
        title: "Changes Saved",
        description: "Booking details have been updated successfully",
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update booking details",
        variant: "destructive"
      });
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsapp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modified header for better mobile layout */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container-custom px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-travel-blue-dark">Admin Dashboard</h1>
              <span className="hidden sm:inline text-sm text-gray-600">
                {user?.email}
              </span>
            </div>
            <Button 
              variant="outline"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container-custom p-4">
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="mb-6 w-full flex">
            <TabsTrigger value="bookings" className="flex-1">Bookings</TabsTrigger>
            <TabsTrigger value="messages" className="flex-1">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-travel-blue-dark">Booking Requests</h2>
                {selectedBookings.length > 0 && (
                  <button
                    onClick={() => deleteBookings(selectedBookings)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <TrashIcon size={16} />
                    Delete Selected ({selectedBookings.length})
                  </button>
                )}
              </div>

              {/* Mobile View for Bookings */}
              <div className="block lg:hidden space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {editingId === booking.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                          className="w-full px-3 py-2 border rounded"
                          placeholder="Name"
                        />
                        <div className="grid grid-cols-1 gap-2">
                          <input
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Email"
                          />
                          <input
                            type="tel"
                            value={editFormData.phone}
                            onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Phone"
                          />
                        </div>
                        <input
                          type="text"
                          value={editFormData.booking_type}
                          onChange={(e) => setEditFormData({...editFormData, booking_type: e.target.value})}
                          className="w-full px-3 py-2 border rounded"
                          placeholder="Service Type"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editFormData.from}
                            onChange={(e) => setEditFormData({...editFormData, from: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="From"
                          />
                          <input
                            type="text"
                            value={editFormData.to}
                            onChange={(e) => setEditFormData({...editFormData, to: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="To"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={editFormData.journey_date}
                            onChange={(e) => setEditFormData({...editFormData, journey_date: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <input
                            type="number"
                            value={editFormData.passengers}
                            onChange={(e) => setEditFormData({...editFormData, passengers: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Passengers"
                          />
                        </div>
                        <textarea
                          value={editFormData.additional_requirements}
                          onChange={(e) => setEditFormData({...editFormData, additional_requirements: e.target.value})}
                          className="w-full px-3 py-2 border rounded"
                          rows={3}
                          placeholder="Additional Requirements"
                        ></textarea>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleSaveEdit(booking.id)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-full"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              checked={selectedBookings.includes(booking.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedBookings([...selectedBookings, booking.id]);
                                } else {
                                  setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
                                }
                              }}
                            />
                            <div>
                              <h3 className="font-medium">{booking.name}</h3>
                              <p className="text-sm text-gray-500">{formatFirebaseTimestamp(booking.created_at)}</p>
                            </div>
                          </div>
                          <select
                            value={booking.status || 'pending'}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value as 'pending' | 'completed')}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              booking.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        <div className="text-sm space-y-2">
                          <p><span className="font-medium">Contact:</span> {booking.email} | {booking.phone}</p>
                          <p><span className="font-medium">Service:</span> {booking.booking_type}</p>
                          <p><span className="font-medium">Journey:</span> {booking.from} to {booking.to}</p>
                          <p><span className="font-medium">Date:</span> {booking.journey_date}</p>
                          <div>
                            <span className="font-medium">Passengers:</span>
                            <div className="ml-2">
                              {Array.isArray(booking.passengers) ? booking.passengers.map((passenger, idx) => (
                                <div key={idx} className="text-sm">
                                  {passenger.name} ({passenger.age} years, {passenger.gender})
                                </div>
                              )) : (
                                <div>{booking.passengers}</div>
                              )}
                            </div>
                          </div>
                          {booking.additional_requirements && (
                            <p><span className="font-medium">Notes:</span> {booking.additional_requirements}</p>
                          )}
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                            <Textarea
                              value={adminNotes[booking.id] || ''}
                              onChange={(e) => handleNoteChange(booking.id, e.target.value)}
                              placeholder="Add notes about this booking..."
                              className="w-full min-h-[100px] text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCall(booking.phone)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                              title="Call"
                            >
                              <Phone size={16} />
                            </button>
                            <button
                              onClick={() => handleWhatsapp(booking.phone)}
                              className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                              title="WhatsApp"
                            >
                              <MessageSquare size={16} />
                            </button>
                            <button
                              onClick={() => handleEmail(booking.email)}
                              className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                              title="Email"
                            >
                              <Mail size={16} />
                            </button>
                          </div>

                          {/* Edit/Delete Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(booking)}
                              className="p-2 hover:bg-gray-200 rounded-full"
                              title="Edit"
                            >
                              <PencilIcon size={16} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => deleteBookings([booking.id])}
                              className="p-2 hover:bg-gray-200 rounded-full"
                              title="Delete"
                            >
                              <TrashIcon size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop View for Bookings */}
              <div className="hidden lg:grid grid-cols-3 gap-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-sm p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={selectedBookings.includes(booking.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBookings([...selectedBookings, booking.id]);
                            } else {
                              setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
                            }
                          }}
                        />
                        <div>
                          <h3 className="font-medium">{booking.name}</h3>
                          <p className="text-sm text-gray-500">{formatFirebaseTimestamp(booking.created_at)}</p>
                        </div>
                      </div>
                      <select
                        value={booking.status || 'pending'}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value as 'pending' | 'completed')}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span>{booking.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span>{booking.email}</span>
                      </div>
                      <div className="border-t border-gray-100 pt-3">
                        <p><span className="font-medium">Service:</span> {booking.booking_type}</p>
                        <p><span className="font-medium">Journey:</span> {booking.from} to {booking.to}</p>
                        <p><span className="font-medium">Date:</span> {booking.journey_date}</p>
                        <div className="mt-2">
                          <span className="font-medium">Passengers:</span>
                          <div className="ml-2 mt-1">
                            {Array.isArray(booking.passengers) ? booking.passengers.map((passenger, idx) => (
                              <div key={idx} className="text-sm bg-gray-50 p-1 rounded mb-1">
                                {passenger.name} ({passenger.age} yrs, {passenger.gender})
                              </div>
                            )) : (
                              <div>{booking.passengers}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3">
                        <Textarea
                          value={adminNotes[booking.id] || ''}
                          onChange={(e) => handleNoteChange(booking.id, e.target.value)}
                          placeholder="Add notes..."
                          className="w-full min-h-[80px] text-sm"
                        />
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCall(booking.phone)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                            title="Call"
                          >
                            <Phone size={16} />
                          </button>
                          <button
                            onClick={() => handleWhatsapp(booking.phone)}
                            className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                            title="WhatsApp"
                          >
                            <MessageSquare size={16} />
                          </button>
                          <button
                            onClick={() => handleEmail(booking.email)}
                            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                            title="Email"
                          >
                            <Mail size={16} />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(booking)}
                            className="p-2 hover:bg-gray-200 rounded-full"
                            title="Edit"
                          >
                            <PencilIcon size={16} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => deleteBookings([booking.id])}
                            className="p-2 hover:bg-gray-200 rounded-full"
                            title="Delete"
                          >
                            <TrashIcon size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-travel-blue-dark">Contact Messages</h2>
                {selectedMessages.length > 0 && (
                  <button
                    onClick={() => deleteMessages(selectedMessages)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <TrashIcon size={16} />
                    Delete Selected ({selectedMessages.length})
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <Checkbox 
                        checked={selectedMessages.includes(contact.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMessages([...selectedMessages, contact.id]);
                          } else {
                            setSelectedMessages(selectedMessages.filter(id => id !== contact.id));
                          }
                        }}
                      />
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                          <div>
                            <h3 className="font-medium text-travel-blue-dark text-lg">
                              {contact.subject || "No Subject"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              From: {contact.name}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600">
                              <a href={`mailto:${contact.email}`} className="hover:text-travel-orange">
                                {contact.email}
                              </a>
                              <span className="hidden sm:inline">•</span>
                              <a href={`tel:${contact.phone}`} className="hover:text-travel-orange">
                                {contact.phone}
                              </a>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {formatFirebaseTimestamp(contact.created_at)}
                            </span>
                            <button
                              onClick={() => deleteMessages([contact.id])}
                              className="p-1 hover:bg-red-100 rounded-full"
                              title="Delete"
                            >
                              <TrashIcon size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded">
                          {contact.message}
                        </p>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                          <Textarea
                            value={adminNotes[contact.id] || ''}
                            onChange={(e) => handleMessageNoteChange(contact.id, e.target.value)}
                            placeholder="Add notes about this message..."
                            className="w-full min-h-[100px] text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
