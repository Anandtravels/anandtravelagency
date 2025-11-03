import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bill } from '@/types/upi';
import { formatCurrency, formatDate } from './billUtils';

/**
 * Generate ultra-professional travel invoice with maximum readability
 * Design Philosophy: Clarity First - Every text element must be crystal clear
 * Typography: Large, bold, high-contrast fonts for optimal readability
 * Layout: Generous spacing, clean sections, professional structure
 * Print & Screen: Perfect for both digital viewing and printing
 */
export const generateBillPDF = async (bill: Bill): Promise<void> => {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;
  
  // Professional Color Palette - High Contrast for Maximum Readability
  const primaryColor = [0, 102, 204];      // #0066CC - Professional blue
  const darkText = [33, 33, 33];           // #212121 - Almost black (high contrast)
  const mediumText = [66, 66, 66];         // #424242 - Medium gray for secondary text
  const lightText = [117, 117, 117];       // #757575 - Light gray for labels
  const bgLight = [248, 249, 250];         // #F8F9FA - Very light background
  const bgBlue = [230, 242, 255];          // #E6F2FF - Light blue background
  const borderColor = [224, 224, 224];     // #E0E0E0 - Light border
  const white = [255, 255, 255];           // #FFFFFF - Pure white
  const successGreen = [0, 150, 0];        // #009600 - Success green
  
  // Enhanced Spacing Constants - More generous for professional look
  const SECTION_GAP = 25;                  // Larger gap between sections
  const ROW_HEIGHT = 18;                   // Taller rows for better readability
  const PADDING = 20;                      // More padding from edges
  const INNER_PADDING = 12;                // Padding inside boxes
  
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
  
  currentY = 70;
  
  // Company name and tagline - larger, bolder, more prominent
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text('ANAND TRAVEL AGENCY', centerX, currentY, { align: 'center' });
  
  currentY += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mediumText[0], mediumText[1], mediumText[2]);
  doc.text('Your Trusted Travel Partner', centerX, currentY, { align: 'center' });
  
  // Contact information - clear and prominent
  currentY += 10;
  doc.setFontSize(11);
  doc.setTextColor(lightText[0], lightText[1], lightText[2]);
  doc.text('📞 8985816481 / 9676138010  •  📧 anandtravelsguide@gmail.com', centerX, currentY, { align: 'center' });
  
  currentY += SECTION_GAP;
  
  // Professional divider line
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(2);
  doc.line(PADDING, currentY, pageWidth - PADDING, currentY);
  
  currentY += SECTION_GAP;
  
  // ==================== INVOICE TITLE ====================
  // Large, bold "INVOICE" heading
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('INVOICE', centerX, currentY, { align: 'center' });
  
  currentY += SECTION_GAP;
  
  // ==================== INVOICE DETAILS BOX ====================
  // Invoice number and date in a clean, prominent box
  const infoBoxY = currentY;
  const infoBoxHeight = 35;
  
  // Light blue background box
  doc.setFillColor(bgBlue[0], bgBlue[1], bgBlue[2]);
  doc.rect(PADDING, infoBoxY, pageWidth - (PADDING * 2), infoBoxHeight, 'F');
  
  // Border
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(PADDING, infoBoxY, pageWidth - (PADDING * 2), infoBoxHeight, 'S');
  
  // Invoice Number - Left side
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(lightText[0], lightText[1], lightText[2]);
  doc.text('INVOICE NO:', PADDING + INNER_PADDING, infoBoxY + 12);
  
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(bill.billNumber, PADDING + INNER_PADDING, infoBoxY + 24);
  
  // Invoice Date - Right side
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(lightText[0], lightText[1], lightText[2]);
  doc.text('DATE:', pageWidth - PADDING - INNER_PADDING, infoBoxY + 12, { align: 'right' });
  
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(formatDate(bill.createdAt), pageWidth - PADDING - INNER_PADDING, infoBoxY + 24, { align: 'right' });
  
  currentY = infoBoxY + infoBoxHeight + SECTION_GAP;
  
  // ==================== CUSTOMER & JOURNEY DETAILS ====================
  const detailsBoxY = currentY;
  const detailsBoxHeight = bill.customerEmail ? 85 : 75;
  const columnWidth = (pageWidth - (PADDING * 2) - 15) / 2;
  
  // Left Box - BILL TO
  const leftBoxX = PADDING;
  
  // Blue header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(leftBoxX, detailsBoxY, columnWidth, 12, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text('BILL TO', leftBoxX + INNER_PADDING, detailsBoxY + 8);
  
  // Light background
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.rect(leftBoxX, detailsBoxY + 12, columnWidth, detailsBoxHeight - 12, 'F');
  
  // Border
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(leftBoxX, detailsBoxY, columnWidth, detailsBoxHeight, 'S');
  
  // Customer details - larger fonts
  let leftY = detailsBoxY + 25;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(bill.customerName, leftBoxX + INNER_PADDING, leftY);
  
  leftY += ROW_HEIGHT;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mediumText[0], mediumText[1], mediumText[2]);
  doc.text(`📞 ${bill.customerPhone}`, leftBoxX + INNER_PADDING, leftY);
  
  if (bill.customerEmail) {
    leftY += ROW_HEIGHT;
    doc.setFontSize(11);
    doc.text(`📧 ${bill.customerEmail}`, leftBoxX + INNER_PADDING, leftY);
  }
  
  // Right Box - JOURNEY DETAILS
  if (bill.journeyFrom && bill.journeyTo) {
    const rightBoxX = leftBoxX + columnWidth + 15;
    
    // Blue header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(rightBoxX, detailsBoxY, columnWidth, 12, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text('JOURNEY DETAILS', rightBoxX + INNER_PADDING, detailsBoxY + 8);
    
    // Light background
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.rect(rightBoxX, detailsBoxY + 12, columnWidth, detailsBoxHeight - 12, 'F');
    
    // Border
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.5);
    doc.rect(rightBoxX, detailsBoxY, columnWidth, detailsBoxHeight, 'S');
    
    // Journey information - larger fonts with labels
    let rightY = detailsBoxY + 25;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    doc.text('FROM:', rightBoxX + INNER_PADDING, rightY);
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(bill.journeyFrom, rightBoxX + INNER_PADDING, rightY + 10);
    
    rightY += ROW_HEIGHT + 12;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    doc.text('TO:', rightBoxX + INNER_PADDING, rightY);
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(bill.journeyTo, rightBoxX + INNER_PADDING, rightY + 10);
    
    if (bill.journeyDate) {
      rightY += ROW_HEIGHT + 12;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.text('DATE:', rightBoxX + INNER_PADDING, rightY);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(mediumText[0], mediumText[1], mediumText[2]);
      doc.text(bill.journeyDate, rightBoxX + INNER_PADDING, rightY + 10);
    }
  }
  
  currentY = detailsBoxY + detailsBoxHeight + SECTION_GAP;
  
  // ==================== SERVICES TABLE ====================
  const tableData: any[][] = [
    [
      'SERVICE DESCRIPTION',
      'TYPE',
      'PAX',
      'RATE',
      'AMOUNT'
    ],
    [
      'Ticket Cost',
      bill.bookingType,
      bill.passengerCount.toString(),
      formatCurrency(bill.ticketCost),
      formatCurrency(bill.ticketCost * bill.passengerCount)
    ],
    [
      'Booking Charge',
      bill.bookingType,
      bill.passengerCount.toString(),
      formatCurrency(bill.bookingCharge),
      formatCurrency(bill.bookingCharge * bill.passengerCount)
    ]
  ];
  
  // Add coupon discount if applicable
  if (bill.couponCode && bill.couponDiscount) {
    const discountAmount = bill.couponDiscount;
    tableData.push([
      `Discount - ${bill.couponCode}`,
      '',
      '',
      '',
      `- ${formatCurrency(discountAmount)}`
    ]);
  }
  
  autoTable(doc, {
    startY: currentY,
    head: [tableData[0]],
    body: tableData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
      textColor: [white[0], white[1], white[2]],
      fontStyle: 'bold',
      fontSize: 12,
      cellPadding: 10,
      halign: 'center',
      lineWidth: 0.5,
      lineColor: [primaryColor[0], primaryColor[1], primaryColor[2]]
    },
    bodyStyles: {
      fontSize: 11,
      cellPadding: 10,
      textColor: [darkText[0], darkText[1], darkText[2]],
      lineColor: [borderColor[0], borderColor[1], borderColor[2]],
      lineWidth: 0.5,
      minCellHeight: 15
    },
    alternateRowStyles: {
      fillColor: [bgLight[0], bgLight[1], bgLight[2]]
    },
    columnStyles: {
      0: { 
        cellWidth: 70, 
        fontStyle: 'bold', 
        textColor: [darkText[0], darkText[1], darkText[2]],
        halign: 'left'
      },
      1: { 
        cellWidth: 35, 
        halign: 'center',
        fontStyle: 'normal'
      },
      2: { 
        cellWidth: 25, 
        halign: 'center',
        fontStyle: 'bold'
      },
      3: { 
        cellWidth: 32, 
        halign: 'right',
        fontStyle: 'normal'
      },
      4: { 
        cellWidth: 33, 
        halign: 'right', 
        fontStyle: 'bold',
        fontSize: 12,
        textColor: [darkText[0], darkText[1], darkText[2]]
      }
    },
    margin: { left: PADDING, right: PADDING }
  });
  
  // Get Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || currentY + 80;
  
  // ==================== TOTAL AMOUNT ====================
  currentY = finalY + SECTION_GAP;
  
  // Large, prominent total box
  const totalBoxHeight = 50;
  const totalBoxWidth = 160;
  const totalBoxX = pageWidth - PADDING - totalBoxWidth;
  
  // Green gradient background
  doc.setFillColor(successGreen[0], successGreen[1], successGreen[2]);
  doc.rect(totalBoxX, currentY, totalBoxWidth, totalBoxHeight, 'F');
  
  // Thick border
  doc.setDrawColor(successGreen[0] - 20, successGreen[1] - 20, successGreen[2] - 20);
  doc.setLineWidth(2);
  doc.rect(totalBoxX, currentY, totalBoxWidth, totalBoxHeight, 'S');
  
  // "TOTAL AMOUNT" label
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text('TOTAL AMOUNT', totalBoxX + totalBoxWidth/2, currentY + 15, { align: 'center' });
  
  // Large amount display
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(bill.totalAmount), totalBoxX + totalBoxWidth/2, currentY + 35, { align: 'center' });
  
  currentY += totalBoxHeight + SECTION_GAP;
  
  // ==================== PAYMENT SECTION ====================
  if (bill.qrCodeUrl) {
    try {
      // Divider before payment section
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(1);
      doc.line(PADDING, currentY, pageWidth - PADDING, currentY);
      
      currentY += SECTION_GAP;
      
      // Payment title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text('PAYMENT INFORMATION', centerX, currentY, { align: 'center' });
      
      currentY += 20;
      
      // QR Code box - left side
      const qrBoxX = PADDING + 15;
      const qrBoxWidth = 85;
      const qrBoxHeight = 105;
      
      // Border
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(2);
      doc.rect(qrBoxX, currentY, qrBoxWidth, qrBoxHeight, 'S');
      
      // QR Code title
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(qrBoxX, currentY, qrBoxWidth, 15, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(white[0], white[1], white[2]);
      doc.text('SCAN TO PAY', qrBoxX + qrBoxWidth/2, currentY + 10, { align: 'center' });
      
      // QR Code image
      doc.addImage(bill.qrCodeUrl, 'PNG', qrBoxX + 12, currentY + 22, 61, 61);
      
      // UPI info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mediumText[0], mediumText[1], mediumText[2]);
      doc.text('All UPI Apps Accepted', qrBoxX + qrBoxWidth/2, currentY + 95, { align: 'center' });
      
      // Payment instructions - right side
      const instrBoxX = qrBoxX + qrBoxWidth + 15;
      const instrBoxWidth = pageWidth - instrBoxX - PADDING - 15;
      
      let instrY = currentY + 15;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('HOW TO PAY:', instrBoxX, instrY);
      
      instrY += 18;
      
      // Instruction steps with large, clear text
      const steps = [
        '1. Open any UPI payment app',
        '2. Scan the QR code on left',
        '3. Verify the amount shown',
        '4. Complete the payment',
        '5. Share payment screenshot'
      ];
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      
      steps.forEach((step, index) => {
        doc.text(step, instrBoxX, instrY + (index * 15));
      });
      
    } catch (error) {
      console.error('Error adding QR code:', error);
    }
  }
  
  // ==================== FOOTER ====================
  const footerY = pageHeight - 30;
  
  // Divider line
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1.5);
  doc.line(PADDING, footerY - 10, pageWidth - PADDING, footerY - 10);
  
  // Thank you message
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text('Thank you for choosing Anand Travel Agency!', centerX, footerY, { align: 'center' });
  
  // Contact info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightText[0], lightText[1], lightText[2]);
  doc.text('For queries, please contact us at 8985816481 or anandtravelsguide@gmail.com', centerX, footerY + 10, { align: 'center' });
  
  // ==================== SAVE PDF ====================
  doc.save(`Invoice_${bill.billNumber}.pdf`);
};
