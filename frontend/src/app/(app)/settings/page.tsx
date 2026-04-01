'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Topbar from '@/components/app/Topbar';
import { ArrowLeft, Save, Bell, Lock, User, Database, Mail, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  updateProfile,
  changePassword,
  getSettings,
  updateSettings,
  checkBackendHealth,
} from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    organization: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
  });
  const [passwordMsg, setPasswordMsg] = useState('');

  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    alertNotifications: true,
    weeklyReports: true,
    dataRetention: '90',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.full_name || '',
        email: user.email || '',
        organization: user.organization || '',
      });
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const alive = await checkBackendHealth();
        if (alive) {
          const s = await getSettings();
          setPrefs({
            emailNotifications: s.email_alerts ?? true,
            alertNotifications: s.alert_notifications ?? true,
            weeklyReports: s.weekly_reports ?? true,
            dataRetention: String(s.data_retention_days ?? 90),
          });
        }
      } catch {
        /* empty */
      }
      setIsLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await updateProfile({
        full_name: profile.name,
        email: profile.email,
        organization: profile.organization,
      });
      await updateSettings({
        email_alerts: prefs.emailNotifications,
        alert_notifications: prefs.alertNotifications,
        weekly_reports: prefs.weeklyReports,
        data_retention_days: parseInt(prefs.dataRetention),
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordMsg('');
    if (!passwordForm.old_password || !passwordForm.new_password) return;
    try {
      await changePassword(passwordForm.old_password, passwordForm.new_password);
      setPasswordMsg('Password changed successfully');
      setPasswordForm({ old_password: '', new_password: '' });
    } catch (err) {
      setPasswordMsg(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  const handlePrefChange = (field: string, value: unknown) => {
    setPrefs(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-background p-4">
        <Topbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-green-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-4">
      <Topbar />
      <div className="min-h-full bg-[#F7F7F7] rounded-2xl p-4 mt-4">
        <div className="px-3 py-3 z-10 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-medium tracking-tight leading-tight sm:text-4xl">Settings</h1>
              <p className="text-sm sm:text-base text-foreground/60 mt-1 max-w-md">
                Manage your account, notifications, and preferences
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
              <Button variant="outline" className="w-full sm:w-auto justify-center rounded-full" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button
                variant="primary"
                className="w-full sm:w-auto justify-center rounded-full bg-gradient-to-b from-[#004737] to-green-700 hover:from-green-500 hover:to-green-700 text-white"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 mb-2 bg-red-50 text-red-700 rounded-lg p-4 text-sm">{error}</div>
        )}

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-[#004737]" />
                  <h2 className="text-2xl tracking-tight font-semibold text-gray-900">Profile Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-1 block">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-[#F7F7F7] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-1 block">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-[#F7F7F7] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-1 block">Organization</label>
                    <input
                      type="text"
                      value={profile.organization}
                      onChange={(e) => setProfile(p => ({ ...p, organization: e.target.value }))}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-[#F7F7F7] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-[#004737]" />
                  <h2 className="text-2xl tracking-tight font-semibold text-gray-900">Notifications</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email updates about your batches' },
                    { key: 'alertNotifications', label: 'Alert Notifications', desc: 'Get notified about high-risk batches' },
                    { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly compliance summary' },
                  ].map(item => (
                    <div key={item.key} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-foreground/60">{item.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prefs[item.key as keyof typeof prefs] as boolean}
                          onChange={(e) => handlePrefChange(item.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-[#004737]" />
                  <h2 className="text-2xl tracking-tight font-semibold text-gray-900">Data Management</h2>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1 block">Data Retention Period</label>
                  <select
                    value={prefs.dataRetention}
                    onChange={(e) => handlePrefChange('dataRetention', e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-[#F7F7F7] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-[#004737]" />
                  <h2 className="text-xl tracking-tight font-semibold text-gray-900">Change Password</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-1 block">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.old_password}
                      onChange={(e) => setPasswordForm(p => ({ ...p, old_password: e.target.value }))}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-[#F7F7F7] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-1 block">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm(p => ({ ...p, new_password: e.target.value }))}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-[#F7F7F7] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  {passwordMsg && (
                    <p className={`text-sm ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordMsg}
                    </p>
                  )}
                  <Button variant="outline" className="w-full rounded-full" onClick={handlePasswordChange}>
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full rounded-full text-left justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full rounded-full text-left justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    Export All Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
