// database.js - Complete Database System for CyberDev Portfolio

class MessageDB {
    constructor() {
        this.storageKey = 'cyberdev_messages';
        this.visitorKey = 'cyberdev_visitors';
        this.settingsKey = 'cyberdev_settings';
        this.initDB();
    }

    // Initialize Database
    initDB() {
        // Initialize messages
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
        
        // Initialize visitors
        if (!localStorage.getItem(this.visitorKey)) {
            localStorage.setItem(this.visitorKey, JSON.stringify([]));
        }
        
        // Initialize settings
        if (!localStorage.getItem(this.settingsKey)) {
            const defaultSettings = {
                notifications: true,
                autoRefresh: true,
                theme: 'dark',
                itemsPerPage: 10
            };
            localStorage.setItem(this.settingsKey, JSON.stringify(defaultSettings));
        }
    }

    // ============ MESSAGE FUNCTIONS ============
    
    // Add new message
    addMessage(message) {
        const messages = this.getMessages();
        const newMessage = {
            id: Date.now() + Math.random(),
            name: message.name || 'Anonymous',
            email: message.email || 'No Email',
            subject: message.subject || 'No Subject',
            message: message.message || 'No Message',
            timestamp: new Date().toISOString(),
            read: false,
            ip: this.getUserIP() || 'Unknown'
        };
        
        messages.push(newMessage);
        localStorage.setItem(this.storageKey, JSON.stringify(messages));
        
        // Trigger notification
        this.showNotification('New Message', `${newMessage.name} sent you a message`);
        
        return newMessage;
    }

    // Get all messages
    getMessages() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    // Get single message by ID
    getMessage(id) {
        const messages = this.getMessages();
        return messages.find(msg => msg.id === id);
    }

    // Get recent messages (last N messages)
    getRecentMessages(limit = 5) {
        const messages = this.getMessages();
        return messages.slice(-limit).reverse();
    }

    // Mark message as read
    markAsRead(id) {
        const messages = this.getMessages();
        const index = messages.findIndex(msg => msg.id === id);
        if (index !== -1) {
            messages[index].read = true;
            localStorage.setItem(this.storageKey, JSON.stringify(messages));
            return true;
        }
        return false;
    }

    // Mark all messages as read
    markAllAsRead() {
        const messages = this.getMessages();
        messages.forEach(msg => msg.read = true);
        localStorage.setItem(this.storageKey, JSON.stringify(messages));
    }

    // Delete message
    deleteMessage(id) {
        let messages = this.getMessages();
        const initialLength = messages.length;
        messages = messages.filter(msg => msg.id !== id);
        
        if (messages.length < initialLength) {
            localStorage.setItem(this.storageKey, JSON.stringify(messages));
            return true;
        }
        return false;
    }

    // Delete all messages
    deleteAllMessages() {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
        return true;
    }

    // Get unread message count
    getUnreadCount() {
        const messages = this.getMessages();
        return messages.filter(msg => !msg.read).length;
    }

    // Search messages
    searchMessages(query) {
        const messages = this.getMessages();
        const searchTerm = query.toLowerCase();
        
        return messages.filter(msg => 
            msg.name.toLowerCase().includes(searchTerm) ||
            msg.email.toLowerCase().includes(searchTerm) ||
            msg.subject.toLowerCase().includes(searchTerm) ||
            msg.message.toLowerCase().includes(searchTerm)
        );
    }

    // ============ VISITOR FUNCTIONS ============
    
    // Add visitor
    addVisitor() {
        const visitors = this.getVisitors();
        const today = new Date().toDateString();
        const now = new Date().toISOString();
        
        // Check if visitor already exists today
        let todayVisitor = visitors.find(v => v.date === today);
        
        if (todayVisitor) {
            todayVisitor.count += 1;
            todayVisitor.lastVisit = now;
            todayVisitor.visits.push(now);
        } else {
            visitors.push({
                date: today,
                count: 1,
                visits: [now],
                firstVisit: now,
                lastVisit: now,
                ip: this.getUserIP() || 'Unknown',
                userAgent: navigator.userAgent
            });
        }
        
        // Keep only last 30 days of data
        const recentVisitors = visitors.slice(-30);
        localStorage.setItem(this.visitorKey, JSON.stringify(recentVisitors));
        
        return todayVisitor || visitors[visitors.length - 1];
    }

    // Get all visitors
    getVisitors() {
        return JSON.parse(localStorage.getItem(this.visitorKey)) || [];
    }

    // Get total visitor count
    getTotalVisitors() {
        const visitors = this.getVisitors();
        return visitors.reduce((total, visitor) => total + visitor.count, 0);
    }

    // Get today's visitors
    getTodayVisitors() {
        const visitors = this.getVisitors();
        const today = new Date().toDateString();
        const todayVisitor = visitors.find(v => v.date === today);
        return todayVisitor ? todayVisitor.count : 0;
    }

    // Get visitor statistics
    getVisitorStats() {
        const visitors = this.getVisitors();
        const today = new Date().toDateString();
        
        // Calculate daily average
        const totalDays = visitors.length || 1;
        const totalVisits = this.getTotalVisitors();
        const dailyAverage = (totalVisits / totalDays).toFixed(1);
        
        // Get most active day
        let mostActiveDay = { date: 'N/A', count: 0 };
        visitors.forEach(visitor => {
            if (visitor.count > mostActiveDay.count) {
                mostActiveDay = { date: visitor.date, count: visitor.count };
            }
        });
        
        return {
            total: totalVisits,
            today: this.getTodayVisitors(),
            dailyAverage: dailyAverage,
            mostActiveDay: mostActiveDay,
            totalDays: totalDays
        };
    }

    // ============ DASHBOARD STATISTICS ============
    
    getDashboardStats() {
        const messages = this.getMessages();
        const visitorStats = this.getVisitorStats();
        
        // Calculate message statistics
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        const recentMessages = messages.filter(msg => 
            new Date(msg.timestamp) > last7Days
        );
        
        // Group messages by day
        const messagesByDay = {};
        recentMessages.forEach(msg => {
            const date = new Date(msg.timestamp).toDateString();
            messagesByDay[date] = (messagesByDay[date] || 0) + 1;
        });
        
        return {
            // Message stats
            totalMessages: messages.length,
            unreadMessages: this.getUnreadCount(),
            recentMessages: this.getRecentMessages(5),
            messagesLast7Days: recentMessages.length,
            messagesByDay: messagesByDay,
            
            // Visitor stats
            totalVisitors: visitorStats.total,
            todayVisitors: visitorStats.today,
            dailyAverage: visitorStats.dailyAverage,
            mostActiveDay: visitorStats.mostActiveDay,
            
            // Performance stats
            responseRate: this.calculateResponseRate(),
            engagementRate: this.calculateEngagementRate()
        };
    }

    // ============ HELPER FUNCTIONS ============
    
    // Calculate response rate (mock function)
    calculateResponseRate() {
        const messages = this.getMessages();
        if (messages.length === 0) return '100%';
        
        const responded = messages.filter(msg => msg.read).length;
        const rate = (responded / messages.length) * 100;
        return `${Math.min(rate, 100).toFixed(0)}%`;
    }

    // Calculate engagement rate (mock function)
    calculateEngagementRate() {
        const visitors = this.getTotalVisitors();
        const messages = this.getMessages();
        
        if (visitors === 0) return '0%';
        
        const rate = (messages.length / visitors) * 100;
        return `${Math.min(rate, 100).toFixed(1)}%`;
    }

    // Get user IP (simulated)
    getUserIP() {
        // Note: Real IP detection requires backend
        // This is a simulated version for demo
        const simulatedIPs = [
            '192.168.1.101',
            '10.0.0.55',
            '172.16.254.1',
            '203.0.113.195'
        ];
        return simulatedIPs[Math.floor(Math.random() * simulatedIPs.length)];
    }

    // Show notification
    showNotification(title, message) {
        if (this.getSettings().notifications && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, { body: message });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, { body: message });
                    }
                });
            }
        }
        
        // Also show browser alert
        console.log(`🔔 ${title}: ${message}`);
    }

    // ============ SETTINGS FUNCTIONS ============
    
    // Get settings
    getSettings() {
        return JSON.parse(localStorage.getItem(this.settingsKey)) || {};
    }

    // Update settings
    updateSettings(newSettings) {
        const currentSettings = this.getSettings();
        const updatedSettings = { ...currentSettings, ...newSettings };
        localStorage.setItem(this.settingsKey, JSON.stringify(updatedSettings));
        return updatedSettings;
    }

    // ============ BACKUP & RESTORE ============
    
    // Export all data
    exportData() {
        const data = {
            messages: this.getMessages(),
            visitors: this.getVisitors(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cyberdev-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return data;
    }

    // Import data
    importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            if (data.messages) {
                localStorage.setItem(this.storageKey, JSON.stringify(data.messages));
            }
            
            if (data.visitors) {
                localStorage.setItem(this.visitorKey, JSON.stringify(data.visitors));
            }
            
            if (data.settings) {
                localStorage.setItem(this.settingsKey, JSON.stringify(data.settings));
            }
            
            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            return { success: false, message: 'Invalid data format' };
        }
    }

    // Reset all data
    resetAllData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.visitorKey);
        localStorage.removeItem(this.settingsKey);
        this.initDB();
        return true;
    }

    // ============ UTILITY FUNCTIONS ============
    
    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Create global database instance
const cyberDevDB = new MessageDB();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Track visitor on portfolio page
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname === '/index.html') {
        cyberDevDB.addVisitor();
    }
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});

// Make database available globally
window.cyberDevDB = cyberDevDB;
window.MessageDB = MessageDB;
