import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/currency';
import { formatDate } from '../utils/formatters';
import { User, UserRole } from '../types';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Lock, 
  Key, 
  RotateCcw, 
  X, 
  Check, 
  Building2, 
  Mail, 
  Phone, 
  Crown,
  Eye,
  RefreshCw
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { 
    currentUser, 
    setCurrentView, 
    adminMetrics, 
    refreshAdminMetrics, 
    adminCreateUser, 
    adminDeleteUser, 
    adminToggleUserStatus, 
    adminVerifyUser, 
    adminResetUserPassword,
    showToast 
  } = useApp();

  // Dialogs
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [resetPassUser, setResetPassUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'verified' | 'unverified' | 'paid' | 'unpaid' | 'half_paid' | 'overdue'>('all');

  // Form states for Add User
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('User@JS2026!');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [autoVerify, setAutoVerify] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for Reset Password
  const [newResetPassword, setNewResetPassword] = useState('NewPass@2026!');

  // Strict Super Admin Access Gate
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Super Admin Access Required</h2>
            <p className="text-xs text-slate-500 mt-1">
              This administrative telemetry portal is reserved for authorized system administrators.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('overview')}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
          >
            Return to User Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Filtered User Roster
  const filteredUsers = useMemo(() => {
    if (!adminMetrics?.userStats) return [];
    return adminMetrics.userStats.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.companyName && u.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = u.status === 'active';
      if (statusFilter === 'suspended') matchesStatus = u.status === 'suspended';
      if (statusFilter === 'verified') matchesStatus = u.isVerified === true;
      if (statusFilter === 'unverified') matchesStatus = u.isVerified !== true;
      if (statusFilter === 'paid') matchesStatus = ((u as any).paidCount || 0) > 0;
      if (statusFilter === 'unpaid') matchesStatus = ((u as any).unpaidCount || 0) > 0;
      if (statusFilter === 'half_paid') matchesStatus = ((u as any).halfPaidCount || 0) > 0;
      if (statusFilter === 'overdue') matchesStatus = ((u as any).overdueCount || 0) > 0;

      return matchesSearch && matchesStatus;
    });
  }, [adminMetrics, searchTerm, statusFilter]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      adminCreateUser({
        name: newName,
        email: newEmail,
        password: newPassword,
        phone: newPhone,
        companyName: newCompany,
        role: newRole,
        autoVerify,
      });
      setIsAddUserOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('User@JS2026!');
      setNewCompany('');
      setNewPhone('');
      setNewRole('user');
    } catch (err: any) {
      showToast(err.message || 'Could not create user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassUser) return;
    try {
      adminResetUserPassword(resetPassUser.id, newResetPassword);
      setResetPassUser(null);
      setNewResetPassword('NewPass@2026!');
    } catch (err: any) {
      showToast(err.message || 'Password reset failed', 'error');
    }
  };

  const handleDeleteUserConfirm = () => {
    if (!deleteConfirmUser) return;
    adminDeleteUser(deleteConfirmUser.id);
    setDeleteConfirmUser(null);
  };

  const metrics = adminMetrics || {
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    totalInvoices: 0,
    totalBilled: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    signedUpToday: 0,
    signedUpThisWeek: 0,
    signedUpThisMonth: 0,
    userStats: [],
  };

  const verificationRate = metrics.totalUsers > 0 
    ? Math.round((metrics.verifiedUsers / metrics.totalUsers) * 100) 
    : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* 1. TOP HEADER & TELEMETRY CONTROLS */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              Super Admin Authority
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Session: {currentUser.email}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            JS Invoice Operations & User Onboarding
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time user onboarding telemetry, accounts directory, and administrative controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              refreshAdminMetrics();
              showToast('Refreshed live platform metrics', 'info');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New User</span>
          </button>
        </div>
      </div>

      {/* 2. PLATFORM KPI TELEMETRY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-subtle space-y-3">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Onboarded Users</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {metrics.totalUsers}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="text-emerald-600 font-semibold">{metrics.activeUsers} Active</span>
            <span className="text-slate-400 font-medium">{metrics.suspendedUsers} Suspended</span>
          </div>
        </div>

        {/* Verification & Onboarding Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-subtle space-y-3">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Verification Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
              {verificationRate}%
            </p>
            <span className="text-xs text-slate-400 font-medium">({metrics.verifiedUsers} of {metrics.totalUsers})</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${verificationRate}%` }} 
            />
          </div>
        </div>

        {/* Platform Invoices Created */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-subtle space-y-3">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform Invoices</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {metrics.totalInvoices}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="text-amber-700 font-semibold">{metrics.totalOutstanding > 0 ? 'Active Billing' : 'All Settled'}</span>
            <span className="text-slate-400">All registered users</span>
          </div>
        </div>

        {/* Gross Volume Billed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-subtle space-y-3">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Billed Volume</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {formatMoney(metrics.totalBilled, 'INR')}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="text-emerald-600 font-semibold font-mono">Paid: {formatMoney(metrics.totalPaid, 'INR')}</span>
          </div>
        </div>
      </div>

      {/* 3. ONBOARDING VELOCITY WIDGET */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">User Onboarding Growth Telemetry</h4>
            <p className="text-xs text-slate-500">Track registration velocity and new customer acquisition</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Today</span>
            <span className="text-base font-bold text-slate-900 font-mono">+{metrics.signedUpToday}</span>
          </div>
          <div className="flex-1 sm:flex-initial p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Last 7 Days</span>
            <span className="text-base font-bold text-indigo-600 font-mono">+{metrics.signedUpThisWeek}</span>
          </div>
          <div className="flex-1 sm:flex-initial p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Last 30 Days</span>
            <span className="text-base font-bold text-emerald-600 font-mono">+{metrics.signedUpThisMonth}</span>
          </div>
        </div>
      </div>

      {/* 4. USER MANAGEMENT DIRECTORY & AUTHORITY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden space-y-4 p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">User Accounts Directory</h3>
            <p className="text-xs text-slate-500">Manage client access, role elevation, password overrides, and account lifecycle</p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user, email, company..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">All Users ({metrics.totalUsers})</option>
              <option value="active">Active Only ({metrics.activeUsers})</option>
              <option value="suspended">Suspended Only ({metrics.suspendedUsers})</option>
              <option value="verified">Verified ({metrics.verifiedUsers})</option>
              <option value="unverified">Pending Activation ({metrics.unverifiedUsers})</option>
              <option value="paid">Users with Paid Invoices</option>
              <option value="unpaid">Users with Unpaid Invoices</option>
              <option value="half_paid">Users with Half Payment Done</option>
              <option value="overdue">Users with Overdue Invoices</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">User / Account</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Registered On</th>
                <th className="py-3 px-3 text-center">Invoices</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Verification</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => {
                  const isMasterAdmin = user.id === 'user_admin' || user.email === 'admin@jsinvoice.com';
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isMasterAdmin 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{user.name}</span>
                              {isMasterAdmin && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                  MASTER
                                </span>
                              )}
                            </div>
                            {user.companyName && (
                              <span className="text-[11px] text-slate-400 block">{user.companyName}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-700 block">{user.email}</span>
                        {user.phone ? (
                          <span className="text-[11px] text-slate-400 font-mono">{user.phone}</span>
                        ) : (
                          <span className="text-[11px] text-slate-300">—</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role === 'admin' && <Crown className="w-3 h-3 text-purple-600" />}
                          {user.role}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                        {formatDate(user.createdAt || new Date().toISOString())}
                      </td>

                      {/* Total Invoices & Payment Status Breakdown */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono font-bold text-slate-800 text-xs block mb-1">
                          {user.invoicesCount || 0}
                        </span>
                        {(user.invoicesCount || 0) > 0 && (
                          <div className="flex flex-wrap items-center justify-center gap-1 text-[10px] font-mono">
                            {user.paidCount > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200" title="Paid Invoices">
                                {user.paidCount} Paid
                              </span>
                            )}
                            {user.unpaidCount > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200" title="Unpaid Invoices">
                                {user.unpaidCount} Unpaid
                              </span>
                            )}
                            {user.halfPaidCount > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200" title="Half Paid Invoices">
                                {user.halfPaidCount} Half
                              </span>
                            )}
                            {user.overdueCount > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200" title="Overdue Invoices">
                                {user.overdueCount} Overdue
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {user.status}
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-3 text-center">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-amber-500" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Action Authority Controls */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Verification for pending users */}
                          {!user.isVerified && (
                            <button
                              onClick={() => adminVerifyUser(user.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors"
                              title="Instantly Verify Account"
                            >
                              Verify
                            </button>
                          )}

                          {/* View Invoices */}
                          <button
                            onClick={() => setCurrentView('invoices')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View Tenant Invoices"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => setResetPassUser(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Reset Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend / Activate Toggle */}
                          {!isMasterAdmin && (
                            <button
                              onClick={() => adminToggleUserStatus(user.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.status === 'active' 
                                  ? 'text-amber-600 hover:bg-amber-50' 
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                            >
                              {user.status === 'active' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Delete Account */}
                          {!isMasterAdmin && (
                            <button
                              onClick={() => setDeleteConfirmUser(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No users matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW USER (MANUAL REGISTRATION) */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Add New User Account</h3>
                  <p className="text-[11px] text-slate-400">Direct administrative user provisioning</p>
                </div>
              </div>
              <button onClick={() => setIsAddUserOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Must contain 1 capital letter and 1 number (min 6 characters)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company (Optional)</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block text-xs">Auto-Activate Account</span>
                  <span className="text-[11px] text-slate-400">User can log in immediately without email link</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoVerify}
                  onChange={e => setAutoVerify(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESET PASSWORD */}
      {resetPassUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Reset User Password</h3>
              </div>
              <button onClick={() => setResetPassUser(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 pt-4 text-xs">
              <p className="text-slate-600">
                Set a new password for <strong className="text-slate-900">{resetPassUser.name}</strong> ({resetPassUser.email}):
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="text"
                  required
                  value={newResetPassword}
                  onChange={e => setNewResetPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Must include 1 capital letter and 1 number (min 6 characters).
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPassUser(null)}
                  className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">Permanently Remove User?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-900">{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email})?
                This will purge their account, invoices, clients, and settings. This cannot be undone.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUserConfirm}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
