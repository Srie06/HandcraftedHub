"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Order } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && orderId) {
      fetchOrder();
    }
  }, [user, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const orderDoc = await getDoc(doc(db, "orders", orderId));

      if (orderDoc.exists()) {
        const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order;

        // Verify this order belongs to the current user
        if (orderData.buyerId !== user?.uid) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this order.",
            variant: "destructive",
          });
          router.push("/my-orders");
          return;
        }

        setOrder(orderData);
      } else {
        toast({
          title: "Order Not Found",
          description: "The order you're looking for doesn't exist.",
          variant: "destructive",
        });
        router.push("/my-orders");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({
        title: "Error",
        description: "Failed to load order details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { status: "pending", label: "Order Placed", icon: Package },
      { status: "accepted", label: "Confirmed", icon: CheckCircle2 },
      { status: "completed", label: "Delivered", icon: Truck },
    ];

    if (order?.status === "cancelled") {
      return [
        { status: "pending", label: "Order Placed", icon: Package },
        { status: "cancelled", label: "Cancelled", icon: XCircle },
      ];
    }

    return steps;
  };

  const getStepStatus = (stepStatus: string) => {
    if (!order) return "upcoming";

    const statusOrder = ["pending", "accepted", "completed"];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (order.status === "cancelled") {
      if (stepStatus === "pending") return "completed";
      if (stepStatus === "cancelled") return "completed";
      return "upcoming";
    }

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-amber-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !order) return null;

  const steps = getStatusSteps();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/my-orders">
          <Button
            variant="ghost"
            className="mb-6 text-amber-900 hover:bg-amber-100 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            Order Details
          </h1>
          <p className="text-amber-800/70">Order ID: {order.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Tracking */}
            <Card className="rounded-2xl shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Truck className="w-5 h-5" />
                  Delivery Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const stepStatus = getStepStatus(step.status);
                    const isLast = index === steps.length - 1;

                    return (
                      <div key={step.status} className="relative">
                        <div className="flex items-start gap-4 pb-8">
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                              stepStatus === "completed"
                                ? "bg-green-100 border-green-500"
                                : stepStatus === "current"
                                ? "bg-blue-100 border-blue-500"
                                : "bg-gray-100 border-gray-300"
                            }`}
                          >
                            <StepIcon
                              className={`w-6 h-6 ${
                                stepStatus === "completed"
                                  ? "text-green-600"
                                  : stepStatus === "current"
                                  ? "text-blue-600"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 pt-1">
                            <h3
                              className={`font-semibold mb-1 ${
                                stepStatus === "upcoming"
                                  ? "text-gray-400"
                                  : "text-amber-900"
                              }`}
                            >
                              {step.label}
                            </h3>
                            {order.statusHistory && (
                              <>
                                {order.statusHistory
                                  .filter((h) => h.status === step.status)
                                  .map((history, idx) => (
                                    <div
                                      key={idx}
                                      className="text-sm text-gray-600"
                                    >
                                      <p className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(history.timestamp)}
                                      </p>
                                      {history.note && (
                                        <p className="mt-1 text-gray-500">
                                          {history.note}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Connecting Line */}
                        {!isLast && (
                          <div
                            className={`absolute left-6 top-12 w-0.5 h-8 -translate-x-1/2 ${
                              stepStatus === "completed"
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card className="rounded-2xl shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Package className="w-5 h-5" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={order.productImage || "/placeholder-product.png"}
                      alt={order.productTitle}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-2">
                      {order.productTitle}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Quantity</p>
                        <p className="font-semibold">{order.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Price</p>
                        <p className="font-semibold">
                          ${order.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="rounded-2xl shadow-soft">
              <CardHeader>
                <CardTitle className="text-amber-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    ${(order.price * order.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-amber-900">Total</span>
                  <span className="font-bold text-lg text-amber-900">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="rounded-2xl shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-semibold text-amber-900">
                  {order.buyerInfo.name}
                </p>
                {order.buyerInfo.address && <p>{order.buyerInfo.address}</p>}
                {order.buyerInfo.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {order.buyerInfo.phone}
                  </p>
                )}
                {order.buyerInfo.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {order.buyerInfo.email}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Order Info */}
            <Card className="rounded-2xl shadow-soft">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-semibold">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge
                    className={`${
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
