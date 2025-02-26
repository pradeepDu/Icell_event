import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VotingStatistics from '../components/Admin/VotingStatistics';
import { useAdminData } from '../utils/useAdminData';
import StatusMessage from '../components/Admin/StatusMessage';
import VotingPeriodManager from '../components/Admin/VotingPeriodManager';
import TeamManager from '../components/Admin/TeamManager';
import MemberManager from '../components/Admin/MemberManager';
import gsap from 'gsap';

const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  
  const { 
    teams, 
    members, 
    voteStats, 
    activePeriod, 
    votingPeriods, 
    isLoading, 
    error, 
    setError, 
    fetchData 
  } = useAdminData();

  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      dashboardRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );
  }, []);

  const clearError = () => setError('');
  const clearSuccess = () => setSuccessMessage('');
  
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (!isAdmin) {
    console.log("Not an admin, redirecting to student page");
    return <Navigate to="/student" />;
  }

  if (isLoading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div ref={dashboardRef} className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-primary">Admin Dashboard</h1>
      
      <StatusMessage 
        error={error} 
        success={successMessage} 
        clearError={clearError} 
        clearSuccess={clearSuccess} 
      />

      <VotingPeriodManager
        activePeriod={activePeriod}
        votingPeriods={votingPeriods}
        onSuccess={handleSuccess}
        onError={setError}
        refreshData={fetchData}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TeamManager
          teams={teams}
          voteStats={voteStats}
          onError={setError}
          refreshData={fetchData}
        />

        <MemberManager
          teams={teams}
          members={members}
          onError={setError}
          refreshData={fetchData}
        />
      </div>
      
      <VotingStatistics />
    </div>
  );
};

export default AdminDashboard;
