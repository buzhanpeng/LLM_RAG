import React, { useState, useEffect } from 'react';
import styles from '@/app/ui/styles/chat.module.css';

const ChatTitle: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [bounce, setBounce] = useState(false);

  // Trigger random bounces periodically
  useEffect(() => {
    const bounceInterval = setInterval(() => {
      if (!isHovering) {
        setBounce(true);
        setTimeout(() => setBounce(false), 500);
      }
    }, 3000);
    
    return () => clearInterval(bounceInterval);
  }, [isHovering]);

  return (
    <section className={styles.chatTitle}>
      <div className={styles.titleTextWrapper}>
        <strong className={bounce ? styles.titleBounce : ''}>
          AI Chat
        </strong>
      </div>
      
      <div 
        className={styles.iconContainer}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`${styles.chatIcon} ${isHovering ? styles.chatIconHover : ''}`}
        >
          {/* Main chat bubble */}
          <path 
            d="M5 5C5 3.34315 6.34315 2 8 2H32C33.6569 2 35 3.34315 35 5V25C35 26.6569 33.6569 28 32 28H25L16 35V28H8C6.34315 28 5 26.6569 5 25V5Z" 
            className={styles.chatIconBubble}
          />
          
          {/* Small dots animated */}
          <circle cx="12" cy="15" r="2" className={`${styles.chatIconDot} ${styles.dot1}`} />
          <circle cx="20" cy="15" r="2" className={`${styles.chatIconDot} ${styles.dot2}`} />
          <circle cx="28" cy="15" r="2" className={`${styles.chatIconDot} ${styles.dot3}`} />
          
          {/* Pulsing circle effect on hover */}
          {isHovering && (
            <>
              <circle cx="20" cy="15" r="16" className={styles.pulseCircle1} />
              <circle cx="20" cy="15" r="12" className={styles.pulseCircle2} />
            </>
          )}
        </svg>
      </div>
    </section>
  );
};

export default ChatTitle;