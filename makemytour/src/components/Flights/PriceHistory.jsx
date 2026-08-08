import { useEffect, useState } from "react";
import { getPriceHistory } from "@/api";
import { freezePrice } from "@/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PriceHistory = ({ flightId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [frozenPrice, setFrozenPrice] = useState(null);
  const [freezeExpiry, setFreezeExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getPriceHistory(flightId);
        setHistory(data);
      } catch (error) {
        console.error("Error fetching price history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (flightId) {
      fetchHistory();
    }
  }, [flightId]);
  useEffect(() => {
    if (!freezeExpiry) return;

    const updateTimer = () => {
      const expiry = new Date(freezeExpiry).getTime();
      const now = Date.now();

      const remaining = Math.max(0, expiry - now);

      setTimeLeft(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        setFrozenPrice(null);
        setFreezeExpiry(null);
        setTimeLeft(0);
      }
    };

    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [freezeExpiry]);

  if (loading) {
    return <p>Loading price history...</p>;
  }

  if (history.length === 0) {
    return <p>No price history available.</p>;
  }

  const chartData = [];

  history.forEach((item) => {
    chartData.push({
      time: "Old",
      price: item.oldPrice,
    });

    chartData.push({
      time: "Updated",
      price: item.newPrice,
    });
  });

  return (
    <div className="mt-6 border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Price History</h2>
      <button
        onClick={async () => {
          try {
            const result = await freezePrice(flightId, 15);

            setFrozenPrice(result.frozenPrice);
            setFreezeExpiry(
              new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            );
            setTimeLeft(15 * 60);
          } catch (error) {
            console.error("Price freeze failed:", error);
            alert("Unable to freeze price");
          }
        }}
        className="mb-4 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        🔒 Freeze Price for 15 Minutes
      </button>

      {frozenPrice && freezeExpiry && (
        <div className="mb-6 rounded-lg border border-green-300 bg-green-50 p-4">
          <h3 className="text-lg font-bold text-green-700">🔒 Price Frozen</h3>

          <p className="mt-2">
            Frozen Price: <strong>₹{frozenPrice}</strong>
          </p>

          <p>Price locked for 15 minutes.</p>

          <p className="mt-2 font-semibold">
            Expires in:{" "}
            {Math.floor(timeLeft / 60)
              .toString()
              .padStart(2, "0")}
            :{(timeLeft % 60).toString().padStart(2, "0")}
          </p>
        </div>
      )}

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="time" />

            <YAxis />

            <Tooltip formatter={(value) => [`₹${value}`, "Price"]} />

            <Line
              type="monotone"
              dataKey="price"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        {history.map((item) => (
          <div key={item.id} className="border rounded-md p-3 mb-2">
            <p>
              <strong>Demand:</strong> {item.demandLevel}
            </p>

            <p>
              <strong>Season:</strong> {item.season}
            </p>

            <p>
              <strong>Updated:</strong> {item.updatedAt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceHistory;
