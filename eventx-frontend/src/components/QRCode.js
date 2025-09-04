import React from 'react';

const QRCode = ({ data, size = 200, className = "" }) => {
  // Generate QR code using a reliable service
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=png&margin=10`;

  return (
    <div className={`inline-block ${className}`}>
      <img
        src={qrUrl}
        alt={`QR Code for ${data}`}
        className="w-full h-auto"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
};

export default QRCode;
