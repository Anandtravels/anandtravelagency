import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Undo2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onUndo: () => void;
  title: string;
  description: string;
  count?: number;
}

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  onUndo,
  title,
  description,
  count = 1
}: DeleteConfirmationModalProps) => {
  const [showUndo, setShowUndo] = useState(false);
  const [undoTimer, setUndoTimer] = useState(5);

  useEffect(() => {
    if (showUndo && undoTimer > 0) {
      const timer = setTimeout(() => setUndoTimer(undoTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showUndo && undoTimer === 0) {
      // Auto-close after undo period expires
      handleClose();
    }
  }, [showUndo, undoTimer]);

  const handleConfirm = () => {
    setShowUndo(true);
    setUndoTimer(5);
    onConfirm();
  };

  const handleUndo = () => {
    onUndo();
    handleClose();
  };

  const handleClose = () => {
    setShowUndo(false);
    setUndoTimer(5);
    onClose();
  };

  return (
    <>
      {/* Confirmation Dialog */}
      <Dialog open={isOpen && !showUndo} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {title}
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-base text-gray-600 pt-2">
              {description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-amber-800 font-medium">
              ⚠️ This action cannot be undone after 5 seconds!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11 text-base font-medium"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              className="flex-1 h-11 text-base font-medium bg-red-600 hover:bg-red-700"
            >
              Yes, Delete {count > 1 ? `(${count})` : ''}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Undo Toast Notification */}
      {showUndo && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-md px-4 sm:px-0">
          <div className="bg-gray-900 text-white rounded-lg shadow-2xl p-4 border border-gray-700 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-green-500 rounded-full">
                  <X className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base">
                    {count > 1 ? `${count} bookings` : 'Booking'} deleted
                  </p>
                  <p className="text-sm text-gray-300">
                    Auto-closing in {undoTimer}s...
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleUndo}
                  className="h-9 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium"
                >
                  <Undo2 className="h-4 w-4 mr-1" />
                  Undo
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClose}
                  className="h-9 w-9 p-0 hover:bg-white/10 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(undoTimer / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
