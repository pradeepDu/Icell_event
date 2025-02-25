import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Types for our team structure
interface TeamMember {
  id: string;
  name: string;
  email: string;
  post: string;
  isLeader: boolean;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  votes: number;
  votedBy: string[]; // Array of user IDs who voted for this team
}

// Admin-only component
const AdminPanel: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Mock data - in a real app, you'd fetch this from your backend
    setStudents([
      { id: "1", name: 'Student 1', email: 'student1@student.mes.ac.in', lastLogin: '2025-02-24' },
      { id: "2", name: 'Student 2', email: 'student2@student.mes.ac.in', lastLogin: '2025-02-23' },
      { id: "3", name: 'Student 3', email: 'student3@student.mes.ac.in', lastLogin: '2025-02-22' }
    ]);

    // In a real application, fetch teams from a database/backend
    const savedTeams = localStorage.getItem('teams');
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    }
  }, []);

  // Save teams to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
  }, [teams]);
  
  // Team modal component
  const TeamModal: React.FC = () => {
    const [teamName, setTeamName] = useState('');
    const [members, setMembers] = useState<TeamMember[]>([{ 
      id: "1", 
      name: '', 
      email: '', 
      post: '', 
      isLeader: false 
    }]);

    const addMember = () => {
      setMembers([...members, { 
        id: Date.now().toString(), 
        name: '', 
        email: '', 
        post: '', 
        isLeader: false 
      }]);
    };

    const updateMember = (index: number, field: keyof TeamMember, value: string | boolean) => {
      const updatedMembers = [...members];
      updatedMembers[index] = { 
        ...updatedMembers[index], 
        [field]: value 
      };
      
      // If setting a member as leader, make sure others are not leaders
      if (field === 'isLeader' && value === true) {
        updatedMembers.forEach((member, i) => {
          if (i !== index) {
            member.isLeader = false;
          }
        });
      }
      
      setMembers(updatedMembers);
    };

    const removeMember = (index: number) => {
      const updatedMembers = [...members];
      updatedMembers.splice(index, 1);
      setMembers(updatedMembers);
    };

    const handleSubmit = () => {
      const newTeam: Team = {
        id: Date.now().toString(),
        name: teamName,
        members: members,
        votes: 0,
        votedBy: []
      };
      
      setTeams([...teams, newTeam]);
      setShowTeamModal(false);
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter team name"
            />
          </div>
          
          <h3 className="font-medium mb-2">Team Members</h3>
          
          {members.map((member, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Member {index + 1}</h4>
                <button 
                  onClick={() => removeMember(index)}
                  className="text-red-600 hover:text-red-800"
                  disabled={members.length <= 1}
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateMember(index, 'name', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Member name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateMember(index, 'email', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Member email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post/Role
                  </label>
                  <input
                    type="text"
                    value={member.post}
                    onChange={(e) => updateMember(index, 'post', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Member role"
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={member.isLeader}
                      onChange={(e) => updateMember(index, 'isLeader', e.target.checked)}
                      className="mr-2"
                    />
                    Team Leader
                  </label>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            onClick={addMember}
            className="mb-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Add Member
          </button>
          
          <div className="flex justify-end space-x-4">
            <button 
              onClick={() => setShowTeamModal(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              disabled={!teamName || members.some(m => !m.name || !m.post)}
            >
              Create Team
            </button>
          </div>
        </div>
      </div>
    );
  };

  const deleteTeam = (teamId: string) => {
    setTeams(teams.filter(team => team.id !== teamId));
  };
  
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Admin Controls</h2>
          <button 
            onClick={() => setShowTeamModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Create New Team
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Student Management</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map(student => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {showTeamModal && <TeamModal />}
    </div>
  );
};

// Student-only component
const StudentDashboard: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Student Dashboard</h2>
      <p className="mb-4">Welcome to your student portal!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-2">Your Courses</h3>
          <ul className="list-disc pl-5">
            <li>Introduction to Programming</li>
            <li>Data Structures</li>
            <li>Web Development</li>
          </ul>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-2">Upcoming Assignments</h3>
          <ul className="list-disc pl-5">
            <li>Project Proposal - Due Mar 1, 2025</li>
            <li>Midterm Exam - Mar 15, 2025</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Shared component for team voting
const TeamVoting: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const { currentUser, isAdmin } = useAuth();
  const userId = currentUser?.email || '';
  
  useEffect(() => {
    // In a real app, you'd fetch from a database/backend
    const savedTeams = localStorage.getItem('teams');
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    }
    
    // Set up a simple polling mechanism to check for updates
    // In a real app, you'd use websockets or server-sent events
    const interval = setInterval(() => {
      const updatedTeams = localStorage.getItem('teams');
      if (updatedTeams) {
        setTeams(JSON.parse(updatedTeams));
      }
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const handleVote = (teamId: string) => {
    // Don't allow admins to vote
    if (isAdmin) return;
    
    const updatedTeams = teams.map(team => {
      // Check if user already voted for any team
      const userVotedForAnyTeam = teams.some(t => t.votedBy.includes(userId));
      
      // If user already voted for this team, remove the vote
      if (team.id === teamId && team.votedBy.includes(userId)) {
        return {
          ...team,
          votes: team.votes - 1,
          votedBy: team.votedBy.filter(id => id !== userId)
        };
      } 
      // If user hasn't voted yet and is voting for this team
      else if (team.id === teamId && !userVotedForAnyTeam) {
        return {
          ...team,
          votes: team.votes + 1,
          votedBy: [...team.votedBy, userId]
        };
      }
      // If user already voted for another team and is changing vote
      else if (team.id === teamId && !team.votedBy.includes(userId)) {
        // Remove vote from other team
        teams.forEach(t => {
          if (t.votedBy.includes(userId)) {
            t.votes -= 1;
            t.votedBy = t.votedBy.filter(id => id !== userId);
          }
        });
        
        return {
          ...team,
          votes: team.votes + 1,
          votedBy: [...team.votedBy, userId]
        };
      }
      return team;
    });
    
    setTeams(updatedTeams);
    localStorage.setItem('teams', JSON.stringify(updatedTeams));
  };
  
  const hasVoted = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.votedBy.includes(userId) || false;
  };
  
  const userHasVoted = teams.some(team => team.votedBy.includes(userId));
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Team Voting</h2>
      
      {teams.length === 0 ? (
        <p className="text-gray-500">No teams available for voting yet.</p>
      ) : (
        <>
          {!isAdmin && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800">
                {userHasVoted 
                  ? "You have cast your vote. You can change your vote by clicking on another team." 
                  : "Vote for your favorite team by clicking the Vote button."}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map(team => (
              <div key={team.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{team.name}</h3>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {team.votes} {team.votes === 1 ? 'vote' : 'votes'}
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-medium mb-2">Team Members</h4>
                  <ul className="space-y-2">
                    {team.members.map((member, index) => (
                      <li key={index} className="flex justify-between">
                        <div>
                          <span className="font-medium">{member.name}</span>
                          {member.isLeader && (
                            <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                              Leader
                            </span>
                          )}
                          <p className="text-sm text-gray-600">{member.post}</p>
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                  {isAdmin ? (
                    <button 
                      onClick={() => setTeams(teams.filter(t => t.id !== team.id))}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete Team
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleVote(team.id)}
                      className={`px-4 py-2 rounded ${
                        hasVoted(team.id) 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {hasVoted(team.id) ? 'Voted' : 'Vote'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { currentUser, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Admin Dashboard' : 'Student Portal'}
          </h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-600">
              {isAdmin ? 'Admin' : currentUser?.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {isAdmin && <AdminPanel />}
        {isStudent && <StudentDashboard />}
        
        {/* Team voting section visible to both admins and students */}
        <TeamVoting />
      </main>
    </div>
  );
};

export default Dashboard;