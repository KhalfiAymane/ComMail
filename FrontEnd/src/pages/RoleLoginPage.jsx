import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBuilding, FaSun, FaMoon, FaArrowLeft } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const RoleLoginPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const departmentData = {
    president: { title: 'Présidence', subtitle: 'Connexion au compte Présidence' },
    dgs: { title: 'Direction Générale des Services', subtitle: 'Connexion au compte DGS' },
    bo: { title: 'Bureau d’Ordre', subtitle: 'Connexion au compte Bureau d’Ordre' },
    sc: { title: 'Secrétariat du Conseil', subtitle: 'Connexion au compte Secrétariat du Conseil' },
    sp: { title: 'Secrétariat du Président', subtitle: 'Connexion au compte Secrétariat du Président' },
    rh: { title: 'Ressources Humaines', subtitle: 'Connexion au compte Ressources Humaines' },
    dfm: { title: 'Division Financière', subtitle: 'Connexion au compte Division Financière' },
    dt: { title: 'Division Technique', subtitle: 'Connexion au compte Division Technique' },
    bh: { title: 'Bureau d’Hygiène', subtitle: 'Connexion au compte Bureau d’Hygiène' },
    pc: { title: 'Partenariat et Coopération', subtitle: 'Connexion au compte Partenariat et Coopération' },
    ic: { title: 'Informatique et Communication', subtitle: 'Connexion au compte Informatique et Communication' },
    admin: { title: 'Administration', subtitle: 'Connexion au compte Administrateur' },
  };

  useEffect(() => {
    const roleEmails = {
      president: 'president@commune.org',
      dgs: 'dgs@commune.org',
      bo: 'bo@commune.org',
      sc: 'sc@commune.org',
      sp: 'sp@commune.org',
      rh: 'rh@commune.org',
      dfm: 'dfm@commune.org',
      dt: 'dt@commune.org',
      bh: 'bh@commune.org',
      pc: 'pc@commune.org',
      ic: 'ic@commune.org',
      admin: 'admin@commune.org',
    };
    if (role && roleEmails[role]) setEmail(roleEmails[role]);
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
  
      const decoded = jwtDecode(token);
      console.log('Decoded JWT:', decoded); // Debug: Check role and department
      const { userId, email: decodedEmail, department, role } = decoded;
  
      let dashboardRoute;
      if (role === 'admin') {
        dashboardRoute = '/admin/dashboard';
      } else {
        // Use department from JWT to construct the route
        const deptSlug = department
          .toLowerCase()
          .replace(/’/g, '') // Remove apostrophes
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/é/g, 'e') // Replace accented characters (for "Générale")
          .replace(/è/g, 'e');
        dashboardRoute = `/dashboard/${deptSlug}`;
      }
  
      console.log('Navigating to:', dashboardRoute); // Debug: Confirm route
      navigate(dashboardRoute);
    } catch (err) {
      setError(err.response?.data?.error || 'Échec de la connexion');
    }
  };

  const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };
  const formVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={darkMode ? 'dark' : 'light'}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
        className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}
      >
        <header className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} shadow-lg`}>
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img src="/images/comLog.png" alt="Commune Logo" className="h-16 w-16 rounded-lg border-2 border-yellow-500/20" />
              <div>
                <h1 className="text-lg font-bold">La Commune</h1>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>Système de Gestion des Courriers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button onClick={() => navigate(-1)} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-600 hover:bg-gray-200'}`} whileHover={{ scale: 1.02 }}>
                <FaArrowLeft className="w-3.5 h-3.5" />
                <span>Retour</span>
              </motion.button>
              <motion.button onClick={toggleDarkMode} className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`} whileHover={{ scale: 1.05 }}>
                {darkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center py-8">
          <div className="container mx-auto px-4 max-w-xs">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
              <motion.div className="text-center mb-6" variants={formVariants} initial="hidden" animate="visible">
                <motion.div className={`inline-block p-3 rounded-full mb-3 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`} variants={itemVariants}>
                  <FaBuilding className="text-blue-400 text-3xl" />
                </motion.div>
                <motion.h2 className={`text-xl font-bold mb-1 ${darkMode ? 'from-yellow-400 to-yellow-600' : 'from-yellow-500 to-yellow-700'} bg-gradient-to-r bg-clip-text text-transparent`} variants={itemVariants}>
                  {departmentData[role]?.title || 'Connexion'}
                </motion.h2>
                <motion.p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`} variants={itemVariants}>
                  {departmentData[role]?.subtitle || 'Veuillez saisir vos identifiants'}
                </motion.p>
              </motion.div>

              {error && (
                <motion.div className={`mb-4 p-2 rounded-md text-sm ${darkMode ? 'bg-red-800/50 text-red-200' : 'bg-red-100 text-red-600'}`} variants={itemVariants}>
                  {error}
                </motion.div>
              )}

              <motion.form onSubmit={handleSubmit} className="space-y-4" variants={formVariants} initial="hidden" animate="visible">
                <motion.div variants={itemVariants}>
                  <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md text-sm ${darkMode ? 'bg-gray-700/50 border-gray-600 focus:border-yellow-500' : 'bg-gray-100 border-gray-300 focus:border-yellow-500'}`}
                    placeholder="votre@email.com"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md text-sm ${darkMode ? 'bg-gray-700/50 border-gray-600 focus:border-yellow-500' : 'bg-gray-100 border-gray-300 focus:border-yellow-500'}`}
                    placeholder="••••••••"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <motion.button type="submit" className={`w-full py-2 px-4 rounded-md text-sm font-medium ${darkMode ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-yellow-500 hover:bg-yellow-400'} text-white`} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    Se connecter
                  </motion.button>
                </motion.div>
              </motion.form>
            </motion.div>
          </div>
        </main>

        <footer className={`py-3 text-center text-xs ${darkMode ? 'bg-gray-800/80 text-gray-400' : 'bg-white/80 text-gray-600'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="container mx-auto px-4">
            <p>© 2025 La Commune - Système de Gestion des Courriers</p>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoleLoginPage;