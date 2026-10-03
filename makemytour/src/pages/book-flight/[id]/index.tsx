import { useRouter } from "next/router";
import {
  Plane,
  MapPin,
  Clock,
  Users,
  CreditCard,
  Armchair,
  Crown,
  Check,
  ChevronRight,
  Ticket,
  MessageCircle,
  ThumbsUp,
  Flag,
  Send,
  Star,
  Upload,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  getflight,
  handleflightbooking,
  saveUserPreferences,
  getReviews,
  createReview,
  replyToReview,
  markReviewHelpful,
  flagReview,
} from "@/api";

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

interface Flight {
  id: string;
  airline?: string;
  flightNumber?: string;

  source?: string;
  destination?: string;

  from?: string;
  to?: string;

  departureTime?: string;
  arrivalTime?: string;

  departure?: string;
  arrival?: string;

  price?: number;
  availableSeats?: number;
  seats?: number;

  bookedSeats?: string[];
  premiumSeats?: string[];
  premiumSeatPrice?: number;

  duration?: string;
}

interface ReviewReply {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
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
  replies?: ReviewReply[];
  helpfulCount: number;
  flagged: boolean;
  flagReason?: string;
  moderationStatus: string;
  createdAt: string;
  updatedAt?: string;
}

const BookFlightPage = () => {

  // =====================================================
  // ROUTER
  // =====================================================

  const router = useRouter();

  const { id } = router.query;

  const dispatch = useDispatch();


  // =====================================================
  // REDUX USER
  // =====================================================

  const user = useSelector(
    (state: any) => state.user.user
  );


  // =====================================================
  // STATES
  // =====================================================

  const [flight, setFlight] =
    useState<Flight | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [quantity, setQuantity] =
    useState(1);

  const [selectedSeats, setSelectedSeats] =
    useState<string[]>([]);

  const [savePreference, setSavePreference] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  // =====================================================
  // REVIEW STATES
  // =====================================================

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [reviewLoading, setReviewLoading] =
    useState(false);

  const [reviewSort, setReviewSort] =
    useState("newest");

  const [reviewFilterRating, setReviewFilterRating] =
    useState<number | null>(null);

  const [reviewRating, setReviewRating] =
    useState(5);

  const [reviewComment, setReviewComment] =
    useState("");

  const [reviewPhotos, setReviewPhotos] =
    useState<string[]>([]);

  const [reviewSubmitting, setReviewSubmitting] =
    useState(false);

  const [replyText, setReplyText] =
    useState<Record<string, string>>({});

  const [replyLoading, setReplyLoading] =
    useState<string | null>(null);

  const [helpfulLoading, setHelpfulLoading] =
    useState<string | null>(null);

  const [flagLoading, setFlagLoading] =
    useState<string | null>(null);


  // =====================================================
  // FETCH FLIGHT
  // =====================================================

  const fetchFlight = async (
    showLoader = false
  ) => {

    if (!id) {
      return;
    }

    try {

      if (showLoader) {
        setRefreshing(true);
      }

      const data =
        await getflight();

      const flightData =
        Array.isArray(data)
          ? data.find(
              (item: Flight) =>
                item.id === id
            )
          : data;

      setFlight(
        flightData || null
      );

      // =================================================
      // REMOVE SEATS WHICH ARE NO LONGER AVAILABLE
      // =================================================

      if (flightData?.bookedSeats) {

        setSelectedSeats(
          (previousSeats) =>
            previousSeats.filter(
              (seat) =>
                !flightData.bookedSeats?.includes(
                  seat
                )
            )
        );
      }

    } catch (error) {

      console.error(
        "Error fetching flight:",
        error
      );

    } finally {

      setLoading(false);
      setRefreshing(false);
    }
  };


  // =====================================================
  // INITIAL FLIGHT FETCH
  // =====================================================

  useEffect(() => {

    fetchFlight();

  }, [id]);


  // =====================================================
  // AUTO REFRESH AVAILABILITY
  // =====================================================

  useEffect(() => {

    if (!id) {
      return;
    }

    const interval =
      setInterval(() => {

        fetchFlight();

      }, 10000);

    return () => {
      clearInterval(interval);
    };

  }, [id]);


  // =====================================================
  // FETCH FLIGHT REVIEWS
  // =====================================================

  useEffect(() => {

    const fetchReviews = async () => {

      if (!id) {
        return;
      }

      try {
        setReviewLoading(true);

        const data = await getReviews(
          "FLIGHT",
          String(id),
          reviewSort,
          reviewFilterRating
        );

        setReviews(
          Array.isArray(data) ? data : []
        );

      } catch (error) {

        console.error(
          "Error fetching flight reviews:",
          error
        );

        setReviews([]);

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
  // FLIGHT NOT FOUND
  // =====================================================

  if (!flight) {

    return (
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
        "
      >

        <div className="text-center">

          <h2
            className="
              text-2xl
              font-bold
            "
          >
            Flight not found
          </h2>

          <p
            className="
              text-gray-500
              mt-2
            "
          >
            The selected flight could not be found.
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // FLIGHT DATA
  // =====================================================

  const airline =
    flight.airline || "Air India";

  const flightNumber =
    flight.flightNumber || "AI-101";

  const source =
    flight.source ||
    flight.from ||
    "Delhi";

  const destination =
    flight.destination ||
    flight.to ||
    "Mumbai";

  const departureTime =
    flight.departureTime ||
    flight.departure ||
    "10:00 AM";

  const arrivalTime =
    flight.arrivalTime ||
    flight.arrival ||
    "12:15 PM";

  const basePrice =
    flight.price || 0;

  const availableSeats =
    flight.availableSeats ??
    flight.seats ??
    30;


  // =====================================================
  // BOOKED SEATS
  // =====================================================

  const bookedSeats =
    flight.bookedSeats || [];


  // =====================================================
  // PREMIUM SEATS
  // =====================================================

  const premiumSeatList =
    flight.premiumSeats &&
    flight.premiumSeats.length > 0
      ? flight.premiumSeats
      : [
          "1A",
          "1B",
          "1C",
          "1D",
          "2A",
          "2B",
          "2C",
          "2D",
        ];

  const premiumSeatPrice =
    flight.premiumSeatPrice &&
    flight.premiumSeatPrice > 0
      ? flight.premiumSeatPrice
      : 500;


  // =====================================================
  // SEAT MAP
  // =====================================================

  const seatRows = 8;

  const seatColumns = [
    "A",
    "B",
    "C",
    "D",
  ];

  const allSeats: string[] = [];

  for (
    let row = 1;
    row <= seatRows;
    row++
  ) {

    seatColumns.forEach(
      (column) => {

        allSeats.push(
          `${row}${column}`
        );

      }
    );
  }


  // =====================================================
  // SEAT SELECTION
  // =====================================================

  const handleSeatSelection = (
    seat: string
  ) => {

    // ================================================
    // BOOKED SEAT CANNOT BE SELECTED
    // ================================================

    if (
      bookedSeats.includes(seat)
    ) {

      alert(
        `${seat} is already booked.`
      );

      return;
    }


    // ================================================
    // SELECT / UNSELECT
    // ================================================

    setSelectedSeats(
      (previousSeats) => {

        // Remove selected seat

        if (
          previousSeats.includes(seat)
        ) {

          return previousSeats.filter(
            (item) =>
              item !== seat
          );
        }


        // Quantity limit

        if (
          previousSeats.length >=
          quantity
        ) {

          return previousSeats;
        }


        // Add seat

        return [
          ...previousSeats,
          seat,
        ];
      }
    );
  };


  // =====================================================
  // QUANTITY CHANGE
  // =====================================================

  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const value =
      Number.parseInt(
        e.target.value
      );

    const newQuantity =
      isNaN(value)
        ? 1
        : Math.max(
            1,
            Math.min(
              value,
              availableSeats
            )
          );

    setQuantity(newQuantity);


    // Remove extra selected seats

    setSelectedSeats(
      (previousSeats) =>
        previousSeats.slice(
          0,
          newQuantity
        )
    );
  };


  // =====================================================
  // PREMIUM SEAT CHECK
  // =====================================================

  const isPremiumSeat = (
    seat: string
  ) => {

    return premiumSeatList.includes(
      seat
    );
  };


  // =====================================================
  // PREMIUM PRICE
  // =====================================================

  const premiumSeatCount =
    selectedSeats.filter(
      (seat) =>
        isPremiumSeat(seat)
    ).length;

  const totalPremiumAmount =
    premiumSeatCount *
    premiumSeatPrice;


  // =====================================================
  // BASE PRICE
  // =====================================================

  const totalBasePrice =
    basePrice * quantity;


  // =====================================================
  // TOTAL PRICE
  // =====================================================

  const grandTotal =
    totalBasePrice +
    totalPremiumAmount;


  // =====================================================
  // BOOKING
  // =====================================================

  const handlebooking = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!user) {
      return;
    }


    // ================================================
    // VALIDATE SEAT COUNT
    // ================================================

    if (
      selectedSeats.length !==
      quantity
    ) {

      alert(
        `Please select ${quantity} seat(s).`
      );

      return;
    }


    // ================================================
    // REFRESH BEFORE BOOKING
    // ================================================

    try {

      setRefreshing(true);

      const latestData =
        await getflight();

      const latestFlight =
        Array.isArray(latestData)
          ? latestData.find(
              (item: Flight) =>
                item.id === id
            )
          : latestData;


      // ==============================================
      // CHECK LATEST BOOKED SEATS
      // ==============================================

      const latestBookedSeats =
        latestFlight?.bookedSeats || [];

      const conflict =
        selectedSeats.find(
          (seat) =>
            latestBookedSeats.includes(
              seat
            )
        );


      if (conflict) {

        alert(
          `Seat ${conflict} has just been booked by another user. Please select another seat.`
        );

        setFlight(
          latestFlight || flight
        );

        setSelectedSeats(
          (previousSeats) =>
            previousSeats.filter(
              (seat) =>
                !latestBookedSeats.includes(
                  seat
                )
            )
        );

        return;
      }


      // ==============================================
      // CHECK LATEST AVAILABILITY
      // ==============================================

      if (
        latestFlight &&
        latestFlight.availableSeats !== undefined &&
        latestFlight.availableSeats <
          quantity
      ) {

        alert(
          "Not enough seats are available."
        );

        setFlight(
          latestFlight
        );

        setSelectedSeats([]);

        return;
      }


      // ==============================================
      // BOOK FLIGHT
      // ==============================================

      const data =
        await handleflightbooking(
          user?.id,
          flight?.id,
          quantity,
          grandTotal,
          selectedSeats.join(",")
        );


      // ==============================================
      // SAVE SEAT PREFERENCE
      // ==============================================

      let updatedUser = {
        ...user,

        bookings: [
          ...(user.bookings || []),
          data,
        ],
      };


      if (
        savePreference &&
        selectedSeats.length > 0
      ) {

        try {

          const preferenceData =
            await saveUserPreferences(
              user?.id,
              selectedSeats.join(","),
              ""
            );

          console.log(
            "Seat preference saved successfully"
          );


          if (preferenceData) {

            updatedUser = {
              ...preferenceData,

              bookings:
                preferenceData.bookings ||
                updatedUser.bookings,
            };
          }

        } catch (
          preferenceError
        ) {

          console.error(
            "Seat preference save error:",
            preferenceError
          );
        }
      }


      // ==============================================
      // UPDATE REDUX USER
      // ==============================================

      dispatch(
        setUser(updatedUser)
      );


      // ==============================================
      // RESET
      // ==============================================

      setSelectedSeats([]);

      setQuantity(1);

      setSavePreference(false);

      setOpen(false);


      // ==============================================
      // REDIRECT
      // ==============================================

      router.push(
        "/profile"
      );

    } catch (error) {

      console.error(
        "Flight booking error:",
        error
      );

      alert(
        "Flight booking failed. Please try again."
      );

    } finally {

      setRefreshing(false);
    }
  };


  // =====================================================
  // SEAT BUTTON
  // =====================================================

  const SeatButton = ({
    seat,
  }: {
    seat: string;
  }) => {

    const booked =
      bookedSeats.includes(seat);

    const selected =
      selectedSeats.includes(seat);

    const premium =
      isPremiumSeat(seat);


    return (
      <button
        type="button"
        disabled={booked}
        onClick={() =>
          handleSeatSelection(seat)
        }
        title={
          booked
            ? `${seat} is already booked`
            : premium
            ? `${seat} - Premium Seat (+₹${premiumSeatPrice})`
            : `${seat} - Available`
        }
        className={`
          relative
          h-12
          w-12
          rounded-lg
          border-2
          flex
          items-center
          justify-center
          font-semibold
          text-sm
          transition-all

          ${
            booked
              ? "bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed opacity-70"
              : selected
              ? "bg-blue-500 border-blue-600 text-white shadow-md scale-105"
              : premium
              ? "bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100"
              : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
          }
        `}
      >

        {selected ? (
          <Check className="w-5 h-5" />
        ) : (
          <Armchair className="w-5 h-5" />
        )}


        {/* Premium crown */}

        {premium &&
          !booked &&
          !selected && (
            <Crown
              className="
                absolute
                -top-2
                -right-2
                w-4
                h-4
                text-yellow-500
                fill-yellow-300
              "
            />
          )}


        {/* Booked indicator */}

        {booked && (
          <span
            className="
              absolute
              bottom-0
              text-[8px]
              font-bold
            "
          >
            BOOKED
          </span>
        )}

      </button>
    );
  };


  // =====================================================
  // BOOKING DIALOG
  // =====================================================

  const FlightContent = () => (

    <DialogContent
      className="
        sm:max-w-[800px]
        bg-white
        max-h-[90vh]
        overflow-y-auto
      "
    >

      <DialogHeader>

        <DialogTitle
          className="
            text-2xl
            font-bold
            flex
            items-center
          "
        >

          <Plane
            className="
              w-6
              h-6
              mr-2
            "
          />

          Flight Booking Details

        </DialogTitle>

      </DialogHeader>


      <div className="grid gap-6 mt-4">


        {/* =================================================
            FLIGHT INFORMATION
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
          "
        >

          <div className="space-y-2">

            <Label>
              Airline
            </Label>

            <Input
              value={airline}
              readOnly
            />

          </div>


          <div className="space-y-2">

            <Label>
              Flight Number
            </Label>

            <Input
              value={flightNumber}
              readOnly
            />

          </div>


          <div className="space-y-2">

            <Label className="flex items-center">

              <MapPin
                className="
                  w-4
                  h-4
                  mr-2
                "
              />

              From

            </Label>

            <Input
              value={source}
              readOnly
            />

          </div>


          <div className="space-y-2">

            <Label className="flex items-center">

              <MapPin
                className="
                  w-4
                  h-4
                  mr-2
                "
              />

              To

            </Label>

            <Input
              value={destination}
              readOnly
            />

          </div>


          <div className="space-y-2">

            <Label className="flex items-center">

              <Clock
                className="
                  w-4
                  h-4
                  mr-2
                "
              />

              Departure

            </Label>

            <Input
              value={departureTime}
              readOnly
            />

          </div>


          <div className="space-y-2">

            <Label className="flex items-center">

              <Clock
                className="
                  w-4
                  h-4
                  mr-2
                "
              />

              Arrival

            </Label>

            <Input
              value={arrivalTime}
              readOnly
            />

          </div>


          <div className="space-y-2">

            <Label className="flex items-center">

              <Users
                className="
                  w-4
                  h-4
                  mr-2
                "
              />

              Number of Seats

            </Label>

            <Input
              type="number"
              min="1"
              max={availableSeats}
              value={quantity}
              onChange={
                handleQuantityChange
              }
            />

          </div>


          <div className="space-y-2">

            <Label className="flex items-center">

              <Ticket
                className="
                  w-4
                  h-4
                  mr-2
                "
              />

              Available Seats

            </Label>

            <Input
              value={availableSeats}
              readOnly
            />

          </div>

        </div>


        {/* =================================================
            SEAT MAP
        ================================================= */}

        <div>

          <div
            className="
              flex
              items-center
              justify-between
              mb-4
            "
          >

            <div>

              <h3
                className="
                  text-lg
                  font-bold
                  flex
                  items-center
                "
              >

                <Armchair
                  className="
                    w-5
                    h-5
                    mr-2
                  "
                />

                Select Your Seats

              </h3>

              <p
                className="
                  text-sm
                  text-gray-500
                  mt-1
                "
              >

                Select{" "}
                <b>{quantity}</b>{" "}
                seat(s)

              </p>

            </div>


            <div
              className="
                text-sm
                text-gray-500
              "
            >

              {selectedSeats.length}
              /{quantity} selected

            </div>

          </div>


          {/* =================================================
              LEGEND
          ================================================= */}

          <div
            className="
              flex
              flex-wrap
              gap-4
              mb-5
              text-sm
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <div
                className="
                  w-4
                  h-4
                  rounded
                  border
                  bg-white
                "
              />

              Available

            </div>


            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <div
                className="
                  w-4
                  h-4
                  rounded
                  bg-blue-500
                "
              />

              Selected

            </div>


            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <div
                className="
                  w-4
                  h-4
                  rounded
                  bg-gray-300
                "
              />

              Booked

            </div>


            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <div
                className="
                  w-4
                  h-4
                  rounded
                  border
                  border-yellow-400
                  bg-yellow-50
                "
              />

              Premium

            </div>

          </div>


          {/* =================================================
              AIRCRAFT SEAT MAP
          ================================================= */}

          <div
            className="
              bg-gray-100
              rounded-2xl
              p-6
              border
            "
          >

            <div
              className="
                mx-auto
                max-w-[280px]
                text-center
                mb-6
              "
            >

              <div
                className="
                  bg-gray-300
                  rounded-t-[50%]
                  py-3
                  text-sm
                  font-semibold
                  text-gray-600
                "
              >

                FRONT / COCKPIT

              </div>

            </div>


            <div
              className="
                flex
                justify-center
                gap-3
                mb-3
              "
            >

              {seatColumns.map(
                (column) => (

                  <div
                    key={column}
                    className="
                      w-12
                      text-center
                      font-bold
                      text-gray-500
                      text-sm
                    "
                  >
                    {column}
                  </div>

                )
              )}

            </div>


            <div
              className="
                space-y-3
                max-w-[260px]
                mx-auto
              "
            >

              {Array.from(
                { length: seatRows },
                (_, index) => {

                  const row =
                    index + 1;

                  return (

                    <div
                      key={row}
                      className="
                        flex
                        items-center
                        justify-center
                        gap-3
                      "
                    >

                      <div
                        className="
                          w-6
                          text-center
                          text-sm
                          font-semibold
                          text-gray-500
                        "
                      >
                        {row}
                      </div>


                      <SeatButton
                        seat={`${row}A`}
                      />

                      <SeatButton
                        seat={`${row}B`}
                      />


                      <div
                        className="w-3"
                      />


                      <SeatButton
                        seat={`${row}C`}
                      />

                      <SeatButton
                        seat={`${row}D`}
                      />

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </div>


        {/* =================================================
            PREMIUM SEAT INFORMATION
        ================================================= */}

        <div
          className="
            rounded-lg
            bg-yellow-50
            border
            border-yellow-200
            p-4
          "
        >

          <div
            className="
              flex
              items-start
              gap-3
            "
          >

            <Crown
              className="
                w-5
                h-5
                text-yellow-600
                mt-0.5
              "
            />

            <div>

              <p
                className="
                  font-semibold
                  text-yellow-700
                "
              >
                Premium Seats
              </p>

              <p
                className="
                  text-sm
                  text-gray-600
                  mt-1
                "
              >

                Premium seats include an
                additional charge of ₹
                {premiumSeatPrice.toLocaleString()}
                {" "}per seat.

              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            SAVE SEAT PREFERENCE
        ================================================= */}

        <div
          className="
            border
            border-blue-200
            bg-blue-50
            rounded-lg
            p-4
          "
        >

          <label
            className="
              flex
              items-start
              gap-3
              cursor-pointer
            "
          >

            <input
              type="checkbox"
              checked={savePreference}
              onChange={(e) =>
                setSavePreference(
                  e.target.checked
                )
              }
              className="
                mt-1
                w-4
                h-4
                accent-blue-600
                cursor-pointer
              "
            />

            <div>

              <p
                className="
                  font-semibold
                  text-blue-700
                "
              >
                Save selected seats as my
                preference
              </p>

              <p
                className="
                  text-sm
                  text-gray-600
                  mt-1
                "
              >
                Save your selected seats
                for future bookings.
              </p>


              {selectedSeats.length > 0 && (

                <p
                  className="
                    text-sm
                    text-blue-600
                    mt-2
                    font-medium
                  "
                >

                  Selected:{" "}
                  {selectedSeats.join(", ")}

                </p>
              )}

            </div>

          </label>

        </div>


        {/* =================================================
            SELECTED SEAT SUMMARY
        ================================================= */}

        <div
          className="
            rounded-lg
            bg-blue-50
            border
            border-blue-100
            p-4
          "
        >

          <div
            className="
              flex
              justify-between
              items-center
            "
          >

            <div>

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                Selected Seats
              </p>

              <p
                className="
                  font-bold
                  text-lg
                "
              >

                {selectedSeats.length > 0
                  ? selectedSeats.join(", ")
                  : "No seats selected"}

              </p>

            </div>


            <div className="text-right">

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                Premium Charges
              </p>

              <p className="font-bold">

                {totalPremiumAmount > 0
                  ? `+ ₹ ${totalPremiumAmount.toLocaleString()}`
                  : "₹ 0"}

              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            FARE SUMMARY
        ================================================= */}

        <div
          className="
            bg-gray-100
            rounded-lg
            p-4
          "
        >

          <h3
            className="
              text-lg
              font-bold
              mb-4
              flex
              items-center
            "
          >

            <CreditCard
              className="
                w-5
                h-5
                mr-2
              "
            />

            Fare Summary

          </h3>


          <div className="space-y-2">

            <div
              className="
                flex
                justify-between
                items-center
              "
            >

              <span
                className="
                  text-gray-600
                "
              >
                Base Fare
              </span>

              <span
                className="
                  font-medium
                "
              >

                ₹{" "}
                {totalBasePrice.toLocaleString()}

              </span>

            </div>


            {totalPremiumAmount > 0 && (

              <div
                className="
                  flex
                  justify-between
                  items-center
                  text-orange-600
                "
              >

                <span
                  className="
                    font-medium
                  "
                >
                  Premium Seat Charges
                </span>

                <span
                  className="
                    font-medium
                  "
                >

                  + ₹{" "}
                  {totalPremiumAmount.toLocaleString()}

                </span>

              </div>

            )}


            <div
              className="
                border-t
                pt-2
                mt-2
              "
            >

              <div
                className="
                  flex
                  justify-between
                  items-center
                "
              >

                <span
                  className="
                    font-bold
                    text-lg
                  "
                >
                  Total Amount
                </span>

                <span
                  className="
                    font-bold
                    text-lg
                  "
                >

                  ₹{" "}
                  {grandTotal.toLocaleString()}

                </span>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          BOOK BUTTON
      ================================================= */}

      <Button
        className="w-full mt-4"
        onClick={handlebooking}
        disabled={
          selectedSeats.length !== quantity ||
          refreshing
        }
      >

        {refreshing
          ? "Checking availability..."
          : selectedSeats.length !== quantity
          ? `Select ${quantity} Seat(s)`
          : "Proceed to Payment"}

      </Button>

    </DialogContent>
  );


  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (

    <div
      className="
        min-h-screen
        bg-gray-50
      "
    >

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div
        className="
          bg-white
          border-b
        "
      >

        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            py-3
          "
        >

          <div
            className="
              flex
              items-center
              space-x-2
              text-sm
            "
          >

            <a
              href="/"
              className="text-blue-500"
            >
              Home
            </a>

            <ChevronRight
              className="
                w-4
                h-4
                text-gray-400
              "
            />

            <span
              className="
                text-gray-600
              "
            >
              {source}
            </span>

            <ChevronRight
              className="
                w-4
                h-4
                text-gray-400
              "
            />

            <span
              className="
                text-gray-600
              "
            >
              {destination}
            </span>

          </div>

        </div>

      </div>


      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          py-6
        "
      >

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-3
            gap-8
          "
        >

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div
            className="
              lg:col-span-2
            "
          >

            {/* FLIGHT HEADER */}

            <div
              className="
                bg-white
                rounded-xl
                shadow-sm
                p-6
                mb-6
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-5
                "
              >

                <div>

                  <h1
                    className="
                      text-2xl
                      font-bold
                    "
                  >
                    {airline}
                  </h1>

                  <p
                    className="
                      text-gray-500
                      mt-1
                    "
                  >
                    {flightNumber}
                  </p>

                </div>

                <Plane
                  className="
                    w-10
                    h-10
                    text-blue-500
                  "
                />

              </div>


              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-3
                  gap-6
                  items-center
                "
              >

                <div>

                  <p
                    className="
                      text-2xl
                      font-bold
                    "
                  >
                    {departureTime}
                  </p>

                  <p
                    className="
                      text-gray-600
                      mt-1
                    "
                  >
                    {source}
                  </p>

                </div>


                <div
                  className="
                    text-center
                  "
                >

                  <div
                    className="
                      text-sm
                      text-gray-500
                      mb-2
                    "
                  >
                    Flight
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >

                    <div
                      className="
                        h-px
                        bg-gray-300
                        flex-1
                      "
                    />

                    <Plane
                      className="
                        w-5
                        h-5
                        text-blue-500
                      "
                    />

                    <div
                      className="
                        h-px
                        bg-gray-300
                        flex-1
                      "
                    />

                  </div>

                </div>


                <div
                  className="
                    md:text-right
                  "
                >

                  <p
                    className="
                      text-2xl
                      font-bold
                    "
                  >
                    {arrivalTime}
                  </p>

                  <p
                    className="
                      text-gray-600
                      mt-1
                    "
                  >
                    {destination}
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                SEAT SELECTION PREVIEW
            ================================================= */}

            <div
              className="
                bg-white
                rounded-xl
                shadow-sm
                p-6
                mb-6
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-5
                "
              >

                <div>

                  <h2
                    className="
                      text-xl
                      font-bold
                    "
                  >
                    Choose Your Seats
                  </h2>

                  <p
                    className="
                      text-sm
                      text-gray-500
                      mt-1
                    "
                  >
                    Select your preferred
                    seats during booking.
                  </p>

                </div>

                <Armchair
                  className="
                    w-7
                    h-7
                    text-blue-500
                  "
                />

              </div>


              {/* AVAILABILITY STATUS */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  bg-green-50
                  border
                  border-green-200
                  rounded-lg
                  p-3
                  mb-5
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      text-gray-500
                    "
                  >
                    Current availability
                  </p>

                  <p
                    className="
                      font-bold
                      text-green-700
                    "
                  >
                    {availableSeats} seat(s) available
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    fetchFlight(true)
                  }
                  disabled={refreshing}
                  className="
                    text-sm
                    text-blue-600
                    font-medium
                    hover:underline
                    disabled:opacity-50
                  "
                >
                  {refreshing
                    ? "Refreshing..."
                    : "Refresh"}
                </button>

              </div>


              {/* SELECTED SEATS */}

              <div
                className="
                  bg-blue-50
                  rounded-lg
                  p-4
                  mb-5
                "
              >

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Selected Seats
                </p>

                <p
                  className="
                    font-bold
                    text-lg
                    mt-1
                  "
                >

                  {selectedSeats.length > 0
                    ? selectedSeats.join(", ")
                    : "No seats selected"}

                </p>

              </div>


              {/* SEAT MINI MAP */}

              <div
                className="
                  grid
                  grid-cols-4
                  sm:grid-cols-8
                  gap-3
                "
              >

                {allSeats.map(
                  (seat) => {

                    const booked =
                      bookedSeats.includes(
                        seat
                      );

                    const selected =
                      selectedSeats.includes(
                        seat
                      );

                    const premium =
                      isPremiumSeat(
                        seat
                      );

                    return (

                      <button
                        key={seat}
                        type="button"
                        disabled={booked}
                        onClick={() =>
                          handleSeatSelection(
                            seat
                          )
                        }
                        title={
                          booked
                            ? `${seat} is already booked`
                            : premium
                            ? `${seat} - Premium (+₹${premiumSeatPrice})`
                            : `${seat} - Available`
                        }
                        className={`
                          relative
                          h-11
                          rounded-lg
                          border
                          text-sm
                          font-semibold

                          ${
                            booked
                              ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed opacity-70"
                              : selected
                              ? "bg-blue-500 text-white border-blue-600"
                              : premium
                              ? "bg-yellow-50 text-yellow-700 border-yellow-400 hover:bg-yellow-100"
                              : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                          }
                        `}
                      >

                        {selected ? (
                          <Check
                            className="
                              w-4
                              h-4
                              mx-auto
                            "
                          />
                        ) : (
                          seat
                        )}


                        {premium &&
                          !booked &&
                          !selected && (
                            <Crown
                              className="
                                absolute
                                -top-2
                                -right-2
                                w-3
                                h-3
                                text-yellow-500
                              "
                            />
                          )}

                      </button>
                    );
                  }
                )}

              </div>

            </div>

          </div>


          {/* =================================================
              FLIGHT REVIEWS - TASK 5
          ================================================= */}

          <div
            className="
              bg-white
              rounded-xl
              shadow-sm
              p-6
              mb-6
            "
          >

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-4
                mb-6
              "
            >

              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                    flex
                    items-center
                    gap-2
                  "
                >
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  Reviews & Ratings
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Reviews from passengers for this flight.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-2xl font-bold">
                  {reviews.length > 0
                    ? (
                        reviews.reduce(
                          (sum, review) =>
                            sum + review.rating,
                          0
                        ) / reviews.length
                      ).toFixed(1)
                    : "0.0"}
                  /5
                </p>

                <p className="text-sm text-gray-500">
                  {reviews.length} review(s)
                </p>
              </div>

            </div>


            {/* WRITE REVIEW */}

            {user && (
              <div
                className="
                  border
                  rounded-lg
                  p-4
                  mb-6
                  bg-gray-50
                "
              >

                <h3 className="font-semibold mb-3">
                  Write a Review
                </h3>

                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewRating(star)
                      }
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={reviewComment}
                  onChange={(e) =>
                    setReviewComment(e.target.value)
                  }
                  placeholder="Write your experience about this flight..."
                  className="
                    w-full
                    min-h-[110px]
                    border
                    rounded-lg
                    p-3
                    resize-none
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-400
                  "
                />

                {/* REVIEW PHOTOS */}

                <div className="mt-4">
                  <label
                    htmlFor="flight-review-photos"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-3
                      py-2
                      border
                      rounded-lg
                      cursor-pointer
                      text-sm
                      font-medium
                      hover:bg-gray-100
                    "
                  >
                    <Upload className="w-4 h-4" />
                    Add Photos
                  </label>

                  <input
                    id="flight-review-photos"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);

                      if (files.length === 0) {
                        return;
                      }

                      const remainingSlots = 3 - reviewPhotos.length;
                      const selectedFiles = files.slice(0, remainingSlots);

                      selectedFiles.forEach((file) => {
                        if (file.size > 2 * 1024 * 1024) {
                          alert(`${file.name} is larger than 2 MB.`);
                          return;
                        }

                        const reader = new FileReader();

                        reader.onload = () => {
                          const result = reader.result;

                          if (typeof result === "string") {
                            setReviewPhotos((previous) => {
                              if (previous.length >= 3) {
                                return previous;
                              }

                              return [...previous, result];
                            });
                          }
                        };

                        reader.readAsDataURL(file);
                      });

                      e.target.value = "";
                    }}
                  />

                  <p className="text-xs text-gray-500 mt-2">
                    Upload up to 3 photos. Maximum 2 MB per photo.
                  </p>

                  {reviewPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {reviewPhotos.map((photo, index) => (
                        <div
                          key={`${photo.slice(0, 30)}-${index}`}
                          className="relative"
                        >
                          <img
                            src={photo}
                            alt={`Review preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setReviewPhotos((previous) =>
                                previous.filter((_, photoIndex) => photoIndex !== index)
                              )
                            }
                            className="
                              absolute
                              -top-2
                              -right-2
                              w-6
                              h-6
                              rounded-full
                              bg-black
                              text-white
                              text-xs
                              flex
                              items-center
                              justify-center
                            "
                            aria-label={`Remove photo ${index + 1}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-500">
                    Rating: {reviewRating}/5
                  </span>

                  <Button
                    disabled={
                      reviewSubmitting ||
                      !reviewComment.trim()
                    }
                    onClick={async () => {
                      if (!user || !id) {
                        return;
                      }

                      try {
                        setReviewSubmitting(true);

                        await createReview(
                          user.id,
                          "FLIGHT",
                          String(id),
                          `${airline} ${flightNumber}`,
                          reviewRating,
                          reviewComment.trim(),
                          reviewPhotos
                        );

                        setReviewComment("");
                        setReviewRating(5);
                        setReviewPhotos([]);

                        const data = await getReviews(
                          "FLIGHT",
                          String(id),
                          reviewSort,
                          reviewFilterRating
                        );

                        setReviews(
                          Array.isArray(data)
                            ? data
                            : []
                        );

                        alert(
                          "Review submitted successfully."
                        );

                      } catch (error) {

                        console.error(
                          "Review submission error:",
                          error
                        );

                        alert(
                          "Failed to submit review. Please try again."
                        );

                      } finally {
                        setReviewSubmitting(false);
                      }
                    }}
                  >
                    {reviewSubmitting
                      ? "Submitting..."
                      : "Submit Review"}
                  </Button>
                </div>

              </div>
            )}


            {/* SORT AND FILTER */}

            <div
              className="
                flex
                flex-wrap
                gap-3
                mb-5
              "
            >

              <select
                value={reviewSort}
                onChange={(e) =>
                  setReviewSort(e.target.value)
                }
                className="
                  border
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  bg-white
                "
              >
                <option value="newest">
                  Newest
                </option>
                <option value="highest">
                  Highest Rated
                </option>
                <option value="helpful">
                  Most Helpful
                </option>
              </select>

              <select
                value={
                  reviewFilterRating === null
                    ? ""
                    : String(reviewFilterRating)
                }
                onChange={(e) => {
                  const value = e.target.value;

                  setReviewFilterRating(
                    value === ""
                      ? null
                      : Number(value)
                  );
                }}
                className="
                  border
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  bg-white
                "
              >
                <option value="">
                  All Ratings
                </option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>

            </div>


            {/* REVIEW LIST */}

            {reviewLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div
                className="
                  text-center
                  py-8
                  text-gray-500
                  border
                  rounded-lg
                "
              >
                No reviews found for this flight yet.
              </div>
            ) : (
              <div className="space-y-5">

                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="
                      border
                      rounded-lg
                      p-4
                    "
                  >

                    <div
                      className="
                        flex
                        justify-between
                        gap-4
                      "
                    >

                      <div>
                        <p className="font-semibold">
                          {review.userName}
                        </p>

                        <div className="flex mt-1">
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
                      </div>

                      <span className="text-xs text-gray-400">
                        {review.createdAt
                          ? new Date(
                              review.createdAt
                            ).toLocaleDateString()
                          : ""}
                      </span>

                    </div>

                    <p className="text-gray-700 mt-3">
                      {review.comment}
                    </p>


                    {/* REVIEW PHOTOS */}

                    {review.photos &&
                      review.photos.length > 0 && (
                        <div
                          className="
                            flex
                            flex-wrap
                            gap-3
                            mt-4
                          "
                        >
                          {review.photos.map(
                            (photo, index) => (
                              <img
                                key={`${review.id}-${index}`}
                                src={photo}
                                alt="Review photo"
                                className="
                                  w-24
                                  h-24
                                  object-cover
                                  rounded-lg
                                  border
                                "
                              />
                            )
                          )}
                        </div>
                      )}


                    {/* REVIEW ACTIONS */}

                    <div
                      className="
                        flex
                        flex-wrap
                        gap-4
                        mt-4
                      "
                    >

                      <button
                        type="button"
                        disabled={
                          helpfulLoading ===
                          review.id
                        }
                        onClick={async () => {
                          try {
                            setHelpfulLoading(
                              review.id
                            );

                            const updated =
                              await markReviewHelpful(
                                review.id
                              );

                            setReviews(
                              (previous) =>
                                previous.map(
                                  (item) =>
                                    item.id ===
                                    review.id
                                      ? updated
                                      : item
                                )
                            );

                          } catch (error) {
                            console.error(
                              "Helpful error:",
                              error
                            );
                          } finally {
                            setHelpfulLoading(null);
                          }
                        }}
                        className="
                          flex
                          items-center
                          gap-1
                          text-sm
                          text-gray-600
                          hover:text-blue-600
                        "
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Helpful ({review.helpfulCount || 0})
                      </button>

                      <button
                        type="button"
                        disabled={
                          flagLoading ===
                          review.id
                        }
                        onClick={async () => {
                          const reason = window.prompt(
                            "Why are you flagging this review?"
                          );

                          if (!reason?.trim()) {
                            return;
                          }

                          try {
                            setFlagLoading(
                              review.id
                            );

                            await flagReview(
                              review.id,
                              reason.trim()
                            );

                            setReviews(
                              (previous) =>
                                previous.filter(
                                  (item) =>
                                    item.id !==
                                    review.id
                                )
                            );

                            alert(
                              "Review has been flagged for moderation."
                            );

                          } catch (error) {
                            console.error(
                              "Flag error:",
                              error
                            );

                            alert(
                              "Failed to flag review."
                            );
                          } finally {
                            setFlagLoading(null);
                          }
                        }}
                        className="
                          flex
                          items-center
                          gap-1
                          text-sm
                          text-gray-600
                          hover:text-red-600
                        "
                      >
                        <Flag className="w-4 h-4" />
                        Flag
                      </button>

                    </div>


                    {/* REPLIES */}

                    {review.replies &&
                      review.replies.length > 0 && (
                        <div
                          className="
                            mt-4
                            ml-6
                            border-l-2
                            pl-4
                            space-y-3
                          "
                        >
                          {review.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="
                                bg-gray-50
                                rounded-lg
                                p-3
                              "
                            >
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


                    {/* REPLY BOX */}

                    {user && (
                      <div
                        className="
                          flex
                          gap-2
                          mt-4
                        "
                      >
                        <Input
                          placeholder="Write a reply..."
                          value={
                            replyText[review.id] ||
                            ""
                          }
                          onChange={(e) =>
                            setReplyText(
                              (previous) => ({
                                ...previous,
                                [review.id]:
                                  e.target.value,
                              })
                            )
                          }
                        />

                        <Button
                          type="button"
                          size="icon"
                          disabled={
                            replyLoading ===
                              review.id ||
                            !replyText[review.id]?.trim()
                          }
                          onClick={async () => {
                            const comment =
                              replyText[review.id]?.trim();

                            if (!comment) {
                              return;
                            }

                            try {
                              setReplyLoading(
                                review.id
                              );

                              const updated =
                                await replyToReview(
                                  review.id,
                                  user.id,
                                  comment
                                );

                              setReviews(
                                (previous) =>
                                  previous.map(
                                    (item) =>
                                      item.id ===
                                      review.id
                                        ? updated
                                        : item
                                  )
                              );

                              setReplyText(
                                (previous) => ({
                                  ...previous,
                                  [review.id]: "",
                                })
                              );

                            } catch (error) {
                              console.error(
                                "Reply error:",
                                error
                              );

                              alert(
                                "Failed to add reply."
                              );
                            } finally {
                              setReplyLoading(null);
                            }
                          }}
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
              BOOKING CARD
          ================================================= */}

          <div
            className="
              lg:col-span-1
            "
          >

            <div
              className="
                bg-white
                rounded-xl
                shadow-lg
                p-6
              "
            >

              <h3
                className="
                  text-xl
                  font-semibold
                  mb-5
                "
              >
                Flight Booking
              </h3>


              {/* ROUTE */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-5
                "
              >

                <div>

                  <p
                    className="
                      font-bold
                      text-lg
                    "
                  >
                    {source}
                  </p>

                  <p
                    className="
                      text-sm
                      text-gray-500
                    "
                  >
                    {departureTime}
                  </p>

                </div>

                <Plane
                  className="
                    w-5
                    h-5
                    text-blue-500
                  "
                />

                <div
                  className="
                    text-right
                  "
                >

                  <p
                    className="
                      font-bold
                      text-lg
                    "
                  >
                    {destination}
                  </p>

                  <p
                    className="
                      text-sm
                      text-gray-500
                    "
                  >
                    {arrivalTime}
                  </p>

                </div>

              </div>


              {/* QUANTITY */}

              <div className="mb-5">

                <Label
                  className="
                    flex
                    items-center
                    mb-2
                  "
                >

                  <Users
                    className="
                      w-4
                      h-4
                      mr-2
                    "
                  />

                  Number of Seats

                </Label>

                <Input
                  type="number"
                  min="1"
                  max={availableSeats}
                  value={quantity}
                  onChange={
                    handleQuantityChange
                  }
                />

              </div>


              {/* SELECTED SEATS */}

              <div className="mb-5">

                <p
                  className="
                    font-semibold
                    mb-2
                  "
                >
                  Selected Seats
                </p>

                <div
                  className="
                    rounded-lg
                    bg-gray-50
                    border
                    p-3
                  "
                >

                  {selectedSeats.length > 0 ? (

                    <div
                      className="
                        flex
                        flex-wrap
                        gap-2
                      "
                    >

                      {selectedSeats.map(
                        (seat) => (

                          <span
                            key={seat}
                            className="
                              px-3
                              py-1
                              rounded-full
                              bg-blue-100
                              text-blue-700
                              text-sm
                              font-medium
                            "
                          >
                            {seat}
                          </span>

                        )
                      )}

                    </div>

                  ) : (

                    <p
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      No seats selected
                    </p>

                  )}

                </div>

              </div>


              {/* PRICE */}

              <div
                className="
                  space-y-3
                  mb-6
                "
              >

                <div
                  className="
                    flex
                    justify-between
                  "
                >

                  <span
                    className="
                      text-gray-600
                    "
                  >
                    Base Fare
                  </span>

                  <span>
                    ₹{" "}
                    {totalBasePrice.toLocaleString()}
                  </span>

                </div>


                <div
                  className="
                    flex
                    justify-between
                  "
                >

                  <span
                    className="
                      text-gray-600
                    "
                  >
                    Premium Seat
                  </span>

                  <span
                    className="
                      text-orange-600
                    "
                  >

                    {totalPremiumAmount > 0
                      ? `+ ₹ ${totalPremiumAmount.toLocaleString()}`
                      : "₹ 0"}

                  </span>

                </div>


                <div
                  className="
                    border-t
                    pt-3
                  "
                >

                  <div
                    className="
                      flex
                      justify-between
                    "
                  >

                    <span
                      className="
                        font-bold
                        text-lg
                      "
                    >
                      Total
                    </span>

                    <span
                      className="
                        font-bold
                        text-lg
                      "
                    >
                      ₹{" "}
                      {grandTotal.toLocaleString()}
                    </span>

                  </div>

                </div>

              </div>


              {/* BOOK */}

              <Dialog
                open={open}
                onOpenChange={setOpen}
              >

                <DialogTrigger asChild>

                  <button
                    className="
                      w-full
                      bg-blue-500
                      text-white
                      py-3
                      rounded-lg
                      hover:bg-blue-600
                      transition-colors
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                    disabled={
                      selectedSeats.length !==
                        quantity ||
                      refreshing
                    }
                  >

                    {refreshing
                      ? "Checking Availability..."
                      : selectedSeats.length !==
                        quantity
                      ? "Select Seats First"
                      : "BOOK THIS FLIGHT"}

                  </button>

                </DialogTrigger>


                {user ? (

                  <FlightContent />

                ) : (

                  <DialogContent
                    className="
                      bg-white
                    "
                  >

                    <DialogHeader>

                      <DialogTitle>
                        Login Required
                      </DialogTitle>

                    </DialogHeader>

                    <p>
                      Please log in to continue
                      with your booking.
                    </p>

                    <SignupDialog
                      trigger={
                        <Button
                          className="w-full"
                        >
                          Log In / Sign Up
                        </Button>
                      }
                    />

                  </DialogContent>

                )}

              </Dialog>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default BookFlightPage;