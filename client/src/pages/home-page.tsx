import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CartSidebar from "@/components/layout/cart-sidebar";
import ProductCard from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormattedMessage, useIntl } from "react-intl";




export default function HomePage() {
  const intl = useIntl();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const productsPerPage = 8;

  // Fetch products
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products", selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });

  // Handle search from the header
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = products ? Math.ceil(products.length / productsPerPage) : 0;
  const paginatedProducts = products ?
    products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage) :
    [];

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCartOpen={() => setIsCartOpen(true)} onSearch={handleSearch} />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Filters */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              <FormattedMessage id="home.categories.title" />
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                className={selectedCategory === "all" ? "bg-primary text-white" : ""}
                onClick={() => handleCategoryChange("all")}
              >
                <FormattedMessage id="home.categories.all" />
              </Button>
              <Button
                variant={selectedCategory === "electronics" ? "default" : "outline"}
                className={selectedCategory === "electronics" ? "bg-primary text-white" : ""}
                onClick={() => handleCategoryChange("electronics")}
              >
                <FormattedMessage id="home.categories.electronics" />
              </Button>
              <Button
                variant={selectedCategory === "clothing" ? "default" : "outline"}
                className={selectedCategory === "clothing" ? "bg-primary text-white" : ""}
                onClick={() => handleCategoryChange("clothing")}
              >
                <FormattedMessage id="home.categories.clothing" />
              </Button>
              <Button
                variant={selectedCategory === "home" ? "default" : "outline"}
                className={selectedCategory === "home" ? "bg-primary text-white" : ""}
                onClick={() => handleCategoryChange("home")}
              >
                <FormattedMessage id="home.categories.home" />
              </Button>
              <Button
                variant={selectedCategory === "books" ? "default" : "outline"}
                className={selectedCategory === "books" ? "bg-primary text-white" : ""}
                onClick={() => handleCategoryChange("books")}
              >
                <FormattedMessage id="home.categories.books" />
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            //    <div className="flex items-center justify-center min-h-[400px]">
            //    <Loader2 className="h-8 w-8 animate-spin text-primary" />
            //  </div>
            <div className="flex flex-col items-center justify-center min-h-[256px] h-64"> {/* min-h-[256px] eklendi */}
              <span className="relative flex h-20 w-20"> {/* Boyut h-20 w-20 olarak büyütüldü */}
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-20 w-20 bg-primary"></span> {/* Boyut h-20 w-20 */}
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-10 w-10 text-white animate-spin" fill="none" viewBox="0 0 24 24"> {/* Boyut h-10 w-10 */}
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                </span>
              </span>
              {/* Opsiyonel: Yükleniyor mesajı eklenebilir */}
              {/* <span className="mt-4 text-primary font-medium text-lg">Loading Products...</span> */}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">
                <FormattedMessage id="home.error" />
              </p>
            </div>
          ) : products && products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-gray-600">
                <FormattedMessage id="home.noProducts" />
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        />
                        {/* <FormattedMessage id="home.pagination.previous" /> */}
                      </PaginationItem>

                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            onClick={() => handlePageChange(i + 1)}
                            isActive={currentPage === i + 1}
                            className="cursor-pointer"
                          >
                            <FormattedMessage id="home.pagination.page" values={{ page: i + 1 }} />
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        />
                        {/* <FormattedMessage id="home.pagination.next" /> */}
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
