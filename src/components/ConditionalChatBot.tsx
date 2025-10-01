import { useLocation } from 'react-router-dom';
import ChatBot from './ChatBot';

const ConditionalChatBot: React.FC = () => {
  const location = useLocation();
  
  // Don't show chatbot on admin pages
  const isAdminPage = location.pathname.startsWith('/admin') || 
                     location.pathname.startsWith('/agent');
  
  if (isAdminPage) {
    return null;
  }
  
  return <ChatBot />;
};

export default ConditionalChatBot;
