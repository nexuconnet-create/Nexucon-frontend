import React, { useState } from 'react';
import { X, CopyPlus, CheckCircle, FileText, CalendarCheck, Zap } from 'lucide-react';

interface TaskTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskTemplatesModal({ isOpen, onClose }: TaskTemplatesModalProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const templates = [
    {
      id: "tmpl-001",
      name: "Standard Drawing Approval Process",
      description: "Generates a sequential workflow for drawing reviews including initial checks, coordination, and final sign-off.",
      tasks: 4,
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      color: "bg-blue-50 border-blue-100"
    },
    {
      id: "tmpl-002",
      name: "RFI Resolution Workflow",
      description: "Standardized set of tasks to process, investigate, and officially respond to a Request for Information.",
      tasks: 3,
      icon: <Zap className="w-5 h-5 text-yellow-600" />,
      color: "bg-yellow-50 border-yellow-100"
    },
    {
      id: "tmpl-003",
      name: "Pre-Construction Site Inspection",
      description: "Comprehensive checklist of tasks required before breaking ground, including safety, logistics, and alignment.",
      tasks: 7,
      icon: <CalendarCheck className="w-5 h-5 text-green-600" />,
      color: "bg-green-50 border-green-100"
    }
  ];

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 2000);
  };

  const handleApplyTemplate = (name: string) => {
    showToast(`Template "${name}" applied successfully!`);
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-[700px] shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#022C4F]">
              <CopyPlus size={24} />
            </div>
            <div>
              <h2 className="text-[20px] font-extrabold text-[#022C4F]">Task Templates</h2>
              <p className="text-[13px] text-gray-500 font-medium">Instantly generate reusable task workflows</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex flex-col gap-6">
          <p className="text-[13px] text-gray-600 mb-2">
            Select a template below to automatically generate its predefined set of tasks, complete with priority levels and dependencies.
          </p>

          <div className="flex flex-col gap-4">
            {templates.map(template => (
              <div key={template.id} className={`flex items-start justify-between p-5 border rounded-2xl transition-colors hover:shadow-md bg-white border-gray-200 hover:border-[#022C4F]`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${template.color}`}>
                    {template.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[14px] font-bold text-[#0F181F]">{template.name}</h3>
                    <p className="text-[12px] text-gray-500 max-w-[400px] leading-relaxed">
                      {template.description}
                    </p>
                    <span className="text-[11px] font-bold text-[#022C4F] mt-2 bg-blue-50 w-fit px-2 py-0.5 rounded-md">
                      {template.tasks} Tasks Generated
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleApplyTemplate(template.name)}
                  className="px-5 py-2.5 bg-[#022C4F] text-white rounded-xl text-[12px] font-bold hover:bg-[#033A6B] transition-colors shrink-0"
                >
                  Use Template
                </button>
              </div>
            ))}
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
