"use client";
import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Download, 
  Share2, 
  Check, 
  ExternalLink, 
  MessageCircle,
  Phone,
  Type,
  Link as LinkIcon,
  QrCode
} from 'lucide-react';

export default function LinkGenerator() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');

  useEffect(() => {
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const encodedMsg = encodeURIComponent(message);
      const link = `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
      setGeneratedLink(link);

      // Meta CAPI & Lead Capture
      const timer = setTimeout(() => {
        // 1. Meta Event
        fetch('/api/meta/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName: 'Lead',
                customData: {
                    content_name: 'WhatsApp Link Generation',
                    content_category: 'Utility Tools'
                }
            })
        }).catch(() => {});

        // 2. Lead Capture (Background Sync)
        if (cleanPhone.length >= 10) {
            fetch('/api/tools/lead-capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: cleanPhone,
                    tool: 'LINK_GENERATOR',
                    metadata: { message }
                })
            }).catch(() => {});
        }
      }, 2000); // 2s debounce

      return () => clearTimeout(timer);
    } else {
      setGeneratedLink('');
    }
  }, [phone, message]);

  const handleCopy = () => {
    if (!generatedLink) return;

    // navigator.clipboard only works on HTTPS. Use fallback for HTTP (production IP).
    const copyToClipboard = (text: string) => {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      } else {
        // Fallback for HTTP environments
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Copy failed', err);
        }
        document.body.removeChild(textArea);
        return Promise.resolve();
      }
    };

    copyToClipboard(generatedLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadQRCode = async () => {
    if (!generatedLink) return;
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(generatedLink)}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grafty-whatsapp-qr-${phone || 'link'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Input Section */}
        <div className="g-card space-y-8 p-8 lg:p-10 border-none shadow-2xl shadow-green-900/5">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                <Phone size={14} /> WhatsApp Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 919876543210 (with country code)"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
              />
              <p className="text-[10px] text-slate-400 font-medium px-2">Include country code without + (e.g., 91 for India)</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                <Type size={14} /> Pre-filled Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Hello, I'm interested in your services."
                rows={4}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-50 outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <MessageCircle size={16} />
              </div>
              <span className="text-sm font-black text-emerald-800 uppercase tracking-tight">Real-time Preview</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-inner">
               <p className="text-slate-500 text-xs font-medium leading-relaxed italic">
                 {message || "No pre-filled message... Type above to see preview."}
               </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic text-center">
              Processing your link or QR code constitutes agreement to our <a href="/terms" className="text-emerald-500 hover:underline">Tool Terms</a>. Your number will be stored securely for support.
            </p>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-8 sticky top-32 animate-up">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            <button 
              onClick={() => setActiveTab('link')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'link' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LinkIcon size={14} /> Your Link
            </button>
            <button 
              onClick={() => setActiveTab('qr')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'qr' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <QrCode size={14} /> QR Code
            </button>
          </div>

          <div className="g-card border-none shadow-2xl shadow-green-900/5 p-10 min-h-[400px] flex flex-col justify-center text-center">
            {!generatedLink ? (
              <div className="opacity-20 flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                   <LinkIcon size={40} />
                </div>
                <p className="font-black uppercase tracking-[0.2em] text-[10px]">Enter number to generate</p>
              </div>
            ) : (
              <div className="space-y-10 animate-fade-in">
                {activeTab === 'link' ? (
                  <div className="space-y-8">
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl break-all font-mono text-sm font-bold text-slate-800 shadow-inner">
                      {generatedLink}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={handleCopy}
                        className="flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-200"
                      >
                        {copied ? <><Check size={18} /> Copied</> : <><Copy size={18} /> Copy Link</>}
                      </button>
                      <a 
                        href={generatedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
                      >
                        <ExternalLink size={18} /> Open Chat
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-8">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(generatedLink)}`}
                        alt="WhatsApp QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <button 
                      onClick={downloadQRCode}
                      className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                      <Download size={18} /> Download PNG
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 text-white/5 font-black text-3xl italic uppercase tracking-tighter group-hover:scale-110 transition-transform">UPGRADE</div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Want to scale?</p>
             <h4 className="text-xl font-black mb-4 tracking-tight">Link tracking & <br/>Auto-replies await.</h4>
             <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">Move from basic links to professional automation. Track every click and automate first contact with Grafty.</p>
             <a href="/pricing" className="inline-flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
               Start Free Trial <ArrowRight size={14} className="text-emerald-500" />
             </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRight({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
