# hotel-booking-client

React frontend for the Hotel Booking Management System. Vite + TypeScript + PrimeReact + Tailwind CSS.

## Setup

```bash
git clone https://github.com/arpitha900/hotel-booking-client.git
cd hotel-booking-client
npm install
```

Create a `.env` file in the project root:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
npm run dev    # http://localhost:3000
```

Make sure the backend is running on port 5000 before starting the frontend. Vite proxies all `/api` requests to the backend so there are no CORS issues.

## Modules

| Route | Description |
|-------|-------------|
| `/users` | Search users by name, email, phone. Sortable table with pagination |
| `/hotels` | Filter by state, city, rating, status. Sortable table with pagination |
| `/bookings` | Filter by user, hotel, status, date range. View details, cancel bookings, export to Excel |

## Reusable components

- **ReusableTable** — generic table used across all three modules. Pass a `columns` config array and data, it handles sorting, pagination, loading skeletons, and empty state.
- **ReusableFilter** — filter panel driven by a JSON config array. Adding a new filter field means adding one object to the config — no component changes needed.

## Project structure

```
src/
├── components/
│   ├── layout/       Sidebar, Layout with admin dropdown
│   └── shared/       ReusableTable, ReusableFilter, StatusBadge, StatCard, Avatar
├── pages/            Users, Hotels, Bookings
├── hooks/            useTableData (generic), useUsers, useHotels, useBookings
├── services/         api.ts — all Axios calls
├── constants/        filterConfigs.ts, status.ts
└── types/            TypeScript interfaces
```
