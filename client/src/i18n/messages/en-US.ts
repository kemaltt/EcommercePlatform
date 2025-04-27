// client/src/i18n/messages/en-US.ts
export default {
  // General
  'app.title': 'E-Commerce Platform',
  'app.welcome': 'Welcome',

  // Navigation
  'nav.home': 'Home',
  'nav.favorites': 'Favorites',
  'nav.admin': 'Admin',
  'nav.search.placeholder': 'Search products...',
  'nav.profile': 'Profile',
  'nav.signIn': 'Sign in',
  'nav.signOut': 'Sign out',
  'nav.signingOut': 'Signing out...',
  'nav.cart': 'Cart',
  'nav.mobileMenu': 'Open main menu',

  // Authentication
  'auth.login': 'Login',
  'auth.register': 'Register',
  'auth.logout': 'Logout',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.username': 'Username',
  'auth.fullName': 'Full Name',


  // Products
  'product.inStock': 'In Stock',
  'product.description': 'Product Description',

  // Cart
  'cart.title': 'Shopping Cart',
  'cart.empty.title': 'Your cart is empty',
  'cart.empty.description': 'Browse products to continue shopping',
  'cart.empty.button': 'Continue Shopping',
  'cart.subtotal': 'Subtotal',
  'cart.shipping.info': 'Shipping and taxes calculated at checkout.',
  'cart.checkout': 'Checkout',
  'cart.continue': 'or Continue Shopping',
  'cart.remove': 'Remove',
  'cart.quantity': 'Quantity',
  'cart.checkout.message': 'Checkout functionality would be implemented here',
  'cart.login.required': 'You must be logged in to add items to your cart',
  'cart.add.success': '{productName} has been added to your cart',
  'cart.add.error': 'Failed to add to cart',
  'cart.update.error': 'Failed to update cart',
  'cart.remove.success': 'Item has been removed from your cart',
  'cart.remove.error': 'Failed to remove item',
  'cart.clear.success': 'All items have been removed from your cart',
  'cart.clear.error': 'Failed to clear cart',
  "cart.quantity.value": "Qty: {quantity}",

  // Messages
  'message.success': 'Operation successful',
  'message.error': 'An error occurred',
  'message.welcome': 'Welcome, {name}!',

  // Form Errors
  'error.required': 'This field is required',
  'error.email': 'Please enter a valid email',
  'error.minLength': 'Please enter at least {min} characters',
  'error.passwordMatch': 'Passwords do not match',

  // Home Page
  'home.categories.title': 'Categories',
  'home.categories.all': 'All Products',
  'home.categories.electronics': 'Electronics',
  'home.categories.clothing': 'Clothing',
  'home.categories.home': 'Home & Kitchen',
  'home.categories.books': 'Books',

  // Loading and Error States
  'home.loading': 'Loading products...',
  'home.error': 'Error loading products. Please try again later.',
  'home.noProducts': 'No products found. Try a different search or category.',

  // Pagination
  'home.pagination.previous': 'Previous',
  'home.pagination.next': 'Next',
  'home.pagination.page': 'Page {number}',

  // Product Card
  'product.addToCart': 'Add to Cart',
  'product.outOfStock': 'Out of Stock',
  'product.reviews': '{count} reviews',
  'product.loginRequired': 'Login Required',
  'product.loginToAddCart': 'Please login to add items to cart',
  'product.addedToFavorites': 'Added to Favorites',
  'product.removedFromFavorites': 'Removed from Favorites',
  'product.addedToFavoritesDesc': '{name} has been added to your favorites',
  'product.removedFromFavoritesDesc': '{name} has been removed from your favorites',
  'product.failedToUpdateFavorites': 'Failed to update favorites',
  'product.addedToCart': 'Added to Cart',
  'product.addedToCartDesc': '{name} has been added to your cart',
  'product.viewDetails': 'View Details',
  'product.price': 'Price $ {price}',
  'product.currency': '${price}',

  // Product Detail Page
  'productDetail.navigation.back': 'Back to Products',

  // Loading and Error States
  'productDetail.loading': 'Loading product information...',
  'productDetail.error.title': 'Product Not Found',
  'productDetail.error.description': 'Sorry, we couldn\'t find the product you\'re looking for.',
  'productDetail.error.button': 'Continue Shopping',

  // Product Information
  'productDetail.info.description': 'Product Description',
  'productDetail.info.details': 'Product Details',
  'productDetail.info.category': 'Category',
  'productDetail.info.stock': 'Stock Status: {count}',
  'productDetail.info.status': 'Status',
  'productDetail.info.inStock': 'In Stock',
  'productDetail.info.outOfStock': 'Out of Stock',
  'productDetail.info.ratings': '{count} ratings',

  // Order Options
  'productDetail.order.quantity': 'Quantity',
  'productDetail.order.addToCart': 'Add to Cart',
  'productDetail.order.outOfStock': 'Out of Stock',

  // Shipping and Returns
  'productDetail.shipping.free': 'Free shipping for orders over €100',
  'productDetail.shipping.return': '30-day return policy',

  // Auth page
  'auth.welcomeDescription': 'Your one-stop destination for all your shopping needs. Join our community and discover amazing products at great prices.',
  'auth.feature1': 'Wide range of quality products',
  'auth.feature2': 'Secure shopping experience',
  'auth.feature3': 'Fast delivery options',
  'auth.feature4': '24/7 customer support',
  'auth.subtitle': 'Your one-stop shopping destination',
  'auth.usernameOrEmail': 'Username or Email',
  'auth.emailPlaceholder': 'your@email.com',
  'auth.passwordPlaceholder': '********',
  'auth.rememberMe': 'Remember me',
  'auth.forgotPassword': 'Forgot password?',
  'auth.signingIn': 'Signing in...',
  'auth.signIn': 'Sign in',
  'auth.noAccount': "Don't have an account?",
  'auth.registerNow': 'Register now',
  'auth.fullNamePlaceholder': 'John Doe',
  'auth.creatingAccount': 'Creating account...',
  'auth.createAccount': 'Create account',
  'auth.haveAccount': 'Already have an account?',
  'auth.signInNow': 'Sign in',
  'language.select': 'Select language:',

  // Favorites Page
  'favorites.title': 'Your Favorites',
  'favorites.loading': 'Loading favorites...',
  'favorites.error.title': 'Error loading favorites',
  'favorites.error.description': 'There was a problem loading your favorites. Please try again later.',
  'favorites.empty.title': 'Your favorites list is empty',
  'favorites.empty.description': 'Add items to your favorites by clicking the heart icon on products you like.',
  'favorites.browseProducts': 'Browse Products',

  // Profile
  "profile.title": "Your Profile",
  "profile.fullName": "Full name",
  "profile.email": "Email address",
  "profile.address": "Address",
  "profile.address.placeholder": "Enter your shipping address",
  "profile.save": "Save Changes",
  "profile.saving": "Saving...",
  "profile.required": "This field is required",
  "profile.invalidEmail": "Invalid email address",

  // Footer
  "footer.about": "About",
  "footer.blog": "Blog",
  "footer.jobs": "Jobs",
  "footer.press": "Press",
  "footer.accessibility": "Accessibility",
  "footer.partners": "Partners",
  "footer.copyright": "© 2023 DeinShop, Inc. All rights reserved.",
  "footer.facebook": "Facebook",
  "footer.instagram": "Instagram",
  "footer.twitter": "Twitter",
  "footer.github": "GitHub",
  "footer.youtube": "YouTube",

  // Checkout
  "checkout.title": "Checkout",
  "checkout.cartEmpty": "Your cart is empty. Add items before proceeding to checkout.",
  "checkout.shippingInfo": "Shipping Information",
  "checkout.firstName": "First Name",
  "checkout.lastName": "Last Name",
  "checkout.address": "Address",
  "checkout.city": "City",
  "checkout.state": "State / Province",
  "checkout.zip": "ZIP / Postal Code",
  "checkout.country": "Country",
  "checkout.orderSummary": "Order Summary",
  "checkout.shipping": "Shipping",
  "checkout.taxes": "Taxes",
  "checkout.total": "Total",
  "checkout.paymentInfo": "Payment Information",
  "checkout.paymentPlaceholder": "Payment gateway integration will go here.",
  "checkout.placeOrder": "Place Order",
  "checkout.cardDetails": "Card Details",
  "checkout.paymentMethods": "Payment Methods",
  "checkout.payWithCard": "Pay with Card",
  "checkout.payWithPayPal": "Pay with PayPal",
  "checkout.payWithKlarna": "Pay with Klarna",
};