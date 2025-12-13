"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Star, Edit, Trash2, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ReviewsPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-amber-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2 flex items-center gap-3">
            <Star className="w-10 h-10 text-amber-600 fill-amber-600" />
            My Reviews
          </h1>
          <p className="text-amber-800/70">Your product reviews and ratings</p>
        </div>

        {/* Placeholder Content */}
        <div className="space-y-6 max-w-4xl">
          {/* Sample Review Cards */}
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-rose-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-amber-900/20" />
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-amber-900">
                          Handcrafted Product {i}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Reviewed on Dec {15 + i}, 2024
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`w-5 h-5 ${
                            index < 5 - i
                              ? "text-amber-500 fill-amber-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-amber-900">
                        {5 - i}.0
                      </span>
                    </div>

                    {/* Review Text */}
                    <p className="text-sm text-muted-foreground">
                      This is a sample review for the product. The quality is
                      excellent and the craftsmanship is outstanding. Highly
                      recommended for anyone looking for authentic handcrafted
                      items!
                    </p>

                    {/* Helpful Badge */}
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        {i * 3} people found this helpful
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-soft">
            <Star className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">
              Full review management coming soon!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
