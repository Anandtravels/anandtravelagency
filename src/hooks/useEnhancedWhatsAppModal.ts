import { useState } from 'react';
import { Booking, MessageDetails } from '@/types/admin';
import { Bill } from '@/types/upi';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { generateUPIQRCode } from '@/utils/qrCodeUtils';
import { uploadQRCodeToCloudinary } from '@/utils/cloudinaryUpload';
import { generateBillNumber } from '@/utils/billUtils';
import { useToast } from '@/hooks/use-toast';

export const useEnhancedWhatsAppModal = (userEmail?: string) => {
  const [whatsappModal, setWhatsappModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  
  const [messageDetails, setMessageDetails] = useState<MessageDetails>({
    ticketCost: '', bookingCharge: '', totalAmount: '', additionalInfo: '',
    bookingType: 'General Booking', passengerCount: 1, couponCode: '',
    couponDiscount: 0, couponType: null
  });

  const handleWhatsapp = (phone: string, booking?: Booking) => {
    if (booking) {
      setCurrentBooking(booking);
      setWhatsappModal(true);
      
      const initialBookingType = (() => {
        if (booking.booking_type === 'train' && booking.train_booking_type) {
          switch (booking.train_booking_type) {
            case 'general': return 'General Booking';
            case 'tatkal': return 'Tatkal Booking';
            case 'premium_tatkal': return 'Premium Booking';
            default: return booking.train_booking_type;
          }
        }
        return booking.booking_type ? 
          booking.booking_type.charAt(0).toUpperCase() + booking.booking_type.slice(1) + ' Booking' 
          : 'General Booking';
      })();
      
      let initialPassengerCount = Array.isArray(booking.passengers) ? booking.passengers.length : 1;
      const initialBookingCharge = calculateBookingCharge(initialBookingType, 0);

      if (booking.coupon) {
        setMessageDetails({
          ticketCost: '',
          bookingCharge: initialBookingCharge.toString(),
          totalAmount: '',
          additionalInfo: '',
          bookingType: initialBookingType,
          passengerCount: initialPassengerCount,
          couponCode: booking.coupon.code,
          couponDiscount: booking.coupon.discount,
          couponType: booking.coupon.type
        });
      } else {
        setMessageDetails({
          ticketCost: '',
          bookingCharge: initialBookingCharge.toString(),
          totalAmount: '',
          additionalInfo: '',
          bookingType: initialBookingType,
          passengerCount: initialPassengerCount,
          couponCode: '',
          couponDiscount: 0,
          couponType: null
        });
      }
    } else {
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  const calculateBookingCharge = (bookingType: string, ticketCost: number): number => {
    switch(bookingType) {
      case 'Tatkal Booking': return 200;
      case 'Premium Booking': return 250;
      case 'General Booking': default: return 50;
    }
  };

  const calculateTotalAmount = (): number => {
    const ticketCost = parseFloat(messageDetails.ticketCost) || 0;
    const bookingCharge = parseFloat(messageDetails.bookingCharge) || 0;
    const passengerCount = messageDetails.passengerCount || 1;
    
    const totalTicketCost = ticketCost * passengerCount;
    const totalBookingCharge = bookingCharge * passengerCount;
    
    let finalBookingCharge = totalBookingCharge;
    
    if (messageDetails.couponCode && messageDetails.couponDiscount > 0) {
      const discountAmount = messageDetails.couponType === 'percentage' 
        ? (totalBookingCharge * messageDetails.couponDiscount / 100)
        : messageDetails.couponDiscount;
      finalBookingCharge = Math.max(0, totalBookingCharge - discountAmount);
    }
    
    return totalTicketCost + finalBookingCharge;
  };

  const sendWhatsappMessage = async () => {
    if (!currentBooking || !userEmail) return;
    
    setSending(true);
    
    try {
      // 1. Fetch UPI settings
      const upiSettingsDoc = await getDoc(doc(db, 'admin_settings', 'upi_settings'));
      const upiSettings = upiSettingsDoc.exists() ? upiSettingsDoc.data() : null;
      
      const upiId = upiSettings?.upiId || '8985816481@paytm';
      const accountName = upiSettings?.accountHolderName || 'Pinisetty Naga Satya Surya Shiva Anand';
      const paymentPhone = upiSettings?.paymentPhone || '8985816481';
      
      // 2. Calculate totals
      const totalAmount = calculateTotalAmount();
      const billNumber = generateBillNumber();
      
      // 3. Generate dynamic QR code WITH amount pre-filled
      let qrCodeDataUrl = '';
      let qrCodeCloudinaryUrl = '';
      let useLocalQR = false;
      
      try {
        // Generate QR with amount pre-filled for instant payment
        qrCodeDataUrl = await generateUPIQRCode(
          upiId,
          accountName,
          totalAmount,
          `Bill ${billNumber} - ${currentBooking.from} to ${currentBooking.to}`
        );
        
        console.log('QR code generated successfully');
        
        // Try to upload QR to Cloudinary and get public URL
        try {
          qrCodeCloudinaryUrl = await uploadQRCodeToCloudinary(qrCodeDataUrl, billNumber);
          console.log('QR uploaded to Cloudinary:', qrCodeCloudinaryUrl);
        } catch (uploadError: any) {
          console.warn('Cloudinary upload failed, using local QR display:', uploadError.message);
          useLocalQR = true;
          
          // Show helpful message to admin
          toast({
            title: 'QR Code Ready',
            description: 'QR generated successfully. Will open in popup for manual sharing.',
            variant: 'default'
          });
        }
      } catch (error) {
        console.error('QR generation error:', error);
        toast({
          title: 'Warning',
          description: 'QR code generation failed. Continuing with text message only.',
          variant: 'default'
        });
        // Continue without QR if it fails
      }
      
      // 4. Create bill record in Firebase
      const ticketCost = parseFloat(messageDetails.ticketCost) || 0;
      const bookingCharge = parseFloat(messageDetails.bookingCharge) || 0;
      
      // Build bill data object - only include optional fields if they have values
      const billData: any = {
        billNumber,
        bookingId: currentBooking.id,
        customerName: currentBooking.name,
        customerPhone: currentBooking.phone,
        serviceType: currentBooking.booking_type || 'train',
        bookingType: messageDetails.bookingType,
        passengerCount: messageDetails.passengerCount,
        ticketCost,
        bookingCharge,
        totalAmount,
        createdAt: serverTimestamp(),
        createdBy: userEmail
      };
      
      // Add optional fields only if they have values (Firestore doesn't accept undefined)
      if (currentBooking.email) {
        billData.customerEmail = currentBooking.email;
      }
      if (currentBooking.from) {
        billData.journeyFrom = currentBooking.from;
      }
      if (currentBooking.to) {
        billData.journeyTo = currentBooking.to;
      }
      if (currentBooking.journey_date) {
        billData.journeyDate = currentBooking.journey_date;
      }
      if (messageDetails.couponCode && messageDetails.couponCode.trim() !== '') {
        billData.couponCode = messageDetails.couponCode;
      }
      if (messageDetails.couponDiscount && messageDetails.couponDiscount > 0) {
        billData.couponDiscount = messageDetails.couponDiscount;
      }
      if (qrCodeCloudinaryUrl) {
        billData.qrCodeUrl = qrCodeCloudinaryUrl; // Store Cloudinary URL
      }
      
      await addDoc(collection(db, 'bills'), billData);
      
      // 5. Format passenger info
      const formatPassengerInfo = () => {
        if (Array.isArray(currentBooking.passengers)) {
          let info = `*Passengers:* ${currentBooking.passengers.length}\n`;
          currentBooking.passengers.forEach((p: any, i: number) => {
            info += `   ${i + 1}. ${p.name} (${p.age} yrs, ${p.gender})`;
            if (p.dob) {
              try {
                const date = new Date(p.dob);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                info += ` - DOB: ${day}/${month}/${year}`;
              } catch (e) {
                // Skip DOB if parsing fails
              }
            }
            info += '\n';
          });
          return info;
        }
        return `*Passengers:* ${currentBooking.passengers}\n`;
      };

      // 6. Build pricing details
      const passengerInfo = formatPassengerInfo();
      
      let pricingDetails = 
`*Pricing Details:*
${messageDetails.bookingType} Cost: ₹${ticketCost.toFixed(2)} × ${messageDetails.passengerCount} = ₹${(ticketCost * messageDetails.passengerCount).toFixed(2)}
${messageDetails.bookingType} Charge: ₹${bookingCharge.toFixed(2)} × ${messageDetails.passengerCount} = ₹${(bookingCharge * messageDetails.passengerCount).toFixed(2)}`;

      if (messageDetails.couponCode && messageDetails.couponDiscount > 0) {
        const originalCharge = bookingCharge * messageDetails.passengerCount;
        const discountAmount = messageDetails.couponType === 'percentage' 
          ? (originalCharge * messageDetails.couponDiscount / 100)
          : messageDetails.couponDiscount;
        const finalCharge = Math.max(0, originalCharge - discountAmount);

        pricingDetails += `
-----------------
*Coupon Applied:* ${messageDetails.couponCode}
Discount: ${messageDetails.couponType === 'percentage' ? `${messageDetails.couponDiscount}% OFF` : `₹${messageDetails.couponDiscount} OFF`}
Original Booking Charge: ₹${originalCharge.toFixed(2)}
Savings: ₹${discountAmount.toFixed(2)}
Final Booking Charge: ₹${finalCharge.toFixed(2)}`;
      }
      
      pricingDetails += `\n*Total Amount: ₹${totalAmount.toFixed(2)}*`;

      // 7. Build WhatsApp message
      const message = 
`🎫 *ANAND TRAVELS - BOOKING*

Dear *${currentBooking.name}*,
Bill No: *${billNumber}*

━━━━━━━━━━━━━━━
*JOURNEY*
🚆 ${currentBooking.from} → ${currentBooking.to}
📅 ${currentBooking.journey_date}
🎯 ${messageDetails.bookingType}
${passengerInfo}${currentBooking.additional_requirements ? `📝 ${currentBooking.additional_requirements}\n` : ''}
━━━━━━━━━━━━━━━
${pricingDetails}
${messageDetails.additionalInfo ? `\n${messageDetails.additionalInfo}\n` : ''}
━━━━━━━━━━━━━━━
*PAYMENT*
💳 UPI: ${upiId}
👤 ${accountName}
📞 *${paymentPhone}*
💰 *PAY: ₹${totalAmount.toFixed(2)}*
${qrCodeCloudinaryUrl ? `
🎯 *SCAN QR:*
${qrCodeCloudinaryUrl}
✅ Amount pre-filled
` : ''}
━━━━━━━━━━━━━━━
*STEPS:*
1. Open UPI app
2. Scan QR / Use UPI ID
3. Pay ₹${totalAmount.toFixed(2)}

📞 Support: *${paymentPhone}*
Thank you! 🙏`;

      // 8. Open WhatsApp with text message
      window.open(`https://wa.me/${currentBooking.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
      
      // 8.5. If Cloudinary URL exists, prepare a simple message for QR sharing
      if (qrCodeCloudinaryUrl) {
        // Create a simple message with just the QR image URL
        const qrMessage = `🎯 *Payment QR Code*

Scan to pay: ₹${totalAmount.toFixed(2)}

${qrCodeCloudinaryUrl}

Amount is pre-filled. Just scan and confirm! ✅`;
        
        // Store this message for the popup to use
        (window as any).__qrShareMessage = qrMessage;
        (window as any).__qrCustomerPhone = currentBooking.phone.replace(/\D/g, '');
      }
      
      // 9. If QR code was generated, show it to admin (either Cloudinary URL or local)
      if (qrCodeCloudinaryUrl || (useLocalQR && qrCodeDataUrl)) {
        // Open a new window/tab with the QR code details for admin
        setTimeout(() => {
          const qrWindow = window.open('', '_blank');
          if (qrWindow) {
            qrWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Payment QR Code - ${billNumber}</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    padding: 20px;
                  }
                  .container {
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    text-align: center;
                    max-width: 500px;
                  }
                  h1 {
                    color: #333;
                    margin-bottom: 10px;
                    font-size: 24px;
                  }
                  .bill-number {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 20px;
                  }
                  .auto-download-notice {
                    background: #28a745;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    margin: 15px 0;
                    font-weight: bold;
                    animation: pulse 2s infinite;
                  }
                  @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                  }
                  .qr-container {
                    background: white;
                    padding: 20px;
                    border-radius: 15px;
                    border: 3px solid #667eea;
                    margin: 20px 0;
                    display: inline-block;
                  }
                  img {
                    max-width: 300px;
                    height: auto;
                    display: block;
                  }
                  .info {
                    margin: 20px 0;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    font-size: 14px;
                  }
                  .amount {
                    font-size: 32px;
                    font-weight: bold;
                    color: #667eea;
                    margin: 15px 0;
                  }
                  .customer-name {
                    font-size: 18px;
                    color: #333;
                    margin: 10px 0;
                  }
                  .upi-id {
                    font-family: monospace;
                    background: #e9ecef;
                    padding: 8px 15px;
                    border-radius: 5px;
                    margin: 10px 0;
                    font-size: 16px;
                    color: #495057;
                  }
                  .buttons {
                    margin-top: 30px;
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    flex-wrap: wrap;
                  }
                  button {
                    padding: 12px 30px;
                    font-size: 16px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: transform 0.2s, box-shadow 0.2s;
                  }
                  button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                  }
                  .download-btn {
                    background: #28a745;
                    color: white;
                  }
                  .whatsapp-btn {
                    background: #25D366;
                    color: white;
                  }
                  .close-btn {
                    background: #6c757d;
                    color: white;
                  }
                  .instructions {
                    text-align: left;
                    margin-top: 20px;
                    padding: 15px;
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    border-radius: 5px;
                    font-size: 13px;
                    color: #856404;
                  }
                  .instructions ol {
                    margin: 10px 0;
                    padding-left: 20px;
                  }
                  .instructions li {
                    margin: 5px 0;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>${qrCodeCloudinaryUrl ? '✅ Payment QR Code Sent Successfully!' : '🎉 Payment QR Code Ready!'}</h1>
                  <div class="bill-number">Bill #${billNumber}</div>
                  
                  <div class="auto-download-notice" style="background: ${qrCodeCloudinaryUrl ? '#28a745' : '#ffc107'}; animation: none;">
                    ${qrCodeCloudinaryUrl ? '✅ QR Code uploaded to cloud & sent in WhatsApp message!' : '⚠️ QR Code ready - Download and share manually'}
                  </div>
                  
                  <div class="customer-name">Customer: ${currentBooking.name}</div>
                  <div class="amount">₹${totalAmount.toFixed(2)}</div>
                  
                  <div class="qr-container">
                    <img src="${qrCodeCloudinaryUrl || qrCodeDataUrl}" alt="Payment QR Code" />
                  </div>
                  
                  <div class="info">
                    <div>📱 <strong>Scan with any UPI app - Amount Pre-filled!</strong></div>
                    <div class="upi-id">${upiId}</div>
                    <div style="margin-top: 10px; color: #666;">Account: ${accountName}</div>
                    <div style="margin-top: 8px; padding: 8px; background: #d4edda; border-radius: 5px; font-size: 13px; color: #155724;">
                      <strong>✓ Amount Pre-filled:</strong> ₹${totalAmount.toFixed(2)} - Customer just scans & confirms!
                    </div>
                  </div>
                  
                  ${qrCodeCloudinaryUrl ? `
                  <div style="margin: 20px 0; padding: 15px; background: #e7f3ff; border-radius: 10px; text-align: left;">
                    <strong style="color: #004085;">🔗 QR Code Link (sent in message):</strong>
                    <div style="margin-top: 10px; word-break: break-all; font-size: 12px; background: white; padding: 10px; border-radius: 5px; font-family: monospace;">
                      ${qrCodeCloudinaryUrl}
                    </div>
                  </div>
                  ` : ''}
                  
                  <div class="instructions" style="background: ${qrCodeCloudinaryUrl ? '#d1ecf1' : '#fff3cd'}; border-left-color: ${qrCodeCloudinaryUrl ? '#17a2b8' : '#ffc107'};">
                    <strong>🎯 ${qrCodeCloudinaryUrl ? 'What Happened' : 'Next Steps'}:</strong>
                    ${qrCodeCloudinaryUrl ? `
                      <li><strong>✅ WhatsApp message sent</strong> with bill details</li>
                      <li><strong>✅ QR code link included</strong> in the message</li>
                      <li><strong>✅ QR stored in cloud</strong> (accessible anytime)</li>
                      <li><strong>✅ Amount pre-filled</strong> - customer just scans!</li>
                    ` : `
                      <li><strong>✅ WhatsApp message sent</strong> with bill details</li>
                      <li><strong>📥 Download QR code</strong> (click button below)</li>
                      <li><strong>💬 Open WhatsApp conversation</strong> with customer</li>
                      <li><strong>📎 Attach and send</strong> the downloaded QR image</li>
                      <li><strong>✅ Customer scans & pays</strong> (amount pre-filled!)</li>
                    `}
                    </ol>
                    <div style="margin-top: 10px; padding: 10px; background: ${qrCodeCloudinaryUrl ? '#d4edda' : '#fff3cd'}; border-radius: 5px; color: ${qrCodeCloudinaryUrl ? '#155724' : '#856404'};">
                      💡 <strong>${qrCodeCloudinaryUrl ? 'Customer can:' : 'Note:'}</strong> ${qrCodeCloudinaryUrl ? 'Click the link in WhatsApp → View QR → Scan with UPI app → Pay instantly!' : 'Cloudinary upload failed. Download QR and share manually via WhatsApp attachment.'}
                    </div>
                  </div>
                  
                  <div class="buttons">
                    ${qrCodeCloudinaryUrl ? `
                    <button class="download-btn" onclick="sendQROnly()" style="background: #667eea;">
                      📱 Send QR Image
                    </button>
                    <button class="whatsapp-btn" onclick="window.open('${qrCodeCloudinaryUrl}', '_blank')" style="background: #28a745;">
                      🔗 Open QR Link
                    </button>
                    ` : `
                    <button class="download-btn" onclick="downloadQR()">
                      📥 Download QR Code
                    </button>
                    <button class="whatsapp-btn" onclick="openWhatsApp()">
                      💬 Open WhatsApp
                    </button>
                    `}
                    <button class="close-btn" onclick="window.close()">
                      ✖ Close
                    </button>
                  </div>
                  
                  ${qrCodeCloudinaryUrl ? `
                  <div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 10px; font-size: 13px;">
                    <strong>💡 Pro Tip:</strong> Click <strong>"Send QR Image"</strong> to open WhatsApp with just the QR code link. WhatsApp will show the QR as an image preview!
                  </div>
                  ` : ''}
                </div>
                
                <script>
                  const hasCloudinaryUrl = ${!!qrCodeCloudinaryUrl};
                  
                  function downloadQR() {
                    if (hasCloudinaryUrl) return;
                    
                    const link = document.createElement('a');
                    link.href = '${qrCodeDataUrl}';
                    link.download = 'Payment_QR_${billNumber}_${currentBooking.name.replace(/\s+/g, '_')}.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    setTimeout(() => {
                      if (confirm('✅ QR Code downloaded!\\n\\nDo you want to open WhatsApp now to share it with the customer?')) {
                        openWhatsApp();
                      }
                    }, 500);
                  }
                  
                  function sendQROnly() {
                    // Get the stored QR message and phone number
                    const qrMessage = (window.opener as any)?.__qrShareMessage || 
                      '🎯 Payment QR Code\\n\\n${qrCodeCloudinaryUrl}\\n\\nScan to pay: ₹${totalAmount.toFixed(2)}';
                    const phone = (window.opener as any)?.__qrCustomerPhone || '${currentBooking.phone.replace(/\D/g, '')}';
                    
                    // Open WhatsApp with just the QR message
                    window.open(\`https://wa.me/\${phone}?text=\${encodeURIComponent(qrMessage)}\`, '_blank');
                  }
                  
                  function openWhatsApp() {
                    window.open('https://wa.me/${currentBooking.phone.replace(/\D/g, '')}', '_blank');
                  }
                  
                  function copyLink() {
                    const link = '${qrCodeCloudinaryUrl}';
                    if (!link) return;
                    navigator.clipboard.writeText(link).then(() => {
                      alert('✅ QR Code link copied to clipboard!');
                    }).catch(err => {
                      console.error('Failed to copy:', err);
                    });
                  }
                  
                  // Show success message or trigger download
                  window.onload = function() {
                    if (!hasCloudinaryUrl) {
                      // Auto-download QR if Cloudinary failed
                      setTimeout(() => {
                        downloadQR();
                      }, 1000);
                    }
                  };
                </script>
              </body>
              </html>
            `);
            qrWindow.document.close();
          }
        }, 500);
      }
      
      toast({
        title: 'Success',
        description: 'Message sent and bill generated successfully'
      });
      
      setWhatsappModal(false);
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  return { 
    whatsappModal, 
    setWhatsappModal, 
    currentBooking, 
    messageDetails, 
    setMessageDetails,
    handleWhatsapp, 
    sendWhatsappMessage, 
    calculateBookingCharge,
    sending
  };
};
