<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import VisionHub from './components/VisionHub/VisionHub';
import SubmissionPortal from './components/Submissions/SubmissionPortal';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import SubmissionModal from './components/Submissions/SubmissionModal';
import SettingsModal from './components/Settings/SettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('vision');
  const [dbStatus, setDbStatus] = useState({
    isConnected: false,
    mode: 'checking...',
    uri: 'mongodb://localhost:27017/pose_headcount_db',
    message: 'Checking database...'
  });
  const [occupancyLimit, setOccupancyLimit] = useState(8);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [submissionModalData, setSubmissionModalData] = useState(null);
  const [newSubTrigger, setNewSubTrigger] = useState(0);

  // Poll database status from backend API
  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (err) {
      // Backend not yet reachable or starting up
      setDbStatus({
        isConnected: false,
        mode: 'local_fallback',
        uri: 'mongodb://localhost:27017/pose_headcount_db',
        message: 'Backend API starting up...'
      });
    }
  };

  useEffect(() => {
    fetchDbStatus();
    const interval = setInterval(fetchDbStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  // When user clicks "Capture for Submission" in VisionHub
  const handleOpenSubmissionModal = (captureData) => {
    setSubmissionModalData(captureData);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dbStatus={dbStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="app-container" style={{ flex: 1 }}>
        {activeTab === 'vision' && (
          <VisionHub
            occupancyLimit={occupancyLimit}
            onOpenSubmissionModal={handleOpenSubmissionModal}
          />
        )}

        {activeTab === 'submissions' && (
          <SubmissionPortal
            onOpenCreateModal={() => setSubmissionModalData({})}
            newSubmissionTrigger={newSubTrigger}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard dbStatus={dbStatus} />
        )}
      </main>

      {/* Global Capture & Work Submission Modal */}
      {submissionModalData && (
        <SubmissionModal
          initialData={submissionModalData}
          onClose={() => setSubmissionModalData(null)}
          onCreated={(created) => {
            setNewSubTrigger((prev) => prev + 1);
            // Switch to work submissions tab so user sees the new entry immediately!
            setActiveTab('submissions');
          }}
        />
      )}

      {/* Global System Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          occupancyLimit={occupancyLimit}
          setOccupancyLimit={setOccupancyLimit}
          dbStatus={dbStatus}
        />
      )}
    </div>
  );
}
=======
import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;
>>>>>>> 615b9ce114946ccb4261eff11e55b6e89fd6faf8
