"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  Send,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function HelpPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

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
            <HelpCircle className="w-10 h-10 text-amber-600" />
            Help & Support
          </h1>
          <p className="text-amber-800/70">We're here to help you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Admin Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Ticket Form */}
            <Card className="rounded-2xl shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-amber-600" />
                  Create Support Ticket
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Subject
                  </label>
                  <Input
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Message
                  </label>
                  <textarea
                    placeholder="Describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl">
                      Low
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                      Medium
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                      High
                    </Button>
                  </div>
                </div>

                <Button className="w-full rounded-xl bg-amber-900 hover:bg-amber-800">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Ticket
                </Button>
              </CardContent>
            </Card>

            {/* My Tickets */}
            <Card className="rounded-2xl shadow-soft">
              <CardHeader>
                <CardTitle>My Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-4 border rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">Ticket #{1000 + i}</h4>
                        <p className="text-sm text-muted-foreground">
                          Sample issue {i}
                        </p>
                      </div>
                      <Badge
                        className={
                          i === 1
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-amber-100 text-amber-900"
                        }
                      >
                        {i === 1 ? "Resolved" : "Open"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created on Dec {20 + i}, 2024
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Admin Contact Info */}
          <div className="space-y-6">
            <Card className="rounded-2xl shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Contact Admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      support@handcraftedhub.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">
                      Mon-Fri, 9AM-5PM EST
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-soft bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 mb-1">
                      Response Time
                    </p>
                    <p className="text-xs text-amber-800/70">
                      We typically respond to tickets within 24 hours during
                      business days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-soft">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">
              Full ticketing system coming soon!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
