import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bill } from '@/types/upi';
import { formatCurrency, formatDate } from './billUtils';

/**
 * Generate modern, professional travel invoice with premium blue and gray design
 * Design: Corporate blue palette, white background, clear visual hierarchy
 * Style: Clean, elegant, print-ready and web-display compatible
 * Typography: Montserrat/Open Sans inspired, professional sans-serif
 * Spacing: Consistent 12px row spacing, 20px section gaps
 */
export const generateBillPDF = async (bill: Bill): Promise<void> => {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;
  
  // Modern Blue & Gray Color Palette - Corporate Travel Theme
  const primaryBlue = [41, 128, 185];    // #2980b9 - Main brand blue
  const accentBlue = [52, 152, 219];     // #3498db - Lighter blue for accents
  const darkGray = [52, 73, 94];         // #34495e - Professional dark gray
  const mediumGray = [127, 140, 141];    // #7f8c8d - Medium gray for labels
  const lightGray = [236, 240, 241];     // #ecf0f1 - Light gray backgrounds
  const borderGray = [189, 195, 199];    // #bdc3c7 - Border color
  const white = [255, 255, 255];         // #ffffff - White
  const black = [44, 62, 80];            // #2c3e50 - Almost black for text
  
  // Professional spacing constants
  const SECTION_GAP = 20;                // Gap between major sections
  const ROW_SPACING = 12;                // Spacing between rows
  const PADDING = 15;                    // Page padding/margins
  
  let currentY = PADDING;
  
  // ==================== HEADER SECTION ====================
  // Premium header with company logo and information
  try {
    const logoPath = '/logo.png';
    const img = new Image();
    img.src = logoPath;
    
    await new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // Centered logo at top - prominent and clear
          const logoWidth = 75;
          const logoHeight = 38;
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
  
  currentY = 58;
  
  // Tagline centered below logo - professional spacing
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.text('Travel Services & Ticket Booking', centerX, currentY, { align: 'center' });
  
  // Contact info - clean minimal design
  currentY += ROW_SPACING;
  doc.setFontSize(10);
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  
  // Phone number
  const contactY = currentY;
  doc.text('☎ 8985816481', centerX - 28, contactY);
  
  // Vertical separator
  doc.text('|', centerX, contactY);
  
  // Website
  doc.text('🌐 anandtravelagency.com', centerX + 5, contactY);
  
  // Elegant divider line with proper spacing
  currentY += SECTION_GAP;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(1);
  doc.line(PADDING, currentY, pageWidth - PADDING, currentY);
  
  // ==================== INVOICE TITLE IN CORNER ====================
  // "INVOICE" heading in top-right corner with info box
  const invoiceCornerY = 20;
  
  // Big, bold INVOICE heading - top right
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - PADDING, invoiceCornerY, { align: 'right' });
  
  // Invoice info box positioned under INVOICE heading in corner
  const infoBoxX = pageWidth - 80;
  const infoBoxWidth = 65;
  const infoBoxHeight = 26;
  const infoBoxY = 30;
  
  // Shadow effect for depth
  doc.setFillColor(200, 200, 200);
  doc.roundedRect(infoBoxX + 2, infoBoxY + 2, infoBoxWidth, infoBoxHeight, 4, 4, 'F');
  
  // Main box with light gray background
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(infoBoxX, infoBoxY, infoBoxWidth, infoBoxHeight, 4, 4, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(infoBoxX, infoBoxY, infoBoxWidth, infoBoxHeight, 4, 4, 'S');
  
  // Invoice number with consistent spacing
  const boxPadding = 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.text('Invoice No:', infoBoxX + boxPadding, infoBoxY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(9);
  doc.text(bill.billNumber, infoBoxX + boxPadding, infoBoxY + 12);
  
  // Date with ROW_SPACING
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.text('Date:', infoBoxX + boxPadding, infoBoxY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(9);
  doc.text(formatDate(bill.createdAt), infoBoxX + boxPadding, infoBoxY + 24);
  
  currentY += SECTION_GAP;
  
  // ==================== BILLING AND JOURNEY DETAILS SECTION ====================
  currentY += SECTION_GAP + 10;
  
  // Two-column layout with rounded corners and blue accent headers
  const leftColX = PADDING;
  const leftColWidth = 92;
  const rightColX = pageWidth - 97;
  const rightColWidth = 82;
  const boxHeight = (bill.customerEmail ? 42 : 38);  // More height for better spacing
  
  // Left Column - BILL TO
  // Blue header bar with rounded top corners
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.roundedRect(leftColX, currentY - 10, leftColWidth, 10, 3, 3, 'F');
  
  // Main box with light gray background
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(leftColX, currentY, leftColWidth, boxHeight - 10, 0, 0, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(leftColX, currentY - 10, leftColWidth, boxHeight, 3, 3, 'S');
  
  // "BILL TO" label in white on blue - using small caps style
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', leftColX + 5, currentY - 4);
  
  // Customer details with consistent spacing
  const leftPadding = 5;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(12);  // Larger for better visibility
  doc.setFont('helvetica', 'bold');
  doc.text(bill.customerName, leftColX + leftPadding, currentY + 8);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.text(`☎ ${bill.customerPhone}`, leftColX + leftPadding, currentY + 8 + ROW_SPACING);
  if (bill.customerEmail) {
    doc.text(`✉ ${bill.customerEmail}`, leftColX + leftPadding, currentY + 8 + (ROW_SPACING * 2));
  }
  
  // Right Column - JOURNEY DETAILS
  if (bill.journeyFrom && bill.journeyTo) {
    // Blue header bar with rounded top corners
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.roundedRect(rightColX, currentY - 10, rightColWidth, 10, 3, 3, 'F');
    
    // Main box with light gray background
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(rightColX, currentY, rightColWidth, boxHeight - 10, 0, 0, 'F');
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(rightColX, currentY - 10, rightColWidth, boxHeight, 3, 3, 'S');
    
    // "JOURNEY DETAILS" label in white on blue - small caps style
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('JOURNEY DETAILS', rightColX + 5, currentY - 4);
    
    // Journey information with consistent spacing
    const rightPadding = 5;
    const labelWidth = 20;
    let journeyY = currentY + 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.text('From:', rightColX + rightPadding, journeyY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(bill.journeyFrom, rightColX + rightPadding + labelWidth, journeyY);
    
    journeyY += ROW_SPACING;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.text('To:', rightColX + rightPadding, journeyY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(bill.journeyTo, rightColX + rightPadding + labelWidth, journeyY);
    
    if (bill.journeyDate) {
      journeyY += ROW_SPACING;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      doc.text('Date:', rightColX + rightPadding, journeyY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(bill.journeyDate, rightColX + rightPadding + labelWidth, journeyY);
    }
  }
  
  // ==================== SERVICES TABLE ====================
  currentY += (bill.customerEmail ? 42 : 38) + SECTION_GAP;
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
      fillColor: [primaryBlue[0], primaryBlue[1], primaryBlue[2]],
      textColor: [white[0], white[1], white[2]],
      fontStyle: 'bold',
      fontSize: 11,  // Larger for better readability
      cellPadding: 7,  // More padding
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 6,  // Consistent 12px spacing (6*2)
      textColor: [darkGray[0], darkGray[1], darkGray[2]],
      lineColor: [borderGray[0], borderGray[1], borderGray[2]],
      lineWidth: 0.5,
      minCellHeight: ROW_SPACING  // Ensure minimum row height
    },
    alternateRowStyles: {
      fillColor: [lightGray[0], lightGray[1], lightGray[2]]
    },
    columnStyles: {
      0: { cellWidth: 68, fontStyle: 'bold', textColor: [darkGray[0], darkGray[1], darkGray[2]] },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: [primaryBlue[0], primaryBlue[1], primaryBlue[2]] }
    },
    margin: { left: PADDING, right: PADDING }
  });
  
  // Get the Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 60;
  
  // ==================== TOTAL AMOUNT BOX ====================
  currentY = finalY + SECTION_GAP;
  
  // Prominent total box with blue background and rounded corners
  const totalBoxX = pageWidth - 95;
  const totalBoxWidth = 80;
  const totalBoxHeight = 28;
  
  // Shadow effect for depth
  doc.setFillColor(200, 200, 200);
  doc.roundedRect(totalBoxX + 2, currentY - 12 + 2, totalBoxWidth, totalBoxHeight, 4, 4, 'F');
  
  // Main blue box with rounded corners
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.roundedRect(totalBoxX, currentY - 12, totalBoxWidth, totalBoxHeight, 4, 4, 'F');
  
  // White text for total - centered and prominent
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT:', totalBoxX + 6, currentY - 3);
  doc.setFontSize(18);  // Larger for better visibility
  doc.text(formatCurrency(bill.totalAmount), totalBoxX + totalBoxWidth - 6, currentY + 9, { align: 'right' });
  
  // ==================== PAYMENT SECTION ====================
  if (bill.qrCodeUrl) {
    try {
      currentY = finalY + SECTION_GAP + 28;
      
      // Two-column layout: QR Code on left, Instructions on right
      const qrBoxX = PADDING;
      const qrBoxWidth = 80;
      const qrBoxHeight = 98;
      
      // Left side - QR Code Box with blue header
      // Blue header bar with rounded top
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.roundedRect(qrBoxX, currentY - 12, qrBoxWidth, 12, 3, 3, 'F');
      
      // Main box with light gray background
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.roundedRect(qrBoxX, currentY, qrBoxWidth, qrBoxHeight - 12, 0, 0, 'F');
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(qrBoxX, currentY - 12, qrBoxWidth, qrBoxHeight, 3, 3, 'S');
      
      // "SCAN TO PAY" label in white on blue
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('SCAN TO PAY', qrBoxX + qrBoxWidth/2, currentY - 5, { align: 'center' });
      
      // QR Code image - centered
      doc.addImage(bill.qrCodeUrl, 'PNG', qrBoxX + 14, currentY + 6, 52, 52);
      
      // Payment provider info with better spacing
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Anand Travel Agency', qrBoxX + qrBoxWidth/2, currentY + 65, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      doc.text('PhonePe • GPay • Paytm', qrBoxX + qrBoxWidth/2, currentY + 72, { align: 'center' });
      doc.text('All UPI Apps Accepted', qrBoxX + qrBoxWidth/2, currentY + 78, { align: 'center' });
      
      // Right side - Payment Instructions Box
      const instrBoxX = 100;
      const instrBoxWidth = pageWidth - instrBoxX - PADDING;
      const instrBoxHeight = 58;
      
      // Light gray background box with rounded corners
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.roundedRect(instrBoxX, currentY - 12, instrBoxWidth, instrBoxHeight, 3, 3, 'F');
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(instrBoxX, currentY - 12, instrBoxWidth, instrBoxHeight, 3, 3, 'S');
      
      // Title with better styling
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Instructions', instrBoxX + 5, currentY - 4);
      
      // Numbered instructions with consistent 12px spacing
      const instrPadding = 5;
      let instrY = currentY + 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      
      doc.setFont('helvetica', 'bold');
      doc.text('1.', instrBoxX + instrPadding, instrY);
      doc.setFont('helvetica', 'normal');
      doc.text('Open any UPI app on your phone', instrBoxX + instrPadding + 8, instrY);
      
      instrY += ROW_SPACING;
      doc.setFont('helvetica', 'bold');
      doc.text('2.', instrBoxX + instrPadding, instrY);
      doc.setFont('helvetica', 'normal');
      doc.text('Scan the QR code shown on left', instrBoxX + instrPadding + 8, instrY);
      
      instrY += ROW_SPACING;
      doc.setFont('helvetica', 'bold');
      doc.text('3.', instrBoxX + instrPadding, instrY);
      doc.setFont('helvetica', 'normal');
      doc.text('Verify amount & complete payment', instrBoxX + instrPadding + 8, instrY);
      
      instrY += ROW_SPACING;
      doc.setFont('helvetica', 'bold');
      doc.text('4.', instrBoxX + instrPadding, instrY);
      doc.setFont('helvetica', 'normal');
      doc.text('Share screenshot for confirmation', instrBoxX + instrPadding + 8, instrY);
      
    } catch (error) {
      console.error('Error adding QR code:', error);
    }
  }
  
  // ==================== FOOTER SECTION ====================
  const footerY = pageHeight - SECTION_GAP - 2;
  
  // Elegant divider line with proper spacing
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(1);
  doc.line(PADDING, footerY - SECTION_GAP/2, pageWidth - PADDING, footerY - SECTION_GAP/2);
  
  // Thank you message - centered, professional with better font
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank you for choosing Anand Travel Agency!', centerX, footerY, { align: 'center' });
  
  // Contact reminder - italic style with proper spacing
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('For queries, contact us at the above details. Safe travels!', centerX, footerY + ROW_SPACING/2 + 3, { align: 'center' });
  
  // ==================== SAVE PDF ====================
  doc.save(`Invoice_${bill.billNumber}.pdf`);
};
