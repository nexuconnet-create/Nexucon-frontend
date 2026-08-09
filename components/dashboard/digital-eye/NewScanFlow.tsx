"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import SensorFileUploader from './SensorFileUploader';
import ScanReportSummary from './ScanReportSummary';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  const [selectedSensors, setSelectedSensors] = useState<string[]>(['lidar', 'rgb']);
  const [isInitializing, setIsInitializing] = useState(false);

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
  
  // Report State
  const [reportData, setReportData] = useState<any | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleInitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !scannerId || selectedSensors.length === 0) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setIsInitializing(true);
    
    // DEMO MOCK: Bypassing actual fetch to avoid Next.js unhandled fetch error overlay
    setTimeout(() => {
      showToast('Mock session initialized for demo', 'info');
      const mockSessionId = "scn_" + Math.random().toString(36).substring(2, 9);
      setSessionId(mockSessionId);
      
      const mockUrls: Record<string, string> = {};
      selectedSensors.forEach(s => mockUrls[s] = `https://mock-s3-bucket.s3.amazonaws.com/${mockSessionId}/${s}.raw`);
      setPresignedUrls(mockUrls);
      
      setCurrentStep('upload');
      setIsInitializing(false);
    }, 600);
  };

  const handleUploadSuccess = (sensorType: string) => {
    setUploadedSensors(prev => [...prev, sensorType]);
    showToast(`${sensorType} uploaded successfully`, 'success');
  };

  const handleUploadError = (sensorType: string, error: string) => {
    showToast(`Failed to upload ${sensorType}: ${error}`, 'error');
  };

  const handleMetadataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    setIsSubmittingMetadata(true);
    
    // DEMO MOCK: Bypassing actual fetch
    setTimeout(() => {
      showToast('Mock metadata saved', 'success');
      setIsSubmittingMetadata(false);
    }, 600);
  };

  const handleFinalize = async () => {
    if (!sessionId) return;
    setIsFinalizing(true);
    
    // DEMO MOCK: Bypassing actual fetch
    setTimeout(() => {
      showToast('Mock scan finalized, processing started', 'info');
      setCurrentStep('processing');
      pollStatus();
    }, 600);
  };

  const pollStatus = () => {
    if (!sessionId) return;
    
    // DEMO MOCK: Bypassing actual fetch
    setTimeout(() => {
      setProcessingStatus('completed');
      showToast('Mock processing completed!', 'success');
    }, 3000);
  };


  const handleGenerateReport = async () => {
    if (!sessionId) return;
    setIsGeneratingReport(true);
    
    // DEMO MOCK: Bypassing actual fetch
    setTimeout(() => {
      showToast('Mock report generated', 'success');
      setReportData({
        session_id: sessionId,
        status: 'completed',
        report_url: 'https://example.com/mock_report.pdf',
        qa_issues: [
          { type: 'calibration', description: 'Minor IMU drift detected', severity: 'low' }
        ]
      });
      setCurrentStep('report');
      setIsGeneratingReport(false);
    }, 800);
  };

  const toggleSensor = (sensor: string) => {
    setSelectedSensors(prev => 
      prev.includes(sensor) ? prev.filter(s => s !== sensor) : [...prev, sensor]
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Scan Session</h1>
        <p className="text-gray-500 mt-1">Initialize and upload sensor data to the processing pipeline.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10 flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500" 
             style={{ width: currentStep === 'init' ? '0%' : currentStep === 'upload' ? '25%' : currentStep === 'metadata' ? '50%' : currentStep === 'processing' ? '75%' : '100%' }}></div>
        
        {['init', 'upload', 'metadata', 'processing', 'report'].map((step, idx) => {
          const steps = ['init', 'upload', 'metadata', 'processing', 'report'];
          const currentIndex = steps.indexOf(currentStep);
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
              <span className={`text-xs mt-2 font-medium capitalize ${
                isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {step}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Project ID</label>
                <input 
                  type="text" 
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. PRJ-2026-X1"
                  required
                />
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
                {['lidar', 'rgb', 'thermal', 'multispectral'].map(sensor => (
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
                    {sensor.toUpperCase()}
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
                {isInitializing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Initialize & Get URLs'}
                {!isInitializing && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      )}

      {currentStep === 'upload' && (
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

          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 mt-6">
            <span className="text-sm text-gray-500">
              {uploadedSensors.length} of {selectedSensors.length} files uploaded
            </span>
            <button
              onClick={() => setCurrentStep('metadata')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              Continue to Metadata <ArrowRight className="w-4 h-4" />
            </button>
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
              onClick={handleFinalize}
              disabled={isFinalizing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
            >
              {isFinalizing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finish & Process'}
              {!isFinalizing && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      {currentStep === 'processing' && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
          {processingStatus === 'completed' ? (
            <div>
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Complete!</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                The AI processing pipeline has finished analyzing your scan data. The QA/QC report is ready for generation.
              </p>
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 mx-auto transition-colors shadow-sm disabled:opacity-70"
              >
                {isGeneratingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate QA/QC Report'}
              </button>
            </div>
          ) : processingStatus === 'failed' ? (
            <div>
              <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Failed</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                An error occurred during the analysis pipeline. Please check the logs or contact support.
              </p>
            </div>
          ) : (
            <div>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold">
                  {processingStatus === 'pending' ? '0%' : '...'}
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Scan Data</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Running point cloud registration, AI anomaly detection, and semantic segmentation. This may take a few minutes.
              </p>
            </div>
          )}
        </div>
      )}

      {currentStep === 'report' && (
        <ScanReportSummary 
          sessionId={sessionId!} 
          reportData={reportData} 
          apiUrl={API_URL}
        />
      )}
    </div>
  );
}
