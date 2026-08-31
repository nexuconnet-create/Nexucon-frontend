"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import SensorFileUploader from './SensorFileUploader';
import ScanReportSummary from './ScanReportSummary';
import api, { getApiUrl } from '@/lib/api';

type Step = 'init' | 'upload' | 'metadata' | 'processing' | 'report';

export default function NewScanFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('init');

  // Session State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [presignedUrls, setPresignedUrls] = useState<Record<string, string>>({});

  // Init Form State
  const [projectId, setProjectId] = useState('');
  const [scannerId, setScannerId] = useState('');
  const [selectedSensors, setSelectedSensors] = useState<string[]>(['lidar', 'rgb', 'thermal', 'gps', 'gaussian_splat', 'bim']);
  const [isInitializing, setIsInitializing] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects/');
        const data = response.data;
        if (data && Array.isArray(data.results)) {
          setProjects(data.results);
        } else if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setProjects([]);
          console.warn("Unexpected response format for projects:", data);
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);

  // Upload State
  const [uploadedSensors, setUploadedSensors] = useState<string[]>([]);

  // Metadata State
  const [metadata, setMetadata] = useState({
    latitude: '',
    longitude: '',
    elevation: '',
    operatorId: '',
    notes: ''
  });
  const [isSubmittingMetadata, setIsSubmittingMetadata] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Processing State
  const [processingStatus, setProcessingStatus] = useState<string>('pending');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [bimLogs, setBimLogs] = useState<string[]>([]);
  const [bimRunning, setBimRunning] = useState(false);
  const [bimDone, setBimDone] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Report State
  const [reportData, setReportData] = useState<any | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleInitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !scannerId || selectedSensors.length === 0) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setIsInitializing(true);

    try {
      const response = await api.post('/scans/session/', {
        project_id: projectId,
        scanner_id: scannerId,
        sensors_used: selectedSensors
      });

      const newSessionId = response.data.id || response.data.session_id;
      setSessionId(newSessionId);

      // Upload endpoints mirror the session detail page's "Upload New Files"
      // inputs: POST /scans/{id}/upload/{sensor}/ with a multipart "file".
      const uploadUrls: Record<string, string> = {};
      selectedSensors.forEach(s => {
        uploadUrls[s] = `/scans/${newSessionId}/upload/${s}/`;
      });
      setPresignedUrls(uploadUrls);

      showToast('Session initialized', 'success');
      setCurrentStep('upload');
    } catch (error) {
      console.error(error);
      showToast('Failed to initialize session', 'error');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleUploadSuccess = (sensorType: string) => {
    setUploadedSensors(prev => prev.includes(sensorType) ? prev : [...prev, sensorType]);
    showToast(`${sensorType.replace('_', ' ')} uploaded successfully`, 'success');
  };

  const handleUploadError = (sensorType: string, error: string) => {
    showToast(`Failed to upload ${sensorType}: ${error}`, 'error');
  };

  // Same payload contract as the session detail page's Add Metadata modal:
  // top-level lat/lon plus the nested `location` object the serializer accepts.
  const handleMetadataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    setIsSubmittingMetadata(true);

    try {
      const payload: any = {
        operator_id: metadata.operatorId || '',
        notes: metadata.notes || ''
      };
      const lat = metadata.latitude ? parseFloat(metadata.latitude) : null;
      const lon = metadata.longitude ? parseFloat(metadata.longitude) : null;
      const elev = metadata.elevation ? parseFloat(metadata.elevation) : null;
      if (lat !== null && !isNaN(lat)) {
        payload.latitude = lat;
        payload.longitude = lon;
        payload.location = { latitude: lat, longitude: lon, ...(elev !== null && !isNaN(elev) ? { elevation: elev } : {}) };
      } else {
        payload.latitude = null;
        payload.longitude = null;
        payload.location = null;
      }

      await api.post(`/scans/${sessionId}/metadata/`, payload);
      showToast('Metadata saved', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(error.response?.data?.error || 'Failed to save metadata', 'error');
    } finally {
      setIsSubmittingMetadata(false);
    }
  };

  const handleFinalize = async () => {
    if (!sessionId) return;
    setIsFinalizing(true);

    try {
      await api.post(`/scans/${sessionId}/finalize/`);
      showToast('Scan finalized, processing started', 'success');
      pollStatus();
    } catch (error) {
      console.error(error);
      showToast('Failed to finalize scan', 'error');
    } finally {
      setIsFinalizing(false);
    }
  };

  const pollStatus = () => {
    if (!sessionId) return;

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const response = await api.get(`/scans/${sessionId}/status/`);
        if (response.data.status === 'completed') {
          setProcessingStatus('completed');
          showToast('Processing completed! Continue to the report step.', 'success');
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (response.data.status === 'failed') {
          setProcessingStatus('failed');
          showToast('Processing failed', 'error');
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }
    }, 5000);
  };

  // Streamed pipeline runs — identical to the session detail page's
  // "Process AI Data" and "Align to BIM" streaming modals.
  const runStream = async (
    pathSuffix: 'process' | 'align-bim',
    setLogs: React.Dispatch<React.SetStateAction<string[]>>,
    setRunning: React.Dispatch<React.SetStateAction<boolean>>,
    setDone: React.Dispatch<React.SetStateAction<boolean>>,
    successMsg: string
  ) => {
    if (!sessionId) return;
    setRunning(true);
    setDone(false);
    setLogs([]);

    try {
      const url = getApiUrl(`/scans/${sessionId}/${pathSuffix}/stream/`);
      const token = localStorage.getItem('nexucon_access_token') || localStorage.getItem('token');
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.replace('data: ', '').trim();
            if (data === '[DONE]') {
              setDone(true);
            } else if (data) {
              setLogs(prev => [...prev, data]);
            }
          }
        }
      }
      setDone(true);
      showToast(successMsg, 'success');
    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, "Error connecting to stream."]);
      setDone(true);
    } finally {
      setRunning(false);
    }
  };

  const handleProcessAi = () =>
    runStream('process', setAiLogs, setAiRunning, setAiDone, 'AI processing complete');
  const handleAlignBim = () =>
    runStream('align-bim', setBimLogs, setBimRunning, setBimDone, 'BIM alignment complete');

  const handleGenerateReport = async () => {
    if (!sessionId) return;
    setIsGeneratingReport(true);

    try {
      const response = await api.post(`/scans/${sessionId}/report/`);
      showToast('Report generated', 'success');
      setReportData(response.data);
      setCurrentStep('report');
    } catch (error) {
      console.error(error);
      showToast('Failed to generate report', 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const toggleSensor = (sensor: string) => {
    setSelectedSensors(prev =>
      prev.includes(sensor) ? prev.filter(s => s !== sensor) : [...prev, sensor]
    );
  };

  const steps: Step[] = ['init', 'upload', 'metadata', 'processing', 'report'];
  const stepLabels: Record<Step, string> = {
    init: 'Initialize',
    upload: 'Upload Files',
    metadata: 'Metadata',
    processing: 'Processing',
    report: 'Report'
  };
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Scan Session</h1>
        <p className="text-gray-500 mt-1">Initialize a session, upload sensor data, process it and generate the QA/QC report — all in one flow.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10 flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500"
             style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}></div>

        {steps.map((step, idx) => {
          const isCompleted = currentIndex > idx;
          const isCurrent = currentStep === step;

          return (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                isCompleted ? 'bg-blue-600 text-white' :
                isCurrent ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' :
                'bg-gray-100 text-gray-400 border border-gray-300'
              }`}>
                {isCompleted ? <CheckCircle className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${
                isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {stepLabels[step]}
              </span>
            </div>
          );
        })}
      </div>

      {currentStep === 'init' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Initialize Session</h2>
          <form onSubmit={handleInitSession}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <select
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  required
                >
                  <option value="">Select a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scanner ID</label>
                <input
                  type="text"
                  value={scannerId}
                  onChange={e => setScannerId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. NAVIS-V3-001"
                  required
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Sensors to Use</label>
              <div className="flex flex-wrap gap-3">
                {['lidar', 'rgb', 'thermal', 'gps', 'gaussian_splat', 'bim'].map(sensor => (
                  <button
                    key={sensor}
                    type="button"
                    onClick={() => toggleSensor(sensor)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                      selectedSensors.includes(sensor)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {sensor.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
              {selectedSensors.length === 0 && (
                <p className="text-red-500 text-xs mt-2">Select at least one sensor.</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isInitializing || selectedSensors.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                {isInitializing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Initialize Session'}
                {!isInitializing && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      )}

      {currentStep === 'upload' && sessionId && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
            <div className="mt-0.5">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800">Upload Raw Data</h4>
              <p className="text-sm text-blue-600 mt-1">
                Upload your scan files directly to our secure storage. Session ID: <span className="font-mono bg-blue-100 px-1 rounded">{sessionId}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedSensors.map(sensor => (
              <SensorFileUploader
                key={sensor}
                sensorType={sensor}
                presignedUrl={presignedUrls[sensor]}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 mt-6">
            <span className="text-sm text-gray-500">
              {uploadedSensors.length} of {selectedSensors.length} files uploaded
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('init')}
                className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('metadata')}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                Continue to Metadata <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'metadata' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Scan Metadata</h2>

          <form onSubmit={handleMetadataSubmit} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                <input
                  type="text"
                  value={metadata.latitude}
                  onChange={e => setMetadata({...metadata, latitude: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="e.g. 37.7749"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                <input
                  type="text"
                  value={metadata.longitude}
                  onChange={e => setMetadata({...metadata, longitude: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="e.g. -122.4194"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Elevation (m)</label>
                <input
                  type="text"
                  value={metadata.elevation}
                  onChange={e => setMetadata({...metadata, elevation: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="e.g. 15.2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operator ID</label>
                <input
                  type="text"
                  value={metadata.operatorId}
                  onChange={e => setMetadata({...metadata, operatorId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="e.g. OP-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <input
                  type="text"
                  value={metadata.notes}
                  onChange={e => setMetadata({...metadata, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="Weather conditions, specific focus areas..."
                />
              </div>
            </div>

            <div className="flex justify-end border-b border-gray-100 pb-6">
              <button
                type="submit"
                disabled={isSubmittingMetadata}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                {isSubmittingMetadata ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Metadata'}
              </button>
            </div>
          </form>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setCurrentStep('upload')}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
            >
              Back to Uploads
            </button>
            <button
              onClick={() => setCurrentStep('processing')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              Continue to Processing <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'processing' && (
        <div className="space-y-6">
          {/* 1. Finalize */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">1</div>
              <h2 className="text-lg font-semibold text-gray-800">Finalize Uploads</h2>
              {processingStatus === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Lock the uploaded sensor files and queue the session for processing.
            </p>
            <button
              onClick={handleFinalize}
              disabled={isFinalizing || processingStatus === 'completed'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-60"
            >
              {isFinalizing ? <Loader2 className="w-5 h-5 animate-spin" /> : processingStatus === 'completed' ? 'Uploads Finalized' : 'Finalize Uploads'}
            </button>
            {processingStatus === 'pending' && isFinalizing === false && (
              <p className="text-xs text-gray-400 mt-3">Status: waiting to finalize.</p>
            )}
            {processingStatus !== 'pending' && processingStatus !== 'completed' && processingStatus !== 'failed' && (
              <p className="text-xs text-blue-600 mt-3 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Processing pipeline running...
              </p>
            )}
            {processingStatus === 'failed' && (
              <p className="text-xs text-red-600 mt-3">Processing failed. Check the session page for details.</p>
            )}
          </div>

          {/* 2. Process AI Data (streaming) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">2</div>
              <h2 className="text-lg font-semibold text-gray-800">Process AI Data</h2>
              {aiDone && !aiRunning && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Run AI anomaly detection and semantic segmentation over the uploaded scan data.
            </p>
            <button
              onClick={handleProcessAi}
              disabled={aiRunning}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-60"
            >
              {aiRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Process AI Data'}
            </button>
            {(aiLogs.length > 0 || aiRunning) && (
              <div className="mt-4 bg-slate-900 text-slate-100 rounded-lg p-4 max-h-56 overflow-y-auto font-mono text-xs space-y-1">
                {aiLogs.map((log, i) => (
                  <p key={i} className={log.startsWith('Error') ? 'text-red-400' : 'text-slate-300'}>{log}</p>
                ))}
                {aiRunning && <p className="text-blue-400 animate-pulse">Running...</p>}
              </div>
            )}
          </div>

          {/* 3. Align to BIM (streaming) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">3</div>
              <h2 className="text-lg font-semibold text-gray-800">Align to BIM</h2>
              {bimDone && !bimRunning && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Register the point cloud against the BIM model and compute deviations.
            </p>
            <button
              onClick={handleAlignBim}
              disabled={bimRunning}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-60"
            >
              {bimRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Align to BIM'}
            </button>
            {(bimLogs.length > 0 || bimRunning) && (
              <div className="mt-4 bg-slate-900 text-slate-100 rounded-lg p-4 max-h-56 overflow-y-auto font-mono text-xs space-y-1">
                {bimLogs.map((log, i) => (
                  <p key={i} className={log.startsWith('Error') ? 'text-red-400' : 'text-slate-300'}>{log}</p>
                ))}
                {bimRunning && <p className="text-blue-400 animate-pulse">Running...</p>}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <button
              onClick={() => setCurrentStep('metadata')}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
            >
              {isGeneratingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate QA/QC Report'}
              {!isGeneratingReport && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      {currentStep === 'report' && sessionId && reportData && (
        <div className="space-y-6">
          <ScanReportSummary
            sessionId={sessionId}
            reportData={reportData}
            apiUrl={getApiUrl('')}
          />
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <button
              onClick={() => setCurrentStep('processing')}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => router.push('/government/dashboard/digital-eye/scan-sessions')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              Done — View in Scan Sessions <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
