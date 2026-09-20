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
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  getflight,
  handleflightbooking,
  saveUserPreferences,
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
        await getflight(id as string);

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
        await getflight(
          id as string
        );

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