"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Textarea } from "@/components/ui/textarea";

import FlightList from "@/components/Flights/Flightlist";
import PriceHistory from "@/components/Flights/PriceHistory";

import {
  addflight,
  addhotel,
  editflight,
  edithotel,
  getTrackedFlights,
  getuserbyemail,
  updateRefundStatus,
} from "@/api";

import HotelList from "@/components/Hotel/Hotel";

/* =========================
   MOCK FLIGHTS
========================= */

const mockFlights = [
  {
    _id: "1",
    flightName: "AirOne 101",
    from: "New York",
    to: "London",
    departureTime: "2023-07-01T08:00",
    arrivalTime: "2023-07-01T20:00",
    price: 500,
    availableSeats: 150,
  },
  {
    _id: "2",
    flightName: "SkyHigh 202",
    from: "Paris",
    to: "Tokyo",
    departureTime: "2023-07-02T10:00",
    arrivalTime: "2023-07-03T06:00",
    price: 800,
    availableSeats: 200,
  },
  {
    _id: "3",
    flightName: "EagleWings 303",
    from: "Los Angeles",
    to: "Sydney",
    departureTime: "2023-07-03T22:00",
    arrivalTime: "2023-07-05T06:00",
    price: 1200,
    availableSeats: 180,
  },
];

/* =========================
   MOCK HOTELS
========================= */

const mockHotels = [
  {
    _id: "1",
    hotelName: "Luxury Palace",
    location: "Paris, France",
    pricePerNight: 300,
    availableRooms: 50,
    amenities: "Wi-Fi, Pool, Spa, Restaurant",
  },
  {
    _id: "2",
    hotelName: "Seaside Resort",
    location: "Bali, Indonesia",
    pricePerNight: 200,
    availableRooms: 100,
    amenities: "Beach Access, Wi-Fi, Restaurant, Water Sports",
  },
  {
    _id: "3",
    hotelName: "Mountain Lodge",
    location: "Aspen, Colorado",
    pricePerNight: 250,
    availableRooms: 30,
    amenities: "Ski-in/Ski-out, Fireplace, Hot Tub, Restaurant",
  },
];

/* =========================
   USER INTERFACE
========================= */

interface User {
  bookings: any[];
  _id?: string;
  id?: string;
  userId?: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  phoneNumber: string;
}

/* =========================
   USER SEARCH
========================= */

function UserSearch() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await getuserbyemail(email);

      console.log("FULL USER DATA:", data);

      const mockUser: User = data;

      console.log("USER _id:", mockUser._id);

      setUser(mockUser);
    } catch (error) {
      console.error("User search error:", error);
      alert("User not found");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>

          <Input
            id="email"
            type="email"
            placeholder="Search user by email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit">Search</Button>
      </form>

      {user && (
        <div className="border p-4 rounded-md">
          <h3 className="font-bold mb-2">User Details</h3>

          <p>
            <strong>Name:</strong> {user.firstname} {user.lastname}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Role:</strong> {user.role}
          </p>

          <p>
            <strong>Phone:</strong> {user.phoneNumber}
          </p>

          {user.bookings && user.bookings.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Bookings</h3>

              <div className="space-y-3">
                {user.bookings.map(
                  (booking: any, index: number) => (
                    <div
                      key={booking.bookingId || index}
                      className="border rounded-md p-3"
                    >
                      <p>
                        <strong>Booking ID:</strong>{" "}
                        {booking.bookingId}
                      </p>

                      <p>
                        <strong>Type:</strong>{" "}
                        {booking.type}
                      </p>

                      <p>
                        <strong>Total Price:</strong> ₹
                        {booking.totalPrice}
                      </p>

                      <p>
                        <strong>Booking Status:</strong>{" "}
                        {booking.bookingStatus}
                      </p>

                      <p>
                        <strong>Refund Amount:</strong> ₹
                        {booking.refundAmount || 0}
                      </p>

                      <p>
                        <strong>Refund Status:</strong>{" "}
                        {booking.refundStatus || "PENDING"}
                      </p>

                      <p>
                        <strong>Expected Refund:</strong>{" "}
                        {booking.refundExpectedDate || "N/A"}
                      </p>

                      {booking.bookingStatus ===
                        "CANCELLED" && (
                        <div className="flex gap-2 mt-3">
                          {booking.refundStatus ===
                            "PENDING" && (
                            <Button
                              onClick={async () => {
                                try {
                                  await updateRefundStatus(
                                    user.id!,
                                    booking.bookingId,
                                    "PROCESSED"
                                  );

                                  alert(
                                    "Refund status updated to PROCESSED"
                                  );
                                } catch (error) {
                                  console.error(error);

                                  alert(
                                    "Failed to update refund status"
                                  );
                                }
                              }}
                            >
                              Mark as Processed
                            </Button>
                          )}

                          {booking.refundStatus ===
                            "PROCESSED" && (
                            <Button
                              onClick={async () => {
                                try {
                                  await updateRefundStatus(
                                    user.id!,
                                    booking.bookingId,
                                    "COMPLETED"
                                  );

                                  alert(
                                    "Refund status updated to COMPLETED"
                                  );
                                } catch (error) {
                                  console.error(error);

                                  alert(
                                    "Failed to update refund status"
                                  );
                                }
                              }}
                            >
                              Mark as Completed
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================
   HOTEL INTERFACE
========================= */

interface Hotel {
  id?: string;
  hotelName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string;
}

/* =========================
   ADD / EDIT HOTEL
========================= */

function AddEditHotel({
  hotel,
}: {
  hotel: Hotel | null;
}) {
  const [formData, setFormData] = useState<Hotel>({
    hotelName: "",
    location: "",
    pricePerNight: 0,
    availableRooms: 0,
    amenities: "",
  });

  useEffect(() => {
    if (hotel) {
      setFormData(hotel);
    } else {
      setFormData({
        hotelName: "",
        location: "",
        pricePerNight: 0,
        availableRooms: 0,
        amenities: "",
      });
    }
  }, [hotel]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      if (hotel) {
        await edithotel(
          hotel.id,
          formData.hotelName,
          formData.location,
          formData.pricePerNight,
          formData.availableRooms,
          formData.amenities
        );

        alert("Hotel updated successfully");
        return;
      }

      await addhotel(
        formData.hotelName,
        formData.location,
        formData.pricePerNight,
        formData.availableRooms,
        formData.amenities
      );

      alert("Hotel added successfully");

      setFormData({
        hotelName: "",
        location: "",
        pricePerNight: 0,
        availableRooms: 0,
        amenities: "",
      });
    } catch (error) {
      console.error(error);
      alert("Hotel operation failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold mb-2">
        {hotel ? "Edit Hotel" : "Add New Hotel"}
      </h3>

      <div>
        <Label htmlFor="hotelName">
          Hotel Name
        </Label>

        <Input
          id="hotelName"
          name="hotelName"
          value={formData.hotelName}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="location">
          Location
        </Label>

        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="pricePerNight">
          Price Per Night
        </Label>

        <Input
          id="pricePerNight"
          name="pricePerNight"
          type="number"
          value={formData.pricePerNight}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="availableRooms">
          Available Rooms
        </Label>

        <Input
          id="availableRooms"
          name="availableRooms"
          type="number"
          value={formData.availableRooms}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="amenities">
          Amenities
        </Label>

        <Textarea
          id="amenities"
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          required
        />
      </div>

      <Button type="submit">
        {hotel ? "Update Hotel" : "Add Hotel"}
      </Button>
    </form>
  );
}

/* =========================
   FLIGHT INTERFACE
========================= */

interface Flight {
  id?: string;
  flightName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

/* =========================
   ADD / EDIT FLIGHT
========================= */

function AddEditFlight({
  flight,
}: {
  flight: Flight | null;
}) {
  const [formData, setFormData] =
    useState<Flight>({
      flightName: "",
      from: "",
      to: "",
      departureTime: "",
      arrivalTime: "",
      price: 0,
      availableSeats: 0,
    });

  useEffect(() => {
    if (flight) {
      setFormData(flight);
    } else {
      setFormData({
        flightName: "",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: 0,
        availableSeats: 0,
      });
    }
  }, [flight]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      if (flight) {
        await editflight(
          flight.id,
          formData.flightName,
          formData.from,
          formData.to,
          formData.departureTime,
          formData.arrivalTime,
          formData.price,
          formData.availableSeats
        );

        alert("Flight updated successfully");
        return;
      }

      await addflight(
        formData.flightName,
        formData.from,
        formData.to,
        formData.departureTime,
        formData.arrivalTime,
        formData.price,
        formData.availableSeats
      );

      alert("Flight added successfully");

      setFormData({
        flightName: "",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: 0,
        availableSeats: 0,
      });
    } catch (error) {
      console.error(error);
      alert("Flight operation failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold mb-2">
        {flight ? "Edit Flight" : "Add New Flight"}
      </h3>

      <div>
        <Label htmlFor="flightName">
          Flight Name
        </Label>

        <Input
          id="flightName"
          name="flightName"
          value={formData.flightName}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="from">From</Label>

        <Input
          id="from"
          name="from"
          value={formData.from}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="to">To</Label>

        <Input
          id="to"
          name="to"
          value={formData.to}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="departureTime">
          Departure Time
        </Label>

        <Input
          id="departureTime"
          name="departureTime"
          type="datetime-local"
          value={formData.departureTime}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="arrivalTime">
          Arrival Time
        </Label>

        <Input
          id="arrivalTime"
          name="arrivalTime"
          type="datetime-local"
          value={formData.arrivalTime}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="price">
          Price
        </Label>

        <Input
          id="price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="availableSeats">
          Available Seats
        </Label>

        <Input
          id="availableSeats"
          name="availableSeats"
          type="number"
          value={formData.availableSeats}
          onChange={handleChange}
          required
        />
      </div>

      <Button type="submit">
        {flight ? "Update Flight" : "Add Flight"}
      </Button>
    </form>
  );
}

/* =========================
   REVIEW INTERFACE
========================= */

interface Review {
  id: string;
  targetType: string;
  targetId: string;
  targetName?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  photos?: string[];
  helpfulCount: number;
  flagged: boolean;
  flagReason?: string;
  moderationStatus: string;
  createdAt: string;
  updatedAt?: string;
  replies?: {
    id: string;
    userId: string;
    userName: string;
    comment: string;
    createdAt: string;
  }[];
}

/* =========================
   REVIEW MODERATION
========================= */

function ReviewModeration() {
  const [reviews, setReviews] = useState<Review[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const fetchFlaggedReviews = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/reviews/flagged"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch flagged reviews"
        );
      }

      const data = await response.json();

      setReviews(data || []);
    } catch (error) {
      console.error(
        "Flagged reviews error:",
        error
      );

      alert("Failed to load flagged reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedReviews();
  }, []);

  const moderateReview = async (
    reviewId: string,
    status: "APPROVED" | "REMOVED"
  ) => {
    try {
      const response = await fetch(
        `http://localhost:8080/reviews/${reviewId}/moderate?status=${status}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update review"
        );
      }

      alert(
        status === "APPROVED"
          ? "Review approved successfully"
          : "Review removed successfully"
      );

      setReviews((previousReviews) =>
        previousReviews.filter(
          (review) => review.id !== reviewId
        )
      );
    } catch (error) {
      console.error(
        "Moderation error:",
        error
      );

      alert("Failed to moderate review");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        Loading flagged reviews...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            Review Moderation
          </h2>

          <p className="text-gray-500">
            Review flagged content before
            approving or removing it.
          </p>
        </div>

        <Button onClick={fetchFlaggedReviews}>
          Refresh
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            No flagged reviews available.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between gap-4">
                  <div>
                    <CardTitle>
                      {review.targetName ||
                        review.targetType}
                    </CardTitle>

                    <CardDescription>
                      {review.targetType} • User:{" "}
                      {review.userName}
                    </CardDescription>
                  </div>

                  <div className="text-yellow-500 font-bold">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(
                      Math.max(0, 5 - review.rating)
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <p className="font-medium">
                      Review
                    </p>

                    <p className="mt-1">
                      {review.comment}
                    </p>
                  </div>

                  <div>
                    <p>
                      <strong>User:</strong>{" "}
                      {review.userName}
                    </p>

                    <p>
                      <strong>Rating:</strong>{" "}
                      {review.rating}/5
                    </p>

                    <p>
                      <strong>Helpful:</strong>{" "}
                      {review.helpfulCount}
                    </p>

                    <p>
                      <strong>Flag Reason:</strong>{" "}
                      {review.flagReason ||
                        "Not specified"}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      {review.moderationStatus}
                    </p>

                    <p>
                      <strong>Created:</strong>{" "}
                      {review.createdAt
                        ? new Date(
                            review.createdAt
                          ).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  {review.photos &&
                    review.photos.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">
                          Review Photos
                        </p>

                        <div className="grid grid-cols-3 gap-3">
                          {review.photos.map(
                            (
                              photo,
                              index
                            ) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Review photo ${
                                  index + 1
                                }`}
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {review.replies &&
                    review.replies.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">
                          Replies
                        </p>

                        <div className="space-y-2">
                          {review.replies.map(
                            (reply) => (
                              <div
                                key={reply.id}
                                className="border rounded-md p-3"
                              >
                                <p className="font-medium">
                                  {
                                    reply.userName
                                  }
                                </p>

                                <p>
                                  {
                                    reply.comment
                                  }
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  <div className="flex gap-3 pt-3">
                    <Button
                      onClick={() =>
                        moderateReview(
                          review.id,
                          "APPROVED"
                        )
                      }
                    >
                      Approve Review
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() =>
                        moderateReview(
                          review.id,
                          "REMOVED"
                        )
                      }
                    >
                      Remove Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   ADMIN DASHBOARD
========================= */

export default function AdminDashboard() {
  const [activeTab, setActiveTab] =
    useState("flights");

  const [selectedFlight, setSelectedFlight] =
    useState<any>(null);

  const [selectedHotel, setSelectedHotel] =
    useState<Hotel | null>(null);

  const [trackedFlights, setTrackedFlights] =
    useState<any[]>([]);

  useEffect(() => {
    const fetchTrackedFlights = async () => {
      try {
        const data = await getTrackedFlights();

        setTrackedFlights(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTrackedFlights();
  }, []);

  return (
    <div className="container mx-auto p-4 bg-white max-w-full">
      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard
      </h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-5 text-black">
          <TabsTrigger value="flights">
            Flights
          </TabsTrigger>

          <TabsTrigger value="hotels">
            Hotels
          </TabsTrigger>

          <TabsTrigger value="users">
            Users
          </TabsTrigger>

          <TabsTrigger value="refunds">
            Refunds
          </TabsTrigger>

          <TabsTrigger value="reviews">
            Reviews
          </TabsTrigger>
        </TabsList>

        {/* =========================
            FLIGHTS
        ========================= */}

        <TabsContent value="flights">
          <Card>
            <CardHeader>
              <CardTitle>
                Manage Flights
              </CardTitle>

              <CardDescription>
                Add, edit, or remove flights
                from the system.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FlightList
                  onSelect={setSelectedFlight}
                />

                <AddEditFlight
                  flight={selectedFlight}
                />
              </div>

              {selectedFlight && (
                <PriceHistory
                  flightId={selectedFlight.id}
                />
              )}

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">
                  Tracked Flights
                </h2>

                {trackedFlights.length === 0 ? (
                  <p>
                    No tracked flights available.
                  </p>
                ) : (
                  trackedFlights.map(
                    (flight: any) => (
                      <div
                        key={flight.id}
                        className="border rounded-lg p-4 mb-3 shadow"
                      >
                        <h3 className="font-semibold">
                          {flight.flightName}
                        </h3>

                        <p>
                          {flight.from} →{" "}
                          {flight.to}
                        </p>

                        <p>
                          Status:{" "}
                          {flight.status}
                        </p>

                        <p>
                          Delay:{" "}
                          {flight.delayMinutes}{" "}
                          min
                        </p>

                        <p>
                          Reason:{" "}
                          {flight.delayReason}
                        </p>
                      </div>
                    )
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =========================
            HOTELS
        ========================= */}

        <TabsContent value="hotels">
          <Card>
            <CardHeader>
              <CardTitle>
                Manage Hotels
              </CardTitle>

              <CardDescription>
                Add, edit, or remove hotels
                from the system.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <HotelList
                  onSelect={setSelectedHotel}
                />

                <AddEditHotel
                  hotel={selectedHotel}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =========================
            USERS
        ========================= */}

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>
                User Management
              </CardTitle>

              <CardDescription>
                Search for users by email.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <UserSearch />
            </CardContent>
          </Card>
        </TabsContent>

        {/* =========================
            REFUNDS
        ========================= */}

        <TabsContent value="refunds">
          <Card>
            <CardHeader>
              <CardTitle>
                Refund Management
              </CardTitle>

              <CardDescription>
                Manage cancelled booking
                refunds.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="text-center py-10 text-gray-500">
                Refund management is handled
                from User Management.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =========================
            REVIEW MODERATION
        ========================= */}

        <TabsContent value="reviews">
          <ReviewModeration />
        </TabsContent>
      </Tabs>
    </div>
  );
}