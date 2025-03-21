import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserTie, FaBuilding, FaClipboardList, FaFileSignature, FaCalendarCheck, FaUsers, FaMoneyBillWave,
  FaTools, FaBriefcaseMedical, FaHandshake, FaLaptopCode, FaCog, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const roles = [
    { id: "president", title: "PRÉSIDENT", icon: <FaUserTie className="text-blue-400" /> },
    { id: "dgs", title: "DIRECTION GÉNÉRALE DES SERVICES", icon: <FaBuilding className="text-green-400" /> },
    { id: "bo", title: "BUREAU D'ORDRE", icon: <FaClipboardList className="text-red-400" /> },
    { id: "sc", title: "SECRÉTARIAT DU CONSEIL", icon: <FaFileSignature className="text-purple-400" /> },
    { id: "sp", title: "SECRÉTARIAT DU PRÉSIDENT", icon: <FaCalendarCheck className="text-yellow-400" /> },
    { id: "rh", title: "RESSOURCES HUMAINES", icon: <FaUsers className="text-orange-400" /> },
    { id: "dfm", title: "DIVISION FINANCIÈRE", icon: <FaMoneyBillWave className="text-green-300" /> },
    { id: "dt", title: "DIVISION TECHNIQUE", icon: <FaTools className="text-gray-400" /> },
    { id: "bh", title: "BUREAU D'HYGIÈNE", icon: <FaBriefcaseMedical className="text-blue-300" /> },
    { id: "pc", title: "PARTENARIAT ET COOPÉRATION", icon: <FaHandshake className="text-pink-400" /> },
    { id: "ic", title: "INFORMATIQUE ET COMMUNICATION", icon: <FaLaptopCode className="text-teal-400" /> },
    { id: "admin", title: "ADMINISTRATEUR", icon: <FaCog className="text-gray-300" /> },
  ];

  const redirectToLogin = (roleId) => {
    navigate(`/login/${roleId}`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
        type: "spring",
        stiffness: 100
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 200,
        damping: 15,
        mass: 0.5
      }
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={darkMode ? 'dark' : 'light'}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}
      >
        <header className={`${darkMode ? "bg-gray-800/80 backdrop-blur-sm" : "bg-white/80 backdrop-blur-sm"} shadow-lg`}>
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="container mx-auto px-4 py-4 flex justify-between items-center"
          >
            <div className="flex items-center space-x-4">
              <img 
                src="/images/comLog.png" 
                alt="Commune Logo" 
                className="h-20 w-20"
              />
              <div>
                <h1 className="text-xl font-bold tracking-tight">La Commune</h1>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Système de Gestion des Courriers
                </p>
              </div>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={`p-3 rounded-full transition-all duration-300 ${
                darkMode 
                  ? "bg-gray-700 hover:bg-gray-600 text-yellow-400" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {darkMode ? <FaSun className="w-5 h-5"/> : <FaMoon className="w-5 h-5"/>}
            </button>
          </motion.div>
        </header>

        <main className="flex-grow py-12">
          <div className="container mx-auto px-4 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <div className="flex justify-center mb-8">
                <motion.img 
                  src="/images/comLog.png" 
                  alt="Commune Logo" 
                  className="h-40 w-40"
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 150,
                    damping: 10,
                    delay: 0.15
                  }}
                />
              </div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-3xl font-bold mb-4 bg-gradient-to-r ${
                  darkMode ? "from-yellow-400 to-yellow-600" : "from-yellow-500 to-yellow-700"
                } bg-clip-text text-transparent`}
              >
                Espace de Connexion
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Sélectionnez votre rôle pour accéder au système
              </motion.p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 max-w-[720px] mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {roles.map((role) => (
                <motion.div
                  key={role.id}
                  variants={itemVariants}
                  whileHover="hover"
                  onClick={() => redirectToLogin(role.id)}
                  className={`group relative p-6 rounded-xl cursor-pointer
                    aspect-square flex flex-col items-center justify-center
                    ${darkMode 
                      ? "bg-gray-800 hover:border-yellow-400 border-2 border-transparent" 
                      : "bg-white hover:border-yellow-400 border-2 border-transparent"}
                    shadow-lg hover:shadow-xl overflow-hidden`}
                >
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`p-4 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110
                      ${darkMode ? "bg-gray-700/50" : "bg-gray-100"}`}>
                      <div className="text-4xl">{role.icon}</div>
                    </div>
                    <h3 className={`text-sm font-semibold tracking-wide text-center leading-tight px-2
                      ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {role.title}
                    </h3>
                  </div>
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    ${darkMode ? "bg-gradient-to-br from-yellow-500/10 to-transparent" : "bg-gradient-to-br from-yellow-200/20 to-transparent"}`} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </main>

        <footer className={`py-4 text-center text-sm ${darkMode ? "bg-gray-800/80 text-gray-400" : "bg-white/80 text-gray-600"} border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <motion.div 
            className="container mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>&copy; 2025 La Commune - Système de Gestion des Courriers. Tous droits réservés.</p>
          </motion.div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoleSelectionPage;