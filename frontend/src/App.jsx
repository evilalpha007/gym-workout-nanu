import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Leaderboard from './pages/Leaderboard';
import DailyUpload from './pages/DailyUpload';
import Profile from './pages/Profile';
import Quests from './pages/Quests';
import AdminDashboard from './pages/AdminDashboard'; // Now exists

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Leaderboard />} />
        <Route path="upload" element={<DailyUpload />} />
        <Route path="quests" element={<Quests />} />
        <Route path="profile/:username" element={<Profile />} />
        <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
