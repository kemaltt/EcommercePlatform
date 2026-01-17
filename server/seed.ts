import { db } from "./src/config/db";
import { products, type InsertProduct } from "../shared/schema";

async function seed() {
  console.log("Seeding products...");

  const sampleProducts: InsertProduct[] = [
    // Electronics
    {
      name: "Premium Headphones",
      description: "High-quality over-ear headphones with noise cancellation.",
      price: 199.99,
      category: "electronics",
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      stock: 25,
      rating: 4.5,
      reviews: 42,
      isActive: true,
    },
    {
      name: "Smart Watch",
      description: "Modern smartwatch with fitness tracking and notifications.",
      price: 299.99,
      category: "electronics",
      imageUrl:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      stock: 18,
      rating: 4.2,
      reviews: 28,
      isActive: true,
    },
    {
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with high precision sensor.",
      price: 49.99,
      category: "electronics",
      imageUrl:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
      stock: 45,
      rating: 4.7,
      reviews: 156,
      isActive: true,
    },
    {
      name: "Mechanical Keyboard",
      description: "RGB mechanical keyboard with tactile blue switches.",
      price: 129.99,
      category: "electronics",
      imageUrl:
        "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80",
      stock: 12,
      rating: 4.8,
      reviews: 89,
      isActive: true,
    },
    // Clothing
    {
      name: "Cotton T-Shirt",
      description: "Comfortable cotton t-shirt available in multiple colors.",
      price: 24.99,
      category: "clothing",
      imageUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      stock: 100,
      rating: 4.0,
      reviews: 65,
      isActive: true,
    },
    {
      name: "Running Sneakers",
      description: "Lightweight running shoes with extra comfort and support.",
      price: 89.99,
      category: "clothing",
      imageUrl:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      stock: 32,
      rating: 4.6,
      reviews: 92,
      isActive: true,
    },
    {
      name: "Winter Jacket",
      description: "Warm and water-resistant jacket for cold weather.",
      price: 149.99,
      category: "clothing",
      imageUrl:
        "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?auto=format&fit=crop&w=800&q=80",
      stock: 15,
      rating: 4.4,
      reviews: 31,
      isActive: true,
    },
    {
      name: "Denim Jeans",
      description: "Classic blue denim jeans with a modern slim fit.",
      price: 59.99,
      category: "clothing",
      imageUrl:
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
      stock: 40,
      rating: 4.3,
      reviews: 74,
      isActive: true,
    },
    // Home
    {
      name: "Coffee Machine",
      description: "Modern coffee machine with multiple brewing options.",
      price: 119.99,
      category: "home",
      imageUrl:
        "https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?auto=format&fit=crop&w=800&q=80",
      stock: 12,
      rating: 4.3,
      reviews: 47,
      isActive: true,
    },
    {
      name: "Scented Candle Set",
      description: "Set of 3 relaxing scented candles for a cozy atmosphere.",
      price: 29.99,
      category: "home",
      imageUrl:
        "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
      stock: 60,
      rating: 4.5,
      reviews: 28,
      isActive: true,
    },
    {
      name: "Minimalist Table Lamp",
      description: "Sleek table lamp with adjustable brightness settings.",
      price: 45.0,
      category: "home",
      imageUrl:
        "https://images.unsplash.com/photo-1507473885765-e6ed657f9971?auto=format&fit=crop&w=800&q=80",
      stock: 20,
      rating: 4.6,
      reviews: 53,
      isActive: true,
    },
    // Books
    {
      name: "Bestseller Novel",
      description: "Award-winning fiction novel by a renowned author.",
      price: 14.99,
      category: "books",
      imageUrl:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
      stock: 85,
      rating: 4.8,
      reviews: 119,
      isActive: true,
    },
    {
      name: "Recipe Collection",
      description: "Beautifully illustrated cookbook with healthy recipes.",
      price: 34.5,
      category: "books",
      imageUrl:
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
      stock: 25,
      rating: 4.7,
      reviews: 41,
      isActive: true,
    },
    // Sports
    {
      name: "Yoga Mat",
      description: "Eco-friendly, non-slip yoga mat for home or gym.",
      price: 39.99,
      category: "sports",
      imageUrl:
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80",
      stock: 50,
      rating: 4.9,
      reviews: 210,
      isActive: true,
    },
    {
      name: "Dumbbell Set",
      description: "Pair of 5kg adjustable dumbbells for strength training.",
      price: 64.99,
      category: "sports",
      imageUrl:
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80",
      stock: 12,
      rating: 4.5,
      reviews: 38,
      isActive: true,
    },
    // Toys
    {
      name: "Building Blocks",
      description: "Colorful set of 500 building blocks for creative play.",
      price: 45.0,
      category: "toys",
      imageUrl:
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
      stock: 40,
      rating: 4.8,
      reviews: 124,
      isActive: true,
    },
    {
      name: "Teddy Bear",
      description: "Soft and cuddly plush teddy bear for children.",
      price: 19.99,
      category: "toys",
      imageUrl:
        "https://images.unsplash.com/photo-1559440666-4477c28fa4dd?auto=format&fit=crop&w=800&q=80",
      stock: 75,
      rating: 4.6,
      reviews: 57,
      isActive: true,
    },
  ];

  for (const product of sampleProducts) {
    try {
      await db.insert(products).values({
        ...product,
        createdAt: new Date(),
      });
      console.log(`Added product: ${product.name}`);
    } catch (error) {
      console.error(`Error adding product ${product.name}:`, error);
    }
  }

  console.log("Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
