import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { FaArrowUp, FaArrowDown, FaEnvelope, FaUsers, FaHourglass, FaChartLine, FaDownload, FaFilter } from 'react-icons/fa';

const DashboardOverview = () => {
  const { darkMode, colors } = useTheme();
  const mainBg = darkMode ? 'bg-[#131313]' : 'bg-[#FFFFFF]';
  const cardBg = darkMode ? 'bg-[#1F2024]' : 'bg-[#F5F5F5]';
  const textColor = darkMode ? 'text-[#FFFFFF]' : 'text-[#131313]';
  const subTextColor = darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]';
  
  // Updated to match departments from User.js
  const courrierData = [
    { name: 'Bureau d’Ordre', sent: 40, received: 24, trend: +12 },
    { name: 'Ressources Humaines', sent: 30, received: 13, trend: -5 },
    { name: 'Division Financière', sent: 20, received: 18, trend: +8 },
    { name: 'Division Technique', sent: 35, received: 29, trend: +15 },
    { name: 'Informatique et Communication', sent: 15, received: 9, trend: -2 },
  ];

  const activityData = [
    { name: 'Jan', documents: 4000, users: 2400, target: 3000 },
    { name: 'Feb', documents: 3000, users: 1398, target: 3000 },
    { name: 'Mar', documents: 2000, users: 9800, target: 3000 },
    { name: 'Apr', documents: 2780, users: 3908, target: 3000 },
    { name: 'May', documents: 4000, users: 2800, target: 3000 },
    { name: 'Jun', documents: 3500, users: 2300, target: 3000 },
  ];

  const userEngagementData = [
    { name: 'Very Active', value: 45, color: '#805AD5' },
    { name: 'Active', value: 30, color: '#A78800' },
    { name: 'Occasional', value: 15, color: '#38B2AC' },
    { name: 'Inactive', value: 10, color: '#4C4C4C' },
  ];

  const statsCards = [
    { 
      title: 'Total Courriers', 
      value: 142, 
      trend: +12, 
      icon: <FaEnvelope />, 
      color: '#A78800',
      bgColor: 'rgba(167, 136, 0, 0.15)'
    },
    { 
      title: 'Total Department', // No trend for this fixed value
      value: 45, 
      icon: <FaUsers />, 
      color: '#805AD5',
      bgColor: 'rgba(128, 90, 213, 0.15)' 
    },
    { 
      title: 'Pending Courriers', 
      value: 8, 
      trend: -3, 
      icon: <FaHourglass />, 
      color: '#38B2AC',
      bgColor: 'rgba(56, 178, 172, 0.15)'
    },
    { 
      title: 'Recent Activity', 
      value: 12, 
      trend: +2, 
      icon: <FaChartLine />, 
      color: '#E53E3E',
      bgColor: 'rgba(229, 62, 62, 0.15)'
    },
  ];

  const CustomTooltipStyle = {
    backgroundColor: darkMode ? '#1F2024' : 'white',
    borderColor: '#A78800',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    boxShadow: darkMode 
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.45), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
      : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(167, 136, 0, 0.4)'
  };

  return (
    <div className={`p-6 mt-[63px] ${mainBg} ${textColor} min-h-screen overflow-y-auto`}>
      <div className="mb-6 bg-[#EAB308] rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-white">Admin Dashboard</h1>
        <p className="text-white/80">Welcome back, Administrator! Here's an overview of all departments.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((card, index) => (
          <div 
            key={index}
            className={`p-4 rounded-xl border shadow-lg relative overflow-hidden transition-transform hover:scale-105`}
            style={{ 
              background: darkMode ? '#1F2024' : 'white',
              borderColor: `${card.color}33`,
              boxShadow: `0 4px 20px ${card.color}20`
            }}
          >
            <div 
              className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10"
              style={{ background: card.color }}
            ></div>
            
            <div className="flex justify-between items-start">
              <div>
                <h2 className={`text-sm font-medium ${subTextColor} mb-1`}>{card.title}</h2>
                <p className="text-3xl font-bold">{card.value}</p>
                {/* Only show trend if it exists */}
                {card.trend !== undefined && (
                  <div className={`flex items-center mt-2 ${card.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {card.trend >= 0 ? <FaArrowUp className="mr-1 text-xs" /> : <FaArrowDown className="mr-1 text-xs" />}
                    <span className="text-xs font-medium">{Math.abs(card.trend)}% {card.trend >= 0 ? 'increase' : 'decrease'}</span>
                  </div>
                )}
              </div>
              
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: card.bgColor, color: card.color }}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Rest of the component remains unchanged */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div 
          className="rounded-xl shadow-lg overflow-hidden border border-opacity-20 transition-transform hover:shadow-xl"
          style={{ 
            borderColor: '#A78800',
            background: darkMode ? '#1F2024' : 'white'
          }}
        >
          <div className="p-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold mb-1">Courriers by Department</h2>
              <p className={`text-sm ${subTextColor}`}>Distribution of sent and received courriers</p>
            </div>
            <div className="flex space-x-2">
              <button className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <FaFilter size={14} />
              </button>
              <button className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <FaDownload size={14} />
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courrierData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4C4C4C' : '#EEEEEE'} />
              <XAxis dataKey="name" tick={{ fill: darkMode ? '#AAAAAA' : '#4C4C4C' }} />
              <YAxis tick={{ fill: darkMode ? '#AAAAAA' : '#4C4C4C' }} />
              <Tooltip contentStyle={CustomTooltipStyle} />
              <Legend wrapperStyle={{ color: darkMode ? '#FFFFFF' : '#131313' }} />
              <Bar dataKey="sent" fill="#A78800" radius={[4, 4, 0, 0]} />
              <Bar dataKey="received" fill="#805AD5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div 
          className="rounded-xl shadow-lg overflow-hidden border border-opacity-20 transition-transform hover:shadow-xl"
          style={{ 
            borderColor: '#A78800',
            background: darkMode ? '#1F2024' : 'white'
          }}
        >
          <div className="p-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold mb-1">Monthly Activity</h2>
              <p className={`text-sm ${subTextColor}`}>Courriers and department activity trends</p>
            </div>
            <div className="flex space-x-2">
              <button className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-100'}`}>
                <FaFilter size={14} />
              </button>
              <button className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-100'}`}>
                <FaDownload size={14} />
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4C4C4C' : '#EEEEEE'} />
              <XAxis dataKey="name" tick={{ fill: darkMode ? '#AAAAAA' : '#4C4C4C' }} />
              <YAxis tick={{ fill: darkMode ? '#AAAAAA' : '#4C4C4C' }} />
              <Tooltip contentStyle={CustomTooltipStyle} />
              <Legend wrapperStyle={{ color: darkMode ? '#FFFFFF' : '#131313' }} />
              <Line 
                type="monotone" 
                dataKey="documents" 
                stroke="#A78800" 
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: darkMode ? '#1F2024' : 'white', stroke: '#A78800' }} 
                activeDot={{ r: 6, strokeWidth: 2, fill: '#A78800', stroke: darkMode ? '#1F2024' : 'white' }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#805AD5" 
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: darkMode ? '#1F2024' : 'white', stroke: '#805AD5' }} 
                activeDot={{ r: 6, strokeWidth: 2, fill: '#805AD5', stroke: darkMode ? '#1F2024' : 'white' }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#E53E3E" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div 
        className="rounded-xl shadow-lg overflow-hidden border border-opacity-20 transition-transform hover:shadow-xl mb-6"
        style={{ 
          borderColor: '#A78800',
          background: darkMode ? '#1F2024' : 'white'
        }}
      >
        <div className="p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold mb-1">Department Engagement</h2>
            <p className={`text-sm ${subTextColor}`}>Activity levels across departments</p>
          </div>
          <div className="flex space-x-2">
            <button className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <FaFilter size={14} />
            </button>
            <button className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <FaDownload size={14} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between p-4">
          <ResponsiveContainer width={430} height={300}>
            <PieChart>
              <Pie
                data={userEngagementData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {userEngagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={CustomTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="md:w-1/2 p-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Department Activity Breakdown</h3>
              <p className={`text-sm ${subTextColor} mb-4`}>45% of departments are classified as very active, engaging with courriers daily.</p>
            </div>
            
            <div className="space-y-4">
              {userEngagementData.map((entry, index) => (
                <div key={`legend-${index}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-2" style={{ backgroundColor: entry.color }}></div>
                      <span className="font-medium">{entry.name}</span>
                    </div>
                    <span className="font-bold">{entry.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${entry.value}%`, backgroundColor: entry.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div 
        className="rounded-xl shadow-lg overflow-hidden border border-opacity-20 transition-transform hover:shadow-xl"
        style={{ 
          borderColor: '#A78800',
          background: darkMode ? '#1F2024' : 'white'
        }}
      >
        <div className="p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold mb-1">Recent Activities</h2>
            <p className={`text-sm ${subTextColor}`}>Latest actions across departments</p>
          </div>
          <button 
            className="px-4 py-2 rounded-lg text-white"
            style={{ background: 'linear-gradient(135deg, #A78800 0%, #D4AF37 100%)' }}
          >
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/20">
              {[
                { action: 'Courrier Created', department: 'Bureau d’Ordre', account: 'bo@commune.org', time: '12:42 PM', date: 'Today', status: 'Completed' },
                { action: 'Account Registered', department: 'Administration', account: 'admin@commune.org', time: '10:28 AM', date: 'Today', status: 'Completed' },
                { action: 'Courrier Approved', department: 'Direction Générale des Services', account: 'dgs@commune.org', time: '09:15 AM', date: 'Today', status: 'Completed' },
                { action: 'Courrier Updated', department: 'Ressources Humaines', account: 'rh@commune.org', time: '04:23 PM', date: 'Yesterday', status: 'Pending' },
                { action: 'Permission Changed', department: 'Administration', account: 'admin@commune.org', time: '02:56 PM', date: 'Yesterday', status: 'Rejected' }
              ].map((activity, index) => (
                <tr key={index} className={`${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{activity.action}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${subTextColor}`}>{activity.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{activity.account}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{activity.time}</div>
                    <div className={`text-xs ${subTextColor}`}>{activity.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;