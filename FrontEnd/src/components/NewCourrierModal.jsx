import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import { 
  FaEnvelope, FaTimes, FaPaperclip, FaFileImage, FaFilePdf, FaFileWord, 
  FaFileAlt, FaCheck, FaExclamationTriangle, FaBuilding 
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const allDepartments = [
  { value: 'Présidence', label: 'Présidence' },
  { value: 'Direction Générale des Services', label: 'Direction Générale des Services' },
  { value: 'Bureau d\'Ordre', label: 'Bureau d\'Ordre' },
  { value: 'Secrétariat du Conseil', label: 'Secrétariat du Conseil' },
  { value: 'Secrétariat du Président', label: 'Secrétariat du Président' },
  { value: 'Ressources Humaines', label: 'Ressources Humaines' },
  { value: 'Division Financière', label: 'Division Financière' },
  { value: 'Division Technique', label: 'Division Technique' },
  { value: 'Bureau d\'Hygiène', label: 'Bureau d\'Hygiène' },
  { value: 'Partenariat et Coopération', label: 'Partenariat et Coopération' },
  { value: 'Informatique et Communication', label: 'Informatique et Communication' },
  { value: 'Administration', label: 'Administration' }
];

const getAllowedDepartments = (role) => {
  switch (role) {
    case 'president':
    case 'dgs':
    case 'admin':
      return allDepartments;
    case 'bo':
      return allDepartments.filter(d => d.value === 'Direction Générale des Services');
    case 'sc':
    case 'sp':
    case 'rh':
    case 'dfm':
    case 'dt':
    case 'bh':
    case 'pc':
    case 'ic':
      return allDepartments.filter(d => 
        d.value === 'Bureau d\'Ordre' || d.value === 'Direction Générale des Services'
      );
    default:
      console.warn(`Unknown role: ${role}, defaulting to no permissions`);
      return [];
  }
};

const NewCourrierModal = ({ isOpen, onClose, initialData }) => {
  const { darkMode } = useTheme();
  const modalBg = darkMode ? 'bg-[#1F2024]' : 'bg-white';
  const inputBg = darkMode ? 'bg-[#2D2D2D]' : 'bg-gray-100';
  const textColor = darkMode ? 'text-white' : 'text-[#131313]';
  const borderColor = darkMode ? 'border-[#2D2D2D]' : 'border-[#E5E5E5]';
  const subTextColor = darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]';
  const gradientBg = 'bg-gradient-to-r from-[#A78800] to-[#D4AF37]';

  const fileInputRef = useRef(null);
  const [modalRoot, setModalRoot] = useState(null);
  const [formData, setFormData] = useState({
    type: 'officiel',
    subject: '',
    content: '',
    receiverDepartments: [],
    attachments: [],
    senderRole: initialData?.senderRole || 'dgs',
    senderDepartment: initialData?.senderDepartment || ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const senderRole = initialData?.senderRole || 'dgs';
  const departments = getAllowedDepartments(senderRole);

  useEffect(() => {
    let root = document.getElementById('modal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
    }
    setModalRoot(root);

    return () => {
      if (root.childElementCount === 0) {
        document.body.removeChild(root);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          type: initialData.type || 'officiel',
          subject: initialData.subject || '',
          content: initialData.content || '',
          receiverDepartments: initialData.receiverDepartments || [],
          attachments: initialData.attachments || [],
          senderRole: initialData.senderRole || 'dgs',
          senderDepartment: initialData.senderDepartment || ''
        });
      } else {
        resetForm();
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, initialData]);

  const resetForm = () => {
    setFormData({
      type: 'officiel',
      subject: '',
      content: '',
      receiverDepartments: [],
      attachments: [],
      senderRole: initialData?.senderRole || 'dgs',
      senderDepartment: initialData?.senderDepartment || ''
    });
    setErrors({});
    setShowPreview(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleDepartmentToggle = (deptValue) => {
    let updatedDepartments = [...formData.receiverDepartments];
    if (updatedDepartments.includes(deptValue)) {
      updatedDepartments = updatedDepartments.filter(d => d !== deptValue);
    } else {
      updatedDepartments.push(deptValue);
    }
    setFormData({ ...formData, receiverDepartments: updatedDepartments });
    if (errors.receiver) setErrors({ ...errors, receiver: '' });
  };

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    const fileObjects = newFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      file: file
    }));
    setFormData({ ...formData, attachments: [...formData.attachments, ...fileObjects] });
  };

  const removeAttachment = (index) => {
    const newAttachments = [...formData.attachments];
    if (newAttachments[index].preview) URL.revokeObjectURL(newAttachments[index].preview);
    newAttachments.splice(index, 1);
    setFormData({ ...formData, attachments: newAttachments });
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FaFileImage className="text-blue-500" />;
    if (fileType.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (fileType.includes('word') || fileType.includes('doc')) return <FaFileWord className="text-blue-700" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (formData.receiverDepartments.length === 0) {
      newErrors.receiver = 'Select at least one department';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const formDataToSend = new FormData();
    formDataToSend.append('type', formData.type);
    formDataToSend.append('subject', formData.subject);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('senderDepartment', formData.senderDepartment || 'Unknown');
    formDataToSend.append('receiverDepartments', JSON.stringify(formData.receiverDepartments));
    formData.attachments.forEach((fileObj) => {
      formDataToSend.append('attachments', fileObj.file || fileObj.path);
    });

    try {
      const response = await axios.post(`${API_URL}/mails`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      resetForm();
      setSubmitting(false);
      onClose(response.data);
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to send courrier - Network Error' });
      setSubmitting(false);
    }
  };

  const triggerFileUpload = () => fileInputRef.current.click();

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => onClose(null)}
          />
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className={`fixed z-50 top-[6%] left-[18%] transform -translate-x-1/2 -translate-y-1/2 
              w-[95%] max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl ${modalBg} shadow-2xl 
              border ${borderColor}`}
          >
            <div className="bg-gradient-to-r from-[#A78800] to-[#D4AF37] p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center">
                  <FaEnvelope className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">New Courrier</h2>
              </div>
              <button 
                onClick={() => onClose(null)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
              >
                <FaTimes />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <div className="flex mb-6 bg-gray-100 dark:bg-[#2D2D2D] rounded-lg p-1 w-fit">
                <button
                  onClick={() => setShowPreview(false)}
                  className={`px-4 py-2 rounded-md ${!showPreview ? 'bg-white dark:bg-[#1F2024] text-[#A78800] shadow-md' : `${subTextColor}`}`}
                >
                  Form
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className={`px-4 py-2 rounded-md ${showPreview ? 'bg-white dark:bg-[#1F2024] text-[#A78800] shadow-md' : `${subTextColor}`}`}
                >
                  Preview
                </button>
              </div>
              
              {!showPreview ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                        Type <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-2">
                        {[
                          { id: 'officiel', label: 'Official', icon: <FaEnvelope /> },
                          { id: 'urgent', label: 'Urgent', icon: <FaExclamationTriangle /> },
                          { id: 'interne', label: 'Internal', icon: <FaBuilding /> }
                        ].map((type) => (
                          <label 
                            key={type.id}
                            className={`
                              flex-1 border ${borderColor} rounded-lg p-3 cursor-pointer
                              transition-all duration-200
                              ${formData.type === type.id ? 'ring-2 ring-[#A78800] border-[#A78800]' : 'hover:border-[#A78800]/50'}
                            `}
                          >
                            <input
                              type="radio"
                              name="type"
                              value={type.id}
                              checked={formData.type === type.id}
                              onChange={handleInputChange}
                              className="sr-only"
                            />
                            <div 
                              className={`
                                flex flex-col items-center justify-center text-center
                                ${formData.type === type.id ? 'text-[#A78800]' : subTextColor}
                              `}
                            >
                              <div 
                                className={`
                                  w-10 h-10 rounded-full mb-2 flex items-center justify-center
                                  ${formData.type === type.id ? 'bg-[#A78800]/20' : darkMode ? 'bg-[#2D2D2D]' : 'bg-gray-100'}
                                `}
                              >
                                {type.icon}
                              </div>
                              <span className="text-sm font-medium">{type.label}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Enter a clear subject line..."
                        className={`
                          w-full px-4 py-3 rounded-lg border ${borderColor}
                          ${inputBg} ${textColor} focus:ring-2
                          focus:ring-[#A78800]/30 focus:border-[#A78800]
                          transition-all duration-200 outline-none
                          ${errors.subject ? 'border-red-500 ring-1 ring-red-500' : ''}
                        `}
                        maxLength={200}
                      />
                      {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                      <p className={`text-xs mt-1 ${subTextColor}`}>{formData.subject.length}/200 characters</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                        Receiver Departments <span className="text-red-500">*</span>
                      </label>
                      {departments.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {departments.map((dept, index) => (
                            <div 
                              key={index}
                              onClick={() => handleDepartmentToggle(dept.value)}
                              className={`
                                px-4 py-3 rounded-lg cursor-pointer flex items-center gap-2 border transition-colors
                                ${formData.receiverDepartments.includes(dept.value)
                                  ? 'bg-[#EAB308] border-[#EAB308] text-white'
                                  : `${darkMode ? 'bg-[#2D2D34] border-gray-700' : 'bg-gray-100 border-gray-200'}`}
                              `}
                            >
                              {formData.receiverDepartments.includes(dept.value) ? <FaCheck size={14} /> : <div className="w-[14px]"></div>}
                              <span>{dept.label}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-red-500 text-sm">No departments available for this role</p>
                      )}
                      {errors.receiver && <p className="text-red-500 text-xs mt-1">{errors.receiver}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                        Content <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="Enter your message..."
                        rows={6}
                        className={`
                          w-full px-4 py-3 rounded-lg border ${borderColor}
                          ${inputBg} ${textColor} focus:ring-2
                          focus:ring-[#A78800]/30 focus:border-[#A78800]
                          transition-all duration-200 outline-none resize-none
                          ${errors.content ? 'border-red-500 ring-1 ring-red-500' : ''}
                        `}
                      />
                      {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className={`block text-sm font-medium ${textColor}`}>Attachments</label>
                        <span className={`text-xs ${subTextColor}`}>{formData.attachments?.length || 0} file(s)</span>
                      </div>
                      <div 
                        onClick={triggerFileUpload}
                        className={`
                          border-2 border-dashed ${borderColor} rounded-lg p-6
                          text-center cursor-pointer transition-all duration-200
                          hover:border-[#A78800]/50 hover:bg-[#A78800]/5
                        `}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          multiple
                          className="hidden"
                        />
                        <FaPaperclip className={`mx-auto mb-2 ${subTextColor}`} size={24} />
                        <p className={`text-sm ${textColor}`}>Click to upload or drag and drop</p>
                        <p className={`text-xs ${subTextColor} mt-1`}>PDF, DOC, DOCX, JPG, PNG (max 10MB each)</p>
                      </div>
                      {formData.attachments?.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2">
                          {formData.attachments.map((file, index) => (
                            <div 
                              key={index}
                              className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-[#2D2D2D]' : 'bg-gray-100'}`}
                            >
                              <div className="flex items-center space-x-3 overflow-hidden">
                                <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                                <div className="overflow-hidden">
                                  <p className={`text-sm font-medium truncate ${textColor}`}>{file.name}</p>
                                  <p className={`text-xs ${subTextColor}`}>{file.size ? formatFileSize(file.size) : 'Existing file'}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeAttachment(index); }}
                                className="ml-2 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                              >
                                <FaTimes size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.submit && (
                    <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm mb-4 flex items-center">
                      <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                      <span>{errors.submit}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-end space-x-3 mt-8">
                    <button
                      type="button"
                      onClick={() => onClose(null)}
                      className={`px-5 py-2.5 rounded-lg border ${borderColor} text-sm font-medium ${textColor} hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`
                        px-5 py-2.5 rounded-lg text-sm font-medium text-white
                        transition-all duration-200 ${gradientBg} hover:opacity-90
                        flex items-center space-x-2 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}
                        relative overflow-hidden group
                      `}
                    >
                      {submitting && (
                        <span className="absolute inset-0 h-full w-full flex items-center justify-center bg-[#A78800]">
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      )}
                      <div className="relative z-10 flex items-center space-x-2">
                        <FaCheck size={14} />
                        <span>{submitting ? 'Sending...' : 'Send Courrier'}</span>
                      </div>
                      <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white dark:bg-[#26272B] rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 mb-4">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-[#A78800] to-[#D4AF37] bg-clip-text text-transparent">
                        {formData.subject || 'No Subject'}
                      </h3>
                      <div className="flex items-center mt-2">
                        <span className={`text-sm ${subTextColor}`}>
                          {new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                    <div className={`
                      px-3 py-1 rounded-full text-xs font-medium flex items-center
                      ${formData.type === 'urgent' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                        : formData.type === 'officiel' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }
                    `}>
                      {formData.type === 'urgent' && <FaExclamationTriangle className="mr-1" size={10} />}
                      {formData.type === 'officiel' && <FaEnvelope className="mr-1" size={10} />}
                      {formData.type === 'interne' && <FaBuilding className="mr-1" size={10} />}
                      {formData.type === 'officiel' ? 'Official' : formData.type === 'urgent' ? 'Urgent' : 'Internal'}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-sm font-medium mb-2 flex items-center">
                      <span className="bg-[#A78800] h-4 w-1 rounded-full mr-2"></span>
                      Receiver Departments:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.receiverDepartments.map(dept => (
                        <span key={dept} 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                          bg-[#A78800]/10 text-[#A78800] border border-[#A78800]/20">
                          <FaBuilding size={10} className="mr-1" />
                          {dept}
                        </span>
                      ))}
                      {formData.receiverDepartments.length === 0 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                        bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                          No departments selected
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative border-t border-b py-8 my-6 border-gray-200 dark:border-gray-700">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#26272B] px-4">
                      <span className="text-xs font-medium text-[#A78800]">MESSAGE</span>
                    </div>
                    <div className={`whitespace-pre-wrap ${textColor} leading-relaxed`}>
                      {formData.content || 'No content provided'}
                    </div>
                  </div>
                  
                  {formData.attachments?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-3 flex items-center">
                        <FaPaperclip className="mr-2 text-[#A78800]" />
                        <span>Attachments ({formData.attachments.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formData.attachments.map((file, index) => (
                          <div 
                            key={index} 
                            className={`
                              flex items-center p-3 rounded-md border
                              ${darkMode ? 'bg-[#2D2D2D] border-[#3D3D3D]' : 'bg-gray-50 border-gray-200'}
                              transition-all duration-200 hover:border-[#A78800]
                            `}
                          >
                            <div className="bg-[#A78800]/10 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                              {getFileIcon(file.type)}
                            </div>
                            <div className="overflow-hidden">
                              <p className={`text-sm font-medium truncate ${textColor}`}>{file.name}</p>
                              <p className={`text-xs ${subTextColor}`}>
                                {file.size ? formatFileSize(file.size) : 'File attached'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8 text-center">
                    <div className="inline-block">
                      <button
                        type="button"
                        onClick={() => setShowPreview(false)}
                        className={`
                          px-6 py-2.5 rounded-lg text-sm font-medium text-white
                          transition-all duration-300 ${gradientBg} hover:opacity-90
                          shadow-md hover:shadow-lg hover:shadow-[#A78800]/20
                        `}
                      >
                        Edit Message
                      </button>
                      <div className="mt-2 text-xs text-[#A78800]">
                        Review before sending
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!modalRoot) return null;
  return createPortal(modalContent, modalRoot);
};

export default NewCourrierModal;