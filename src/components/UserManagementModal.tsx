import React, { useState, useEffect } from 'react';
import { fetchAllProfiles, updateUserRole, UserProfile } from '../lib/db';
import { usePadel } from '../context/PadelContext';
import { X, Shield, User, Crown, Landmark } from 'lucide-react';
import { PROVINCES_LIST } from '../mockData';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const roleLabels: Record<string, string> = {
  player: 'بازیکن',
  club_admin: 'مدیر باشگاه',
  super_admin: 'مدیر ارشد',
  province_admin: 'مدیر استان',
};

const roleIcons: Record<string, React.ReactNode> = {
  player: <User className="w-4 h-4" />,
  club_admin: <Shield className="w-4 h-4" />,
  super_admin: <Crown className="w-4 h-4" />,
  province_admin: <Landmark className="w-4 h-4" />,
};

// 'همه استان‌ها' is a filter label, not a real province — never assignable.
const PROVINCES = PROVINCES_LIST.filter((p) => p !== 'همه استان‌ها');

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose }) => {
  const { clubs } = usePadel();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [clubSelect, setClubSelect] = useState<Record<string, string>>({});
  const [provinceSelect, setProvinceSelect] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError('');
    fetchAllProfiles()
      .then(setUsers)
      .catch((e) => {
        console.error(e);
        setError('خطا در دریافت لیست کاربران.');
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleRoleChange = async (userId: string, newRole: 'player' | 'club_admin' | 'super_admin' | 'province_admin') => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    let managedClubId: string | null = null;
    let managedProvince: string | null = null;
    if (newRole === 'club_admin') {
      // Bundled 'club-…' clubs are local-only (no server row) and
      // managed_club_id is a uuid column — a bundled id would fail the role
      // update with a 22P02. Filter them out of EVERY source: the dropdown
      // pick, the user's existing value, and the default fallback.
      const serverClubId = (id?: string | null): string | null =>
        id && !id.startsWith('club-') ? id : null;
      // No silent default: assigning club_admin without an explicit club
      // pick (and no existing managed club) used to bind the user to an
      // arbitrary first server club — the same clubs[0] pattern deliberately
      // removed from tournament creation. Stop and ask instead.
      managedClubId =
        serverClubId(clubSelect[userId]) ||
        serverClubId(target.managedClubId) ||
        null;
      if (!managedClubId) {
        alert('اول یک باشگاه انتخاب کنید.');
        return;
      }
      const clubName = clubs.find((c) => c.id === managedClubId)?.name || '';
      if (!window.confirm(`«${target.name || target.email}» مدیر باشگاه «${clubName}» شود؟`)) return;
    } else if (newRole === 'province_admin') {
      managedProvince = provinceSelect[userId] || target.adminProvince || target.province || 'تهران';
      if (!window.confirm(`«${target.name || target.email}» مدیر استان «${managedProvince}» شود؟`)) return;
    } else {
      if (!window.confirm(`نقش «${target.name || target.email}» به «${roleLabels[newRole]}» تغییر کند؟`)) return;
    }
    setUpdating(userId);
    try {
      await updateUserRole(userId, newRole, managedClubId, managedProvince);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: newRole, managedClubId, adminProvince: newRole === 'province_admin' ? managedProvince : null }
            : u
        )
      );
    } catch (e: any) {
      console.error(e);
      const msg = String(e?.message || e);
      if (/admin_province/i.test(msg)) {
        alert('ستون admin_province در دیتابیس وجود ندارد؛ ابتدا مایگریشن 0011 را در Supabase اجرا کنید.');
      } else {
        alert('خطا در تغییر نقش. دوباره تلاش کنید.');
      }
    } finally {
      setUpdating(null);
    }
  };

  // Change the province of an existing province_admin directly from its
  // per-row province select (no role re-pick needed).
  const handleProvinceChange = async (userId: string, province: string) => {
    setProvinceSelect((p) => ({ ...p, [userId]: province }));
    if (!province) return;
    setUpdating(userId);
    try {
      await updateUserRole(userId, 'province_admin', null, province);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, adminProvince: province } : u)));
    } catch (e: any) {
      console.error(e);
      const msg = String(e?.message || e);
      if (/admin_province/i.test(msg)) {
        alert('ستون admin_province در دیتابیس وجود ندارد؛ ابتدا مایگریشن 0011 را در Supabase اجرا کنید.');
      } else {
        alert('خطا در تغییر استان. دوباره تلاش کنید.');
      }
    } finally {
      setUpdating(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto menu-fade">
      <div className="glass-strong rounded-3xl border border-white/10 p-6 w-full max-w-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-100">مدیریت کاربران</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400 text-center py-8">در حال بارگذاری...</p>
        ) : error ? (
          <p className="text-red-400 text-center py-8">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-slate-400 text-center py-8">کاربری یافت نشد.</p>
        ) : (
          <div className="space-y-2">
            {users.map((u, idx) => (
              <div
                key={u.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 menu-pop-item menu-pop-${(idx % 8) + 1}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-200 truncate">{u.name || 'بدون نام'}</p>
                  <p className="text-xs text-slate-500 truncate" dir="ltr">{u.email}</p>
                  {(u.province || u.city) && (
                    <p className="text-xs text-slate-600">{[u.province, u.city].filter(Boolean).join('، ')}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    {roleIcons[u.role]}
                    {roleLabels[u.role] || u.role}
                  </span>
                  {u.role === 'club_admin' && (
                    <span className="text-xs text-cyan-400">
                      {clubs.find((c) => c.id === u.managedClubId)?.name || 'بدون باشگاه'}
                    </span>
                  )}
                  {u.role === 'province_admin' && (
                    <span className="text-xs text-amber-400">
                      {provinceSelect[u.id] || u.adminProvince || u.province || 'بدون استان'}
                    </span>
                  )}
                  {u.role === 'province_admin' && (
                    <select
                      value={provinceSelect[u.id] ?? u.adminProvince ?? ''}
                      onChange={(e) => handleProvinceChange(u.id, e.target.value)}
                      className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-slate-200"
                      title="استان تحت مدیریت"
                    >
                      <option value="">انتخاب استان...</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p} className="bg-slate-900">{p}</option>
                      ))}
                    </select>
                  )}
                  <select
                    value={clubSelect[u.id] ?? u.managedClubId ?? ''}
                    onChange={(e) => setClubSelect((p) => ({ ...p, [u.id]: e.target.value }))}
                    className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-slate-200"
                    title="باشگاه تحت مدیریت"
                  >
                    <option value="">انتخاب باشگاه...</option>
                    {/* Bundled 'club-…' clubs are local-only: a club_admin's
                        managed_club_id is a server uuid column, so only
                        server-backed clubs are assignable here. */}
                    {clubs.filter((c) => !c.id.startsWith('club-')).map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                  <select
                    value={u.role}
                    disabled={updating === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                    className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-slate-200"
                  >
                    <option value="player">بازیکن</option>
                    <option value="club_admin">مدیر باشگاه</option>
                    <option value="super_admin">مدیر ارشد</option>
                    <option value="province_admin">مدیر استان</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-500 leading-relaxed">
          مدیر باشگاه می‌تواند باشگاه خودش را مدیریت کند (تورنمنت). مدیر ارشد به همه‌چیز دسترسی دارد.
        </p>
      </div>
    </div>
  );
};
