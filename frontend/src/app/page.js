"use client";
import StudentPortal from './pages/student';
import TeacherDashboard from './pages/teacher';
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Eye, AlertCircle } from 'lucide-react';




const LandingPage = ({ setView }) => (
  <div className="text-center py-20 space-y-8">
    <h1 className="text-5xl font-bold">
      Empower Education with <br />
      <span className="text-blue-400">AI-Driven Insight</span>
    </h1>
    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
      A real-time telemetry system detecting student engagement, confusion, and integrity.
      Select a role to begin the demonstration.
    </p>
    <div className="flex justify-center gap-6">
      <button
        onClick={() => setView('student')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition"
      >
        I am a Student
      </button>
      <button
        onClick={() => setView('teacher')}
        className="bg-slate-800/50 border border-slate-700 hover:bg-slate-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition backdrop-blur-md"
      >
        I am a Teacher
      </button>
    </div>
    <div className="mt-12 p-6 bg-slate-800/50 border border-slate-700 rounded-xl max-w-md mx-auto backdrop-blur-md">
      <p className="text-sm text-yellow-400 mb-2">⚠️ Demo Mode Active</p>
      <p className="text-xs text-slate-400">
        If the Python backend is not running, this frontend defaults to simulation mode.
      </p>
    </div>
  </div>
);




export default function Home() {
  const [view, setView] = useState('landing'); // landing, student, teacher

  return (
    <div className="min-h-screen font-sans bg-slate-900 text-white">
      <nav className="border-b border-slate-700 bg-slate-900/50 p-4 sticky top-0 z-10 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <Eye className="text-blue-400" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              SuperVision
            </span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setView('student')}
              className={`px-4 py-2 rounded-lg transition ${
                view === 'student' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Student Portal
            </button>
            <button
              onClick={() => setView('teacher')}
              className={`px-4 py-2 rounded-lg transition ${
                view === 'teacher' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Teacher Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 md:p-8">
        {view === 'landing' && <LandingPage setView={setView} />}
        {view === 'student' && <StudentPortal />}
        {view === 'teacher' && <TeacherDashboard />}
      </main>
    </div>
  );
}