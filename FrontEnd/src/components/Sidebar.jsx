import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaEnvelope, FaBell, FaCog, FaHistory, FaUser, FaSun, FaMoon, FaBars, FaTimes, FaInbox, FaPaperPlane, FaArchive, FaClock } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { jwtDecode } from 'jwt-decode';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { darkMode, toggleDarkMode, colors } = useTheme();
  const [user, setUser] = useState(null);
  const goldColor = '#EAB308';
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded User:', decoded); // Debug: Log decoded user data
        setUser(decoded);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.warn('No token found in localStorage');
    }
  }, []);

  const getSidebarItems = () => {
    if (!user) {
      console.log('User is null, returning empty sidebar items');
      return [];
    }

    const departmentSlug = user.department?.toLowerCase().replace(/\s/g, '-') || 'unknown';
    console.log('Department Slug:', departmentSlug); // Debug: Log the slug

    if (user.role === 'admin') {
      return [
        { icon: <FaHome />, label: 'Dashboard', link: '/admin/dashboard' },
        { icon: <FaUsers />, label: 'User Management', link: '/admin/users' },
        { icon: <FaEnvelope />, label: 'Courrier Management', link: '/admin/courriers' },
        { icon: <FaBell />, label: 'Notifications', link: '/admin/notifications', badge: 3 },
        { icon: <FaCog />, label: 'Settings', link: '/admin/settings' },
        { icon: <FaHistory />, label: 'Logs & Audits', link: '/admin/logs' },
        { icon: <FaUser />, label: 'Profile', link: '/admin/profile' },
      ];
    } else {
      return [
        { icon: <FaHome />, label: 'Dashboard', link: `/dashboard/${departmentSlug}` },
        { icon: <FaInbox />, label: 'Inbox', link: `/dashboard/${departmentSlug}/inbox`, badge: 5 },
        { icon: <FaPaperPlane />, label: 'Sent', link: `/dashboard/${departmentSlug}/sent` },
        { icon: <FaArchive />, label: 'Archived', link: `/dashboard/${departmentSlug}/archived` },
        { icon: <FaClock />, label: 'Pending Courriers', link: `/dashboard/${departmentSlug}/pending`, badge: 2 },
        { icon: <FaUser />, label: 'Profile', link: `/dashboard/${departmentSlug}/profile` },
      ];
    }
  };

  const sidebarItems = getSidebarItems();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const currentPath = location.pathname.replace(/\/$/, ''); // Normalize by removing trailing slash
    console.log('Current Path:', currentPath); // Debug: Log current path
    console.log('Sidebar Items:', sidebarItems.map(item => ({ label: item.label, link: item.link }))); // Debug: Log sidebar items

    // Step 1: Look for an exact match
    let matchedIndex = sidebarItems.findIndex(item => {
      const itemLink = item.link.replace(/\/$/, '');
      return currentPath === itemLink;
    });

    // Step 2: If no exact match, look for the closest sub-route match
    if (matchedIndex === -1) {
      matchedIndex = sidebarItems.findIndex(item => {
        const itemLink = item.link.replace(/\/$/, '');
        // Ensure it's a sub-route and not just the base dashboard path
        return currentPath.startsWith(itemLink) && currentPath !== itemLink && itemLink.includes('/dashboard/');
      });
    }

    // Step 3: Default to 0 if no match found
    const newActiveIndex = matchedIndex !== -1 ? matchedIndex : 0;
    console.log('Exact Match Index:', matchedIndex !== -1 ? matchedIndex : 'None');
    console.log('Selected Active Index:', newActiveIndex, 'Label:', sidebarItems[newActiveIndex]?.label); // Debug: Log final index
    setActiveIndex(newActiveIndex);
  }, [location.pathname, sidebarItems]);

  return (
    <div
      className={`fixed top-0 left-0 h-screen shadow-xl z-30 flex flex-col transition-width duration-300 ease-in-out`}
      style={{ 
        width: isCollapsed ? '80px' : '250px',
        background: darkMode ? 
          `linear-gradient(180deg, ${colors.darkBg} 0%, ${colors.darkCard} 100%)` : 
          `linear-gradient(180deg, ${colors.lightBg} 0%, ${colors.surfaces.light.level2} 100%)`,
        overflowX: 'hidden'
      }}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between mb-6">
          <div className="flex items-center w-full justify-between">
            {!isCollapsed && (
              <div className="flex items-center min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" 
                     style={{ background: colors.gradients.gold }}>
                  {user?.role === 'admin' ? 'A' : user?.roleType?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="ml-2 overflow-hidden">
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} whitespace-nowrap`}>
                    {user?.role === 'admin' ? 'Admin' : 'Directeur'}
                  </h1>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} whitespace-nowrap`}>
                    {user?.department || 'Pro Portal'}
                  </div>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-white font-bold"
                   style={{ background: colors.gradients.gold }}>
                {user?.role === 'admin' ? 'A' : user?.roleType?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className={`p-2 rounded-full transition-all duration-200 ${darkMode ? 'text-white' : 'text-gray-800'} hover:text-${goldColor} hover:scale-110`}
            >
              {isCollapsed ? <FaBars /> : <FaTimes />}
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4">
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={`flex items-center p-3 rounded-xl mb-2 transition-all duration-200 relative group
                ${isCollapsed ? 'justify-center px-2' : 'px-3'}
                ${index === activeIndex 
                  ? 'text-white font-medium' 
                  : `${darkMode ? 'text-gray-400' : 'text-gray-600'} hover:text-${goldColor}`}`}
              style={{
                background: index === activeIndex ? colors.gradients.gold : 'transparent',
                boxShadow: index === activeIndex ? `0 4px 12px ${colors.primary}40` : 'none',
              }}
            >
              <div className={`flex justify-center items-center ${isCollapsed ? 'w-full' : 'mr-3'} relative transition-transform duration-200 ${index !== activeIndex ? 'group-hover:text-yellow-500 group-hover:scale-110' : ''}`}>
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <span className="relative z-10 whitespace-nowrap group-hover:text-yellow-500">{item.label}</span>
              )}
              {index !== activeIndex && (
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                  style={{
                    background: `linear-gradient(90deg, rgba(234, 179, 8, 0.05), rgba(234, 179, 8, 0.15))`,
                    boxShadow: `0 2px 8px rgba(234, 179, 8, 0.2)`,
                    transform: 'translateZ(0)'
                  }}
                ></div>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-gray-700/30 p-4">
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-4">
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div>v1.2.0</div>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full transition-all duration-200 hover:scale-110 hover:shadow-md"
                style={{ 
                  backgroundColor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 1)',
                  color: darkMode ? '#FFC107' : 'rgba(55, 65, 81, 1)',
                }}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
            </div>
          )}
          {isCollapsed && (
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full mx-auto block transition-all duration-200 hover:scale-110 hover:shadow-md"
              style={{ 
                backgroundColor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 1)',
                color: darkMode ? '#FFC107' : 'rgba(55, 65, 81, 1)',
              }}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          )}
          <div 
            className={`mt-2 p-3 rounded-xl flex items-center transition-all duration-200 cursor-pointer hover:shadow-md`}
            style={{ 
              backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(229, 231, 235, 0.5)',
            }}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex-shrink-0"
                 style={{ background: colors.gradients.purple }}>
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium">
                {user?.fullName?.split(' ').map(n => n[0]).join('') || 'AU'}
              </div>
            </div>
            {!isCollapsed && (
              <div className="ml-2 flex-1 min-w-0">
                <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'} whitespace-nowrap overflow-hidden text-ellipsis`}>
                  {user?.fullName || 'User'}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-nowrap overflow-hidden text-ellipsis`}>
                  {user?.email || 'user@example.com'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;