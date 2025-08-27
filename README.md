
# CampusEats – Food Delivery for Students

CampusEats is a web application that enables students to order food from campus restaurants and get it delivered directly to dorms or buildings. The platform provides a seamless user experience with authentication, real-time order tracking, and secure payment integration, making campus food ordering simple and efficient.
# Features

- Student and Restaurant Owner dashboards
- Secure .edu email authentication (via Supabase)
- Real-time order management and tracking
- Seamless Stripe payment integration
- Campus-specific delivery features


# Screenshots

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)


# Tech Stack

**Frontedn:** Lovable.dev, Replit, React, Tailwind CSS

**Backend:** Node.js, Express.js, TypeScript

**Database/Authentication:** Supabase (PostgreSQL)

**Payments:** Stripe

**Deployment / Hosting:** Render

# Getting Started

## Installation

1. Clone the repository:
```bash
  git clone https://github.com/youruser/campuseats.git
  cd campuseats
```

2. Install dependencies:
```bash
  npm install
```

## Configuration

1. Create a .env file in the root directory with your API keys:
```ini
  SUPABASE_URL=your_supabase_url
  SUPABASE_ANON_KEY=your_supabase_anon_key
  STRIPE_SECRET_KEY=your_stripe_secret_key
  STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Run Locally
```bash
  npm run build
  npm run start
```
- Open your browser at http://localhost:3000
# Usage Guide

## Student
- Register or log in with a valid .edu email
- Browse campus restaurants and meals
- Place orders and pay via Stripe
- Track delivery status in real-time
## Restaurant Owner
- Register your restaurant
- Manage menus and update availability
- Track and fulfill student orders


# Contributing

This project was developed for the Liftoff Tech Club assignment. Contributions are welcome via pull requests, following consistent code style and project guidelines.


# Support

- Developer: [SyntaxSaviour](https://github.com/SyntaxSaviour)
- Email/Contact Info: farjanalam16@gmail.com


# Acknowledgements

- [Lovable.dev](https://lovable.dev/) – for templates

- [Replit](https://replit.com/) - for AI integration

- [Supabase](https://supabase.com/) – for authentication and database

- [Stripe](https://stripe.com/in) – for payments integration

- Mockaroo – for generating test data


# License

This project is licensed under the [MIT](https://choosealicense.com/licenses/mit/) License.


