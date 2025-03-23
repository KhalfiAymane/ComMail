import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Search, Star, StarOff, Archive, Trash2, Send, Forward,
  Filter, Check, CheckSquare, Square, ChevronDown, 
  MoreHorizontal, AlertCircle, Clock, Users, Bookmark,
  X, Bell, Box, RefreshCw, Edit, Eye, MailCheck, AlertTriangle,
  Calendar, Download, Printer, ArrowUp, ArrowDown
} from 'lucide-react';
import axios from 'axios';

const CourrierSent = () => {
  const { darkMode } = useTheme();
  const [userData, setUserData] = useState({ role: '', department: '' });
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
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isDGS = userData.role === 'dgs';
  const isBO = userData.role === 'bo';

  // Theme-based styling
  const mainBg = darkMode ? 'bg-[#131313]' : 'bg-[#F5F5F5]';
  const containerBg = darkMode ? 'bg-[#1F2024]' : 'bg-[#FFFFFF]';
  const textColor = darkMode ? 'text-[#FFFFFF]' : 'text-[#000000]';
  const subTextColor = darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]';
  const hoverBg = darkMode ? 'hover:bg-[#131313]/80' : 'hover:bg-gray-100';
  const accentColor = 'text-[#A78800]';
  const accentBg = 'bg-[#A78800]';
  const borderColor = darkMode ? 'border-gray-700/20' : 'border-gray-200';

  // Fetch user data and sent courriers from backend
  useEffect(() => {
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
        });

        const mailsResponse = await axios.get('http://localhost:5000/api/mails', {
          headers: { Authorization: `Bearer ${token}` },
          params: { section: 'sent' },
        });

        const mappedCourriers = mailsResponse.data.map(mail => ({
          id: mail._id,
          recipient: mail.receiverDepartments.join(', '),
          subject: mail.subject,
          content: mail.content,
          date: new Date(mail.createdAt).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: mail.isRead ? 'read' : 'delivered',
          favorite: mail.favorite,
          important: mail.type === 'urgent',
          department: mail.sender.department,
          attachments: mail.attachments.length,
          forwarded: false, // Placeholder, not tracked in backend yet
          scheduled: false, // Placeholder, not tracked in backend yet
        }));

        setCourriers(mappedCourriers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handlers
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
      console.error('Error toggling favorite:', err.response?.data || err.message);
      setError('Erreur lors de la mise à jour des favoris');
    }
  };

  const handleArchive = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/mails/${id}/status`,
        { section: 'archives' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourriers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error archiving mail:', err.response?.data || err.message);
      setError('Erreur lors de l’archivage');
    }
  };

  const handleBulkArchive = async () => {
    try {
      const token = localStorage.getItem('token');
      await Promise.all(selectedCourriers.map(id =>
        axios.put(
          `http://localhost:5000/api/mails/${id}/status`,
          { section: 'archives' },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ));
      setCourriers(prev => prev.filter(c => !selectedCourriers.includes(c.id)));
      setSelectedCourriers([]);
      setSelectAll(false);
    } catch (err) {
      console.error('Error bulk archiving:', err.response?.data || err.message);
      setError('Erreur lors de l’archivage en masse');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/mails/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourriers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting mail:', err.response?.data || err.message);
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
    } catch (err) {
      console.error('Error bulk deleting:', err.response?.data || err.message);
      setError('Erreur lors de la suppression en masse');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/mails', {
        headers: { Authorization: `Bearer ${token}` },
        params: { section: 'sent' },
      });
      const mappedCourriers = response.data.map(mail => ({
        id: mail._id,
        recipient: mail.receiverDepartments.join(', '),
        subject: mail.subject,
        content: mail.content,
        date: new Date(mail.createdAt).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: mail.isRead ? 'read' : 'delivered',
        favorite: mail.favorite,
        important: mail.type === 'urgent',
        department: mail.sender.department,
        attachments: mail.attachments.length,
        forwarded: false,
        scheduled: false,
      }));
      setCourriers(mappedCourriers);
      setIsRefreshing(false);
    } catch (err) {
      console.error('Error refreshing:', err.response?.data || err.message);
      setError('Erreur lors du rafraîchissement');
      setIsRefreshing(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort courriers
  const filteredCourriers = courriers.filter(courrier => {
    if (showFavoritesOnly && !courrier.favorite) return false;
    if (activeFilter === 'read' && courrier.status !== 'read') return false;
    if (activeFilter === 'delivered' && courrier.status !== 'delivered') return false;
    if (activeFilter === 'important' && !courrier.important) return false;
    if (activeFilter !== 'all' && 
        activeFilter !== 'read' && 
        activeFilter !== 'delivered' && 
        activeFilter !== 'important' &&
        courrier.department !== activeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        courrier.recipient.toLowerCase().includes(query) ||
        courrier.subject.toLowerCase().includes(query) ||
        courrier.content.toLowerCase().includes(query)
      );
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.date) - new Date(b.date) 
        : new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'recipient') {
      return sortDirection === 'asc'
        ? a.recipient.localeCompare(b.recipient)
        : b.recipient.localeCompare(a.recipient);
    } else if (sortBy === 'status') {
      return sortDirection === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    return 0;
  });

  // Count statistics
  const sentCount = courriers.length;
  const readCount = courriers.filter(c => c.status === 'read').length;
  const importantCount = courriers.filter(c => c.important).length;

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

  const getStatusIcon = (status, size = 16) => {
    switch(status) {
      case 'read': return <MailCheck size={size} className="text-green-500" />;
      case 'delivered': return <Check size={size} className="text-blue-500" />;
      default: return <Send size={size} className={subTextColor} />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'read': return 'Lu';
      case 'delivered': return 'Livré';
      default: return 'Envoyé';
    }
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
              <h1 className="text-3xl font-bold mb-2 text-white">Courriers Envoyés</h1>
              <p className="text-white/80 flex items-center gap-2 flex-wrap">
                <span>{userData.department}</span>
                <span className="inline-block w-1 h-1 rounded-full bg-white/60"></span>
                <span className="font-semibold">
                  {sentCount} envoyé{sentCount !== 1 ? 's' : ''}
                </span>
                {readCount > 0 && (
                  <>
                    <span className="inline-block w-1 h-1 rounded-full bg-white/60"></span>
                    <span className="font-semibold flex items-center">
                      <MailCheck size={14} className="mr-1" /> {readCount} lu{readCount !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
                {importantCount > 0 && (
                  <>
                    <span className="inline-block w-1 h-1 rounded-full bg-white/60"></span>
                    <span className="font-semibold flex items-center">
                      <AlertCircle size={14} className="mr-1" /> {importantCount} important{importantCount !== 1 ? 's' : ''}
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
                <motion.div variants={refreshVariants} animate={isRefreshing ? 'animate' : 'initial'}>
                  <RefreshCw size={20} />
                </motion.div>
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="bg-white/10 rounded-full px-4 py-1 text-sm text-white flex items-center gap-1">
              <Send size={14} />
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
        </div>
      </div>

      {/* Main container */}
      <div className={`${containerBg} rounded-xl shadow-xl overflow-hidden border ${borderColor}`}>
        {/* Toolbar section */}
        <div className={`p-4 border-b ${borderColor} flex items-center justify-between flex-wrap gap-2`}>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handleSelectAll} className={`p-2 rounded-full ${hoverBg} transition-colors`}>
              {selectAll ? <CheckSquare size={20} className={accentColor} /> : <Square size={20} className={subTextColor} />}
            </button>
            {selectedCourriers.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className={`text-sm ${subTextColor} ml-2`}>
                  {selectedCourriers.length} sélectionné{selectedCourriers.length !== 1 ? 's' : ''}
                </span>
                <div className="h-6 w-px mx-2 bg-gray-300/20"></div>
                <button onClick={handleBulkArchive} className={`p-2 rounded-full ${hoverBg}`} title="Archiver">
                  <Archive size={18} className={subTextColor} />
                </button>
                <button onClick={handleBulkDelete} className={`p-2 rounded-full ${hoverBg}`} title="Supprimer">
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
                    <span>
                      {activeFilter === 'all' ? 'Tous' :
                       activeFilter === 'read' ? 'Lus' :
                       activeFilter === 'delivered' ? 'Livrés' :
                       activeFilter === 'important' ? 'Importants' : activeFilter}
                    </span>
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
                          <Send size={14} /> Tous les courriers
                        </button>
                        <button onClick={() => { setActiveFilter('read'); setFilterOpen(false); }} className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === 'read' ? 'bg-[#A78800]/20 text-[#A78800]' : textColor} hover:bg-[#A78800]/10 flex items-center gap-2`}>
                          <MailCheck size={14} /> Lus
                        </button>
                        <button onClick={() => { setActiveFilter('delivered'); setFilterOpen(false); }} className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === 'delivered' ? 'bg-[#A78800]/20 text-[#A78800]' : textColor} hover:bg-[#A78800]/10 flex items-center gap-2`}>
                          <Check size={14} /> Livrés
                        </button>
                        <button onClick={() => { setActiveFilter('important'); setFilterOpen(false); }} className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === 'important' ? 'bg-[#A78800]/20 text-[#A78800]' : textColor} hover:bg-[#A78800]/10 flex items-center gap-2`}>
                          <AlertCircle size={14} /> Importants
                        </button>
                      </div>
                      {isDGS && (
                        <>
                          <div className={`h-px w-full ${borderColor}`}></div>
                          <div className="p-2">
                            <div className="px-3 py-1 text-xs font-medium text-[#AAAAAA]">Départements</div>
                            {['Ressources Humaines', 'Division Financière', 'Division Technique', 'Bureau d\'Ordre'].map(dept => (
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
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center gap-1 text-sm p-2 rounded-full ${hoverBg} ${showFavoritesOnly ? accentColor : subTextColor}`}
                >
                  {showFavoritesOnly ? <Star size={16} /> : <StarOff size={16} />}
                  <span>{showFavoritesOnly ? 'Favoris' : 'Tous'}</span>
                </button>
                <div className="h-6 w-px mx-2 bg-gray-300/20"></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleSort('date')} className={`flex items-center gap-1 text-sm p-2 rounded-full ${hoverBg} ${sortBy === 'date' ? accentColor : subTextColor}`}>
                    Date
                    {sortBy === 'date' && (sortDirection === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />)}
                  </button>
                  <button onClick={() => handleSort('recipient')} className={`flex items-center gap-1 text-sm p-2 rounded-full ${hoverBg} ${sortBy === 'recipient' ? accentColor : subTextColor}`}>
                    Destinataire
                    {sortBy === 'recipient' && (sortDirection === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />)}
                  </button>
                  <button onClick={() => handleSort('status')} className={`flex items-center gap-1 text-sm p-2 rounded-full ${hoverBg} ${sortBy === 'status' ? accentColor : subTextColor}`}>
                    Statut
                    {sortBy === 'status' && (sortDirection === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />)}
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="relative">
            <div className={`flex items-center bg-gray-100/10 rounded-lg border ${borderColor} px-3 py-2`}>
              <Search size={18} className={subTextColor} />
              <input
                type="text"
                placeholder="Rechercher dans les courriers envoyés..."
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

        {/* Courrier list */}
        {filteredCourriers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Send size={48} className={`${subTextColor} mb-4`} />
            <h3 className={`text-xl font-medium ${textColor} mb-2`}>Aucun courrier trouvé</h3>
            <p className={`text-sm ${subTextColor}`}>
              {searchQuery 
                ? `Aucun courrier ne correspond à "${searchQuery}"`
                : showFavoritesOnly
                  ? "Vous n'avez pas de courriers favoris"
                  : activeFilter !== 'all'
                    ? `Aucun courrier dans la catégorie "${activeFilter}"`
                    : "Votre liste de courriers envoyés est vide"}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setShowFavoritesOnly(false);
                setActiveFilter('all');
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
                layout
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
                    <div className={`flex items-center gap-2 ${courrier.important ? 'font-semibold' : ''}`}>
                      <div className={`h-6 w-6 rounded-full ${getDepartmentColor(courrier.department)} flex items-center justify-center text-xs text-white`}>
                        {getDepartmentInitials(courrier.department)}
                      </div>
                      <span className={`${textColor}`}>{courrier.recipient}</span>
                      {courrier.important && (
                        <span className="ml-2">
                          <AlertCircle size={16} className="text-red-500" />
                        </span>
                      )}
                      <span className="ml-2 flex items-center gap-1">
                        {getStatusIcon(courrier.status)}
                        <span className={`text-xs ${
                          courrier.status === 'read' ? 'text-green-500' : 'text-blue-500'
                        }`}>
                          {getStatusText(courrier.status)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <h3 className={`text-base ${courrier.important ? 'font-bold' : 'font-medium'} mb-1 truncate ${textColor}`}>
                    {courrier.subject}
                  </h3>
                  <p className={`text-sm ${subTextColor} line-clamp-${viewMode === 'comfortable' ? '2' : '1'}`}>
                    {courrier.content}
                  </p>
                  {courrier.attachments > 0 && (
                    <div className="mt-2 flex items-center">
                      <span className={`text-xs ${subTextColor} flex items-center gap-1`}>
                        <Bookmark size={14} />
                        {courrier.attachments} pièce{courrier.attachments > 1 ? 's' : ''} jointe{courrier.attachments > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`flex flex-col items-end gap-3 ml-4 ${hoveredCourrier === courrier.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                  {hoveredCourrier === courrier.id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => {}} className={`p-2 rounded-full ${hoverBg}`} title="Voir les détails">
                        <Eye size={16} className={subTextColor} />
                      </button>
                      <button onClick={() => handleArchive(courrier.id)} className={`p-2 rounded-full ${hoverBg}`} title="Archiver">
                        <Archive size={16} className={subTextColor} />
                      </button>
                      <button onClick={() => handleDelete(courrier.id)} className={`p-2 rounded-full ${hoverBg}`} title="Supprimer">
                        <Trash2 size={16} className={subTextColor} />
                      </button>
                    </div>
                  ) : (
                    <div className={`text-sm ${subTextColor}`}>
                      {courrier.date}
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
            Affichage de {filteredCourriers.length} sur {courriers.length} courriers
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
    </div>
  );
};

export default CourrierSent;