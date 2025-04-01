import { useState, useEffect } from "react";
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
import { TrashIcon, PencilIcon, Check, X } from "lucide-react";

const Admin = () => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    from: '',
    to: '',
    journey_date: '',
    passengers: '',
    additional_requirements: ''
  });

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
  }, [user, loading]);

  const setupRealtimeListeners = () => {
    // Set up real-time listener for bookings
    const bookingsQuery = query(
      collection(db, 'bookings'),
      orderBy('created_at', 'desc')
    );

    const bookingsUnsubscribe = onSnapshot(bookingsQuery, 
      (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate() || new Date()
        }));
        console.log('Realtime bookings update:', bookingsData);
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
        const contactsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate() || new Date()
        }));
        console.log('Realtime contacts update:', contactsData);
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

  const combinedLoading = bookingLoading || contactsLoading; // overall loading flag

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

  const handleEdit = (booking: any) => {
    setEditingId(booking.id);
    setEditFormData({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      from: booking.from,
      to: booking.to,
      journey_date: booking.journey_date,
      passengers: booking.passengers,
      additional_requirements: booking.additional_requirements || ''
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-travel-blue-dark">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Logged in as: <span className="font-medium">{user.email}</span>
          </span>
          <Button 
            variant="outline"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 pt-8">
        <Tabs defaultValue="bookings">
          <TabsList className="mb-8">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-travel-blue-dark">Booking Requests</h2>
              {selectedBookings.length > 0 && (
                <button
                  onClick={() => deleteBookings(selectedBookings)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <TrashIcon size={16} />
                  Delete Selected ({selectedBookings.length})
                </button>
              )}
            </div>

            {combinedLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent"></div>
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-center py-12 text-gray-500">No booking requests found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox 
                          checked={selectedBookings.length === bookings.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBookings(bookings.map(b => b.id));
                            } else {
                              setSelectedBookings([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[150px]">Name</TableHead>
                      <TableHead className="w-[180px]">Contact</TableHead>
                      <TableHead className="w-[120px]">Service</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="min-w-[400px]">Details</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
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
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatFirebaseTimestamp(booking.created_at)}</TableCell>
                        <TableCell>
                          {editingId === booking.id ? (
                            <input
                              type="text"
                              value={editFormData.name}
                              onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                              className="w-full px-2 py-1 border rounded"
                            />
                          ) : (
                            <span className="font-medium">{booking.name}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === booking.id ? (
                            <div className="space-y-1">
                              <input
                                type="email"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                              />
                              <input
                                type="tel"
                                value={editFormData.phone}
                                onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </div>
                          ) : (
                            <div className="text-sm">
                              <div>{booking.email}</div>
                              <div>{booking.phone}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{booking.booking_type || "N/A"}</TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell className="max-w-[400px]">
                          {editingId === booking.id ? (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={editFormData.from}
                                  onChange={(e) => setEditFormData({...editFormData, from: e.target.value})}
                                  className="w-full px-2 py-1 border rounded"
                                  placeholder="From"
                                />
                                <input
                                  type="text"
                                  value={editFormData.to}
                                  onChange={(e) => setEditFormData({...editFormData, to: e.target.value})}
                                  className="w-full px-2 py-1 border rounded"
                                  placeholder="To"
                                />
                              </div>
                              <input
                                type="date"
                                value={editFormData.journey_date}
                                onChange={(e) => setEditFormData({...editFormData, journey_date: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                              />
                              <input
                                type="number"
                                value={editFormData.passengers}
                                onChange={(e) => setEditFormData({...editFormData, passengers: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                                placeholder="Passengers"
                              />
                              <textarea
                                value={editFormData.additional_requirements}
                                onChange={(e) => setEditFormData({...editFormData, additional_requirements: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                                rows={2}
                                placeholder="Additional Requirements"
                              ></textarea>
                            </div>
                          ) : (
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">From:</span> {booking.from}</p>
                              <p><span className="font-medium">To:</span> {booking.to}</p>
                              <p><span className="font-medium">Travel Date:</span> {booking.journey_date}</p>
                              <p><span className="font-medium">Passengers:</span> {booking.passengers}</p>
                              {booking.additional_requirements && (
                                <p className="text-gray-600">
                                  <span className="font-medium">Note:</span> {booking.additional_requirements}
                                </p>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {editingId === booking.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(booking.id)}
                                  className="p-1 hover:bg-green-100 rounded-full"
                                  title="Save"
                                >
                                  <Check size={16} className="text-green-600" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1 hover:bg-red-100 rounded-full"
                                  title="Cancel"
                                >
                                  <X size={16} className="text-red-600" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(booking)}
                                  className="p-1 hover:bg-gray-100 rounded-full"
                                  title="Edit"
                                >
                                  <PencilIcon size={16} className="text-blue-600" />
                                </button>
                                <button
                                  onClick={() => deleteBookings([booking.id])}
                                  className="p-1 hover:bg-gray-100 rounded-full"
                                  title="Delete"
                                >
                                  <TrashIcon size={16} className="text-red-600" />
                                </button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-travel-blue-dark mb-6">Contact Messages</h2>
            {combinedLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent"></div>
              </div>
            ) : contacts.length === 0 ? (
              <p className="text-center py-12 text-gray-500">No messages found.</p>
            ) : (
              <div className="space-y-6">
                {contacts.map((contact) => (
                  <div key={contact.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-travel-blue-dark">
                          {contact.subject || "No Subject"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          From: {contact.name} ({contact.email})
                        </p>
                        <p className="text-sm text-gray-600">Phone: {contact.phone}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatFirebaseTimestamp(contact.created_at)}
                      </span>
                    </div>
                    <p className="mt-4 text-gray-700 whitespace-pre-line">{contact.message}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
