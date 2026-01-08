import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Eye, AlertCircle } from 'lucide-react';
const TeacherDashboard = () => {
  const [students, setStudents] = useState([
    { id: 1, name: "Alex Chen", emotion: "Focused", history: [] },
    { id: 2, name: "Sarah Jones", emotion: "Confused", history: [] },
    { id: 3, name: "Mike Ross", emotion: "Focused", history: [] },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStudents((prev) =>
        prev.map((s) => {
          const newVal = s.emotion === "Confused" ? 30 : s.emotion === "Happy/Surprised" ? 80 : 60;
          const randomShift = Math.floor(Math.random() * 20) - 10;
          const score = Math.max(0, Math.min(100, newVal + randomShift));

          const newHistory = [...s.history, { time: new Date().toLocaleTimeString(), score }];
          if (newHistory.length > 20) newHistory.shift();

          let newEmotion = s.emotion;
          if (Math.random() > 0.95) newEmotion = "Confused";
          else if (Math.random() > 0.9) newEmotion = "Focused";

          return { ...s, emotion: newEmotion, history: newHistory };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Classroom Session: MATH-101</h2>
          <p className="text-slate-400">Live monitoring active • 3 Students Present</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">66%</div>
            <div className="text-xs text-green-500">Engagement</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-400">1</div>
            <div className="text-xs text-yellow-500">Confused</div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <div
            key={student.id}
            className={`bg-slate-800/50 border border-slate-700 backdrop-blur-md rounded-xl overflow-hidden border-l-4 ${
              student.emotion === 'Confused' ? 'border-l-yellow-500' : 'border-l-green-500'
            }`}
          >
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{student.name}</h3>
                <p className="text-slate-400 text-sm">ID: #{student.id}002</p>
              </div>
              <StatusBadge
                status={student.emotion === 'Confused' ? 'yellow' : 'green'}
                text={student.emotion}
              />
            </div>
            <div className="h-32 w-full mt-4 pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={student.history}>
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={student.emotion === 'Confused' ? '#eab308' : '#22c55e'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {student.emotion === 'Confused' && (
              <div className="bg-yellow-500/10 p-3 text-xs text-yellow-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Persistent furrowing detected (15s)</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
const StatusBadge = ({ status, text }) => {
  const colors = {
    green: "bg-green-500/20 text-green-400 border-green-500/50",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    red: "bg-red-500/20 text-red-400 border-red-500/50",
    gray: "bg-gray-500/20 text-gray-400 border-gray-500/50"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[status] || colors.gray}`}>
      {text}
    </span>
  );
};
export default TeacherDashboard;

