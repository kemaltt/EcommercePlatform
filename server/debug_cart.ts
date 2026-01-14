import { storage } from "./storage";

async function main() {
  console.log("--- DEBUG CART START ---");
  try {
    const users = await storage.getUsers();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
      console.log(`\nUser: ${user.id} | ${user.username} | ${user.email}`);
      const cartItems = await storage.getCartItems(user.id);
      console.log(`Cart Items (${cartItems.length}):`);
      if (cartItems.length === 0) {
        console.log("  (Empty)");
      } else {
        cartItems.forEach((item) => {
          console.log(
            `  - [Item ID: ${item.id}] Product ID: ${item.productId}, Qty: ${item.quantity}, Name: ${item.product?.name}`
          );
        });
      }
    }
  } catch (error) {
    console.error("Error running debug script:", error);
  }
  console.log("\n--- DEBUG CART END ---");
  process.exit(0);
}

main();
