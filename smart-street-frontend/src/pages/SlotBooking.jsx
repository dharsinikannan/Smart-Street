import { useEffect, useState } from "react";
import api from "../api.jsx";

export default function SlotBooking() {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    api.get("/slots").then(res => setSlots(res.data));
  }, []);

  const bookSlot = async id => {
    await api.post(`/slots/book/${id}`);
    alert("Slot booked successfully");
    window.location.reload();
  };

  return (
    <div className="container">
      <h2>Available Slots</h2>

      {slots.map(slot => (
        <div key={slot.id} className="card">
          <p><b>Zone:</b> {slot.zone}</p>
          <p><b>Time:</b> {slot.time}</p>

          {slot.is_booked ? (
            <span className="booked">Booked</span>
          ) : (
            <button onClick={() => bookSlot(slot.id)}>
              Book Slot
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
