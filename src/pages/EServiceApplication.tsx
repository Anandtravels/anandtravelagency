import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, FileText, CheckCircle } from "lucide-react";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { sendPushNotification } from "@/utils/sendPushNotification";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { EServiceFormData } from "@/types/eservices";
import { useDynamicEServiceTypes } from "@/hooks/useDynamicEServiceTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import PaymentInstructions from "@/components/PaymentInstructions";

const EServiceApplication = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { serviceTypes, getServiceType, isLoaded } = useDynamicEServiceTypes();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EServiceFormData>();

  const service = serviceType && isLoaded ? getServiceType(serviceType) : null;

  // Check if service is inactive
  if (service && service.isActive === false) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-2xl mx-auto bg-red-50 p-8 rounded-lg text-center">
            <h1 className="text-2xl font-bold text-red-700 mb-4">Service Temporarily Unavailable</h1>
            <p className="text-gray-700 mb-6">
              This service is currently inactive. Please check back later or contact us for more information.
            </p>
            <Button onClick={() => navigate('/eservices')}>
              Back to E-Services
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-travel-blue-dark"></div>
          <p className="mt-2 text-gray-600">Loading service...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <Button onClick={() => navigate('/eservices')}>
            Back to E-Services
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: EServiceFormData) => {
    setIsSubmitting(true);
    try {
      const requestData = {
        ...data,
        serviceType,
        status: 'pending',
        created_at: serverTimestamp(),
        documents: uploadedFiles.map(file => ({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        }))
      };

      await addDoc(collection(db, 'eservice_requests'), requestData);

      // Send push notification to admin
      sendPushNotification('new_eservice_request', {
        name: data.name || data.fullName || 'Customer',
        serviceType
      });

      toast({
        title: "Application Submitted Successfully!",
        description: "We'll contact you within 24 hours to confirm your application.",
      });

      navigate('/eservices/success');
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const renderServiceSpecificFields = () => {
    switch (serviceType) {
      case 'pan_card':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fatherName">Father's Name *</Label>
                <Input
                  id="fatherName"
                  {...register('requestDetails.fatherName', { required: 'Father\'s name is required' })}
                  className="mt-1"
                />
                {errors.requestDetails?.fatherName && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.requestDetails.fatherName.message)}</p>
                )}
              </div>
              <div>
                <Label htmlFor="panCardType">PAN Card Type *</Label>
                <Select onValueChange={(value) => setValue('requestDetails.panCardType', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select PAN card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="huf">HUF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'passport':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="passportType">Passport Type *</Label>
                <Select onValueChange={(value) => setValue('requestDetails.passportType', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select passport type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ordinary">Ordinary</SelectItem>
                    <SelectItem value="diplomatic">Diplomatic</SelectItem>
                    <SelectItem value="official">Official</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="placeOfBirth">Place of Birth *</Label>
                <Input
                  id="placeOfBirth"
                  {...register('requestDetails.placeOfBirth', { required: 'Place of birth is required' })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                {...register('requestDetails.emergencyContact')}
                className="mt-1"
                placeholder="Emergency contact number"
              />
            </div>
          </div>
        );

      case 'aadhaar_pvc':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
              <Input
                id="aadhaarNumber"
                {...register('requestDetails.aadhaarNumber', { 
                  required: 'Aadhaar number is required',
                  pattern: {
                    value: /^\d{12}$/,
                    message: 'Please enter a valid 12-digit Aadhaar number'
                  }
                })}
                className="mt-1"
                placeholder="Enter 12-digit Aadhaar number"
                maxLength={12}
              />
              {errors.requestDetails?.aadhaarNumber && (
                <p className="text-red-500 text-sm mt-1">{String(errors.requestDetails.aadhaarNumber.message)}</p>
              )}
            </div>
          </div>
        );

      case 'fd_credit_card':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="bankPreference">Preferred Bank</Label>
                <Input
                  id="bankPreference"
                  {...register('requestDetails.bankPreference')}
                  className="mt-1"
                  placeholder="e.g., SBI, HDFC, ICICI"
                />
              </div>
              <div>
                <Label htmlFor="cardType">Service Type *</Label>
                <Select onValueChange={(value) => setValue('requestDetails.cardType', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed_deposit">Fixed Deposit</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="both">Both FD & Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="employmentType">Employment Type *</Label>
                <Select onValueChange={(value) => setValue('requestDetails.employmentType', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salaried">Salaried</SelectItem>
                    <SelectItem value="self_employed">Self Employed</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="monthlyIncome">Monthly Income</Label>
                <Input
                  id="monthlyIncome"
                  {...register('requestDetails.monthlyIncome')}
                  className="mt-1"
                  placeholder="e.g., 50,000"
                />
              </div>
            </div>
          </div>
        );

      case 'bank_account':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="accountType">Account Type *</Label>
                <Select onValueChange={(value) => setValue('requestDetails.accountType', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="current">Current Account</SelectItem>
                    <SelectItem value="salary">Salary Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="initialDeposit">Initial Deposit Amount</Label>
                <Input
                  id="initialDeposit"
                  {...register('requestDetails.initialDeposit')}
                  className="mt-1"
                  placeholder="e.g., 10,000"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nomineeName">Nominee Name</Label>
                <Input
                  id="nomineeName"
                  {...register('requestDetails.nomineeName')}
                  className="mt-1"
                  placeholder="Full name of nominee"
                />
              </div>
              <div>
                <Label htmlFor="nomineeRelation">Nominee Relation</Label>
                <Input
                  id="nomineeRelation"
                  {...register('requestDetails.nomineeRelation')}
                  className="mt-1"
                  placeholder="e.g., Spouse, Child, Parent"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container-custom max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/eservices')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to E-Services
            </Button>
            
            <Card>
              <CardHeader className="bg-gradient-to-r from-travel-blue-dark to-blue-600 text-white">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{service.icon}</div>
                  <div>
                    <CardTitle className="text-2xl">{service.label}</CardTitle>
                    <p className="text-blue-100">{service.description}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white font-medium
                    ${currentStep >= step ? 'bg-travel-blue-dark' : 'bg-gray-300'}
                  `}>
                    {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-travel-blue-dark' : 'bg-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Personal Details</span>
              <span>Service Details</span>
              <span>Documents & Submit</span>
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardContent className="p-6">
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-travel-blue-dark mb-6">
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          {...register('name', { required: 'Name is required' })}
                          className="mt-1"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          })}
                          className="mt-1"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          {...register('phone', { 
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[6-9]\d{9}$/,
                              message: 'Please enter a valid 10-digit mobile number'
                            }
                          })}
                          className="mt-1"
                          placeholder="10-digit mobile number"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          {...register('requestDetails.dateOfBirth')}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        {...register('requestDetails.address')}
                        className="mt-1"
                        rows={3}
                        placeholder="Enter your complete address"
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-travel-blue-dark mb-6">
                      Service Details
                    </h3>
                    {renderServiceSpecificFields()}
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-travel-blue-dark mb-6">
                      Document Upload
                    </h3>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-travel-blue-dark mb-2">Required Documents:</h4>
                      <ul className="space-y-1">
                        {service.documents.map((doc, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-700 mb-2">Upload Documents</h4>
                      <p className="text-gray-500 mb-4">
                        Drag and drop files here or click to browse
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button type="button" className="cursor-pointer">
                          Choose Files
                        </Button>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Uploaded Files:</h4>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{file.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Payment Instructions */}
                    <div className="mt-6">
                      <Card className="border-blue-200 bg-blue-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-5 h-5" />
                            Payment Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-sm text-blue-700">
                              <span className="font-bold text-base">Service Fee: </span>
                              <span className="font-semibold text-base">{service.fee}</span>
                            </p>
                            {!service.fee.toLowerCase().includes('free') && (
                              <div className="text-sm text-blue-700">
                                <p>Please make payment after submitting your application. Our team will contact you with payment instructions.</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Previous
                    </Button>
                  )}
                  
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="ml-auto"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="ml-auto"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EServiceApplication;
