import { Navigate, Route, Routes } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import Layout   from '@/components/layout/Layout';
import Users    from '@/pages/Users';
import Hotels   from '@/pages/Hotels';
import Bookings from '@/pages/Bookings';

export default function App() {
  return (
    <PrimeReactProvider>
      <Layout>
        <Routes>
          <Route path="/users"    element={<Users />}    />
          <Route path="/hotels"   element={<Hotels />}   />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="*"         element={<Navigate to="/bookings" replace />} />
        </Routes>
      </Layout>
    </PrimeReactProvider>
  );
}
