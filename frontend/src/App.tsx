import React, { useState, useEffect } from 'react';
import { Search, Mail, Trash2, User, AlertCircle, CheckSquare, Square, Filter, Zap, LogIn, LogOut, RefreshCw } from 'lucide-react';

interface Email {
  id: string;
  sender: string;
  subject: string;
  date: string;
  category: string;
}

interface SenderGroup {
  sender: string;
  count: number;
  emails: Email[];
  category: string;
}

const API_BASE = '';

const GmailManagerApp = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [senderGroups, setSenderGroups] = useState<SenderGroup[]>([]);
  const [selectedSenders, setSelectedSenders] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [authenticated, setAuthenticated] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
    
    // Check for auth success in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      setAuthenticated(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Fetch emails automatically after successful auth
      fetchEmails();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/status`, {
        credentials: 'include'
      });
      const data = await response.json();
      setAuthenticated(data.authenticated);
      
      if (data.authenticated) {
        fetchEmails();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setAuthenticated(false);
      setEmails([]);
      setSenderGroups([]);
      setSelectedSenders(new Set());
      setAiAnalysis('');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const fetchEmails = async () => {
    setFetchingData(true);
    try {
      const response = await fetch(`${API_BASE}/api/gmail/senders?maxResults=500`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      
      const data = await response.json();
      setSenderGroups(data.senders);
      
      // Flatten to email list
      const allEmails: Email[] = [];
      data.senders.forEach((sender: SenderGroup) => {
        sender.emails.forEach((email: any) => {
          allEmails.push({
            id: email.id,
            sender: sender.sender,
            subject: email.subject,
            date: email.date,
            category: sender.category
          });
        });
      });
      setEmails(allEmails);
    } catch (error) {
      console.error('Error fetching emails:', error);
      alert('Failed to fetch emails. Please try again.');
    } finally {
      setFetchingData(false);
    }
  };

  const analyzeWithAI = async () => {
    setLoading(true);
    setAiAnalysis('Analyzing your inbox patterns...');
    
    // Simulate AI processing
    setTimeout(() => {
      const promotionalCount = emails.filter(e => e.category === 'promotional').length;
      const socialCount = emails.filter(e => e.category === 'social').length;
      const totalEmails = emails.length;
      
      let analysis = `📊 Inbox Analysis:\n\n`;
      analysis += `• Total emails analyzed: ${totalEmails}\n`;
      analysis += `• Found ${promotionalCount} promotional emails (${Math.round(promotionalCount/totalEmails*100)}% of inbox)\n`;
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

  const toggleSenderSelection = (sender: string) => {
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

  const deleteSelectedEmails = async () => {
    if (selectedSenders.size === 0) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedEmailCount} emails from ${selectedSenders.size} senders? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/gmail/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          senders: Array.from(selectedSenders)
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete emails');
      }
      
      const result = await response.json();
      alert(`Successfully deleted ${result.deletedCount} emails!`);
      
      // Refresh the email list
      setSelectedSenders(new Set());
      await fetchEmails();
    } catch (error) {
      console.error('Error deleting emails:', error);
      alert('Failed to delete emails. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
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

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <Mail className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Gmail Manager
            </h1>
            <p className="text-gray-600">
              Clean up your inbox with AI-powered sender analysis
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3">
              <CheckSquare className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Smart Analysis</h3>
                <p className="text-sm text-gray-600">AI categorizes and analyzes your emails</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckSquare className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Bulk Delete</h3>
                <p className="text-sm text-gray-600">Remove emails from multiple senders at once</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckSquare className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Secure & Private</h3>
                <p className="text-sm text-gray-600">OAuth 2.0 authentication, no data stored</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 font-semibold"
          >
            <LogIn className="h-5 w-5" />
            <span>Sign in with Google</span>
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            We only request minimal permissions to read and delete emails
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Mail className="mr-3 text-blue-600" />
            AI Gmail Inbox Manager
          </h1>
          <p className="text-gray-600">Clean up your inbox with AI-powered sender analysis</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchEmails}
            disabled={fetchingData}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${fetchingData ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 flex items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
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
            disabled={loading || emails.length === 0}
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
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center disabled:opacity-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {loading ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        </div>
      )}

      {/* Sender Groups */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Emails by Sender ({filteredGroups.length} senders, {emails.length} total emails)
          </h2>
        </div>
        
        {fetchingData ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-gray-600">Loading your emails...</p>
          </div>
        ) : (
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
                      {email.subject} • {new Date(email.date).toLocaleDateString()}
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
        )}

        {!fetchingData && filteredGroups.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No senders found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GmailManagerApp;
