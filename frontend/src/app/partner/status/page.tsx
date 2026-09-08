"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, CheckCircle, Clock, AlertTriangle, LogOut, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

export default function PartnerStatusPage() {
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pollInterval = useRef<any>(null);

  useEffect(() => {
    fetchStatus();

    // Auto-poll status every 4 seconds so admin approval/rejection reflects in real time
    pollInterval.current = setInterval(() => {
      fetchStatus(false);
    }, 4000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  const fetchStatus = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await api.get('/partner/profile');
      if (data?.vendor) {
        setVendor(data.vendor);
        if (data.vendor.kycStatus === 'APPROVED' || data.vendor.isApproved) {
          if (pollInterval.current) clearInterval(pollInterval.current);
          router.replace('/partner/dashboard');
          return;
        }
      } else {
        router.replace('/partner/login');
      }
    } catch (err) {
      console.error("Status fetch error:", err);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchStatus(false);
  };

  const handleLogout = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    localStorage.removeItem('partner_token');
    localStorage.removeItem('partner_role');
    router.replace('/partner/login');
  };

  if (loading && !vendor) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const kycStatus = vendor?.kycStatus || 'PENDING_ADMIN_APPROVAL';

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-gold/20 rounded-3xl shadow-xl p-8 text-center space-y-6">
        
        <div className="flex justify-center">
          {kycStatus === 'REJECTED' ? (
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-10 h-10" />
            </div>
          ) : kycStatus === 'APPROVED' ? (
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 animate-pulse">
              <Clock className="w-10 h-10" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-primary">
            {kycStatus === 'REJECTED' 
              ? 'Application Rejected' 
              : kycStatus === 'APPROVED' 
              ? 'Application Approved! 🎉' 
              : 'Application Under Admin Review'}
          </h1>
          <p className="text-xs text-foreground/50">
            {kycStatus === 'REJECTED' 
              ? 'Please review admin feedback below to correct your application.' 
              : kycStatus === 'APPROVED'
              ? 'Redirecting to your dashboard...'
              : 'The administrator is currently reviewing your documents.'}
          </p>
        </div>

        {kycStatus === 'REJECTED' && (
          <div className="bg-red-50/50 border border-red-100/80 rounded-2xl p-4 text-left space-y-2">
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Admin Feedback
            </span>
            <p className="text-xs text-red-800 font-semibold leading-relaxed">
              {vendor?.kycDetails?.reviewNote || vendor?.rejectionReason || 'Your application requires correction. Please review details and resubmit.'}
            </p>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {kycStatus === 'REJECTED' ? (
            <button 
              onClick={() => router.push('/partner/register')}
              className="w-full py-3 bg-[#1D3B31] text-white rounded-full font-bold hover:bg-[#1D3B31]/95 transition-all text-xs flex items-center justify-center gap-1.5"
            >
              Correct Info & Resubmit <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="bg-cream/40 rounded-2xl p-4 border border-gold/10 text-xs text-foreground/60 leading-relaxed text-left">
              <span className="font-bold text-primary block mb-1">Application Details:</span>
              <ul className="space-y-1">
                <li><strong className="text-foreground/80">Partner:</strong> {vendor?.name}</li>
                <li><strong className="text-foreground/80">Business:</strong> {vendor?.kycDetails?.businessName || vendor?.name}</li>
                <li><strong className="text-foreground/80">Category:</strong> {vendor?.category}</li>
                <li><strong className="text-foreground/80">Status:</strong> <span className="text-amber-700 font-semibold">Pending Admin Approval</span></li>
              </ul>
            </div>
          )}

          {kycStatus !== 'REJECTED' && (
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="w-full py-3 bg-gold/10 text-[#0F3D30] hover:bg-gold/20 rounded-full font-bold transition-all text-xs flex items-center justify-center gap-1.5 border border-gold/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Checking Status...' : 'Check Approval Status'}
            </button>
          )}

          <button 
            onClick={handleLogout}
            className="w-full py-2.5 border border-red-200 text-red-700 hover:bg-red-50/30 rounded-full font-bold transition-all text-xs flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>

      </div>
    </div>
  );
}
