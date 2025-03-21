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

const CourrierArchived = ({ userData = { role: 'directeur', department: 'Finance' } }) => {
  const { darkMode } = useTheme();
  
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
  
  // Theme-based styling
  const mainBg = darkMode ? 'bg-[#131313]' : 'bg-[#F5F5F5]';
  const containerBg = darkMode ? 'bg-[#1F2024]' : 'bg-[#FFFFFF]';
  const textColor = darkMode ? 'text-[#FFFFFF]' : 'text-[#000000]';
  const subTextColor = darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]';
  const hoverBg = darkMode ? 'hover:bg-[#131313]/80' : 'hover:bg-gray-100';
  const accentColor = 'text-[#A78800]'; // Gold color 
  const accentBg = 'bg-[#A78800]'; // Gold background
  const borderColor = darkMode ? 'border-gray-700/20' : 'border-gray-200';
  
  // State management
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
  
  // Mock data for archived courriers
  const mockCourriers = [
    {
      id: 1,
      sender: 'Resources Humaines',
      subject: 'Ancien dossier d\'évaluation du personnel',
      content: 'Archives des évaluations de performance des employés administratifs pour l\'année précédente.',
      dateArchived: '12 Mars 2025',
      archivedBy: 'Martin Dupont',
      originalDate: '15 Jan 2025',
      read: true,
      favorite: true,
      priority: 'high',
      department: 'RH',
      tags: ['Évaluations', 'Archives'],
      attachments: 3,
      personal: true
    },
    {
      id: 2,
      sender: 'Service Technique',
      subject: 'Plans de rénovation - Phase 1',
      content: 'Documentation complète de la première phase du projet de rénovation du bâtiment municipal.',
      dateArchived: '10 Mars 2025',
      archivedBy: 'Vous',
      originalDate: '5 Jan 2025',
      read: true,
      favorite: false,
      priority: 'medium',
      department: 'Technique',
      tags: ['Rénovations', 'Plans'],
      attachments: 5,
      personal: true
    },
    {
      id: 3,
      sender: 'Direction Générale',
      subject: 'Compte-rendu - Réunion trimestrielle Q4 2024',
      content: 'Résumé des points abordés lors de la réunion trimestrielle de décembre avec les différents services.',
      dateArchived: '5 Mars 2025',
      archivedBy: 'Sophie Martin',
      originalDate: '20 Dec 2024',
      read: true,
      favorite: true,
      priority: 'medium',
      department: 'DG',
      tags: ['Réunions', 'Q4'],
      attachments: 1,
      personal: false
    },
    {
      id: 4,
      sender: 'Service Financier',
      subject: 'Budget prévisionnel 2024 - Version préliminaire',
      content: 'Première ébauche du budget prévisionnel pour l\'exercice 2024 avant révisions finales.',
      dateArchived: '28 Fév 2025',
      archivedBy: 'Vous',
      originalDate: '15 Nov 2024',
      read: true,
      favorite: false,
      priority: 'high',
      department: 'Finance',
      tags: ['Budget', 'Prévisions'],
      attachments: 2,
      personal: true
    },
    {
      id: 5,
      sender: 'Service Urbanisme',
      subject: 'Dossiers d\'attribution de permis de construire - T3 2024',
      content: 'Archives des permis de construction approuvés durant le troisième trimestre 2024 pour le quartier est.',
      dateArchived: '20 Fév 2025',
      archivedBy: 'Jean Leroy',
      originalDate: '10 Oct 2024',
      read: true,
      favorite: false,
      priority: 'low',
      department: 'Urbanisme',
      tags: ['Permis', 'Construction'],
      attachments: 6,
      personal: false
    },
    {
      id: 6,
      sender: 'Service Communication',
      subject: 'Matériel promotionnel - Festival d\'été 2024',
      content: 'Ensemble des supports de communication utilisés pour la promotion du festival municipal de l\'été dernier.',
      dateArchived: '15 Fév 2025',
      archivedBy: 'Vous',
      originalDate: '5 Jun 2024',
      read: true,
      favorite: true,
      priority: 'low',
      department: 'Communication',
      tags: ['Festival', 'Marketing'],
      attachments: 4,
      personal: true
    },
    {
      id: 7,
      sender: 'Police Municipale',
      subject: 'Statistiques de sécurité - Année 2024',
      content: 'Compilation annuelle des incidents et interventions sur le territoire municipal pour l\'année 2024.',
      dateArchived: '10 Fév 2025',
      archivedBy: 'Antoine Dubois',
      originalDate: '20 Jan 2025',
      read: true,
      favorite: false,
      priority: 'medium',
      department: 'Sécurité',
      tags: ['Statistiques', 'Sécurité'],
      attachments: 2,
      personal: false
    },
  ];
  
  useEffect(() => {
    setCourriers(mockCourriers);
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
  
  const handleFavoriteToggle = (id) => {
    setCourriers(prev => prev.map(c => 
      c.id === id ? { ...c, favorite: !c.favorite } : c
    ));
  };
  
  const handleUnarchive = (id) => {
    setCourriers(prev => prev.filter(c => c.id !== id));
    // In a real app, you would also move the item back to its original location
  };
  
  const handleBulkUnarchive = () => {
    setCourriers(prev => prev.filter(c => !selectedCourriers.includes(c.id)));
    setSelectedCourriers([]);
    setSelectAll(false);
    // In a real app, you would also move the items back to their original locations
  };
  
  const handleDelete = (id) => {
    setCourriers(prev => prev.filter(c => c.id !== id));
  };
  
  const handleBulkDelete = () => {
    setCourriers(prev => prev.filter(c => !selectedCourriers.includes(c.id)));
    setSelectedCourriers([]);
    setSelectAll(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setCourriers(mockCourriers);
    }, 1000);
  };
  
  const handleViewToggle = () => {
    setIsPersonalView(!isPersonalView);
  };
  
  // Filter logic
  const filteredCourriers = courriers.filter(courrier => {
    // First check personal/centralized view
    if (isPersonalView && !courrier.personal) return false;
    
    // Then check favorites filter
    if (showFavoritesOnly && !courrier.favorite) return false;
    
    // Department filter
    if (activeFilter !== 'all' && courrier.department !== activeFilter) return false;
    
    // Priority filter
    if (priorityFilter !== 'all' && courrier.priority !== priorityFilter) return false;
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        courrier.sender.toLowerCase().includes(query) ||
        courrier.subject.toLowerCase().includes(query) ||
        courrier.content.toLowerCase().includes(query) ||
        courrier.department.toLowerCase().includes(query) ||
        (courrier.tags && courrier.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    return true;
  });
  
  // Count statistics
  const totalCount = courriers.length;
  const personalCount = courriers.filter(c => c.personal).length;
  const centralizedCount = courriers.filter(c => !c.personal).length;
  const favoriteCount = courriers.filter(c => c.favorite).length;
  
  // Animation variants
  const listItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const refreshVariants = {
    initial: { rotate: 0 },
    animate: { rotate: 360, transition: { duration: 1, repeat: Infinity, ease: "linear" } }
  };
  
  // Helper functions
  const getDepartmentColor = (dept) => {
    const colors = {
      'RH': 'bg-purple-500',
      'Finance': 'bg-blue-500',
      'Technique': 'bg-green-500',
      'Urbanisme': 'bg-orange-500',
      'Communication': 'bg-pink-500',
      'DG': 'bg-red-500',
      'Sécurité': 'bg-gray-500'
    };
    return colors[dept] || 'bg-gray-500';
  };

  const getDepartmentInitials = (dept) => {
    return dept.substring(0, 2).toUpperCase();
  };
  
  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'text-red-500',
      'medium': 'text-orange-500',
      'low': 'text-green-500'
    };
    return colors[priority] || 'text-gray-500';
  };
  
  const getPriorityLabel = (priority) => {
    const labels = {
      'high': 'Haute',
      'medium': 'Moyenne',
      'low': 'Basse'
    };
    return labels[priority] || 'Inconnue';
  };
  
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
                {viewMode === 'compact' ? (
                  <Box size={20} />
                ) : (
                  <MoreHorizontal size={20} />
                )}
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
          
          {/* View toggle switch */}
          <div className="mt-6 flex justify-center">
            <div className="bg-white/10 rounded-full p-1 flex items-center">
              <button
                onClick={() => setIsPersonalView(true)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isPersonalView 
                    ? 'bg-[#A78800] text-white' 
                    : 'text-white/80 hover:bg-white/5'
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
                  !isPersonalView 
                    ? 'bg-[#A78800] text-white' 
                    : 'text-white/80 hover:bg-white/5'
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
              {selectAll ? (
                <CheckSquare size={20} className={accentColor} />
              ) : (
                <Square size={20} className={subTextColor} />
              )}
            </button>
            
            {selectedCourriers.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className={`text-sm ${subTextColor} ml-2`}>
                  {selectedCourriers.length} sélectionné{selectedCourriers.length !== 1 ? 's' : ''}
                </span>
                <div className="h-6 w-px mx-2 bg-gray-300/20"></div>
                <button 
                  onClick={handleBulkUnarchive}
                  className={`p-2 rounded-full ${hoverBg} transition-colors`}
                  title="Désarchiver"
                >
                  <CornerUpLeft size={18} className={subTextColor} />
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className={`p-2 rounded-full ${hoverBg} transition-colors`}
                  title="Supprimer définitivement"
                >
                  <Trash2 size={18} className={subTextColor} />
                </button>
                <button 
                  className={`p-2 rounded-full ${hoverBg} transition-colors`}
                  title="Transférer"
                >
                  <Forward size={18} className={subTextColor} />
                </button>
                <button 
                  className={`p-2 rounded-full ${hoverBg} transition-colors`}
                  title="Exporter en PDF"
                >
                  <Download size={18} className={subTextColor} />
                </button>
                <button 
                  className={`p-2 rounded-full ${hoverBg} transition-colors`}
                  title="Imprimer"
                >
                  <Printer size={18} className={subTextColor} />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className={`flex items-center gap-1 text-sm ${subTextColor} p-2 rounded-full ${hoverBg} transition-colors ml-1`}
                  >
                    <Filter size={16} />
                    <span>
                      {activeFilter === 'all' ? 'Tous les services' : activeFilter}
                    </span>
                    <ChevronDown size={14} />
                  </button>
                  
                  {filterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute top-full left-0 mt-1 w-48 ${containerBg} rounded-lg shadow-xl z-10 border ${borderColor} overflow-hidden`}
                    >
                      <div className="p-2">
                        <button 
                          onClick={() => { setActiveFilter('all'); setFilterOpen(false); }}
                          className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === 'all' ? 'bg-[#A78800]/20 text-[#A78800]' : textColor} hover:bg-[#A78800]/10 transition-colors flex items-center gap-2`}
                        >
                          <Mail size={14} /> Tous les services
                        </button>
                      </div>
                      
                      <div className={`h-px w-full ${borderColor} mx-auto`}></div>
                      
                      <div className="p-2">
                        <div className="px-3 py-1 text-xs font-medium text-[#AAAAAA]">Services</div>
                        {['RH', 'Finance', 'Technique', 'Urbanisme', 'Communication', 'DG', 'Sécurité'].map(dept => (
                          <button
                            key={dept}
                            onClick={() => { setActiveFilter(dept); setFilterOpen(false); }}
                            className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === dept ? 'bg-[#A78800]/20 text-[#A78800]' : textColor} hover:bg-[#A78800]/10 transition-colors flex items-center gap-2`}
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
                    className={`flex items-center gap-1 text-sm p-2 rounded-full ${hoverBg} transition-colors ${
                      priorityFilter !== 'all' ? getPriorityColor(priorityFilter) : subTextColor
                    }`}
                  >
                    {priorityFilter === 'all' ? (
                      <>
                        <AlertCircle size={16} />
                        <span>Priorité: Toutes</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} />
                        <span>Priorité: {getPriorityLabel(priorityFilter)}</span>
                      </>
                    )}
                  </button>
                </div>
                
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center gap-1 text-sm p-2 rounded-full ${hoverBg} transition-colors ${showFavoritesOnly ? accentColor : subTextColor}`}
                >
                  {showFavoritesOnly ? <Star size={16} /> : <StarOff size={16} />}
                  <span>{showFavoritesOnly ? 'Favoris' : 'Tous'}</span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowTagsFilter(!showTagsFilter)}
                    className={`flex items-center gap-1 text-sm p-2 rounded-full ${hoverBg} transition-colors ${showTagsFilter ? accentColor : subTextColor}`}
                  >
                    <Tag size={16} />
                    <span>Tags</span>
                    <ChevronDown size={14} />
                  </button>
                  
                  {showTagsFilter && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute top-full left-0 mt-1 w-52 ${containerBg} rounded-lg shadow-xl z-10 border ${borderColor} overflow-hidden`}
                    >
                      <div className="p-2">
                        <div className="px-3 py-1 text-xs font-medium text-[#AAAAAA]">Tags populaires</div>
                        {['Budget', 'Réunions', 'Évaluations', 'Plans', 'Statistiques', 'Marketing'].map(tag => (
                          <button
                            key={tag}
                            onClick={() => { 
                              setSearchQuery(tag);
                              setShowTagsFilter(false);
                            }}
                            className={`px-3 py-2 text-sm w-full text-left rounded-lg ${textColor} hover:bg-[#A78800]/10 transition-colors flex items-center gap-2`}
                          >
                            <Tag size={14} />
                            {tag}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* Search bar */}
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
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600"
                >
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
            {['Tous', '7 derniers jours', '30 derniers jours', '3 derniers mois', '6 derniers mois'].map(period => (
              <button
                key={period}
                onClick={() => setDateRangeFilter(period)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  dateRangeFilter === period
                    ? 'bg-[#A78800] text-white'
                    : `${hoverBg} ${textColor} border ${borderColor}`
                }`}
              >
                {period}
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
              className={`mt-4 px-4 py-2 rounded-lg ${accentBg} text-white text-sm hover:bg-opacity-90 transition-colors`}
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
                onMouseEnter={() => setHoveredCourrier(courrier.id)}
                onMouseLeave={() => setHoveredCourrier(null)}
                className={`border-b ${borderColor} ${hoverBg} transition-all relative ${
                  selectedCourriers.includes(courrier.id) ? 'bg-[#A78800]/10' : ''
                }`}
              >
                <div className={`flex items-start p-4 ${viewMode === 'comfortable' ? 'gap-6' : 'gap-3'}`}>
                  {/* Left section with checkbox and star */}
                  <div className="flex flex-col items-center gap-3">
                    <button 
                      onClick={() => handleSelect(courrier.id)}
                      className="flex-shrink-0"
                    >
                      {selectedCourriers.includes(courrier.id) ? (
                        <CheckSquare size={18} className={accentColor} />
                      ) : (
                        <Square size={18} className={subTextColor} />
                      )}
                    </button>
                    
                    <button 
                      onClick={() => handleFavoriteToggle(courrier.id)}
                      className="flex-shrink-0 text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      {courrier.favorite ? (
                        <Star size={18} className="text-[#A78800] fill-[#A78800]" />
                      ) : (
                        <Star size={18} className={subTextColor} />
                      )}
                    </button>
                  </div>
                  
                  {/* Department badge */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full ${getDepartmentColor(courrier.department)} text-white flex items-center justify-center font-medium text-sm`}>
                      {getDepartmentInitials(courrier.department)}
                    </div>
                  </div>
                  
                  {/* Courrier content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className={`font-medium ${textColor} truncate`}>
                        {courrier.sender}
                      </h3>
                      <span className={`text-xs ${subTextColor}`}>
                        {courrier.archivedBy === 'Vous' ? 'Archivé par vous' : `Archivé par ${courrier.archivedBy}`}
                      </span>
                      
                      {/* Priority indicator */}
                      <div className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(courrier.priority)} bg-opacity-10 ${
                        courrier.priority === 'high' ? 'bg-red-100' : 
                        courrier.priority === 'medium' ? 'bg-orange-100' : 
                        'bg-green-100'
                      }`}>
                        {getPriorityLabel(courrier.priority)}
                      </div>
                      
                      {/* Attachment indicator */}
                      {courrier.attachments > 0 && (
                        <div className={`flex items-center gap-1 text-xs ${subTextColor}`}>
                          <FileText size={12} />
                          <span>{courrier.attachments}</span>
                        </div>
                      )}
                    </div>
                    
                    <h2 className={`font-medium ${textColor} mb-1`}>
                      {courrier.subject}
                    </h2>
                    
                    <p className={`text-sm ${subTextColor} ${viewMode === 'compact' ? 'line-clamp-1' : 'line-clamp-2'}`}>
                      {courrier.content}
                    </p>
                    
                    {/* Tags */}
                    {courrier.tags && courrier.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {courrier.tags.map(tag => (
                          <span 
                            key={tag} 
                            className={`inline-block px-2 py-0.5 bg-gray-100 ${darkMode ? 'bg-opacity-10' : ''} rounded-full text-xs ${subTextColor}`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Dates information */}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <div className={`flex items-center gap-1 ${subTextColor}`}>
                        <Calendar size={12} />
                        <span>Date originale: {courrier.originalDate}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${subTextColor}`}>
                        <Archive size={12} />
                        <span>Archivé le: {courrier.dateArchived}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons - visible on hover */}
                  <div 
                    className={`flex items-center gap-1 transition-opacity ${
                      hoveredCourrier === courrier.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <button
                      onClick={() => handleUnarchive(courrier.id)}
                      className={`p-1.5 rounded-full ${hoverBg} transition-colors`}
                      title="Désarchiver"
                    >
                      <CornerUpLeft size={16} className={subTextColor} />
                    </button>
                    <button
                      onClick={() => handleDelete(courrier.id)}
                      className={`p-1.5 rounded-full ${hoverBg} transition-colors`}
                      title="Supprimer définitivement"
                    >
                      <Trash2 size={16} className={subTextColor} />
                    </button>
                    <button
                      className={`p-1.5 rounded-full ${hoverBg} transition-colors`}
                      title="Transférer"
                    >
                      <Forward size={16} className={subTextColor} />
                    </button>
                    <button
                      className={`p-1.5 rounded-full ${hoverBg} transition-colors`}
                      title="Voir les détails"
                    >
                      <Eye size={16} className={subTextColor} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {/* Pagination and footer */}
        <div className={`p-4 flex items-center justify-between ${textColor} border-t ${borderColor}`}>
          <div className={`text-sm ${subTextColor}`}>
            Affichage de {filteredCourriers.length} sur {totalCount} courriers archivés
          </div>
          
          <div className="flex items-center gap-1">
            <button className={`px-3 py-1 rounded-lg text-sm ${hoverBg} transition-colors ${subTextColor}`}>Précédent</button>
            <button className={`px-3 py-1 rounded-lg text-sm bg-[#A78800] text-white transition-colors`}>1</button>
            <button className={`px-3 py-1 rounded-lg text-sm ${hoverBg} transition-colors ${subTextColor}`}>2</button>
            <button className={`px-3 py-1 rounded-lg text-sm ${hoverBg} transition-colors ${subTextColor}`}>3</button>
            <span className={`text-sm ${subTextColor}`}>...</span>
            <button className={`px-3 py-1 rounded-lg text-sm ${hoverBg} transition-colors ${subTextColor}`}>Suivant</button>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className={`px-3 py-1 rounded-lg text-sm ${containerBg} border ${borderColor} ${textColor}`}
              defaultValue="10"
            >
              <option value="10">10 par page</option>
              <option value="25">25 par page</option>
              <option value="50">50 par page</option>
              <option value="100">100 par page</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Analytics summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className={`${containerBg} rounded-xl p-5 border ${borderColor} shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-medium ${textColor}`}>Distribution des archives</h3>
            <FileText size={18} className={subTextColor} />
          </div>
          <div className="space-y-3">
            {['RH', 'Finance', 'Technique', 'Urbanisme', 'Communication', 'DG', 'Sécurité'].map(dept => {
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
            <h3 className={`font-medium ${textColor}`}>Archives par priorité</h3>
            <AlertCircle size={18} className={subTextColor} />
          </div>
          
          <div className="flex items-center justify-center h-40">
            <div className="relative w-32 h-32">
              {/* This would be a pie chart in a real application */}
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
                    {count} ({Math.round((count / courriers.length) * 100)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className={`${containerBg} rounded-xl p-5 border ${borderColor} shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-medium ${textColor}`}>Activité d'archivage</h3>
            <Clock size={18} className={subTextColor} />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textColor}`}>Cette semaine</span>
              <span className={`text-sm font-medium ${textColor}`}>3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textColor}`}>Ce mois</span>
              <span className={`text-sm font-medium ${textColor}`}>12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textColor}`}>Archives personnelles</span>
              <span className={`text-sm font-medium ${textColor}`}>{personalCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textColor}`}>Archives centralisées</span>
              <span className={`text-sm font-medium ${textColor}`}>{centralizedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textColor}`}>Favoris</span>
              <span className={`text-sm font-medium ${textColor}`}>{favoriteCount}</span>
            </div>
          </div>
          
          <div className={`mt-4 p-3 rounded-lg bg-gray-100/10 ${borderColor} border`}>
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${accentBg} bg-opacity-20`}>
                <Download size={14} className={accentColor} />
              </div>
              <div>
                <h4 className={`text-sm font-medium ${textColor}`}>Exporter les archives</h4>
                <p className={`text-xs ${subTextColor}`}>Format PDF, Excel ou CSV</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourrierArchived;