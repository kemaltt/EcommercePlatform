import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/cart-context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { FormattedMessage, useIntl } from 'react-intl';
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface HeaderProps {
  onCartOpen: () => void;
  onSearch?: (query: string) => void;
}

export default function Header({ onCartOpen, onSearch }: HeaderProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { cartItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Favori ürün sayısı için query
  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch("/api/favorites", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/");
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Still prevent form submission
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.fullName) return "U";
    const names = user.fullName.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="backdrop-blur-md bg-white/70 dark:bg-background/80 shadow-lg sticky top-0 z-50 transition-all duration-300 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between h-20 items-center rounded-2xl mt-2 mb-2 shadow-md bg-white/60 dark:bg-background/80 backdrop-blur-md px-4 transition-all duration-300">
          <div className="flex items-center gap-6">
            <Link href="/">
              <span className="text-primary font-extrabold text-2xl tracking-tight cursor-pointer select-none drop-shadow-sm">DeinShop</span>
            </Link>
            <nav className="hidden sm:flex gap-2 ml-6" aria-label="Main Navigation">
              {user && user.isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    "px-4 py-2 rounded-lg text-base font-medium transition-all duration-200",
                    isActive("/admin")
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <FormattedMessage id="nav.admin" />
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 w-56 rounded-lg bg-muted/60 border-none focus:ring-2 focus:ring-primary/30 transition-all duration-200 shadow-sm"
                placeholder={intl.formatMessage({ id: "nav.search.placeholder" })}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>
            <ThemeToggle />
            <LanguageSwitcher />
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/favorites")}
                className={cn(
                  "relative p-0 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-primary focus:outline-none transition-all duration-200",
                  isActive("/favorites") && "text-primary"
                )}
                aria-label="Favoriler"
              >
                <Heart className="h-6 w-6" />
                {favorites.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-pink-500 rounded-full shadow-md">
                    {favorites.length}
                  </span>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onCartOpen}
              className="relative p-0 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-primary focus:outline-none transition-all duration-200"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full shadow-md">
                  {cartItemCount}
                </span>
              )}
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted/60 transition-all duration-200">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl shadow-2xl bg-white/80 dark:bg-background/90 backdrop-blur-md border-none p-2 min-w-[220px]">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/60 mb-2 shadow-sm">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-base text-foreground">{user.fullName}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="my-2 bg-muted/60" />
                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2 gap-2 text-base font-medium transition-all duration-150 hover:bg-primary/10 hover:text-primary">
                    <Link href="/profile" className="flex items-center w-full">
                      <User className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span><FormattedMessage id="nav.profile" /></span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2 bg-muted/60" />
                  <DropdownMenuItem
                    className="rounded-lg px-3 py-2 gap-2 text-base font-medium transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 text-red-600 flex items-center"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <X className="h-5 w-5 mr-2" />
                    {logoutMutation.isPending ? (
                      <FormattedMessage id="nav.signingOut" />
                    ) : (
                      <FormattedMessage id="nav.signOut" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                onClick={() => navigate("/auth")}
                className="bg-primary text-white hover:bg-primary/90 rounded-lg px-5 py-2 text-base font-semibold shadow-md transition-all duration-200"
              >
                <FormattedMessage id="nav.signIn" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${isActive("/")
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-accent"
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <FormattedMessage id="nav.home" />
            </Link>

            {user && (
              <Link
                href="/favorites"
                className={`block pl-3 pr-4 py-2 text-base font-medium ${isActive("/favorites")
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-accent"
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FormattedMessage id="nav.favorites" />
              </Link>
            )}

            {user && user.isAdmin && (
              <Link
                href="/admin"
                className={`block pl-3 pr-4 py-2 text-base font-medium ${isActive("/admin")
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-accent"
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FormattedMessage id="nav.admin" />
              </Link>
            )}

            <div className="pt-2 pb-3 px-3">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full"
                  placeholder={intl.formatMessage({ id: "nav.search.placeholder" })}
                />
              </form>
            </div>
          </div>

          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-foreground">{user.fullName}</div>
                    <div className="text-sm font-medium text-muted-foreground">{user.email}</div>
                  </div>
                  <div className="flex items-center space-x-2 ml-auto">
                    <ThemeToggle />
                    <LanguageSwitcher />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        onCartOpen();
                        setIsMenuOpen(false);
                      }}
                      className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <ShoppingCart className="h-6 w-6" />
                      {cartItemCount > 0 && (
                        <span className="absolute inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
                          {cartItemCount}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FormattedMessage id="nav.profile" />
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      <FormattedMessage id="nav.signingOut" />
                    ) : (
                      <FormattedMessage id="nav.signOut" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 mt-2">
                <Button
                  onClick={() => {
                    navigate("/auth");
                    setIsMenuOpen(false);
                  }}
                  className="w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
                >
                  <FormattedMessage id="nav.signIn" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

