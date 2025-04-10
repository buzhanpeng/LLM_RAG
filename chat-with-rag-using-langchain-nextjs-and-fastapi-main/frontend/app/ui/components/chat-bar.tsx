import React from 'react';
import { useState, useEffect, useRef } from 'react';

import Image from 'next/image';

import styles from '@/app/ui/styles/chat.module.css'

interface ChatBarProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onModelChange?: (model: string) => void;
}

// File type dictionary - matches backend
const FILE_TYPE_DICT = {
  'pdf': 'Document File',
  'txt': 'Text File',
  'md': 'Markdown Presentation',
  'json': 'JSON',
  'html': 'HTML',
  'csv': 'CSV Data File'
};

const AVAILABLE_MODELS = [
  { id: 'OpenAI', name: 'GPT-4' },
  { id: 'DeepSeek', name: 'DS-O1' },
];

const ChatBar: React.FC<ChatBarProps> = ({ onSendMessage, isLoading = false, onModelChange }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileTypeError, setFileTypeError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [showDropdownAbove, setShowDropdownAbove] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);

  // Get accepted file types string
  const acceptedFileTypes = Object.keys(FILE_TYPE_DICT).map(ext => `.${ext}`).join(',');

  // Function to check position and determine dropdown direction
  const checkDropdownPosition = () => {
    if (uploadButtonRef.current) {
      const buttonRect = uploadButtonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      
      // If there's less than 200px below the button, show dropdown above
      setShowDropdownAbove(spaceBelow < 200);
    }
  };

  // Check position when opening dropdown
  const toggleUploadMenu = () => {
    if (!isUploadMenuOpen) {
      checkDropdownPosition();
    }
    setIsUploadMenuOpen(!isUploadMenuOpen);
  };

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target as Node)) {
        setIsUploadMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Listen for window resize to update dropdown position
  useEffect(() => {
    window.addEventListener('resize', checkDropdownPosition);
    return () => {
      window.removeEventListener('resize', checkDropdownPosition);
    };
  }, []);

  // Adjust textarea height function
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 150); // Maximum height 150px
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Listen for message changes to adjust height
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // File validation function
  const validateFile = (file: File): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!Object.keys(FILE_TYPE_DICT).includes(extension)) {
      setFileTypeError(`Unsupported file type: .${extension}. Please select a file in one of these formats: ${Object.keys(FILE_TYPE_DICT).join(', ')}.`);
      return false;
    }
    setFileTypeError(null);
    return true;
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setIsUploadMenuOpen(false); // Close menu after selection
      } else {
        // Clear the selection
        e.target.value = '';
        setFile(null);
      }
    }
  };

  // Handle input events, add typing animation effect
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsTyping(true);
    // Stop typing animation after 1 second
    const timer = setTimeout(() => setIsTyping(false), 1000);
    return () => clearTimeout(timer);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message !== '' && !isLoading) {
      // Call the parent component's handler function
      onSendMessage(message);
      
      // Clear the message input
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const uploadFile = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/document', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        
        // Get file type description
        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
        const fileTypeDesc = FILE_TYPE_DICT[fileExt as keyof typeof FILE_TYPE_DICT] || 'File';
        
        // Upload success notification
        alert(`${fileTypeDesc} "${file.name}" uploaded successfully!`);
        
        // Clear the uploaded file
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        alert('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed');
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setIsModelMenuOpen(false);
    if (onModelChange) {
      onModelChange(modelId);
    }
  };

  // Get file type description
  const getFileTypeDescription = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return FILE_TYPE_DICT[extension as keyof typeof FILE_TYPE_DICT] || 'Unknown Type';
  };

  // Open file selector
  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className={styles.chatBar}>
        <div className={styles.fileUploadSection}>
            {/* File upload section */}
            <div className={styles.fileUploadContainer} ref={uploadMenuRef}>
              <button 
                ref={uploadButtonRef}
                onClick={toggleUploadMenu}
                className={styles.fileUploadButton}
                aria-label="Upload File"
                aria-expanded={isUploadMenuOpen}
              >
                <Image
                  src={'/paperclip.svg'}
                  alt={'Upload File Icon'}
                  height={20}
                  width={20}
                  className={styles.paperclipIcon}
                />
              </button>
              
              {/* File type selection dropdown */}
              {isUploadMenuOpen && (
                <div className={`${styles.fileTypeDropdown} ${showDropdownAbove ? styles.dropdownAbove : ''}`}>
                  <div className={styles.fileTypeHeader}>Select File Type:</div>
                  {Object.entries(FILE_TYPE_DICT).map(([ext, desc]) => (
                    <button
                      key={ext}
                      className={styles.fileTypeOption}
                      onClick={handleOpenFileSelector}
                    >
                      <span className={styles.fileExtension}>.{ext}</span>
                      <span className={styles.fileDescription}>{desc}</span>
                    </button>
                  ))}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFileTypes}
                    style={{ display: 'none' }}
                    onChange={onFileChange}
                  />
                </div>
              )}
            </div>
            
            {/* Display currently selected file */}
            {file && (
              <div className={styles.selectedFileInfo}>
                <span className={styles.fileName} title={file.name}>
                  {file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}
                </span>
              </div>
            )}
            
            {/* Upload button */}
            <button 
              onClick={uploadFile} 
              disabled={!file}
              className={styles.uploadButton}
            >
              Upload File
            </button>
            
            {/* File type error message */}
            {fileTypeError && (
              <div className={styles.fileTypeError}>
                {fileTypeError}
              </div>
            )}
            
            {/* Model selection button */}
            <div className={styles.modelSelectContainer} ref={modelMenuRef}>
              <button 
                onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                className={styles.modelSelectButton}
                aria-label="Select Model"
                aria-expanded={isModelMenuOpen}
              >
                <Image
                  src={'/select_model.svg'}
                  alt={'Select Model Icon'}
                  height={20}
                  width={20}
                  className={styles.modelSelectIcon}
                />
                <span className={styles.selectedModelName}>
                  {AVAILABLE_MODELS.find(model => model.id === selectedModel)?.name}
                </span>
              </button>
              
              {isModelMenuOpen && (
                <div className={`${styles.modelDropdown} ${showDropdownAbove ? styles.dropdownAbove : ''}`}>
                  {AVAILABLE_MODELS.map(model => (
                    <button
                      key={model.id}
                      className={`${styles.modelOption} ${selectedModel === model.id ? styles.selectedModel : ''}`}
                      onClick={() => handleModelChange(model.id)}
                    >
                      {model.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
        </div>
        
        {/* Message input form */}
        <form
          onSubmit={sendMessage} 
          className={styles.messageForm}
        >
          <div className={`${styles.textareaContainer} ${isTyping ? styles.isTyping : ''}`}>
            <textarea
                ref={textareaRef}
                rows={1}
                className={styles.messageTextarea}
                placeholder="Write a message"
                value={message}
                onChange={handleInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
            ></textarea>
            {isTyping && <div className={styles.typingIndicator}></div>}
          </div>
          {isLoading ? (
            <div className={styles.loadingIndicator}>
              <div className={styles.loadingDot}></div>
              <div className={styles.loadingDot}></div>
              <div className={styles.loadingDot}></div>
            </div>
          ) : (
            <button 
                type="submit" 
                className={styles.sendButton}
                disabled={!message.trim()}
            >
                <Image 
                    src={'/send.svg'} 
                    alt={'Send Icon'} 
                    height={20} 
                    width={20} 
                    className={`${styles.sendIcon} ${message.trim() ? styles.sendIconActive : ''}`}
                />
            </button>
          )}
        </form>
    </section>
  );
};

export default ChatBar;