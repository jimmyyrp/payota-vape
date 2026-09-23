/**
 * Vape Store - Centralized Type Definitions
 * Semua tipe data untuk entitas database dan komponen aplikasi.
 */

// ============================================
// DATABASE ENTITIES
// ============================================

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: 'staff' | 'admin' | 'developer';
  created_at: string;
  deleted_at?: string | null;
}

export interface Category {
  id: number;
  name: string;
  is_active?: boolean;
  deleted_at?: string | null;
  created_at?: string;
}

export interface SubCategory {
  id: number;
  name: string;
  category_id: number;
  price?: number;
  deleted_at?: string | null;
  created_at?: string;
  categories?: { name: string };
}

export interface Post {
  id: number;
  title: string;
  deskripsi?: string;
  gambar_thumbnail?: string;
  sub_category_id?: number;
  price: number;
  price_max?: number | null;
  views: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  categories?: PostCategory[];
  sub_categories?: PostSubCategory[];
  images?: PostImage[];
}

export interface PostCategory {
  id: number;
  name: string;
}

export interface PostSubCategory {
  id: number;
  name: string;
}

export interface PostImage {
  id: number;
  product_id: number;
  url_images: string;
  urutan: number;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  deleted_at?: string | null;
  created_at?: string;
}

export interface TestimonialToken {
  id: number;
  token: string;
  usage_limit: number;
  usage_count: number;
  created_at?: string;
}

export interface SiteSetting {
  key: string;
  value: string;
}

// ============================================
// SUPABASE RPC RESULT TYPES
// ============================================

export type PostsCompleteResult = Post;

export type TeamMemberResult = User;

// ============================================
// COMPONENT PROPS TYPES
// ============================================

export interface GalleryItem {
  url: string;
}

export interface PostFormData {
  title: string;
  price: string;
  price_max?: string;
  gallery: GalleryItem[];
  category_ids: number[];
  sub_category_ids: number[];
  is_active: boolean;
}

export interface CategoryFormData {
  name: string;
  category_id: string;
  price: string;
}

export interface UserFormData {
  username: string;
  password: string;
  full_name: string;
  role: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// ============================================
// UI STATE TYPES
// ============================================

export type SortOrder = 'newest' | 'popular';

export type AdminTab = 'categories' | 'sub_categories';

export type CropAspect = number; // e.g. 3/4, 1/1, 4/3 - use numeric literals
