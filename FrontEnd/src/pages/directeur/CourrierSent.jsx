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

const CourrierSent = ({ userData = { role: 'directeur', department: 'Finance' } }) => {
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
  
    // Theme-based styling updated with gold/yellow colors
    const mainBg = darkMode ? 'bg-[#131313]' : 'bg-[#F5F5F5]';
    const containerBg = darkMode ? 'bg-[#1F2024]' : 'bg-[#FFFFFF]';
    const textColor = darkMode ? 'text-[#FFFFFF]' : 'text-[#000000]';
    const subTextColor = darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]';
    const hoverBg = darkMode ? 'hover:bg-[#131313]/80' : 'hover:bg-gray-100';
    const accentColor = 'text-[#A78800]'; // Changed from #00A78E to #A78800
    const accentBg = 'bg-[#A78800]'; // Changed from #00A78E to #A78800
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
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  
  // Mock data for sent courriers
  const mockCourriers = [
    {
      id: 1,
      recipient: 'Resources Humaines',
      subject: 'Validation budgétaire - RH T2 2025',
      content: 'Veuillez trouver ci-joint la validation du budget pour le département des Ressources Humaines pour le deuxième trimestre 2025.',
      date: 'Aujourd\'hui, 10:15',
      status: 'read',
      favorite: true,
      important: true,
      department: 'RH',
      attachments: 3,
      forwarded: false,
      scheduled: false
    },
    {
      id: 2,
      recipient: 'Direction Générale',
      subject: 'Plan stratégique départemental',
      content: 'Voici le plan stratégique de notre département pour les six prochains mois, incluant nos principaux objectifs et indicateurs de performance.',
      date: 'Aujourd\'hui, 09:22',
      status: 'delivered',
      favorite: false,
      important: true,
      department: 'DG',
      attachments: 2,
      forwarded: true,
      scheduled: false
    },
    {
      id: 3,
      recipient: 'Service Technique',
      subject: 'Demande d\'équipement informatique',
      content: 'Suite à notre dernier entretien, je vous transmets notre demande de matériel informatique pour les nouveaux postes créés dans notre service.',
      date: 'Hier, 15:40',
      status: 'pending',
      favorite: false,
      important: false,
      department: 'Technique',
      attachments: 1,
      forwarded: false,
      scheduled: false
    },
    {
      id: 4,
      recipient: 'Service Urbanisme',
      subject: 'Revue des dossiers d\'autorisation de construction',
      content: 'Merci de bien vouloir examiner les dossiers d\'autorisation de construction joints et de me faire part de vos commentaires avant la réunion de lundi.',
      date: 'Hier, 14:05',
      status: 'read',
      favorite: true,
      important: false,
      department: 'Urbanisme',
      attachments: 5,
      forwarded: false,
      scheduled: false
    },
    {
      id: 5,
      recipient: 'Service Communication',
      subject: 'Proposition de campagne financière',
      content: 'Suite à notre réunion, voici notre proposition de campagne de communication pour le nouveau programme d\'aide financière aux entreprises locales.',
      date: '2 jours, 11:30',
      status: 'delivered',
      favorite: false,
      important: false,
      department: 'Communication',
      attachments: 2,
      forwarded: true,
      scheduled: false
    },
    {
      id: 6,
      recipient: 'Police Municipale',
      subject: 'Allocation budgétaire - Équipements 2025',
      content: 'Je vous confirme l\'allocation budgétaire pour l\'achat des nouveaux équipements de sécurité demandés pour l\'année 2025.',
      date: '3 jours, 16:20',
      status: 'read',
      favorite: false,
      important: true,
      department: 'Sécurité',
      attachments: 1,
      forwarded: false,
      scheduled: false
    },
    {
      id: 7,
      recipient: 'Service Financier',
      subject: 'Rapport d\'audit interne Q1 2025',
      content: 'Voici le rapport détaillé de l\'audit interne effectué sur le premier trimestre 2025, incluant nos observations et recommandations.',
      date: '5 jours, 09:45',
      status: 'failed',
      favorite: false,
      important: true,
      department: 'Finance',
      attachments: 4,
      forwarded: false,
      scheduled: false
    },
    {
      id: 8,
      recipient: 'Direction des Systèmes d\'Information',
      subject: 'Projet de migration cloud - Phase 2',
      content: 'Vous trouverez ci-joint notre validation pour la phase 2 du projet de migration vers le cloud, ainsi que le calendrier révisé.',
      date: '1 semaine, 14:30',
      status: 'read',
      favorite: true,
      important: false,
      department: 'DSI',
      attachments: 2,
      forwarded: false,
      scheduled: false
    },
    {
      id: 9,
      recipient: 'Resources Humaines',
      subject: 'Planification des entretiens annuels',
      content: 'Merci de procéder à la planification des entretiens annuels pour notre département selon le calendrier proposé.',
      date: '28/02/2025, 10:15',
      status: 'delivered',
      favorite: false,
      important: false,
      department: 'RH',
      attachments: 1,
      forwarded: false,
      scheduled: true,
      scheduledDate: '25/03/2025, 08:00'
    },
  ];
  
  // Load mock data
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
  
  const handleArchive = (id) => {
    setCourriers(prev => prev.filter(c => c.id !== id));
  };
  
  const handleBulkArchive = () => {
    setCourriers(prev => prev.filter(c => !selectedCourriers.includes(c.id)));
    setSelectedCourriers([]);
    setSelectAll(false);
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
    if (activeFilter === 'pending' && courrier.status !== 'pending') return false;
    if (activeFilter === 'failed' && courrier.status !== 'failed') return false;
    if (activeFilter === 'important' && !courrier.important) return false;
    if (activeFilter === 'scheduled' && !courrier.scheduled) return false;
    if (activeFilter === 'forwarded' && !courrier.forwarded) return false;
    if (activeFilter !== 'all' && 
        activeFilter !== 'read' && 
        activeFilter !== 'delivered' && 
        activeFilter !== 'pending' && 
        activeFilter !== 'failed' &&
        activeFilter !== 'important' &&
        activeFilter !== 'scheduled' &&
        activeFilter !== 'forwarded' &&
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
      // Simple date comparison based on string (in a real app, you'd parse actual dates)
      return sortDirection === 'asc' 
        ? a.date.localeCompare(b.date) 
        : b.date.localeCompare(a.date);
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
  const pendingCount = courriers.filter(c => c.status === 'pending').length;
  const failedCount = courriers.filter(c => c.status === 'failed').length;
  const scheduledCount = courriers.filter(c => c.scheduled).length;
  
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
      'Sécurité': 'bg-gray-500',
      'DSI': 'bg-indigo-500'
    };
    return colors[dept] || 'bg-gray-500';
  };

  const getDepartmentInitials = (dept) => {
    if (dept === 'DSI') return 'DS';
    return dept.substring(0, 2).toUpperCase();
  };
  
  const getStatusIcon = (status, size = 16) => {
    switch(status) {
      case 'read':
        return <MailCheck size={size} className="text-green-500" />;
      case 'delivered':
        return <Check size={size} className="text-blue-500" />;
      case 'pending':
        return <Clock size={size} className="text-amber-500" />;
      case 'failed':
        return <AlertTriangle size={size} className="text-red-500" />;
      default:
        return <Send size={size} className={subTextColor} />;
    }
  };
  
  const getStatusText = (status) => {
    switch(status) {
      case 'read':
        return 'Lu';
      case 'delivered':
        return 'Livré';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échec';
      default:
        return 'Envoyé';
    }
  };
  
  return (
    <div className={`p-6 ${mainBg} ${textColor} min-h-screen`}>
      {/* Header section with gradient background */}
      <div className="mb-6 relative overflow-hidden rounded-xl shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#A78800] to-[#1F2024] animate-[gradient_15s_ease_infinite] bg-[length:200%_200%]"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="relative z-10 p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">Courriers Envoyés</h1>
              <p className="text-white/80 flex items-center gap-2 flex-wrap">
                <span>Département {userData.department}</span>
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
                {failedCount > 0 && (
                  <>
                    <span className="inline-block w-1 h-1 rounded-full bg-white/60"></span>
                    <span className="font-semibold flex items-center text-red-300">
                      <AlertTriangle size={14} className="mr-1" /> {failedCount} échec{failedCount !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
                {scheduledCount > 0 && (
                  <>
                    <span className="inline-block w-1 h-1 rounded-full bg-white/60"></span>
                    <span className="font-semibold flex items-center">
                      <Calendar size={14} className="mr-1" /> {scheduledCount} programmé{scheduledCount !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <button 
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                  title="Exporter"
                >
                  <Download size={20} />
                </button>
                {exportMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute top-full right-0 mt-1 w-48 ${containerBg} rounded-lg shadow-xl z-10 border ${borderColor} overflow-hidden`}
                  >
                    <div className="p-2">
                      <button className={`px-3 py-2 text-sm w-full text-left rounded-lg ${textColor} hover:bg-[#00A78E]/10 transition-colors flex items-center gap-2`}>
                        <Download size={14} /> Exporter en PDF
                      </button>
                      <button className={`px-3 py-2 text-sm w-full text-left rounded-lg ${textColor} hover:bg-[#00A78E]/10 transition-colors flex items-center gap-2`}>
                        <Printer size={14} /> Imprimer
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
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
              <Send size={14} />
              <span>{courriers.length} courriers</span>
            </div>
            <div className="bg-white/10 rounded-full px-4 py-1 text-sm text-white flex items-center gap-1">
              <Star size={14} />
              <span>{courriers.filter(c => c.favorite).length} favoris</span>
            </div>
            <div className="bg-white/10 rounded-full px-4 py-1 text-sm text-white flex items-center gap-1">
              <Forward size={14} />
              <span>{courriers.filter(c => c.forwarded).length} transférés</span>
            </div>
            <div className="bg-white/10 rounded-full px-4 py-1 text-sm text-white flex items-center gap-1">
              <Clock size={14} />
              <span>Dernière mise à jour: aujourd'hui</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main container with courrier list */}
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
                  onClick={() => {}}
                  className={`p-2 rounded-full ${hoverBg} transition-colors`}
                  title="Transférer"
                >
                  <Forward size={18} className={subTextColor} />
                </button>
                <button 
                  onClick={handleBulkArchive}
                  className={`p-2 rounded-full ${hoverBg} transition-colors`}
                  title="Archiver"
                >
                  <Archive size={18} className={subTextColor} />
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className={`p-2 rounded-full ${hoverBg} transition-colors`}
                  title="Supprimer"
                >
                  <Trash2 size={18} className={subTextColor} />
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
                      {activeFilter === 'all' ? 'Tous' :
                        activeFilter === 'read' ? 'Lus' :
                        activeFilter === 'delivered' ? 'Livrés' :
                        activeFilter === 'pending' ? 'En attente' :
                        activeFilter === 'failed' ? 'Échecs' :
                        activeFilter === 'important' ? 'Importants' :
                        activeFilter === 'scheduled' ? 'Programmés' :
                        activeFilter === 'forwarded' ? 'Transférés' : activeFilter}
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
                          className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === 'all' ? 'bg-[#00A78E]/20 text-[#00A78E]' : textColor} hover:bg-[#00A78E]/10 transition-colors flex items-center gap-2`}
                        >
                          <Send size={14} /> Tous les courriers
                        </button>
                        <button 
                          onClick={() => { setActiveFilter('read'); setFilterOpen(false); }}
                          className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === 'read' ? 'bg-[#00A78E]/20 text-[#00A78E]' : textColor} hover:bg-[#00A78E]/10 transition-colors flex items-center gap-2`}
                        >
                          <MailCheck size={14} /> Lus
                        </button>
                        <button 
                          onClick={() => { setActiveFilter('delivered'); setFilterOpen(false); }}
                          className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === 'delivered' ? 'bg-[#00A78E]/20 text-[#00A78E]' : textColor} hover:bg-[#00A78E]/10 transition-colors flex items-center gap-2`}
                        >
                          <Check size={14} /> Livrés
                        </button>
                        <button 
                          onClick={() => { setActiveFilter('pending'); setFilterOpen(false); }}
                          className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === 'pending' ? 'bg-[#00A78E]/20 text-[#00A78E]' : textColor} hover:bg-[#00A78E]/10 transition-colors flex items-center gap-2`}
                        >
                          <Clock size={14} /> En attente
                        </button>
                        <button 
                          onClick={() => { setActiveFilter('failed'); setFilterOpen(false); }}
                          className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === 'failed' ? 'bg-[#00A78E]/20 text-[#00A78E]' : textColor} hover:bg-[#00A78E]/10 transition-colors flex items-center gap-2`}
                        >
                          <AlertTriangle size={14} /> Échecs
                        </button>
                        <button 
                          onClick={() => { setActiveFilter('important'); setFilterOpen(false); }}
                          className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === 'important' ? 'bg-[#00A78E]/20 text-[#00A78E]' : textColor} hover:bg-[#00A78E]/10 transition-colors flex items-center gap-2`}
                        >
                          <AlertCircle size={14} /> Importants
                        </button>
                        <button 
                          onClick={() => { setActiveFilter('scheduled'); setFilterOpen(false); }}
                          className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === 'scheduled' ? 'bg-[#00A78E]/20 text-[#00A78E]' : textColor} hover:bg-[#00A78E]/10 transition-colors flex items-center gap-2`}
                        >
                          <Calendar size={14} /> Programmés
                        </button>
                        <button 
                          onClick={() => { setActiveFilter('forwarded'); setFilterOpen(false); }}
                          className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === 'forwarded' ? 'bg-[#00A78E]/20 text-[#00A78E]' : textColor} hover:bg-[#00A78E]/10 transition-colors flex items-center gap-2`}
                        >
                          <Forward size={14} /> Transférés
                        </button>
                      </div>
                      
                      <div className={`h-px w-full ${borderColor} mx-auto`}></div>
                      
                      <div className="p-2">
                        <div className="px-3 py-1 text-xs font-medium text-[#AAAAAA]">Départements</div>
                        {['RH', 'Finance', 'Technique', 'Urbanisme', 'Communication', 'DG', 'Sécurité', 'DSI'].map(dept => (
                          <button
                            key={dept}
                            onClick={() => { setActiveFilter(dept); setFilterOpen(false); }}
                            className={`px-3 py-2 text-sm w-full text-left rounded-lg ${activeFilter === dept ? 'bg-[#00A78E]/20 text-[#00A78E]' : textColor} hover:bg-[#00A78E]/10 transition-colors flex items-center gap-2`}
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
                
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center gap-1 text-sm p-2 rounded-full ${hoverBg} transition-colors ${showFavoritesOnly ? accentColor : subTextColor}`}
                >
                  {showFavoritesOnly ? <Star size={16} /> : <StarOff size={16} />}
                  <span>{showFavoritesOnly ? 'Favoris' : 'Tous'}</span>
                </button>
                
                <div className="h-6 w-px mx-2 bg-gray-300/20"></div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSort('date')}
                    className={`flex items-center gap-1 text-sm p-2 rounded-full ${hoverBg} transition-colors ${sortBy === 'date' ? accentColor : subTextColor}`}
                    title="Trier par date"
                  >
                    Date
                    {sortBy === 'date' && (
                      sortDirection === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />
                    )}
                  </button>
                  <button 
                    onClick={() => handleSort('recipient')}
                    className={`flex items-center gap-1 text-sm p-2 rounded-full ${hoverBg} transition-colors ${sortBy === 'recipient' ? accentColor : subTextColor}`}
                    title="Trier par destinataire"
                  >
                    Destinataire
                    {sortBy === 'recipient' && (
                      sortDirection === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />
                    )}
                  </button>
                  <button 
                    onClick={() => handleSort('status')}
                    className={`flex items-center gap-1 text-sm p-2 rounded-full ${hoverBg} transition-colors ${sortBy === 'status' ? accentColor : subTextColor}`}
                    title="Trier par statut"
                  >
                    Statut
                    {sortBy === 'status' && (
                      sortDirection === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />
                    )}
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
                layout
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={listItemVariants}
                className={`flex items-start p-4 border-b ${borderColor} ${
                  selectedCourriers.includes(courrier.id) ? 'bg-[#00A78E]/5' : hoverBg
                } transition-colors relative group`}
                onMouseEnter={() => setHoveredCourrier(courrier.id)}
                onMouseLeave={() => setHoveredCourrier(null)}
              >
                <div className="flex items-center mr-3">
                  <button
                    onClick={() => handleSelect(courrier.id)}
                    className="p-2 rounded-full hover:bg-black/5 transition-colors"
                  >
                    {selectedCourriers.includes(courrier.id) ? (
                      <CheckSquare size={18} className={accentColor} />
                    ) : (
                      <Square size={18} className={subTextColor} />
                    )}
                  </button>
                </div>
                
                <div className="mr-3">
                  <button
                    onClick={() => handleFavoriteToggle(courrier.id)}
                    className="p-2 rounded-full hover:bg-black/5 transition-colors"
                  >
                    {courrier.favorite ? (
                      <Star size={18} className="text-amber-400" />
                    ) : (
                      <StarOff size={18} className={subTextColor} />
                    )}
                  </button>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <div className={`flex items-center gap-2 ${
                      courrier.important ? 'font-semibold' : ''
                    }`}>
                      <div className={`h-6 w-6 rounded-full ${getDepartmentColor(courrier.department)} flex items-center justify-center text-xs text-white`}>
                        {getDepartmentInitials(courrier.department)}
                      </div>
                      <span className={`${textColor}`}>{courrier.recipient}</span>
                      
                      {courrier.scheduled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                          <Calendar size={12} />
                          Programmé: {courrier.scheduledDate}
                        </span>
                      )}
                      
                      {courrier.important && (
                        <span className="ml-2">
                          <AlertCircle size={16} className="text-amber-500" />
                        </span>
                      )}
                      
                      {courrier.forwarded && (
                        <span className="ml-2">
                          <Forward size={16} className="text-blue-500" />
                        </span>
                      )}
                      
                      <span className="ml-2 flex items-center gap-1">
                        {getStatusIcon(courrier.status)}
                        <span className={`text-xs ${
                          courrier.status === 'failed' 
                            ? 'text-red-500' 
                            : courrier.status === 'read'
                              ? 'text-green-500'
                              : courrier.status === 'delivered'
                                ? 'text-blue-500'
                                : 'text-amber-500'
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
                      <button
                        onClick={() => {}}
                        className={`p-2 rounded-full ${hoverBg} transition-colors`}
                        title="Voir les détails"
                      >
                        <Eye size={16} className={subTextColor} />
                      </button>
                      <button
                        onClick={() => {}}
                        className={`p-2 rounded-full ${hoverBg} transition-colors`}
                        title="Transférer"
                      >
                        <Forward size={16} className={subTextColor} />
                      </button>
                      {!courrier.scheduled && (
                        <button
                          onClick={() => {}}
                          className={`p-2 rounded-full ${hoverBg} transition-colors`}
                          title="Modifier"
                        >
                          <Edit size={16} className={subTextColor} />
                        </button>
                      )}
                      <button
                        onClick={() => handleArchive(courrier.id)}
                        className={`p-2 rounded-full ${hoverBg} transition-colors`}
                        title="Archiver"
                      >
                        <Archive size={16} className={subTextColor} />
                      </button>
                      <button
                        onClick={() => handleDelete(courrier.id)}
                        className={`p-2 rounded-full ${hoverBg} transition-colors`}
                        title="Supprimer"
                      >
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
            <button 
              className={`px-3 py-1 text-sm rounded-md ${textColor} hover:bg-gray-100/10 disabled:opacity-50 transition-colors`}
              disabled={true}
            >
              Précédent
            </button>
            <span className={`inline-flex items-center justify-center h-8 w-8 rounded-md ${accentBg} text-white text-sm`}>1</span>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${textColor} hover:bg-gray-100/10 disabled:opacity-50 transition-colors`}
              disabled={true}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourrierSent;