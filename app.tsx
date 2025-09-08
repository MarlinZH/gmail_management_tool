import React, { useState, useEffect } from 'react';
import { Search, Mail, Trash2, User, AlertCircle, CheckSquare, Square, Filter, Zap } from 'lucide-react';

const GmailManagerApp = () => {
  const [emails, setEmails] = useState([]);
  const [senderGroups, setSenderGroups] = useState([]);
  const [selectedSenders, setSelectedSenders] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Simulated email data - in real app this would come from Gmail API
  const mockEmails = [
    { id: 1, sender: 'newsletter@shopping.com', subject: 'Flash Sale - 50% Off Everything!', date: '2025-01-15', category: 'promotional' },
    { id: 2, sender: 'notifications@facebook.com', subject: 'You have 5 new notifications', date: '2025-01-14', category: 'social' },
    { id: 3, sender: 'no-reply@amazon.com', subject: 'Your order has shipped', date: '2025-01-14', category: 'transactional' },
    { id: 4, sender: 'newsletter@shopping.com', subject: 'New Arrivals This Week', date: '2025-01-13', category: 'promotional' },
    { id: 5, sender: 'team@slack.com', subject: 'Weekly digest from your workspace', date: '2025-01-12', category: 'work' },
    { id: 6, sender: 'support@github.com', subject: 'Security alert for your account', date: '2025-01-12', category: 'security' },
    { id: 7, sender: 'notifications@linkedin.com', subject: 'Someone viewed your profile', date: '2025-01-11', category: 'social' },
    { id: 8, sender: 'newsletter@shopping.com', subject: 'Weekend Special Offers', date: '2025-01-10', category: 'promotional' },
    { id: 9, sender: 'billing@netflix.com', subject: 'Your monthly subscription receipt', date: '2025-01-09', category: 'billing' },
    { id: 10, sender: 'notifications@facebook.com', subject: 'Weekly summary', date: '2025-01-08', category: 'social' }
  ];

  // Group emails by sender
  const groupBySender = (emailList) => {
    const groups = {};
    emailList.forEach(email => {
      if (!groups[email.sender]) {
        groups[email.sender] = {
          sender: email.sender,
          emails: [],
          category: email.category,
          count: 0
        };
      }
      groups[email.sender].emails.push(email);
      groups[email.sender].count++;
    });
    return Object.values(groups).sort((a, b) => b.count - a.count);
  };

  // AI Analysis simulation
  const analyzeWithAI = async () => {
    setLoading(true);
    setAiAnalysis('Analyzing your inbox patterns...');
    
    // Simulate AI processing
    setTimeout(() => {
      const promotionalCount = emails.filter(e => e.category === 'promotional').length;
      const socialCount = emails.filter(e => e.category === 'social').length;
      
      let analysis = `📊 Inbox Analysis:\n\n`;
      analysis += `• Found ${promotionalCount} promotional emails (${Math.round(promotionalCount/emails.length*100)}% of inbox)\n`;
      analysis += `• ${socialCount} social media notifications detected\n`;
      analysis += `• Top sender: ${senderGroups[0]?.sender} with ${senderGroups[0]?.count} emails\n\n`;
      analysis += `💡 AI Recommendations:\n`;
      analysis += `• Consider unsubscribing from high-volume promotional senders\n`;
      analysis += `• Set up filters for social media notifications\n`;
      analysis += `• Bulk delete promotional emails older than 30 days`;
      
      setAiAnalysis(analysis);
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    setEmails(mockEmails);
    setSenderGroups(groupBySender(mockEmails));
  }, []);

  const toggleSenderSelection = (sender) => {
    const newSelection = new Set(selectedSenders);
    if (newSelection.has(sender)) {
      newSelection.delete(sender);
    } else {
      newSelection.add(sender);
    }
    setSelectedSenders(newSelection);
  };

  const selectAllSenders = () => {
    const filteredGroups = getFilteredGroups();
    setSelectedSenders(new Set(filteredGroups.map(group => group.sender)));
  };

  const deselectAll = () => {
    setSelectedSenders(new Set());
  };

  const deleteSelectedEmails = () => {
    const emailsToDelete = emails.filter(email => selectedSenders.has(email.sender));
    const remainingEmails = emails.filter(email => !selectedSenders.has(email.sender));
    
    setEmails(remainingEmails);
    setSenderGroups(groupBySender(remainingEmails));
    setSelectedSenders(new Set());
    
    alert(`Deleted ${emailsToDelete.length} emails from ${selectedSenders.size} senders`);
  };

  const getFilteredGroups = () => {
    let filtered = senderGroups;
    
    if (searchTerm) {
      filtered = filtered.filter(group => 
        group.sender.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(group => group.category === filterType);
    }
    
    return filtered;
  };

  const getCategoryColor = (category) => {
    const colors = {
      promotional: 'bg-orange-100 text-orange-800',
      social: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      transactional: 'bg-purple-100 text-purple-800',
      billing: 'bg-red-100 text-red-800',
      security: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredGroups = getFilteredGroups();
  const selectedEmailCount = emails.filter(email => selectedSenders.has(email.sender)).length;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Mail className="mr-3 text-blue-600" />
          AI Gmail Inbox Manager
        </h1>
        <p className="text-gray-600">Clean up your inbox with AI-powered sender analysis</p>
      </div>

      {/* AI Analysis Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Zap className="mr-2 text-purple-600" />
            AI Inbox Analysis
          </h2>
          <button
            onClick={analyzeWithAI}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Analyze Inbox
              </>
            )}
          </button>
        </div>
        {aiAnalysis && (
          <div className="bg-white rounded-lg p-4 whitespace-pre-line text-sm text-gray-700">
            {aiAnalysis}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search senders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="promotional">Promotional</option>
              <option value="social">Social</option>
              <option value="work">Work</option>
              <option value="transactional">Transactional</option>
              <option value="billing">Billing</option>
              <option value="security">Security</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={selectAllSenders}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="text-gray-600 hover:text-gray-700 text-sm font-medium"
            >
              Deselect All
            </button>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedSenders.size > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">
                {selectedEmailCount} emails from {selectedSenders.size} senders selected for deletion
              </span>
            </div>
            <button
              onClick={deleteSelectedEmails}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Sender Groups */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Emails by Sender ({filteredGroups.length} senders)
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredGroups.map((group) => (
            <div
              key={group.sender}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                selectedSenders.has(group.sender) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleSenderSelection(group.sender)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {selectedSenders.has(group.sender) ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{group.sender}</div>
                      <div className="text-sm text-gray-500">
                        {group.count} email{group.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(group.category)}`}>
                    {group.category}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {group.count}
                  </span>
                </div>
              </div>

              {/* Show recent email subjects */}
              <div className="mt-2 ml-8 space-y-1">
                {group.emails.slice(0, 2).map((email) => (
                  <div key={email.id} className="text-sm text-gray-600 truncate">
                    {email.subject} • {email.date}
                  </div>
                ))}
                {group.emails.length > 2 && (
                  <div className="text-sm text-gray-500">
                    +{group.emails.length - 2} more emails
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No senders found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>This is a demo app. In a real implementation, you'd need to:</p>
        <p>• Integrate with Gmail API for actual email access</p>
        <p>• Implement OAuth 2.0 authentication</p>
        <p>• Add real AI analysis using Claude API</p>
      </div>
    </div>
  );
};

export default GmailManagerApp;
