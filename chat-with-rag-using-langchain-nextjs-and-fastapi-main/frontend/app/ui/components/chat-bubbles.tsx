import React from 'react';
import { useRef, useEffect } from 'react';

import styles from '@/app/ui/styles/chat.module.css';
import ChatScrollbar from './chat-scrollbar';

interface Message {
  text: string;
  sender: string;
}

interface ChatBubblesProps {
  messages: Message[];
}

const ChatBubbles: React.FC<ChatBubblesProps> = ({ messages }) => {
  const containerRef = useRef<null | HTMLDivElement>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); 

  return (
    <div className={styles.chatBubblesContainer}>
      <section className={styles.chatBubbles} ref={containerRef}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={msg.sender === 'user' ? styles.userMessage : styles.botMessage}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </section>
      <ChatScrollbar containerRef={containerRef} />
    </div>
  );
};

export default ChatBubbles;