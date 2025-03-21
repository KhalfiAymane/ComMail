import React, { useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopNavbar from '../../components/TopNavbar';
import NewCourrierModal from '../../components/NewCourrierModal';
import { useTheme } from '../../contexts/ThemeContext';
import { jwtDecode } from 'jwt-decode';

const DirecteurLayout = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { department } = useParams();

  const colors = {
    primary: "#A78800",
    bgDark: "#131313",
    cardDark: "#1F2024",
    white: "#FFFFFF",
    textGray: "#4C4C4C",
    darkBg: "#131313",
    grayText: "#AAAAAA",
    black: "#000000",
    gradients: {
      gold: 'linear-gradient(135deg, #EAB308, #A78800)',
      purple: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    },
    lightBg: "#F5F5F5",
    surfaces: { light: { level2: "#E5E7EB" } }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserData({ ...decoded, department: department || decoded.department });
      } catch (error) {
        console.error('Invalid token:', error);
        setUserData({ fullName: 'Jean Dupont', department: department || 'Ressources Humaines', roleType: 'directeur' });
      }
    } else {
      setUserData({ fullName: 'Jean Dupont', department: department || 'Ressources Humaines', roleType: 'directeur' });
    }
    setIsLoading(false);

    const handleResize = () => setIsCollapsed(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [department]);

  const sidebarWidth = isCollapsed ? 80 : 250;

  const handleModalClose = (response) => {
    setIsModalOpen(false);
    if (response) {
      console.log('Courrier sent:', response);
      // Optionally, refresh dashboard data here if needed
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#131313] text-white' : 'bg-gray-50 text-[#000000]'}`}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#131313] text-white' : 'bg-gray-50 text-[#000000]'}`}>
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
      />
      <div 
        className="transition-all duration-300"
        style={{ 
          marginLeft: isCollapsed ? '80px' : '250px',
          padding: '24px',
        }}
      >
        <TopNavbar 
          sidebarWidth={sidebarWidth}
          darkMode={darkMode}
          userData={userData}
          title={`${userData?.department || 'Department'} Dashboard`}
          toggleDarkMode={toggleDarkMode}
          colors={colors}
        />
        <main className="pt-20 pb-10 max-w-7xl mx-auto">
          <Outlet context={{ userData, setIsModalOpen }} /> {/* Pass setIsModalOpen to children */}
        </main>
      </div>
      <NewCourrierModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        initialData={{ senderRole: userData?.roleType, senderDepartment: userData?.department }} 
      />
    </div>
  );
};

export default DirecteurLayout;