import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Search, Star, StarOff, Archive, Trash2, Mail,
  Filter, Check, CheckSquare, Square, ChevronDown, 
  MoreHorizontal, AlertCircle, Clock, Bookmark,
  X, Box, RefreshCw, Eye, CornerUpLeft, Forward,
  Calendar, Download, Printer, Tag, FileText, Users, User
} from 'lucide-react';
import axios from 'axios';

const CourrierArchived = () => {
  const { darkMode } = useTheme();

  // Theme-based styling
  const mainBg = darkMode ? 'bg-[#131313]' : 'bg-[#F5F5F5]';
  const containerBg = darkMode ? 'bg-[#1F2024]' : 'bg-[#FFFFFF]';
  const textColor = darkMode ? 'text-[#FFFFFF]' : 'text-[#000000]';
  const subTextColor = darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]';
  const hoverBg = darkMode ? 'hover:bg-[#131313]/80' : 'hover:bg-gray-100';
  const accentColor = 'text-[#A78800]';
  const accentBg = 'bg-[#A78800]';
  const borderColor = darkMode ? 'border-gray-700/20' : 'border-gray-200';

  // State management
  const [userData, setUserData] = useState({ role: '', department: '', email: '' });
  const [courriers, setCourriers] = useState([]);
  const [selectedCourriers, setSelectedCourriers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [hoveredCourrier, setHoveredCourrier] = useState(null);
  const [viewMode, setViewMode] = useState('compact');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPersonalView, setIsPersonalView] = useState(true);
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showTagsFilter, setShowTagsFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({});

  // Inject styles into document head
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Fetch data from backend
  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Utilisateur non authentifié');
      setLoading(false);
      return;
    }

    try {
      const profileResponse = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData({
        role: profileResponse.data.role,
        department: profileResponse.data.department,
        email: profileResponse.data.email,
      });

      const mailsResponse = await axios.get('http://localhost:5000/api/mails/mails-and-counts', {
        headers: { Authorization: `Bearer ${token}` },
        params: { section: 'archives' },
      });

      const mappedCourriers = mailsResponse.data.courriers.map(mail => ({
        id: mail._id,
        sender: mail.sender.department,
        subject: mail.subject,
        content: mail.content,
        dateArchived: new Date(mail.updatedAt).toLocaleString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        archivedBy: mail.archivedBy ? mail.archivedBy.email : 'Unknown',
        originalDate: new Date(mail.createdAt).toLocaleString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        read: mail.isRead,
        favorite: mail.favorite,
        priority: mail.type === 'urgent' ? 'high' : mail.type === 'officiel' ? 'medium' : 'low',
        department: mail.sender.department,
        tags: [], // Add tags if supported in backend
        attachments: mail.attachments.length,
        personal: mail.sender._id.toString() === profileResponse.data._id || mail.receiverDepartments.includes(profileResponse.data.department),
      }));

      setCourriers(mappedCourriers);
      setCounts(mailsResponse.data.counts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handler functions
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedCourriers(selectAll ? [] : filteredCourriers.map(c => c.id));
  };

  const handleSelect = (id) => {
    setSelectedCourriers(prev => 
      prev.includes(id) 
        ? prev.filter(cId => cId !== id) 
        : [...prev, id]
    );
  };

  const handleFavoriteToggle = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const mail = courriers.find(c => c.id === id);
      const newFavoriteStatus = !mail.favorite;
      await axios.put(
        `http://localhost:5000/api/mails/${id}`,
        { favorite: newFavoriteStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourriers(prev => prev.map(c => 
        c.id === id ? { ...c, favorite: newFavoriteStatus } : c
      ));
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Erreur lors de la mise à jour des favoris');
    }
  };

  const handleUnarchive = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/mails/${id}/status`,
        { section: 'inbox' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourriers(prev => prev.filter(c => c.id !== id));
      fetchData(); // Refresh counts
    } catch (err) {
      console.error('Error unarchiving mail:', err);
      setError('Erreur lors du désarchivage');
    }
  };

  const handleBulkUnarchive = async () => {
    try {
      const token = localStorage.getItem('token');
      await Promise.all(selectedCourriers.map(id =>
        axios.put(
          `http://localhost:5000/api/mails/${id}/status`,
          { section: 'inbox' },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ));
      setCourriers(prev => prev.filter(c => !selectedCourriers.includes(c.id)));
      setSelectedCourriers([]);
      setSelectAll(false);
      fetchData(); // Refresh counts
    } catch (err) {
      console.error('Error bulk unarchiving:', err);
      setError('Erreur lors du désarchivage en masse');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/mails/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourriers(prev => prev.filter(c => c.id !== id));
      fetchData(); // Refresh counts
    } catch (err) {
      console.error('Error deleting mail:', err);
      setError('Erreur lors de la suppression');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await Promise.all(selectedCourriers.map(id =>
        axios.delete(`http://localhost:5000/api/mails/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ));
      setCourriers(prev => prev.filter(c => !selectedCourriers.includes(c.id)));
      setSelectedCourriers([]);
      setSelectAll(false);
      fetchData(); // Refresh counts
    } catch (err) {
      console.error('Error bulk deleting:', err);
      setError('Erreur lors de la suppression en masse');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  // Filter logic
  const filteredCourriers = courriers.filter(courrier => {
    if (isPersonalView && !courrier.personal) return false;
    if (showFavoritesOnly && !courrier.favorite) return false;
    if (activeFilter !== 'all' && courrier.department !== activeFilter) return false;
    if (priorityFilter !== 'all' && courrier.priority !== priorityFilter) return false;

    if (dateRangeFilter !== 'all') {
      const archivedDate = new Date(courrier.dateArchived);
      const now = new Date();
      const diffDays = Math.ceil((now - archivedDate) / (1000 * 60 * 60 * 24));
      if (dateRangeFilter === '7 derniers jours' && diffDays > 7) return false;
      if (dateRangeFilter === '30 derniers jours' && diffDays > 30) return false;
      if (dateRangeFilter === '3 derniers mois' && diffDays > 90) return false;
      if (dateRangeFilter === '6 derniers mois' && diffDays > 180) return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        courrier.sender.toLowerCase().includes(query) ||
        courrier.subject.toLowerCase().includes(query) ||
        courrier.content.toLowerCase().includes(query) ||
        courrier.department.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Count statistics
  const totalCount = courriers.length;
  const personalCount = courriers.filter(c => c.personal).length;
  const centralizedCount = courriers.filter(c => !c.personal).length;
  const favoriteCount = courriers.filter(c => c.favorite).length;
  const personalFavorites = courriers.filter(c => c.personal && c.favorite).length;
  const personalHighPriority = courriers.filter(c => c.personal && c.priority === 'high').length;

  // Animation variants
  const listItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const refreshVariants = {
    initial: { rotate: 0 },
    animate: { rotate: 360, transition: { duration: 1, repeat: Infinity, ease: 'linear' } }
  };

  // Helper functions
  const getDepartmentColor = (dept) => {
    const colors = {
      'Ressources Humaines': 'bg-purple-500',
      'Division Financière': 'bg-blue-500',
      'Division Technique': 'bg-green-500',
      'Bureau d\'Ordre': 'bg-gray-500',
      'Direction Générale des Services': 'bg-red-500',
      'Présidence': 'bg-yellow-500',
      'Administration': 'bg-pink-500',
    };
    return colors[dept] || 'bg-gray-500';
  };

  const getDepartmentInitials = (dept) => {
    return dept.substring(0, 2).toUpperCase();
  };

  const getPriorityColor = (priority) => {
    return {
      'high': 'text-red-500',
      'medium': 'text-orange-500',
      'low': 'text-green-500'
    }[priority] || 'text-gray-500';
  };

  const getPriorityLabel = (priority) => {
    return {
      'high': 'Haute',
      'medium': 'Moyenne',
      'low': 'Basse'
    }[priority] || 'Inconnue';
  };

  if (loading) {
    return <div className={`p-6 ${mainBg} ${textColor} min-h-screen`}>Chargement...</div>;
  }

  if (error) {
    return <div className={`p-6 ${mainBg} ${textColor} min-h-screen`}>{error}</div>;
  }

  return (
    <div className={`p-6 ${mainBg} ${textColor} min-h-screen`}>
      {/* Header section */}
      <div className="mb-6 relative overflow-hidden rounded-xl shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#A78800] to-[#1F2024] animate-[gradient_15s_ease_infinite] bg-[length:200%_200%]"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="relative z-10 p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">Archives</h1>
              <p className="text-white/80 flex items-center gap-2 flex-wrap">
                <span>Département {userData.department}</span>
                <span className="inline-block w-1 h-1 rounded-full bg-white/60"></span>
                <span className="font-semibold">
                  {totalCount} courrier{totalCount !== 1 ? 's' : ''} archivé{totalCount !== 1 ? 's' : ''}
                </span>
                {personalCount > 0 && (
                  <>
                    <span className="inline-block w-1 h-1 rounded-full bg-white/60"></span>
                    <span className="font-semibold flex items-center">
                      <User size={14} className="mr-1" /> {personalCount} personnel{personalCount !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
                {favoriteCount > 0 && (
                  <>
                    <span className="inline-block w-1 h-1 rounded-full bg-white/60"></span>
                    <span className="font-semibold flex items-center">
                      <Star size={14} className="mr-1" /> {favoriteCount} favori{favoriteCount !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode(viewMode === 'compact' ? 'comfortable' : 'compact')}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                title={viewMode === 'compact' ? "Vue confortable" : "Vue compacte"}
              >
                {viewMode === 'compact' ? <Box size={20} /> : <MoreHorizontal size={20} />}
              </button>
              <button 
                onClick={handleRefresh}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                title="Rafraîchir"
              >
                <motion.div
                  variants={refreshVariants}
                  animate={isRefreshing ? 'animate' : 'initial'}
                >
                  <RefreshCw size={20} />
                </motion.div>
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="bg-white/10 rounded-full px-4 py-1 text-sm text-white flex items-center gap-1">
              <Archive size={14} />
              <span>{courriers.length} courriers</span>
            </div>
            <div className="bg-white/10 rounded-full px-4 py-1 text-sm text-white flex items-center gap-1">
              <Star size={14} />
              <span>{courriers.filter(c => c.favorite).length} favoris</span>
            </div>
            <div className="bg-white/10 rounded-full px-4 py-1 text-sm text-white flex items-center gap-1">
              <Clock size={14} />
              <span>Dernière mise à jour: aujourd'hui</span>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <div className="bg-white/10 rounded-full p-1 flex items-center">
              <button
                onClick={() => setIsPersonalView(true)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isPersonalView ? 'bg-[#A78800] text-white' : 'text-white/80 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <User size={14} />
                  Vue Personnelle
                </span>
              </button>
              <button
                onClick={() => setIsPersonalView(false)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !isPersonalView ? 'bg-[#A78800] text-white' : 'text-white/80 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Users size={14} />
                  Vue Centralisée
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main container */}
      <div className={`${containerBg} rounded-xl shadow-xl overflow-hidden border ${borderColor}`}>
        {/* Toolbar section */}
        <div className={`p-4 border-b ${borderColor} flex items-center justify-between flex-wrap gap-2`}>
          <div className="flex items-center gap-3 flex-wrap">
            <button 
              onClick={handleSelectAll}
              className={`p-2 rounded-full ${hoverBg} transition-colors`}
            >
              {selectAll ? <CheckSquare size={20} className={accentColor} /> : <Square size={20} className={subTextColor} />}
            </button>
            {selectedCourriers.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className={`text-sm ${subTextColor} ml-2`}>
                  {selectedCourriers.length} sélectionné{selectedCourriers.length !== 1 ? 's' : ''}
                </span>
                <div className="h-6 w-px mx-2 bg-gray-300/20"></div>
                <button onClick={handleBulkUnarchive} className={`p-2 rounded-full ${hoverBg}`} title="Désarchiver">
                  <CornerUpLeft size={18} className={subTextColor} />
                </button>
                <button onClick={handleBulkDelete} className={`p-2 rounded-full ${hoverBg}`} title="Supprimer définitivement">
                  <Trash2 size={18} className={subTextColor} />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className={`flex items-center gap-1 text-sm ${subTextColor} p-2 rounded-full ${hoverBg}`}
                  >
                    <Filter size={16} />
                    <span>{activeFilter === 'all' ? 'Tous les services' : activeFilter}</span>
                    <ChevronDown size={14} />
                  </button>
                  {filterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute top-full left-0 mt-1 w-48 ${containerBg} rounded-lg shadow-xl z-10 border ${borderColor}`}
                    >
                      <div className="p-2">
                        <button onClick={() => { setActiveFilter('all'); setFilterOpen(false); }} className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === 'all' ? 'bg-[#A78800]/20 text-[#A78800]' : textColor} hover:bg-[#A78800]/10 flex items-center gap-2`}>
                          <Mail size={14} /> Tous les services
                        </button>
                        {Object.keys(getDepartmentColor()).map(dept => (
                          <button
                            key={dept}
                            onClick={() => { setActiveFilter(dept); setFilterOpen(false); }}
                            className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === dept ? 'bg-[#A78800]/20 text-[#A78800]' : textColor} hover:bg-[#A78800]/10 flex items-center gap-2`}
                          >
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white ${getDepartmentColor(dept)}`}>
                              {getDepartmentInitials(dept)}
                            </span>
                            {dept}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setPriorityFilter(priorityFilter === 'all' ? 'high' : priorityFilter === 'high' ? 'medium' : priorityFilter === 'medium' ? 'low' : 'all')}
                    className={`flex items-center gap-1 text-sm p-2 rounded-full ${hoverBg} ${priorityFilter !== 'all' ? getPriorityColor(priorityFilter) : subTextColor}`}
                  >
                    <AlertCircle size={16} />
                    <span>Priorité: {priorityFilter === 'all' ? 'Toutes' : getPriorityLabel(priorityFilter)}</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center gap-1 text-sm p-2 rounded-full ${hoverBg} ${showFavoritesOnly ? accentColor : subTextColor}`}
                >
                  {showFavoritesOnly ? <Star size={16} /> : <StarOff size={16} />}
                  <span>{showFavoritesOnly ? 'Favoris' : 'Tous'}</span>
                </button>
              </>
            )}
          </div>
          <div className="relative">
            <div className={`flex items-center bg-gray-100/10 rounded-lg border ${borderColor} px-3 py-2`}>
              <Search size={18} className={subTextColor} />
              <input
                type="text"
                placeholder="Rechercher dans les archives..."
                className={`ml-2 bg-transparent outline-none border-none w-64 text-sm ${textColor}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Advanced filter section - Date range */}
        <div className={`px-4 py-3 border-b ${borderColor} flex items-center gap-4 flex-wrap`}>
          <div className="flex items-center gap-2">
            <Calendar size={16} className={subTextColor} />
            <span className={`text-sm ${subTextColor}`}>Période:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', '7 derniers jours', '30 derniers jours', '3 derniers mois', '6 derniers mois'].map(period => (
              <button
                key={period}
                onClick={() => setDateRangeFilter(period)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  dateRangeFilter === period ? 'bg-[#A78800] text-white' : `${hoverBg} ${textColor} border ${borderColor}`
                }`}
              >
                {period === 'all' ? 'Tous' : period}
              </button>
            ))}
          </div>
        </div>

        {/* Courrier list */}
        {filteredCourriers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Archive size={48} className={`${subTextColor} mb-4`} />
            <h3 className={`text-xl font-medium ${textColor} mb-2`}>Aucun courrier archivé trouvé</h3>
            <p className={`text-sm ${subTextColor}`}>
              {searchQuery 
                ? `Aucun courrier ne correspond à "${searchQuery}"`
                : showFavoritesOnly
                  ? "Vous n'avez pas de courriers favoris dans les archives"
                  : isPersonalView
                    ? "Vous n'avez pas de courriers personnellement archivés"
                    : "Aucun courrier dans les archives centralisées"}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setShowFavoritesOnly(false);
                setActiveFilter('all');
                setPriorityFilter('all');
                setDateRangeFilter('all');
              }}
              className={`mt-4 px-4 py-2 rounded-lg ${accentBg} text-white text-sm hover:bg-opacity-90`}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {filteredCourriers.map((courrier) => (
              <motion.div
                key={courrier.id}
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`flex items-start p-4 border-b ${borderColor} ${
                  selectedCourriers.includes(courrier.id) ? 'bg-[#A78800]/5' : hoverBg
                } group`}
                onMouseEnter={() => setHoveredCourrier(courrier.id)}
                onMouseLeave={() => setHoveredCourrier(null)}
              >
                <div className="flex items-center mr-3">
                  <button onClick={() => handleSelect(courrier.id)} className="p-2 rounded-full hover:bg-black/5">
                    {selectedCourriers.includes(courrier.id) ? (
                      <CheckSquare size={18} className={accentColor} />
                    ) : (
                      <Square size={18} className={subTextColor} />
                    )}
                  </button>
                </div>
                <div className="mr-3">
                  <button onClick={() => handleFavoriteToggle(courrier.id)} className="p-2 rounded-full hover:bg-black/5">
                    {courrier.favorite ? (
                      <Star size={18} className="text-[#A78800]" />
                    ) : (
                      <StarOff size={18} className={subTextColor} />
                    )}
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-full ${getDepartmentColor(courrier.department)} flex items-center justify-center text-xs text-white`}>
                        {getDepartmentInitials(courrier.department)}
                      </div>
                      <span className={`${textColor}`}>{courrier.sender}</span>
                      <span className={`text-xs ${subTextColor}`}>
                        {courrier.archivedBy === userData.email ? 'Archivé par vous' : `Archivé par ${courrier.archivedBy}`}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(courrier.priority)}`}>
                        {getPriorityLabel(courrier.priority)}
                      </span>
                    </div>
                  </div>
                  <h3 className={`text-base font-medium mb-1 truncate ${textColor}`}>
                    {courrier.subject}
                  </h3>
                  <p className={`text-sm ${subTextColor} line-clamp-${viewMode === 'comfortable' ? '2' : '1'}`}>
                    {courrier.content}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className={subTextColor}>Date originale: {courrier.originalDate}</span>
                    <span className={subTextColor}>Archivé le: {courrier.dateArchived}</span>
                    {courrier.attachments > 0 && (
                      <span className={`flex items-center gap-1 ${subTextColor}`}>
                        <Bookmark size={14} />
                        {courrier.attachments} pièce{courrier.attachments > 1 ? 's' : ''} jointe{courrier.attachments > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`flex flex-col items-end gap-3 ml-4 ${hoveredCourrier === courrier.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                  {hoveredCourrier === courrier.id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleUnarchive(courrier.id)} className={`p-2 rounded-full ${hoverBg}`} title="Désarchiver">
                        <CornerUpLeft size={16} className={subTextColor} />
                      </button>
                      <button onClick={() => handleDelete(courrier.id)} className={`p-2 rounded-full ${hoverBg}`} title="Supprimer définitivement">
                        <Trash2 size={16} className={subTextColor} />
                      </button>
                      <button onClick={() => {}} className={`p-2 rounded-full ${hoverBg}`} title="Voir les détails">
                        <Eye size={16} className={subTextColor} />
                      </button>
                    </div>
                  ) : (
                    <div className={`text-sm ${subTextColor}`}>
                      {courrier.dateArchived}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Pagination footer */}
        <div className={`py-3 px-4 flex items-center justify-between border-t ${borderColor}`}>
          <div className={`text-sm ${subTextColor}`}>
            Affichage de {filteredCourriers.length} sur {totalCount} courriers archivés
          </div>
          <div className="flex items-center gap-2">
            <button className={`px-3 py-1 text-sm rounded-md ${textColor} hover:bg-gray-100/10 disabled:opacity-50`} disabled={true}>
              Précédent
            </button>
            <span className={`inline-flex items-center justify-center h-8 w-8 rounded-md ${accentBg} text-white text-sm`}>1</span>
            <button className={`px-3 py-1 text-sm rounded-md ${textColor} hover:bg-gray-100/10 disabled:opacity-50`} disabled={true}>
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Analytics summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {isPersonalView ? (
          <>
            {/* Personalized View Cards */}
            <div className={`${containerBg} rounded-xl p-5 border ${borderColor} shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-medium ${textColor}`}>Vos archives</h3>
                <FileText size={18} className={subTextColor} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textColor}`}>Total personnel</span>
                  <span className={`text-sm font-medium ${textColor}`}>{personalCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textColor}`}>Archivés par vous</span>
                  <span className={`text-sm font-medium ${textColor}`}>
                    {courriers.filter(c => c.personal && c.archivedBy === userData.email).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textColor}`}>Archivés par d'autres</span>
                  <span className={`text-sm font-medium ${textColor}`}>
                    {courriers.filter(c => c.personal && c.archivedBy !== userData.email).length}
                  </span>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-gray-100/10 border ${borderColor}">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${accentBg} bg-opacity-20`}>
                      <Archive size={14} className={accentColor} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${textColor}`}>Exporter vos archives</h4>
                      <p className={`text-xs ${subTextColor}`}>PDF ou CSV</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${containerBg} rounded-xl p-5 border ${borderColor} shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-medium ${textColor}`}>Vos favoris</h3>
                <Star size={18} className={subTextColor} />
              </div>
              <div className="flex items-center justify-center h-40">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full border-8 border-r-yellow-500 border-b-gray-200/20 border-l-gray-200/20 border-t-gray-200/20 rotate-45"></div>
                  <div className="absolute inset-8 bg-[#1F2024] rounded-full flex items-center justify-center">
                    <span className={`text-sm font-medium ${textColor}`}>{personalFavorites}</span>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <div className={`text-sm ${textColor}`}>
                  {personalFavorites} favori{personalFavorites !== 1 ? 's' : ''} personnel{personalFavorites !== 1 ? 's' : ''}
                </div>
                <div className={`text-xs ${subTextColor}`}>
                  {Math.round((personalFavorites / personalCount) * 100) || 0}% de vos archives
                </div>
              </div>
            </div>

            <div className={`${containerBg} rounded-xl p-5 border ${borderColor} shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-medium ${textColor}`}>Votre activité récente</h3>
                <Clock size={18} className={subTextColor} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textColor}`}>Cette semaine</span>
                  <span className={`text-sm font-medium ${textColor}`}>
                    {courriers.filter(c => c.personal && new Date(c.dateArchived).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textColor}`}>Ce mois</span>
                  <span className={`text-sm font-medium ${textColor}`}>
                    {courriers.filter(c => c.personal && new Date(c.dateArchived).getMonth() === new Date().getMonth()).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textColor}`}>Priorité haute</span>
                  <span className={`text-sm font-medium ${textColor}`}>{personalHighPriority}</span>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-gray-100/10 border ${borderColor}">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${accentBg} bg-opacity-20`}>
                      <Clock size={14} className={accentColor} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${textColor}`}>Activité détaillée</h4>
                      <p className={`text-xs ${subTextColor}`}>Voir le journal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Centralized View Cards */}
            <div className={`${containerBg} rounded-xl p-5 border ${borderColor} shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-medium ${textColor}`}>Distribution des départements</h3>
                <FileText size={18} className={subTextColor} />
              </div>
              <div className="space-y-3">
                {Object.keys(getDepartmentColor()).map(dept => {
                  const count = courriers.filter(c => c.department === dept).length;
                  const percentage = Math.round((count / courriers.length) * 100) || 0;
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className={`${textColor} flex items-center gap-1`}>
                          <span className={`w-3 h-3 rounded-full ${getDepartmentColor(dept)}`}></span>
                          {dept}
                        </span>
                        <span className={subTextColor}>{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200/20 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getDepartmentColor(dept)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`${containerBg} rounded-xl p-5 border ${borderColor} shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-medium ${textColor}`}>Répartition par priorité</h3>
                <AlertCircle size={18} className={subTextColor} />
              </div>
              <div className="flex items-center justify-center h-40">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full border-8 border-r-red-500 border-b-orange-500 border-l-green-500 border-t-gray-200/20 rotate-45"></div>
                  <div className="absolute inset-8 bg-[#1F2024] rounded-full flex items-center justify-center">
                    <span className={`text-sm font-medium ${textColor}`}>{courriers.length}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {['high', 'medium', 'low'].map(priority => {
                  const count = courriers.filter(c => c.priority === priority).length;
                  return (
                    <div key={priority} className="text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto ${
                        priority === 'high' ? 'bg-red-500' : 
                        priority === 'medium' ? 'bg-orange-500' : 
                        'bg-green-500'
                      }`}></div>
                      <div className={`text-xs font-medium mt-1 ${textColor}`}>
                        {getPriorityLabel(priority)}
                      </div>
                      <div className={`text-xs ${subTextColor}`}>
                        {count} ({Math.round((count / courriers.length) * 100) || 0}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`${containerBg} rounded-xl p-5 border ${borderColor} shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-medium ${textColor}`}>Activité globale</h3>
                <Clock size={18} className={subTextColor} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textColor}`}>Cette semaine</span>
                  <span className={`text-sm font-medium ${textColor}`}>
                    {courriers.filter(c => new Date(c.dateArchived).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textColor}`}>Ce mois</span>
                  <span className={`text-sm font-medium ${textColor}`}>
                    {courriers.filter(c => new Date(c.dateArchived).getMonth() === new Date().getMonth()).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textColor}`}>Archives personnelles</span>
                  <span className={`text-sm font-medium ${textColor}`}>{personalCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textColor}`}>Archives centralisées</span>
                  <span className={`text-sm font-medium ${textColor}`}>{centralizedCount}</span>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-gray-100/10 ${borderColor} border">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${accentBg} bg-opacity-20`}>
                      <Download size={14} className={accentColor} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${textColor}`}>Exporter tout</h4>
                      <p className={`text-xs ${subTextColor}`}>Format PDF, Excel ou CSV</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourrierArchived;