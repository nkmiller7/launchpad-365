'use client';

import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Bot, X, UserCircle, Briefcase, Calendar, Building, Send } from 'lucide-react';

interface AIAssistantProps {
  // Add any props you might need in the future
  className?: string;
}

export default function AIAssistant({ className }: AIAssistantProps) {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [inChat, setInChat] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Fixed position: bottom right corner above button
  const [popupPosition, setPopupPosition] = useState({ x: window.innerWidth - 408, y: window.innerHeight - 644 }); // Now stateful
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [textSize, setTextSize] = useState(1);
  const [resizing, setResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [popupSize, setPopupSize] = useState({ width: 384, height: 520 });
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const topics = [
    { label: 'Task Help & Guidance', icon: <UserCircle className="h-5 w-5 mr-3" /> },
    { label: 'Company Resources', icon: <Briefcase className="h-5 w-5 mr-3" /> },
    { label: 'Schedule Questions', icon: <Calendar className="h-5 w-5 mr-3" /> },
    { label: 'General Support', icon: <Building className="h-5 w-5 mr-3" /> },
  ];

  // Boundaries
  const LEFT_BOUNDARY = 320; // px, don't overlap tasks
  const TOP_BOUNDARY = 80;   // px, don't overlap header
  // Reduce popup width for margin from sidebar
  const POPUP_WIDTH = 360;   // was 384px, now 360px for margin
  const POPUP_HEIGHT = 520;
  const SIDEBAR_WIDTH = 256; // px, match sidebar width exactly (sidebar is usually 256px)
  const SIDEBAR_RIGHT_EDGE = 350; // px, right edge of sidebar
  const BOTTOM_BOUNDARY = 120; // px, above chat button
  const TASKS_SECTION_WIDTH = 320; // px, width of tasks sidebar
  const TASKS_SECTION_HALF = TASKS_SECTION_WIDTH / 2;
  const HEADER_HEIGHT = 80; // px, height of header
  const CHAT_BUTTON_MARGIN = 24; // px, margin from right/bottom for chat button
  // Update initial popup size and position for new width
  const INITIAL_POPUP_WIDTH = 360; // was 384
  const INITIAL_POPUP_HEIGHT = 520;
  const ORIGINAL_X = window.innerWidth - (INITIAL_POPUP_WIDTH + 24); // 24px margin from right
  const ORIGINAL_Y = window.innerHeight - (INITIAL_POPUP_HEIGHT + 124); // keep as before

  // Remove drag functionality since position is fixed
  // Resize handlers - only resize up and left from top-left corner
  const onResizeStart = (e: React.MouseEvent) => {
    setResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
    document.body.style.userSelect = 'none';
  };
  const onResize = (e: MouseEvent) => {
    if (!resizing) return;
    let deltaX = resizeStart.x - e.clientX; // Reverse X for left resize
    let deltaY = resizeStart.y - e.clientY; // Reverse Y for up resize
    let newWidth = popupSize.width + deltaX;
    let newHeight = popupSize.height + deltaY;
    let newX = popupPosition.x - deltaX;
    let newY = popupPosition.y - deltaY;

    // Restrict left side: never past right edge of sidebar
    const minLeft = SIDEBAR_RIGHT_EDGE;
    if (newX < minLeft) {
      newWidth -= (minLeft - newX);
      newX = minLeft;
    }
    // Restrict top: never past header
    if (newY < HEADER_HEIGHT) {
      newHeight -= (HEADER_HEIGHT - newY);
      newY = HEADER_HEIGHT;
    }
    // Restrict right side: never past right margin (chat button) or original X
    const maxRight = Math.min(window.innerWidth - CHAT_BUTTON_MARGIN, ORIGINAL_X + INITIAL_POPUP_WIDTH);
    if (newX + newWidth > maxRight) {
      newWidth = maxRight - newX;
    }
    // Restrict bottom: never past bottom margin (chat button) or original Y
    const maxBottom = Math.min(window.innerHeight - CHAT_BUTTON_MARGIN, ORIGINAL_Y + INITIAL_POPUP_HEIGHT);
    if (newY + newHeight > maxBottom) {
      newHeight = maxBottom - newY;
    }
    // Boundaries: min size (original size)
    const minWidth = INITIAL_POPUP_WIDTH;
    const minHeight = INITIAL_POPUP_HEIGHT;
    newWidth = Math.max(minWidth, newWidth);
    newHeight = Math.max(minHeight, newHeight);

    // Never allow the popup to move down/right past its original position
    newX = Math.min(newX, ORIGINAL_X);
    newY = Math.min(newY, ORIGINAL_Y);

    setPopupPosition({ x: newX, y: newY });
    setPopupSize({ width: newWidth, height: newHeight });
    setResizeStart({ x: e.clientX, y: e.clientY });
  };
  const onResizeEnd = () => {
    setResizing(false);
    document.body.style.userSelect = '';
  };
  React.useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', onResize);
      window.addEventListener('mouseup', onResizeEnd);
    } else {
      window.removeEventListener('mousemove', onResize);
      window.removeEventListener('mouseup', onResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onResize);
      window.removeEventListener('mouseup', onResizeEnd);
    };
  }, [resizing, resizeStart, popupSize, popupPosition]);

  // Responsive: update popup position on window resize
  React.useEffect(() => {
    function handleResize() {
      // Calculate the max allowed X and Y for the popup
      const maxX = window.innerWidth - popupSize.width - CHAT_BUTTON_MARGIN;
      const maxY = window.innerHeight - popupSize.height - CHAT_BUTTON_MARGIN - 100; // 100px extra for bottom margin
      let newX = popupPosition.x;
      let newY = popupPosition.y;
      // If popup would overflow right/bottom, move it in
      if (newX > maxX) newX = Math.max(LEFT_BOUNDARY, maxX);
      if (newY > maxY) newY = Math.max(TOP_BOUNDARY, maxY);
      // If popup would overflow left/top, move it in
      if (newX < LEFT_BOUNDARY) newX = LEFT_BOUNDARY;
      if (newY < TOP_BOUNDARY) newY = TOP_BOUNDARY;
      setPopupPosition({ x: newX, y: newY });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [popupSize, popupPosition]);

  // Chat bubble component for user/assistant
  function ChatBubble({ message, isUser, textSize }: { message: string, isUser: boolean, textSize: number }) {
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
        <div
          className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm whitespace-pre-line break-words ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md border border-gray-200'
          }`}
          style={{ fontSize: `${textSize}em` }}
        >
          {message}
        </div>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    const userMessage = input;
    setMessages((msgs) => [...msgs, { role: 'user', content: userMessage }]);
    setInput('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, topic: selectedTopic }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((msgs) => [...msgs, { role: 'assistant', content: data.reply }]);
      } else if (data.result) {
        setMessages((msgs) => [...msgs, { role: 'assistant', content: data.result }]);
      } else {
        setError(data.error || 'No response from assistant.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* AI Assistant Floating Button */}
      <div 
        className={`fixed bottom-6 right-6 z-[9999] ${className || ''}`}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          pointerEvents: 'auto'
        }}
      >
        <Button
          onClick={() => {
            setIsAIAssistantOpen(!isAIAssistantOpen);
            // Position is now fixed - no need to reset
          }}
          className="rounded-full w-20 h-20 shadow-lg transition-all duration-200 hover:scale-105 border-2 border-blue-600 flex items-center justify-center bg-white text-blue-700 p-0"
          aria-label="Open AI Assistant"
        >
          <Bot style={{ width: 48, height: 48, minWidth: 48, minHeight: 48 }} />
        </Button>
      </div>

      {/* AI Assistant Popup */}
      {isAIAssistantOpen && (
        <div
          ref={popupRef}
          className="fixed z-50 bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden"
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
            width: popupSize.width,
            height: popupSize.height,
            position: 'fixed',
            userSelect: resizing ? 'none' : 'auto',
            fontSize: `${textSize}em`,
            transition: resizing ? 'none' : 'box-shadow 0.2s',
            minWidth: INITIAL_POPUP_WIDTH,
            minHeight: INITIAL_POPUP_HEIGHT,
          }}
        >
          <div
            className="flex items-center justify-between p-4 border-b border-gray-100 select-none bg-gray-50"
            style={{ userSelect: 'none' }}
          >
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTextSize((s) => Math.min(1.25, s + 0.1))}
                className="h-8 w-8 text-lg"
                aria-label="Increase text size"
              >
                A+
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTextSize((s) => Math.max(0.9, s - 0.1))}
                className="h-8 w-8 text-lg"
                aria-label="Decrease text size"
              >
                A-
              </Button>
              {/* Removed red X close button */}
            </div>
          </div>
          {/* Resize handle - top left corner */}
          <div
            className="absolute left-0 top-0 w-4 h-4 cursor-nw-resize z-50"
            onMouseDown={onResizeStart}
            style={{ userSelect: 'none' }}
          >
            <div className="w-4 h-4 bg-transparent flex items-start justify-start">
              <div className="w-3 h-3 bg-gray-300 rounded-tl-lg" />
            </div>
          </div>
          {/* Popup content */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col" style={{ fontSize: `${textSize}rem` }}>
            {!inChat ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Hi! I'm here to help you with your onboarding tasks and answer any questions. What can I assist you with today?
                </p>
                <div className="space-y-3 flex flex-col">
                  {topics.map((topic) => (
                    <Button
                      key={topic.label}
                      variant={selectedTopic === topic.label ? 'default' : 'outline'}
                      className={`flex-1 min-h-[56px] w-full justify-start text-base font-medium px-5 ${selectedTopic === topic.label ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedTopic(topic.label)}
                    >
                      {topic.icon}
                      {topic.label}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto mb-2 bg-gray-50 rounded p-3" style={{ fontSize: `${textSize}rem` }}>
                  {messages.length === 0 && (
                    <div className="text-gray-400 text-sm text-center py-4">Ask me anything about {selectedTopic}!</div>
                  )}
                  {messages.map((msg, i) => (
                    <ChatBubble
                      key={i}
                      message={msg.content}
                      isUser={msg.role === 'user'}
                      textSize={textSize}
                    />
                  ))}
                  {loading && (
                    <div className="flex justify-start mb-2">
                      <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-gray-100 text-gray-500 animate-pulse">Thinking…</div>
                    </div>
                  )}
                  {error && (
                    <div className="flex justify-start mb-2">
                      <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-red-100 text-red-700 border border-red-300">{error}</div>
                    </div>
                  )}
                </div>
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-2 px-4 py-3 border-t border-gray-100 bg-white"
                  style={{ fontSize: `${textSize}em` }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setInChat(false);
                      setMessages([]);
                      setInput('');
                      setError(null);
                    }}
                    className="flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200 shadow mr-2"
                    aria-label="Back"
                    style={{ height: `${2.5 * textSize}em`, width: `${2.5 * textSize}em`, minHeight: 36, minWidth: 36, alignSelf: 'center', transition: 'height 0.2s, width 0.2s' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </Button>
                  <div className="flex-1 flex items-center gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      rows={1}
                      maxLength={1000}
                      placeholder="Type your message…"
                      className="w-full resize-none rounded-2xl px-4 py-2 border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 scrollbar-none"
                      style={{ minHeight: 40, maxHeight: 120, fontSize: `${textSize}em`, overflow: 'auto' }}
                      disabled={loading}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white rounded-full px-3 py-1 shadow hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
                      disabled={loading || !input.trim()}
                      aria-label="Send message"
                      style={{ height: 40, minWidth: 40, marginLeft: 4 }}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
          {/* Start Conversation button anchored at bottom */}
          {!inChat && (
            <div className="w-full px-4 pb-4 pt-2 bg-white sticky bottom-0 left-0 z-10">
              <Button
                className="w-full bg-blue-100 hover:bg-blue-200 text-black text-sm shadow-md border border-black"
                disabled={!selectedTopic}
                onClick={() => {
                  setInChat(true);
                  setMessages([]);
                  setInput('');
                  setError(null);
                }}
                style={{ minHeight: 48 }}
              >
                <span>Start Conversation</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
