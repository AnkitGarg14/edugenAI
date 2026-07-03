import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentDocuments } from '../redux/slices/documentSlice';
import { useNavigate } from 'react-router-dom';
import { Target, Flame, Clock, FileText, MessageSquare, BookOpen, Brain, Calendar, FileCode2, File, Presentation, FileType2, Search } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ProgressChart from '../components/dashboard/ProgressChart';
import ListWidget from '../components/dashboard/ListWidget';
import TopicsWidget from '../components/dashboard/TopicsWidget';
import RecommendationWidget from '../components/dashboard/RecommendationWidget';
import { progressApi } from '../services/progressApi';
import { Database } from "lucide-react";

const getFileIcon = (format) => {
  switch (format) {
    case 'pdf': return FileType2;
    case 'docx': return FileText;
    case 'txt': return FileCode2;
    case 'ppt':
    case 'pptx': return Presentation;
    default: return File;
  }
};

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { recentDocuments } = useSelector((state) => state.documents);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchRecentDocuments());
    loadProgress();
  }, [dispatch]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await progressApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load progress', err);
    } finally {
      setLoading(false);
    }
  };

  const recentDocsFormatted = recentDocuments.map(doc => ({
    title: doc.title,
    subtitle: new Date(doc.createdAt).toLocaleDateString(),
    icon: getFileIcon(doc.format),
    colorClass: 'bg-primary/10 text-primary',
    rightContent: doc.status.toUpperCase(),
    onClick: () => navigate(`/documents/${doc._id}`)
  }));

  if (loading || !stats) {
    return <div className="p-8 text-center text-text-secondary font-medium">Loading Dashboard...</div>;
  }

  const recommendations = [];
  if (stats.weakTopics.length > 0) {
    recommendations.push({ title: 'Review Weak Topics', description: `Focus on ${stats.weakTopics[0].name} before your next quiz.`, actionText: 'Ask Tutor', onClick: () => navigate('/chat') });
  } else {
    recommendations.push({ title: 'Upload Material', description: 'Feed your AI more context by uploading notes.', actionText: 'Upload Document', onClick: () => navigate('/documents/upload') });
  }

  if (stats.streak < 1) {
    recommendations.push({ title: 'Start a Streak', description: 'Study for at least 10 minutes today to build your streak.', actionText: 'Take a Quiz', onClick: () => navigate('/quizzes') });
  } else {
    recommendations.push({ title: 'Generate a Plan', description: 'Let AI build a roadmap based on your current progress.', actionText: 'Study Planner', onClick: () => navigate('/study-plans') });
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-8 animate-fade-in">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Avg Quiz Score" 
          value={`${stats.avgQuizScore}%`}
          subtitle="All Attempts" 
          icon={Target} 
          trend="up" 
          trendValue="Overall" 
          color="primary" 
        />
        <StatCard 
          title="Study Streak" 
          value={stats.streak.toString()} 
          subtitle="Days" 
          icon={Flame} 
          trend="up" 
          trendValue="Active" 
          color="orange" 
        />
        <StatCard 
          title="Weekly Study" 
          value={stats.weeklyStudyHours.toString()} 
          subtitle="Hours" 
          icon={Clock} 
          trend="up" 
          trendValue="Last 7 Days" 
          color="green" 
        />
        <StatCard 
          title="Knowledge Base" 
          value={stats.totalDocuments.toString()} 
          subtitle="Documents" 
          icon={Database} 
          trend="up" 
          trendValue={`${stats.totalFlashcardDecks} Decks`} 
          color="purple" 
        />
      </div>

      {/* Main Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProgressChart title="Weekly Progress (Hours)" data={stats.chartData} />
        </div>
        <div className="lg:col-span-1">
          <RecommendationWidget recommendations={recommendations} />
        </div>
      </div>

      {/* Main Grid Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <TopicsWidget title="Weak Topics" topics={stats.weakTopics.length > 0 ? stats.weakTopics : [{ name: 'No weak topics detected', score: 0 }]} />
        </div>
        <div className="lg:col-span-1">
          <TopicsWidget title="Strong Topics" topics={stats.strongTopics.length > 0 ? stats.strongTopics : [{ name: 'Keep practicing!', score: 100 }]} />
        </div>
        <div className="lg:col-span-2">
          <ListWidget 
            title="Recent Documents" 
            items={recentDocsFormatted.length > 0 ? recentDocsFormatted : [{ title: 'No documents yet', subtitle: 'Upload a file to see it here' }]} 
            onViewAll={() => navigate('/documents')} 
          />
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
