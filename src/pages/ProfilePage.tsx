import { useState, type FormEvent } from 'react';
import { User, Mail, Lock, Trash2, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/lib/utils';

export function ProfilePage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(profile?.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await updateProfile({ name: name.trim(), avatar_url: avatarUrl.trim() || null });
    setSavingProfile(false);
    if (error) toast(error, 'error');
    else toast('Profile updated successfully');
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast('New password must be at least 6 characters', 'error');
    if (newPassword !== confirmPassword) return toast('Passwords do not match', 'error');
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) return toast(error.message, 'error');
    toast('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) return toast('Image must be under 2MB', 'error');
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) return toast(`Upload failed: ${upErr.message}`, 'error');
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    const { error } = await updateProfile({ avatar_url: data.publicUrl });
    if (error) toast(error, 'error');
    else toast('Profile picture updated');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    await supabase.from('profiles').delete().eq('id', user.id);
    await signOut();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-app">Profile</h1>
        <p className="mt-1 text-sm text-muted">Manage your account information</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile Picture</CardTitle></CardHeader>
        <CardBody className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <Avatar name={profile?.name || 'User'} url={profile?.avatar_url} size="lg" />
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              <Button variant="outline" size="sm" type="button">
                <Camera className="h-4 w-4" />
                Upload New Photo
              </Button>
            </label>
            <p className="text-xs text-muted">JPG or PNG, max 2MB</p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
        <CardBody>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <Input label="Full Name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-muted" />
              <Input label="Email" value={user?.email ?? ''} disabled className="pl-10" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <User className="h-3.5 w-3.5" />
              Member since {formatDate(profile?.created_at ?? user?.created_at ?? null)}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardBody>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-muted" />
              <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10" placeholder="••••••••" />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-muted" />
              <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" placeholder="••••••••" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingPassword}>
                {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="border-error-500/30">
        <CardHeader><CardTitle className="text-error-500">Danger Zone</CardTitle></CardHeader>
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-app">Delete Account</p>
            <p className="text-xs text-muted">Permanently delete your account and all associated data.</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete your account?"
        message="This will permanently delete your profile and all your tasks, categories, and notifications. This action cannot be undone."
        confirmLabel="Delete Account"
        danger
      />
    </div>
  );
}
