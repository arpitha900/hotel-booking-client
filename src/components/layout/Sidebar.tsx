import { NavLink } from 'react-router-dom';

const nav = [
  { to: '/users',    label: 'Users',    icon: 'pi-users'    },
  { to: '/hotels',   label: 'Hotels',   icon: 'pi-building' },
  { to: '/bookings', label: 'Bookings', icon: 'pi-calendar' },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 flex flex-col bg-slate-900 border-r border-slate-800 z-30">

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <i className="pi pi-building text-white" style={{ fontSize: '0.85rem' }} />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">HotelBook</p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium tracking-wide uppercase">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Main Menu</p>
        {nav.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                isActive
                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100 border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`w-5 h-5 flex items-center justify-center ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                  <i className={`pi ${icon}`} style={{ fontSize: '0.9rem' }} />
                </span>
                {label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
          <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <i className="pi pi-user text-indigo-400" style={{ fontSize: '0.75rem' }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">Admin</p>
            <p className="text-[10px] text-slate-400 truncate">Administrator</p>
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] text-slate-600">© 2025 HotelBook v1.0</p>
      </div>
    </aside>
  );
}
