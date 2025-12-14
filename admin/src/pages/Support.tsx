import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { HelpCircle, Mail, Clock, Search } from "lucide-react";

const Support: React.FC = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Determine which view to show based on route
  const isTicketsView = location.pathname.includes("/support/tickets");
  const isFaqsView = location.pathname.includes("/support/faqs");
  const isMessagesView = location.pathname.includes("/support/messages");

  // Mock data - replace with actual API calls
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 86400000);
  const twoDaysAgo = new Date(now.getTime() - 172800000);

  const tickets = [
    {
      id: "TKT-001",
      user: "John Doe",
      subject: "Payment not received",
      status: "open",
      priority: "high",
      createdAt: now.toISOString(),
    },
    {
      id: "TKT-002",
      user: "Jane Smith",
      subject: "Account verification issue",
      status: "in_progress",
      priority: "medium",
      createdAt: oneDayAgo.toISOString(),
    },
    {
      id: "TKT-003",
      user: "Mike Johnson",
      subject: "Task approval delay",
      status: "resolved",
      priority: "low",
      createdAt: twoDaysAgo.toISOString(),
    },
  ];

  const faqs = [
    {
      id: 1,
      question: "How do I withdraw my earnings?",
      answer:
        "Go to your wallet, click on withdraw, enter the amount and your bank details.",
      category: "Payments",
    },
    {
      id: 2,
      question: "How long does KYC verification take?",
      answer: "KYC verification typically takes 24-48 hours.",
      category: "Account",
    },
    {
      id: 3,
      question: "What is the minimum withdrawal amount?",
      answer: "The minimum withdrawal amount is ₦1,000.",
      category: "Payments",
    },
  ];

  const oneHourAgo = new Date(now.getTime() - 3600000);

  const messages = [
    {
      id: 1,
      name: "Sarah Williams",
      email: "sarah@example.com",
      subject: "Partnership inquiry",
      message: "I would like to discuss a partnership opportunity...",
      createdAt: now.toISOString(),
      status: "unread",
    },
    {
      id: 2,
      name: "David Brown",
      email: "david@example.com",
      subject: "Feature request",
      message: "It would be great if you could add...",
      createdAt: oneHourAgo.toISOString(),
      status: "read",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <div className="badge badge-error">Open</div>;
      case "in_progress":
        return <div className="badge badge-warning">In Progress</div>;
      case "resolved":
        return <div className="badge badge-success">Resolved</div>;
      default:
        return <div className="badge badge-ghost">{status}</div>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <div className="badge badge-error">High</div>;
      case "medium":
        return <div className="badge badge-warning">Medium</div>;
      case "low":
        return <div className="badge badge-info">Low</div>;
      default:
        return <div className="badge badge-ghost">{priority}</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isTicketsView
              ? "Support Tickets"
              : isFaqsView
              ? "FAQs Management"
              : isMessagesView
              ? "Contact Messages"
              : "Support Center"}
          </h1>
          <p className="text-base-content/70">
            {isTicketsView
              ? "Manage user support tickets"
              : isFaqsView
              ? "Manage frequently asked questions"
              : isMessagesView
              ? "View contact form submissions"
              : "Manage support and help resources"}
          </p>
        </div>
        {isFaqsView && (
          <button className="btn btn-primary">
            <HelpCircle className="w-4 h-4 mr-2" />
            Add FAQ
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" />
            <input
              type="text"
              placeholder={`Search ${
                isTicketsView
                  ? "tickets"
                  : isFaqsView
                  ? "FAQs"
                  : isMessagesView
                  ? "messages"
                  : "support items"
              }...`}
              className="input input-bordered pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Support Tickets View */}
      {(isTicketsView || (!isFaqsView && !isMessagesView)) && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-4">Support Tickets</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>User</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="font-mono">{ticket.id}</td>
                      <td>{ticket.user}</td>
                      <td>{ticket.subject}</td>
                      <td>{getStatusBadge(ticket.status)}</td>
                      <td>{getPriorityBadge(ticket.priority)}</td>
                      <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FAQs View */}
      {isFaqsView && (
        <div className="grid grid-cols-1 gap-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">{faq.question}</h3>
                    </div>
                    <p className="text-base-content/70 ml-7">{faq.answer}</p>
                    <div className="mt-2 ml-7">
                      <div className="badge badge-outline">{faq.category}</div>
                    </div>
                  </div>
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-sm">
                      •••
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32"
                    >
                      <li>
                        <button>Edit</button>
                      </li>
                      <li>
                        <button className="text-error">Delete</button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Messages View */}
      {isMessagesView && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-4">Contact Messages</h2>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`card ${
                    message.status === "unread"
                      ? "bg-primary/5 border-l-4 border-primary"
                      : "bg-base-200"
                  }`}
                >
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4" />
                          <h3 className="font-semibold">{message.name}</h3>
                          {message.status === "unread" && (
                            <div className="badge badge-primary badge-sm">
                              New
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-base-content/60 mb-1">
                          {message.email}
                        </p>
                        <p className="font-medium mb-2">{message.subject}</p>
                        <p className="text-base-content/70">
                          {message.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-base-content/60">
                          <Clock className="w-4 h-4" />
                          {new Date(message.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <button className="btn btn-primary btn-sm">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
