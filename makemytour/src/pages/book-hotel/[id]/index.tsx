import { useRouter } from "next/router";
import {
  Star,
  MapPin,
  School as Pool,
  UtensilsCrossed,
  Wine,
  Power,
  ChevronRight,
  Camera,
  Image,
  CreditCard,
  Ticket,
  Home,
  BedDouble,
  Crown,
  Check,
  RefreshCw,
  MessageCircle,
  ThumbsUp,
  Flag,
  Send,
  Upload,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  gethotels,
  handlehotelbooking,
  saveUserPreferences,
  getReviews,
  createReview,
  replyToReview,
  markReviewHelpful,
  flagReview,
} from "@/api";

interface Hotel {
  id: string;
  hotelName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string;

  roomTypes?: string[];
  premiumRoomTypes?: string[];
  premiumRoomPrice?: number;
}

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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useDispatch, useSelector } from "react-redux";

import SignupDialog from "@/components/SignupDialog";
import Loader from "@/components/Loader";
import { setUser } from "@/store";

const BookHotelPage = () => {
  // =====================================================
  // STATES
  // =====================================================

  const [quantity, setQuantity] = useState(1);

  const [selectedRoomType, setSelectedRoomType] =
    useState("Standard");

  const [saveRoomPreference, setSaveRoomPreference] =
    useState(false);

  // NEW:
  // Shows when hotel data is being refreshed
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const { id } = router.query;

  const [hotels, sethotels] = useState<Hotel[]>([]);

  const [loading, setLoading] = useState(true);

  const user = useSelector(
    (state: any) => state.user.user
  );

  const [open, setopem] = useState(false);

  // =====================================================
  // TASK 5: REVIEW STATES
  // =====================================================

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [reviewSort, setReviewSort] = useState("newest");
  const [reviewFilterRating, setReviewFilterRating] =
    useState<number | null>(null);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [replyText, setReplyText] =
    useState<Record<string, string>>({});
  const [replyLoading, setReplyLoading] =
    useState<string | null>(null);

  const [helpfulLoading, setHelpfulLoading] =
    useState<string | null>(null);
  const [flagLoading, setFlagLoading] =
    useState<string | null>(null);

  const dispatch = useDispatch();

  // =====================================================
  // FETCH HOTEL
  // =====================================================

  useEffect(() => {
    if (!id) {
      return;
    }

    let isMounted = true;

    const fetchhotels = async (
      showLoader = false
    ) => {
      try {
        if (showLoader) {
          setRefreshing(true);
        }

        const data = await gethotels();

        if (!isMounted) {
          return;
        }

        const filteredData = data.filter(
          (hotel: any) =>
            hotel.id === id
        );

        sethotels(filteredData);

        // =================================================
        // UPDATE QUANTITY ACCORDING TO LATEST AVAILABILITY
        // =================================================

        if (filteredData.length > 0) {
          const latestHotel =
            filteredData[0];

          const latestAvailableRooms =
            Number(
              latestHotel.availableRooms
            ) || 0;

          if (
            latestAvailableRooms <= 0
          ) {
            // No rooms available
            setQuantity(0);
          } else {
            // Keep quantity inside latest availability
            setQuantity((previousQuantity) => {
              const currentQuantity =
                previousQuantity <= 0
                  ? 1
                  : previousQuantity;

              return Math.min(
                currentQuantity,
                latestAvailableRooms
              );
            });
          }
        }
      } catch (error) {
        console.error(
          "Error fetching hotels:",
          error
        );
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    // =====================================================
    // FIRST LOAD
    // =====================================================

    fetchhotels(false);

    // =====================================================
    // AUTO REFRESH EVERY 10 SECONDS
    // =====================================================

    const interval = setInterval(() => {
      fetchhotels(true);
    }, 10000);

    // =====================================================
    // CLEANUP
    // =====================================================

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id]);

  // =====================================================
  // FETCH REVIEWS
  // =====================================================

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchReviews = async () => {
      try {
        setReviewLoading(true);

        const data = await getReviews(
          "HOTEL",
          id as string,
          reviewSort,
          reviewFilterRating
        );

        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [id, reviewSort, reviewFilterRating]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <Loader />;
  }

  // =====================================================
  // HOTEL
  // =====================================================

  const hotel = hotels[0];

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            Hotel not found
          </h2>

          <p className="text-gray-500 mt-2">
            The selected hotel could not be found.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // AVAILABLE ROOMS
  // =====================================================

  const availableRooms =
    Number(hotel.availableRooms) || 0;

  const roomsAvailable =
    availableRooms > 0;

  // =====================================================
  // HOTEL STATIC DATA
  // =====================================================

  const hotelData = {
    name: hotel.hotelName,

    rating: 3,

    maxRating: 5,

    propertyPhotos: 91,

    guestPhotos: 386,

    description:
      "One of the best hotels in North Goa, operating since 2001 catering to international and domestic individual and group travelers.",

    amenities: [
      {
        icon: (
          <Pool className="w-5 h-5" />
        ),
        name: "Swimming Pool",
      },
      {
        icon: (
          <UtensilsCrossed className="w-5 h-5" />
        ),
        name: "Restaurant",
      },
      {
        icon: (
          <Wine className="w-5 h-5" />
        ),
        name: "Bar",
      },
      {
        icon: (
          <Power className="w-5 h-5" />
        ),
        name: "Power Backup",
      },
    ],

    room: {
      type: "Standard Room",

      capacity: "Fits 2 Adults",

      features: [
        "No meals included",
        "10% off on food & beverage services",
        "Complimentary welcome drinks on arrival",
        "Non-Refundable",
      ],

      originalPrice: 8999,

      discountedPrice: 664,

      taxes: 527,
    },

    location: {
      area: "Candolim",

      distance:
        "7 minutes walk to Candolim Beach",
    },

    reviews: {
      rating: 3.8,

      count: 784,

      text: "Very Good",
    },
  };

  // =====================================================
  // ROOM TYPES
  // =====================================================

  const roomTypes =
    hotel.roomTypes &&
    hotel.roomTypes.length > 0
      ? hotel.roomTypes
      : [
          "Standard",
          "Deluxe",
          "Suite",
        ];

  const premiumRoomTypes =
    hotel.premiumRoomTypes &&
    hotel.premiumRoomTypes.length > 0
      ? hotel.premiumRoomTypes
      : [
          "Deluxe",
          "Suite",
        ];

  const premiumRoomPrice =
    hotel.premiumRoomPrice &&
    hotel.premiumRoomPrice > 0
      ? hotel.premiumRoomPrice
      : 1000;

  // =====================================================
  // ROOM TYPE PRICE
  // =====================================================

  const isPremiumRoom =
    premiumRoomTypes.includes(
      selectedRoomType
    );

  const roomPremiumPerRoom =
    isPremiumRoom
      ? premiumRoomPrice
      : 0;

  const totalRoomPremium =
    roomPremiumPerRoom *
    Math.max(quantity, 0);

  // =====================================================
  // QUANTITY
  // =====================================================

  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const value = Number.parseInt(
      e.target.value
    );

    if (!roomsAvailable) {
      setQuantity(0);
      return;
    }

    setQuantity(
      isNaN(value)
        ? 1
        : Math.max(
            1,
            Math.min(
              value,
              availableRooms
            )
          )
    );
  };

  // =====================================================
  // PRICE CALCULATION
  // =====================================================

  const safeQuantity =
    quantity > 0 ? quantity : 0;

  const totalPrice =
    hotel.pricePerNight *
    safeQuantity;

  const totalTaxes =
    hotelData.room.taxes *
    safeQuantity;

  const totalDiscounts =
    hotelData.room.discountedPrice *
    safeQuantity;

  const grandTotal =
    totalPrice +
    totalTaxes -
    totalDiscounts +
    totalRoomPremium;

  // =====================================================
  // ROOM SELECTION
  // =====================================================

  const handleRoomSelection = (
    roomType: string
  ) => {
    if (!roomsAvailable) {
      return;
    }

    setSelectedRoomType(
      roomType
    );
  };

  // =====================================================
  // HOTEL BOOKING
  // =====================================================

  const handlebooking = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!user) {
      return;
    }

    // =================================================
    // CHECK CURRENT AVAILABILITY
    // =================================================

    if (availableRooms <= 0) {
      alert(
        "Sorry, no rooms are currently available."
      );

      return;
    }

    if (
      quantity <= 0 ||
      quantity > availableRooms
    ) {
      alert(
        `Only ${availableRooms} room(s) are currently available.`
      );

      return;
    }

    try {
      // ================================================
      // BOOK HOTEL
      // ================================================

      const data =
        await handlehotelbooking(
          user?.id,
          hotel?.id,
          quantity,
          grandTotal,
          selectedRoomType
        );

      // ================================================
      // SAVE ROOM PREFERENCE
      // ================================================

      let updatedUser = {
        ...user,

        bookings: [
          ...(user.bookings || []),
          data,
        ],
      };

      if (saveRoomPreference) {
        try {
          const preferenceData =
            await saveUserPreferences(
              user?.id,
              "",
              selectedRoomType
            );

          if (preferenceData) {
            updatedUser = {
              ...preferenceData,

              bookings:
                preferenceData.bookings ||
                updatedUser.bookings,
            };
          }
        } catch (preferenceError) {
          console.error(
            "Room preference save error:",
            preferenceError
          );
        }
      }

      // ================================================
      // UPDATE REDUX USER
      // ================================================

      dispatch(
        setUser(updatedUser)
      );

      // ================================================
      // RESET
      // ================================================

      setopem(false);

      setQuantity(1);

      setSelectedRoomType(
        "Standard"
      );

      setSaveRoomPreference(false);

      // ================================================
      // REDIRECT
      // ================================================

      router.push("/profile");

    } catch (error: any) {
      console.error(
        "Hotel booking error:",
        error
      );

      // ================================================
      // BETTER ERROR MESSAGE
      // ================================================

      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data;

      if (
        typeof serverMessage ===
        "string"
      ) {
        alert(serverMessage);
      } else {
        alert(
          "Hotel booking failed. Please refresh the page and try again."
        );
      }
    }
  };

  // =====================================================
  // REVIEW PHOTO UPLOAD
  // =====================================================

  const handleReviewPhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    const remaining = Math.max(0, 3 - reviewPhotos.length);

    files.slice(0, remaining).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} is larger than 2 MB.`);
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          setReviewPhotos((previous) => {
            if (previous.length >= 3) {
              return previous;
            }
            return [...previous, reader.result as string];
          });
        }
      };

      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeReviewPhoto = (index: number) => {
    setReviewPhotos((previous) =>
      previous.filter((_, photoIndex) => photoIndex !== index)
    );
  };

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const handleSubmitReview = async () => {
    if (!user) {
      alert("Please login to write a review.");
      return;
    }

    if (!reviewComment.trim()) {
      alert("Please write your review.");
      return;
    }

    try {
      setReviewSubmitting(true);

      const newReview = await createReview(
        user.id,
        "HOTEL",
        hotel.id,
        hotel.hotelName,
        reviewRating,
        reviewComment.trim(),
        reviewPhotos
      );

      setReviews((previous) => [newReview, ...previous]);
      setReviewRating(5);
      setReviewComment("");
      setReviewPhotos([]);

      alert("Review submitted successfully!");
    } catch (error: any) {
      console.error("Review submission error:", error);
      alert(error?.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // =====================================================
  // REPLY TO REVIEW
  // =====================================================

  const handleReply = async (reviewId: string) => {
    if (!user) {
      alert("Please login to reply.");
      return;
    }

    const comment = replyText[reviewId]?.trim();

    if (!comment) {
      alert("Please enter a reply.");
      return;
    }

    try {
      setReplyLoading(reviewId);

      const updatedReview = await replyToReview(
        reviewId,
        user.id,
        comment
      );

      setReviews((previous) =>
        previous.map((review) =>
          review.id === reviewId ? updatedReview : review
        )
      );

      setReplyText((previous) => ({
        ...previous,
        [reviewId]: "",
      }));
    } catch (error: any) {
      console.error("Reply error:", error);
      alert(error?.message || "Failed to reply.");
    } finally {
      setReplyLoading(null);
    }
  };

  // =====================================================
  // MARK REVIEW HELPFUL
  // =====================================================

  const handleHelpful = async (reviewId: string) => {
    try {
      setHelpfulLoading(reviewId);

      const updatedReview = await markReviewHelpful(reviewId);

      setReviews((previous) =>
        previous.map((review) =>
          review.id === reviewId ? updatedReview : review
        )
      );
    } catch (error: any) {
      console.error("Helpful error:", error);
      alert(error?.message || "Failed to mark review helpful.");
    } finally {
      setHelpfulLoading(null);
    }
  };

  // =====================================================
  // FLAG REVIEW
  // =====================================================

  const handleFlag = async (reviewId: string) => {
    if (!user) {
      alert("Please login to flag a review.");
      return;
    }

    const reason = window.prompt(
      "Why are you flagging this review?"
    );

    if (reason === null) {
      return;
    }

    try {
      setFlagLoading(reviewId);
      await flagReview(reviewId, reason.trim());

      setReviews((previous) =>
        previous.filter((review) => review.id !== reviewId)
      );

      alert("Review flagged for moderator review.");
    } catch (error: any) {
      console.error("Flag error:", error);
      alert(error?.message || "Failed to flag review.");
    } finally {
      setFlagLoading(null);
    }
  };

  const reviewCount = reviews.length;

  const averageRating =
    reviewCount > 0
      ? (
          reviews.reduce(
            (total, review) => total + review.rating,
            0
          ) / reviewCount
        ).toFixed(1)
      : "0.0";

  // =====================================================
  // HOTEL BOOKING DIALOG
  // =====================================================

  const HotelContent = () => (
    <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">

      <DialogHeader>
        <DialogTitle className="text-2xl font-bold flex items-center">
          <Home className="w-6 h-6 mr-2" />
          Hotel Booking Details
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-6 mt-4">

        {/* =================================================
            HOTEL INFORMATION
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Hotel Name */}

          <div className="space-y-2">

            <Label
              htmlFor="hotelName"
              className="flex items-center"
            >
              <MapPin className="w-4 h-4 mr-2" />

              Hotel Name
            </Label>

            <Input
              id="hotelName"
              value={hotel.hotelName}
              readOnly
            />

          </div>

          {/* Location */}

          <div className="space-y-2">

            <Label
              htmlFor="location"
              className="flex items-center"
            >
              <MapPin className="w-4 h-4 mr-2" />

              Location
            </Label>

            <Input
              id="location"
              value={hotel.location}
              readOnly
            />

          </div>

          {/* Price */}

          <div className="space-y-2">

            <Label
              htmlFor="pricePerNight"
              className="flex items-center"
            >
              <Ticket className="w-4 h-4 mr-2" />

              Base Price Per Night
            </Label>

            <Input
              id="pricePerNight"
              value={`₹ ${hotel.pricePerNight}`}
              readOnly
            />

          </div>

          {/* Available Rooms */}

          <div className="space-y-2">

            <Label
              htmlFor="availableRooms"
              className="flex items-center"
            >
              <Ticket className="w-4 h-4 mr-2" />

              Available Rooms
            </Label>

            <div className="relative">

              <Input
                id="availableRooms"
                value={
                  roomsAvailable
                    ? `${availableRooms} rooms available`
                    : "Sold Out"
                }
                readOnly
                className={
                  roomsAvailable
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              />

              {refreshing && (
                <RefreshCw className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
              )}

            </div>

          </div>

          {/* Number of Rooms */}

          <div className="space-y-2">

            <Label
              htmlFor="quantity"
              className="flex items-center"
            >
              <Ticket className="w-4 h-4 mr-2" />

              Number of Rooms
            </Label>

            <Input
              id="quantity"
              type="number"
              min="1"
              max={availableRooms}
              value={
                quantity > 0
                  ? quantity
                  : ""
              }
              disabled={!roomsAvailable}
              onChange={
                handleQuantityChange
              }
            />

          </div>

        </div>

        {/* =================================================
            AVAILABILITY STATUS
        ================================================= */}

        <div
          className={`rounded-lg p-4 border ${
            roomsAvailable
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >

          {roomsAvailable ? (
            <div className="flex items-center justify-between">

              <div>

                <p className="font-semibold text-green-700">
                  Rooms Available
                </p>

                <p className="text-sm text-green-600">
                  {availableRooms} room
                  {availableRooms !== 1
                    ? "s"
                    : ""}{" "}
                  currently available
                </p>

              </div>

              {refreshing && (
                <RefreshCw className="w-5 h-5 animate-spin text-green-600" />
              )}

            </div>
          ) : (
            <div>

              <p className="font-semibold text-red-700">
                Sold Out
              </p>

              <p className="text-sm text-red-600">
                No rooms are currently available.
              </p>

            </div>
          )}

        </div>

        {/* =================================================
            ROOM TYPE SELECTION
        ================================================= */}

        <div>

          <div className="flex items-center justify-between mb-4">

            <h3 className="text-lg font-bold flex items-center">

              <BedDouble className="w-5 h-5 mr-2" />

              Select Room Type

            </h3>

            <span className="text-sm text-gray-500">
              Choose your preferred room
            </span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {roomTypes.map(
              (roomType) => {

                const premium =
                  premiumRoomTypes.includes(
                    roomType
                  );

                const selected =
                  selectedRoomType ===
                  roomType;

                return (
                  <button
                    key={roomType}
                    type="button"
                    disabled={!roomsAvailable}
                    onClick={() =>
                      handleRoomSelection(
                        roomType
                      )
                    }
                    className={`
                      relative
                      text-left
                      rounded-xl
                      border-2
                      p-4
                      transition-all
                      ${
                        !roomsAvailable
                          ? "opacity-50 cursor-not-allowed"
                          : selected
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }
                    `}
                  >

                    {/* Selected Check */}

                    {selected && (
                      <div className="absolute top-2 right-2">

                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">

                          <Check className="w-4 h-4" />

                        </div>

                      </div>
                    )}

                    {/* Premium Badge */}

                    {premium && (
                      <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full mb-3">

                        <Crown className="w-3 h-3" />

                        Premium

                      </div>
                    )}

                    <BedDouble
                      className={`
                        w-8
                        h-8
                        mb-3
                        ${
                          selected
                            ? "text-blue-500"
                            : "text-gray-500"
                        }
                      `}
                    />

                    <h4 className="font-bold text-lg">
                      {roomType}
                    </h4>

                    <p className="text-sm text-gray-500 mt-1">
                      Fits 2 Adults
                    </p>

                    <div className="mt-3">

                      {premium ? (
                        <>
                          <p className="text-xs text-gray-500">
                            Additional charge
                          </p>

                          <p className="font-bold text-orange-600">
                            + ₹{" "}
                            {premiumRoomPrice.toLocaleString()}
                          </p>

                          <p className="text-xs text-gray-400">
                            per room
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-gray-500">
                            Additional charge
                          </p>

                          <p className="font-bold text-green-600">
                            No extra charge
                          </p>
                        </>
                      )}

                    </div>

                  </button>
                );
              }
            )}

          </div>

        </div>

        {/* =================================================
            SELECTED ROOM SUMMARY
        ================================================= */}

        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-sm text-gray-500">
                Selected Room
              </p>

              <p className="font-bold text-lg">
                {selectedRoomType}
              </p>

            </div>

            <div className="text-right">

              <p className="text-sm text-gray-500">
                Premium Charge
              </p>

              <p className="font-bold">

                {totalRoomPremium > 0
                  ? `+ ₹ ${totalRoomPremium.toLocaleString()}`
                  : "₹ 0"}

              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            SAVE ROOM PREFERENCE
        ================================================= */}

        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">

          <label className="flex items-start gap-3 cursor-pointer">

            <input
              type="checkbox"
              checked={saveRoomPreference}
              onChange={(e) =>
                setSaveRoomPreference(
                  e.target.checked
                )
              }
              className="mt-1 h-4 w-4 accent-blue-600 cursor-pointer"
            />

            <div>

              <p className="font-semibold text-blue-700">
                Save room preference
              </p>

              <p className="text-sm text-gray-600 mt-1">
                Save <b>{selectedRoomType}</b>{" "}
                as your preferred room type
                for future bookings.
              </p>

            </div>

          </label>

        </div>

        {/* =================================================
            FARE SUMMARY
        ================================================= */}

        <div className="bg-gray-100 rounded-lg p-4">

          <h3 className="text-lg font-bold mb-4 flex items-center">

            <CreditCard className="w-5 h-5 mr-2" />

            Fare Summary

          </h3>

          <div className="space-y-2">

            <div className="flex justify-between items-center">

              <span className="text-gray-600">
                Base Fare
              </span>

              <span className="font-medium">
                ₹{" "}
                {totalPrice.toLocaleString()}
              </span>

            </div>

            <div className="flex justify-between items-center">

              <span className="text-gray-600">
                Taxes and Extra Charges
              </span>

              <span className="font-medium">
                ₹{" "}
                {totalTaxes.toLocaleString()}
              </span>

            </div>

            <div className="flex justify-between items-center text-green-600">

              <span className="font-medium">
                Discounts
              </span>

              <span className="font-medium">
                - ₹{" "}
                {Math.abs(
                  totalDiscounts
                ).toLocaleString()}
              </span>

            </div>

            {totalRoomPremium > 0 && (
              <div className="flex justify-between items-center text-orange-600">

                <span className="font-medium">
                  {selectedRoomType} Upgrade
                </span>

                <span className="font-medium">
                  + ₹{" "}
                  {totalRoomPremium.toLocaleString()}
                </span>

              </div>
            )}

            <div className="border-t pt-2 mt-2">

              <div className="flex justify-between items-center">

                <span className="font-bold text-lg">
                  Total Amount
                </span>

                <span className="font-bold text-lg">
                  ₹{" "}
                  {grandTotal.toLocaleString()}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* BOOK BUTTON */}

      <Button
        className="w-full mt-4"
        disabled={!roomsAvailable || quantity <= 0}
        onClick={handlebooking}
      >
        {roomsAvailable
          ? "Proceed to Payment"
          : "Sold Out"}
      </Button>

    </DialogContent>
  );

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="bg-white border-b">

        <div className="max-w-7xl mx-auto px-4 py-3">

          <div className="flex items-center space-x-2 text-sm">

            <a
              href="/"
              className="text-blue-500"
            >
              Home
            </a>

            <ChevronRight className="w-4 h-4 text-gray-400" />

            <a
              href="/"
              className="text-blue-500"
            >
              {hotel?.location}
            </a>

            <ChevronRight className="w-4 h-4 text-gray-400" />

            <span className="text-gray-600">
              {hotel?.hotelName}
            </span>

          </div>

        </div>

      </div>

      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <div className="max-w-7xl mx-auto px-4 py-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="lg:col-span-2">

            {/* HOTEL TITLE */}

            <div className="mb-6">

              <div className="flex items-center justify-between">

                <div>

                  <h1 className="text-2xl font-bold mb-2">
                    {hotel.hotelName}
                  </h1>

                  <div className="flex items-center space-x-1">

                    {[...Array(
                      hotelData.rating
                    )].map((_, i) => (

                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />

                    ))}

                    {[...Array(
                      hotelData.maxRating -
                        hotelData.rating
                    )].map((_, i) => (

                      <Star
                        key={i}
                        className="w-5 h-5 text-gray-300"
                      />

                    ))}

                  </div>

                </div>

                {/* LIVE AVAILABILITY */}

                <div
                  className={`px-4 py-2 rounded-lg border ${
                    roomsAvailable
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >

                  <div className="flex items-center gap-2">

                    {refreshing && (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    )}

                    <div>

                      <p
                        className={`text-sm font-semibold ${
                          roomsAvailable
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {roomsAvailable
                          ? "Available"
                          : "Sold Out"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {roomsAvailable
                          ? `${availableRooms} room${
                              availableRooms !== 1
                                ? "s"
                                : ""
                            } left`
                          : "No rooms available"}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                IMAGE GALLERY
            ================================================= */}

            <div className="grid grid-cols-3 gap-4 mb-8">

              <div className="col-span-2 relative group cursor-pointer">

                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800"
                  alt="Hotel Main"
                  className="w-full h-80 object-cover rounded-lg"
                />

                <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-full flex items-center space-x-1">

                  <Camera className="w-4 h-4" />

                  <span className="text-sm">
                    +{hotelData.propertyPhotos} Property Photos
                  </span>

                </div>

              </div>

              <div className="space-y-4">

                <div className="relative group cursor-pointer">

                  <img
                    src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800"
                    alt="Hotel Room"
                    className="w-full h-[152px] object-cover rounded-lg"
                  />

                </div>

                <div className="relative group cursor-pointer">

                  <img
                    src="https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800"
                    alt="Hotel Amenity"
                    className="w-full h-[152px] object-cover rounded-lg"
                  />

                  <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-full flex items-center space-x-1">

                    <Image className="w-4 h-4" />

                    <span className="text-sm">
                      +{hotelData.guestPhotos} Guest Photos
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <p className="text-gray-600 mb-6">

              {hotelData.description}

              <button className="text-blue-500 ml-2">
                Read more
              </button>

            </p>

            {/* =================================================
                AMENITIES
            ================================================= */}

            <div className="mb-8">

              <h2 className="text-xl font-semibold mb-4">
                Amenities
              </h2>

              <div className="flex flex-wrap gap-6">

                {hotelData.amenities.map(
                  (amenity, index) => (

                    <div
                      key={index}
                      className="flex items-center space-x-2 text-gray-600"
                    >

                      {amenity.icon}

                      <span>
                        {amenity.name}
                      </span>

                    </div>

                  )
                )}

                <button className="text-blue-500">
                  + 31 Amenities
                </button>

              </div>

            </div>

            {/* =================================================
                ROOM OPTIONS PREVIEW
            ================================================= */}

            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h2 className="text-xl font-bold">
                    Choose Your Room
                  </h2>

                  <p className="text-gray-500 text-sm mt-1">
                    Select a room type according to your preference.
                  </p>

                </div>

                <div className="flex items-center gap-2">

                  {refreshing && (
                    <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                  )}

                  <BedDouble className="w-7 h-7 text-blue-500" />

                </div>

              </div>

              {/* AVAILABILITY */}

              <div
                className={`mb-5 rounded-lg p-3 ${
                  roomsAvailable
                    ? "bg-green-50"
                    : "bg-red-50"
                }`}
              >

                {roomsAvailable ? (
                  <p className="text-green-700 text-sm font-medium">
                    ✓ {availableRooms} room
                    {availableRooms !== 1
                      ? "s"
                      : ""}{" "}
                    currently available
                  </p>
                ) : (
                  <p className="text-red-700 text-sm font-medium">
                    ✕ This hotel is currently sold out
                  </p>
                )}

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {roomTypes.map(
                  (roomType) => {

                    const premium =
                      premiumRoomTypes.includes(
                        roomType
                      );

                    const selected =
                      selectedRoomType ===
                      roomType;

                    return (

                      <div
                        key={roomType}
                        onClick={() =>
                          handleRoomSelection(
                            roomType
                          )
                        }
                        className={`
                          cursor-pointer
                          rounded-xl
                          border-2
                          p-5
                          transition-all
                          ${
                            !roomsAvailable
                              ? "opacity-50 cursor-not-allowed"
                              : selected
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-blue-300"
                          }
                        `}
                      >

                        <div className="flex justify-between">

                          <BedDouble
                            className={`w-8 h-8 ${
                              selected
                                ? "text-blue-500"
                                : "text-gray-400"
                            }`}
                          />

                          {selected && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full text-white flex items-center justify-center">

                              <Check className="w-4 h-4" />

                            </div>
                          )}

                        </div>

                        {premium && (
                          <div className="mt-3 inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">

                            <Crown className="w-3 h-3" />

                            Premium

                          </div>
                        )}

                        <h3 className="font-bold text-lg mt-3">
                          {roomType}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          Fits 2 Adults
                        </p>

                        <div className="mt-4">

                          {premium ? (
                            <p className="text-orange-600 font-semibold">

                              + ₹{" "}
                              {premiumRoomPrice.toLocaleString()}

                              <span className="text-xs text-gray-500 font-normal">
                                {" "}per room
                              </span>

                            </p>
                          ) : (
                            <p className="text-green-600 font-semibold">
                              No extra charge
                            </p>
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              BOOKING CARD
          ================================================= */}

          <div className="lg:col-span-1">

            <div className="bg-white rounded-xl shadow-lg p-6">

              <div className="flex items-center justify-between">

                <h3 className="text-xl font-semibold mb-2">
                  {selectedRoomType} Room
                </h3>

                {isPremiumRoom && (
                  <Crown className="w-5 h-5 text-yellow-500" />
                )}

              </div>

              <p className="text-gray-600 mb-4">
                Fits 2 Adults
              </p>

              <ul className="space-y-3 mb-6">

                {hotelData.room.features.map(
                  (feature, index) => (

                    <li
                      key={index}
                      className="flex items-start space-x-2"
                    >

                      <span className="text-gray-400">
                        •
                      </span>

                      <span className="text-gray-600">
                        {feature}
                      </span>

                    </li>
                  )
                )}

              </ul>

              {/* ROOM SELECTION */}

              <div className="mb-6">

                <h4 className="font-semibold mb-3">
                  Room Type
                </h4>

                <div className="space-y-2">

                  {roomTypes.map(
                    (roomType) => {

                      const premium =
                        premiumRoomTypes.includes(
                          roomType
                        );

                      const selected =
                        selectedRoomType ===
                        roomType;

                      return (

                        <button
                          key={roomType}
                          type="button"
                          disabled={!roomsAvailable}
                          onClick={() =>
                            handleRoomSelection(
                              roomType
                            )
                          }
                          className={`
                            w-full
                            flex
                            items-center
                            justify-between
                            border
                            rounded-lg
                            px-4
                            py-3
                            transition-colors
                            ${
                              !roomsAvailable
                                ? "opacity-50 cursor-not-allowed"
                                : selected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:bg-gray-50"
                            }
                          `}
                        >

                          <div className="flex items-center gap-3">

                            <BedDouble className="w-5 h-5" />

                            <span className="font-medium">
                              {roomType}
                            </span>

                          </div>

                          <div className="flex items-center gap-2">

                            {premium && (
                              <span className="text-xs text-orange-600">
                                +₹
                                {premiumRoomPrice}
                              </span>
                            )}

                            {selected && (
                              <Check className="w-5 h-5 text-blue-500" />
                            )}

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>

              </div>

              {/* PRICE */}

              <div className="mb-6">

                <div className="flex items-center justify-between mb-2">

                  <span className="text-gray-800 font-semibold">
                    Base Price:
                  </span>

                  <span className="text-lg font-medium">
                    ₹{" "}
                    {totalPrice.toLocaleString()}
                  </span>

                </div>

                <div className="flex items-center justify-between mb-2">

                  <span className="text-gray-800 font-semibold">
                    Room Upgrade:
                  </span>

                  <span className="text-lg font-medium text-orange-600">

                    {totalRoomPremium > 0
                      ? `+ ₹ ${totalRoomPremium.toLocaleString()}`
                      : "₹ 0"}

                  </span>

                </div>

                {/* LIVE AVAILABLE ROOMS */}

                <div className="flex items-center justify-between mb-4">

                  <span className="text-gray-800 font-semibold">
                    Available Rooms:
                  </span>

                  <span
                    className={`text-lg font-medium ${
                      roomsAvailable
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {roomsAvailable
                      ? availableRooms
                      : "Sold Out"}
                  </span>

                </div>

                {/* Amenities */}

                <div>

                  <h4 className="text-gray-800 font-semibold mb-2">
                    Amenities:
                  </h4>

                  <p className="text-gray-600">
                    {hotel.amenities}
                  </p>

                </div>

              </div>

              {/* PRICE SUMMARY */}

              <div className="space-y-2 mb-6">

                <div className="flex items-center justify-between">

                  <span className="text-gray-500">
                    Base Fare
                  </span>

                  <span className="text-gray-700">
                    ₹{" "}
                    {totalPrice.toLocaleString()}
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-gray-500">
                    Taxes & Fees
                  </span>

                  <span className="text-gray-700">
                    ₹{" "}
                    {totalTaxes.toLocaleString()}
                  </span>

                </div>

                <div className="flex items-center justify-between text-green-600">

                  <span>
                    Discount
                  </span>

                  <span>
                    - ₹{" "}
                    {totalDiscounts.toLocaleString()}
                  </span>

                </div>

                {totalRoomPremium > 0 && (

                  <div className="flex items-center justify-between text-orange-600">

                    <span>
                      Premium Upgrade
                    </span>

                    <span>
                      + ₹{" "}
                      {totalRoomPremium.toLocaleString()}
                    </span>

                  </div>

                )}

                <div className="border-t pt-3 mt-3">

                  <div className="flex items-center justify-between">

                    <span className="font-bold text-xl">
                      Total
                    </span>

                    <span className="font-bold text-xl">
                      ₹{" "}
                      {grandTotal.toLocaleString()}
                    </span>

                  </div>

                </div>

              </div>

              {/* BOOK BUTTON */}

              <Dialog
                open={open}
                onOpenChange={setopem}
              >

                <DialogTrigger asChild>

                  <button
                    disabled={!roomsAvailable}
                    className={`
                      w-full
                      text-white
                      py-3
                      rounded-lg
                      transition-colors
                      mb-3
                      ${
                        roomsAvailable
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    {roomsAvailable
                      ? "BOOK THIS NOW"
                      : "SOLD OUT"}
                  </button>

                </DialogTrigger>

                {user ? (

                  <HotelContent />

                ) : (

                  <DialogContent className="bg-white">

                    <DialogHeader>

                      <DialogTitle>
                        Login Required
                      </DialogTitle>

                    </DialogHeader>

                    <p>
                      Please log in to continue with your booking.
                    </p>

                    <SignupDialog
                      trigger={
                        <Button className="w-full">
                          Log In / Sign Up
                        </Button>
                      }
                    />

                  </DialogContent>
                )}

              </Dialog>

              <button className="w-full text-blue-500 text-center">
                14 More Options
              </button>

            </div>

            {/* =================================================
                RATING CARD
            ================================================= */}

            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">

              <div className="flex items-center justify-between mb-4">

                <div className="flex items-center space-x-4">

                  <div className="bg-blue-500 text-white text-2xl font-bold w-16 h-16 rounded-lg flex items-center justify-center">
                    {hotelData.reviews.rating}
                  </div>

                  <div>

                    <div className="font-semibold text-lg">
                      {hotelData.reviews.text}
                    </div>

                    <div className="text-gray-500">
                      ({hotelData.reviews.count} ratings)
                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("reviews-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-blue-500"
                >
                  All Reviews
                </button>

              </div>

            </div>

            {/* =================================================
                TASK 5 - REVIEWS & RATINGS
            ================================================= */}

            <div
              id="reviews-section"
              className="bg-white rounded-xl shadow-lg p-6 mt-6"
            >

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Reviews & Ratings</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {reviewCount} review{reviewCount !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold">{averageRating}</div>
                  <div className="flex justify-end">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(Number(averageRating))
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* WRITE REVIEW */}

              <div className="border rounded-xl p-4 mb-6 bg-gray-50">
                <h3 className="font-bold text-lg mb-4">Write a Review</h3>

                {!user ? (
                  <p className="text-sm text-gray-500">
                    Please login to write a review.
                  </p>
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Your Rating</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-0.5"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                star <= reviewRating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Write your detailed review..."
                      rows={4}
                      className="w-full border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="mt-4">
                      <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Upload Photos (up to 3)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleReviewPhotoChange}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum 2 MB per image.
                      </p>
                    </div>

                    {reviewPhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        {reviewPhotos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={photo}
                              alt={`Review photo ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeReviewPhoto(index)}
                              className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      type="button"
                      className="mt-4"
                      disabled={reviewSubmitting}
                      onClick={handleSubmitReview}
                    >
                      {reviewSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </>
                )}
              </div>

              {/* SORT AND FILTER */}

              <div className="flex flex-col md:flex-row gap-3 mb-5">
                <select
                  value={reviewSort}
                  onChange={(e) => setReviewSort(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="newest">Newest</option>
                  <option value="highest">Highest Rated</option>
                  <option value="helpful">Most Helpful</option>
                </select>

                <select
                  value={reviewFilterRating ?? ""}
                  onChange={(e) =>
                    setReviewFilterRating(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              {/* REVIEW LIST */}

              {reviewLoading ? (
                <div className="py-8 text-center text-gray-500">
                  Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-8 text-center border rounded-lg">
                  <Star className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-medium">No reviews found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Be the first person to review this hotel.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-xl p-4">

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{review.userName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {review.createdAt
                                ? new Date(review.createdAt).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={flagLoading === review.id}
                          onClick={() => handleFlag(review.id)}
                          className="text-gray-400 hover:text-red-500"
                          title="Flag review"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-gray-700 mt-3 whitespace-pre-wrap">
                        {review.comment}
                      </p>

                      {review.photos && review.photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          {review.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Review photo ${index + 1}`}
                              className="w-full h-28 object-cover rounded-lg border"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-4">
                        <button
                          type="button"
                          disabled={helpfulLoading === review.id}
                          onClick={() => handleHelpful(review.id)}
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Helpful ({review.helpfulCount || 0})
                        </button>

                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <MessageCircle className="w-4 h-4" />
                          {review.replies?.length || 0} Replies
                        </span>
                      </div>

                      {review.replies && review.replies.length > 0 && (
                        <div className="mt-4 ml-5 border-l-2 pl-4 space-y-3">
                          {review.replies.map((reply) => (
                            <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                              <p className="font-medium text-sm">
                                {reply.userName}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {reply.comment}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {user && (
                        <div className="flex gap-2 mt-4">
                          <Input
                            value={replyText[review.id] || ""}
                            onChange={(e) =>
                              setReplyText((previous) => ({
                                ...previous,
                                [review.id]: e.target.value,
                              }))
                            }
                            placeholder="Write a reply..."
                          />
                          <Button
                            type="button"
                            size="icon"
                            disabled={replyLoading === review.id}
                            onClick={() => handleReply(review.id)}
                            title="Reply"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* =================================================
                LOCATION CARD
            ================================================= */}

            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">

              <div className="flex items-start justify-between">

                <div>

                  <h3 className="font-semibold text-lg mb-1">
                    {hotel.location}
                  </h3>

                </div>

                <button className="text-blue-500">
                  See on Map
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default BookHotelPage;