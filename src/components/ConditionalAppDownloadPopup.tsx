import { useLocation } from 'react-router-dom';
import AppDownloadPopup from './AppDownloadPopup';

interface ConditionalAppDownloadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDismissPermanently: () => void;
}

const ConditionalAppDownloadPopup: React.FC<ConditionalAppDownloadPopupProps> = ({
  isOpen,
  onClose,
  onDismissPermanently
}) => {
  const location = useLocation();
  
  // Don't show popup on admin pages
  const isAdminPage = location.pathname.startsWith('/admin') || 
                     location.pathname.startsWith('/agent');
  
  if (isAdminPage) {
    return null;
  }
  
  return (
    <AppDownloadPopup 
      isOpen={isOpen} 
      onClose={onClose}
      onDismissPermanently={onDismissPermanently}
    />
  );
};

export default ConditionalAppDownloadPopup;
