import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { collection, orderBy, query, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrashIcon } from "lucide-react";
import { debounce } from 'lodash';

interface MessagesManagementTabProps {
  user: any;
  formatFirebaseTimestamp: (timestamp: any) => string;
}

const MessagesManagementTab = ({ user, formatFirebaseTimestamp }: MessagesManagementTabProps) => {
  const { toast } = useToast();

  // Messages-specific state
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});

  // Debounced function for note updates
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

  const handleMessageNoteChange = useCallback((id: string, note: string) => {
    setAdminNotes(prev => ({
      ...prev,
      [id]: note
    }));
    debouncedNoteUpdate(id, note, 'contact_submissions');
  }, [debouncedNoteUpdate]);

  // Delete messages function
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

  // Setup real-time listeners
  useEffect(() => {
    const setupRealtimeListeners = () => {
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

      return contactsUnsubscribe;
    };

    const unsubscribe = setupRealtimeListeners();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      debouncedNoteUpdate.cancel();
    };
  }, [toast, debouncedNoteUpdate]);

  if (contactsLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-travel-blue-dark"></div>
          <span className="ml-3 text-gray-600">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-travel-blue-dark">Contact Messages</h2>
        
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={contacts.length > 0 && selectedMessages.length === contacts.length}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedMessages(contacts.map(c => c.id));
                } else {
                  setSelectedMessages([]);
                }
              }}
              id="select-all-messages"
            />
            <label 
              htmlFor="select-all-messages" 
              className="text-sm font-medium whitespace-nowrap cursor-pointer"
            >
              Select All
            </label>
          </div>
          
          {selectedMessages.length > 0 && (
            <button
              onClick={() => deleteMessages(selectedMessages)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 shadow-sm hover:shadow"
            >
              <TrashIcon size={16} className="animate-pulse" />
              <span className="font-medium">Delete ({selectedMessages.length})</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {contacts.length > 0 ? (
          contacts.map((contact) => (
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
                        className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200 group"
                        title="Delete this message"
                      >
                        <TrashIcon size={16} className="text-gray-500 group-hover:text-red-600 transition-colors duration-200" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded">
                    {contact.message}
                  </p>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Admin Notes</label>
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
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No contact messages found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesManagementTab;
