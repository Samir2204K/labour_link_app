import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../api/chatService';
import { Button, cn } from './UI';

export default function ChatWindow({ receiver, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [receiverTyping, setReceiverTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  const stompClient = useRef(null);
  const messageAreaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  console.log("ChatWindow rendering for receiver:", receiver);

  if (!user || !receiver) return null;

  if (!receiver.email) {
    return createPortal(
      <div className="fixed bottom-6 right-6 w-80 p-6 bg-white rounded-2xl shadow-2xl z-[9999] border-2 border-red-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-red-600 font-bold">Data Error</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <p className="text-sm text-gray-600">Worker email is missing. Please restart the backend server and refresh the page.</p>
      </div>,
      document.body
    );
  }

  useEffect(() => {
    if (!user?.email || !receiver?.email) return;

    // Initial data fetch
    const fetchData = async () => {
      try {
        const history = await chatService.getChatHistory(user.email, receiver.email);
        setMessages(history);
        
        const onlineUsers = await chatService.getOnlineUsers();
        setIsOnline(onlineUsers.includes(receiver.email));
      } catch (error) {
        console.error("Failed to fetch initial chat data", error);
      }
    };
    fetchData();

    // WebSocket connection using modern @stomp/stompjs
    const token = localStorage.getItem('jwtToken');
    const client = new Client({
      brokerURL: 'ws://localhost:8080/chat', // Fallback to raw WS if needed
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      webSocketFactory: () => new SockJS('http://localhost:8080/chat'),
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log('Connected to STOMP');
      
      // Subscribe to private messages
      client.subscribe('/user/queue/messages', (msg) => {
        const message = JSON.parse(msg.body);
        if (message.senderId === receiver.email || message.senderId === user.email) {
          setMessages(prev => {
            if (prev.find(m => m.id === message.id)) return prev;
            return [...prev, message];
          });
          
          if (message.senderId === receiver.email && !message.seen) {
            sendReadReceipt(message.senderId);
          }
        }
      });

      // Subscribe to typing indicators
      client.subscribe('/user/queue/typing', (msg) => {
        const indicator = JSON.parse(msg.body);
        if (indicator.senderId === receiver.email) {
          setReceiverTyping(indicator.typing);
        }
      });

      // Subscribe to online status
      client.subscribe('/topic/public', (msg) => {
        const status = JSON.parse(msg.body);
        if (status.userId === receiver.email) {
          setIsOnline(status.online);
        }
      });

      // Subscribe to read receipts
      client.subscribe('/user/queue/readReceipt', (msg) => {
        const receipt = JSON.parse(msg.body);
        if (receipt.receiverId === receiver.email) {
          setMessages(prev => prev.map(m => 
            m.senderId === user.email ? { ...m, seen: true } : m
          ));
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [receiver?.email, user?.email]);

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages, receiverTyping]);

  const sendMessage = () => {
    if (input.trim() && stompClient.current && stompClient.current.connected) {
      const chatMessage = {
        senderId: user.email,
        receiverId: receiver.email,
        content: input.trim()
      };
      stompClient.current.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(chatMessage)
      });
      setInput('');
      sendTypingStatus(false);
    }
  };

  const sendTypingStatus = (typing) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify({
          senderId: user.email,
          receiverId: receiver.email,
          typing: typing
        })
      });
    }
  };

  const sendReadReceipt = (senderId) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.publish({
        destination: "/app/chat.readReceipt",
        body: JSON.stringify({
          senderId: senderId,
          receiverId: user.email
        })
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    } else {
      if (!isTyping) {
        setIsTyping(true);
        sendTypingStatus(true);
      }
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTypingStatus(false);
      }, 2000);
    }
  };

  return createPortal(
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9999] border border-gray-100" style={{ bottom: '24px', right: '24px' }}>
      {/* Header */}
      <div className="bg-accent p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={receiver?.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} className="size-10 rounded-full border-2 border-white/20" alt="" />
            {isOnline && <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-accent"></div>}
          </div>
          <div>
            <h4 className="font-bold text-sm leading-tight">{receiver?.name}</h4>
            <p className="text-[10px] opacity-80">{isOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><X size={20} /></button>
      </div>

      {/* Messages */}
      <div ref={messageAreaRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
        {messages.map((msg, i) => {
          const isSent = msg.senderId === user.email;
          return (
            <div key={msg.id || i} className={cn("flex flex-col", isSent ? "items-end" : "items-start")}>
              <div className={cn(
                "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm",
                isSent ? "bg-accent text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
              )}>
                {msg.content}
                <div className={cn("flex items-center gap-1 mt-1 justify-end", isSent ? "text-white/70" : "text-gray-400")}>
                  <span className="text-[9px]">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isSent && <CheckCheck size={12} className={msg.seen ? "text-blue-300" : ""} />}
                </div>
              </div>
            </div>
          );
        })}
        {receiverTyping && (
          <div className="flex items-start">
            <div className="bg-white border border-gray-100 p-2 px-3 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <div className="size-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="size-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="size-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input 
          type="text" 
          placeholder="Type a message..." 
          className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-accent text-sm transition-all"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={sendMessage} className="size-10 !p-0 flex items-center justify-center rounded-xl">
          <Send size={18} />
        </Button>
      </div>
    </div>,
    document.body
  );
}
