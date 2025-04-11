'use client'

import React from 'react'
import { useState, useEffect } from 'react';

import ChatTitle from '@/app/ui/components/chat-title';
import ChatBubbles from '@/app//ui/components/chat-bubbles';
import ChatBar from '@/app/ui/components/chat-bar';

import "@/app/globals.css";

export default function Home() {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState('general');

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // 添加用户消息
    const newMessage = { text: message, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // 显示加载状态
    setIsLoading(true);
    
    try {
      // 调用API获取响应，现在包含模型信息
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          "msg": message,
          "model": currentModel  // 添加当前选择的模型
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const apiMessage = responseData.result.response;
        
        // 添加机器人响应消息
        setTimeout(() => {
          setMessages(prevMessages => [...prevMessages, { text: apiMessage, sender: 'bot' }]);
          setIsLoading(false);
        }, 500);
      } else {
        console.error('Error in the API request');
        setIsLoading(false);
        // 添加错误消息
        setTimeout(() => {
          setMessages(prevMessages => [
            ...prevMessages, 
            { text: "Sorry, I couldn't process your request. Please try again.", sender: 'bot' }
          ]);
        }, 500);
      }
    } catch (error) {
      console.error('Error sending the message:', error);
      setIsLoading(false);
      // 添加错误消息
      setTimeout(() => {
        setMessages(prevMessages => [
          ...prevMessages, 
          { text: "Network error. Please check your connection and try again.", sender: 'bot' }
        ]);
      }, 500);
    }
  };

  // 处理模型变更的函数
  const handleModelChange = (modelId: string) => {
    setCurrentModel(modelId);
    
    //添加一条系统消息通知用户模型已更改
    setMessages(prevMessages => [
      ...prevMessages,
      { 
        text: `Knowledge base changed to: ${modelId.charAt(0).toUpperCase() + modelId.slice(1)}`, 
        sender: 'bot' 
      }
    ]);
  };

  return (
    <main>
      <ChatTitle/>
      <ChatBubbles messages={messages}/>
      <ChatBar 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
        onModelChange={handleModelChange}
      />
    </main>
  );
}