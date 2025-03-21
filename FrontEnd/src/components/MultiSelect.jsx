import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaCheck, FaTimes } from 'react-icons/fa';

const MultiSelect = ({ 
  options, 
  selectedValues: selectedValuesProp, 
  onChange, 
  label, 
  name, 
  placeholder = "Select options...",
  darkMode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputBg = darkMode ? 'bg-[#2D2D2D]' : 'bg-gray-100';
  const textColor = darkMode ? 'text-white' : 'text-[#131313]';
  const borderColor = darkMode ? 'border-[#2D2D2D]' : 'border-[#E5E5E5]';
  const subTextColor = darkMode ? 'text-[#AAAAAA]' : 'text-[#4C4C4C]';

  const selectedValues = Array.isArray(selectedValuesProp) ? selectedValuesProp : [];

  console.log(`${name} - selectedValues:`, selectedValues); // Log current values

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    console.log(`${name} - Toggling value:`, value, 'New values:', newSelectedValues); // Log toggle action

    // Call onChange with just the new values array
    onChange(newSelectedValues);
  };

  const handleRemoveItem = (e, value) => {
    e.stopPropagation();
    const newValues = selectedValues.filter(v => v !== value);
    console.log(`${name} - Removing value:`, value, 'New values:', newValues); // Log removal

    // Call onChange with just the new values array
    onChange(newValues);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className={`block text-sm font-medium mb-2 ${textColor}`}>
        {label}
      </label>
      
      <div 
        className={`
          relative w-full px-3 py-2 rounded-lg border ${borderColor}
          ${inputBg} ${textColor} 
          transition-all duration-200 cursor-pointer
          ${isOpen ? 'ring-2 ring-[#A78800]/30 border-[#A78800]' : ''}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 mb-1">
          {selectedValues.length > 0 ? (
            options
              .filter(option => selectedValues.includes(option.value))
              .map(option => (
                <div
                  key={option.value}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-[#A78800]/20 text-[#A78800] text-sm"
                >
                  <span className="mr-1">{option.label}</span>
                  <button 
                    type="button" 
                    onClick={(e) => handleRemoveItem(e, option.value)}
                    className="hover:bg-[#A78800]/30 rounded-full p-0.5"
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              ))
          ) : (
            <span className={`text-sm ${subTextColor}`}>{placeholder}</span>
          )}
        </div>
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <FaChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isOpen && (
        <div className={`
          absolute z-10 w-full mt-1 rounded-lg shadow-lg border ${borderColor} ${inputBg}
          max-h-60 overflow-y-auto
        `}>
          <div className="sticky top-0 p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              className={`
                w-full px-3 py-2 rounded-md ${inputBg} ${textColor}
                focus:outline-none focus:ring-1 focus:ring-[#A78800]
              `}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className={`
                    flex items-center justify-between px-4 py-2 cursor-pointer
                    ${selectedValues.includes(option.value) ? 'bg-[#A78800]/10' : ''}
                    hover:bg-[#A78800]/5
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option.value);
                  }}
                >
                  <span className={`text-sm ${textColor}`}>{option.label}</span>
                  {selectedValues.includes(option.value) && (
                    <FaCheck className="text-[#A78800]" size={12} />
                  )}
                </div>
              ))
            ) : (
              <div className={`px-4 py-2 text-sm ${subTextColor}`}>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;