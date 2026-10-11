
import React from 'react';
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
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  

  return (<>
    <div className="user-profile">
      <div className="user-avatar" aria-hidden="true">
        {initials || 'U'}
      </div>

      <div className="user-profile-details">
        <span className="user-profile-label">SIGNED IN AS</span>
        <h3>{name || 'User'}</h3>
        <p>{email}</p>
        <span className="user-status">
          <span className="user-status-dot" />
          Active account
        </span>
      </div>

      <button
  type="button"
  className="user-logout-button"
  onClick={() => setShowLogoutDialog(true)}
  aria-label="Log out of your account"
>
  Logout
</button>
    </div>
    <ConfirmDialog
  open={showLogoutDialog}
  title="Log out?"
  message="Are you sure you want to log out of your account?"
  confirmText="Logout"
  cancelText="Stay logged in"
  danger
  onCancel={() => setShowLogoutDialog(false)}
  onConfirm={onLogout}
/></>
  );
  
};

export default UserProfile;
