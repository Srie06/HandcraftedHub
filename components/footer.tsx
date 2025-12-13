import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card/80 backdrop-blur-sm mt-auto shadow-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-primary">
              HandcraftedHub
            </h3>
            <p className="text-sm text-muted-foreground">
              Connecting artisan sellers with buyers who appreciate quality
              handcrafted items.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Browse Products
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">For Sellers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Become a Seller
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} HandcraftedHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
