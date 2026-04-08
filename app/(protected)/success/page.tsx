"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/payments/session?sessionId=${sessionId}`,
        );
        const result = await res.json();

        console.log("Payment Session Data:", result);
        setData(result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSession();
  }, [sessionId]);

  return (
    <div>
      <h1>Payment Successful 🎉</h1>

      {data && (
        <div>
          <p>Session ID: {data.sessionId}</p>
          <p>Transaction ID: {data.paymentIntent}</p>
          <p>Payment Status: {data.paymentStatus}</p>
        </div>
      )}
    </div>
  );
}
