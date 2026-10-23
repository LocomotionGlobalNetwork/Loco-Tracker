"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface ResolveIdentifierResult {
  success: boolean;
  email?: string;
  error?: string;
}

/**
 * Resolves an email or username identifier into a confirmed email address
 * suitable for Supabase Auth signInWithPassword.
 * 
 * If the identifier contains an '@', it is treated as a direct email.
 * Otherwise, it performs a case-insensitive lookup on public.profiles.username.
 */
export async function resolveLoginIdentifier(
  identifier: string
): Promise<ResolveIdentifierResult> {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return { success: false, error: "Email/username atau kata sandi tidak sesuai." };
  }

  // Direct email address returns immediately
  if (trimmed.includes("@")) {
    return { success: true, email: trimmed.toLowerCase() };
  }

  // Enforce username format: 3-30 characters, alphanumeric, dots, underscores, hyphens
  if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(trimmed)) {
    return {
      success: false,
      error: "Email/username atau kata sandi tidak sesuai.",
    };
  }

  try {
    const admin = createAdminClient();
    let profile: { email: string; is_active: boolean } | null = null;

    // 1. Try matching by username column (if exists in database schema)
    try {
      const { data, error } = await admin
        .from("profiles")
        .select("email, is_active")
        .ilike("username", trimmed)
        .maybeSingle();

      if (!error && data) {
        profile = data;
      }
    } catch {
      // Username column might not exist in all environments
    }

    // 2. Fallback: match by email prefix (e.g. 'putri' -> 'putri@locotrack.local')
    if (!profile) {
      const { data, error } = await admin
        .from("profiles")
        .select("email, is_active")
        .ilike("email", `${trimmed.toLowerCase()}@%`)
        .maybeSingle();

      if (!error && data) {
        profile = data;
      }
    }

    if (!profile) {
      return {
        success: false,
        error: "Email/username atau kata sandi tidak sesuai.",
      };
    }

    if (!profile.is_active) {
      return {
        success: false,
        error: "Akun Anda sedang dinonaktifkan. Hubungi administrator.",
      };
    }

    return {
      success: true,
      email: profile.email,
    };
  } catch (err: unknown) {
    console.error("Failed to resolve login identifier:", err);
    return {
      success: false,
      error: "Terjadi kesalahan sistem saat memverifikasi nama pengguna.",
    };
  }
}
