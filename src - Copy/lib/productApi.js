import { supabase } from "../supabaseClient";
import { uid } from "./helpers";

/* ---------- feature items (Idea Inbox + Roadmap) ---------- */

export function emptyFeature() {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title: "",
    description: "",
    priority: "Medium",
    status: "Inbox",
    notes: "",
    release_id: null,
    created_at: now,
    updated_at: now,
  };
}

export async function fetchFeatures() {
  const { data, error } = await supabase.from("feature_items").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertFeature(item, userId) {
  const { error } = await supabase.from("feature_items").insert({ ...item, created_by: userId || null });
  if (error) throw error;
}

export async function updateFeature(id, patch) {
  const { error } = await supabase
    .from("feature_items")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteFeature(id) {
  const { error } = await supabase.from("feature_items").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- releases (Changelog) ---------- */

export async function fetchReleases() {
  const { data, error } = await supabase.from("releases").select("*").order("release_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertRelease(release) {
  const { error } = await supabase.from("releases").insert(release);
  if (error) throw error;
}

export async function updateRelease(id, patch) {
  const { error } = await supabase.from("releases").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteRelease(id) {
  const { error } = await supabase.from("releases").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- hardware / BOM ---------- */

export function emptyHardware() {
  const now = new Date().toISOString();
  return {
    id: uid(),
    name: "",
    model: "",
    stock_count: 0,
    vendor_note: "",
    lead_time: "",
    status: "In Stock",
    price: 0,
    linked_feature_id: null,
    client_id: null,
    created_at: now,
    updated_at: now,
  };
}

export async function fetchHardware() {
  const { data, error } = await supabase.from("hardware_items").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertHardware(item, userId) {
  const { error } = await supabase.from("hardware_items").insert({ ...item, created_by: userId || null });
  if (error) throw error;
}

export async function updateHardware(id, patch) {
  const { error } = await supabase
    .from("hardware_items")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteHardware(id) {
  const { error } = await supabase.from("hardware_items").delete().eq("id", id);
  if (error) throw error;
}
