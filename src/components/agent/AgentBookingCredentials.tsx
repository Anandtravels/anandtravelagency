import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Copy, Eye, EyeOff, Pencil, Trash2, Key, CheckCircle2 } from "lucide-react";

interface BookingCredential {
  id: string;
  bookingId: string;
  password: string;
  label?: string;
  createdAt: any;
  updatedAt: any;
}

interface AgentBookingCredentialsProps {
  agentEmail: string;
  agentName?: string;
  readOnly?: boolean; // For admin view
}

const AgentBookingCredentials = ({ agentEmail, agentName, readOnly = false }: AgentBookingCredentialsProps) => {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<BookingCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCredential, setEditingCredential] = useState<BookingCredential | null>(null);
  const [formData, setFormData] = useState({
    bookingId: '',
    password: '',
    label: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch credentials for this agent
  useEffect(() => {
    if (!agentEmail) return;

    const credentialsRef = collection(db, 'agent_booking_credentials');
    const q = query(
      credentialsRef,
      where('agentEmail', '==', agentEmail.toLowerCase()),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const credentialsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BookingCredential[];
      setCredentials(credentialsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching credentials:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [agentEmail]);

  const handleAddNew = () => {
    setEditingCredential(null);
    setFormData({ bookingId: '', password: '', label: '' });
    setShowModal(true);
  };

  const handleEdit = (credential: BookingCredential) => {
    setEditingCredential(credential);
    setFormData({
      bookingId: credential.bookingId,
      password: credential.password,
      label: credential.label || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (credentialId: string) => {
    if (!window.confirm('Are you sure you want to delete this booking credential?')) return;

    try {
      await deleteDoc(doc(db, 'agent_booking_credentials', credentialId));
      toast({
        title: "Deleted",
        description: "Booking credential has been deleted successfully."
      });
    } catch (error) {
      console.error("Error deleting credential:", error);
      toast({
        title: "Error",
        description: "Failed to delete credential",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bookingId.trim() || !formData.password.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both Booking ID and Password",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingCredential) {
        // Update existing
        await updateDoc(doc(db, 'agent_booking_credentials', editingCredential.id), {
          bookingId: formData.bookingId.trim(),
          password: formData.password.trim(),
          label: formData.label.trim() || null,
          updatedAt: serverTimestamp()
        });
        toast({
          title: "Updated",
          description: "Booking credential has been updated successfully."
        });
      } else {
        // Create new
        await addDoc(collection(db, 'agent_booking_credentials'), {
          agentEmail: agentEmail.toLowerCase(),
          bookingId: formData.bookingId.trim(),
          password: formData.password.trim(),
          label: formData.label.trim() || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast({
          title: "Saved",
          description: "New booking credential has been saved successfully."
        });
      }

      setShowModal(false);
      setEditingCredential(null);
      setFormData({ bookingId: '', password: '', label: '' });
    } catch (error) {
      console.error("Error saving credential:", error);
      toast({
        title: "Error",
        description: "Failed to save credential",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordVisibility = (credentialId: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(credentialId)) {
        newSet.delete(credentialId);
      } else {
        newSet.add(credentialId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy manually",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Key className="w-5 h-5 text-travel-blue-dark" />
            {readOnly && agentName ? `${agentName}'s Booking IDs` : 'My Booking IDs & Passwords'}
          </CardTitle>
          {!readOnly && (
            <Button onClick={handleAddNew} size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Add New
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {credentials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No booking credentials saved yet.</p>
              {!readOnly && (
                <p className="text-xs mt-1">Click "Add New" to save your first booking ID and password.</p>
              )}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {credentials.map((credential) => (
                <div 
                  key={credential.id} 
                  className="bg-gradient-to-br from-gray-50 to-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {credential.label && (
                    <p className="text-xs font-medium text-travel-blue-dark mb-2 uppercase tracking-wide">
                      {credential.label}
                    </p>
                  )}
                  
                  {/* Booking ID */}
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 block mb-1">Booking ID</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-blue-50 px-3 py-2 rounded text-sm font-mono text-blue-800 truncate">
                        {credential.bookingId}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(credential.bookingId, `ID-${credential.id}`)}
                        className="h-8 w-8 p-0 shrink-0"
                        title="Copy Booking ID"
                      >
                        {copiedField === `ID-${credential.id}` ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 block mb-1">Password</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-amber-50 px-3 py-2 rounded text-sm font-mono text-amber-800 truncate">
                        {visiblePasswords.has(credential.id) ? credential.password : '••••••••'}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility(credential.id)}
                        className="h-8 w-8 p-0 shrink-0"
                        title={visiblePasswords.has(credential.id) ? "Hide Password" : "Show Password"}
                      >
                        {visiblePasswords.has(credential.id) ? (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(credential.password, `PWD-${credential.id}`)}
                        className="h-8 w-8 p-0 shrink-0"
                        title="Copy Password"
                      >
                        {copiedField === `PWD-${credential.id}` ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  {!readOnly && (
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(credential)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(credential.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCredential ? 'Edit Booking Credential' : 'Add New Booking Credential'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="label" className="text-sm font-medium">
                Label (Optional)
              </Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., IRCTC Main, IRCTC Agent 2"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">A friendly name to identify this account</p>
            </div>
            <div>
              <Label htmlFor="bookingId" className="text-sm font-medium">
                Booking ID / Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bookingId"
                value={formData.bookingId}
                onChange={(e) => setFormData(prev => ({ ...prev, bookingId: e.target.value }))}
                placeholder="e.g., IRCTC Username"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="text"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
                className="mt-1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ This password will be stored securely and visible only to you and admin.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setEditingCredential(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : (editingCredential ? 'Update' : 'Save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentBookingCredentials;
