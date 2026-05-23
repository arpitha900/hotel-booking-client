# Hotel Booking Client

React frontend for the Hotel Booking Management System built with Vite, PrimeReact, and React Router.

## Prerequisites

- Node.js v18+
- npm v9+
- Backend API running on port 5000

## Setup

```bash
cd hotel-booking-client
npm install
npm run dev     # starts at http://localhost:5173
```

## Modules

| Route       | Description                                    |
|-------------|------------------------------------------------|
| `/users`    | Browse and search all registered users         |
| `/hotels`   | Browse hotels with state/city/rating filters   |
| `/bookings` | View bookings, filter, and export to Excel     |

## Architecture

```
src/
├── components/
│   ├── ReusableTable.jsx    Config-driven data table with sorting & pagination
│   ├── ReusableFilter.jsx   JSON-config driven filter panel
│   └── Layout.jsx           Sidebar navigation wrapper
├── pages/
│   ├── Users.jsx
│   ├── Hotels.jsx
│   └── Bookings.jsx
├── services/
│   └── api.js               All Axios API calls
├── hooks/
│   └── useTableData.js      Reusable fetch + pagination state hook
└── constants/
    └── filterConfigs.js     JSON filter configs for all three modules
```

## Key Design Decisions

- **ReusableTable**: Single component used by all three modules via `columns` prop array
- **ReusableFilter**: Renders filter fields from a JSON config — add a new filter by adding one object to the config array
- **useTableData hook**: Encapsulates loading/error/pagination state — zero duplication across pages
- **Axios proxy**: Vite proxies `/api` requests to the backend so no CORS issues in development
