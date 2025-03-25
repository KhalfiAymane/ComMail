import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { FaUpload, FaDownload, FaClipboardList, FaArchive, FaEnvelope, FaArrowUp, FaArrowDown, FaEye, FaCheck, FaBell } from 'react-icons/fa';

const DirecteurDashboardOverview = () => {
  const { userData, setIsModalOpen } = useOutletContext();
  const { darkMode } = useTheme();

  const isDGS = userData?.role === 'dgs';
  const isBO = userData?.role === 'bo';

  // Dynamic stats based on role
  const stats = isDGS
    ? { sent: 42, received: 58, pending: 12, archived: 23 } // DGS stats
    : { sent: 25, received: 10, pending: 8, archived: 15 }; // BO stats (reduced received since BO only gets from specific senders)

  const statsCards = [
    { title: "Sent", value: stats.sent, icon: <FaUpload />, color: "#A78800", bgColor: "#A78800/10", trend: isDGS ? 8.5 : 5.2 },
    { title: "Received", value: stats.received, icon: <FaDownload />, color: "#3B82F6", bgColor: "#3B82F6/10", trend: isDGS ? 12.3 : 2.8 },
    { title: "Pending", value: stats.pending, icon: <FaClipboardList />, color: "#F59E0B", bgColor: "#F59E0B/10", trend: isDGS ? -4.2 : -3.1 },
    { title: "Archived", value: stats.archived, icon: <FaArchive />, color: "#8B5CF6", bgColor: "#8B5CF6/10", trend: isDGS ? 15.7 : 10.4 },
  ];

  // Dynamic activity based on role
  const recentActivity = isDGS
    ? [
        { id: '1', subject: 'Rapport Q1 2025', sender: 'Khadija Lamrani', date: '2025-03-16', status: 'nouveau', type: 'received' },
        { id: '2', subject: 'Directive RH', receiver: 'Equipe RH', date: '2025-03-15', status: 'validé', type: 'sent' },
        { id: '3', subject: 'Demande Budget', sender: 'Finance Dept', date: '2025-03-14', status: 'en_attente', type: 'received' },
      ]
    : [
        { id: '1', subject: 'Ordre du Jour', sender: 'DGS', date: '2025-03-16', status: 'nouveau', type: 'received' },
        { id: '2', subject: 'Courrier Sortant', receiver: 'DGS', date: '2025-03-15', status: 'validé', type: 'sent' },
        { id: '3', subject: 'Enregistrement', sender: 'DGS', date: '2025-03-14', status: 'en_attente', type: 'received' },
      ];

  const notifications = isDGS
    ? [
        { id: '1', text: '3 courriers await your validation', urgent: true, time: '15 min ago' },
        { id: '2', text: 'New courrier received from Legal', urgent: false, time: '2 hours ago' },
      ]
    : [
        { id: '1', text: '2 courriers from DGS need processing', urgent: true, time: '10 min ago' },
        { id: '2', text: 'Pending registration update', urgent: false, time: '1 hour ago' },
      ];

  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const getStatusColor = (status) => {
    switch (status) {
      case 'nouveau': return darkMode ? 'text-blue-400' : 'text-blue-600';
      case 'validé': return darkMode ? 'text-green-400' : 'text-green-600';
      case 'en_attente': return darkMode ? 'text-amber-400' : 'text-amber-600';
      case 'archivé': return darkMode ? 'text-purple-400' : 'text-purple-600';
      default: return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };
  const getStatusBg = (status) => {
    switch (status) {
      case 'nouveau': return darkMode ? 'bg-blue-900/30' : 'bg-blue-100';
      case 'validé': return darkMode ? 'bg-green-900/30' : 'bg-green-100';
      case 'en_attente': return darkMode ? 'bg-amber-900/30' : 'bg-amber-100';
      case 'archivé': return darkMode ? 'bg-purple-900/30' : 'bg-purple-100';
      default: return darkMode ? 'bg-gray-900/30' : 'bg-gray-100';
    }
  };

  const renderHeader = () => (
    <div className="mb-8">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#A78800] to-[#8A6D00] shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-white">
          Welcome back, {(userData?.fullName || (isDGS ? 'Directeur' : 'Bureau d’Ordre')).split(' ')[0]}
        </h1>
        <p className="text-white/80">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
    </div>
  );

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
  );const renderQuickActions = () => (
    <div className={`rounded-2xl ${darkMode ? 'bg-[#1F2024]' : 'bg-white'} p-6 mb-8`}>
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-3">
        <button onClick={() => setIsModalOpen(true)} className="group flex flex-col items-center justify-center py-4 px-3 rounded-xl bg-[#A78800] text-white transition-all duration-300 hover:bg-[#8A6D00] hover:shadow-lg transform hover:scale-105">
          <FaEnvelope className="text-xl mb-1" />
          <span className="text-sm mt-1">New Courrier</span>
        </button>
        <a href={`/dashboard/${userData?.department || 'Bureau d’Ordre'}/inbox`} className={`group flex flex-col items-center justify-center py-4 px-3 rounded-xl ${darkMode ? 'bg-[#131313] hover:bg-[#1F2024]' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-300 hover:shadow-lg transform hover:scale-105 border border-transparent hover:border-[#3B82F6]`}>
          <FaDownload className="text-xl mb-1 text-[#3B82F6]" />
          <span className="text-sm mt-1">Inbox</span>
          <span className="mt-1 px-2 py-0.5 text-xs bg-[#3B82F6] text-white rounded-full">New</span>
        </a>
        <a href={`/dashboard/${userData?.department || 'Bureau d’Ordre'}/pending`} className={`group flex flex-col items-center justify-center py-4 px-3 rounded-xl ${darkMode ? 'bg-[#131313] hover:bg-[#1F2024]' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-300 hover:shadow-lg transform hover:scale-105 border border-transparent hover:border-[#F59E0B]`}>
          <FaClipboardList className="text-xl mb-1 text-[#F59E0B]" />
          <span className="text-sm mt-1">Pending</span>
          {stats.pending > 0 && <span className="mt-1 px-2 py-0.5 text-xs bg-[#F59E0B] text-white rounded-full">{stats.pending}</span>}
        </a>
        <a href={`/dashboard/${userData?.department || 'Bureau d’Ordre'}/archived`} className={`group flex flex-col items-center justify-center py-4 px-3 rounded-xl ${darkMode ? 'bg-[#131313] hover:bg-[#1F2024]' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-300 hover:shadow-lg transform hover:scale-105 border border-transparent hover:border-[#8B5CF6]`}>
          <FaArchive className="text-xl mb-1 text-[#8B5CF6]" />
          <span className="text-sm mt-1">Archive</span>
        </a>
      </div>
    </div>
  );


  const renderActivityTable = () => (
    <div className={`rounded-2xl ${darkMode ? 'bg-[#1F2024]' : 'bg-white'} p-6 mb-8`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Activity</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className={`${darkMode ? 'bg-[#131313]' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className="py-3 px-4 text-left font-medium">Status</th>
              <th className="py-3 px-4 text-left font-medium">Subject</th>
              <th className="py-3 px-4 text-left font-medium">{isDGS ? 'From/To' : 'Service'}</th>
              <th className="py-3 px-4 text-left font-medium">Date</th>
              <th className="py-3 px-4 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((item) => (
              <tr key={item.id} className={`group border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:${darkMode ? 'bg-[#131313]/50' : 'bg-gray-50'} transition-colors duration-300`}>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBg(item.status)} ${getStatusColor(item.status)}`}>
                    {item.status === 'nouveau' && <FaEnvelope className="mr-1" />}
                    {item.status === 'validé' && <FaCheck className="mr-1" />}
                    {item.status === 'en_attente' && <FaClipboardList className="mr-1" />}
                    {item.status === 'archivé' && <FaArchive className="mr-1" />}
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium">{item.subject}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    {item.type === 'received' ? (
                      <>
                        <span className="bg-blue-100 text-blue-600 p-1 rounded-full mr-2">
                          <FaDownload className="text-xs" />
                        </span>
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.sender}</span>
                      </>
                    ) : (
                      <>
                        <span className="bg-green-100 text-green-600 p-1 rounded-full mr-2">
                          <FaUpload className="text-xs" />
                        </span>
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.receiver}</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">{formatDate(item.date)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button className={`p-2 rounded-full ${darkMode ? 'bg-[#131313] hover:bg-blue-600' : 'bg-gray-100 hover:bg-blue-500'} hover:text-white transition-colors duration-300`} title="View">
                      <FaEye className="text-sm" />
                    </button>
                    {item.status !== 'validé' && (
                      <button className={`p-2 rounded-full ${darkMode ? 'bg-[#131313] hover:bg-green-600' : 'bg-gray-100 hover:bg-green-500'} hover:text-white transition-colors duration-300`} title="Approve">
                        <FaCheck className="text-sm" />
                      </button>
                    )}
                    {item.status !== 'archivé' && (
                      <button className={`p-2 rounded-full ${darkMode ? 'bg-[#131313] hover:bg-purple-600' : 'bg-gray-100 hover:bg-purple-500'} hover:text-white transition-colors duration-300`} title="Archive">
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
      <a href={`/dashboard/${userData?.department || 'bo'}/activity`} className={`mt-6 block text-center p-3 rounded-lg text-sm ${darkMode ? 'bg-[#131313] text-[#AAAAAA]' : 'bg-gray-100 text-[#4C4C4C]'} hover:bg-[#A78800]/10 hover:text-[#A78800] transition-colors duration-300 border border-transparent hover:border-[#A78800]/30`}>
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
          <div key={note.id} className={`group p-4 rounded-xl transition-all duration-300 transform hover:translate-x-2 ${note.urgent ? darkMode ? 'bg-[#A78800]/10 border-l-4 border-[#A78800]' : 'bg-amber-50 border-l-4 border-[#A78800]' : darkMode ? 'bg-[#131313]' : 'bg-gray-50'}`}>
            <div className="flex items-start">
              <div className={`p-2.5 rounded-lg mr-4 ${note.urgent ? 'bg-[#A78800]/20 text-[#A78800]' : darkMode ? 'bg-[#1F2024] text-[#AAAAAA]' : 'bg-white text-[#4C4C4C]'} group-hover:bg-[#A78800] group-hover:text-white transition-colors duration-300`}>
                <FaBell className="text-lg" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{note.text}</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]'}`}>{note.time}</p>
              </div>
              {note.urgent && (
                <a href={`/dashboard/${userData?.department || 'bo'}/pending`} className="px-3 py-1 text-xs font-medium rounded-full bg-[#A78800] text-white hover:bg-[#8A6D00] transition-colors duration-300">
                  Action
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <a href={`/dashboard/${userData?.department || 'bo'}/notifications`} className={`mt-4 block text-center p-3 rounded-lg text-sm ${darkMode ? 'bg-[#131313] text-[#AAAAAA]' : 'bg-gray-100 text-[#4C4C4C]'} hover:bg-[#A78800]/10 hover:text-[#A78800] transition-colors duration-300 border border-transparent hover:border-[#A78800]/30`}>
        View All Notifications
      </a>
    </div>
  );

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