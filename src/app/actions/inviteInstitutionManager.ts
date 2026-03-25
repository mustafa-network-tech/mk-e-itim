"use server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type InviteInstitutionManagerResult =
  | { ok: true; userId: string }
  | { ok: false; message: string };

/**
 * Yalnızca admin: Auth’ta kurum yöneticisi kullanıcısı oluşturur (profiles tetikleyicisi ile eşlenir).
 */
export async function inviteInstitutionManager(input: {
  name: string;
  email: string;
  password: string;
}): Promise<InviteInstitutionManagerResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return { ok: false, message: "Oturum bulunamadı." };
  }

  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profErr || prof?.role !== "admin") {
    return { ok: false, message: "Bu işlem yalnızca yönetici hesabıyla yapılabilir." };
  }

  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return {
      ok: false,
      message:
        "Sunucu yapılandırması eksik: .env.local içinde SUPABASE_SERVICE_ROLE_KEY tanımlayın.",
    };
  }

  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (error) {
    return { ok: false, message: error.message };
  }

  await admin.from("profiles").update({ full_name: name }).eq("id", data.user.id);

  return { ok: true, userId: data.user.id };
}
