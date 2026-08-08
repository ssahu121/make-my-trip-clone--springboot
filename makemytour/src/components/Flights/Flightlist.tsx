import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { useEffect, useState, useRef } from "react";
import { getflight, trackFlight } from "@/api";
import Loader from "../Loader";
import { toast } from "sonner";

const FlightList = ({ onSelect }: any) => {
  const [flight, setflight] = useState<any[]>([]);
  const [loading, setloading] = useState(true);

  const previousStatus = useRef<Record<string, string>>({});

  // Track Flight
  const handleTrack = async (id: string) => {
    try {
      await trackFlight(id);

      const data = await getflight();
      setflight(data);

      toast.success("Flight tracked successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to track flight");
    }
  };

  // Fetch Flights
  useEffect(() => {
    const fetchflight = async () => {
      try {
        const data = await getflight();

        setflight(data);

        data.forEach((f: any) => {
          if (!f.tracked) return;

          if (previousStatus.current[f.id] !== f.status) {
            previousStatus.current[f.id] = f.status;

            switch (f.status) {
              case "DELAYED":
                toast.error(f.notification);
                break;

              case "BOARDING":
                toast.info(f.notification);
                break;

              case "LANDED":
                toast.success(f.notification);
                break;

              case "DEPARTED":
                toast.success(f.notification);
                break;

              default:
                toast(f.notification);
            }
          }
        });
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };

    fetchflight();

    const interval = setInterval(fetchflight, 30000);

    return () => clearInterval(interval);
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
                  <Button onClick={() => onSelect(flight)}>Edit</Button>

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
