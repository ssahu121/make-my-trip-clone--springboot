import axios from "axios";

const BACKEND_URL = "http://localhost:8080";

// =====================================================
// LOGIN
// =====================================================

export const login = async (email, password) => {
  try {
    const url =
      `${BACKEND_URL}/user/login` +
      `?email=${encodeURIComponent(email)}` +
      `&password=${encodeURIComponent(password)}`;

    const res = await axios.post(url);

    return res.data;
  } catch (error) {
    throw error;
  }
};

// =====================================================
// SIGNUP
// =====================================================

export const signup = async (
  firstName,
  lastName,
  email,
  phoneNumber,
  password
) => {
  try {
    const res = await axios.post(
      `${BACKEND_URL}/user/signup`,
      {
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      }
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

// =====================================================
// GET USER BY EMAIL
// =====================================================

export const getuserbyemail = async (email) => {
  try {
    const res = await axios.get(
      `${BACKEND_URL}/user/email?email=${encodeURIComponent(email)}`
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

// =====================================================
// EDIT PROFILE
// =====================================================

export const editprofile = async (
  id,
  firstName,
  lastName,
  email,
  phoneNumber
) => {
  try {
    const res = await axios.post(
      `${BACKEND_URL}/user/edit?id=${encodeURIComponent(id)}`,
      {
        firstName,
        lastName,
        email,
        phoneNumber,
      }
    );

    return res.data;
  } catch (error) {
    console.error("Edit profile error:", error);
    throw error;
  }
};

// =====================================================
// CANCEL BOOKING
// =====================================================

export const cancelBooking = async (
  userId,
  bookingId,
  reason
) => {
  try {
    const res = await axios.put(
      `${BACKEND_URL}/booking/cancel`,
      null,
      {
        params: {
          userId,
          bookingId,
          reason,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      "Cancel booking error:",
      error
    );

    throw error;
  }
};

// =====================================================
// UPDATE REFUND STATUS
// =====================================================

export const updateRefundStatus = async (
  userId,
  bookingId,
  status
) => {
  try {
    const res = await axios.put(
      `${BACKEND_URL}/booking/refund-status`,
      null,
      {
        params: {
          userId,
          bookingId,
          status,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      "Refund status update error:",
      error
    );

    throw error;
  }
};

// =====================================================
// GET FLIGHTS
// =====================================================

export const getflight = async () => {
  try {
    const res = await axios.get(
      `${BACKEND_URL}/flight`
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

// =====================================================
// ADD FLIGHT
// =====================================================

export const addflight = async (
  flightName,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.post(
      `${BACKEND_URL}/admin/flight`,
      {
        flightName,
        from,
        to,
        departureTime,
        arrivalTime,
        price,
        availableSeats,
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      "Add flight error:",
      error
    );

    throw error;
  }
};

// =====================================================
// EDIT FLIGHT
// =====================================================

export const editflight = async (
  id,
  flightName,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.put(
      `${BACKEND_URL}/admin/flight/${id}`,
      {
        flightName,
        from,
        to,
        departureTime,
        arrivalTime,
        price,
        availableSeats,
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      "Edit flight error:",
      error
    );

    throw error;
  }
};

// =====================================================
// GET HOTELS
// =====================================================

export const gethotels = async () => {
  try {
    const res = await axios.get(
      `${BACKEND_URL}/hotel`
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

// =====================================================
// ADD HOTEL
// =====================================================

export const addhotel = async (
  hotelName,
  location,
  pricePerNight,
  availableRooms,
  amenities
) => {
  try {
    const res = await axios.post(
      `${BACKEND_URL}/admin/hotel`,
      {
        hotelName,
        location,
        pricePerNight,
        availableRooms,
        amenities,
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      "Add hotel error:",
      error
    );

    throw error;
  }
};

// =====================================================
// EDIT HOTEL
// =====================================================

export const edithotel = async (
  id,
  hotelName,
  location,
  pricePerNight,
  availableRooms,
  amenities
) => {
  try {
    const res = await axios.put(
      `${BACKEND_URL}/admin/hotel/${id}`,
      {
        hotelName,
        location,
        pricePerNight,
        availableRooms,
        amenities,
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      "Edit hotel error:",
      error
    );

    throw error;
  }
};

// =====================================================
// FLIGHT BOOKING
// =====================================================

export const handleflightbooking = async (
  userId,
  flightId,
  seats,
  price,
  selectedSeats
) => {
  try {
    const url =
      `${BACKEND_URL}/booking/flight` +
      `?userId=${encodeURIComponent(userId)}` +
      `&flightId=${encodeURIComponent(flightId)}` +
      `&seats=${encodeURIComponent(seats)}` +
      `&price=${encodeURIComponent(price)}` +
      `&selectedSeats=${encodeURIComponent(
        selectedSeats || ""
      )}`;

    const res = await axios.post(url);

    return res.data;
  } catch (error) {
    console.error(
      "Flight booking error:",
      error
    );

    throw error;
  }
};

// =====================================================
// HOTEL BOOKING
// =====================================================

export const handlehotelbooking = async (
  userId,
  hotelId,
  rooms,
  price,
  roomType
) => {
  try {
    const url =
      `${BACKEND_URL}/booking/hotel` +
      `?userId=${encodeURIComponent(userId)}` +
      `&hotelId=${encodeURIComponent(hotelId)}` +
      `&rooms=${encodeURIComponent(rooms)}` +
      `&price=${encodeURIComponent(price)}` +
      `&roomType=${encodeURIComponent(
        roomType || "Standard"
      )}`;

    const res = await axios.post(url);

    return res.data;
  } catch (error) {
    console.error(
      "Hotel booking error:",
      error
    );

    throw error;
  }
};

// =====================================================
// TRACK FLIGHT
// =====================================================

export const trackFlight = async (id) => {
  try {
    const res = await axios.put(
      `${BACKEND_URL}/flight/${id}/track`
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

// =====================================================
// GET TRACKED FLIGHTS
// =====================================================

export const getTrackedFlights = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/flight/tracked`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// =====================================================
// GET PRICE HISTORY
// =====================================================

export const getPriceHistory = async (id) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/flight/${id}/price-history`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching price history:",
      error
    );

    throw error;
  }
};

// =====================================================
// FREEZE PRICE
// =====================================================

export const freezePrice = async (
  flightId,
  minutes = 15
) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/flight/${flightId}/price-freeze?minutes=${minutes}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error freezing price:",
      error
    );

    throw error;
  }
};

// =====================================================
// SAVE USER PREFERENCES
// =====================================================

export const saveUserPreferences = async (
  userId,
  preferredSeats = "",
  preferredRoomType = ""
) => {
  try {
    const url =
      `${BACKEND_URL}/booking/preferences` +
      `?userId=${encodeURIComponent(userId)}` +
      `&preferredSeats=${encodeURIComponent(
        preferredSeats
      )}` +
      `&preferredRoomType=${encodeURIComponent(
        preferredRoomType
      )}`;

    const res = await axios.put(url);

    return res.data;
  } catch (error) {
    console.error(
      "Save preferences error:",
      error
    );

    throw error;
  }
};
