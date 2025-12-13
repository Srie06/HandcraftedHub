"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart, TrendingUp } from "lucide-react";

export default function LandingPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect logged-in buyers to home feed
    if (!loading && userProfile) {
      if (userProfile.role === "buyer") {
        router.push("/home");
      } else if (userProfile.role === "seller") {
        router.push("/dashboard");
      }
    }
  }, [userProfile, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-amber-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-900">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Transparency */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
            style={{
              backgroundImage: "url('/HANDCRAFTED%20HUB.png')",
            }}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-orange-900/5 to-rose-900/10" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-200/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-xl mb-8">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900">
                Celebrating Indian Craftsmanship
              </span>
            </div>

            {/* Main Brand */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-serif font-bold mb-6 text-amber-900 drop-shadow-lg">
              HandcraftedHub
            </h1>

            {/* Tagline - Three Pillars */}
            <div className="text-xl sm:text-2xl lg:text-3xl font-light mb-8 leading-relaxed">
              <span className="text-amber-800 drop-shadow-sm">
                Reviving Heritage.
              </span>
              <span className="mx-2 text-amber-600">•</span>
              <span className="text-rose-800 drop-shadow-sm">
                Empowering Women.
              </span>
              <span className="mx-2 text-amber-600">•</span>
              <span className="text-orange-800 drop-shadow-sm">
                Celebrating Handmade.
              </span>
            </div>

            {/* Bottom Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-xl mb-12">
              <Heart className="w-4 h-4 text-rose-600" />
              <span className="text-sm font-medium text-amber-900">
                Where Tradition Meets Modern Artistry
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-amber-900 hover:bg-amber-800 text-white px-8 py-6 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-amber-900 text-amber-900 hover:bg-amber-900 hover:text-white px-8 py-6 rounded-full text-lg transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-amber-900/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-amber-900/30 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Cultural Craft Revival Section */}
      <section className="py-24 bg-gradient-to-b from-rose-50 to-amber-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-amber-900 mb-4">
              Revival of Indian Craft Culture
            </h2>
            <p className="text-lg text-amber-800/70 max-w-2xl mx-auto">
              Preserving centuries-old traditions through contemporary design
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Pottery", emoji: "🏺", desc: "Clay & Terracotta" },
              { name: "Weaving", emoji: "🧵", desc: "Handloom Textiles" },
              { name: "Metalwork", emoji: "⚒️", desc: "Traditional Crafts" },
              { name: "Embroidery", emoji: "🪡", desc: "Intricate Patterns" },
            ].map((craft) => (
              <div
                key={craft.name}
                className="group relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-rose-100/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="text-6xl mb-4">{craft.emoji}</div>
                  <h3 className="text-2xl font-serif font-bold text-amber-900 mb-2">
                    {craft.name}
                  </h3>
                  <p className="text-amber-800/70">{craft.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Women Artisan Stories Section */}
      <section className="py-24 bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 mb-6">
                <Heart className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-medium text-rose-900">
                  Empowerment
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-serif font-bold text-amber-900 mb-4">
                Empowering the Hands That Shape India's Culture
              </h2>
              <p className="text-lg text-amber-800/70">
                Supporting women artisans with dignity, independence, and pride
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Independence",
                  desc: "Financial freedom through craft",
                },
                {
                  title: "Pride",
                  desc: "Celebrating skill and creativity",
                },
                {
                  title: "Legacy",
                  desc: "Passing traditions to future generations",
                },
              ].map((value) => (
                <div
                  key={value.title}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center"
                >
                  <h3 className="text-2xl font-serif font-bold text-rose-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-amber-800/70">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emerging Startup Artisans Section */}
      <section className="py-24 bg-gradient-to-b from-orange-50 to-rose-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 mb-6">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">
                New Creators
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-amber-900 mb-4">
              Discover Emerging Artisans
            </h2>
            <p className="text-lg text-amber-800/70 max-w-2xl mx-auto">
              Where tradition meets contemporary design
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              "Modern handloom textiles",
              "Contemporary pottery designs",
              "Fusion jewelry collections",
              "Artisan home decor",
              "Sustainable craft products",
              "Heritage-inspired accessories",
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-full h-48 bg-gradient-to-br from-amber-100 to-rose-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  {index === 0 ? (
                    <img
                      src="/handloom.jpeg"
                      alt="Modern handloom textiles"
                      className="w-full h-full object-cover"
                    />
                  ) : index === 1 ? (
                    <img
                      src="/image.png"
                      alt="Contemporary pottery designs"
                      className="w-full h-full object-cover"
                    />
                  ) : index === 2 ? (
                    <img
                      src="/fusion_jewel2.jpeg"
                      alt="Fusion jewelry collections"
                      className="w-full h-full object-cover"
                    />
                  ) : index === 3 ? (
                    <img
                      src="/homedecor2.jpg"
                      alt="Artisan home decor"
                      className="w-full h-full object-cover"
                    />
                  ) : index === 4 ? (
                    <img
                      src="/craft3.jpeg"
                      alt="Sustainable craft products"
                      className="w-full h-full object-cover"
                    />
                  ) : index === 5 ? (
                    <img
                      src="/heri 2.jpeg"
                      alt="Heritage-inspired accessories"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">✨</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-amber-900">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why HandcraftedHub - 3 Pillars */}
      <section className="py-24 bg-gradient-to-b from-rose-50 to-amber-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-amber-900 mb-4">
              Why HandcraftedHub?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                title: "Revival",
                icon: "🏛️",
                desc: "Preserving ancient Indian craftsmanship for future generations",
              },
              {
                title: "Empowerment",
                icon: "💪",
                desc: "Supporting women artisans with independence and dignity",
              },
              {
                title: "Opportunity",
                icon: "🌟",
                desc: "Helping new creators launch their craft journey",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-6xl mb-6">{pillar.icon}</div>
                <h3 className="text-2xl font-serif font-bold text-amber-900 mb-4">
                  {pillar.title}
                </h3>
                <p className="text-amber-800/70 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-b from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-amber-900 mb-8">
              Ready to Begin?
            </h2>
            <p className="text-xl text-amber-800/80 mb-12">
              Join our community of artisans and craft lovers
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-rose-800 hover:bg-rose-700 text-white px-10 py-7 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Explore the Crafts of India
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-amber-900 text-amber-900 hover:bg-amber-900 hover:text-white px-10 py-7 rounded-full text-lg transition-all duration-300"
                >
                  Start Selling on HandcraftedHub
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
