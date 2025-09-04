import React, { useState, useEffect } from 'react';

const SeatPicker = ({ 
  totalSeats, 
  bookedSeats = [], 
  onSeatSelect, 
  onSeatDeselect, 
  selectedSeats = [],
  isEditable = true,
  seatPrice = 0,
  showPricing = false 
}) => {
  const [seats, setSeats] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);

  useEffect(() => {
    generateSeats();
  }, [totalSeats, bookedSeats]);

  const generateSeats = () => {
    const seatsArray = [];
    const rows = Math.ceil(totalSeats / 10); // 10 seats per row
    
    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < 10; col++) {
        const seatNumber = row * 10 + col + 1;
        if (seatNumber <= totalSeats) {
          const isBooked = bookedSeats.includes(seatNumber);
          const isSelected = selectedSeats.includes(seatNumber);
          
          rowSeats.push({
            id: seatNumber,
            row: row + 1,
            col: col + 1,
            isBooked,
            isSelected,
            isAvailable: !isBooked
          });
        }
      }
      if (rowSeats.length > 0) {
        seatsArray.push(rowSeats);
      }
    }
    setSeats(seatsArray);
  };

  const handleSeatClick = (seat) => {
    if (!isEditable || seat.isBooked) return;

    if (seat.isSelected) {
      onSeatDeselect(seat.id);
    } else {
      onSeatSelect(seat.id);
    }
  };

  const getSeatClass = (seat) => {
    let baseClass = "w-8 h-8 rounded-t-lg cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-medium border-2";
    
    if (seat.isBooked) {
      return `${baseClass} bg-red-500 text-white border-red-600 cursor-not-allowed`;
    } else if (seat.isSelected) {
      return `${baseClass} bg-blue-600 text-white border-blue-700`;
    } else if (hoveredSeat === seat.id) {
      return `${baseClass} bg-blue-100 text-blue-800 border-blue-300`;
    } else {
      return `${baseClass} bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300`;
    }
  };

  const getSeatLabel = (seat) => {
    return `${String.fromCharCode(65 + seat.row - 1)}${seat.col}`;
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 border-2 border-gray-300 rounded-t-lg"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 border-2 border-blue-700 rounded-t-lg"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 border-2 border-red-600 rounded-t-lg"></div>
          <span>Booked</span>
        </div>
      </div>

      {/* Stage/Platform Indicator */}
      <div className="text-center">
        <div className="bg-gray-800 text-white py-2 px-4 rounded-lg inline-block">
          <span className="text-sm font-medium">STAGE / PLATFORM</span>
        </div>
      </div>

      {/* Seats Grid */}
      <div className="space-y-2">
        {seats.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((seat) => (
              <div
                key={seat.id}
                className={getSeatClass(seat)}
                onClick={() => handleSeatClick(seat)}
                onMouseEnter={() => setHoveredSeat(seat.id)}
                onMouseLeave={() => setHoveredSeat(null)}
                title={`Seat ${getSeatLabel(seat)} - ${seat.isBooked ? 'Booked' : 'Available'}`}
              >
                {getSeatLabel(seat)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      {selectedSeats.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Selected Seats</h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedSeats.map(seatId => {
              const seat = seats.flat().find(s => s.id === seatId);
              return (
                <span key={seatId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {seat ? getSeatLabel(seat) : `Seat ${seatId}`}
                </span>
              );
            })}
          </div>
          {showPricing && (
            <div className="text-blue-900">
              <span className="font-medium">Total: </span>
              <span>${(selectedSeats.length * seatPrice).toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600 text-center">
        <p>Click on available seats to select/deselect them</p>
        <p>Selected seats will be highlighted in blue</p>
      </div>
    </div>
  );
};

export default SeatPicker;
