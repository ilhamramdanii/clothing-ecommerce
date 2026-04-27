# Clothing E-Commerce — Modern Fashion & Admin Platform

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)

**Clothing E-Commerce** is a high-performance, production-ready online fashion store platform. Built with a focus on scalability and modern user experience using **Next.js 15+ App Router**, it features a comprehensive inventory management system for administrators.

##  Key Features

- **Modern Storefront:** Clean shopping interface with dynamic category filtering and product search.
- **Persistent Cart:** Responsive shopping cart management persisted locally using **Zustand**.
- **Secure Checkout:** Full integration with **Midtrans Payment Gateway** for secure and automated transactions.
- **Powerful Admin Dashboard:** Data visualization of revenue and order statistics using **Recharts**.
- **Inventory Management:** Full CRUD system for products and categories, including image upload capabilities.
- **Order Tracking:** Real-time management of order statuses (Pending, Settled, Expired) for administrators.
- **Robust Authentication:** Secure login and registration system powered by **NextAuth.js v5**.

##  System Architecture

The project leverages the modern Next.js architecture to ensure structured and maintainable code:

1.  **Presentation Layer:** Reusable UI components built with **Shadcn UI** and **Tailwind CSS 4**.
2.  **API Layer:** Secure Route Handlers implementation for data interaction between frontend and database.
3.  **Data Layer:** PostgreSQL as the primary database with **Prisma ORM** for type-safe queries.
4.  **State Management:** Lightweight and fast application state management using **Zustand**.

##  Tech Stack

- **Framework:** `Next.js 15+` (App Router)
- **State Management:** `Zustand`
- **Database ORM:** `Prisma`
- **Payments:** `Midtrans SDK`
- **Styling:** `Tailwind CSS 4` & `Lucide Icons`
- **Auth:** `NextAuth.js v5`
- **Charts:** `Recharts`

##  Getting Started

### Prerequisites
- Node.js (Latest LTS)
- PostgreSQL Database
- Midtrans Client & Server Key (Sandbox/Production)

### Installation Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/ilhamramdanii/clothing-ecommerce.git
    cd clothing-ecommerce
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Copy `.env.example` to `.env` and fill in the required credentials.
    ```bash
    cp .env.example .env
    ```

4.  **Setup Database:**
    Run migrations and seed the initial data.
    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```

5.  **Run the App:**
    ```bash
    npm run dev
    ```

##  Development & Linting

Ensure code quality and standards are met before committing.
```bash
npm run lint
```

##  License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ by ilhamramdanii*
