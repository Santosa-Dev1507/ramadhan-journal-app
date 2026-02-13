import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation: React.FC = () => {
  const navItems = [
    { name: 'Harian', icon: 'menu_book', path: '/journal' },
    { name: 'Rank', icon: 'leaderboard', path: '/leaderboard' }, 
    { name: 'Lencana', icon: 'workspace_premium', path: '/progress', filled: true },
    { name: 'Profil', icon: 'person', path: '/profile' },
  ];

  return (
    <nav className="sticky bottom-0 w-full bg-white dark:bg-background-dark border-t border-gray-100 dark:border-gray-800 px-6 py-3 flex justify-between items-center z-20 shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors duration-200 ${
              isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span 
                className={`material-symbols-outlined ${item.filled && isActive ? 'material-symbols-filled' : ''}`}
                style={item.filled && isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className={`text-[10px] font-bold`}>{item.name}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navigation;