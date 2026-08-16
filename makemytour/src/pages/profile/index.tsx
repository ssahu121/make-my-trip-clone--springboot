import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  Edit2,
  MapPin,
  Calendar,
  CreditCard,
  X,
  Check,
  LogOut,
  Plane,
  Building2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { clearUser, setUser } from "@/store";
import { editprofile, cancelBooking } from "@/api";
const index = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  console.log(user, "user");
  const router = useRouter();

  const logout = () => {
    dispatch(clearUser());
    router.push("/");
  };
  const [isEditing, setIsEditing] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [userData, setUserData] = useState({
    firstName: user?.firstname ? user?.firstname : "Unkown",
    lastName: user?.lastname ? user?.lastname : "",
    email: user?.email ? user?.email : "",
    phoneNumber: user?.phoneNumber ? user?.phoneNumber : "",
    bookings: [
      {
        type: "Flight",
        bookingId: "F123456",
        date: "2024-03-25",
        quantity: 2,
        totalPrice: 12499,
        details: {
          from: "Delhi",
          to: "Mumbai",
          airline: "IndiGo",
        },
      },
      {
        type: "Hotel",
        bookingId: "H789012",
        date: "2024-04-15",
        quantity: 1,
        totalPrice: 8999,
        details: {
          name: "Taj Palace",
          location: "Goa",
          nights: 3,
        },
      },
    ],
  });

  const [editForm, setEditForm] = useState({ ...userData });
  const handleCancelBooking = async (bookingId: string) => {
    if (!cancelReason) {
      alert("Please select a cancellation reason");
      return;
    }

    try {
      setCancelLoading(true);

      const result = await cancelBooking(user?.id, bookingId, cancelReason);

      dispatch(
        setUser({
          ...user,
          bookings: user.bookings.map((booking: any) =>
            booking.bookingId === bookingId ? result : booking,
          ),
        }),
      );

      setCancelBookingId(null);
      setCancelReason("");

      alert(`Booking cancelled successfully. Refund: ₹${result.refundAmount}`);
    } catch (error) {
      console.error("Cancellation failed:", error);
      alert("Unable to cancel booking");
    } finally {
      setCancelLoading(false);
    }
  };
  const handleSave = async () => {
    try {
      const data = await editprofile(
        user?.id,
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.phoneNumber,
      );
      dispatch(setUser(data));
      setIsEditing(false);
    } catch (error) {
      setUserData(editForm);
      setIsEditing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const handleEditFormChange = (field: any, value: any) => {
    setUserData((prevState) => ({
      ...prevState,
      [field]: value, // Update the specific field dynamically
    }));
  };
  return (
    <div className="min-h-screen bg-gray-50 pt-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Profile</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-red-600 flex items-center space-x-1 hover:text-red-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={userData.firstName}
                      onChange={(e) =>
                        handleEditFormChange("firstName", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={userData.lastName}
                      onChange={(e) =>
                        handleEditFormChange("lastName", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) =>
                        handleEditFormChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={userData.phoneNumber}
                      onChange={(e) =>
                        handleEditFormChange("phoneNumber", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({ ...user });
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {userData?.firstName} {userData?.lastName}
                      </p>
                      {/* <p className="text-sm text-gray-500">{userData.role}</p> */}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <p>{userData?.email}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <p>{userData?.phoneNumber}</p>
                  </div>
                  <button
                    className="w-full mt-4 flex items-center justify-center space-x-2 text-red-600 hover:text-red-700"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bookings Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">My Bookings</h2>

              <div className="space-y-6">
                {user?.bookings
                  ?.filter((booking: any) => booking != null)
                  .map((booking: any, index: number) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Booking Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {booking?.type === "Flight" ? (
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Plane className="w-6 h-6 text-blue-600" />
                            </div>
                          ) : (
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Building2 className="w-6 h-6 text-green-600" />
                            </div>
                          )}

                          <div>
                            <h3 className="font-semibold">{booking?.type}</h3>

                            <p className="text-sm text-gray-500">
                              Booking ID: {booking?.bookingId}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">
                            ₹ {booking?.totalPrice?.toLocaleString("en-IN")}
                          </p>

                          <p className="text-sm text-gray-500">
                            {booking?.type}
                          </p>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking?.date)}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{booking?.type}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <CreditCard className="w-4 h-4" />
                          <span>Paid</span>
                        </div>
                      </div>

                      {/* Cancellation Section */}
                      {booking?.bookingStatus !== "CANCELLED" ? (
                        <div className="mt-4 border-t pt-4">
                          {/* Show cancellation form */}
                          {cancelBookingId === booking?.bookingId ? (
                            <div className="space-y-3">
                              <select
                                value={cancelReason}
                                onChange={(e) =>
                                  setCancelReason(e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2"
                              >
                                <option value="">
                                  Select cancellation reason
                                </option>

                                <option value="Change of plans">
                                  Change of plans
                                </option>

                                <option value="Found a better price">
                                  Found a better price
                                </option>

                                <option value="Travel dates changed">
                                  Travel dates changed
                                </option>

                                <option value="Flight schedule changed">
                                  Flight schedule changed
                                </option>

                                <option value="Booked by mistake">
                                  Booked by mistake
                                </option>

                                <option value="Personal reasons">
                                  Personal reasons
                                </option>

                                <option value="Other">Other</option>
                              </select>

                              <div className="flex gap-3">
                                {/* Confirm Cancellation */}
                                <button
                                  onClick={() =>
                                    handleCancelBooking(booking?.bookingId)
                                  }
                                  disabled={cancelLoading}
                                  className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                  {cancelLoading
                                    ? "Cancelling..."
                                    : "Confirm Cancellation"}
                                </button>

                                {/* Back */}
                                <button
                                  onClick={() => {
                                    setCancelBookingId(null);
                                    setCancelReason("");
                                  }}
                                  className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                                >
                                  Back
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Cancel Booking Button */
                            <button
                              onClick={() =>
                                setCancelBookingId(booking?.bookingId)
                              }
                              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Cancelled Booking */
                        <div className="mt-4 rounded-lg bg-gray-100 p-4">
                          <p className="font-semibold text-red-600">
                            Booking Cancelled
                          </p>

                          <p className="text-sm mt-1">
                            Reason: {booking?.cancellationReason || "N/A"}
                          </p>

                          <p className="text-sm mt-1">
                            Refund Amount: ₹
                            {booking?.refundAmount?.toLocaleString("en-IN") ||
                              "0"}
                          </p>

                          <p className="text-sm mt-1">
                            Refund Status: {booking?.refundStatus || "PENDING"}
                          </p>

                          <p className="text-sm mt-1">
                            Expected Refund:{" "}
                            {booking?.refundExpectedDate || "N/A"}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
