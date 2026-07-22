"use client";

import React, { useState } from "react";
import Link from "next/link";
import TopRightControls from "@/components/dashboard/TopRightControls";
import { CheckSquare, Square, CheckCircle2 } from "lucide-react";
import EditProjectSettingsModal, { ProjectInfo, GeneralSettings } from "@/components/dashboard/EditProjectSettingsModal";

export default function PermissionsPage() {
  const activeTab: string = "Permission Overview";

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Project Info State
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: "Victoria Heights Commercial Development",
    id: "NXC-PRJ-2026-001",
    type: "Mixed-Use Commercial Development",
    phase: "Design Development",
    location: "Victoria Island, Lagos, Nigeria",
    manager: "Olivia Thompson",
    status: "Active",
  });

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    language: "English",
    timeZone: "West Africa Time (UTC +1)",
    measurementUnits: "Metric (Meters)",
    dateFormat: "DD/MM/YYYY",
    currency: "Nigerian Naira (₦)",
  });

  const [collabSettings, setCollabSettings] = useState<Record<string, boolean>>({
    "Enable Team Collaboration": true,
    "Enable Document Sharing": true,
    "Enable Review Topics": true,
    "Enable Drawing Annotations": true,
    "Enable Activity Tracking": true,
    "Enable Version History": true,
  });

  const [bimSettings, setBimSettings] = useState<Record<string, boolean>>({
    "Enable BIM Model Viewer": true,
    "Enable Model Version Comparison": true,
    "Enable Clash Detection": true,
    "Enable Shared Design Workspace": true,
    "Enable AR Model Viewer": true,
  });

  // Permission Overview State
  const [workspacePerms, setWorkspacePerms] = useState<Record<string, boolean>>({
    "Dashboard": true,
    "Data Explorer": true,
    "Views": false,
    "Deliverables": true,
    "Activity": false,
    "Review Topics": true,
    "Shared Design Workspace": true,
    "Drawings & Documents": true,
    "Tasks": true,
    "Team": false,
    "Meetings": false,
    "AR Model Viewer": true,
  });

  const [projectPerms, setProjectPerms] = useState<Record<string, boolean>>({
    "View Project": true,
    "Edit Project": true,
    "Upload Documents": true,
    "Download Files": true,
    "Share Files": false,
    "Create Review Topics": true,
    "Assign Reviewers": true,
    "Create Tasks": true,
    "Assign Tasks": true,
    "Schedule Meetings": true,
    "Invite Team Members": false,
    "Publish Deliverables": true,
  });

  const [externalPerms, setExternalPerms] = useState<Record<string, boolean>>({
    "Allow Client Access": true,
    "Allow External Consultants": true,
    "Enable Guest Access": true,
    "Download Files": true,
    "Require Invitation Approval": false,
  });

  const [securityPerms, setSecurityPerms] = useState<Record<string, boolean>>({
    "Two-Factor Authentication": true,
    "Activity Logging": true,
    "Watermark Downloads": true,
    "Restrict File Deletion": true,
    "Session Timeout": false,
  });

  // Review Management State
  const [reviewerAssignment, setReviewerAssignment] = useState<Record<string, boolean>>({
    "Automatic Assignment": true,
    "Manual Assignment": false,
    "Multi-Discipline Review": false,
    "External Reviewers": true,
  });

  const [approvalReqs, setApprovalReqs] = useState<Record<string, boolean>>({
    "Minimum Reviewers Required": true,
    "Technical Approval Required": true,
    "Client Approval Required": false,
    "Final Design Approval": true,
  });

  const [dueDateReminders, setDueDateReminders] = useState<Record<string, boolean>>({
    "24 hours Before": true,
    "On Due Date": true,
    "Overdue Reminder": false,
  });

  const [reviewPerms, setReviewPerms] = useState<Record<string, boolean>>({
    "Create Review Topics": true,
    "Assign Reviewers": true,
    "Add Comments": true,
    "Create Annotations": true,
    "Upload Supporting Files": false,
    "Recommend Approval": false,
    "Request Revisions": true,
    "Close Review Topics": true,
  });

  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    "Email Notifications": true,
    "In-App Notifications": true,
    "Activity Feed Updates": true,
    "Meeting Invitations": true,
  });

  const toggleCollabSetting = (key: string) => {
    setCollabSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleBimSetting = (key: string) => {
    setBimSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleWorkspacePerm = (key: string) => setWorkspacePerms(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleProjectPerm = (key: string) => setProjectPerms(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleExternalPerm = (key: string) => setExternalPerms(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleSecurityPerm = (key: string) => setSecurityPerms(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleReviewerAssignment = (key: string) => setReviewerAssignment(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleApprovalReqs = (key: string) => setApprovalReqs(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleDueDateReminders = (key: string) => setDueDateReminders(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleReviewPerms = (key: string) => setReviewPerms(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleNotifications = (key: string) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSaveProjectInfo = () => {
    showToast("Project Information saved successfully!");
  };

  const handleSavePermissions = () => {
    showToast("Workspace permissions saved successfully!");
  };

  const handleRestorePermissionsDefaults = () => {
    setWorkspacePerms({
      "Dashboard": true, "Data Explorer": true, "Views": false, "Deliverables": true,
      "Activity": false, "Review Topics": true, "Shared Design Workspace": true, "Drawings & Documents": true,
      "Tasks": true, "Team": false, "Meetings": false, "AR Model Viewer": true,
    });
    setProjectPerms({
      "View Project": true, "Edit Project": true, "Upload Documents": true, "Download Files": true,
      "Share Files": false, "Create Review Topics": true, "Assign Reviewers": true, "Create Tasks": true,
      "Assign Tasks": true, "Schedule Meetings": true, "Invite Team Members": false, "Publish Deliverables": true,
    });
    setExternalPerms({
      "Allow Client Access": true, "Allow External Consultants": true, "Enable Guest Access": true,
      "Download Files": true, "Require Invitation Approval": false,
    });
    setSecurityPerms({
      "Two-Factor Authentication": true, "Activity Logging": true, "Watermark Downloads": true,
      "Restrict File Deletion": true, "Session Timeout": false,
    });
    showToast("Restored permission defaults.");
  };

  const handleSaveReviewSettings = () => {
    showToast("Review settings saved successfully!");
  };

  const handleRestoreReviewDefaults = () => {
    setReviewerAssignment({
      "Automatic Assignment": true, "Manual Assignment": false, "Multi-Discipline Review": false, "External Reviewers": true,
    });
    setApprovalReqs({
      "Minimum Reviewers Required": true, "Technical Approval Required": true, "Client Approval Required": false, "Final Design Approval": true,
    });
    setDueDateReminders({
      "24 hours Before": true, "On Due Date": true, "Overdue Reminder": false,
    });
    setReviewPerms({
      "Create Review Topics": true, "Assign Reviewers": true, "Add Comments": true, "Create Annotations": true,
      "Upload Supporting Files": false, "Recommend Approval": false, "Request Revisions": true, "Close Review Topics": true,
    });
    setNotifications({
      "Email Notifications": true, "In-App Notifications": true, "Activity Feed Updates": true, "Meeting Invitations": true,
    });
    showToast("Restored review setting defaults.");
  };

  const getHeaderDescription = () => {
    switch (activeTab) {
      case "Project Settings":
        return "Configure project information, collaboration preferences, BIM settings, document management, review workflows, integrations, and security options to ensure consistent project governance throughout the design lifecycle.";
      case "Permission Overview":
        return "Configure default access levels and workspace permissions for everyone collaborating on this project.";
      case "Review Management":
        return "Configure the default review workflow, reviewer assignments, approval rules, notifications, and review timelines for this project.";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-[#022C4F] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={20} className="text-[#00D000]" />
          <span className="text-[14px] font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-2xl">
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#022C4F] leading-tight">
            {activeTab}
          </h1>
          <p className="text-[12px] md:text-[14px] text-gray-600 font-medium leading-relaxed min-h-[40px]">
            {getHeaderDescription()}
          </p>
        </div>
        
        <TopRightControls />
      </div>

      {/* Tabs */}
      <div className="flex mt-2 shrink-0 overflow-x-auto hide-scrollbar">
        {[
          { name: "Project Settings", href: "/professional/dashboard/settings" },
          { name: "Permission Overview", href: "/professional/dashboard/permissions" },
          { name: "Review Management", href: "/professional/dashboard/review-management" },
          { name: "BIM Standards", href: "/professional/dashboard/bim-standards" }
        ].map((tab, index) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={`px-8 py-4 text-[12px] font-bold transition-colors whitespace-nowrap border ${
              activeTab === tab.name
                ? "bg-[#022C4F] text-white border-[#022C4F]"
                : "bg-white text-[#022C4F] border-[#022C4F]/20 hover:bg-gray-50"
            } ${index !== 0 ? "border-l-0" : ""}`}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      {activeTab === "Project Settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 mt-6">
          
          {/* Left Column: Project Details & General Settings */}
          <div className="flex flex-col gap-16">
            
            {/* Project Information */}
            <div className="flex flex-col gap-8">
              <h2 className="text-[20px] font-extrabold text-[#022C4F]">Project Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
                <div className="flex flex-col gap-4">
                  <span className="text-[14px] font-extrabold text-[#022C4F]">Project Name</span>
                  <span className="text-[12px] text-[#0F181F] font-medium">{projectInfo.name}</span>
                </div>
                
                <div className="flex flex-col gap-4">
                  <span className="text-[14px] font-extrabold text-[#022C4F]">Project ID</span>
                  <span className="text-[12px] text-[#0F181F] font-medium">{projectInfo.id}</span>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[14px] font-extrabold text-[#022C4F]">Project Type</span>
                  <span className="text-[12px] text-[#0F181F] font-medium">{projectInfo.type}</span>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[14px] font-extrabold text-[#022C4F]">Project Phase</span>
                  <span className="text-[12px] text-[#0F181F] font-medium">{projectInfo.phase}</span>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[14px] font-extrabold text-[#022C4F]">Location</span>
                  <span className="text-[12px] text-[#0F181F] font-medium">{projectInfo.location}</span>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[14px] font-extrabold text-[#022C4F]">Project Manager</span>
                  <span className="text-[12px] text-[#0F181F] font-medium">{projectInfo.manager}</span>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[14px] font-extrabold text-[#022C4F]">Project Status</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${projectInfo.status === 'Active' ? 'bg-[#00D000]' : projectInfo.status === 'On Hold' ? 'bg-orange-500' : 'bg-gray-500'}`} />
                    <span className="text-[12px] text-[#0F181F] font-medium">{projectInfo.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* General Settings */}
            <div className="flex flex-col gap-8 mt-4">
              <h2 className="text-[20px] font-extrabold text-[#022C4F]">General Settings</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
                <div className="flex flex-col gap-4">
                  <span className="text-[14px] font-extrabold text-[#022C4F]">Default Language</span>
                  <span className="text-[12px] text-[#0F181F] font-medium">{generalSettings.language}</span>
                </div>
                
                <div className="flex flex-col gap-4">
                  <span className="text-[14px] font-extrabold text-[#022C4F]">Time Zone</span>
                  <span className="text-[12px] text-[#0F181F] font-medium">{generalSettings.timeZone}</span>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[14px] font-extrabold text-[#022C4F]">Measurement Units</span>
                  <span className="text-[12px] text-[#0F181F] font-medium">{generalSettings.measurementUnits}</span>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[14px] font-extrabold text-[#022C4F]">Date Format</span>
                  <span className="text-[12px] text-[#0F181F] font-medium">{generalSettings.dateFormat}</span>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[14px] font-extrabold text-[#022C4F]">Currency</span>
                  <span className="text-[12px] text-[#0F181F] font-medium">{generalSettings.currency}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-6 mt-8">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="h-12 px-8 rounded-full border border-[#022C4F] text-[#022C4F] text-[12px] font-bold hover:bg-gray-50 transition-colors"
              >
                Edit Project Settings
              </button>
              <button 
                onClick={handleSaveProjectInfo}
                className="h-12 px-8 rounded-full bg-[#022C4F] text-white text-[12px] font-bold hover:bg-[#033A6B] transition-colors"
              >
                Save Project Information
              </button>
            </div>

          </div>

          {/* Right Column: Checkboxes */}
          <div className="flex flex-col gap-16 lg:pl-12">
            
            {/* Collaboration Settings */}
            <div className="flex flex-col gap-8">
              <h2 className="text-[20px] font-extrabold text-[#022C4F]">Collaboration Settings</h2>
              <div className="flex flex-col gap-5">
                {Object.keys(collabSettings).map((setting) => (
                  <label key={setting} className="flex items-center gap-4 cursor-pointer group">
                    <div 
                      className={`w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors ${
                        collabSettings[setting] ? "bg-[#0F181F] border-[#0F181F]" : "border-gray-400 border group-hover:border-[#0F181F] bg-white"
                      }`}
                      onClick={() => toggleCollabSetting(setting)}
                    >
                      {collabSettings[setting] && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-[12px] text-[#0F181F] font-medium">{setting}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* BIM & Model Settings */}
            <div className="flex flex-col gap-8">
              <h2 className="text-[20px] font-extrabold text-[#022C4F]">BIM & Model Settings</h2>
              <div className="flex flex-col gap-5">
                {Object.keys(bimSettings).map((setting) => (
                  <label key={setting} className="flex items-center gap-4 cursor-pointer group">
                    <div 
                      className={`w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors ${
                        bimSettings[setting] ? "bg-[#0F181F] border-[#0F181F]" : "border-gray-400 border group-hover:border-[#0F181F] bg-white"
                      }`}
                      onClick={() => toggleBimSetting(setting)}
                    >
                      {bimSettings[setting] && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-[12px] text-[#0F181F] font-medium">{setting}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === "Permission Overview" && (
        <div className="flex flex-col mt-6 gap-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
            {/* Workspace Permissions */}
            <div className="flex flex-col gap-8">
              <h2 className="text-[20px] font-extrabold text-[#022C4F]">Workspace Permissions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                {Object.keys(workspacePerms).map((perm) => (
                  <label key={perm} className="flex items-center gap-4 cursor-pointer group">
                    <div 
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        workspacePerms[perm] ? "bg-[#0F181F] border-[#0F181F]" : "border-gray-400 group-hover:border-[#0F181F] bg-white"
                      }`}
                      onClick={() => toggleWorkspacePerm(perm)}
                    >
                      {workspacePerms[perm] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-[12px] text-[#0F181F] font-medium">{perm}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Project Permissions */}
            <div className="flex flex-col gap-8">
              <h2 className="text-[20px] font-extrabold text-[#022C4F]">Project Permissions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                {Object.keys(projectPerms).map((perm) => (
                  <label key={perm} className="flex items-center gap-4 cursor-pointer group">
                    <div 
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        projectPerms[perm] ? "bg-[#0F181F] border-[#0F181F]" : "border-gray-400 group-hover:border-[#0F181F] bg-white"
                      }`}
                      onClick={() => toggleProjectPerm(perm)}
                    >
                      {projectPerms[perm] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-[12px] text-[#0F181F] font-medium">{perm}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 mt-4">
            {/* External Access */}
            <div className="flex flex-col gap-8">
              <h2 className="text-[20px] font-extrabold text-[#022C4F]">External Access</h2>
              <div className="flex flex-col gap-5">
                {Object.keys(externalPerms).map((perm) => (
                  <label key={perm} className="flex items-center gap-4 cursor-pointer group">
                    <div 
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        externalPerms[perm] ? "bg-[#0F181F] border-[#0F181F]" : "border-gray-400 group-hover:border-[#0F181F] bg-white"
                      }`}
                      onClick={() => toggleExternalPerm(perm)}
                    >
                      {externalPerms[perm] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-[12px] text-[#0F181F] font-medium">{perm}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="flex flex-col gap-8">
              <h2 className="text-[20px] font-extrabold text-[#022C4F]">Security</h2>
              <div className="flex flex-col gap-5">
                {Object.keys(securityPerms).map((perm) => (
                  <label key={perm} className="flex items-center gap-4 cursor-pointer group">
                    <div 
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        securityPerms[perm] ? "bg-[#0F181F] border-[#0F181F]" : "border-gray-400 group-hover:border-[#0F181F] bg-white"
                      }`}
                      onClick={() => toggleSecurityPerm(perm)}
                    >
                      {securityPerms[perm] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-[12px] text-[#0F181F] font-medium">{perm}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-6 mt-16 pb-8">
            <button 
              onClick={handleSavePermissions}
              className="h-12 px-10 rounded-full border border-[#022C4F] text-[#022C4F] text-[12px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
            >
              Save Permissions
            </button>
            <button 
              onClick={handleRestorePermissionsDefaults}
              className="h-12 px-10 rounded-full bg-[#022C4F] text-white text-[12px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm"
            >
              Restore Defaults
            </button>
          </div>

        </div>
      )}

      {activeTab === "Review Management" && (
        <div className="flex flex-col mt-6 gap-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
            
            {/* Left Column */}
            <div className="flex flex-col gap-12">
              
              {/* Reviewer Assignment */}
              <div className="flex flex-col gap-8">
                <h2 className="text-[20px] font-extrabold text-[#022C4F]">Reviewer Assignment</h2>
                <div className="flex flex-col gap-5">
                  {Object.keys(reviewerAssignment).map((setting) => (
                    <label key={setting} className="flex items-center gap-4 cursor-pointer group">
                      <div 
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          reviewerAssignment[setting] ? "bg-[#0F181F] border-[#0F181F]" : "border-gray-400 group-hover:border-[#0F181F] bg-white"
                        }`}
                        onClick={() => toggleReviewerAssignment(setting)}
                      >
                        {reviewerAssignment[setting] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-[12px] text-[#0F181F] font-medium">{setting}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Due Date Reminders */}
              <div className="flex flex-col gap-8">
                <h2 className="text-[20px] font-extrabold text-[#022C4F]">Due Date Reminders</h2>
                <div className="flex flex-col gap-5">
                  {Object.keys(dueDateReminders).map((setting) => (
                    <label key={setting} className="flex items-center gap-4 cursor-pointer group">
                      <div 
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          dueDateReminders[setting] ? "bg-[#0F181F] border-[#0F181F]" : "border-gray-400 group-hover:border-[#0F181F] bg-white"
                        }`}
                        onClick={() => toggleDueDateReminders(setting)}
                      >
                        {dueDateReminders[setting] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-[12px] text-[#0F181F] font-medium">{setting}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="flex flex-col gap-8">
                <h2 className="text-[20px] font-extrabold text-[#022C4F]">Notifications</h2>
                <div className="flex flex-col gap-5">
                  {Object.keys(notifications).map((setting) => (
                    <label key={setting} className="flex items-center gap-4 cursor-pointer group">
                      <div 
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          notifications[setting] ? "bg-[#0F181F] border-[#0F181F]" : "border-gray-400 group-hover:border-[#0F181F] bg-white"
                        }`}
                        onClick={() => toggleNotifications(setting)}
                      >
                        {notifications[setting] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-[12px] text-[#0F181F] font-medium">{setting}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-12">
              
              {/* Approval Requirements */}
              <div className="flex flex-col gap-8">
                <h2 className="text-[20px] font-extrabold text-[#022C4F]">Approval Requirements</h2>
                <div className="flex flex-col gap-5">
                  {Object.keys(approvalReqs).map((setting) => (
                    <label key={setting} className="flex items-center gap-4 cursor-pointer group">
                      <div 
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          approvalReqs[setting] ? "bg-[#0F181F] border-[#0F181F]" : "border-gray-400 group-hover:border-[#0F181F] bg-white"
                        }`}
                        onClick={() => toggleApprovalReqs(setting)}
                      >
                        {approvalReqs[setting] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-[12px] text-[#0F181F] font-medium">{setting}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Review Permissions */}
              <div className="flex flex-col gap-8">
                <h2 className="text-[20px] font-extrabold text-[#022C4F]">Review Permissions</h2>
                <div className="flex flex-col gap-5">
                  {Object.keys(reviewPerms).map((setting) => (
                    <label key={setting} className="flex items-center gap-4 cursor-pointer group">
                      <div 
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          reviewPerms[setting] ? "bg-[#0F181F] border-[#0F181F]" : "border-gray-400 group-hover:border-[#0F181F] bg-white"
                        }`}
                        onClick={() => toggleReviewPerms(setting)}
                      >
                        {reviewPerms[setting] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-[12px] text-[#0F181F] font-medium">{setting}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-6 mt-16 pb-8">
            <button 
              onClick={handleSaveReviewSettings}
              className="h-12 px-10 rounded-full border border-[#022C4F] text-[#022C4F] text-[12px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
            >
              Save Review Settings
            </button>
            <button 
              onClick={handleRestoreReviewDefaults}
              className="h-12 px-10 rounded-full bg-[#022C4F] text-white text-[12px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm"
            >
              Restore Default Workflow
            </button>
          </div>

        </div>
      )}

      <EditProjectSettingsModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialProjectInfo={projectInfo}
        initialGeneralSettings={generalSettings}
        onSave={(newInfo, newSettings) => {
          setProjectInfo(newInfo);
          setGeneralSettings(newSettings);
        }}
      />

    </div>
  );
}
