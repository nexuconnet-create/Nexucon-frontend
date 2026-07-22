import React, { useState } from 'react';
import { X, BellRing, Plus, CheckCircle, Trash2 } from 'lucide-react';

interface ActivityAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityAlertsModal({ isOpen, onClose }: ActivityAlertsModalProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [alerts, setAlerts] = useState([
    { id: 1, text: "Alert me when the Skipper reviews my drawing", enabled: true },
    { id: 2, text: "Alert me when a Structural Report is uploaded", enabled: false },
  ]);
  const [newAlertText, setNewAlertText] = useState("");

  if (!isOpen) return null;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addAlert = () => {
    if (!newAlertText.trim()) return;
    setAlerts([...alerts, { id: Date.now(), text: newAlertText, enabled: true }]);
    setNewAlertText("");
    showToast("Alert rule created!");
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-[600px] shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#022C4F]">
              <BellRing size={24} />
            </div>
            <div>
              <h2 className="text-[20px] font-extrabold text-[#022C4F]">Activity Alerts</h2>
              <p className="text-[13px] text-gray-500 font-medium">Set custom notifications for specific events</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold text-gray-700">Create New Alert Rule</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newAlertText}
                onChange={(e) => setNewAlertText(e.target.value)}
                placeholder='e.g. "Alert me when Olivia approves the layout"' 
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#022C4F] transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && addAlert()}
              />
              <button 
                onClick={addAlert}
                disabled={!newAlertText.trim()}
                className="px-6 bg-[#022C4F] text-white rounded-xl font-bold hover:bg-[#033A6B] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-[13px] font-bold text-gray-700 mb-4 border-b border-gray-100 pb-2">Active Alerts</h3>
            <div className="flex flex-col gap-3">
              {alerts.length === 0 ? (
                <p className="text-[13px] text-gray-400 italic">No custom alerts set yet.</p>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-[#FAFAFA]">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${alert.enabled ? 'bg-[#022C4F]' : 'bg-gray-300'}`}
                        onClick={() => setAlerts(alerts.map(a => a.id === alert.id ? { ...a, enabled: !a.enabled } : a))}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${alert.enabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                      <span className={`text-[13px] font-medium ${alert.enabled ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                        {alert.text}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        setAlerts(alerts.filter(a => a.id !== alert.id));
                        showToast("Alert removed");
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0F181F] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[300] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <CheckCircle size={16} className="text-green-400" />
          <span className="text-[12px] font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
