import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaUser, FaInfoCircle, FaShieldAlt, FaExclamationCircle, FaSignInAlt, FaAddressCard, 
  FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaDownload, FaKey, FaCheck, FaTimes, 
  FaUserShield, FaBuilding, FaEnvelope, FaCalendarAlt 
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

// Hardcoding initial user data from addUsers.js for plaintext passwords
const initialUsers = [
  { email: 'president@commune.org', password: 'president123', department: 'Présidence', permissions: ['create:courrier', 'read:courrier', 'update:courrier', 'delete:courrier', 'assign:courrier'], status: 'active' },
  { email: 'dgs@commune.org', password: 'dgs123', department: 'Direction Générale des Services', permissions: ['create:courrier', 'read:courrier', 'update:courrier', 'assign:courrier'], status: 'active' },
  { email: 'bo@commune.org', password: 'bo123', department: "Bureau d'Ordre", permissions: ['create:courrier', 'read:courrier', 'update:courrier'], status: 'active' },
  { email: 'sc@commune.org', password: 'sc123', department: 'Secrétariat du Conseil', permissions: ['read:courrier', 'update:courrier'], status: 'active' },
  { email: 'sp@commune.org', password: 'sp123', department: 'Secrétariat du Président', permissions: ['read:courrier', 'update:courrier'], status: 'active' },
  { email: 'rh@commune.org', password: 'rh123', department: 'Ressources Humaines', permissions: ['create:courrier', 'read:courrier', 'update:courrier'], status: 'active' },
  { email: 'dfm@commune.org', password: 'dfm123', department: 'Division Financière', permissions: ['read:courrier', 'update:courrier'], status: 'active' },
  { email: 'dt@commune.org', password: 'dt123', department: 'Division Technique', permissions: ['read:courrier', 'update:courrier'], status: 'active' },
  { email: 'bh@commune.org', password: 'bh123', department: "Bureau d'Hygiène", permissions: ['read:courrier', 'update:courrier'], status: 'active' },
  { email: 'pc@commune.org', password: 'pc123', department: 'Partenariat et Coopération', permissions: ['read:courrier', 'update:courrier'], status: 'active' },
  { email: 'ic@commune.org', password: 'ic123', department: 'Informatique et Communication', permissions: ['read:courrier', 'update:courrier'], status: 'active' },
  { email: 'admin@commune.org', password: 'admin123', department: 'Administration', permissions: ['create:courrier', 'read:courrier', 'update:courrier', 'delete:courrier', 'assign:courrier', 'manage:users'], status: 'active' }
];

const UserManagement = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const mainBg = darkMode ? 'bg-[#131313]' : 'bg-[#FFFFFF]';
  const cardBg = darkMode ? 'bg-[#1F2024]' : 'bg-[#F5F5F5]';
  const textColor = darkMode ? 'text-[#FFFFFF]' : 'text-[#131313]';
  const subTextColor = darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]';
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    permissions: []
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const permissions = [
    { value: 'create:courrier', label: 'Créer' },
    { value: 'read:courrier', label: 'Lire' },
    { value: 'update:courrier', label: 'Modifier' },
    { value: 'delete:courrier', label: 'Supprimer' },
    { value: 'assign:courrier', label: 'Assigner' },
    { value: 'manage:users', label: 'Gérer utilisateurs' }
  ];
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedDepartmentFilter, users]);
  
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const usersData = Array.isArray(response.data) ? response.data : [];
      // Merge with initialUsers to include plaintext passwords
      const mergedUsers = usersData.map(user => {
        const initialUser = initialUsers.find(u => u.email === user.email);
        return { ...user, password: initialUser ? initialUser.password : user.password || 'N/A' };
      });
      setUsers(mergedUsers);
      setFilteredUsers(mergedUsers);
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login/admin');
      }
      setApiError(error.response?.data?.error || error.message);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFilters = () => {
    let result = Array.isArray(users) ? [...users] : [];
    
    if (searchTerm) {
      result = result.filter(user => 
        (user.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDepartmentFilter) {
      result = result.filter(user => user.department === selectedDepartmentFilter);
    }
    
    setFilteredUsers(result);
  };

  const exportToCSV = () => {
    if (!filteredUsers.length) {
      alert('Aucun département à exporter.');
      return;
    }

    const headers = ['Nom de Département', 'Email', 'Mot de passe', 'Statut', 'Date de Création', 'Dernière Mise à Jour'];
    
    const rows = filteredUsers.map(user => [
      `"${user.department || 'N/A'}"`,
      `"${user.email || 'N/A'}"`,
      `"${user.password || 'N/A'}"`,
      `"${user.status === 'active' ? 'Actif' : 'Inactif'}"`,
      `"${user.createdAt ? new Date(user.createdAt).toLocaleString('fr-FR') : 'N/A'}"`,
      `"${user.updatedAt ? new Date(user.updatedAt).toLocaleString('fr-FR') : 'N/A'}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `departments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      department: '',
      permissions: ['read:courrier']
    });
    setFormErrors({});
    setShowModal(true);
  };
  
  const openEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      email: user.email || '',
      password: '',
      confirmPassword: '',
      department: user.department || '',
      permissions: Array.isArray(user.permissions) ? user.permissions : ['read:courrier']
    });
    setFormErrors({});
    setShowModal(true);
  };
  
  const openDeleteConfirm = (user) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };
  
  const openDetailsModal = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handlePermissionChange = (permission) => {
    let updatedPermissions = Array.isArray(formData.permissions) ? [...formData.permissions] : [];
    
    if (updatedPermissions.includes(permission)) {
      updatedPermissions = updatedPermissions.filter(p => p !== permission);
    } else {
      updatedPermissions.push(permission);
    }
    
    setFormData({
      ...formData,
      permissions: updatedPermissions
    });
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (modalMode === 'add') {
      if (!formData.password) {
        errors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 6) {
        errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    } else if (modalMode === 'edit' && formData.password) {
      if (formData.password.length < 6) {
        errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }
    
    if (!formData.department.trim()) errors.department = 'Le département est requis';
    if (!Array.isArray(formData.permissions) || formData.permissions.length === 0) {
      errors.permissions = 'Au moins une permission est requise';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setApiError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      let response;
      
      if (modalMode === 'add') {
        response = await axios.post(
          'http://localhost:5000/api/auth/register',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const newUser = { 
          ...response.data, 
          password: formData.password // Ensure plaintext password is included
        };
        setUsers(prev => [...prev, newUser]);
      } else if (modalMode === 'edit') {
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
          delete dataToUpdate.confirmPassword;
        }
        
        response = await axios.put(
          `http://localhost:5000/api/users/${selectedUser._id}`,
          dataToUpdate,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        const updatedUser = dataToUpdate.password 
          ? { ...response.data, password: dataToUpdate.password } 
          : { ...response.data, password: selectedUser.password }; // Preserve existing password if not updated
        setUsers(prev => prev.map(user => 
          user._id === selectedUser._id ? updatedUser : user
        ));
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error(`Error ${modalMode === 'add' ? 'creating' : 'updating'} department:`, error);
      setApiError(error.response?.data?.error || error.message || `Une erreur est survenue lors de ${modalMode === 'add' ? 'la création' : 'la mise à jour'} du département`);
    }
  };
  
  const handleResetPassword = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await axios.post(
        `http://localhost:5000/api/users/${userId}/reset-password`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const newPassword = response.data.newPassword;
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, password: newPassword } : user
      ));
      alert(`Mot de passe réinitialisé. Nouveau mot de passe: ${newPassword}`);
    } catch (error) {
      console.error('Error resetting password:', error);
      setApiError(error.response?.data?.error || error.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe');
    }
  };
  
  const handleDeleteUser = async () => {
    if (!selectedUser?._id) {
      setApiError('Aucun département sélectionné pour la suppression');
      setShowDeleteConfirm(false);
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setApiError('Veuillez vous reconnecter');
        navigate('/login/admin');
        return;
      }
  
      await axios.delete(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      setUsers(prev => prev.filter(user => user._id !== selectedUser._id));
      setShowDeleteConfirm(false);
      setApiError('');
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Erreur lors de la suppression';
      console.error('Delete error:', error.response?.data || error);
      setApiError(errorMsg);
    }
  };
  
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const response = await axios.patch(
        `http://localhost:5000/api/users/${userId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setUsers(prev => prev.map(user => 
        user._id === userId ? response.data : user
      ));
    } catch (error) {
      console.error('Error updating department status:', error);
      setApiError(error.response?.data?.error || error.message || 'Une erreur est survenue lors de la mise à jour du statut du département');
    }
  };
  
  const getStatusBadgeClass = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };
  
  return (
    <div className={`p-6 mt-[63px] ${mainBg} ${textColor} min-h-screen overflow-y-auto`}>
      <div className="mb-6 bg-[#EAB308] rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-white">Gestion des Départements</h1>
        <p className="text-white/80">Gérez les comptes des départements et leurs permissions.</p>
      </div>
      
      {apiError && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
          <p>{apiError}</p>
        </div>
      )}
      
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-1/2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className={subTextColor} />
          </div>
          <input
            type="text"
            placeholder="Rechercher un département..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={`pl-10 pr-4 py-2 w-full rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#EAB308] ${
              darkMode 
                ? 'bg-[#1F2024] border-gray-700 text-white focus:bg-[#2D2D34]' 
                : 'bg-white border-gray-300 text-gray-900 focus:bg-gray-50'
            }`}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={selectedDepartmentFilter}
            onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
            className={`rounded-lg border py-2 px-3 ${
              darkMode 
                ? 'bg-[#1F2024] border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Tous les départements</option>
            {users.map((user, index) => (
              <option key={index} value={user.department}>{user.department}</option>
            ))}
          </select>
          
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EAB308] hover:bg-[#D4AF37] text-white font-medium transition-colors"
          >
            <FaPlus /> Ajouter
          </button>
        </div>
      </div>
      
      <div 
        className="rounded-xl shadow-lg overflow-hidden border border-opacity-20 transition-transform hover:shadow-xl"
        style={{ borderColor: '#A78800', background: darkMode ? '#1F2024' : 'white' }}
      >
        <div className="p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold mb-1">Liste des Départements</h2>
            <p className={`text-sm ${subTextColor}`}>
              {filteredUsers.length} département{filteredUsers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={exportToCSV}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              title="Exporter en CSV"
            >
              <FaDownload size={14} />
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="loader animate-spin rounded-full border-t-4 border-[#EAB308] border-solid h-12 w-12"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nom de Département</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Mot de passe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/20">
                {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr 
                      key={user._id} 
                      className={`${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#EAB308] rounded-full flex items-center justify-center text-white">
                            {user.department?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium">{user.department || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{user.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{user.password || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(user.status)}`}
                        >
                          {user.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openDetailsModal(user)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Voir les détails"
                          >
                            <FaUser />
                          </button>
                          <button 
                            onClick={() => openEditModal(user)}
                            className="text-yellow-500 hover:text-yellow-700"
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleToggleUserStatus(user._id, user.status)}
                            className={user.status === 'active' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}
                            title={user.status === 'active' ? 'Désactiver' : 'Activer'}
                          >
                            {user.status === 'active' ? <FaTimes /> : <FaCheck />}
                          </button>
                          <button 
                            onClick={() => handleResetPassword(user._id)}
                            className="text-purple-500 hover:text-purple-700"
                            title="Réinitialiser le mot de passe"
                          >
                            <FaKey />
                          </button>
                          <button 
                            onClick={() => openDeleteConfirm(user)}
                            className="text-red-500 hover:text-red-700"
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center p-6">
                        <FaUser size={48} className={`${subTextColor} mb-4`} />
                        <p className="text-lg font-medium">Aucun département trouvé</p>
                        <p className={`text-sm ${subTextColor}`}>Ajustez vos filtres ou ajoutez de nouveaux départements</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div 
            className={`${darkMode ? 'bg-[#1F2024] text-white' : 'bg-white text-gray-900'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
            style={{ borderColor: '#A78800' }}
          >
            <div className="p-6 border-b border-gray-700/20">
              <h3 className="text-xl font-semibold">
                {modalMode === 'add' ? 'Ajouter un département' : 'Modifier le département'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom du Département</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-[#2D2D34] border-gray-700' : 'bg-white border-gray-300'
                    } ${formErrors.department ? 'border-red-500' : ''}`}
                    placeholder="Entrez le nom du département"
                  />
                  {formErrors.department && <p className="mt-1 text-sm text-red-500">{formErrors.department}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-[#2D2D34] border-gray-700' : 'bg-white border-gray-300'
                    } ${formErrors.email ? 'border-red-500' : ''}`}
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Mot de passe {modalMode === 'edit' && '(laisser vide pour ne pas changer)'}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-[#2D2D34] border-gray-700' : 'bg-white border-gray-300'
                    } ${formErrors.password ? 'border-red-500' : ''}`}
                  />
                  {formErrors.password && <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-[#2D2D34] border-gray-700' : 'bg-white border-gray-300'
                    } ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  {formErrors.confirmPassword && <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Permissions</label>
                {formErrors.permissions && <p className="mb-2 text-sm text-red-500">{formErrors.permissions}</p>}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {permissions.map((permission, index) => (
                    <div 
                      key={index}
                      onClick={() => handlePermissionChange(permission.value)}
                      className={`px-4 py-3 rounded-lg cursor-pointer flex items-center gap-2 border transition-colors ${
                        formData.permissions.includes(permission.value)
                          ? 'bg-[#EAB308] border-[#EAB308] text-white'
                          : `${darkMode ? 'bg-[#2D2D34] border-gray-700' : 'bg-gray-100 border-gray-200'}`
                      }`}
                    >
                      {formData.permissions.includes(permission.value) ? <FaCheck size={14} /> : <div className="w-[14px]"></div>}
                      <span>{permission.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 border-t border-gray-700/20 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#EAB308] hover:bg-[#D4AF37] text-white font-medium"
                >
                  {modalMode === 'add' ? 'Ajouter' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
          <div 
            className={`${darkMode ? 'bg-[#1F2024]' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
          >
            <div className="relative">
              <div className="bg-[#EAB308] h-32 rounded-t-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
                  <div className="absolute left-20 top-16 w-32 h-32 rounded-full bg-white opacity-10"></div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="absolute top-4 right-4 bg-black bg-opacity-20 text-white rounded-full p-2 hover:bg-opacity-30 transition-all"
                aria-label="Fermer"
              >
                <FaTimes />
              </button>
              
              <div className="absolute -bottom-16 left-10">
                <div className="h-32 w-32 bg-[#EAB308] rounded-full flex items-center justify-center text-white text-4xl shadow-xl border-4 border-white dark:border-[#1F2024]">
                  {selectedUser.department?.charAt(0)?.toUpperCase() || '?'}
                </div>
              </div>
              
              <div className="absolute bottom-2 left-48 text-white">
                <h3 className="text-2xl font-bold">{selectedUser.department || 'N/A'}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span>{selectedUser.email || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 pt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'} flex items-center gap-3`}>
                  <div className={`w-3 h-3 rounded-full ${selectedUser.status === 'active' ? 'bg-green-500' : 'bg-red-500'} relative`}>
                    {selectedUser.status === 'active' && (
                      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
                    )}
                  </div>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {selectedUser.status === 'active' ? 'Compte actif' : 'Compte inactif'}
                  </span>
                </div>
                
                <div className={`p-5 rounded-xl mb-6 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                  <h4 className="font-semibold text-lg mb-4 pb-2 border-b border-gray-700/20 flex items-center gap-2">
                    <FaAddressCard className="text-[#EAB308]" />
                    <span>Contact</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#EAB308] text-white">
                        <FaEnvelope />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Email</span>
                        <span className="truncate font-medium">{selectedUser.email || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#EAB308] text-white">
                        <FaBuilding />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Département</span>
                        <span className="font-medium">{selectedUser.department || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      openEditModal(selectedUser);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#EAB308] hover:bg-[#D4AF37] text-white font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    <FaEdit /> Modifier le profil
                  </button>
                  <button
                    onClick={() => handleResetPassword(selectedUser._id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    <FaKey /> Réinitialiser le mot de passe
                  </button>
                  <button
                    onClick={() => {
                      handleToggleUserStatus(selectedUser._id, selectedUser.status);
                      setShowDetailsModal(false);
                    }}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg ${
                      selectedUser.status === 'active'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                    }`}
                  >
                    {selectedUser.status === 'active' ? (
                      <>
                        <FaTimes /> Désactiver le compte
                      </>
                    ) : (
                      <>
                        <FaCheck /> Activer le compte
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <FaInfoCircle className="text-[#EAB308]" />
                    <span>Informations détaillées</span>
                  </h4>
                  <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl bg-black/5 backdrop-blur-sm">
                        <p className="text-sm text-gray-500 mb-1">ID Utilisateur</p>
                        <p className="font-medium truncate">{selectedUser._id || 'N/A'}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-black/5 backdrop-blur-sm">
                        <p className="text-sm text-gray-500 mb-1">Date de création</p>
                        <p className="font-medium flex items-center gap-2">
                          <FaCalendarAlt className="text-[#EAB308]" />
                          {selectedUser.createdAt
                            ? new Date(selectedUser.createdAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-black/5 backdrop-blur-sm">
                        <p className="text-sm text-gray-500 mb-1">Dernière mise à jour</p>
                        <p className="font-medium flex items-center gap-2">
                          <FaEdit className="text-[#EAB308]" />
                          {selectedUser.updatedAt
                            ? new Date(selectedUser.updatedAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <FaShieldAlt className="text-[#EAB308]" />
                    <span>Permissions</span>
                  </h4>
                  <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                    {Array.isArray(selectedUser.permissions) && selectedUser.permissions.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {selectedUser.permissions.map((permission, index) => {
                          const permLabel = permissions.find(p => p.value === permission)?.label || permission;
                          return (
                            <span 
                              key={index}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-white text-sm font-medium shadow-sm"
                            >
                              {permLabel}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-500 bg-black/5 rounded-xl">
                        <FaExclamationCircle className="text-[#EAB308] text-3xl mb-2" />
                        <span>Aucune permission attribuée</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className={`${darkMode ? 'bg-[#1F2024] text-white' : 'bg-white text-gray-900'} rounded-lg p-6`}>
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer le département {selectedUser?.department} ?</p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <div 
          className={`p-6 rounded-lg border border-opacity-50 ${
            darkMode ? 'bg-[#1F2024] border-gray-700' : 'bg-white border-gray-300'
          }`}
        >
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <FaUserShield className="text-[#EAB308]" />
            <span>Gestion des départements et des permissions</span>
          </h3>
          <p className={`mb-4 ${subTextColor}`}>
            Ce module vous permet de gérer tous les aspects des départements du système et leurs permissions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h4 className="font-medium mb-2">Rôles utilisateurs</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Président:</strong> Accès complet à toutes les fonctionnalités</li>
                <li><strong>DGS:</strong> Gestion administrative et supervision</li>
                <li><strong>Admin:</strong> Configuration technique et gestion des utilisateurs</li>
                <li><strong>Utilisateur:</strong> Accès limité en fonction de leur département</li>
              </ul>
            </div>
            <div className={`p-4 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h4 className="font-medium mb-2">Permissions</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Créer:</strong> Ajouter de nouveaux éléments</li>
                <li><strong>Lire:</strong> Afficher les informations</li>
                <li><strong>Modifier:</strong> Mettre à jour les informations existantes</li>
                <li><strong>Supprimer:</strong> Effacer des éléments</li>
                <li><strong>Valider:</strong> Approuver des actions ou des documents</li>
              </ul>
            </div>
            <div className={`p-4 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h4 className="font-medium mb-2">Permissions de communication</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Président:</strong> Tous les services (ID: "president")</li>
                <li><strong>DGS:</strong> Tous les services (ID: "dgs")</li>
                <li><strong>Bureau d'Ordre:</strong> DGS (ID: "bo")</li>
                <li><strong>Secrétariat du Conseil:</strong> Bureau d'Ordre, DGS (ID: "sc")</li>
                <li><strong>Secrétariat du Président:</strong> Bureau d'Ordre, DGS (ID: "sp")</li>
                <li><strong>Ressources Humaines:</strong> Bureau d'Ordre, DGS (ID: "rh")</li>
                <li><strong>Division Financière:</strong> Bureau d'Ordre, DGS (ID: "dfm")</li>
                <li><strong>Division Technique:</strong> Bureau d'Ordre, DGS (ID: "dt")</li>
                <li><strong>Bureau d'Hygiène:</strong> Bureau d'Ordre, DGS (ID: "bh")</li>
                <li><strong>Partenariat et Coopération:</strong> Bureau d'Ordre, DGS (ID: "pc")</li>
                <li><strong>Informatique et Communication:</strong> Bureau d'Ordre, DGS (ID: "ic")</li>
                <li><strong>Administrateur:</strong> Tous les services, gère le système (ID: "admin")</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;