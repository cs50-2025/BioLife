import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-emerald-900/10 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-emerald-100 dark:border-emerald-950/40 p-6 md:p-10 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Shield className="w-6 h-6" />
            <span className="font-bold text-lg">BioLife</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Last Updated: July 22, 2026
          </p>
        </div>

        {/* Introduction */}
        <section className="space-y-3">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Welcome to <strong>BioLife</strong>. Your privacy is critically important to us. This Privacy Policy explains how BioLife ("we", "us", or "our") collects, uses, and safeguards your information when you use our mobile application and web platform.
          </p>
        </section>

        {/* Key Points Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
            <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
            <h3 className="font-bold text-slate-900 dark:text-white">Data Security</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Your data and plant photos are securely handled and never sold to third parties.</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
            <Eye className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
            <h3 className="font-bold text-slate-900 dark:text-white">Camera Access</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Camera permission is used strictly for plant scanning and AI health diagnosis.</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
            <Bell className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
            <h3 className="font-bold text-slate-900 dark:text-white">Care Notifications</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Reminders stay local to help you stay on top of watering and fertilizing schedules.</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6 text-slate-600 dark:text-slate-300">
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              1. Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li><strong>Account Information:</strong> If you sign up, we collect your name, email address, and account preferences to maintain your profile.</li>
              <li><strong>Plant Photos &amp; Camera Data:</strong> When you use the AI Plant Scanner or Plant Doctor features, uploaded images are processed to identify species and diagnose health conditions.</li>
              <li><strong>App Usage &amp; Preferences:</strong> Saved plant collections, custom care schedules, watering logs, and app configuration settings.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. How We Use Your Information</h2>
            <p className="text-sm leading-relaxed">
              We use the collected information solely to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Provide plant identification and health diagnosis services.</li>
              <li>Deliver automated watering and care reminders.</li>
              <li>Sync your saved plant collection across your devices.</li>
              <li>Improve app performance, accuracy, and user experience.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Data Sharing &amp; Privacy</h2>
            <p className="text-sm leading-relaxed">
              We respect your privacy. <strong>We do not sell, rent, or trade your personal information or plant photos to third parties.</strong> Data processed for AI recognition is handled confidentially and strictly used for visual identification.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Your Data Rights &amp; Deletion</h2>
            <p className="text-sm leading-relaxed">
              You have the right to access, export, or delete your account and saved plant data at any time through the app settings or by contacting our support team.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Contact Us</h2>
            <p className="text-sm leading-relaxed">
              If you have any questions or concerns regarding this Privacy Policy or your data, please contact us at:
            </p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              support@biolifeapp.com
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} BioLife Plant Care Assistant. All rights reserved.
        </div>

      </div>
    </div>
  );
}
