"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import { Order, OrderStatus } from "@/types";

/**
 * Orders Page - Seller Order Management
 */
function OrdersContent() {
  const { userProfile } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">(
    "all"
  );

  // Mock orders data - Replace with real Firebase data
  const orders: Order[] = [];

  const statusConfig = {
    pending: { label: "Pending", icon: Clock, color: "bg-yellow-500" },
    accepted: { label: "Accepted", icon: Package, color: "bg-blue-500" },
    completed: { label: "Completed", icon: CheckCircle, color: "bg-green-500" },
    cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-500" },
  };

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-xl shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">0</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">0</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$0</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card className="rounded-xl shadow-soft mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedStatus === "all" ? "default" : "outline"}
              onClick={() => setSelectedStatus("all")}
              className="rounded-full"
            >
              All Orders
            </Button>
            {Object.entries(statusConfig).map(([status, config]) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                onClick={() => setSelectedStatus(status as OrderStatus)}
                className="rounded-full"
              >
                {config.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="rounded-xl shadow-soft">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Manage and track your customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground max-w-md">
                When customers purchase your products, their orders will appear
                here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const StatusIcon = statusConfig[order.status].icon;
                return (
                  <Card key={order.id} className="rounded-xl">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">
                                {order.productTitle}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Order #{order.id.slice(0, 8)}
                              </p>
                            </div>
                            <Badge
                              className={`${
                                statusConfig[order.status].color
                              } text-white`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[order.status].label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Quantity
                              </p>
                              <p className="font-medium">{order.quantity}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Total Amount
                              </p>
                              <p className="font-medium">
                                ${order.totalAmount.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Buyer Info */}
                          <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3 flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Buyer Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="text-muted-foreground">
                                  Name:
                                </span>{" "}
                                {order.buyerInfo.name}
                              </p>
                              <p>
                                <span className="text-muted-foreground">
                                  Email:
                                </span>{" "}
                                {order.buyerInfo.email}
                              </p>
                              {order.buyerInfo.phone && (
                                <p className="flex items-center">
                                  <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                                  {order.buyerInfo.phone}
                                </p>
                              )}
                              {order.buyerInfo.address && (
                                <p className="flex items-start">
                                  <MapPin className="h-3 w-3 mr-2 mt-1 text-muted-foreground" />
                                  {order.buyerInfo.address}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        {order.status === "pending" && (
                          <div className="flex flex-col gap-2 md:w-48">
                            <Button className="w-full">Accept Order</Button>
                            <Button variant="outline" className="w-full">
                              Reject
                            </Button>
                          </div>
                        )}
                        {order.status === "accepted" && (
                          <div className="flex flex-col gap-2 md:w-48">
                            <Button className="w-full">
                              Mark as Completed
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute requireSeller={true}>
      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-amber-900">
              Order Management
            </h1>
            <p className="text-amber-800/70">
              Track and manage all your customer orders
            </p>
          </div>

          <OrdersContent />
        </div>
      </main>
    </ProtectedRoute>
  );
}
