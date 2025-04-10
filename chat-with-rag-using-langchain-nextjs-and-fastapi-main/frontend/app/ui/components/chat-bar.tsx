import React from 'react';
import { useState, useEffect, useRef } from 'react';

import Image from 'next/image';

import styles from '@/app/ui/styles/chat.module.css'

interface ChatBarProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const ChatBar: React.FC<ChatBarProps> = ({ onSendMessage, isLoading = false }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 调整textarea高度的函数
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 150); // 最大高度150px
      textarea.style.height = `${newHeight}px`;
    }
  };

  // 监听message变化，调整高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // 处理输入事件，添加打字动画效果
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsTyping(true);
    // 1秒后停止打字动画
    const timer = setTimeout(() => setIsTyping(false), 1000);
    return () => clearTimeout(timer);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message !== '' && !isLoading) {
      // 直接调用父组件的处理函数
      onSendMessage(message);
      
      // 清空消息输入框
      setMessage('');
      
      // 重置textarea高度
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
        alert('File uploaded successfully');
      } else {
        alert('Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading the file:', error);
      alert('Error uploading file');
    }
  };

  return (
    <section className={styles.chatBar}>
        <div className={styles.fileUploadSection}>
            <label htmlFor="upload-button" className={styles.fileUploadLabel}>
              <Image
                src={'/paperclip.svg'}
                alt={'PaperClip Icon'}
                height={20}
                width={20}
                className={styles.paperclipIcon}
              />
              <input
                id="upload-button"
                type="file"
                style={{ display: 'none' }}
                onChange={onFileChange}
              />
            </label>
            <button 
              onClick={uploadFile} 
              disabled={!file}
              className={styles.uploadButton}
            >
              Submit Document
            </button>
        </div>
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