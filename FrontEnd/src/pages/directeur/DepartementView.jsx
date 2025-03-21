import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaEnvelope, FaUpload, FaDownload, FaArchive, FaTrash, FaStar, FaFilter, FaSearch, FaEllipsisV, FaCheckSquare, FaRegCheckSquare, FaExclamationCircle, FaPaperclip, FaPlus, FaCheck } from 'react-icons/fa';

const DepartmentView = () => {
  const { darkMode } = useTheme();
  const [activeSection, setActiveSection] = useState('department_inbox');
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [userData, setUserData] = useState(null);
  const [selectedAll, setSelectedAll] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');

  // Sample data for demonstration
  const courriers = {
    department_inbox: Array(8).fill().map((_, i) => ({
      _id: `dept-inbox-${i}`,
      subject: `Directive départementale ${i+1}`,
      sender: { fullName: `Département ${i % 3 === 0 ? 'Finance' : i % 3 === 1 ? 'Ressources Humaines' : 'Opérations'}` },
      excerpt: `Contenu de la directive départementale concernant le nouveau protocole...`,
      createdAt: new Date(Date.now() - i * 86400000),
      status: i % 3 === 0 ? 'validé' : i % 3 === 1 ? 'en_attente' : 'nouveau',
      priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
      attachments: i % 2 === 0 ? [{name: 'directive.pdf'}] : [],
      isRead: i % 2 === 0,
      isStarred: i === 1 || i === 5
    })),
    pending_validation: Array(5).fill().map((_, i) => ({
      _id: `pending-${i}`,
      subject: `Validation requise ${i+1}`,
      sender: { fullName: `${i % 2 === 0 ? 'Jean Dupont' : 'Marie Martin'}` },
      excerpt: `Demande de validation pour le document concernant...`,
      createdAt: new Date(Date.now() - i * 86400000),
      status: 'en_attente',
      priority: i % 2 === 0 ? 'high' : 'medium',
      attachments: i % 2 === 0 ? [{name: 'document.pdf'}] : [],
      isRead: i % 2 === 0,
      isStarred: i === 2
    })),
    department_archive: Array(7).fill().map((_, i) => ({
      _id: `dept-archive-${i}`,
      subject: `Archive départementale ${i+1}`,
      sender: { fullName: `Département ${i % 3 === 0 ? 'Finance' : i % 3 === 1 ? 'Ressources Humaines' : 'Opérations'}` },
      excerpt: `Message archivé concernant les procédures départementales...`,
      archivedAt: new Date(Date.now() - i * 86400000 * 7),
      status: 'archivé',
      priority: i % 2 === 0 ? 'medium' : 'low',
      attachments: i % 2 === 0 ? [{name: 'archive.pdf'}] : [],
      isRead: true,
      isStarred: i === 3
    }))
  };

  useEffect(() => {
    // Simulating user data fetch
    setUserData({
      userId: 'user123',
      role: 'directeur',
      department: 'Direction des Ressources Humaines',
      fullName: 'Marie Dupont'
    });
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSelectedItems([]);
    setSelectedAll(false);
  };

  const getActiveContent = () => {
    switch (activeSection) {
      case 'department_inbox': return courriers.department_inbox;
      case 'pending_validation': return courriers.pending_validation;
      case 'department_archive': return courriers.department_archive;
      default: return [];
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'validé': return 'bg-green-100 text-green-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'nouveau': return 'bg-blue-100 text-blue-800';
      case 'brouillon': return 'bg-gray-100 text-gray-800';
      case 'archivé': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (today.toDateString() === messageDate.toDateString()) {
      // Today: show time
      return messageDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit', 
        minute: '2-digit'
      });
    } else if (today.getFullYear() === messageDate.getFullYear()) {
      // This year: show day and month
      return messageDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short'
      });
    } else {
      // Different year: show date with year
      return messageDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const toggleSelectAll = () => {
    const newSelectedState = !selectedAll;
    setSelectedAll(newSelectedState);
    
    if (newSelectedState) {
      setSelectedItems(getActiveContent().map(item => item._id));
    } else {
      setSelectedItems([]);
    }
  };

  const toggleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const toggleStarItem = (itemId) => {
    // In a real app, this would update the database
    console.log(`Toggled star for item ${itemId}`);
  };

  const handleBulkArchive = () => {
    console.log(`Archiving items: ${selectedItems.join(', ')}`);
    setSelectedItems([]);
    setSelectedAll(false);
  };

  const handleBulkDelete = () => {
    console.log(`Deleting items: ${selectedItems.join(', ')}`);
    setSelectedItems([]);
    setSelectedAll(false);
  };

  const handleBulkValidate = () => {
    console.log(`Validating items: ${selectedItems.join(', ')}`);
    setSelectedItems([]);
    setSelectedAll(false);
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const renderSectionTabs = () => (
    <div className="flex mb-4 overflow-x-auto no-scrollbar">
      <button 
        onClick={() => handleSectionChange('department_inbox')}
        className={`flex items-center px-4 py-2 rounded-t-lg mx-1 transition-all ${activeSection === 'department_inbox' 
          ? 'bg-[#EAB308] text-white font-medium' 
          : `${darkMode ? 'bg-[#1F2024] text-[#AAAAAA]' : 'bg-white text-[#4C4C4C]'} hover:bg-[#EAB308]/10`}`}
      >
        <FaEnvelope className="mr-2" />
        Boîte départementale
        <span className="ml-2 bg-white text-[#EAB308] text-xs rounded-full px-2 py-0.5">{courriers.department_inbox.length}</span>
      </button>
      <button 
        onClick={() => handleSectionChange('pending_validation')}
        className={`flex items-center px-4 py-2 rounded-t-lg mx-1 transition-all ${activeSection === 'pending_validation' 
          ? 'bg-[#EAB308] text-white font-medium' 
          : `${darkMode ? 'bg-[#1F2024] text-[#AAAAAA]' : 'bg-white text-[#4C4C4C]'} hover:bg-[#EAB308]/10`}`}
      >
        <FaExclamationCircle className="mr-2" />
        En attente de validation
        <span className="ml-2 bg-white text-[#EAB308] text-xs rounded-full px-2 py-0.5">{courriers.pending_validation.length}</span>
      </button>
      <button 
        onClick={() => handleSectionChange('department_archive')}
        className={`flex items-center px-4 py-2 rounded-t-lg mx-1 transition-all ${activeSection === 'department_archive' 
          ? 'bg-[#EAB308] text-white font-medium' 
          : `${darkMode ? 'bg-[#1F2024] text-[#AAAAAA]' : 'bg-white text-[#4C4C4C]'} hover:bg-[#EAB308]/10`}`}
      >
        <FaArchive className="mr-2" />
        Archives départementales
        <span className="ml-2 bg-white text-[#EAB308] text-xs rounded-full px-2 py-0.5">{courriers.department_archive.length}</span>
      </button>
    </div>
  );

  const renderMailList = () => {
    const activeContent = getActiveContent();
    const filteredContent = activeContent.filter(item => 
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sender?.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.receiver?.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-[#1F2024]' : 'bg-white'}`}>
        <div className="p-4 flex justify-between items-center border-b border-gray-700/20">
          <div className="flex items-center">
            {selectedItems.length > 0 ? (
              <div className="flex space-x-2">
                <button 
                  onClick={handleBulkArchive}
                  className="p-2 rounded-lg flex items-center text-sm bg-[#805AD5] text-white"
                >
                  <FaArchive className="mr-2" /> Archiver
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="p-2 rounded-lg flex items-center text-sm bg-red-500 text-white"
                >
                  <FaTrash className="mr-2" /> Supprimer
                </button>
                {activeSection === 'pending_validation' && userData?.role === 'directeur' && (
                  <button 
                    onClick={handleBulkValidate}
                    className="p-2 rounded-lg flex items-center text-sm bg-[#38B2AC] text-white"
                  >
                    <FaCheck className="mr-2" /> Valider
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <button 
                  onClick={toggleSelectAll}
                  className={`p-2 rounded-lg mr-2 ${darkMode ? 'hover:bg-[#131313]' : 'hover:bg-gray-100'}`}
                >
                  {selectedAll ? <FaCheckSquare className="text-[#EAB308]" /> : <FaRegCheckSquare className={darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'} />}
                </button>
                <button 
                  onClick={handleSort}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-[#131313] text-[#AAAAAA]' : 'hover:bg-gray-100 text-[#4C4C4C]'}`}
                >
                  <FaEllipsisV />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`relative rounded-lg overflow-hidden ${darkMode ? 'bg-[#131313]' : 'bg-gray-100'}`}>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`p-2 pl-10 pr-4 outline-none w-64 ${darkMode ? 'bg-[#131313] text-white placeholder-[#AAAAAA]' : 'bg-gray-100 text-[#4C4C4C] placeholder-gray-500'}`}
              />
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'}`} />
            </div>
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-[#131313] text-[#AAAAAA]' : 'hover:bg-gray-100 text-[#4C4C4C]'}`}
            >
              <FaFilter />
            </button>
          </div>
        </div>
        
        {filterOpen && (
          <div className={`p-4 border-b ${darkMode ? 'bg-[#131313] border-gray-700/20' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex flex-wrap gap-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'}`}>
                  Statut
                </label>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">Validé</button>
                  <button className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">En attente</button>
                  <button className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Nouveau</button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'}`}>
                  Priorité
                </label>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800">Haute</button>
                  <button className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-800">Moyenne</button>
                  <button className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">Basse</button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'}`}>
                  Département
                </label>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Finance</button>
                  <button className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">RH</button>
                  <button className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Opérations</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
          {filteredContent.length > 0 ? (
            filteredContent.map((item) => (
              <div 
                key={item._id} 
                className={`group flex items-center p-3 border-b border-gray-700/20 ${
                  !item.isRead && activeSection === 'department_inbox' ? `${darkMode ? 'bg-[#131313]/50' : 'bg-blue-50/50'}` : ''
                } ${
                  darkMode ? 'hover:bg-[#131313]/80' : 'hover:bg-gray-100'
                } transition-all duration-200`}
              >
                <div className="flex items-center min-w-[50px]">
                  <button 
                    onClick={() => toggleSelectItem(item._id)}
                    className={`p-1 rounded-lg mr-2 ${darkMode ? 'hover:bg-[#131313]' : 'hover:bg-gray-100'}`}
                  >
                    {selectedItems.includes(item._id) ? 
                      <FaCheckSquare className="text-[#EAB308]" /> : 
                      <FaRegCheckSquare className={darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'} />
                    }
                  </button>
                  <button 
                    onClick={() => toggleStarItem(item._id)}
                    className={`p-1 rounded-lg ${darkMode ? 'hover:bg-[#131313]' : 'hover:bg-gray-100'}`}
                  >
                    <FaStar className={item.isStarred ? 'text-[#EAB308]' : darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'} />
                  </button>
                </div>
                
                <div className="flex-grow ml-2">
                  <div className="flex items-center">
                    <h4 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-black'} ${!item.isRead && activeSection === 'department_inbox' ? 'font-bold' : ''}`}>
                      {item.subject}
                    </h4>
                    {item.attachments && item.attachments.length > 0 && (
                      <span className="ml-2">
                        <FaPaperclip className={darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'} size={12} />
                      </span>
                    )}
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusColor(item.status)}`}>
                      {item.status === 'validé' ? 'Validé' : 
                       item.status === 'en_attente' ? 'En attente' : 
                       item.status === 'nouveau' ? 'Nouveau' : 
                       item.status === 'brouillon' ? 'Brouillon' : 'Archivé'}
                    </span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                      {item.priority === 'high' ? 'Haute' : 
                       item.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <p className={`text-sm truncate ${darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'}`}>
                      {`De: ${item.sender?.fullName}`} - {item.excerpt}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={`text-sm ${darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'} mr-4`}>
                    {formatDate(item.createdAt || item.updatedAt || item.archivedAt)}
                  </span>
                  <div className="hidden group-hover:flex items-center space-x-1">
                    <button className="p-1.5 rounded-full hover:bg-[#38B2AC]/20 text-[#38B2AC]">
                      <FaDownload size={14} />
                    </button>
                    <button className="p-1.5 rounded-full hover:bg-[#805AD5]/20 text-[#805AD5]">
                      <FaArchive size={14} />
                    </button>
                    <button className="p-1.5 rounded-full hover:bg-[#E53E3E]/20 text-[#E53E3E]">
                      <FaTrash size={14} />
                    </button>
                    {activeSection === 'pending_validation' && userData?.role === 'directeur' && (
                      <button className="p-1.5 rounded-full hover:bg-[#38B2AC]/20 text-[#38B2AC]">
                        <FaCheck size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FaEnvelope className={`text-5xl mb-4 ${darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'}`} />
              <p className={`text-lg ${darkMode ? 'text-white' : 'text-black'}`}>Aucun message trouvé</p>
              <p className={`text-sm ${darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'}`}>
                {searchTerm ? "Essayez d'autres termes de recherche" : "Cette section est vide"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`container mx-auto px-4 py-6 ${darkMode ? 'text-white' : 'text-black'}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Courriers départementaux</h1>
          <p className={darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'}>
            {userData?.department} - {userData?.role === 'directeur' ? 'Directeur' : 'Employé'}
          </p>
        </div>
        {userData?.role === 'directeur' && (
          <button 
            className="px-4 py-2 rounded-lg bg-gradient-to-br from-[#EAB308] to-[#A78800] text-white flex items-center shadow-lg shadow-[#EAB308]/40 hover:scale-105 transition-all"
          >
            <FaPlus className="mr-2" /> Nouveau courrier départemental
          </button>
        )}
      </div>
      
      {renderSectionTabs()}
      {renderMailList()}
    </div>
  );
};

export default DepartmentView;