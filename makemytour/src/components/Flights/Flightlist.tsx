import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { getflight, trackFlight } from "@/api";
import Loader from "../Loader";

const FlightList = ({ onSelect }: any) => {
  const [flight, setflight] = useState<any[]>([]);
  const [loading, setloading] = useState(true);

  // Track Flight
  const handleTrack = async (id: string) => {
    try {
      await trackFlight(id);

      const data = await getflight();
      setflight(data);

      alert("Flight tracked successfully");
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch Flights
  useEffect(() => {
    const fetchflight = async () => {
      try {
        const data = await getflight();
        setflight(data);
      } catch (error) {
        console.error("Error fetching flights:", error);
      } finally {
        setloading(false);
      }
    };

    fetchflight();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Flight List</h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Flight Name</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {flight.length > 0 ? (
            flight.map((flight: any) => (
              <TableRow key={flight.id}>
                <TableCell>{flight.flightName}</TableCell>
                <TableCell>{flight.from}</TableCell>
                <TableCell>{flight.to}</TableCell>
                <TableCell>₹{flight.price}</TableCell>

                <TableCell className="flex gap-2">
                  <Button onClick={() => onSelect(flight)}>
                    Edit
                  </Button>

                  <Button
                    onClick={() => handleTrack(flight.id)}
                    disabled={flight.tracked}
                  >
                    {flight.tracked ? "✓ Tracked" : "Track"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No Flight Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FlightList;