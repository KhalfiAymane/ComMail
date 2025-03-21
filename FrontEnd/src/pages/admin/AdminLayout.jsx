import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import TopNavbar from '../../components/TopNavbar';
import { useTheme } from '../../contexts/ThemeContext';
import { FaBars, FaTimes } from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const { darkMode, colors } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pageScrolled, setPageScrolled] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
        setMobileSidebarOpen(false);
      } else {
        setIsCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setPageScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${darkMode ? 'bg-[#131313]' : 'bg-gray-50'} overflow-hidden`}>
      {isMobile && (
        <button
          onClick={toggleMobileSidebar}
          className={`fixed top-4 left-4 z-40 p-2 rounded-lg transition-all duration-300`}
          style={{
            background: darkMode ? 
              `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent1} 100%)` : 
              `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent1} 100%)`,
            boxShadow: `0 4px 10px ${colors.primary}40`,
            color: 'white'
          }}
        >
          {mobileSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}
      
      <div 
        className={`
          ${isMobile ? 'fixed top-0 left-0 h-screen z-30' : 'fixed top-0 left-0 h-screen z-20'}
          transition-transform duration-300 ease-in-out
          ${isMobile ? (mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        `}
        style={{ width: isCollapsed ? '80px' : '250px' }}
      >
        <Sidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
      </div>
        
      <div 
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ 
          marginLeft: isMobile ? '0' : (isCollapsed ? '80px' : '250px'),
          width: isMobile ? '100%' : `calc(100% - ${isCollapsed ? '80px' : '250px'})`
        }}
      >
        <div 
          className={`sticky top-0 z-10 transition-all duration-300 ${pageScrolled ? 'shadow-md' : ''}`}
          style={{
            boxShadow: pageScrolled ? `0 4px 20px ${darkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}` : 'none'
          }}
        >
          <TopNavbar 
            sidebarWidth={isCollapsed ? '80px' : '250px'} 
            toggleMobileSidebar={toggleMobileSidebar} 
            isMobile={isMobile} 
          />
        </div>
          
        <main 
          className="flex-grow overflow-y-auto h-[calc(100vh-64px)]"
        >
          {children}
        </main>

        <div 
          className="h-1 w-full"
          style={{ 
            background: `linear-gradient(to right, ${colors.primary}, ${colors.accent2}, ${colors.accent3})`,
            opacity: 0.7
          }}
        ></div>
      </div>
      
      {isMobile && mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;