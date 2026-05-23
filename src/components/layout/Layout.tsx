import { type ReactNode, useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const pageMeta: Record<string, { title: string; description: string; icon: string; color: string }> = {
  '/users':    { title: 'Users',    description: 'Manage registered users',           icon: 'pi-users',    color: 'bg-violet-500' },
  '/hotels':   { title: 'Hotels',   description: 'Browse and manage hotel properties', icon: 'pi-building', color: 'bg-sky-500'    },
  '/bookings': { title: 'Bookings', description: 'View and manage all bookings',       icon: 'pi-calendar', color: 'bg-indigo-500' },
};

const menuItems = [
  { label: 'Profile',  icon: 'pi-user',         onClick: () => {} },
  { label: 'Settings', icon: 'pi-cog',           onClick: () => {} },
  { label: 'Logout',   icon: 'pi-sign-out',      onClick: () => {}, danger: true },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const meta = pageMeta[pathname] ?? pageMeta['/bookings'];

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden ml-64">

        {/* Top header */}
        <header className="flex-shrink-0 h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${meta.color} rounded-lg flex items-center justify-center`}>
              <i className={`pi ${meta.icon} text-white`} style={{ fontSize: '0.85rem' }} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900 leading-none">{meta.title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{meta.description}</p>
            </div>
          </div>

          {/* Admin menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors duration-150 focus:outline-none"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <i className="pi pi-user text-indigo-600" style={{ fontSize: '0.65rem' }} />
              </div>
              <span className="text-xs font-medium text-slate-700">Admin</span>
              <i
                className="pi pi-chevron-down text-slate-400 transition-transform duration-200"
                style={{ fontSize: '0.6rem', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            {/* Dropdown panel */}
            <div
              className={`
                absolute right-0 top-[calc(100%+8px)] w-48 z-50
                bg-white border border-slate-200 rounded-xl shadow-lg
                transition-all duration-150 origin-top-right
                ${open
                  ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'}
              `}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">Admin</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Administrator</p>
              </div>

              {/* Items */}
              <div className="p-1.5">
                {menuItems.map(({ label, icon, onClick, danger }) => (
                  <button
                    key={label}
                    onClick={() => { onClick(); setOpen(false); }}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left
                      transition-colors duration-150
                      ${danger
                        ? 'text-rose-500 hover:bg-rose-50'
                        : 'text-slate-700 hover:bg-slate-50'}
                    `}
                  >
                    <i className={`pi ${icon}`} style={{ fontSize: '0.8rem' }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden p-6 flex flex-col">
          <div className="max-w-[1600px] mx-auto w-full flex flex-col flex-1 min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
