import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigured) {
  console.warn(
    "[NOVA BNISIT] VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requis. " +
    "Ajoutez-les dans votre fichier .env — voir .env.example"
  );
}

// Only create the client if env vars are present — empty string crashes SSR
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase && supabaseConfigured) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  if (!_supabase) {
    throw new Error(
      "[NOVA BNISIT] Supabase non configuré. " +
      "Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env"
    );
  }
  return _supabase;
}

// Proxy that lazily initializes — safe to import even without env vars
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as Record<string | symbol, unknown>)[prop];
  },
});

// ─── Types ──────────────────────────────────────────────────

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  company: string;
  message: string;
  read?: boolean;
  created_at?: string;
}

export interface Service {
  id?: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at?: string;
}

export interface Testimonial {
  id?: string;
  name: string;
  role: string;
  quote: string;
  sort_order: number;
  created_at?: string;
}

export interface FAQ {
  id?: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at?: string;
}

// ─── Contacts ───────────────────────────────────────────────

export async function submitContact(data: Omit<ContactMessage, "id" | "created_at" | "read">) {
  const { error } = await supabase.from("contacts").insert([data]);
  if (error) throw error;
}

export async function getContacts(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function markContactRead(id: string, read: boolean) {
  const { error } = await supabase.from("contacts").update({ read }).eq("id", id);
  if (error) throw error;
}

export async function deleteContact(id: string) {
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw error;
}

// ─── Services ───────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function upsertService(s: Service) {
  const { error } = await supabase.from("services").upsert(s, { onConflict: "id" });
  if (error) throw error;
}

export async function deleteService(id: string) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}

// ─── Testimonials ───────────────────────────────────────────

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function upsertTestimonial(t: Testimonial) {
  const { error } = await supabase.from("testimonials").upsert(t, { onConflict: "id" });
  if (error) throw error;
}

export async function deleteTestimonial(id: string) {
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw error;
}

// ─── FAQs ───────────────────────────────────────────────────

export async function getFaqs(): Promise<FAQ[]> {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function upsertFaq(f: FAQ) {
  const { error } = await supabase.from("faqs").upsert(f, { onConflict: "id" });
  if (error) throw error;
}

export async function deleteFaq(id: string) {
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) throw error;
}

// ─── Projects ───────────────────────────────────────────────

export interface Project {
  id?: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  link_url: string;
  sort_order: number;
  created_at?: string;
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function upsertProject(p: Project) {
  const { error } = await supabase.from("projects").upsert(p, { onConflict: "id" });
  if (error) throw error;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// ─── Auth ───────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
