import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Mon', blue: 30, coral: 25 },
  { name: 'Tue', blue: 50, coral: 35 },
  { name: 'Wed', blue: 25, coral: 40 },
  { name: 'Thu', blue: 40, coral: 20 },
  { name: 'Fri', blue: 60, coral: 10 },
  { name: 'Sat', blue: 85, coral: 60 },
  { name: 'Sun', blue: 25, coral: 40 },
];

export default function ActivityTab() {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Documents', 'Comments', 'Approvals', 'Team Changes', 'System Alerts'];

  const activities = [
    { id: 1, type: 'Comments', content: 'David Bello mentioned you in a comment on Structural Design v3.0.', time: '2 hours ago', isUnread: true, user: 'David Bello' },
    { id: 2, type: 'Documents', content: 'New architectural drawing "Floor Plan Level 2" was uploaded.', time: '5 hours ago', isUnread: false, user: 'Sarah Jane' },
    { id: 3, type: 'Approvals', content: 'MEP Coordination Package was approved by lead engineer.', time: 'Yesterday', isUnread: false, user: 'System' },
    { id: 4, type: 'Team Changes', content: 'John Doe joined the project as a Consultant.', time: '2 days ago', isUnread: false, user: 'Admin' },
    { id: 5, type: 'System Alerts', content: 'Upcoming milestone deadline: Foundation Completion in 3 days.', time: '3 days ago', isUnread: true, user: 'System' }
  ];

  const filteredActivities = activeFilter === 'All' ? activities : activities.filter(a => a.type === activeFilter);

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both">
      <div className="mb-10">
        <h3 className="text-[26px] font-extrabold text-[#022C4F] mb-3">Project Activity Feed</h3>
        <p className="text-[11px] text-[#0F181F] font-medium max-w-2xl leading-relaxed">
          Monitor all project actions, design updates, document submissions, review comments, approvals, meetings, and collaboration activities from a centralized activity timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Total Activities */}
        <div className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col shadow-sm min-h-[450px]">
          <div className="flex justify-between items-start mb-6">
            <h4 className="text-[11px] font-medium text-gray-400">Total Activities</h4>
            <button className="px-5 py-2 border border-[#022C4F] rounded-full text-[10px] font-bold text-[#022C4F] hover:bg-gray-50 transition-colors shadow-sm">
              View Details
            </button>
          </div>
          
          <div className="text-[40px] font-extrabold text-[#022C4F] mb-10 leading-none">486</div>

          {/* Progress Bar */}
          <div className="flex h-12 rounded-lg overflow-hidden gap-1 mb-12">
            <div className="bg-[#022C4F] h-full" style={{ width: '35%' }}></div>
            <div className="bg-[#990000] h-full" style={{ width: '15%' }}></div>
            <div className="bg-[#827717] h-full" style={{ width: '20%' }}></div>
            <div className="bg-[#0277BD] h-full" style={{ width: '20%' }}></div>
            <div className="bg-[#4A148C] h-full" style={{ width: '10%' }}></div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-6 flex-1 justify-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-[18px] h-[18px] rounded-full bg-[#022C4F]"></div>
                <span className="text-[11px] font-bold text-[#0F181F]">Today's Activities</span>
              </div>
              <span className="text-[11px] font-bold text-gray-400">24</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-[18px] h-[18px] rounded-full bg-[#990000]"></div>
                <span className="text-[11px] font-bold text-[#0F181F]">Team Actions</span>
              </div>
              <span className="text-[11px] font-bold text-gray-400">162</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-[18px] h-[18px] rounded-full bg-[#827717]"></div>
                <span className="text-[11px] font-bold text-[#0F181F]">Document Updates</span>
              </div>
              <span className="text-[11px] font-bold text-gray-400">108</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-[18px] h-[18px] rounded-full bg-[#0277BD]"></div>
                <span className="text-[11px] font-bold text-[#0F181F]">Reviews & Approvals</span>
              </div>
              <span className="text-[11px] font-bold text-gray-400">96</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-[18px] h-[18px] rounded-full bg-[#4A148C]"></div>
                <span className="text-[11px] font-bold text-[#0F181F]">Meetings & Events</span>
              </div>
              <span className="text-[11px] font-bold text-gray-400">42</span>
            </div>
          </div>
        </div>

        {/* Card 2: Chart */}
        <div className="border border-[#022C4F] rounded-[32px] overflow-hidden flex flex-col shadow-sm min-h-[450px]">
          {/* Top Half */}
          <div className="bg-[#F5F5F5] p-8 flex flex-col">
            <h4 className="text-[11px] font-medium text-gray-400 mb-2">Today's Total Time</h4>
            <div className="text-[20px] font-bold text-[#0F181F] mb-4">11 hours 20 Minutes</div>
            <div className="flex items-center gap-2 self-end">
               <div className="w-[18px] h-[18px] rounded-full bg-[#00C853] flex items-center justify-center text-white">
                 <ArrowUp size={12} strokeWidth={4} />
               </div>
               <span className="text-[11px] font-bold text-[#00C853]">12% <span className="text-gray-400 font-medium">vs yesterday</span></span>
            </div>
          </div>
          
          {/* Bottom Half: Chart */}
          <div className="bg-white p-6 pt-10 flex-1 flex flex-col justify-end relative h-[250px]">
             <div className="w-full h-full mt-auto relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={{ stroke: '#0F181F' }} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} 
                      ticks={[0, 30, 60, 90]} 
                      domain={[0, 90]} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="blue" 
                      stroke="#7C4DFF" 
                      strokeWidth={2.5} 
                      dot={false} 
                      activeDot={{ r: 4 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="coral" 
                      stroke="#FF8A65" 
                      strokeWidth={2.5} 
                      dot={false} 
                      activeDot={{ r: 4 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

      </div>

      {/* Activity Feed Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-[15px] font-bold text-[#022C4F]">Recent Activities</h4>
          
          <div className="flex bg-gray-50 p-1 rounded-full border border-gray-100 overflow-x-auto hide-scrollbar max-w-full">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${activeFilter === filter ? 'bg-white text-[#022C4F] shadow-sm' : 'text-gray-500 hover:text-[#022C4F]'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="p-5 border border-gray-100 bg-white rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              {activity.isUnread && (
                <div className="absolute top-0 left-0 w-1 h-full bg-[#E53935]"></div>
              )}
              
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-[12px] font-bold text-[#022C4F]">{activity.user.charAt(0)}</span>
              </div>
              
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#0F181F]">{activity.user}</span>
                  <span className="text-[10px] font-medium text-gray-400">{activity.time}</span>
                </div>
                <p className="text-[12px] text-gray-600 leading-relaxed pr-8">
                  {activity.content}
                </p>
                {activity.isUnread && (
                  <div className="mt-2 flex">
                    <span className="bg-[#FFEBEE] text-[#E53935] text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 border border-[#FFCDD2]">
                      Unread Alert
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <div className="p-8 text-center border border-dashed border-gray-300 rounded-2xl">
              <p className="text-[12px] text-gray-500 font-medium">No activities found for this filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
