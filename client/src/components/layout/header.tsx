import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X
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

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
    <header className="shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary font-bold text-xl cursor-pointer">DeinShop</span>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Main Navigation">
              <Link 
                href="/" 
                className={`px-3 py-2 text-sm font-medium ${
                  isActive("/") 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Home
              </Link>
              
              {user && (
                <Link 
                  href="/favorites" 
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive("/favorites") 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Favorites
                </Link>
              )}
              
              {user && user.isAdmin && (
                <Link 
                  href="/admin" 
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive("/admin") 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 w-60"
                placeholder="Search products..."
              />
            </form>
            
            {/* Tema değiştirici */}
            <ThemeToggle />

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onCartOpen}
              className="relative p-2 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <ShoppingCart />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <div className="w-full cursor-pointer">Profile</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? "Signing out..." : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="default" 
                onClick={() => navigate("/auth")}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              href="/"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                isActive("/") 
                  ? "bg-primary text-white" 
                  : "text-muted-foreground hover:bg-accent"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            {user && (
              <Link 
                href="/favorites"
                className={`block pl-3 pr-4 py-2 text-base font-medium ${
                  isActive("/favorites") 
                    ? "bg-primary text-white" 
                    : "text-muted-foreground hover:bg-accent"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Favorites
              </Link>
            )}
            
            {user && user.isAdmin && (
              <Link 
                href="/admin"
                className={`block pl-3 pr-4 py-2 text-base font-medium ${
                  isActive("/admin") 
                    ? "bg-primary text-white" 
                    : "text-muted-foreground hover:bg-accent"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
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
                  placeholder="Search products..."
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        onCartOpen();
                        setIsMenuOpen(false);
                      }}
                      className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <ShoppingCart />
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
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? "Signing out..." : "Sign out"}
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
                  Sign in
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
