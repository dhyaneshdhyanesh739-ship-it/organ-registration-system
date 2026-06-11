import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Award, Heart } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useToast } from '../context/ToastContext';

const Certificate = ({ isOpen, onClose, type, userData, details }) => {
  const certificateRef = useRef(null);
  const toast = useToast();

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${userData?.firstName}_${userData?.lastName}_${type}_Certificate.png`;
      link.click();
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate.');
    }
  };

  const getTitle = () => {
    if (type === 'donor') return 'Certificate of Organ Donation Pledge';
    if (type === 'hospital') return 'Certificate of Hospital Registration';
    return 'Certificate of Registration';
  };

  const getSubtitle = () => {
    if (type === 'donor') return 'A noble pledge to save lives and give the gift of hope.';
    if (type === 'hospital') return 'Authorized transplant center within the Organ Donor System.';
    return 'Acknowledging your journey towards receiving the gift of life.';
  };

  const formattedDate = details?.date 
    ? new Date(details.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Actions */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900 z-10">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Your Official Certificate</h3>
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-pink-600 text-white rounded-xl font-medium hover:from-primary-700 hover:to-pink-700 transition-all shadow-md shadow-primary-500/20"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Certificate Container (Scrollable area) */}
          <div className="p-6 md:p-10 overflow-y-auto bg-gray-100 dark:bg-black/50 flex justify-center items-start custom-scrollbar">
            
            {/* The Actual Certificate HTML to be captured */}
            <div 
              ref={certificateRef}
              className="relative w-full max-w-[800px] aspect-[1.414/1] bg-white text-gray-900 rounded-sm shadow-xl flex flex-col items-center justify-center p-12 overflow-hidden mx-auto print:shadow-none"
              style={{
                fontFamily: "'Times New Roman', Times, serif"
              }}
            >
              {/* Outer Border */}
              <div className="absolute inset-4 border-[6px] border-double border-[#d4af37] pointer-events-none opacity-80" />
              <div className="absolute inset-6 border-[1px] border-[#d4af37] pointer-events-none opacity-40" />
              
              {/* Background Pattern / Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Heart className="w-[400px] h-[400px] text-[#d4af37] fill-[#d4af37]" />
              </div>

              {/* Top Ornaments */}
              <div className="mb-4 z-10">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4af37]" />
                  <Award className="w-10 h-10 text-[#d4af37]" />
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#d4af37]" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-widest text-[#1a202c] mb-2 text-center z-10" style={{ fontFamily: "Georgia, serif" }}>
                {getTitle()}
              </h1>
              <p className="text-[#4a5568] italic text-base mb-6 text-center z-10 border-b border-[#d4af37]/30 pb-3 px-12">
                {getSubtitle()}
              </p>

              {/* Presented To */}
              <div className="text-center z-10 mb-4 w-full">
                <p className="uppercase tracking-[0.2em] text-xs text-[#718096] mb-2">This acknowledges that</p>
                <h2 className="text-4xl md:text-5xl text-[#d4af37] font-bold mb-2 capitalize px-8 pb-1" style={{ fontFamily: "'Great Vibes', cursive, 'Times New Roman'" }}>
                  {userData?.firstName} {userData?.lastName}
                </h2>
                <div className="w-1/2 mx-auto h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mb-4" />
                
                {/* Dynamic Content based on Type */}
                <div className="text-lg text-[#2d3748] leading-relaxed max-w-2xl mx-auto italic mb-4">
                  {type === 'donor' ? (
                    <p>
                      Has officially registered as an organ donor, committing to the selfless 
                      act of organ donation. Registered with Blood Group <strong className="text-[#e53e3e] not-italic">{details?.bloodGroup || 'N/A'}</strong>.
                    </p>
                  ) : type === 'hospital' ? (
                    <p>
                      Has been officially verified and registered as an authorized transplant center 
                      with system privileges. Operating in <strong className="text-[#3182ce] not-italic">{details?.city || 'N/A'}</strong>.
                    </p>
                  ) : (
                    <p>
                      Is officially registered within the Organ Donor System as an authorized recipient 
                      for <strong className="text-[#3182ce] not-italic">{details?.organNeeded || 'Organ Transplant'}</strong> treatment.
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Details & Signatures - Moved further down to prevent overlap */}
              <div className="absolute bottom-10 left-16 right-16 flex justify-between items-end z-10 w-[calc(100%-8rem)]">
                <div className="text-center w-48">
                  <div className="text-lg font-medium text-[#2d3748]">{formattedDate}</div>
                  <div className="h-px w-full bg-[#cbd5e0] my-2" />
                  <div className="text-xs font-bold uppercase tracking-wider text-[#718096]">Date of Registration</div>
                </div>

                {/* Seal */}
                <div className="relative flex justify-center items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-[#d4af37] bg-white flex items-center justify-center shadow-lg relative z-10">
                    <Heart className="w-8 h-8 text-[#d4af37] fill-[#d4af37]" />
                  </div>
                  <div className="absolute w-28 h-28 rounded-full border border-[#d4af37]/30" />
                </div>

                <div className="text-center w-48">
                  <div className="text-2xl font-bold text-[#d4af37]" style={{ fontFamily: "'Great Vibes', cursive, 'Times New Roman'" }}>DHYANESH.S.E.</div>
                  <div className="h-px w-full bg-[#cbd5e0] my-2" />
                  <div className="text-xs font-bold uppercase tracking-wider text-[#718096]">Authorized Signature</div>
                </div>
              </div>
              
              {/* System ID Tag */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-[#a0aec0] uppercase tracking-widest font-sans">
                Certificate ID: OD-{userData?._id ? userData._id.substring(0, 8).toUpperCase() : 'SYS'}-{new Date().getFullYear()}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Certificate;
