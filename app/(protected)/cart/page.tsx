"use client";

import CommonButton from "@/app/components/Button";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import toast from "react-hot-toast";

const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!key) {
  throw new Error("Stripe publishable key is missing");
}

const stripePromise = loadStripe(key);

type CartItem = {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  total: number;
  brandId: number;
  product: {
    name: string;
    image: string;
  };
  variant: {
    color: string;
    size: string | null;
  };
};

type Cart = {
  items: CartItem[];
  totalAmount: number;
};

type CheckoutForm = {
  fullName: string;
  city: string;
  zipCode: string;
  state: string;
  address: string;
  paymentMethod: "COD" | "STRIPE";
};

type Coupon = {
  id: number;
  name: string;
  code: string;
  couponType: "PERCENTAGE" | "FIXED";
  brandId: number | null;
  discountPercentage: number | null;
  fixedAmount: number | null;
  minOrderAmount: number;
  maxDiscountPrice: number | null;
  maxUsage: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export default function stripePayment() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CheckoutForm>();

  const getCartItems = async () => {
    try {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwiZW1haWwiOiJqb2huQHNoYXJrbGFzZXJzLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzc1NjI1MDM0LCJleHAiOjE3NzU3MTE0MzR9.DnxCS1QWmLqpp7raJ6KA2ZKsfvCMl2ABNh987H3XPac";

      const response = await fetch("http://localhost:3001/api/carts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setCart(data.data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  useEffect(() => {
    getCartItems();
  }, []);

  const getCoupons = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/coupons", {
        method: "GET",
      });

      const data = await response.json();
      setCoupons(data.data.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  useEffect(() => {
    getCoupons();
  }, []);

  // const handleCheckout = async () => {
  //   try {
  //     const token =
  //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzIiwiZW1haWwiOiJhamF5QHNoYXJrbGFzZXJzLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzc0OTQxNjQ1LCJleHAiOjE3NzUwMjgwNDV9.xHuIKIVgZiUmWZkZqecLQDbsz4MsPT4RHZRfkNNv4nw";

  //     const res = await fetch(
  //       "http://localhost:3001/api/payments/create-checkout-session",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({
  //           items: cart?.items,
  //         }),
  //       },
  //     );

  //     const data = await res.json();

  //     window.location.href = data.url;
  //   } catch (error) {
  //     console.error("Checkout error:", error);
  //   }
  // };

  const getPayloadItems = () => {
    return cart?.items.map((item) => ({
      productId: Number(item.productId),
      productVariantId: Number(item.variantId),
      quantity: item.quantity,
    }));
  };

  const onSubmit = async (formData: CheckoutForm) => {
    setLoading(true);

    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwiZW1haWwiOiJqb2huQHNoYXJrbGFzZXJzLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzc1NjI1MDM0LCJleHAiOjE3NzU3MTE0MzR9.DnxCS1QWmLqpp7raJ6KA2ZKsfvCMl2ABNh987H3XPac";

    try {
      const payload = {
        items: getPayloadItems(),
        couponCode: selectedCoupon?.code || null,
        ...formData,
      };

      // ✅ COD FLOW
      if (formData.paymentMethod === "COD") {
        const res = await fetch("http://localhost:3001/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        // ❗ Handle API-level failure
        if (!res.ok || !data.success) {
          throw new Error(
            data.error || data.message || "Failed to place order",
          );
        }

        // ✅ Success
        toast.success(data.message || "Order placed successfully");

        setIsModalOpen(false);
        reset();

        return;
      }

      // ✅ STRIPE FLOW
      if (formData.paymentMethod === "STRIPE") {
        const res = await fetch(
          "http://localhost:3001/api/payments/create-checkout-session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );

        const data = await res.json();

        // ❗ Handle API error
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to initiate payment");
        }

        // ✅ Redirect to Stripe
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Checkout Error:", error);

      // ✅ Smart error handling
      const message =
        error?.message ||
        error?.response?.data?.message ||
        "Something went wrong";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = (coupon: Coupon) => {
    if (!cart) return;

    if (cart.totalAmount < coupon.minOrderAmount) {
      toast.error(`Minimum order amount is ₹${coupon.minOrderAmount}`);
      return;
    }

    if (coupon.maxUsage === coupon.usedCount) {
      toast.error("This coupon has reached its maximum usage limit.");
      return;
    }

    if (
      new Date() < new Date(coupon.startDate) ||
      new Date() > new Date(coupon.endDate)
    ) {
      toast.error("This coupon is expired for now.");
      return;
    }

    // ✅ STEP 1: Filter eligible items
    let eligibleItems = cart.items;

    if (coupon.brandId) {
      eligibleItems = cart.items.filter(
        (item) => Number(item.brandId) === Number(coupon.brandId),
      );

      if (eligibleItems.length === 0) {
        toast.error("This coupon is not applicable for your cart items.");
        return;
      }
    }

    // ✅ STEP 2: Eligible amount
    const eligibleAmount = eligibleItems.reduce(
      (sum, item) => sum + item.total,
      0,
    );

    // ✅ STEP 3: Discount
    let discount = 0;

    if (coupon.couponType === "PERCENTAGE") {
      discount = (eligibleAmount * (coupon.discountPercentage || 0)) / 100;

      if (coupon.maxDiscountPrice) {
        discount = Math.min(discount, coupon.maxDiscountPrice);
      }
    }

    if (coupon.couponType === "FIXED") {
      discount = coupon.fixedAmount || 0;
      discount = Math.min(discount, eligibleAmount);
    }

    // ✅ STEP 4: Apply
    setSelectedCoupon(coupon);
    setDiscountAmount(discount);
    setFinalAmount(cart.totalAmount - discount);
  };

  const removeCoupon = () => {
    setSelectedCoupon(null);
    setDiscountAmount(0);
    setFinalAmount(cart?.totalAmount || 0);
  };

  useEffect(() => {
    if (cart) {
      setFinalAmount(cart.totalAmount);
    }
  }, [cart]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Cart</h2>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Shipping Details</h2>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Full Name */}
                <div className="mb-3">
                  <TextField
                    size="small"
                    fullWidth
                    label="Full Name*"
                    {...register("fullName", {
                      required: "Full name is required",
                    })}
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    autoFocus
                  />
                </div>

                {/* Address */}
                <div className="mb-3">
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    rows={3}
                    label="Address*"
                    {...register("address", {
                      required: "Address is required",
                    })}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                </div>

                {/* City */}
                <div className="mb-3">
                  <TextField
                    size="small"
                    fullWidth
                    label="City*"
                    {...register("city", { required: "City is required" })}
                    error={!!errors.city}
                    helperText={errors.city?.message}
                  />
                </div>

                {/* State */}
                <div className="mb-3">
                  <TextField
                    size="small"
                    fullWidth
                    label="State*"
                    {...register("state", { required: "State is required" })}
                    error={!!errors.state}
                    helperText={errors.state?.message}
                  />
                </div>

                {/* Zip Code */}
                <div className="mb-3">
                  <TextField
                    size="small"
                    fullWidth
                    label="Zip Code*"
                    {...register("zipCode", {
                      required: "Zip code is required",
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: "Enter valid 6-digit PIN code",
                      },
                    })}
                    error={!!errors.zipCode}
                    helperText={errors.zipCode?.message}
                  />
                </div>

                <Controller
                  name="paymentMethod"
                  control={control}
                  rules={{ required: "Payment method is required" }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      size="small"
                      error={!!errors.paymentMethod}
                    >
                      <InputLabel>Payment Method*</InputLabel>
                      <Select {...field} label="Payment Method*">
                        <MenuItem value="COD">Cash on Delivery</MenuItem>
                        <MenuItem value="STRIPE">
                          Online Payment (Stripe)
                        </MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                {/* Buttons */}
                <div className="flex justify-end gap-2 mt-4">
                  <CommonButton
                    variant="secondary"
                    onClick={() => {
                      setIsModalOpen(false);
                      reset();
                    }}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </CommonButton>

                  <CommonButton
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Continue to Payment
                  </CommonButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {(cart?.items?.length ?? 0) > 0 ? (
          cart!.items.map((item) => (
            <div key={item.id} className="mb-4 border-b pb-4">
              <img
                src={`http://localhost:3001/${item.product.image}`}
                alt={item.product.name}
                className="w-20 h-20 object-cover mb-2"
              />

              <h3 className="font-semibold">{item.product.name}</h3>

              <p>Color: {item.variant.color}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ₹{item.price}</p>
              <p>Total: ₹{item.total}</p>
            </div>
          ))
        ) : (
          <p className="text-center">No items in cart</p>
        )}

        {cart && (
          <div className="mt-4 font-bold text-right">
            Total Amount: ₹{cart.totalAmount}
          </div>
        )}

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Available Coupons</h3>

          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="border p-2 mb-2 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{coupon.code}</p>
                <p className="text-sm text-gray-500">
                  {coupon.couponType === "PERCENTAGE"
                    ? `${coupon.discountPercentage}% OFF`
                    : `₹${coupon.fixedAmount} OFF`}
                </p>
              </div>

              <CommonButton
                disabled={selectedCoupon?.id === coupon.id}
                onClick={() => applyCoupon(coupon)}
              >
                {selectedCoupon?.id === coupon.id ? "Applied" : "Apply"}
              </CommonButton>
            </div>
          ))}
        </div>

        {selectedCoupon && (
          <div className="mt-3 p-3 bg-green-100 rounded">
            <p>Applied Coupon: {selectedCoupon.code}</p>
            <p>Discount: ₹{discountAmount}</p>

            <CommonButton onClick={removeCoupon} className="mt-2">
              Remove Coupon
            </CommonButton>
          </div>
        )}

        <div className="mt-4 text-right">
          <p>Total: ₹{cart?.totalAmount}</p>

          {selectedCoupon && (
            <>
              <p className="text-green-600">Discount: -₹{discountAmount}</p>
              <p className="font-bold">Final Amount: ₹{finalAmount}</p>
            </>
          )}
        </div>

        <CommonButton onClick={() => setIsModalOpen(true)}>
          Place Order
        </CommonButton>
      </div>
    </div>
  );
}
