import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface VoteStat {
  teamName: string;
  votes: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2'];

const VotingStatistics: React.FC = () => {
  const [voteStats, setVoteStats] = useState<VoteStat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchVotingStats();
  }, []);

  const fetchVotingStats = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<VoteStat[]>('/votes/count');
      setVoteStats(response.data);
    } catch (err) {
      console.error('Error fetching voting statistics:', err);
      setError('Failed to load voting statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const totalVotes = voteStats.reduce((sum, team) => sum + team.votes, 0);

  if (isLoading) return <div className="text-center p-2">Loading statistics...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Voting Statistics</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <p className="text-lg font-medium">Total Votes: {totalVotes}</p>
      </div>

      {voteStats.length > 0 ? (
        <div>
          {/* Voting Table */}
          <table className="min-w-full divide-y divide-gray-200 mb-6">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {voteStats.map((stat, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{stat.teamName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{stat.votes}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {totalVotes > 0 ? (
                      <div className="flex items-center">
                        <span className="mr-2">{((stat.votes / totalVotes) * 100).toFixed(1)}%</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(stat.votes / totalVotes) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : '0%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="p-4 bg-gray-100 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Vote Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={voteStats}>
                  <XAxis dataKey="teamName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="votes" fill="#3182CE" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="p-4 bg-gray-100 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Vote Share</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={voteStats} dataKey="votes" nameKey="teamName" cx="50%" cy="50%" outerRadius={80} label>
                    {voteStats.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No votes yet</p>
      )}

      <div className="mt-4 text-right">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={fetchVotingStats}
        >
          Refresh Statistics
        </button>
      </div>
    </div>
  );
};

export default VotingStatistics;
