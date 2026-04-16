import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { submitVisaApplication, VisaFormData } from '@/services/visaService';

export const useVisaForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: VisaFormData) => {
    setIsSubmitting(true);
    
    try {
      const result = await submitVisaApplication(data);
      
      if (result.success) {
        setShowSuccess(true);
        toast({
          title: "Application Submitted Successfully!",
          description: "Our Visa Services team will contact you shortly.",
        });
        // Scroll to top smoothly after successful submission
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "There was an error submitting your application. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in visa form submission:', error);
      toast({
        title: "Submission Failed",
        description: "There was an unexpected error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowSuccess(false);
  };

  return {
    isSubmitting,
    showSuccess,
    handleSubmit,
    resetForm
  };
};
