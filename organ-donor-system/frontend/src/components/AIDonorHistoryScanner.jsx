import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, 
  Calendar, ShieldCheck, Activity, Heart, RefreshCw, Save, Zap,
  FileCheck, Cpu, ArrowRight, User
} from 'lucide-react';
import { aiService, donorService } from '../services';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';
import Card from './ui/Card';

const SAMPLE_REPORTS = [
  {
    title: 'Sample 1: Alex Morgan (Kidney & Blood)',
    text: `ORGAN DONATION & MEDICAL HEALTH REPORT
Donor Name: Alex Morgan
Blood Group: O Positive (O+)
Date of Record: 2024-03-15
Hospital: Metro Health Specialty Center

PAST DONATIONS & HISTORICAL LOG:
1. Date: 2023-04-10 | Organ: Blood (450ml) | Recipient: St. Jude Children Hospital | Status: Completed
2. Date: 2023-11-20 | Organ: Kidney (Left) | Recipient: Metro General Hospital Patient | Status: Completed

LABORATORY METRICS & PARAMETERS:
- HLA Match Profile: HLA-A2, B7, DR4 (88% Match Score)
- Serum Creatinine: 0.92 mg/dL
- Hemoglobin: 14.5 g/dL
- Blood Pressure: 118/78 mmHg

RECOVERY & ELIGIBILITY STATUS:
Donor has completed left nephrectomy with 100% renal function recovery. Eligible for tissue and blood donation.`
  },
  {
    title: 'Sample 2: Samantha Reed (Platelets & Cornea)',
    text: `NATIONAL DONOR REGISTRY HISTORY EXTRACT
Donor Name: Samantha Reed
Blood Group: A Negative (A-)
Last Screening Date: 2024-01-22
Hospital: Red Cross Blood & Medical Center

HISTORICAL RECORD:
- Date: 2022-09-15 | Organ: Blood | Recipient: Red Cross Center | Status: Completed
- Date: 2023-06-12 | Organ: Platelets | Recipient: City Hospital | Status: Completed
- Date: 2024-01-10 | Organ: Corneas | Recipient: Eye Care Institute | Status: Completed

MEDICAL EVALUATION:
- HLA Compatibility: Full Compatibility Matched
- Hemoglobin: 13.8 g/dL
- Serum Creatinine: 0.85 mg/dL
- Blood Pressure: 120/80 mmHg

Physician Notes: Excellent recovery baseline. Eligible for immediate platelet donation.`
  },
  {
    title: 'Sample 3: David Miller (Liver Lobe Screening)',
    text: `SPECIALTY MEDICAL SCREENING & DONOR HISTORY
Donor Name: David Miller
Blood Group: B Positive (B+)
Date of Evaluation: 2024-02-14
Hospital: St. Vincent Medical Center

HISTORICAL LOG:
- Date: 2024-02-01 | Organ: Liver | Recipient: St. Vincent Transplant Center | Status: Completed

LABORATORY VALUES:
- HLA Profile: Match 5/6 (A, B)
- Serum Creatinine: 0.98 mg/dL
- Hemoglobin: 15.1 g/dL
- Blood Pressure: 122/82 mmHg

Status: Right liver lobe donation completed successfully. Liver regeneration score 100%.`
  }
];

const AIDonorHistoryScanner = ({ onHistoryUpdated }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text'
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
      toast.error('Please select an image file (PNG, JPG) or PDF document.');
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleScanImage = async () => {
    if (!file) {
      toast.error('Please upload a document image first.');
      return;
    }

    setScanning(true);
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await aiService.scanDonorDocument(formData);
      if (response.success && response.data) {
        setScanResult(response.data);
        toast.success('Document successfully parsed by AI OCR model!');
      } else {
        toast.error(response.message || 'Failed to parse document.');
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('AI OCR processing failed. Check network or try raw text input.');
    } finally {
      setScanning(false);
    }
  };

  const handleScanText = async () => {
    if (!textInput.trim()) {
      toast.error('Please paste medical report or donation log text.');
      return;
    }

    setScanning(true);
    setScanResult(null);

    try {
      const response = await aiService.calculateDonorHistoryText(textInput);
      if (response.success && response.data) {
        setScanResult(response.data);
        toast.success('Donor history calculated successfully!');
      } else {
        toast.error(response.message || 'Failed to calculate history.');
      }
    } catch (error) {
      console.error('Text scan error:', error);
      toast.error('AI calculation failed.');
    } finally {
      setScanning(false);
    }
  };

  const handleSaveToProfile = async () => {
    if (!scanResult || !scanResult.historyItems || scanResult.historyItems.length === 0) {
      toast.error('No valid donation history items to save.');
      return;
    }

    setSaving(true);
    try {
      const itemsToSave = scanResult.historyItems.map(item => ({
        date: item.date,
        organType: item.organType,
        recipientName: item.recipientName,
        recipientType: item.recipientType || 'OCR Scanned',
        status: item.status || 'completed',
        notes: item.notes || `Scanned via ${scanResult.aiEngineUsed || 'AI Model'}`,
        aiEngineUsed: scanResult.aiEngineUsed
      }));

      const response = await donorService.saveScannedHistory(itemsToSave);
      if (response.success) {
        toast.success('🎉 Scanned donation history saved to your profile!');
        if (onHistoryUpdated) onHistoryUpdated();
      } else {
        toast.error(response.message || 'Failed to save scanned history.');
      }
    } catch (error) {
      console.error('Save scanned history error:', error);
      toast.error('Failed to save to profile.');
    } finally {
      setSaving(false);
    }
  };

  const resetScanner = () => {
    setFile(null);
    setPreviewUrl(null);
    setTextInput('');
    setScanResult(null);
  };

  return (
    <Card className="p-6 bg-white dark:bg-gray-900 border border-rose-100 dark:border-rose-900/40 shadow-xl rounded-3xl relative overflow-hidden">
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 rounded-full flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              100% Free AI Multimodal Engine
            </span>
            <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              Gemini Vision + Tesseract OCR
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-rose-500" />
            AI Donor History Calculator & Document OCR
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Upload medical reports, donation certificates, or paste raw logs to instantly calculate health metrics and donation history.
          </p>
        </div>

        {scanResult && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetScanner}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Scan Another Record
          </Button>
        )}
      </div>

      {/* Mode Navigation */}
      {!scanResult && (
        <div className="flex bg-gray-100 dark:bg-gray-800/60 p-1.5 rounded-2xl mb-6 max-w-md">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Report Image / PDF
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'text'
                ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Report Text
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {!scanResult ? (
        <div>
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                  file
                    ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                    : 'border-gray-300 dark:border-gray-700 hover:border-rose-400 dark:hover:border-rose-500 bg-gray-50/50 dark:bg-gray-800/30'
                }`}
              >
                <input
                  type="file"
                  id="document-file-input"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative max-w-xs mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                    <img src={previewUrl} alt="Report Preview" className="w-full h-48 object-cover" />
                    {scanning && (
                      <motion.div
                        initial={{ y: -180 }}
                        animate={{ y: 180 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-pink-400 to-amber-400 shadow-lg shadow-rose-500/50"
                      />
                    )}
                  </div>
                ) : file ? (
                  <div className="flex items-center justify-center gap-3 py-6 text-rose-600 dark:text-rose-400 font-bold">
                    <FileCheck className="w-10 h-10" />
                    <span>{file.name}</span>
                  </div>
                ) : (
                  <label htmlFor="document-file-input" className="cursor-pointer block">
                    <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      Click to upload or drag & drop medical document
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Supports PNG, JPG, JPEG, WEBP or PDF (Max 5MB)
                    </p>
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                {file && (
                  <Button
                    variant="ghost"
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                  >
                    Clear File
                  </Button>
                )}
                <Button
                  onClick={handleScanImage}
                  disabled={!file || scanning}
                  className="bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/30"
                  leftIcon={scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                >
                  {scanning ? 'Running AI Multimodal OCR Model...' : 'Calculate Donor History with AI'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                  <span>Paste Medical History Report or Lab Text:</span>
                  <span className="text-xs text-gray-500">Instant AI Extraction</span>
                </label>
                <textarea
                  rows={6}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste medical record, donor discharge summary, lab values, or past donation dates here..."
                  className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-mono text-xs"
                />
              </div>

              {/* Sample Presets */}
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Try Sample Test Records:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_REPORTS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTextInput(sample.text)}
                      className="text-xs py-1.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  onClick={handleScanText}
                  disabled={!textInput.trim() || scanning}
                  className="bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/30"
                  leftIcon={scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                >
                  {scanning ? 'Analyzing Text with AI...' : 'Calculate Donor History with AI'}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : scanResult.isValidMedicalDocument === false ? (
        /* Render Invalid Document Error */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-red-50 dark:bg-red-950/40 rounded-3xl border-2 border-red-200 dark:border-red-800 text-center space-y-4 shadow-xl"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-red-700 dark:text-red-400">
              Invalid Document Type Detected
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300 mt-2 max-w-lg mx-auto leading-relaxed font-medium">
              {scanResult.errorMessage || "Only Medical Reports and Donation Certificates are allowed. Please upload a legitimate medical report or donation certificate."}
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={resetScanner}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Scan Valid Medical Report / Certificate
            </Button>
          </div>
        </motion.div>
      ) : (
        /* Render Calculated Results */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Engine & Donor Name Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 gap-3 text-xs">
            <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-rose-500" />
              AI Engine: {scanResult.aiEngineUsed || 'Gemini Vision LLM'}
            </span>
            <span className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800/60 shadow-sm flex items-center gap-2">
              <User className="w-4 h-4 text-rose-500" />
              Document Donor Name: <strong className="text-rose-600 dark:text-rose-400 font-extrabold text-base">{scanResult.donorName || 'Extracted Medical Record Donor'}</strong>
            </span>
          </div>

          {/* Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Health Score */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
              <p className="text-xs font-semibold opacity-90 uppercase tracking-wider">Calculated Health Index</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-extrabold">{scanResult.calculatedHealthScore || 90}</span>
                <span className="text-sm font-bold opacity-80">/ 100</span>
              </div>
              <p className="text-xs mt-2 opacity-90 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Baseline Health Readiness
              </p>
            </div>

            {/* Total Past Donations */}
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white p-4 rounded-2xl shadow-lg">
              <p className="text-xs font-semibold opacity-90 uppercase tracking-wider">Calculated Donations</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-extrabold">{scanResult.totalDonations || scanResult.historyItems?.length || 0}</span>
                <span className="text-sm font-bold opacity-80">Records</span>
              </div>
              <p className="text-xs mt-2 opacity-90 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                Verified Impact Count
              </p>
            </div>

            {/* Blood Group */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-4 rounded-2xl shadow-lg">
              <p className="text-xs font-semibold opacity-90 uppercase tracking-wider">Extracted Blood Group</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-extrabold">{scanResult.bloodGroup || 'O+'}</span>
              </div>
              <p className="text-xs mt-2 opacity-90 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                Universal Compatibility
              </p>
            </div>

            {/* Eligibility Status */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-4 rounded-2xl shadow-lg">
              <p className="text-xs font-semibold opacity-90 uppercase tracking-wider">Donation Eligibility</p>
              <div className="mt-2 font-bold text-lg leading-tight truncate">
                {scanResult.eligibilityStatus || 'Eligible'}
              </div>
              <p className="text-xs mt-2 opacity-90 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Next: {scanResult.nextEligibleDonationDate || 'Immediate'}
              </p>
            </div>
          </div>

          {/* AI Summary & Eligibility Details */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/60 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Medical History Assessment:
            </h4>
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
              {scanResult.summary || 'Summary extracted successfully.'}
            </p>
            {scanResult.eligibilityDetails && (
              <p className="text-xs text-gray-600 dark:text-gray-400 italic pt-1 border-t border-gray-200 dark:border-gray-700">
                💡 <strong>Medical Guidance:</strong> {scanResult.eligibilityDetails}
              </p>
            )}
          </div>

          {/* Extracted Medical Parameters */}
          {scanResult.medicalMetrics && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-500" />
                Extracted Medical Biomarkers:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">HLA Compatibility</span>
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white mt-1 block">
                    {scanResult.medicalMetrics.hlaMatch || 'Match Profile'}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">Serum Creatinine</span>
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white mt-1 block">
                    {scanResult.medicalMetrics.creatinine || '0.9 mg/dL'}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">Hemoglobin</span>
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white mt-1 block">
                    {scanResult.medicalMetrics.hemoglobin || '14.0 g/dL'}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">Blood Pressure</span>
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white mt-1 block">
                    {scanResult.medicalMetrics.bloodPressure || '120/80 mmHg'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Parsed Donation History Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-500" />
              Calculated Past Donation Events ({scanResult.historyItems?.length || 0}):
            </h4>

            {scanResult.historyItems && scanResult.historyItems.length > 0 ? (
              <div className="space-y-3">
                {scanResult.historyItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-rose-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-rose-100 dark:bg-rose-900/40 rounded-xl text-rose-600 dark:text-rose-300">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-gray-900 dark:text-white text-base">
                            {item.organType} Donation
                          </h5>
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full">
                            {item.status || 'Completed'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          Facility / Recipient: <strong>{item.recipientName}</strong>
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                            "{item.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <span className="text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 py-1 px-3 rounded-full">
                        {item.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No specific past donation dates extracted.</p>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500">
              Click save to sync these scanned items directly into your official donor dashboard history.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={resetScanner}
                className="w-full sm:w-auto"
              >
                Scan Another
              </Button>
              <Button
                onClick={handleSaveToProfile}
                disabled={saving}
                className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/30"
                leftIcon={saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              >
                {saving ? 'Saving to Profile...' : 'Save Scanned History to Profile'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
};

export default AIDonorHistoryScanner;
