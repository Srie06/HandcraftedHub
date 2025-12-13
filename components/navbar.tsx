"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, User, Menu, X, Heart, Bell } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, userProfile, loading, signOut } = useAuth();
  const { itemCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleBecomeSeller = async () => {
    try {
      // Log out current buyer account
      await signOut();
      // Redirect to signup with seller role pre-selected
      window.location.href = "/signup?role=seller";
    } catch (error) {
      console.error("Error during seller signup redirect:", error);
    }
  };

  const isSeller = userProfile?.role === "seller";

  return (
    <nav className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-cultural transition-smooth">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            HandcraftedHub
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <>
                {/* Loading state - show skeleton */}
                <div className="h-9 w-16 bg-muted animate-pulse rounded-md" />
                <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
              </>
            ) : !user ? (
              <>
                {/* Not authenticated - show Login/Signup */}
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            ) : (
              <>
                {/* Authenticated - show cart, dashboard (for sellers), and profile dropdown */}
                {isSeller ? (
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  /* Show "Become a Seller" button for buyers */
                  <Button variant="outline" onClick={handleBecomeSeller}>
                    Want to become a seller?
                  </Button>
                )}

                {/* Notifications with badge (for buyers only) */}
                {!isSeller && (
                  <Link href="/notifications" className="relative">
                    <Button variant="ghost" size="icon">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )}

                {/* Wishlist with badge (for buyers only) */}
                {!isSeller && (
                  <Link href="/wishlist" className="relative">
                    <Button variant="ghost" size="icon">
                      <Heart className="h-5 w-5" />
                      {wishlistIds.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-rose-500 text-white hover:bg-rose-600"
                        >
                          {wishlistIds.length}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )}

                {/* Cart with badge */}
                <Link href="/cart" className="relative">
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {itemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userProfile?.displayName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {!isSeller ? (
                      <>
                        {/* Buyer Menu Items */}
                        <DropdownMenuItem asChild>
                          <Link href="/my-orders">My Orders</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/notifications">Notifications</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/wishlist">Wishlist</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/reviews">My Reviews</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/help">Help & Support</Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        {/* Seller Menu Items */}
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard">Dashboard</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col space-y-2">
              {loading ? (
                <>
                  {/* Loading state */}
                  <div className="h-9 bg-muted animate-pulse rounded-md" />
                  <div className="h-9 bg-muted animate-pulse rounded-md" />
                </>
              ) : !user ? (
                <>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </Button>
                  <Button asChild className="justify-start">
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <div className="px-4 py-2 text-sm">
                    <p className="font-medium">{userProfile?.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>

                  {!isSeller ? (
                    <>
                      {/* Buyer Mobile Menu */}
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleBecomeSeller();
                        }}
                      >
                        Want to become a seller?
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link
                          href="/orders"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link
                          href="/notifications"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Bell className="w-4 h-4 mr-2" />
                          Notifications {unreadCount > 0 && `(${unreadCount})`}
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link
                          href="/wishlist"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Wishlist{" "}
                          {wishlistIds.length > 0 && `(${wishlistIds.length})`}
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link
                          href="/reviews"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Reviews
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link
                          href="/help"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Help & Support
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Seller Mobile Menu */}
                      <Button variant="ghost" asChild className="justify-start">
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      </Button>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-destructive hover:text-destructive"
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
