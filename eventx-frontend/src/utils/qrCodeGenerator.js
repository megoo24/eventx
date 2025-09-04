// QR Code Generator Utility for Tickets
import QRCode from 'qrcode';

export const generateQRCode = async (data, options = {}) => {
  try {
    const defaultOptions = {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    };

    const qrOptions = { ...defaultOptions, ...options };
    
    // Generate QR code as data URL
    const qrDataURL = await QRCode.toDataURL(JSON.stringify(data), qrOptions);
    return qrDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const generateTicketQRCode = async (ticketData) => {
  const qrData = {
    ticketId: ticketData._id,
    ticketNumber: ticketData.ticketNumber,
    eventId: ticketData.event,
    userId: ticketData.user,
    timestamp: Date.now()
  };

  return await generateQRCode(qrData, {
    width: 150,
    margin: 1
  });
};

export const downloadQRCode = async (data, filename = 'qr-code.png') => {
  try {
    const qrDataURL = await generateQRCode(data);
    
    // Create download link
    const link = document.createElement('a');
    link.href = qrDataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw new Error('Failed to download QR code');
  }
};
