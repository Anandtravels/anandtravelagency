import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bill } from '@/types/upi';
import { formatCurrency, formatDate } from './billUtils';

/**
 * Generate minimalistic professional PDF invoice with clear text and prominent logo
 * Design: Clean white background with subtle gray accents, black text for maximum readability
 */
export const generateBillPDF = async (bill: Bill): Promise<void> => {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;
  
  // Minimalistic Colors - Professional and Clean
  const black = [0, 0, 0];           // Pure black for text
  const darkGray = [60, 60, 60];     // Dark gray for headers
  const mediumGray = [120, 120, 120]; // Medium gray for labels
  const lightGray = [220, 220, 220];  // Light gray for borders
  const bgVeryLight = [250, 250, 250]; // Very light gray for subtle backgrounds
  
  let currentY = 20;
  
  // ==================== LOGO - CENTERED & PROMINENT ====================
  // Add logo centered at the top - larger for visibility
  try {
    const logoPath = '/logo.png';
    const img = new Image();
    img.src = logoPath;
    
    await new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // Large centered logo for professional appearance
          const logoWidth = 70;
          const logoHeight = 35;
          doc.addImage(img, 'PNG', centerX - logoWidth/2, currentY, logoWidth, logoHeight);
          resolve(true);
        } catch (err) {
          console.warn('Could not add logo to PDF:', err);
          resolve(false);
        }
      };
      img.onerror = () => {
        console.warn('Logo image not found');
        resolve(false);
      };
      setTimeout(() => resolve(false), 2000);
    });
  } catch (error) {
    console.error('Error adding logo:', error);
  }
  
  currentY = 60;
  
  // ==================== COMPANY INFO - BLACK TEXT ON WHITE ====================
  // Company Name - Bold Black
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ANAND TRAVEL AGENCY', centerX, currentY, { align: 'center' });
  
  currentY += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Travel Services & Ticket Booking', centerX, currentY, { align: 'center' });
  
  currentY += 6;
  doc.setFontSize(9);
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.text('Phone: 8985816481 / 9676138010  |  Email: contact@anandtravels.com', centerX, currentY, { align: 'center' });
  
  // Thin separator line
  currentY += 8;
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.5);
  doc.line(20, currentY, pageWidth - 20, currentY);
  
  // ==================== INVOICE TITLE ====================
  currentY += 10;
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', centerX, currentY, { align: 'center' });
  
  // Invoice number and date - simple gray box with border
  currentY += 12;
  doc.setFillColor(bgVeryLight[0], bgVeryLight[1], bgVeryLight[2]);
  doc.roundedRect(15, currentY - 5, pageWidth - 30, 16, 2, 2, 'F');
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, currentY - 5, pageWidth - 30, 16, 2, 2, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Invoice No:', 20, currentY + 2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text(bill.billNumber, 45, currentY + 2);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Date:', pageWidth - 65, currentY + 2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text(formatDate(bill.createdAt), pageWidth - 50, currentY + 2);
  
  // ==================== BILL TO & JOURNEY DETAILS ====================
  currentY += 22;
  
  // Left section - Bill To (minimalistic with border)
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.5);
  doc.rect(15, currentY - 5, 85, (bill.customerEmail ? 32 : 26), 'S');
  
  doc.setFillColor(bgVeryLight[0], bgVeryLight[1], bgVeryLight[2]);
  doc.rect(15, currentY - 5, 85, 7, 'F');
  
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', 20, currentY);
  
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(bill.customerName, 20, currentY + 10);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(`Phone: ${bill.customerPhone}`, 20, currentY + 17);
  if (bill.customerEmail) {
    doc.text(`Email: ${bill.customerEmail}`, 20, currentY + 24);
  }
  
  // Right section - Journey Details (minimalistic with border)
  if (bill.journeyFrom && bill.journeyTo) {
    const rightX = pageWidth - 95;
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(0.5);
    doc.rect(rightX, currentY - 5, 80, (bill.journeyDate ? 32 : 26), 'S');
    
    doc.setFillColor(bgVeryLight[0], bgVeryLight[1], bgVeryLight[2]);
    doc.rect(rightX, currentY - 5, 80, 7, 'F');
    
    doc.setTextColor(black[0], black[1], black[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('JOURNEY DETAILS', rightX + 5, currentY);
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('From:', rightX + 5, currentY + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(bill.journeyFrom, rightX + 18, currentY + 10);
    
    doc.setFont('helvetica', 'bold');
    doc.text('To:', rightX + 5, currentY + 17);
    doc.setFont('helvetica', 'normal');
    doc.text(bill.journeyTo, rightX + 18, currentY + 17);
    
    if (bill.journeyDate) {
      doc.setFont('helvetica', 'bold');
      doc.text('Date:', rightX + 5, currentY + 24);
      doc.setFont('helvetica', 'normal');
      doc.text(bill.journeyDate, rightX + 18, currentY + 24);
    }
  }
  
  // ==================== SERVICES TABLE ====================
  currentY += (bill.customerEmail ? 35 : 30);
  const tableStartY = currentY;
  
  const tableData: any[][] = [
    [
      'Service Description',
      'Service Type',
      'Passengers',
      'Rate',
      'Amount'
    ],
    [
      `Ticket Cost`,
      bill.bookingType,
      bill.passengerCount.toString(),
      formatCurrency(bill.ticketCost),
      formatCurrency(bill.ticketCost * bill.passengerCount)
    ],
    [
      `Booking Charge`,
      bill.bookingType,
      bill.passengerCount.toString(),
      formatCurrency(bill.bookingCharge),
      formatCurrency(bill.bookingCharge * bill.passengerCount)
    ]
  ];
  
  // Add coupon row if applicable
  if (bill.couponCode && bill.couponDiscount) {
    const discountAmount = bill.couponDiscount;
    tableData.push([
      `Coupon Discount (${bill.couponCode})`,
      '',
      '',
      '',
      `- ${formatCurrency(discountAmount)}`
    ]);
  }
  
  autoTable(doc, {
    startY: tableStartY,
    head: [tableData[0]],
    body: tableData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [darkGray[0], darkGray[1], darkGray[2]],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: 5,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: [black[0], black[1], black[2]],
      lineColor: [lightGray[0], lightGray[1], lightGray[2]],
      lineWidth: 0.3
    },
    alternateRowStyles: {
      fillColor: [bgVeryLight[0], bgVeryLight[1], bgVeryLight[2]]
    },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: 'bold', textColor: [black[0], black[1], black[2]] },
      1: { cellWidth: 38, halign: 'center' },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 15, right: 15 }
  });
  
  // Get the Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 60;
  
  // ==================== TOTAL AMOUNT BOX ====================
  currentY = finalY + 15;
  
  // Minimalistic total box with border
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(pageWidth - 85, currentY - 8, 70, 20, 2, 2, 'S');
  doc.setFillColor(bgVeryLight[0], bgVeryLight[1], bgVeryLight[2]);
  doc.roundedRect(pageWidth - 85, currentY - 8, 70, 20, 2, 2, 'F');
  
  // Text - Black for clarity
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT:', pageWidth - 82, currentY);
  doc.setFontSize(14);
  doc.text(formatCurrency(bill.totalAmount), pageWidth - 18, currentY + 7, { align: 'right' });
  
  // ==================== PAYMENT QR CODE ====================
  if (bill.qrCodeUrl) {
    try {
      currentY = finalY + 43;
      
      // QR Code section with minimalistic border
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setLineWidth(0.8);
      doc.roundedRect(15, currentY - 10, 70, 88, 2, 2, 'S');
      
      // Title bar - light gray background
      doc.setFillColor(bgVeryLight[0], bgVeryLight[1], bgVeryLight[2]);
      doc.rect(15, currentY - 10, 70, 9, 'F');
      doc.setTextColor(black[0], black[1], black[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('SCAN TO PAY', 50, currentY - 4, { align: 'center' });
      
      // Instructions
      doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Use any UPI app to pay', 50, currentY + 4, { align: 'center' });
      
      // QR Code
      doc.addImage(bill.qrCodeUrl, 'PNG', 25, currentY + 10, 50, 50);
      
      // Payment info
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(black[0], black[1], black[2]);
      doc.text('Anand Travel Agency', 50, currentY + 66, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      doc.text('PhonePe | GPay | Paytm | Other UPI', 50, currentY + 71, { align: 'center' });
      
      // Payment note box - minimalistic
      doc.setFillColor(bgVeryLight[0], bgVeryLight[1], bgVeryLight[2]);
      doc.roundedRect(90, currentY - 10, pageWidth - 105, 38, 2, 2, 'F');
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(90, currentY - 10, pageWidth - 105, 38, 2, 2, 'S');
      
      doc.setTextColor(black[0], black[1], black[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Instructions:', 95, currentY - 3);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('1. Open any UPI app on your phone', 95, currentY + 5);
      doc.text('2. Scan the QR code shown on left', 95, currentY + 11);
      doc.text('3. Verify amount & complete payment', 95, currentY + 17);
      doc.text('4. Share screenshot for confirmation', 95, currentY + 23);
      
    } catch (error) {
      console.error('Error adding QR code:', error);
    }
  }
  
  // ==================== FOOTER ====================
  const footerY = pageHeight - 20;
  
  // Footer line - subtle gray
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.5);
  doc.line(15, footerY - 8, pageWidth - 15, footerY - 8);
  
  // Thank you message - black text
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank you for choosing Anand Travel Agency!', centerX, footerY, { align: 'center' });
  
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('For queries, contact us at the above details  |  Safe travels!', centerX, footerY + 5, { align: 'center' });
  
  // ==================== SAVE PDF ====================
  doc.save(`Invoice_${bill.billNumber}.pdf`);
};
