import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const UserMenu = ({ onManageUsers }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleManageUsers = () => {
    onManageUsers();
    setIsOpen(false);
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="user-button" onClick={() => setIsOpen(!isOpen)}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 10a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
        </svg>
        {user?.username}
      </button>
      {isOpen && (
        <div className="user-dropdown">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>
            <div style={{ fontWeight: '600' }}>{user?.fullName || user?.username}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>{user?.email}</div>
            <div style={{ fontSize: '12px', color: '#007a78', marginTop: '4px' }}>
              Role: {user?.role}
            </div>
          </div>
          {isAdmin && (
            <>
              <button className="user-dropdown-item" onClick={handleManageUsers}>
                Manage Users
              </button>
              <div className="user-dropdown-divider" />
            </>
          )}
          <button className="user-dropdown-item" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;