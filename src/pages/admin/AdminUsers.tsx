import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Ban, KeyRound, Trash2, ShieldCheck, ShieldOff } from "lucide-react";

const SUPER_ADMIN_EMAIL = "ofsetadruka@gmail.com";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  banned: boolean;
  is_super: boolean;
}

const AdminUsers = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [changingPw, setChangingPw] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  const callFn = async (body: any) => {
    const { data, error } = await supabase.functions.invoke("admin-users", { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const loadUsers = async () => {
    try {
      const data = await callFn({ action: "list" });
      setUsers(data.users || []);
    } catch (e: any) {
      toast({ title: "Kļūda", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) loadUsers();
    else setLoading(false);
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Pieeja tikai Super Admin lietotājam.</p>
        </div>
      </AdminLayout>
    );
  }

  const handleCreate = async () => {
    if (!newEmail.trim() || !newPassword.trim()) return;
    setCreating(true);
    try {
      await callFn({ action: "create", email: newEmail.trim(), password: newPassword });
      toast({ title: "Lietotājs izveidots", description: newEmail });
      setNewEmail("");
      setNewPassword("");
      await loadUsers();
    } catch (e: any) {
      toast({ title: "Kļūda", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleBan = async (userId: string, currentlyBanned: boolean) => {
    try {
      await callFn({ action: "toggle_ban", user_id: userId, ban: !currentlyBanned });
      toast({ title: currentlyBanned ? "Lietotājs atbloķēts" : "Lietotājs bloķēts" });
      await loadUsers();
    } catch (e: any) {
      toast({ title: "Kļūda", description: e.message, variant: "destructive" });
    }
  };

  const handleChangePassword = async (userId: string) => {
    if (!newPw.trim()) return;
    try {
      await callFn({ action: "update_password", user_id: userId, password: newPw });
      toast({ title: "Parole nomainīta" });
      setChangingPw(null);
      setNewPw("");
    } catch (e: any) {
      toast({ title: "Kļūda", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Vai tiešām dzēst lietotāju ${email}?`)) return;
    try {
      await callFn({ action: "delete", user_id: userId });
      toast({ title: "Lietotājs dzēsts" });
      await loadUsers();
    } catch (e: any) {
      toast({ title: "Kļūda", description: e.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl font-black uppercase tracking-wide">Lietotāju pārvaldība</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pievienot, bloķēt vai dzēst darbiniekus</p>
        </div>

        {/* Create new user */}
        <div className="rounded-sm border border-border bg-card p-6 space-y-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Pievienot jaunu darbinieku
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">E-pasts</Label>
              <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="darbinieks@ervitex.lv" type="email" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Parole</Label>
              <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Vismaz 8 simboli" type="password" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreate} disabled={creating} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {creating ? "Veido..." : "Pievienot"}
              </Button>
            </div>
          </div>
        </div>

        {/* Users list */}
        <div className="rounded-sm border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Aktīvie lietotāji</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u) => (
                <div key={u.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{u.email}</span>
                      {u.is_super && (
                        <span className="rounded-sm bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
                          Super Admin
                        </span>
                      )}
                      {u.banned && (
                        <span className="rounded-sm bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-destructive">
                          Bloķēts
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pēdējā ieeja: {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("lv") : "Nav"}
                    </p>
                  </div>

                  {!u.is_super && (
                    <div className="flex items-center gap-2">
                      {changingPw === u.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={newPw}
                            onChange={(e) => setNewPw(e.target.value)}
                            placeholder="Jaunā parole"
                            type="password"
                            className="h-8 w-40 text-xs"
                          />
                          <Button size="sm" variant="outline" onClick={() => handleChangePassword(u.id)} className="h-8 text-xs">
                            Saglabāt
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setChangingPw(null); setNewPw(""); }} className="h-8 text-xs">
                            Atcelt
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setChangingPw(u.id)} className="h-8 text-xs" title="Mainīt paroli">
                            <KeyRound className="mr-1 h-3 w-3" /> Parole
                          </Button>
                          <Button
                            size="sm"
                            variant={u.banned ? "outline" : "destructive"}
                            onClick={() => handleToggleBan(u.id, u.banned)}
                            className="h-8 text-xs"
                            title={u.banned ? "Atbloķēt" : "Bloķēt"}
                          >
                            {u.banned ? <ShieldCheck className="mr-1 h-3 w-3" /> : <ShieldOff className="mr-1 h-3 w-3" />}
                            {u.banned ? "Atbloķēt" : "Bloķēt"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(u.id, u.email!)} className="h-8 text-xs text-destructive hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {users.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">Nav atrasti lietotāji</div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
