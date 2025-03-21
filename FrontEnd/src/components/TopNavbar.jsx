import React, { useState, useEffect } from 'react';
import { FaBell, FaUserCircle, FaClock, FaArchive, FaEnvelope, FaCog, FaSignOutAlt, FaRegQuestionCircle } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { jwtDecode } from 'jwt-decode';

const TopNavbar = ({ sidebarWidth }) => {
  const { darkMode, colors } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const notifications = user?.roleType === 'directeur' ? [
    { id: 1, text: `New courrier in ${user.department} inbox`, time: '10 min ago', icon: <FaEnvelope />, color: colors.accent3, unread: true },
    { id: 2, text: 'Pending courrier needs approval', time: '30 min ago', icon: <FaClock />, color: colors.accent2, unread: true },
    { id: 3, text: 'Archive updated by team', time: '1 hour ago', icon: <FaArchive />, color: colors.accent1, unread: false },
  ] : [
    { id: 1, text: 'New courrier received from Legal', time: '5 min ago', icon: <FaEnvelope />, color: colors.accent3, unread: true },
    { id: 2, text: 'User updated profile', time: '1 hour ago', icon: <FaUserCircle />, color: colors.accent2, unread: true },
    { id: 3, text: 'System maintenance scheduled', time: '2 hours ago', icon: <FaCog />, color: colors.accent1, unread: false },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if ((showNotifications || showProfile) && !event.target.closest('.dropdown-container')) {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfile]);

  return (
    <div
      className={`fixed top-0 ${user?.roleType === 'directeur' ? 'left-0 right-0' : `left-${sidebarWidth} right-0`} flex justify-between items-center transition-all duration-300 
        ${darkMode ? 'bg-[#131313]' : 'bg-[#FFFFFF]'} h-16 z-20 shadow-md`}
      style={{ left: user?.roleType === 'directeur' ? '0' : sidebarWidth }}
    >
      {/* Left side - Empty now that search is removed */}
      <div 
        className="flex items-center px-4"
        style={{ 
          marginLeft: user?.roleType === 'directeur' ? `${sidebarWidth}px` : '0',
        }}
      >
        {/* Placeholder or empty div to maintain layout */}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3 px-4">
        <button className={`p-2 rounded-full hover:bg-${colors.primary}/10`}>
          <FaRegQuestionCircle className={darkMode ? 'text-white' : 'text-gray-700'} />
        </button>

        <div className="relative dropdown-container">
          <button 
            className={`relative p-2 rounded-full hover:bg-${colors.primary}/10`}
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
          >
            <FaBell className={darkMode ? 'text-white' : 'text-gray-700'} />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {notifications.filter(n => n.unread).length}
            </span>
          </button>
          {showNotifications && (
            <div 
              className={`absolute right-0 mt-2 w-80 rounded-xl shadow-lg overflow-hidden
                ${darkMode ? `bg-${colors.surfaces.dark.level1} text-white` : `bg-white text-gray-800`}
                border border-${colors.primary}/20 z-20`}
            >
              <div className="p-3 border-b border-gray-700/20 flex justify-between items-center">
                <h3 className="font-bold">Notifications</h3>
                <span className={`text-xs px-2 py-1 rounded-full bg-${colors.primary}/20 text-${colors.primary}`}>
                  {notifications.filter(n => n.unread).length} new
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border-b border-gray-700/10 ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'} 
                    cursor-pointer relative ${notification.unread ? 'bg-blue-500/5' : ''}`}
                  >
                    {notification.unread && (
                      <span className="absolute right-3 top-3 w-2 h-2 rounded-full bg-blue-500"></span>
                    )}
                    <div className="flex items-start">
                      <div className="p-2 rounded-lg mr-3 flex-shrink-0" 
                           style={{ backgroundColor: `${notification.color}30`, color: notification.color }}>
                        {notification.icon}
                      </div>
                      <div>
                        <p className="text-sm">{notification.text}</p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center">
                <button className={`w-full py-2 text-sm text-${colors.primary} hover:underline font-medium`}>
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative dropdown-container">
          <div 
            className={`flex items-center space-x-2 cursor-pointer py-1 px-2 rounded-xl hover:bg-${colors.primary}/10`}
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white"
                 style={{ background: colors.gradients.gold }}>
              <span className="font-semibold">
                {user?.fullName?.split(' ').map(n => n[0]).join('') || 'AU'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {user?.fullName || 'User'}
              </span>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {user?.roleType === 'directeur' ? `${user.department} Directeur` : 'Super Admin'}
              </span>
            </div>
          </div>
          {showProfile && (
            <div 
              className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg overflow-hidden z-20
                ${darkMode ? `bg-${colors.surfaces.dark.level1} text-white` : `bg-white text-gray-800`}
                border border-${colors.primary}/20`}
            >
              <div className="p-4 border-b border-gray-700/20">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center text-white"
                       style={{ background: colors.gradients.gold }}>
                    <span className="font-semibold text-lg">
                      {user?.fullName?.split(' ').map(n => n[0]).join('') || 'AU'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user?.fullName || 'User'}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <a href={user?.roleType === 'directeur' ? '/directeur/profile' : '/admin/profile'} 
                   className={`flex items-center space-x-2 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}>
                  <FaUserCircle className={`text-${colors.accent2}`} />
                  <span>My Profile</span>
                </a>
                <a href={user?.roleType === 'directeur' ? '/directeur/settings' : '/admin/settings'} 
                   className={`flex items-center space-x-2 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}>
                  <FaCog className={`text-${colors.accent1}`} />
                  <span>Settings</span>
                </a>
                <div className="my-1 border-t border-gray-700/20"></div>
                <a href="/logout" className={`flex items-center space-x-2 p-2 rounded-lg text-red-500 ${darkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}>
                  <FaSignOutAlt />
                  <span>Logout</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;