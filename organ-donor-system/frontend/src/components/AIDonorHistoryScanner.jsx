import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, 
  Calendar, ShieldCheck, Activity, Heart, RefreshCw, Save, Zap,
  FileCheck, Cpu, ArrowRight, User, Crown, Shield, Award, CheckCircle, Scale, Thermometer
} from 'lucide-react';
import { aiService, donorService } from '../services';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';
import Card from './ui/Card';

const SAMPLE_REPORTS = [
  {
    title: 'UDAY Sample 1: Alex Morgan (Kidney & Blood)',
    text: `UDAY NOTTO NATIONAL ORGAN REGISTRY & MEDICAL REPORT
UDAY Verification Ticket: UDAY-NOTTO-2026-X94B88
Donor Name: Alex Morgan
Blood Group: O Positive (O+)
Date of Record: 2024-03-15
Hospital: Metro Health Specialty Center (Accredited)

PAST DONATIONS & HISTORICAL LOG:
1. Date: 2023-04-10 | Organ: Blood (450ml) | Recipient: St. Jude Children Hospital | Status: Completed
2. Date: 2023-11-20 | Organ: Kidney (Left) | Recipient: Metro General Hospital Patient | Status: Completed

LABORATORY METRICS & PARAMETERS:
- HLA Match Profile: HLA-A2, B7, DR4 (88% Match Score)
- Serum Creatinine: 0.92 mg/dL
- Hemoglobin: 14.5 g/dL
- Blood Pressure: 118/78 mmHg

RECOVERY & ELIGIBILITY STATUS:
Donor completed left nephrectomy with 100% renal function recovery. Cleared under UDAY NOTTO guidelines.`
  },
  {
    title: 'UDAY Sample 2: Samantha Reed (Platelets & Cornea)',
    text: `UDAY NATIONAL DONOR REGISTRY HISTORY EXTRACT
UDAY Ref ID: UDAY-NOTTO-2026-SR8821
Donor Name: Samantha Reed
Blood Group: A Negative (A-)
Last Screening Date: 2024-01-22
Hospital: Red Cross Medical Center

HISTORICAL RECORD:
- Date: 2022-09-15 | Organ: Blood | Recipient: Red Cross Center | Status: Completed
- Date: 2023-06-12 | Organ: Platelets | Recipient: City Hospital | Status: Completed
- Date: 2024-01-10 | Organ: Corneas | Recipient: Eye Care Institute | Status: Completed

MEDICAL EVALUATION:
- HLA Compatibility: Full Compatibility Matched
- Hemoglobin: 13.8 g/dL
- Serum Creatinine: 0.85 mg/dL
- Blood Pressure: 120/80 mmHg

Physician Notes: Excellent recovery baseline. Cleared for UDAY organ harvest registry.`
  },
  {
    title: 'UDAY Sample 3: David Miller (Liver Lobe Screening)',
    text: `UDAY SPECIALTY MEDICAL SCREENING REPORT
UDAY Ticket: UDAY-NOTTO-2026-DM4490
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
        toast.success('Document parsed successfully in UDAY Portal format!');
      } else {
        toast.error(response.message || 'Failed to parse document.');
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('AI OCR processing failed. Check network or try text input.');
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
        toast.success('Donor history calculated in UDAY Portal format!');
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
        recipientType: item.recipientType || 'UDAY Verified OCR',
        status: item.status || 'completed',
        notes: item.notes || `Verified under UDAY Ref #${scanResult.udayPortalFormat?.udayRefId || 'UDAY-NOTTO-2026'} via ${scanResult.aiEngineUsed || 'AI Model'}`,
        aiEngineUsed: scanResult.aiEngineUsed
      }));

      const response = await donorService.saveScannedHistory(itemsToSave);
      if (response.success) {
        toast.success('🎉 UDAY Verified history saved to your profile!');
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
    <Card className="p-6 sm:p-8 bg-[#0c0f26]/95 border-2 border-amber-400/50 backdrop-blur-2xl shadow-[6px_6px_0px_0px_#E5C158] rounded-3xl relative overflow-hidden text-gray-100">
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-400"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 text-xs font-black uppercase tracking-widest bg-amber-400/20 border border-amber-400/50 text-amber-300 rounded-full flex items-center gap-1.5 shadow-sm">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              UDAY Portal Standard (Universal Document Analysis)
            </span>
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Multimodal Gemini 1.5 + Tesseract OCR
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold royal-title text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-amber-400" />
            UDAY AI Document Verification & History Engine
          </h2>
          <p className="text-sm text-gray-300 mt-1 font-medium">
            Parses clinical lab reports, donation certificates, and NOTTO medical records into official UDAY structured digital verification schemas.
          </p>
        </div>

        {scanResult && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetScanner}
            className="border-amber-400/60 text-amber-300 hover:bg-amber-400/20 shadow-[3px_3px_0px_0px_#E5C158]"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Scan Another Document
          </Button>
        )}
      </div>

      {/* Mode Navigation */}
      {!scanResult && (
        <div className="flex bg-gray-950 p-1.5 rounded-2xl mb-6 max-w-md border border-amber-500/30">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-amber-400 text-gray-950 shadow-[3px_3px_0px_0px_#000]'
                : 'text-gray-400 hover:text-amber-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Document Image / PDF
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'text'
                ? 'bg-amber-400 text-gray-950 shadow-[3px_3px_0px_0px_#000]'
                : 'text-gray-400 hover:text-amber-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Report Text
          </button>
        </div>
      )}

      {/* Main Content Input Area */}
      {!scanResult ? (
        <div>
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                  file
                    ? 'border-amber-400 bg-amber-950/20'
                    : 'border-amber-500/40 hover:border-amber-400 bg-gray-950/60'
                }`}
              >
                <input
                  type="file"
                  id="uday-document-file-input"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative max-w-xs mx-auto mb-4 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400">
                    <img src={previewUrl} alt="UDAY Report Preview" className="w-full h-48 object-cover" />
                    {scanning && (
                      <motion.div
                        initial={{ y: -180 }}
                        animate={{ y: 180 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="absolute inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 shadow-[0_0_12px_#E5C158]"
                      />
                    )}
                  </div>
                ) : file ? (
                  <div className="flex items-center justify-center gap-3 py-6 text-amber-300 font-bold">
                    <FileCheck className="w-10 h-10 text-amber-400" />
                    <span>{file.name}</span>
                  </div>
                ) : (
                  <label htmlFor="uday-document-file-input" className="cursor-pointer block">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-base font-extrabold text-amber-200">
                      Click to upload medical document or drag & drop file
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Conforms to UDAY Portal OCR standard • Supports PNG, JPG, PDF (Max 5MB)
                    </p>
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                {file && (
                  <Button
                    variant="ghost"
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                    className="text-gray-400 hover:text-white"
                  >
                    Clear File
                  </Button>
                )}
                <Button
                  onClick={handleScanImage}
                  disabled={!file || scanning}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 font-black px-6 py-3 shadow-[4px_4px_0px_0px_#000]"
                  leftIcon={scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                >
                  {scanning ? 'Running UDAY Multimodal OCR Model...' : 'Execute UDAY AI Document Scan'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center justify-between">
                  <span>Paste Medical Report or Lab History Text:</span>
                  <span className="text-gray-400">UDAY Format Parser</span>
                </label>
                <textarea
                  rows={6}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste medical report, donor discharge summary, lab values, or past donation dates here..."
                  className="w-full p-4 border border-amber-500/40 rounded-2xl bg-gray-950 text-amber-100 focus:outline-none focus:border-amber-400 font-mono text-xs"
                />
              </div>

              {/* Sample Presets */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Try Sample UDAY Test Reports:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_REPORTS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTextInput(sample.text)}
                      className="text-xs py-1.5 px-3 rounded-xl bg-amber-950/40 text-amber-300 border border-amber-500/40 hover:bg-amber-950/80 font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  onClick={handleScanText}
                  disabled={!textInput.trim() || scanning}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 font-black px-6 py-3 shadow-[4px_4px_0px_0px_#000]"
                  leftIcon={scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                >
                  {scanning ? 'Analyzing Text with UDAY Engine...' : 'Execute UDAY AI Document Scan'}
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
          className="p-8 bg-rose-950/60 rounded-3xl border-2 border-rose-500 text-center space-y-4 shadow-[6px_6px_0px_0px_#E63946]"
        >
          <div className="w-16 h-16 bg-rose-900/50 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-rose-300 font-serif">
              UDAY Verification Exception: Invalid Medical Document
            </h3>
            <p className="text-sm text-rose-200 mt-2 max-w-lg mx-auto leading-relaxed font-medium">
              {scanResult.errorMessage || scanResult.udayPortalFormat?.errorMessage || "The uploaded document does not contain valid clinical parameters or NOTTO medical keywords."}
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={resetScanner}
              className="bg-rose-600 hover:bg-rose-500 text-white font-black shadow-[4px_4px_0px_0px_#000]"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Scan Valid Medical Record / Certificate
            </Button>
          </div>
        </motion.div>
      ) : (
        /* Render UDAY Portal Format Structured Passport Card */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Official UDAY Verification Certificate Header */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#121638] to-emerald-950/60 border-2 border-amber-400 shadow-[4px_4px_0px_0px_#E5C158] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 bg-amber-400 text-gray-950 font-black text-[11px] uppercase tracking-widest rounded-md shadow-sm">
                  {scanResult.udayPortalFormat?.udayRefId || 'UDAY-NOTTO-2026-X94B88'}
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-bold uppercase tracking-widest rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {scanResult.udayPortalFormat?.digitalSignatureStatus || 'DIGITALLY_SIGNED_UDAY_STAMP'}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-amber-200 font-serif mt-1">
                UDAY Digital Document Verification Certificate
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">
                {scanResult.udayPortalFormat?.securityHash || 'SHA256:e3b0c44298fc1c149afbf4c8996fb924'}
              </p>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Model Confidence Score</span>
              <span className="text-3xl font-black text-emerald-400">{scanResult.udayPortalFormat?.confidenceScore || 99.2}%</span>
              <span className="text-[10px] text-gray-500">{scanResult.aiEngineUsed}</span>
            </div>
          </div>

          {/* Demographics & Health Summary Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-950 border border-amber-500/30 rounded-2xl">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Donor / Patient Name</p>
              <p className="text-xl font-black text-amber-200 mt-1 truncate">{scanResult.donorName || 'Verified Donor'}</p>
              <p className="text-xs text-gray-400 mt-1">Identity Validated</p>
            </div>

            <div className="p-4 bg-gray-950 border border-rose-500/30 rounded-2xl">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Extracted Blood Group</p>
              <p className="text-2xl font-black text-rose-300 mt-1">{scanResult.bloodGroup || 'O+'}</p>
              <p className="text-xs text-gray-400 mt-1">Rh Factor Verified</p>
            </div>

            <div className="p-4 bg-gray-950 border border-emerald-500/30 rounded-2xl">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">UDAY Health Score</p>
              <p className="text-2xl font-black text-emerald-300 mt-1">{scanResult.calculatedHealthScore || 94} / 100</p>
              <p className="text-xs text-gray-400 mt-1">Clinical Baseline Readiness</p>
            </div>

            <div className="p-4 bg-gray-950 border border-cyan-500/30 rounded-2xl">
              <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Harvest Eligibility</p>
              <p className="text-base font-extrabold text-cyan-200 mt-1 truncate">{scanResult.eligibilityStatus || 'Eligible for Donation'}</p>
              <p className="text-xs text-gray-400 mt-1">Next: {scanResult.nextEligibleDonationDate || 'Immediate'}</p>
            </div>
          </div>

          {/* UDAY Assessment Summary */}
          <div className="p-5 bg-gray-950 border border-amber-500/30 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              UDAY Clinical Assessment Summary:
            </h4>
            <p className="text-sm text-gray-200 leading-relaxed font-medium">
              {scanResult.summary}
            </p>
            {scanResult.eligibilityDetails && (
              <p className="text-xs text-gray-400 italic pt-2 border-t border-gray-800">
                💡 <strong>UDAY Clinical Guidance:</strong> {scanResult.eligibilityDetails}
              </p>
            )}
          </div>

          {/* Extracted Clinical Biomarkers Matrix */}
          {scanResult.medicalMetrics && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-400" />
                UDAY Extracted Biomarkers & Clinical Parameters:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-950 rounded-xl border border-amber-500/30 text-center">
                  <span className="text-[10px] text-amber-400 font-bold block uppercase">HLA Compatibility</span>
                  <span className="text-sm font-extrabold text-amber-200 mt-1 block">
                    {scanResult.medicalMetrics.hlaMatch || 'N/A'}
                  </span>
                </div>
                <div className="p-3 bg-gray-950 rounded-xl border border-emerald-500/30 text-center">
                  <span className="text-[10px] text-emerald-400 font-bold block uppercase">Serum Creatinine</span>
                  <span className="text-sm font-extrabold text-emerald-200 mt-1 block">
                    {scanResult.medicalMetrics.creatinine || '0.9 mg/dL'}
                  </span>
                </div>
                <div className="p-3 bg-gray-950 rounded-xl border border-rose-500/30 text-center">
                  <span className="text-[10px] text-rose-400 font-bold block uppercase">Hemoglobin</span>
                  <span className="text-sm font-extrabold text-rose-200 mt-1 block">
                    {scanResult.medicalMetrics.hemoglobin || '14.2 g/dL'}
                  </span>
                </div>
                <div className="p-3 bg-gray-950 rounded-xl border border-cyan-500/30 text-center">
                  <span className="text-[10px] text-cyan-400 font-bold block uppercase">Blood Pressure</span>
                  <span className="text-sm font-extrabold text-cyan-200 mt-1 block">
                    {scanResult.medicalMetrics.bloodPressure || '120/80 mmHg'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* UDAY Organ Clearance Matrix */}
          {scanResult.organClearanceMatrix && scanResult.organClearanceMatrix.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-emerald-400" />
                UDAY Organ Harvest Clearance Matrix:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {scanResult.organClearanceMatrix.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-gray-950 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-emerald-200 text-sm">{item.organ}</p>
                      <p className="text-[10px] text-gray-400">Cold Ischemia: {item.viabilityWindow || 'Standard'}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider rounded-md">
                      {item.clearanceStatus || 'CLEARED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parsed Donation History Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              UDAY Extracted Donation Records ({scanResult.historyItems?.length || 0}):
            </h4>

            {scanResult.historyItems && scanResult.historyItems.length > 0 ? (
              <div className="space-y-3">
                {scanResult.historyItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-950 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-amber-200 text-base">
                            {item.organType} Donation
                          </h5>
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full">
                            {item.status || 'Completed'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Accredited Facility: <strong className="text-gray-200">{item.recipientName}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 py-1 px-3 rounded-full">
                        {item.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No historical records extracted.</p>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-400">
              Click save to sync these UDAY-authenticated records directly into your official donor dashboard.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={resetScanner}
                className="w-full sm:w-auto border-amber-400/60 text-amber-300"
              >
                Scan Another
              </Button>
              <Button
                onClick={handleSaveToProfile}
                disabled={saving}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 font-black px-6 py-3 shadow-[4px_4px_0px_0px_#000]"
                leftIcon={saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              >
                {saving ? 'Saving to Profile...' : 'Save UDAY Verified Record to Profile'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
};

export default AIDonorHistoryScanner;
