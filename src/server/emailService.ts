import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export const sendBookingConfirmation = async (bookingData: any) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: bookingData.email,
    subject: 'Booking Confirmation - Anand Travel Agency',
    html: `
      <h2>Thank you for your booking!</h2>
      <p>Dear ${bookingData.name},</p>
      <p>Your ${bookingData.booking_type} booking has been received successfully.</p>
      <div style="margin: 20px 0;">
        <h3>Booking Details:</h3>
        <p>From: ${bookingData.from}</p>
        <p>To: ${bookingData.to}</p>
        <p>Journey Date: ${bookingData.journey_date}</p>
        <p>Passengers: ${bookingData.passengers.length}</p>
      </div>
      <p>Our team will contact you shortly at ${bookingData.phone} to confirm your booking.</p>
      <p>Best Regards,<br>Anand Travel Agency</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};
