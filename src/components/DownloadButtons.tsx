import React, { useState } from 'react';
import { downloadVcfFile, downloadPdfFile } from '../lib/api';
import { Download, FileText, Sparkles, Loader2 } from 'lucide-react';

export const DownloadButtons: React.FC = () => {
  const [downloadingVcf, setDownloadingVcf] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleVcfDownload = () => {
    setDownloadingVcf(true);
    downloadVcfFile();
    setTimeout(() => setDownloadingVcf(false), 2000);
  };

  const handlePdfDownload = () => {
    setDownloadingPdf(true);
    downloadPdfFile();
    setTimeout(() => setDownloadingPdf(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* VCF Export Button */}
      <button
        onClick={handleVcfDownload}
        disabled={downloadingVcf}
        className="px-4 py-2.5 rounded-xl btn-purple text-xs font-bold flex items-center gap-2 shadow-lg"
        title="Generate and download .VCF vCard contact file"
      >
        {downloadingVcf ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4 text-purple-200" />
        )}
        <span>Download VCF File</span>
      </button>

      {/* PDF Export Button */}
      <button
        onClick={handlePdfDownload}
        disabled={downloadingPdf}
        className="px-4 py-2.5 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/35 transition-colors text-xs font-bold flex items-center gap-2 shadow-lg"
        title="Generate and download formatted PDF directory document"
      >
        {downloadingPdf ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4 text-cyan-400" />
        )}
        <span>Download PDF List</span>
      </button>
    </div>
  );
};
