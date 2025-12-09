# E-Commerce Store - Project Structure

```
ecommerce-store/
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── Breadcrumbs.jsx
│   │   │   │   └── Loader.jsx
│   │   │   ├── product/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductGrid.jsx
│   │   │   │   ├── ProductDetail.jsx
│   │   │   │   ├── ProductGallery.jsx
│   │   │   │   ├── ProductFilters.jsx
│   │   │   │   └── ProductReviews.jsx
│   │   │   ├── cart/
│   │   │   │   ├── CartDrawer.jsx
│   │   │   │   ├── CartItem.jsx
│   │   │   │   ├── CartSummary.jsx
│   │   │   │   └── EmptyCart.jsx
│   │   │   ├── checkout/
│   │   │   │   ├── CheckoutSteps.jsx
│   │   │   │   ├── ShippingForm.jsx
│   │   │   │   ├── PaymentForm.jsx
│   │   │   │   ├── OrderSummary.jsx
│   │   │   │   └── OrderConfirmation.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminSidebar.jsx
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   ├── ProductTable.jsx
│   │   │   │   ├── OrderTable.jsx
│   │   │   │   ├── UserTable.jsx
│   │   │   │   └── DashboardStats.jsx
│   │   │   └── profile/
│   │   │       ├── OrderHistory.jsx
│   │   │       ├── OrderCard.jsx
│   │   │       ├── AddressBook.jsx
│   │   │       └── Wishlist.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── OrderSuccess.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Products.jsx
│   │   │       ├── Orders.jsx
│   │   │       ├── Users.jsx
│   │   │       └── Analytics.jsx
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   ├── cartStore.js
│   │   │   ├── uiStore.js
│   │   │   └── wishlistStore.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── productService.js
│   │   │   ├── cartService.js
│   │   │   ├── orderService.js
│   │   │   └── paymentService.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   ├── constants.js
│   │   │   └── cartHelpers.js
│   │   ├── hooks/
│   │   │   ├── useCart.js
│   │   │   ├── useProducts.js
│   │   │   └── useOrders.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env
│
├── server/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Category.js
│   │   │   ├── Order.js
│   │   │   ├── Review.js
│   │   │   ├── Cart.js
│   │   │   └── Coupon.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── categories.js
│   │   │   ├── cart.js
│   │   │   ├── orders.js
│   │   │   ├── reviews.js
│   │   │   ├── payment.js
│   │   │   ├── admin.js
│   │   │   └── upload.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── cartController.js
│   │   │   ├── orderController.js
│   │   │   ├── paymentController.js
│   │   │   ├── reviewController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── upload.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   ├── sendEmail.js
│   │   │   ├── stripe.js
│   │   │   └── inventoryManager.js
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── cloudinary.js
│   │   │   └── stripe.js
│   │   └── server.js
│   ├── uploads/
│   ├── package.json
│   └── .env
│
├── README.md
└── .gitignore
```

## Key Directories Explained

### Client Structure
- **components/product**: Product display with gallery, filters, and reviews
- **components/cart**: Shopping cart with item management
- **components/checkout**: Multi-step checkout process
- **components/admin**: Admin dashboard components
- **store**: Zustand stores for client state (auth, cart, UI, wishlist)
- **services**: API services with React Query hooks for server state

### Server Structure
- **models**: Complex schemas for Product (variants, inventory), Order (items, status), Cart
- **controllers**: Business logic for e-commerce operations, payment processing
- **utils**: Stripe integration, email notifications, inventory management
- **middleware**: Authentication, admin authorization, payment validation
