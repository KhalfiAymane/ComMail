import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaUpload, FaDownload, FaClipboardList, FaArchive, FaEnvelope, 
  FaArrowUp, FaArrowDown, FaEye, FaCheck, FaBell, 
  FaUserTie, FaBuilding, FaFileSignature, FaCalendarCheck, 
  FaUsers, FaMoneyBillWave, FaTools, FaBriefcaseMedical, 
  FaHandshake, FaLaptopCode, FaCog, FaShareSquare, FaTasks
} from 'react-icons/fa';
import axios from 'axios';

const roles = [
  { id: "president", title: "PRÉSIDENT", icon: <FaUserTie className="text-blue-400" /> },
  { id: "dgs", title: "DIRECTION GÉNÉRALE DES SERVICES", icon: <FaBuilding className="text-green-400" /> },
  { id: "bo", title: "BUREAU D’ORDRE", icon: <FaClipboardList className="text-red-400" /> },
  { id: "sc", title: "SECRÉTARIAT DU CONSEIL", icon: <FaFileSignature className="text-purple-400" /> },
  { id: "sp", title: "SECRÉTARIAT DU PRÉSIDENT", icon: <FaCalendarCheck className="text-yellow-400" /> },
  { id: "rh", title: "RESSOURCES HUMAINES", icon: <FaUsers className="text-orange-400" /> },
  { id: "dfm", title: "DIVISION FINANCIÈRE", icon: <FaMoneyBillWave className="text-green-300" /> },
  { id: "dt", title: "DIVISION TECHNIQUE", icon: <FaTools className="text-gray-400" /> },
  { id: "bh", title: "BUREAU D’HYGIÈNE", icon: <FaBriefcaseMedical className="text-blue-300" /> },
  { id: "pc", title: "PARTENARIAT ET COOPÉRATION", icon: <FaHandshake className="text-pink-400" /> },
  { id: "ic", title: "INFORMATIQUE ET COMMUNICATION", icon: <FaLaptopCode className="text-teal-400" /> },
  { id: "admin", title: "ADMINISTRATEUR", icon: <FaCog className="text-gray-300" /> },
];

const DirecteurDashboardOverview = () => {
  const { userData, setIsModalOpen } = useOutletContext();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ sent: 0, received: 0, pending: 0, archived: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const department = userData?.department || 'Bureau d’Ordre';
  const departmentSlug = department.toLowerCase().replace(/ /g, '-').replace(/’/g, '-');
  const role = userData?.role || 'bo';
  const isAdmin = role === 'admin';

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Utilisateur non authentifié');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const profileResponse = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentUserId = profileResponse.data._id;

      // Fetch all mails and filter client-side (optimize with backend later)
      const allMailsResponse = await axios.get('http://localhost:5000/api/mails/mails-and-counts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { courriers, counts } = allMailsResponse.data;

      // Stats
      setStats({
        sent: counts.sent || 0,
        received: counts.inbox || 0,
        pending: counts.pendingValidation || 0,
        archived: counts.archives || 0,
      });

      // Filter activities relevant to this department
      const relevantActivity = courriers
        .filter(mail => {
          const sentByDept = mail.sender?._id.toString() === currentUserId;
          const receivedByDept = mail.receiverDepartments.includes(department);
          const historyActions = mail.history || [];
          const deptInvolvedInHistory = historyActions.some(action => 
            action.user?.toString() === currentUserId && 
            ['forwarded', 'assigned', 'status_changed', 'deleted', 'archived'].includes(action.action)
          );

          if (isAdmin) return true; // Admins see all
          return sentByDept || receivedByDept || deptInvolvedInHistory;
        })
        .map(mail => {
          const latestHistory = mail.history?.slice(-1)[0] || {};
          let type = 'received';
          let actionLabel = mail.status || 'nouveau';

          if (mail.sender?._id.toString() === currentUserId) {
            type = 'sent';
          } else if (latestHistory.action === 'forwarded') {
            type = 'forwarded';
            actionLabel = 'Transféré';
          } else if (latestHistory.action === 'assigned') {
            type = 'assigned';
            actionLabel = 'Assigné';
          } else if (latestHistory.action === 'status_changed') {
            type = 'status_changed';
            actionLabel = mail.status === 'validé' ? 'Validé' : 'Modifié';
          } else if (latestHistory.action === 'archived') {
            type = 'archived';
            actionLabel = 'Archivé';
          } else if (latestHistory.action === 'deleted') {
            type = 'deleted';
            actionLabel = 'Supprimé';
          }

          return {
            id: mail._id,
            subject: mail.subject,
            sender: mail.sender?.department || 'Unknown',
            receiver: mail.receiverDepartments.join(', '),
            date: mail.createdAt,
            status: actionLabel,
            type,
          };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

      setRecentActivity(relevantActivity);

      // Notifications (unread received mails)
      const notificationsData = courriers
        .filter(mail => mail.receiverDepartments.includes(department) && !mail.isRead)
        .map(mail => ({
          id: mail._id,
          text: `Nouveau courrier reçu: ${mail.subject}`,
          urgent: mail.type === 'urgent',
          time: formatTimeAgo(new Date(mail.createdAt)),
        }))
        .slice(0, 3);
      setNotifications(notificationsData);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) fetchDashboardData();
  }, [userData]);

  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.round(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return formatDate(date);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'nouveau': return darkMode ? 'text-blue-400' : 'text-blue-600';
      case 'validé': return darkMode ? 'text-green-400' : 'text-green-600';
      case 'en_attente': return darkMode ? 'text-amber-400' : 'text-amber-600';
      case 'archivé': return darkMode ? 'text-purple-400' : 'text-purple-600';
      case 'transféré': return darkMode ? 'text-cyan-400' : 'text-cyan-600';
      case 'assigné': return darkMode ? 'text-orange-400' : 'text-orange-600';
      case 'modifié': return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'supprimé': return darkMode ? 'text-red-400' : 'text-red-600';
      default: return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getStatusBg = (status) => {
    switch (status.toLowerCase()) {
      case 'nouveau': return darkMode ? 'bg-blue-900/30' : 'bg-blue-100';
      case 'validé': return darkMode ? 'bg-green-900/30' : 'bg-green-100';
      case 'en_attente': return darkMode ? 'bg-amber-900/30' : 'bg-amber-100';
      case 'archivé': return darkMode ? 'bg-purple-900/30' : 'bg-purple-100';
      case 'transféré': return darkMode ? 'bg-cyan-900/30' : 'bg-cyan-100';
      case 'assigné': return darkMode ? 'bg-orange-900/30' : 'bg-orange-100';
      case 'modifié': return darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100';
      case 'supprimé': return darkMode ? 'bg-red-900/30' : 'bg-red-100';
      default: return darkMode ? 'bg-gray-900/30' : 'bg-gray-100';
    }
  };

  const statsCards = [
    { title: 'Sent', value: stats.sent, icon: <FaUpload />, color: '#A78800', bgColor: '#A78800/10', trend: stats.sent > 0 ? 5 : 0 },
    { title: 'Received', value: stats.received, icon: <FaDownload />, color: '#3B82F6', bgColor: '#3B82F6/10', trend: stats.received > 0 ? 3 : 0 },
    { title: 'Pending', value: stats.pending, icon: <FaClipboardList />, color: '#F59E0B', bgColor: '#F59E0B/10', trend: stats.pending > 0 ? -2 : 0 },
    { title: 'Archived', value: stats.archived, icon: <FaArchive />, color: '#8B5CF6', bgColor: '#8B5CF6/10', trend: stats.archived > 0 ? 10 : 0 },
  ];

  const handleView = (id) => navigate(`/dashboard/${departmentSlug}/courrier/${id}`);
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/mails/${id}/validate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error approving mail:', err);
      setError('Erreur lors de la validation du courrier');
    }
  };
  const handleArchive = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/mails/${id}/status`, { section: 'archives' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error archiving mail:', err);
      setError('Erreur lors de l’archivage du courrier');
    }
  };

  const renderHeader = () => {
    const userRole = roles.find(r => r.id === role) || roles[0];
    return (
      <div className="mb-8">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#A78800] to-[#8A6D00] shadow-lg">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">
                Welcome back, {(userData?.fullName || userRole.title).split(' ')[0]}
              </h1>
              <p className="text-white/80">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStatsGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {statsCards.map((card, index) => (
        <div key={index} className={`relative overflow-hidden rounded-2xl group ${darkMode ? 'bg-[#1F2024]' : 'bg-white'} transition-all duration-300 transform hover:translate-y-[-5px] hover:shadow-xl border border-transparent hover:border-${card.color}/50`}>
          <div className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className={darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'}>{card.title}</p>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
                <div className={`flex items-center mt-1 ${card.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {card.trend >= 0 ? <FaArrowUp className="mr-1 text-xs" /> : <FaArrowDown className="mr-1 text-xs" />}
                  <span className="text-xs font-medium">{Math.abs(card.trend)}%</span>
                </div>
              </div>
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${darkMode ? 'bg-[#131313]' : 'bg-gray-100'} group-hover:bg-[${card.color}] transition-colors duration-300`} style={{ background: `${darkMode ? '#131313' : '#F9FAFB'}`, color: card.color }}>
                {card.icon}
              </div>
            </div>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} style={{ backgroundColor: card.color }}></div>
        </div>
      ))}
    </div>
  );

  const renderQuickActions = () => {
    const quickActions = isAdmin
      ? [
          { icon: <FaEnvelope />, label: 'New Courrier', action: () => setIsModalOpen(true), color: '#A78800', hoverColor: '#8A6D00' },
          { icon: <FaUsers />, label: 'User Management', link: '/admin/users', color: '#3B82F6', badge: null },
          { icon: <FaClipboardList />, label: 'Courrier Management', link: '/admin/courriers', color: '#F59E0B', badge: stats.pending },
          { icon: <FaBell />, label: 'Notifications', link: '/admin/notifications', color: '#8B5CF6', badge: notifications.length },
        ]
      : [
          { icon: <FaEnvelope />, label: 'New Courrier', action: () => setIsModalOpen(true), color: '#A78800', hoverColor: '#8A6D00' },
          { icon: <FaDownload />, label: 'Inbox', link: `/dashboard/${departmentSlug}/inbox`, color: '#3B82F6', badge: stats.received },
          { icon: <FaTasks />, label: 'Pending', link: `/dashboard/${departmentSlug}/pending`, color: '#F59E0B', badge: stats.pending },
          { icon: <FaArchive />, label: 'Archive', link: `/dashboard/${departmentSlug}/archived`, color: '#8B5CF6', badge: null },
        ];

    return (
      <div className={`rounded-2xl ${darkMode ? 'bg-[#1F2024]' : 'bg-white'} p-6 mb-8`}>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.link ? () => navigate(action.link) : action.action}
              className={`group flex flex-col items-center justify-center py-4 px-3 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 border border-transparent hover:border-[${action.color}] ${action.action ? `bg-[${action.color}] text-white hover:bg-[${action.hoverColor || action.color + '80'}]` : `${darkMode ? 'bg-[#131313] hover:bg-[#1F2024]' : 'bg-gray-100 hover:bg-gray-200'}`}`}
            >
              <span className="text-xl mb-1" style={{ color: action.action ? 'white' : action.color }}>{action.icon}</span>
              <span className="text-sm mt-1">{action.label}</span>
              {action.badge > 0 && (
                <span className={`mt-1 px-2 py-0.5 text-xs bg-[${action.color}] text-white rounded-full`}>
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderActivityTable = () => (
    <div className={`rounded-2xl ${darkMode ? 'bg-[#1F2024]' : 'bg-white'} p-6 mb-8`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Activity</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className={`${darkMode ? 'bg-[#131313]' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className="py-3 px-4 text-left font-medium">Action</th>
              <th className="py-3 px-4 text-left font-medium">Subject</th>
              <th className="py-3 px-4 text-left font-medium">From/To</th>
              <th className="py-3 px-4 text-left font-medium">Date</th>
              <th className="py-3 px-4 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((item) => (
              <tr key={item.id} className={`group border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:${darkMode ? 'bg-[#131313]/50' : 'bg-gray-50'} transition-colors duration-300`}>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBg(item.status)} ${getStatusColor(item.status)}`}>
                    {item.type === 'sent' && <FaUpload className="mr-1" />}
                    {item.type === 'received' && <FaDownload className="mr-1" />}
                    {item.type === 'forwarded' && <FaShareSquare className="mr-1" />}
                    {item.type === 'assigned' && <FaTasks className="mr-1" />}
                    {item.type === 'status_changed' && <FaCheck className="mr-1" />}
                    {item.type === 'archived' && <FaArchive className="mr-1" />}
                    {item.type === 'deleted' && <FaTrash className="mr-1" />}
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium">{item.subject}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    {item.type === 'sent' ? (
                      <>
                        <span className="bg-green-100 text-green-600 p-1 rounded-full mr-2">
                          <FaUpload className="text-xs" />
                        </span>
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.receiver}</span>
                      </>
                    ) : (
                      <>
                        <span className="bg-blue-100 text-blue-600 p-1 rounded-full mr-2">
                          <FaDownload className="text-xs" />
                        </span>
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.sender}</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">{formatDate(item.date)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button 
                      onClick={() => handleView(item.id)} 
                      className={`p-2 rounded-full ${darkMode ? 'bg-[#131313] hover:bg-blue-600' : 'bg-gray-100 hover:bg-blue-500'} hover:text-white transition-colors duration-300`} 
                      title="View"
                    >
                      <FaEye className="text-sm" />
                    </button>
                    {item.status.toLowerCase() !== 'validé' && ['dgs', 'admin', 'president'].includes(role) && (
                      <button 
                        onClick={() => handleApprove(item.id)} 
                        className={`p-2 rounded-full ${darkMode ? 'bg-[#131313] hover:bg-green-600' : 'bg-gray-100 hover:bg-green-500'} hover:text-white transition-colors duration-300`} 
                        title="Approve"
                      >
                        <FaCheck className="text-sm" />
                      </button>
                    )}
                    {item.status.toLowerCase() !== 'archivé' && (
                      <button 
                        onClick={() => handleArchive(item.id)} 
                        className={`p-2 rounded-full ${darkMode ? 'bg-[#131313] hover:bg-purple-600' : 'bg-gray-100 hover:bg-purple-500'} hover:text-white transition-colors duration-300`} 
                        title="Archive"
                      >
                        <FaArchive className="text-sm" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a 
        href={`/dashboard/${departmentSlug}/activity`} 
        className={`mt-6 block text-center p-3 rounded-lg text-sm ${darkMode ? 'bg-[#131313] text-[#AAAAAA]' : 'bg-gray-100 text-[#4C4C4C]'} hover:bg-[#A78800]/10 hover:text-[#A78800] transition-colors duration-300 border border-transparent hover:border-[#A78800]/30`}
        onClick={(e) => { e.preventDefault(); navigate(`/dashboard/${departmentSlug}/activity`); }}
      >
        View All Activity
      </a>
    </div>
  );

  const renderNotifications = () => (
    <div className={`rounded-2xl ${darkMode ? 'bg-[#1F2024]' : 'bg-white'} p-6 mb-8`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Notifications</h2>
        <span className="px-3 py-1 text-xs font-medium bg-[#A78800] text-white rounded-full">
          {notifications.length} New
        </span>
      </div>
      <div className="grid gap-3">
        {notifications.map((note) => (
          <div 
            key={note.id} 
            className={`group p-4 rounded-xl transition-all duration-300 transform hover:translate-x-2 ${note.urgent ? darkMode ? 'bg-[#A78800]/10 border-l-4 border-[#A78800]' : 'bg-amber-50 border-l-4 border-[#A78800]' : darkMode ? 'bg-[#131313]' : 'bg-gray-50'}`}
          >
            <div className="flex items-start">
              <div className={`p-2.5 rounded-lg mr-4 ${note.urgent ? 'bg-[#A78800]/20 text-[#A78800]' : darkMode ? 'bg-[#1F2024] text-[#AAAAAA]' : 'bg-white text-[#4C4C4C]'} group-hover:bg-[#A78800] group-hover:text-white transition-colors duration-300`}>
                <FaBell className="text-lg" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{note.text}</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'}`}>{note.time}</p>
              </div>
              {note.urgent && (
                <a 
                  href={`/dashboard/${departmentSlug}/pending`} 
                  className="px-3 py-1 text-xs font-medium rounded-full bg-[#A78800] text-white hover:bg-[#8A6D00] transition-colors duration-300"
                  onClick={(e) => { e.preventDefault(); navigate(`/dashboard/${departmentSlug}/pending`); }}
                >
                  Action
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <a 
        href={`/dashboard/${departmentSlug}/notifications`} 
        className={`mt-4 block text-center p-3 rounded-lg text-sm ${darkMode ? 'bg-[#131313] text-[#AAAAAA]' : 'bg-gray-100 text-[#4C4C4C]'} hover:bg-[#A78800]/10 hover:text-[#A78800] transition-colors duration-300 border border-transparent hover:border-[#A78800]/30`}
        onClick={(e) => { e.preventDefault(); navigate(`/dashboard/${departmentSlug}/notifications`); }}
      >
        View All Notifications
      </a>
    </div>
  );

  if (loading) {
    return <div className={`p-6 ${darkMode ? 'bg-[#131313]' : 'bg-[#F5F5F5]'} min-h-screen text-center`}>Chargement...</div>;
  }

  if (error) {
    return <div className={`p-6 ${darkMode ? 'bg-[#131313]' : 'bg-[#F5F5F5]'} min-h-screen text-center`}>{error}</div>;
  }

  return (
    <>
      {renderHeader()}
      {renderStatsGrid()}
      {renderQuickActions()}
      {renderActivityTable()}
      {renderNotifications()}
    </>
  );
};

export default DirecteurDashboardOverview;