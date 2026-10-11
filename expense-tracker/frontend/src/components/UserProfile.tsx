import React, { useEffect, useRef, useState } from 'react';
import { UserRound, LogOut } from 'lucide-react';
import './UserProfile.css';
import ConfirmDialog from './ConfirmDialog';

interface UserProfileProps {
  name: string;
  email: string;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  name,
  email,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  return (
    <>
      <div className="user-profile-menu" ref={profileRef}>
        <button
          type="button"
          className="user-profile-trigger"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-label="Open user profile"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <UserRound size={19} />
        </button>

        {isOpen && (
          <div className="user-profile-dropdown">
            <div className="profile-dropdown-header">
              <div className="user-avatar" aria-hidden="true">
                {initials || 'U'}
              </div>

              <div className="profile-dropdown-identity">
                <h3>{name || 'User'}</h3>
                <p>{email}</p>
              </div>
            </div>

            <div className="profile-dropdown-status">
              <span className="user-status-dot" />
              Active account
            </div>

            <div className="profile-dropdown-divider" />

            <button
              type="button"
              className="profile-dropdown-logout"
              onClick={() => {
                setIsOpen(false);
                setShowLogoutDialog(true);
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showLogoutDialog}
        title="Log out?"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        cancelText="Stay logged in"
        danger
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default UserProfile;