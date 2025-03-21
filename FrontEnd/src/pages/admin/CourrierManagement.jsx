import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import NewCourrierModal from "../../components/NewCourrierModal";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import debounce from 'lodash/debounce';
import { 
  FaInbox, FaPaperPlane, FaEdit, FaArchive, FaTag, FaSearch, FaFilter, 
  FaDownload, FaPlus, FaEllipsisH, FaTrash, FaReply, FaForward, FaEye, 
  FaClock, FaTimes, FaPaperclip, FaEnvelope, FaExclamationTriangle, 
  FaBuilding, FaCheck, FaFileAlt, FaFileWord, FaFilePdf, FaFileImage,
  FaChevronDown, FaUser, FaUserFriends, FaHistory, FaPrint, FaStar, 
  FaLink, FaLock, FaHourglassHalf
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const CourrierManagement = () => {
  const { darkMode } = useTheme();
  const mainBg = darkMode ? 'bg-[#131313]' : 'bg-[#FFFFFF]';
  const cardBg = darkMode ? 'bg-[#1F2024]' : 'bg-[#F5F5F5]';
  const textColor = darkMode ? 'text-[#FFFFFF]' : 'text-[#131313]';
  const subTextColor = darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]';
  const borderColor = darkMode ? 'border-[#2D2D2D]' : 'border-[#E5E5E5]';
  const hoverColor = darkMode ? 'hover:bg-[#2D2D2D]' : 'hover:bg-[#F0F0F0]';
  const gradientBg = 'bg-gradient-to-r from-[#A78800] to-[#D4AF37]';
  const cardShadow = darkMode ? 'shadow-[0_4px_12px_rgba(0,0,0,0.25)]' : 'shadow-[0_4px_12px_rgba(0,0,0,0.08)]';

  const [activeSection, setActiveSection] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courriers, setCourriers] = useState([]);
  const [counts, setCounts] = useState({ inbox: 0, sent: 0, drafts: 0, archives: 0, pendingValidation: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userDepartment, setUserDepartment] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [formData, setFormData] = useState(null);
  const [selectedCourrier, setSelectedCourrier] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const navigationCards = [
    { id: 'inbox', label: 'Inbox', icon: <FaInbox /> },
    { id: 'sent', label: 'Sent', icon: <FaPaperPlane /> },
    { id: 'drafts', label: 'Drafts', icon: <FaEdit /> },
    { id: 'archives', label: 'Archives', icon: <FaArchive /> },
    { id: 'pendingValidation', label: 'Pending Validation', icon: <FaHourglassHalf /> }
  ];

  const tags = [
    { id: 'all', label: 'All', color: '#A78800' },
    { id: 'urgent', label: 'Urgent', color: '#E53E3E' },
    { id: 'officiel', label: 'Official', color: '#805AD5' },
    { id: 'interne', label: 'Internal', color: '#38B2AC' }
  ];

  const departments = [
    { id: 'Présidence', label: 'Présidence', icon: <FaBuilding /> },
    { id: 'Direction Générale des Services', label: 'Direction Générale des Services', icon: <FaBuilding /> },
    { id: 'Bureau d\'Ordre', label: 'Bureau d\'Ordre', icon: <FaBuilding /> },
    { id: 'Secrétariat du Conseil', label: 'Secrétariat du Conseil', icon: <FaBuilding /> },
    { id: 'Secrétariat du Président', label: 'Secrétariat du Président', icon: <FaBuilding /> },
    { id: 'Ressources Humaines', label: 'Ressources Humaines', icon: <FaBuilding /> },
    { id: 'Division Financière', label: 'Division Financière', icon: <FaBuilding /> },
    { id: 'Division Technique', label: 'Division Technique', icon: <FaBuilding /> },
    { id: 'Bureau d\'Hygiène', label: 'Bureau d\'Hygiène', icon: <FaBuilding /> },
    { id: 'Partenariat et Coopération', label: 'Partenariat et Coopération', icon: <FaBuilding /> },
    { id: 'Informatique et Communication', label: 'Informatique et Communication', icon: <FaBuilding /> },
    { id: 'Administration', label: 'Administration', icon: <FaBuilding /> },
  ];

  const statuses = [
    { id: 'en_attente', label: 'En attente', color: '#F59E0B' },
    { id: 'validé', label: 'Validé', color: '#10B981' },
    { id: 'rejeté', label: 'Rejeté', color: '#EF4444' }
  ];

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);
      setUserDepartment(decoded.department);
      setUserRole(decoded.role);
    }
  }, []);

  const fetchDataDebounced = useCallback(
    debounce(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { section: activeSection };
        if (selectedTags.length > 0 && !selectedTags.includes('all')) {
          params.type = selectedTags.join(',');
        }
        if (selectedDepartments.length > 0) {
          params.receiverDepartments = selectedDepartments.join(',');
        }
        if (selectedStatuses.length > 0) {
          params.status = selectedStatuses.join(',');
        }
        if (searchQuery) params.subject = searchQuery;

        const response = await axios.get(`${API_URL}/mails/mails-and-counts`, {
          ...getAuthHeaders(),
          params,
        });
        setCourriers(response.data.courriers);
        setCounts(response.data.counts);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }, 500),
    [activeSection, selectedTags, selectedDepartments, selectedStatuses, searchQuery, userId]
  );

  useEffect(() => {
    if (userId) {
      fetchDataDebounced();
    }
    return () => {
      fetchDataDebounced.cancel();
    };
  }, [fetchDataDebounced, userId]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this courrier?')) {
      try {
        await axios.delete(`${API_URL}/mails/${id}`, getAuthHeaders());
        setCourriers(courriers.filter(c => c._id !== id));
        fetchDataDebounced();
        if (selectedCourrier?._id === id) setSelectedCourrier(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete courrier');
      }
    }
  };

  const handleView = (courrier) => {
    setSelectedCourrier(courrier);
  };

  const handleClosePopup = () => {
    setSelectedCourrier(null);
    setShowMoreActions(false);
  };

  const handleReply = (courrier) => {
    setFormData({
      type: courrier.type,
      subject: `Re: ${courrier.subject}`,
      content: `\n\n--- Original Message ---\nFrom: ${courrier.sender.department}\n${courrier.content}`, // Use department instead of fullName
      receiverUsers: [courrier.sender._id],
      receiverDepartments: [],
      attachments: []
    });
    setIsModalOpen(true);
    setSelectedCourrier(null);
  };

  const handleForward = (courrier) => {
    setFormData({
      type: courrier.type,
      subject: `Fwd: ${courrier.subject}`,
      content: `\n\n--- Forwarded Message ---\nFrom: ${courrier.sender.department}\n${courrier.content}`, // Use department instead of fullName
      receiverUsers: [],
      receiverDepartments: [],
      attachments: courrier.attachments.map(path => ({ name: path.split('/').pop(), path }))
    });
    setIsModalOpen(true);
    setSelectedCourrier(null);
  };

  const handleModalClose = (newCourrier) => {
    setIsModalOpen(false);
    setFormData(null);
    if (newCourrier) {
      // Automatically validate if the sender is an admin
      if (userRole === 'admin') {
        newCourrier.status = 'validé';
        newCourrier.section = 'inbox';
      } else if (['president', 'dgs'].includes(userRole)) {
        // Keep existing behavior for president and dgs
        newCourrier.status = 'validé';
        newCourrier.section = 'inbox';
      }
      fetchDataDebounced();
    }
  };

  const handleValidate = async (id) => {
    setActionLoading(true);
    try {
      await axios.put(
        `${API_URL}/mails/${id}`,
        { status: 'validé' },
        getAuthHeaders()
      );
      setCourriers(courriers.map(c => (c._id === id ? { ...c, status: 'validé' } : c)));
      setSelectedCourrier(prev => (prev && prev._id === id ? { ...prev, status: 'validé' } : prev));
      fetchDataDebounced();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to validate courrier');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      await axios.put(
        `${API_URL}/mails/${id}`,
        { status: 'rejeté' },
        getAuthHeaders()
      );
      setCourriers(courriers.map(c => (c._id === id ? { ...c, status: 'rejeté' } : c)));
      setSelectedCourrier(prev => (prev && prev._id === id ? { ...prev, status: 'rejeté' } : prev));
      fetchDataDebounced();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject courrier');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async (id) => {
    setActionLoading(true);
    try {
      await axios.put(
        `${API_URL}/mails/${id}`,
        { section: 'archives' },
        getAuthHeaders()
      );
      setCourriers(courriers.filter(c => c._id !== id));
      setSelectedCourrier(null);
      fetchDataDebounced();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to archive courrier');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadAttachment = (attachment) => {
    const fileUrl = `${API_URL}/uploads/${getFileName(attachment)}`;
    window.open(fileUrl, '_blank');
  };

  const toggleTag = (tagId) => {
    if (tagId === 'all') {
      setSelectedTags(['all']);
    } else {
      const newTags = selectedTags.includes(tagId)
        ? selectedTags.filter(id => id !== tagId)
        : [...selectedTags.filter(id => id !== 'all'), tagId];
      setSelectedTags(newTags.length ? newTags : ['all']);
    }
  };

  const toggleDepartment = (deptId) => {
    setSelectedDepartments(prev => 
      prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
    );
  };

  const toggleStatus = (statusId) => {
    setSelectedStatuses(prev => 
      prev.includes(statusId) ? prev.filter(id => id !== statusId) : [...prev, statusId]
    );
  };

  const clearFilters = () => {
    setSelectedTags(['all']);
    setSelectedDepartments([]);
    setSelectedStatuses([]);
    setSearchQuery('');
  };

  useEffect(() => {
    if (selectedTags.length === 0) {
      setSelectedTags(['all']);
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.1 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const filterVariants = {
    hidden: { opacity: 0, height: 0, overflow: 'hidden' },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } }
  };

  const popupVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 25, stiffness: 500 } },
    exit: { opacity: 0, y: -50, scale: 0.95, transition: { duration: 0.2 } }
  };

  const getFileName = (path) => path.split('/').pop();
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['doc', 'docx'].includes(ext)) return <FaFileWord className="mr-1 text-blue-500" size={12} />;
    if (ext === 'pdf') return <FaFilePdf className="mr-1 text-red-500" size={12} />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <FaFileImage className="mr-1 text-green-500" size={12} />;
    return <FaFileAlt className="mr-1 text-gray-500" size={12} />;
  };

  const getActivityHistory = (courrier) => {
    const history = [
      {
        action: `Created by ${courrier.sender?.department || 'Unknown Department'}`,
        description: 'Initial submission',
        timestamp: courrier.createdAt,
      },
    ];
    if (courrier.status === 'validé') {
      history.push({
        action: 'Validated',
        description: 'The courrier has been approved and processed',
        timestamp: courrier.updatedAt || new Date(new Date(courrier.createdAt).getTime() + 2*24*60*60*1000).toISOString(),
      });
    } else if (courrier.status === 'rejeté') {
      history.push({
        action: 'Rejected',
        description: 'The courrier has been rejected',
        timestamp: courrier.updatedAt || new Date(new Date(courrier.createdAt).getTime() + 2*24*60*60*1000).toISOString(),
      });
    }
    return history;
  };

  return (
    <div className={`p-6 mt-[63px] ${mainBg} ${textColor} min-h-screen overflow-y-auto`}>
      <div className="mb-6 bg-[#EAB308] rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-white">Courrier Management</h1>
        <p className="text-white/80">Manage all your internal and external communications efficiently.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {navigationCards.map((card) => (
          <div
            key={card.id}
            onClick={() => setActiveSection(card.id)}
            className={`
              p-4 rounded-xl border shadow-md flex items-center justify-between cursor-pointer
              transition-all duration-300 transform hover:scale-105
              ${activeSection === card.id ? 'border-[#A78800] ring-2 ring-[#A78800]/30' : `${borderColor} hover:border-[#A78800]/50`}
            `}
            style={{ 
              background: darkMode 
                ? activeSection === card.id ? 'linear-gradient(145deg, #252629, #1b1c1f)' : '#1F2024'
                : activeSection === card.id ? 'linear-gradient(145deg, #ffffff, #f5f5f5)' : 'white',
              boxShadow: activeSection === card.id 
                ? `0 8px 20px ${darkMode ? 'rgba(0,0,0,0.25)' : 'rgba(167, 136, 0, 0.15)'}`
                : `0 4px 15px ${darkMode ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.05)'}`
            }}
          >
            <div className="flex items-center">
              <div 
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center mr-3
                  ${activeSection === card.id ? gradientBg : darkMode ? 'bg-gray-800' : 'bg-gray-100'}
                `}
              >
                <span className={activeSection === card.id ? 'text-white' : textColor}>{card.icon}</span>
              </div>
              <div>
                <h3 className="font-medium">{card.label}</h3>
                <p className={`text-xs ${subTextColor}`}>
                  {counts[card.id]} {card.label.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 items-start md:items-center justify-between mb-6">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder={`Search ${activeSection}...`}
            className={`
              w-full pl-10 pr-4 py-2.5 rounded-lg outline-none
              ${darkMode ? 'bg-[#2D2D2D] text-white' : 'bg-gray-100 text-gray-800'}
              border ${borderColor} focus:ring-2 focus:ring-[#A78800]/30 focus:border-[#A78800]
              transition-all duration-300
            `}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className={`absolute left-3 top-3 ${subTextColor}`} />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`
              px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center
              ${showFilters 
                ? `${gradientBg} text-white` 
                : `${darkMode ? 'bg-[#2D2D2D] hover:bg-[#3D3D3D]' : 'bg-gray-100 hover:bg-gray-200'} ${textColor}`
              }
            `}
          >
            <FaFilter size={16} className={showFilters ? "text-white" : ""} />
            <span className="ml-2 font-medium">Filters</span>
            <FaChevronDown 
              size={12} 
              className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
            />
          </button>
          <button className={`p-2.5 rounded-lg transition-all duration-200 ${darkMode ? 'bg-[#2D2D2D] hover:bg-[#3D3D3D]' : 'bg-gray-100 hover:bg-gray-200'}`}>
            <FaDownload size={16} className={textColor} />
          </button>
          <button 
            className={`px-4 py-2.5 rounded-lg flex items-center space-x-2 ${gradientBg} text-white transition-all duration-200 hover:opacity-90`}
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus size={14} />
            <span className="font-medium">New Courrier</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={filterVariants}
            className={`
              mb-6 rounded-xl border ${borderColor} p-5 ${cardShadow}
              ${darkMode ? 'bg-[#1F2024]' : 'bg-white'}
            `}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Advanced Filters</h3>
              <button 
                onClick={clearFilters}
                className={`text-sm px-3 py-1 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors duration-200`}
              >
                <div className="flex items-center">
                  <FaTimes size={12} className="mr-1" />
                  <span>Clear All</span>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`rounded-lg border ${borderColor} p-3`}>
                <h4 className="font-medium mb-2 flex items-center">
                  <FaTag className="mr-2" size={12} />
                  <span>Tags</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`
                        px-3 py-1 rounded-full text-sm transition-all duration-200
                        flex items-center space-x-1
                        ${selectedTags.includes(tag.id) 
                          ? 'text-white' 
                          : `border text-opacity-90 ${textColor} ${hoverColor}`}
                      `}
                      style={{
                        backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                        borderColor: tag.color,
                      }}
                    >
                      <span>{tag.label}</span>
                      {selectedTags.includes(tag.id) && (
                        <FaCheck size={10} className="ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={`rounded-lg border ${borderColor} p-3`}>
                <h4 className="font-medium mb-2 flex items-center">
                  <FaBuilding className="mr-2" size={12} />
                  <span>Departments</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => toggleDepartment(dept.id)}
                      className={`
                        px-3 py-1 rounded-lg text-sm transition-all duration-200
                        flex items-center
                        ${selectedDepartments.includes(dept.id)
                          ? gradientBg + ' text-white'
                          : `border ${borderColor} ${textColor} ${hoverColor}`}
                      `}
                    >
                      <span className="mr-1.5">{dept.icon}</span>
                      <span>{dept.label}</span>
                      {selectedDepartments.includes(dept.id) && (
                        <FaCheck size={10} className="ml-1.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={`rounded-lg border ${borderColor} p-3`}>
                <h4 className="font-medium mb-2 flex items-center">
                  <FaCheck className="mr-2" size={12} />
                  <span>Status</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status.id}
                      onClick={() => toggleStatus(status.id)}
                      className={`
                        px-3 py-1 rounded-lg text-sm transition-all duration-200
                        ${selectedStatuses.includes(status.id)
                          ? 'text-white'
                          : `border ${borderColor} ${textColor} ${hoverColor}`}
                      `}
                      style={{
                        backgroundColor: selectedStatuses.includes(status.id) ? status.color : 'transparent',
                        borderColor: status.color,
                      }}
                    >
                      {status.label}
                      {selectedStatuses.includes(status.id) && (
                        <FaCheck size={10} className="ml-1.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`rounded-xl border ${borderColor} overflow-hidden ${cardShadow}`} style={{ background: darkMode ? '#1F2024' : 'white' }}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold capitalize">{activeSection}</h2>
            <p className={`text-sm ${subTextColor}`}>
              {courriers.length} {selectedTags.length === 1 && selectedTags[0] !== 'all' ? ` ${selectedTags[0]}` : ''} messages
              {selectedDepartments.length > 0 && ` • ${selectedDepartments.length} department${selectedDepartments.length > 1 ? 's' : ''}`}
              {selectedStatuses.length > 0 && ` • ${selectedStatuses.length} status${selectedStatuses.length > 1 ? 'es' : ''}`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <FaEllipsisH size={16} className={textColor} />
            </button>
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-h-[600px] overflow-y-auto"
        >
          {loading ? (
            <motion.div variants={itemVariants} className="p-10 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-t-transparent border-[#A78800] rounded-full mx-auto mb-4"></div>
              <p className={subTextColor}>Loading courriers...</p>
            </motion.div>
          ) : error ? (
            <motion.div variants={itemVariants} className="p-10 text-center">
              <div className="mx-auto w-12 h-12 mb-4 text-red-500">
                <FaExclamationTriangle size={48} />
              </div>
              <p className="text-red-500 font-medium mb-2">Error Occurred</p>
              <p className={`text-sm ${subTextColor}`}>{error}</p>
            </motion.div>
          ) : courriers.length === 0 ? (
            <motion.div variants={itemVariants} className="p-10 text-center">
              <div className="mx-auto w-20 h-20 mb-4 opacity-30">
                {activeSection === 'inbox' ? <FaInbox size={48} /> : 
                 activeSection === 'sent' ? <FaPaperPlane size={48} /> :
                 activeSection === 'drafts' ? <FaEdit size={48} /> :
                 activeSection === 'archives' ? <FaArchive size={48} /> :
                 <FaHourglassHalf size={48} />}
              </div>
              <h3 className="text-xl font-medium mb-2">No items found</h3>
              <p className={`text-sm ${subTextColor}`}>
                {searchQuery ? `No results matching "${searchQuery}"` : `Your ${activeSection} is empty`}
                {(selectedTags.length > 0 && selectedTags[0] !== 'all') || selectedDepartments.length > 0 || selectedStatuses.length > 0 ? ` with the current filters` : ''}
              </p>
              {(selectedTags.length > 0 && selectedTags[0] !== 'all') || selectedDepartments.length > 0 || selectedStatuses.length > 0 ? (
                <button 
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 rounded-lg text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear filters
                </button>
              ) : (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className={`mt-4 px-4 py-2 rounded-lg text-sm ${gradientBg} text-white hover:opacity-90 transition-colors`}
                >
                  Create new courrier
                </button>
              )}
            </motion.div>
          ) : (
            courriers.map((courrier) => (
              <motion.div 
                key={courrier._id}
                variants={itemVariants}
                className={`
                  border-b ${borderColor} cursor-pointer
                  ${courrier.isRead ? '' : (darkMode ? 'bg-[#252629]' : 'bg-[#F9FAFB]')}
                  ${hoverColor} relative group
                `}
              >
                {courrier.type === 'urgent' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                )}
                
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        <div 
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            ${courrier.type === 'urgent' ? 'bg-red-100 text-red-600' : 
                              courrier.type === 'officiel' ? 'bg-purple-100 text-purple-600' :
                              courrier.type === 'interne' ? 'bg-teal-100 text-teal-600' :
                              'bg-gray-100 text-gray-600'} 
                          `}
                        >
                          {courrier.type === 'urgent' ? <FaExclamationTriangle size={16} /> : 
                           courrier.receiverDepartments?.length > 0 ? <FaBuilding size={16} /> :
                           <FaEnvelope size={16} />}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-wrap items-center mb-1">
                          <h3 className={`font-medium mr-2 ${!courrier.isRead ? 'font-bold' : ''}`}>
                            {courrier.subject}
                          </h3>
                          <span 
                            className={`
                              text-xs px-2 py-0.5 rounded-full whitespace-nowrap
                              ${courrier.status === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                                courrier.status === 'validé' ? 'bg-green-100 text-green-800' : 
                                'bg-red-100 text-red-800'}
                            `}
                          >
                            {courrier.status}
                          </span>
                          {courrier.attachments?.length > 0 && (
                            <span className="ml-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <FaPaperclip className="mr-1" size={10} />
                              {courrier.attachments.length}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 mt-2">
                          <div className="flex items-center">
                            <span className={`w-16 text-xs font-medium ${subTextColor}`}>From:</span>
                            <div className="flex items-center">
                              <span className={`text-sm ${textColor}`}>
                                {courrier.sender?.department || 'Unknown Department'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`w-16 text-xs font-medium ${subTextColor}`}>To:</span>
                            <div className="flex items-center flex-wrap gap-1">
                              {courrier.receiverDepartments?.map(dept => (
                                <div key={dept} className="flex items-center">
                                  <FaBuilding size={12} className="mr-1" />
                                  <span className={`text-sm ${textColor}`}>
                                    {dept}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className={`text-xs ${subTextColor} mt-2 line-clamp-1`}>
                          {courrier.content?.substring(0, 120) || 'No content'}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center mt-3 sm:mt-0 justify-between sm:justify-end w-full sm:w-auto">
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleView(courrier)}
                          className={`p-1.5 rounded-md ${hoverColor}`} 
                          title="View"
                        >
                          <FaEye size={14} className={subTextColor} />
                        </button>
                        <button 
                          onClick={() => handleReply(courrier)}
                          className={`p-1.5 rounded-md ${hoverColor}`} 
                          title="Reply"
                        >
                          <FaReply size={14} className={subTextColor} />
                        </button>
                        <button 
                          onClick={() => handleForward(courrier)}
                          className={`p-1.5 rounded-md ${hoverColor}`} 
                          title="Forward"
                        >
                          <FaForward size={14} className={subTextColor} />
                        </button>
                        <button 
                          onClick={() => handleArchive(courrier._id)}
                          className={`p-1.5 rounded-md ${hoverColor}`} 
                          title="Archive"
                        >
                          <FaArchive size={14} className={subTextColor} />
                        </button>
                        <button 
                          onClick={() => handleDelete(courrier._id)}
                          className={`p-1.5 rounded-md ${hoverColor}`} 
                          title="Delete"
                        >
                          <FaTrash size={14} className={subTextColor} />
                        </button>
                      </div>
                      <div className="flex items-center text-xs">
                        <FaClock size={10} className={`mr-1 ${subTextColor}`} />
                        <span className={`${subTextColor} whitespace-nowrap`}>
                          {new Date(courrier.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {courrier.attachments?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {courrier.attachments.map((attachment, index) => (
                        <div 
                          key={index}
                          className={`
                            flex items-center px-2 py-1 rounded-md text-xs
                            ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                            ${hoverColor} transition-colors cursor-pointer
                          `}
                          onClick={() => handleDownloadAttachment(attachment)}
                        >
                          {getFileIcon(getFileName(attachment))}
                          <span className="truncate max-w-[120px]">{getFileName(attachment)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {courriers.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className={`inline-flex rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-1`}>
            <button 
              className={`px-3 py-1 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} text-sm`}
              disabled={true}
            >
              Previous
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${gradientBg} text-white text-sm mx-1`}
            >
              1
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} text-sm`}
            >
              2
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} text-sm`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <NewCourrierModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        initialData={formData}
      />

      <AnimatePresence>
        {selectedCourrier && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-md"
              onClick={handleClosePopup}
            />
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={popupVariants}
              className={`
                fixed z-50 top-[7%] left-[22%] transform -translate-x-1/2 -translate-y-1/2
                w-[95%] max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl
                ${darkMode ? 'bg-gradient-to-br from-[#1A1B1F] to-[#252629]' : 'bg-gradient-to-br from-white to-gray-50'}
                shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border ${borderColor}
              `}
            >
              <div className="h-2 w-full bg-gradient-to-r from-[#A78800] to-[#D4AF37]" />
              
              <div className="relative overflow-y-auto max-h-[calc(85vh-8px)] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                <div className={`px-6 pt-6 pb-4 border-b ${borderColor} relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-48 h-48 opacity-5">
                    <div className="w-full h-full bg-[#A78800] rounded-full transform translate-x-1/3 -translate-y-1/3" />
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${selectedCourrier.type === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            selectedCourrier.type === 'officiel' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}
                        `}>
                          {selectedCourrier.type.charAt(0).toUpperCase() + selectedCourrier.type.slice(1)}
                        </span>
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${selectedCourrier.status === 'en_attente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            selectedCourrier.status === 'validé' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}
                        `}>
                          {selectedCourrier.status}
                        </span>
                      </div>
                      <h2 className={`text-2xl font-bold ${gradientBg} bg-clip-text text-transparent`}>
                        {selectedCourrier.subject || 'No Subject'}
                      </h2>
                      <div className="flex items-center mt-2 text-sm">
                        <FaClock className={`mr-2 ${subTextColor}`} size={14} />
                        <span className={subTextColor}>
                          {new Date(selectedCourrier.createdAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleClosePopup}
                      className={`
                        w-9 h-9 rounded-full flex items-center justify-center
                        ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}
                        transition-all duration-200
                      `}
                    >
                      <FaTimes size={16} className={textColor} />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm font-medium ${subTextColor}`}>From:</p>
                      <p className={`text-base ${textColor}`}>
                        {selectedCourrier.sender?.department || 'Unknown Department'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${subTextColor}`}>To:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCourrier.receiverDepartments?.map(dept => (
                          <span key={dept} className={`text-base ${textColor}`}>
                            <FaBuilding size={12} className="inline mr-1" />
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className={`text-base ${textColor} whitespace-pre-wrap mb-6`}>
                    {selectedCourrier.content || 'No content available'}
                  </div>

                  {selectedCourrier.attachments?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3 flex items-center">
                        <FaPaperclip className="mr-2 text-[#A78800]" />
                        Attachments ({selectedCourrier.attachments.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedCourrier.attachments.map((attachment, index) => (
                          <div 
                            key={index}
                            className={`
                              flex items-center p-3 rounded-lg border ${borderColor}
                              ${hoverColor} transition-all duration-200 cursor-pointer
                            `}
                            onClick={() => handleDownloadAttachment(attachment)}
                          >
                            <div className="bg-[#A78800]/10 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                              {getFileIcon(getFileName(attachment))}
                            </div>
                            <div>
                              <p className={`text-sm ${textColor} truncate max-w-[200px]`}>
                                {getFileName(attachment)}
                              </p>
                              <p className={`text-xs ${subTextColor}`}>Click to download</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <FaHistory className="mr-2 text-[#A78800]" />
                      Activity History
                    </h3>
                    <div className="space-y-4">
                      {getActivityHistory(selectedCourrier).map((activity, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-2 h-2 bg-[#A78800] rounded-full mt-2 mr-3" />
                          <div>
                            <p className={`text-sm font-medium ${textColor}`}>
                              {activity.action}
                            </p>
                            <p className={`text-xs ${subTextColor}`}>
                              {activity.description}
                            </p>
                            <p className={`text-xs ${subTextColor}`}>
                              {new Date(activity.timestamp).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReply(selectedCourrier)}
                        className={`
                          px-4 py-2 rounded-lg flex items-center space-x-2
                          ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}
                          transition-all duration-200
                        `}
                      >
                        <FaReply size={14} className={textColor} />
                        <span className="text-sm">Reply</span>
                      </button>
                      <button
                        onClick={() => handleForward(selectedCourrier)}
                        className={`
                          px-4 py-2 rounded-lg flex items-center space-x-2
                          ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}
                          transition-all duration-200
                        `}
                      >
                        <FaForward size={14} className={textColor} />
                        <span className="text-sm">Forward</span>
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      {['directeur', 'admin', 'president', 'dgs'].includes(userRole) && selectedCourrier.status === 'en_attente' && (
                        <>
                          <button
                            onClick={() => handleValidate(selectedCourrier._id)}
                            disabled={actionLoading}
                            className={`
                              px-4 py-2 rounded-lg flex items-center space-x-2
                              bg-green-600 text-white hover:bg-green-700
                              transition-all duration-200 ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            <FaCheck size={14} />
                            <span className="text-sm">Validate</span>
                          </button>
                          <button
                            onClick={() => handleReject(selectedCourrier._id)}
                            disabled={actionLoading}
                            className={`
                              px-4 py-2 rounded-lg flex items-center space-x-2
                              bg-red-600 text-white hover:bg-red-700
                              transition-all duration-200 ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            <FaTimes size={14} />
                            <span className="text-sm">Reject</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleArchive(selectedCourrier._id)}
                        disabled={actionLoading}
                        className={`
                          px-4 py-2 rounded-lg flex items-center space-x-2
                          ${gradientBg} text-white hover:opacity-90
                          transition-all duration-200 ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <FaArchive size={14} />
                        <span className="text-sm">Archive</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourrierManagement;