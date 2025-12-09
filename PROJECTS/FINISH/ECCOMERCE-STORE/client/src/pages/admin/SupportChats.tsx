import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, X, Clock, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Message {
  sender: string;
  senderType: 'customer' | 'support' | 'vendor';
  message: string;
  isRead: boolean;
  timestamp: string;
}

interface Chat {
  _id: string;
  participants: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    role: string;
  }>;
  messages: Message[];
  status: 'active' | 'closed';
  lastMessageAt: string;
}

export default function SupportChats() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'closed'>('active');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Get chat statistics
  const { data: stats } = useQuery({
    queryKey: ['chat-stats'],
    queryFn: async () => {
      const { data } = await api.get('/chat/admin/stats');
      return data.data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Get all support chats
  const { data: chats, isLoading } = useQuery({
    queryKey: ['admin-chats', statusFilter],
    queryFn: async () => {
      const { data } = await api.get(`/chat/admin/all?status=${statusFilter}`);
      return data.data.chats as Chat[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Get specific chat details
  const { data: chatDetails } = useQuery({
    queryKey: ['admin-chat', selectedChat?._id],
    queryFn: async () => {
      if (!selectedChat) return null;
      const { data } = await api.get(`/chat/admin/${selectedChat._id}`);
      return data.data.chat as Chat;
    },
    enabled: !!selectedChat,
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async ({ chatId, msg }: { chatId: string; msg: string }) => {
      const { data } = await api.post(`/chat/admin/${chatId}/send`, {
        message: msg,
      });
      return data;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin-chat', selectedChat?._id] });
      queryClient.invalidateQueries({ queryKey: ['admin-chats'] });
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  // Close chat mutation
  const closeMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const { data } = await api.patch(`/chat/admin/${chatId}/close`);
      return data;
    },
    onSuccess: () => {
      toast.success('Chat closed successfully');
      setSelectedChat(null);
      queryClient.invalidateQueries({ queryKey: ['admin-chats'] });
      queryClient.invalidateQueries({ queryKey: ['chat-stats'] });
    },
    onError: () => {
      toast.error('Failed to close chat');
    },
  });

  const handleSend = () => {
    if (!message.trim() || !selectedChat) return;
    sendMutation.mutate({ chatId: selectedChat._id, msg: message });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatDetails?.messages]);

  // Update selected chat when details change
  useEffect(() => {
    if (chatDetails) {
      setSelectedChat(chatDetails);
    }
  }, [chatDetails]);

  const getCustomer = (chat: Chat) => {
    return chat.participants.find(p => p.role === 'customer')?.user;
  };

  const getUnreadCount = (chat: Chat) => {
    return chat.messages.filter(m => m.senderType === 'customer' && !m.isRead).length;
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Customer Support Chats</h1>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/60">Active Chats</p>
                <p className="text-3xl font-bold">{stats?.activeChats || 0}</p>
              </div>
              <MessageCircle className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/60">Unread Messages</p>
                <p className="text-3xl font-bold">{stats?.unreadMessages || 0}</p>
              </div>
              <Clock className="w-12 h-12 text-warning" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/60">Closed Chats</p>
                <p className="text-3xl font-bold">{stats?.closedChats || 0}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow">
            <div className="card-body p-0">
              {/* Filter Tabs */}
              <div className="tabs tabs-boxed m-4">
                <button
                  className={`tab ${statusFilter === 'active' ? 'tab-active' : ''}`}
                  onClick={() => setStatusFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`tab ${statusFilter === 'closed' ? 'tab-active' : ''}`}
                  onClick={() => setStatusFilter('closed')}
                >
                  Closed
                </button>
              </div>

              {/* Chat List */}
              <div className="overflow-y-auto max-h-[600px]">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <span className="loading loading-spinner"></span>
                  </div>
                ) : !chats || chats.length === 0 ? (
                  <div className="p-4 text-center text-base-content/60">
                    No {statusFilter} chats
                  </div>
                ) : (
                  chats.map((chat: Chat) => {
                    const customer = getCustomer(chat);
                    const unread = getUnreadCount(chat);
                    return (
                      <button
                        key={chat._id}
                        onClick={() => setSelectedChat(chat)}
                        className={`w-full p-4 text-left border-b hover:bg-base-200 transition-colors ${
                          selectedChat?._id === chat._id ? 'bg-base-200' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">{customer?.name}</p>
                            <p className="text-sm text-base-content/60 truncate">
                              {chat.messages[chat.messages.length - 1]?.message}
                            </p>
                            <p className="text-xs text-base-content/40 mt-1">
                              {new Date(chat.lastMessageAt).toLocaleString()}
                            </p>
                          </div>
                          {unread > 0 && (
                            <span className="badge badge-primary badge-sm">
                              {unread}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          {!selectedChat ? (
            <div className="card bg-base-100 shadow h-[700px] flex items-center justify-center">
              <div className="text-center text-base-content/60">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a chat to start messaging</p>
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 shadow h-[700px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{getCustomer(selectedChat)?.name}</h3>
                  <p className="text-sm text-base-content/60">
                    {getCustomer(selectedChat)?.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  {selectedChat.status === 'active' && (
                    <button
                      onClick={() => closeMutation.mutate(selectedChat._id)}
                      disabled={closeMutation.isPending}
                      className="btn btn-sm btn-outline"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Close Chat
                    </button>
                  )}
                  <span className={`badge ${selectedChat.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                    {selectedChat.status}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChat.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.senderType === 'support' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.senderType === 'support'
                          ? 'bg-primary text-primary-content'
                          : 'bg-base-200'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {selectedChat.status === 'active' && (
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="input input-bordered flex-1"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sendMutation.isPending}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!message.trim() || sendMutation.isPending}
                      className="btn btn-primary"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
