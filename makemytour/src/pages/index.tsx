import SignupDialog from "@/components/SignupDialog";
import {
  Bus,
  Calendar,
  Car,
  CreditCard,
  HomeIcon,
  Hotel,
  Loader,
  MapPin,
  Plane,
  QrCode,
  Shield,
  Train,
  Umbrella,
  Users,
} from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";
import { SearchSelect } from "@/components/SearchSelect";
import { Button } from "@/components/ui/button";
import { getflight, gethotels } from "@/api";
import { useRouter } from "next/dist/client/components/navigation";
import { useSelector } from "react-redux";

export default function Home() {
  const [bookingType, setBookingType] = useState("flights");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [searchresults, setsearchresult] = useState<any[]>([]);
  const [hotel, sethotel] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const [flight, setflight] = useState<any[]>([]);
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();
  const flightData = [
    { id: 1, from: "Delhi", to: "Mumbai", date: "2025-01-15", price: 5000 },
    { id: 2, from: "Mumbai", to: "Bengaluru", date: "2025-01-16", price: 4500 },
    { id: 3, from: "Bengaluru", to: "Delhi", date: "2025-01-17", price: 5500 },
    { id: 4, from: "Delhi", to: "Kolkata", date: "2025-01-18", price: 6000 },
  ];

  const hotelData = [
    { id: 1, name: "Luxury Palace", city: "Mumbai", price: 15000 },
    { id: 2, name: "Comfort Inn", city: "Delhi", price: 8000 },
    { id: 3, name: "Seaside Resort", city: "Goa", price: 12000 },
    { id: 4, name: "Mountain View Hotel", city: "Shimla", price: 10000 },
  ];
  const offers = [
    {
      title: "Domestic Flights",
      description: "Get up to 20% off on domestic flights",
      imageUrl:
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800",
    },
    {
      title: "International Hotels",
      description: "Book luxury hotels worldwide",
      imageUrl:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800",
    },
    {
      title: "Holiday Packages",
      description: "Exclusive deals on holiday packages",
      imageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800",
    },
  ];

  const collections = [
    {
      title: "Stays in & Around Delhi",
      imageUrl:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800",
      tag: "TOP 8",
    },
    {
      title: "Stays in & Around Mumbai",
      imageUrl:
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800",
      tag: "TOP 8",
    },
    {
      title: "Stays in & Around Bangalore",
      imageUrl:
        "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800",
      tag: "TOP 9",
    },
    {
      title: "Beach Destinations",
      imageUrl:
        "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=800",
      tag: "TOP 11",
    },
  ];

  const wonders = [
    {
      title: "Shimla's Best Kept Secret",
      imageUrl:
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800",
    },
    {
      title: "Tamil Nadu's Charming Hill Town",
      imageUrl:
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800",
    },
    {
      title: "Quaint Little Hill Station in Gujarat",
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800",
    },
    {
      title: "A pleasant summer retreat",
      imageUrl:
        "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=800",
    },
  ];

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await gethotels();
        console.log(data);
        sethotel(data);
        const flightdata = await getflight();
        setflight(flightdata);
      } catch (error) {
        console.error(error);
      } finally {
        setloading(false);
      }
    };

    fetchdata();
  }, [user]);
  const cityoptions = useMemo(() => {
    const cities = new Set<string>();
    flight.forEach((flight) => {
      cities.add(flight.from);
      cities.add(flight.to);
    });
    hotel.forEach((hotel) => {
      cities.add(hotel.location);
    });
    return Array.from(cities).map((city) => ({ label: city, value: city }));
  }, [flight, hotel]);

  if (loading) {
    return <Loader />;
  }
  const handleSearch = () => {
    if (bookingType === "flights") {
      const results = flight.filter(
        (flight) =>
          flight.from.toLowerCase() === from.toLowerCase() &&
          flight.to.toLowerCase() === to.toLowerCase(),
      );
      setsearchresult(results);
    } else if (bookingType === "hotels") {
      const results = hotel.filter(
        (hotel) => hotel.location.toLowerCase() === to.toLowerCase(),
      );
      setsearchresult(results);
    }
  };
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(dateString);
    return date.toLocaleString("en-US", options);
  };
  const handlebooknow = (id: any) => {
    if (bookingType === "flights") {
      router.push(`/book-flight/${id}`);
    } else {
      router.push(`/book-hotel/${id}`);
    }
  };
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80")',
      }}
    >
      <main className="container mx-auto px-4 py-6">
        <nav className="bg-white rounded-xl shadow-lg mx-auto max-w-5xl mb-6 p-4 overflow-x-auto">
          <div className="flex justify-between items-center min-w-max space-x-8">
            <NavItem
              icon={<Plane />}
              text="Flights"
              active={bookingType === "flights"}
              onClick={() => setBookingType("flights")}
            />
            <NavItem
              icon={<Hotel />}
              text="Hotels"
              active={bookingType === "hotels"}
              onClick={() => setBookingType("hotels")}
            />
            <NavItem icon={<HomeIcon />} text="Homestays" />
            <NavItem icon={<Umbrella />} text="Holiday" />
            <NavItem icon={<Train />} text="Trains" />
            <NavItem icon={<Bus />} text="Buses" />
            <NavItem icon={<Car />} text="Cabs" />
            <NavItem icon={<CreditCard />} text="Forex" />
            <NavItem icon={<Shield />} text="Insurance" />
          </div>
        </nav>
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {bookingType === "flights" && (
              <SearchSelect
                option={cityoptions}
                placeholder="From"
                value={from}
                onChange={setFrom}
                icon={<MapPin />}
                subtitle="Enter city or airport"
              />
            )}
            <div className="col-span-1">
              <SearchSelect
                option={cityoptions}
                placeholder={bookingType === "flights" ? "To" : "City"}
                value={to}
                onChange={setTo}
                icon={<MapPin />}
                subtitle={
                  bookingType === "flights"
                    ? "Enter city or airport"
                    : "Enter city"
                }
              />
            </div>
            <div className="col-span-1">
              <SearchInput
                placeholder="Date"
                value={date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDate(e.target.value)
                }
                type="date"
                icon={<Calendar />}
                subtitle="Select a Date"
              />
            </div>
            <div className="col-span-1">
              <SearchInput
                placeholder="Travelers"
                value={travelers}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTravelers(parseInt(e.target.value) || 1)
                }
                type="number"
                icon={<Users />}
                subtitle="Number of Travelers"
              />
            </div>
            <Button onClick={handleSearch} className="col-span-1 h-full">
              Search
            </Button>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Seach Results
            </h2>
            {searchresults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchresults.map((result) => (
                  <div
                    key={result.id}
                    className="bg-white rounded-lg shadow p-4 border border-gray-200"
                  >
                    {bookingType === "flights" ? (
                      <>
                        <p className="font-semibold text-lg">
                          Flight Name: {result.flightName}
                        </p>
                        <h3 className="font-semibold text-lg">
                          {result.from} to {result.to}
                        </h3>
                        <p className=" text-lg">
                          Departuretime: {formatDate(result.departureTime)}
                        </p>
                        <p className=" text-lg">
                          Arrivaltime: {formatDate(result.arrivalTime)}
                        </p>
                        <p className=" text-lg">
                          availableSeats: {result.availableSeats}
                        </p>
                        <p className="text-lg font-bold mt-2">
                          Price: ₹{result.price}
                        </p>
                        <button
                          className="w-full mt-4"
                          onClick={() => handlebooknow(result.id)}
                        >
                          Book Now
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg">
                          HotelName :{result.hotelName}
                        </h3>
                        <p className="text-lg">City:{result.location}</p>
                        <p className="text-lg font-bold mt-2">
                          ₹{result.pricePerNight} per night
                        </p>
                        <button
                          className="w-full mt-4"
                          onClick={() => handlebooknow(result.id)}
                        >
                          Book Now
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                NO {bookingType} available for the selected criteria. Please try
                different options.
              </p>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          {/* Offers Section */}
          <section className="my-16">
            <h2 className="text-2xl font-bold mb-8 text-white">Best Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offers.map((offer, index) => (
                <OfferCard key={index} {...offer} />
              ))}
            </div>
          </section>

          {/* Collections Section */}
          <section className="my-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">
                Handpicked Collections for You
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {collections.map((collection, index) => (
                <CollectionCard key={index} {...collection} />
              ))}
            </div>
          </section>

          {/* Wonders Section */}
          <section className="my-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">
                Unlock Lesser-Known <span></span> Wonders of India
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wonders.map((wonder, index) => (
                <WonderCard key={index} {...wonder} />
              ))}
            </div>
          </section>

          {/* Download App Section */}
          <DownloadApp />
        </div>
      </main>
    </div>
  );
}
const OfferCard = ({ title, description, imageUrl }: any) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Book Now
        </button>
      </div>
    </div>
  );
};

const CollectionCard = ({ title, imageUrl, tag }: any) => {
  return (
    <div className="relative group cursor-pointer overflow-hidden rounded-lg">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70">
        <div className="absolute top-4 left-4">
          <span className="bg-white text-black text-sm font-semibold px-2 py-1 rounded">
            {tag}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
        </div>
      </div>
    </div>
  );
};
const DownloadApp = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-7xl mx-auto my-12">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <h3 className="text-xl font-bold mb-2">Download App Now!</h3>
          <p className="text-gray-600 mb-4">
            Get India's #1 travel super app with best deals on flights
          </p>
          <div className="flex space-x-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
              alt="App Store"
              className="h-10"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Play Store"
              className="h-10"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <QrCode className="w-24 h-24" />
          <p className="text-sm text-gray-600">
            Scan QR code to download the app
          </p>
        </div>
      </div>
    </div>
  );
};

const WonderCard = ({ title, imageUrl }: any) => {
  return (
    <div className="relative group cursor-pointer overflow-hidden rounded-lg">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70">
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
        </div>
      </div>
    </div>
  );
};

function NavItem({ icon, text, active = false, onClick }: any) {
  return (
    <button
      className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
        active ? "text-blue-500" : "text-gray-600 hover:text-blue-500"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm mt-1 whitespace-nowrap">{text}</span>
    </button>
  );
}

function SearchInput({
  icon,
  placeholder,
  subtitle,
  value,
  onChange,
  type = "text",
}: any) {
  return (
    <div className="border rounded-lg p-3 hover:border-blue-500 cursor-pointer h-full">
      <div className="flex items-center space-x-2">
        {icon}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-500 truncate">{placeholder}</div>
          <input
            type={type}
            value={value}
            onChange={onChange}
            className="font-semibold w-full bg-transparent outline-none"
            placeholder={placeholder}
          />
          <div className="text-xs text-gray-400 truncate ">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}
