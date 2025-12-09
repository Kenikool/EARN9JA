import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Get or create chat
  const { data: chatData } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      if (!chatId) {
        // Create new chat
        const { data } = await api.post('/chat/create', {
          type: 'customer-support',
        });
        setChatId(data.data.chat._id);
        return data.data.chat;
      }
      // Get existing chat
      const { data } = await api.get(`/chat/${chatId}/messages`);
      return data.data.chat;
    },
    enabled: isAuthenticated && isOpen,
    refetchInterval: isOpen ? 5000 : false, // Poll every 5 seconds when open
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (msg: string) => {
      if (!chatId) throw new Error('No chat ID');
      const { data } = await api.post(`/chat/${chatId}/send`, {
        message: msg,
      });
      return data;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message);
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
  }, [chatData?.messages]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 btn btn-circle btn-primary btn-lg shadow-lg z-50"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-base-100 rounded-lg shadow-2xl flex flex-col z-50 border border-base-300">
          {/* Header */}
          <div className="bg-primary text-primary-content p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-bold">Customer Support</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!chatData?.messages || chatData.messages.length === 0 ? (
              <div className="text-center text-base-content/60 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Start a conversation with our support team!</p>
              </div>
            ) : (
              chatData.messages.map((msg: unknown, index: number) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === user?._id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender === user?._id
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
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-base-300">
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
        </div>
      )}
    </>
  );
}
