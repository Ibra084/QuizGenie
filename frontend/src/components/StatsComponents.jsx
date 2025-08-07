import { useState, useEffect } from 'react';
import { BACKEND_ROUTE } from '../context/api';

export const StatsComponent = () => {
  const [displayStats, setDisplayStats] = useState([
    { number: "0", label: "Active Learners" },
    { number: "0", label: "Quizzes Created" },
    { number: "0", label: "Questions Answered" },
    { number: "0%", label: "Average Quiz Score" }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_ROUTE}/api/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json(); // Parse the JSON response
        
        if (data.success) {
          animateNumbers(data.stats); // Use data.stats instead of response.data.stats
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    const animateNumbers = (targetStats) => {
      const duration = 2000;
      const frameDuration = 1000 / 60;
      const totalFrames = Math.round(duration / frameDuration);
      
      targetStats.forEach((targetStat, index) => {
        let frame = 0;
        const targetValue = parseFloat(targetStat.number);
        const isPercentage = targetStat.number.includes('%');
        const startValue = 0;
        
        const counter = setInterval(() => {
          frame++;
          const progress = frame / totalFrames;
          const currentValue = Math.round(startValue + (progress * (targetValue - startValue)));
          
          setDisplayStats(prev => {
            const newStats = [...prev];
            newStats[index] = {
              ...newStats[index],
              number: isPercentage ? `${currentValue}%` : currentValue.toString()
            };
            return newStats;
          });
          
          if (frame === totalFrames) {
            clearInterval(counter);
          }
        }, frameDuration);
      });
    };

    fetchStats();
  }, []);

  // ... rest of your component remains the same
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
        {displayStats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-gray-900 animate-pulse">...</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
        {displayStats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
      {displayStats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};