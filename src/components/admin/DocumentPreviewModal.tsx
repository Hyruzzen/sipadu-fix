import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Eye,
  Maximize2,
  Minimize2,
  FileWarning,
  ExternalLink,
  ShieldCheck,
  Building,
  Check,
  XCircle,
  Loader2
} from 'lucide-react';
import { Submission, AttachmentFile } from '../../types';
import { ArchiveService } from '../../services/archiveService';
import { DESA_INFO } from '../../data/mockData';
import { KabupatenBandungLogo } from '../KabupatenBandungLogo';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
  initialIndex?: number;
  onApprove?: (sub: Submission) => void;
  onReject?: (sub: Submission) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  submission,
  initialIndex = 0,
  onApprove,
  onReject
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [loadingUrl, setLoadingUrl] = useState<boolean>(false);

  // Safe parse attachments (memoized to prevent infinite re-render cycles)
  const attachments: AttachmentFile[] = useMemo(() => {
    if (!submission?.attachments) {
      return [
        {
          name: 'Dokumen_Persyaratan.pdf',
          type: 'Berkas Persyaratan Kependudukan',
          url: '#'
        }
      ];
    }
    if (Array.isArray(submission.attachments) && submission.attachments.length > 0) {
      return submission.attachments;
    }
    try {
      const parsed = typeof submission.attachments === 'string'
        ? JSON.parse(submission.attachments)
        : submission.attachments;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fallback below
    }
    return [
      {
        name: 'Dokumen_Persyaratan.pdf',
        type: 'Berkas Persyaratan Kependudukan',
        url: '#'
      }
    ];
  }, [submission?.id, submission?.attachments]);

  const currentDoc = attachments[currentIndex] || attachments[0] || {
    name: 'Dokumen_Persyaratan.pdf',
    type: 'Berkas Persyaratan Kependudukan',
    url: '#'
  };

  const currentStoragePath = currentDoc.storagePath || '';
  const currentFallbackUrl = currentDoc.url || '';

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
    setRotation(0);
  }, [initialIndex, isOpen, submission?.id]);

  useEffect(() => {
    if (!isOpen || !submission) {
      setResolvedUrl('');
      setLoadingUrl(false);
      return;
    }

    let isMounted = true;
    if (currentStoragePath) {
      setLoadingUrl(true);

      // Timeout pengaman (3.5 detik) agar status loading tidak pernah macet
      const safetyTimeout = setTimeout(() => {
        if (isMounted) {
          setResolvedUrl((prev) => prev || currentFallbackUrl);
          setLoadingUrl(false);
        }
      }, 3500);

      ArchiveService.getAttachmentSignedUrl(currentStoragePath)
        .then((url) => {
          if (isMounted) {
            setResolvedUrl(url && url !== '#' ? url : currentFallbackUrl);
          }
        })
        .catch(() => {
          if (isMounted) setResolvedUrl(currentFallbackUrl);
        })
        .finally(() => {
          clearTimeout(safetyTimeout);
          if (isMounted) setLoadingUrl(false);
        });

      return () => {
        isMounted = false;
        clearTimeout(safetyTimeout);
      };
    } else {
      setResolvedUrl(currentFallbackUrl);
      setLoadingUrl(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, submission?.id, currentIndex, currentStoragePath, currentFallbackUrl]);

  // ALL HOOKS ABOVE. Early return is safe here now.
  if (!isOpen || !submission) return null;

  let details: any = {};
  if (submission.details) {
    if (typeof submission.details === 'object') {
      details = submission.details;
    } else {
      try {
        details = JSON.parse(submission.details);
      } catch {
        details = {};
      }
    }
  }

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const isRealImage = (url: string, name: string) => {
    if (!url || url === '#' || url === '') return false;
    const lower = (name || '').toLowerCase();
    const hasImageExt = lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.gif');
    if (hasImageExt) return true;
    if (url.startsWith('data:image/')) return true;
    if (url.startsWith('blob:') && !lower.endsWith('.pdf')) return true;
    return false;
  };

  const isRealPdf = (url: string, name: string) => {
    if (!url || url === '#' || url === '') return false;
    const lower = (name || '').toLowerCase();
    if (lower.endsWith('.pdf')) return true;
    if (url.startsWith('data:application/pdf')) return true;
    if (url.includes('.pdf?') || url.includes('.pdf')) return true;
    return false;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const targetUrl = resolvedUrl || currentDoc.url;
    if (targetUrl && targetUrl !== '#') {
      const a = document.createElement('a');
      a.href = targetUrl;
      a.download = currentDoc.name || 'dokumen.pdf';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.print();
    }
  };

  // Helper to categorize mock document type for visual simulation
  const getDocCategory = (name: string, type: string) => {
    const combined = `${name} ${type}`.toLowerCase();
    if (combined.includes('kk') || combined.includes('keluarga')) return 'kk';
    if (combined.includes('ktp')) return 'ktp';
    if (combined.includes('lahir') || combined.includes('bidan') || combined.includes('puskesmas') || combined.includes('medis')) return 'lahir';
    if (combined.includes('mati') || combined.includes('kematian')) return 'kematian';
    if (combined.includes('pindah') || combined.includes('skpwni') || combined.includes('tujuan') || combined.includes('asal')) return 'pindah';
    if (combined.includes('pengantar') || combined.includes('rt') || combined.includes('rw')) return 'pengantar';
    if (combined.includes('nikah')) return 'nikah';
    return 'generic';
  };

  const docCategory = getDocCategory(currentDoc.name, currentDoc.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`bg-stone-900 rounded-2xl w-full flex flex-col shadow-2xl border border-stone-800 overflow-hidden text-stone-100 transition-all ${
          isFullscreen ? 'h-full max-w-full rounded-none' : 'max-w-5xl max-h-[92vh] h-[850px]'
        }`}
      >
        {/* TOP TOOLBAR */}
        <div className="px-4 py-3 bg-stone-900 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Document metadata info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-stone-100 truncate max-w-xs sm:max-w-md">
                  {currentDoc.name}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                  {currentDoc.type || 'Dokumen Persyaratan'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 truncate">
                Pemohon: <span className="text-stone-300 font-medium">{submission.userName}</span> (NIK: {submission.userNik}) • {submission.title}
              </p>
            </div>
          </div>

          {/* Action and Viewer Controls */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Zoom Controls */}
            <div className="flex items-center bg-stone-800/90 rounded-lg p-0.5 border border-stone-700">
              <button
                onClick={handleZoomOut}
                title="Perkecil (-)"
                className="p-1.5 rounded-md hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Reset Zoom (100%)"
                className="px-2 py-1 text-[11px] font-mono text-stone-300 hover:text-white hover:bg-stone-700 rounded transition-colors"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                title="Perbesar (+)"
                className="p-1.5 rounded-md hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotate}
                title="Putar 90 Derajat"
                className="p-1.5 rounded-md hover:bg-stone-700 text-stone-300 hover:text-white border-l border-stone-700 ml-0.5 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Print & Download */}
            <button
              onClick={handleDownload}
              title="Unduh / Cetak Dokumen"
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              title="Cetak Berkas"
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors hidden sm:block"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              title="Tutup Pratinjau (Esc)"
              className="p-2 rounded-lg bg-stone-800 hover:bg-red-900/60 text-stone-300 hover:text-red-200 border border-stone-700 hover:border-red-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DOCUMENT TABS BAR (If multiple attachments) */}
        {attachments.length > 1 && (
          <div className="bg-stone-950/90 px-4 py-2 border-b border-stone-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider shrink-0 mr-1">
                Berkas Terlampir ({attachments.length}):
              </span>
              {attachments.map((att, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setZoomLevel(1);
                    setRotation(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
                    currentIndex === idx
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[140px]">{att.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  setCurrentIndex((prev) => Math.max(prev - 1, 0));
                  setZoomLevel(1);
                  setRotation(0);
                }}
                className="p-1 rounded-md bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300"
                title="Dokumen Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-stone-400 px-1">
                {currentIndex + 1} / {attachments.length}
              </span>
              <button
                disabled={currentIndex === attachments.length - 1}
                onClick={() => {
                  setCurrentIndex((prev) => Math.min(prev + 1, attachments.length - 1));
                  setZoomLevel(1);
                  setRotation(0);
                }}
                className="p-1 rounded-md bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300"
                title="Dokumen Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* MAIN VIEWER AREA */}
        <div className="flex-1 bg-stone-950 p-4 sm:p-6 overflow-auto flex items-center justify-center relative select-none">
          <div
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out'
            }}
            className="flex items-center justify-center max-w-full"
          >
            {/* Loading signed URL */}
            {loadingUrl ? (
              <div className="flex flex-col items-center justify-center p-12 text-stone-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-xs">Memuat dokumen dari penyimpanan aman...</p>
              </div>
            ) : isRealImage(resolvedUrl || currentDoc.url, currentDoc.name) ? (
              /* 1. Real Image Upload */
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-xl overflow-hidden shadow-2xl border border-stone-700 bg-black/40">
                  <img
                    src={resolvedUrl || currentDoc.url}
                    alt={currentDoc.name}
                    className="max-h-[680px] max-w-full object-contain pointer-events-auto"
                  />
                </div>
                <a
                  href={resolvedUrl || currentDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Gambar Ukuran Penuh di Tab Baru
                </a>
              </div>
            ) : isRealPdf(resolvedUrl || currentDoc.url, currentDoc.name) ? (
              /* 2. Real PDF Preview */
              <div className="w-[750px] h-[650px] bg-white rounded-xl shadow-2xl overflow-hidden border border-stone-700 flex flex-col">
                <div className="bg-stone-100 px-3 py-1.5 border-b border-stone-200 flex items-center justify-between text-xs text-stone-700">
                  <span className="font-semibold truncate max-w-xs">{currentDoc.name}</span>
                  <a
                    href={resolvedUrl || currentDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka PDF di Tab Baru
                  </a>
                </div>
                <iframe
                  src={resolvedUrl || currentDoc.url}
                  title={currentDoc.name}
                  className="w-full flex-1 border-0"
                />
              </div>
            ) : (
              /* 3. Authentic Village Civic Document Simulation */
              <div className="w-[780px] min-h-[600px] bg-white text-stone-900 rounded-xl shadow-2xl p-8 border border-stone-300 relative font-sans text-xs">
                {/* WATERMARK */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
                  <div className="transform -rotate-45 text-center">
                    <span className="text-8xl font-black text-stone-900 tracking-widest block uppercase">
                      DESA BOJONGLOA
                    </span>
                    <span className="text-3xl font-bold tracking-widest block mt-4">
                      ARSIP RESMI KEPENDUDUKAN
                    </span>
                  </div>
                </div>

                {/* VERIFICATION CHIP */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lampiran Terverifikasi Digital</span>
                </div>

                {/* DOCUMENT TYPE SPECIFIC RENDERING */}
                {docCategory === 'kk' && (
                  <div className="space-y-4">
                    {/* Header Garuda */}
                    <div className="text-center pb-3 border-b-2 border-stone-800">
                      <div className="text-xs font-bold tracking-widest uppercase text-stone-600">
                        REPUBLIK INDONESIA
                      </div>
                      <h2 className="text-xl font-extrabold tracking-wider text-stone-900 uppercase">
                        KARTU KELUARGA
                      </h2>
                      <div className="text-sm font-mono font-bold text-stone-800 mt-1">
                        No. {details.noKk || '3204120101180001'}
                      </div>
                    </div>

                    {/* Metadata Columns */}
                    <div className="grid grid-cols-2 gap-4 text-[11px] pt-1">
                      <div className="space-y-1">
                        <div className="flex">
                          <span className="w-36 font-semibold text-stone-600">Nama Kepala Keluarga:</span>
                          <span className="font-bold text-stone-900 uppercase">
                            {details.namaKepalaKeluarga || details.namaAyah || submission.userName}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="w-36 font-semibold text-stone-600">Alamat:</span>
                          <span className="font-medium text-stone-800">
                            {details.alamatAsalBojongloa || details.alamatTujuanBojongloa || 'Jl. Raya Desa Bojongloa'}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="w-36 font-semibold text-stone-600">RT / RW:</span>
                          <span className="font-medium text-stone-800">
                            RT {details.rtAsal || details.rtTujuan || '02'} / RW {details.rwAsal || details.rwTujuan || '03'}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="w-36 font-semibold text-stone-600">Dusun:</span>
                          <span className="font-medium text-stone-800">
                            {details.dusunAsal || details.dusunTujuan || 'Dusun Babakan'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex">
                          <span className="w-36 font-semibold text-stone-600">Desa / Kelurahan:</span>
                          <span className="font-medium text-stone-800">{DESA_INFO.namaDesa}</span>
                        </div>
                        <div className="flex">
                          <span className="w-36 font-semibold text-stone-600">Kecamatan:</span>
                          <span className="font-medium text-stone-800">{DESA_INFO.kecamatan}</span>
                        </div>
                        <div className="flex">
                          <span className="w-36 font-semibold text-stone-600">Kabupaten:</span>
                          <span className="font-medium text-stone-800">{DESA_INFO.kabupaten}</span>
                        </div>
                        <div className="flex">
                          <span className="w-36 font-semibold text-stone-600">Kode Pos / Wilayah:</span>
                          <span className="font-medium text-stone-800">{DESA_INFO.kodePos} ({DESA_INFO.kodeWilayah})</span>
                        </div>
                      </div>
                    </div>

                    {/* Table Family Members */}
                    <div className="border border-stone-300 rounded-lg overflow-hidden mt-3">
                      <table className="w-full text-left text-[10px]">
                        <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-300">
                          <tr>
                            <th className="p-1.5 text-center w-8">No</th>
                            <th className="p-1.5">Nama Lengkap</th>
                            <th className="p-1.5">NIK</th>
                            <th className="p-1.5">Jenis Kelamin</th>
                            <th className="p-1.5">Tempat Lahir</th>
                            <th className="p-1.5">Agama</th>
                            <th className="p-1.5">Hub. Keluarga</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          <tr>
                            <td className="p-1.5 text-center font-mono">1</td>
                            <td className="p-1.5 font-bold uppercase">
                              {details.namaAyah || details.namaKepalaKeluarga || submission.userName}
                            </td>
                            <td className="p-1.5 font-mono">{details.nikAyah || submission.userNik}</td>
                            <td className="p-1.5">LAKI-LAKI</td>
                            <td className="p-1.5">BANDUNG</td>
                            <td className="p-1.5">ISLAM</td>
                            <td className="p-1.5 font-semibold">KEPALA KELUARGA</td>
                          </tr>
                          {details.namaIbu && (
                            <tr>
                              <td className="p-1.5 text-center font-mono">2</td>
                              <td className="p-1.5 font-bold uppercase">{details.namaIbu}</td>
                              <td className="p-1.5 font-mono">{details.nikIbu || '3204125807950002'}</td>
                              <td className="p-1.5">PEREMPUAN</td>
                              <td className="p-1.5">BANDUNG</td>
                              <td className="p-1.5">ISLAM</td>
                              <td className="p-1.5 font-semibold">ISTRI</td>
                            </tr>
                          )}
                          {details.namaBayi && (
                            <tr>
                              <td className="p-1.5 text-center font-mono">3</td>
                              <td className="p-1.5 font-bold uppercase text-emerald-800">{details.namaBayi}</td>
                              <td className="p-1.5 font-mono text-stone-400">Dalam Proses Registrasi</td>
                              <td className="p-1.5">{details.jenisKelaminBayi === 'P' ? 'PEREMPUAN' : 'LAKI-LAKI'}</td>
                              <td className="p-1.5">{details.tempatLahir || 'BOJONGLOA'}</td>
                              <td className="p-1.5">ISLAM</td>
                              <td className="p-1.5 font-semibold text-emerald-700">ANAK</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Bottom stamps */}
                    <div className="flex justify-between items-end pt-6 text-[10px]">
                      <div className="text-center w-48">
                        <div>KEPALA KELUARGA</div>
                        <div className="h-14 flex items-center justify-center font-script text-stone-400 italic">
                          (Tanda Tangan)
                        </div>
                        <div className="font-bold underline uppercase">
                          {details.namaKepalaKeluarga || details.namaAyah || submission.userName}
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-2 border-stone-800 flex items-center justify-center font-mono text-[9px] p-1 text-center font-bold">
                          QR CODE RESMI DISDUKCAPIL
                        </div>
                        <span className="text-[9px] font-mono text-stone-500 mt-1">BSRE - Balai Sertifikasi Elektronik</span>
                      </div>

                      <div className="text-center w-52">
                        <div>Diterbitkan: Bojongloa</div>
                        <div>Kepala Dinas Kependudukan & Pencatatan Sipil</div>
                        <div className="h-12 flex items-center justify-center">
                          <span className="px-2 py-0.5 border border-emerald-600 rounded text-emerald-700 font-bold text-[9px]">
                            TTE DISDUKCAPIL KAB. BANDUNG
                          </span>
                        </div>
                        <div className="font-bold underline">DR. H. DRS. SUJANA, M.Si</div>
                        <div className="font-mono text-[9px]">NIP. 19680512 199303 1 004</div>
                      </div>
                    </div>
                  </div>
                )}

                {docCategory === 'ktp' && (
                  <div className="flex items-center justify-center py-6">
                    {/* E-KTP CARD MOCKUP */}
                    <div className="w-[500px] h-[310px] bg-gradient-to-br from-sky-200 via-sky-100 to-cyan-200 rounded-2xl shadow-xl border-2 border-sky-400/80 p-5 relative overflow-hidden flex flex-col justify-between text-stone-900 font-sans">
                      {/* E-KTP Header */}
                      <div className="text-center pb-2 border-b border-sky-300">
                        <div className="font-bold text-[11px] tracking-wider uppercase text-sky-950">
                          PROVINSI JAWA BARAT
                        </div>
                        <div className="font-extrabold text-[12px] tracking-wider uppercase text-sky-950">
                          KABUPATEN BANDUNG
                        </div>
                      </div>

                      {/* E-KTP Body */}
                      <div className="flex justify-between items-start gap-4 text-[10px] leading-tight my-auto">
                        <div className="space-y-1 flex-1 font-mono">
                          <div className="text-[14px] font-black tracking-widest text-stone-950 mb-1">
                            NIK : {submission.userNik}
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-stone-700 font-sans">Nama</span>
                            <span className="col-span-8 font-bold uppercase">{submission.userName}</span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-stone-700 font-sans">Tempat/Tgl Lahir</span>
                            <span className="col-span-8 font-bold">BANDUNG, 15-03-1992</span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-stone-700 font-sans">Jenis Kelamin</span>
                            <span className="col-span-8 font-bold">LAKI-LAKI</span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-stone-700 font-sans">Alamat</span>
                            <span className="col-span-8 font-bold uppercase">DESA BOJONGLOA</span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-stone-700 font-sans pl-2">RT/RW</span>
                            <span className="col-span-8 font-bold">002 / 003</span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-stone-700 font-sans pl-2">Kel/Desa</span>
                            <span className="col-span-8 font-bold uppercase">BOJONGLOA</span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-stone-700 font-sans pl-2">Kecamatan</span>
                            <span className="col-span-8 font-bold uppercase">RANCAEKEK</span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-stone-700 font-sans">Agama</span>
                            <span className="col-span-8 font-bold">ISLAM</span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-stone-700 font-sans">Status Perkawinan</span>
                            <span className="col-span-8 font-bold">KAWIN</span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-stone-700 font-sans">Kewarganegaraan</span>
                            <span className="col-span-8 font-bold">WNI</span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-stone-700 font-sans">Berlaku Hingga</span>
                            <span className="col-span-8 font-bold">SEUMUR HIDUP</span>
                          </div>
                        </div>

                        {/* Photo box and Chip */}
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <div className="w-8 h-6 rounded bg-amber-300 border border-amber-500 shadow-2xs self-start" title="Smart Chip KTP-el" />
                          <div className="w-24 h-32 bg-stone-200 border-2 border-stone-400 rounded-md flex flex-col items-center justify-center text-stone-400 shadow-inner">
                            <div className="w-10 h-10 rounded-full bg-stone-300 mb-1" />
                            <div className="w-14 h-10 rounded-t-xl bg-stone-300" />
                          </div>
                          <div className="text-[8px] font-bold text-stone-500 text-center uppercase tracking-wider">
                            KAB. BANDUNG
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {docCategory === 'lahir' && (
                  <div className="space-y-4">
                    {/* Puskesmas / Bidan Header */}
                    <div className="flex items-center gap-3 pb-3 border-b-2 border-stone-800">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 font-bold">
                        <KabupatenBandungLogo className="w-10 h-10" />
                      </div>
                      <div className="flex-1 text-center">
                        <h4 className="font-bold text-xs uppercase tracking-wide text-stone-700">
                          PEMERINTAH KABUPATEN BANDUNG • DINAS KESEHATAN
                        </h4>
                        <h3 className="font-extrabold text-sm uppercase text-stone-900">
                          UPTD PUSKESMAS & KLINIK BIDAN DESA BOJONGLOA
                        </h3>
                        <p className="text-[10px] text-stone-500">
                          Jl. Raya Bojongloa No. 12, Rancaekek, Kab. Bandung • Telp (022) 7798123
                        </p>
                      </div>
                    </div>

                    <div className="text-center py-2">
                      <h2 className="text-sm font-bold uppercase underline tracking-wider text-stone-900">
                        SURAT KETERANGAN KELAHIRAN
                      </h2>
                      <div className="text-[11px] font-mono text-stone-500">
                        Nomor Medis: SKL/2026/BJL/0{submission.id.replace(/\D/g, '') || '42'}
                      </div>
                    </div>

                    <p className="text-[11px] leading-relaxed text-stone-800">
                      Yang bertanda tangan di bawah ini, Bidan Pemeriksa Persalinan pada UPTD Puskesmas / Klinik
                      Desa Bojongloa menerangkan bahwa telah lahir seorang anak:
                    </p>

                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-[11px]">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">Nama Bayi:</span>
                        <span className="col-span-2 font-bold text-emerald-900 uppercase">
                          {details.namaBayi || 'Muhammad Arka Saepudin'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">Jenis Kelamin:</span>
                        <span className="col-span-2 font-medium">
                          {details.jenisKelaminBayi === 'P' ? 'Perempuan' : 'Laki-laki'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">Hari, Tanggal & Jam:</span>
                        <span className="col-span-2 font-medium">
                          {details.tanggalLahir || '15 September 2026'} pukul {details.jamLahir || '06:30'} WIB
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">Tempat Persalinan:</span>
                        <span className="col-span-2 font-medium">{details.tempatLahir || 'Bidan Hj. Kokom Bojongloa'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-t border-stone-200 pt-2">
                        <span className="font-semibold text-stone-600">Nama Ibu Kandung:</span>
                        <span className="col-span-2 font-bold uppercase">{details.namaIbu || 'Siti Rohani'} (NIK: {details.nikIbu || '3204125807950002'})</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">Nama Ayah Kandung:</span>
                        <span className="col-span-2 font-bold uppercase">{details.namaAyah || submission.userName} (NIK: {details.nikAyah || submission.userNik})</span>
                      </div>
                    </div>

                    <p className="text-[11px] leading-relaxed text-stone-800">
                      Surat keterangan ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagai persyaratan
                      pengurusan Akta Kelahiran dan Registrasi Kependudukan di Kantor Desa Bojongloa.
                    </p>

                    <div className="flex justify-between items-center pt-6 text-[10px]">
                      <div className="p-3 border border-stone-300 rounded-lg text-center bg-stone-50">
                        <div className="font-bold text-stone-700">CAP RESMI PUSKESMAS</div>
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-600 mx-auto my-1 flex items-center justify-center text-[8px] text-emerald-800 font-bold">
                          TERVERIFIKASI
                        </div>
                      </div>

                      <div className="text-center w-56">
                        <div>Bojongloa, {new Date(submission.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <div className="font-medium mt-1">Bidan Penolong Persalinan,</div>
                        <div className="h-12 flex items-center justify-center font-script text-stone-400 italic">
                          (Tanda Tangan & Cap)
                        </div>
                        <div className="font-bold underline">Hj. Kokom Komariah, S.Tr.Keb</div>
                        <div className="text-stone-500 font-mono text-[9px]">SIPB: 503/446/SIPB/DPMPTSP/2024</div>
                      </div>
                    </div>
                  </div>
                )}

                {docCategory === 'kematian' && (
                  <div className="space-y-4">
                    {/* RT / RW Surat Pengantar Kematian */}
                    <div className="text-center pb-3 border-b-2 border-stone-800">
                      <h4 className="font-bold text-xs uppercase tracking-wide text-stone-700">
                        RUKUN TETANGGA 04 / RUKUN WARGA 04 • DUSUN CIKADU
                      </h4>
                      <h3 className="font-extrabold text-sm uppercase text-stone-900">
                        DESA BOJONGLOA • KECAMATAN RANCAEKEK
                      </h3>
                    </div>

                    <div className="text-center py-2">
                      <h2 className="text-sm font-bold uppercase underline tracking-wider text-stone-900">
                        SURAT PERNYATAAN / KETERANGAN KEMATIAN
                      </h2>
                      <div className="text-[11px] font-mono text-stone-500">
                        Nomor: 474.2 / 014 / RT04-RW04 / {new Date().getFullYear()}
                      </div>
                    </div>

                    <p className="text-[11px] leading-relaxed text-stone-800">
                      Ketua Rukun Tetangga (RT) 04 / RW 04 Dusun Cikadu Desa Bojongloa dengan ini menerangkan bahwa:
                    </p>

                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-[11px]">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">Nama Almarhum/ah:</span>
                        <span className="col-span-2 font-bold text-red-950 uppercase">{details.namaAlmarhum || 'Abah Sukardi'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">NIK Almarhum:</span>
                        <span className="col-span-2 font-mono font-bold">{details.nikAlmarhum || '3204120501400006'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">Umur / Jenis Kelamin:</span>
                        <span className="col-span-2 font-medium">{details.umur || '86'} Tahun / {details.jenisKelamin === 'P' ? 'Perempuan' : 'Laki-laki'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">Meninggal Pada:</span>
                        <span className="col-span-2 font-medium">{details.tanggalKematian || '28 September 2026'}, Jam {details.jamKematian || '21:15'} WIB</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">Tempat Meninggal:</span>
                        <span className="col-span-2 font-medium">{details.tempatKematian || 'Kediaman Kp. Cikadu RT 04/RW 04'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">Penyebab Kematian:</span>
                        <span className="col-span-2 font-medium">{details.sebabKematian || 'Usia Lanjut (Sakit Tua)'}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-6 text-[10px]">
                      <div className="text-center w-48">
                        <div>Saksi / Pelapor,</div>
                        <div className="h-12 flex items-center justify-center font-script text-stone-400 italic">
                          (Tanda Tangan)
                        </div>
                        <div className="font-bold underline uppercase">{details.namaPelapor || submission.userName}</div>
                      </div>

                      <div className="text-center w-48">
                        <div>Ketua RT 04 Dusun Cikadu,</div>
                        <div className="h-12 flex items-center justify-center font-script text-stone-400 italic">
                          (Tanda Tangan & Cap)
                        </div>
                        <div className="font-bold underline uppercase">M. SOLEHUDIN</div>
                      </div>

                      <div className="text-center w-48">
                        <div>Mengetahui, Ketua RW 04,</div>
                        <div className="h-12 flex items-center justify-center font-script text-stone-400 italic">
                          (Tanda Tangan & Cap)
                        </div>
                        <div className="font-bold underline uppercase">H. ACENG SURYANA</div>
                      </div>
                    </div>
                  </div>
                )}

                {(docCategory === 'pindah' || docCategory === 'pengantar' || docCategory === 'generic') && (
                  <div className="space-y-4">
                    {/* Official Document Layout */}
                    <div className="text-center pb-3 border-b-2 border-stone-800">
                      <div className="flex items-center justify-center gap-3">
                        <KabupatenBandungLogo className="w-10 h-10 shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-wide text-stone-700">
                            PEMERINTAH DAERAH KABUPATEN BANDUNG
                          </h4>
                          <h3 className="font-extrabold text-sm uppercase text-stone-900">
                            KECAMATAN RANCAEKEK • KANTOR DESA BOJONGLOA
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="text-center py-2">
                      <h2 className="text-sm font-bold uppercase underline tracking-wider text-stone-900">
                        {currentDoc.type || 'BERKAS LAMPIRAN PERSYARATAN RESMI'}
                      </h2>
                      <div className="text-[11px] font-mono text-stone-500">
                        Nama Berkas: {currentDoc.name}
                      </div>
                    </div>

                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-[11px]">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">Nama Pemohon:</span>
                        <span className="col-span-2 font-bold text-stone-900 uppercase">{submission.userName}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">NIK Pemohon:</span>
                        <span className="col-span-2 font-mono font-bold">{submission.userNik}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">Jenis Permohonan:</span>
                        <span className="col-span-2 font-medium capitalize">{submission.type.replace('_', ' ')}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-stone-600">Waktu Pengunggahan:</span>
                        <span className="col-span-2 font-medium">
                          {new Date(submission.createdAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                      {submission.suratNumber && (
                        <div className="grid grid-cols-3 gap-2 border-t border-stone-200 pt-2">
                          <span className="font-semibold text-stone-600">Nomor Registrasi:</span>
                          <span className="col-span-2 font-mono font-bold text-emerald-800">{submission.suratNumber}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        Status Validasi Dokumen: Memenuhi Syarat Administrasi
                      </div>
                      <p className="text-[11px] text-emerald-900 leading-relaxed">
                        Dokumen digital ini telah diperiksa kesesuaian format dan kelengkapan administrasinya.
                        Petugas administrasi desa dapat menyetujui penerbitan surat register kependudukan.
                      </p>
                    </div>

                    <div className="flex justify-between items-end pt-8 text-[10px]">
                      <div className="text-center w-48">
                        <div>Pemohon / Yang Bersangkutan,</div>
                        <div className="h-12 flex items-center justify-center font-script text-stone-400 italic">
                          (Tanda Tangan)
                        </div>
                        <div className="font-bold underline uppercase">{submission.userName}</div>
                      </div>

                      <div className="text-center w-52">
                        <div>Kantor Desa Bojongloa,</div>
                        <div>Petugas Verifikasi Arsip</div>
                        <div className="h-12 flex items-center justify-center">
                          <span className="px-2 py-0.5 border border-emerald-600 rounded text-emerald-700 font-bold text-[9px]">
                            TERVERIFIKASI
                          </span>
                        </div>
                        <div className="font-bold underline">{submission.approvedBy || 'Petugas Pelayanan Desa'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="px-4 py-3 bg-stone-900 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dokumen {currentIndex + 1} dari {attachments.length}</span>
            <span className="text-stone-600">•</span>
            <span className="font-mono text-stone-400">{currentDoc.name}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Quick Action Buttons inside Preview */}
            {submission.status !== 'disetujui' && onApprove && (
              <button
                onClick={() => {
                  onClose();
                  onApprove(submission);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Setujui Berkas Ini</span>
              </button>
            )}

            {submission.status !== 'ditolak' && onReject && (
              <button
                onClick={() => {
                  onClose();
                  onReject(submission);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Tolak Berkas</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-colors"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
