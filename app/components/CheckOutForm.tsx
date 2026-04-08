"use client";

import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { useState } from "react";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleStripePayment = async () => {
    try {
      if (!stripe || !elements) {
        alert("Stripe not loaded yet");
        return;
      }

      setLoading(true);

      // 1️⃣ Call backend
      const { data } = await axios.post(
        "http://localhost:3001/api/payments/create-payment-intent",
        {
          userId: "3",
          fullName: "Ajay",
          city: "Ahmedabad",
          zipCode: "380001",
          state: "Gujarat",
          address: "Test Address",
          items: [
            {
              productId: "6",
              productVariantId: "11",
              quantity: 2,
            },
          ],
        },
      );

      const clientSecret = data.clientSecret;

      // 2️⃣ Get card element SAFELY
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        alert("Card element not found");
        setLoading(false);
        return;
      }

      // 3️⃣ Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent?.status === "succeeded") {
        alert("Payment successful 🎉");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCOD = async () => {
    try {
      setLoading(true);

      await axios.post(
        "http://localhost:3000/api/orders",
        {
          sessionId: "abc123",
          fullName: "Ajay",
          city: "Ahmedabad",
          zipCode: "380001",
          state: "Gujarat",
          address: "Test Address",
          paymentMethod: "COD",
          items: [
            {
              productId: "6",
              productVariantId: "11",
              quantity: 2,
            },
          ],
        },
        {
          headers: {
            Authorization: "Bearer YOUR_TOKEN",
          },
        },
      );

      alert("Order placed with COD ✅");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Checkout</h2>

      <CardElement />

      <button onClick={handleStripePayment} disabled={loading}>
        {loading ? "Processing..." : "Pay with Card"}
      </button>

      <hr />

      <button onClick={handleCOD} disabled={loading}>
        {loading ? "Processing..." : "Cash on Delivery"}
      </button>
    </div>
  );
}
