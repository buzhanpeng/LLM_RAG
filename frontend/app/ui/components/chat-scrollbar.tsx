import React, { useRef, useEffect } from 'react';
import styles from '@/app/ui/styles/chat.module.css';

interface ScrollbarProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const ChatScrollbar: React.FC<ScrollbarProps> = ({ containerRef }) => {
  const scrollThumbRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startY, setStartY] = React.useState(0);
  const [startScrollTop, setStartScrollTop] = React.useState(0);

  // 计算滚动条高度和位置
  useEffect(() => {
    const updateScrollThumb = () => {
      if (!containerRef.current || !scrollThumbRef.current || !scrollTrackRef.current) return;

      const { scrollHeight, clientHeight, scrollTop } = containerRef.current;
      const trackHeight = scrollTrackRef.current.clientHeight;
      
      // 计算滑块高度，确保有最小高度
      const thumbPercentage = clientHeight / scrollHeight;
      const thumbHeight = Math.max(thumbPercentage * trackHeight, 40);
      
      // 计算滑块位置
      const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (trackHeight - thumbHeight);
      
      // 更新滑块样式
      scrollThumbRef.current.style.height = `${thumbHeight}px`;
      scrollThumbRef.current.style.transform = `translateY(${thumbTop}px)`;
    };

    // 监听滚动事件
    const handleScroll = () => {
      updateScrollThumb();
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', handleScroll);
      // 初始更新
      updateScrollThumb();
    }

    // 监听窗口大小变化
    window.addEventListener('resize', updateScrollThumb);

    return () => {
      containerRef.current?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollThumb);
    };
  }, [containerRef]);

  // 处理滚动条拖动
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.clientY);
    if (containerRef.current) {
      setStartScrollTop(containerRef.current.scrollTop);
    }
  };

  // 处理鼠标移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current || !scrollTrackRef.current || !scrollThumbRef.current) return;

      const deltaY = e.clientY - startY;
      const { scrollHeight, clientHeight } = containerRef.current;
      const trackHeight = scrollTrackRef.current.clientHeight;
      const thumbHeight = parseInt(scrollThumbRef.current.style.height, 10);
      
      // 计算滚动比例
      const scrollRatio = (scrollHeight - clientHeight) / (trackHeight - thumbHeight);
      
      // 更新容器滚动位置
      containerRef.current.scrollTop = startScrollTop + deltaY * scrollRatio;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startScrollTop, containerRef]);

  // 处理轨道点击直接跳转
  const handleTrackClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !scrollTrackRef.current || !scrollThumbRef.current) return;
    
    // 获取点击位置
    const trackRect = scrollTrackRef.current.getBoundingClientRect();
    const clickPosition = e.clientY - trackRect.top;
    
    // 计算点击位置比例
    const trackHeight = trackRect.height;
    const thumbHeight = parseInt(scrollThumbRef.current.style.height, 10) || 50;
    const scrollRatio = clickPosition / trackHeight;
    
    // 考虑滑块中心对齐
    const offsetRatio = (thumbHeight / 2) / trackHeight;
    const adjustedRatio = Math.max(0, Math.min(1, scrollRatio - offsetRatio));
    
    // 更新滚动位置
    const { scrollHeight, clientHeight } = containerRef.current;
    containerRef.current.scrollTop = adjustedRatio * (scrollHeight - clientHeight);
  };

  return (
    <div className={styles.customScrollbar}>
      <div 
        ref={scrollTrackRef} 
        className={styles.scrollTrack}
        onClick={handleTrackClick}
      >
        <div 
          ref={scrollThumbRef} 
          className={styles.scrollThumb}
          onMouseDown={handleThumbMouseDown}
        />
      </div>
    </div>
  );
};

export default ChatScrollbar;
