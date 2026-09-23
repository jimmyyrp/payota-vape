"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  ImageIcon, Users, Eye, TrendingUp, ArrowRight,
  Settings, Info, Terminal, BarChart3, PieChart as PieChartIcon,
  Star, Clock, DollarSign, Layers, AlertTriangle, ArrowUpRight, CalendarDays,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, LineChart, Line,
} from 'recharts';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { fetchAllPosts, fetchTestimonials } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { formatCompactNumber, formatFullNumber, formatPrice } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import type { Post, Testimonial, Category } from '@/lib/types';

// ============================================
// TYPES
// ============================================

interface CategoryStat {
  name: string;
  count: number;
}

interface RatingStat {
  name: string;
  count: number;
  rating: number;
}

interface StatusStat {
  name: string;
  value: number;
}

interface RecentWork {
  id: number | string;
  title: string;
  views: number;
  created_at: string;
  is_active: boolean;
  categoryNames: string;
}

// ============================================
// COLOR PALETTES
// ============================================

const CATEGORY_COLORS = [
  '#8B5CF6', '#A78BFA', '#C4B5FD', '#6D28D9',
  '#9333EA', '#7C3AED', '#5B21B6', '#4C1D95',
  '#A855F7', '#6366F1',
];

const RATING_COLORS: Record<number, string> = {
  5: '#10B981',
  4: '#34D399',
  3: '#FBBF24',
  2: '#F97316',
  1: '#EF4444',
};

const STATUS_COLORS = ['#10B981', '#FBBF24', '#EF4444'];

// ============================================
// COMPONENT
// ============================================

type DateRange = 'all' | 'week' | 'month' | 'year';

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'week', label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini' },
  { value: 'year', label: 'Tahun Ini' },
];

function getDateRangeStart(range: DateRange): Date | null {
  if (range === 'all') return null;
  const now = new Date();
  if (range === 'week') {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday start
    const start = new Date(now);
    start.setDate(now.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (range === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (range === 'year') {
    return new Date(now.getFullYear(), 0, 1);
  }
  return null;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('all');

  // Raw data
  const [products, setPosts] = useState<Post[]>([]);
  const [reviews, setTestimonials] = useState<Testimonial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [teamCount, setTeamCount] = useState(0);

  useEffect(() => {
    setRole(localStorage.getItem('fee_user_role') || '');

    async function fetchDashboardData() {
      setLoading(true);
      try {
        // fetchAllPosts menangani pagination beruntun (RPC get_products_complete)
        // untuk menghindari batas 1000 baris Supabase.
        const allPosts = await fetchAllPosts();

        const [teamRes, testRes, catRes] = await Promise.all([
          supabase.rpc('get_team_members'),
          // fetchTestimonials menangani pagination beruntun (batas 1000 baris)
          fetchTestimonials(),
          supabase.from('categories').select('*').is('deleted_at', null).order('name'),
        ]);

        setPosts(allPosts);
        setTeamCount(teamRes.data?.length || 0);
        setTestimonials(testRes);
        setCategories(catRes.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memuat data dasbor.';
        console.error("Dashboard Load Error:", err);
        toast({ variant: 'destructive', title: 'Gagal Memuat Dasbor', description: message });
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // ============================================
  // DATE RANGE FILTERING
  // ============================================

  const rangeStart = useMemo(() => getDateRangeStart(dateRange), [dateRange]);

  const isInRange = (dateStr: string | undefined): boolean => {
    if (!rangeStart || !dateStr) return true;
    return new Date(dateStr).getTime() >= rangeStart.getTime();
  };

  const filteredPosts = useMemo(() => {
    if (!rangeStart) return products;
    return products.filter(p => isInRange(p.created_at));
  }, [products, rangeStart]);

  const filteredTestimonials = useMemo(() => {
    if (!rangeStart) return reviews;
    return reviews.filter(t => isInRange(t.created_at));
  }, [reviews, rangeStart]);

  // ============================================
  // COMPUTED ANALYTICS (filtered)
  // ============================================

  const totalViews = useMemo(() => filteredPosts.reduce((acc, p) => acc + (p.views || 0), 0), [filteredPosts]);
  const activePosts = useMemo(() => filteredPosts.filter(p => p.is_active), [filteredPosts]);
  const draftPosts = useMemo(() => filteredPosts.filter(p => !p.is_active), [filteredPosts]);

  // Average rating (harus dideklarasikan SEBELUM stats karena stats menggunakan avgRating)
  const avgRating = useMemo(() => {
    if (filteredTestimonials.length === 0) return 0;
    const sum = filteredTestimonials.reduce((acc, t) => acc + (t.rating || 0), 0);
    return sum / filteredTestimonials.length;
  }, [filteredTestimonials]);

  // Stat cards
  const stats = useMemo(() => [
    { label: 'Total Tayangan', value: formatCompactNumber(totalViews), icon: Eye, color: 'text-primary', detail: `${filteredPosts.length} karya` },
    { label: 'Karya Aktif', value: formatFullNumber(activePosts.length), icon: TrendingUp, color: 'text-success', detail: `${draftPosts.length} draf` },
    { label: 'Testimoni', value: formatFullNumber(filteredTestimonials.length), icon: Star, color: 'text-warning', detail: `Rata-rata ${avgRating.toFixed(1)}★` },
    { label: 'Tim Pengelola', value: formatFullNumber(teamCount), icon: Users, color: 'text-fuchsia-500', detail: `${teamCount} anggota` },
  ], [filteredPosts, activePosts, draftPosts, filteredTestimonials, teamCount, totalViews, avgRating]);

  // Category distribution
  const categoryDistribution = useMemo<CategoryStat[]>(() => {
    const map = new Map<string, number>();
    filteredPosts.forEach(post => {
      (post.categories || []).forEach(cat => {
        map.set(cat.name, (map.get(cat.name) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredPosts]);

  // Rating distribution
  const ratingDistribution = useMemo<RatingStat[]>(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    filteredTestimonials.forEach(t => {
      const r = Math.min(5, Math.max(1, Math.round(t.rating)));
      counts[r]++;
    });
    return [5, 4, 3, 2, 1].map(r => ({
      name: `${r}★`,
      count: counts[r],
      rating: r,
    }));
  }, [filteredTestimonials]);

  // Status breakdown
  const statusBreakdown = useMemo<StatusStat[]>(() => [
    { name: 'Aktif', value: activePosts.length },
    { name: 'Draf', value: draftPosts.length },
    { name: 'Sampah', value: filteredPosts.filter(p => p.deleted_at).length },
  ], [filteredPosts, activePosts, draftPosts]);

  // Popular works
  const popularWorks = useMemo(() => {
    return [...filteredPosts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 8)
      .map(p => ({
        name: p.title.length > 10 ? p.title.substring(0, 10) + '…' : p.title,
        views: p.views || 0,
        fullName: p.title,
      }));
  }, [filteredPosts]);

  // Recent works
  const recentWorks = useMemo<RecentWork[]>(() => {
    return [...filteredPosts]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        title: p.title,
        views: p.views || 0,
        created_at: p.created_at || '',
        is_active: p.is_active,
        categoryNames: (p.categories || []).map(c => c.name).join(', ') || '—',
      }));
  }, [filteredPosts]);

  // Average price by category
  const avgPriceByCategory = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    filteredPosts.forEach(post => {
      if (!post.price || post.price <= 0) return;
      (post.categories || []).forEach(cat => {
        const existing = map.get(cat.name) || { total: 0, count: 0 };
        existing.total += post.price;
        existing.count += 1;
        map.set(cat.name, existing);
      });
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({
        name: name.length > 12 ? name.substring(0, 12) + '…' : name,
        fullName: name,
        avgPrice: Math.round(data.total / data.count),
        count: data.count,
      }))
      .sort((a, b) => b.avgPrice - a.avgPrice)
      .slice(0, 6);
  }, [filteredPosts]);

  // ============================================
  // COMPREHENSIVE ANALYTICS DETAIL
  // ============================================

  // Views per post average
  const avgViewsPerPost = useMemo(() => {
    if (filteredPosts.length === 0) return 0;
    return Math.round(totalViews / filteredPosts.length);
  }, [totalViews, filteredPosts]);

  // Top category by views
  const topCategoryByViews = useMemo(() => {
    const map = new Map<string, number>();
    filteredPosts.forEach(post => {
      (post.categories || []).forEach(cat => {
        map.set(cat.name, (map.get(cat.name) || 0) + (post.views || 0));
      });
    });
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { name: sorted[0][0], views: sorted[0][1] } : null;
  }, [filteredPosts]);

  // Total revenue potential
  const totalRevenuePotential = useMemo(() => {
    return filteredPosts.reduce((acc, p) => acc + (p.price || 0), 0);
  }, [filteredPosts]);

  // 5-star rating percentage
  const fiveStarPercentage = useMemo(() => {
    if (filteredTestimonials.length === 0) return 0;
    const fiveStarCount = filteredTestimonials.filter(t => Math.round(t.rating) === 5).length;
    return Math.round((fiveStarCount / filteredTestimonials.length) * 100);
  }, [filteredTestimonials]);

  // Posts with gallery images
  const postsWithImages = useMemo(() => {
    return filteredPosts.filter(p => (p.images?.length || 0) > 0).length;
  }, [filteredPosts]);

  // Price range
  const priceRange = useMemo(() => {
    const prices = filteredPosts.filter(p => p.price > 0).map(p => p.price);
    if (prices.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [filteredPosts]);

  // Active categories count
  const activeCategoryCount = useMemo(() => {
    return categories.filter(c => c.is_active).length;
  }, [categories]);

  // Views trend (last 6 months simulated from created_at)
  const viewsTrend = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthNames[d.getMonth()];
      months[key] = 0;
    }
    filteredPosts.forEach(post => {
      if (!post.created_at) return;
      const d = new Date(post.created_at);
      const key = monthNames[d.getMonth()];
      if (key in months) {
        months[key] += post.views || 0;
      }
    });
    return Object.entries(months).map(([month, views]) => ({ month, views }));
  }, [filteredPosts]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-8 animate-fade-up text-left pb-20 w-full max-w-full overflow-x-hidden">

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 min-w-0">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary tracking-tighter uppercase">Dasbor Analitik</h1>
          <p className="text-[10px] text-primary/30 font-bold uppercase tracking-widest">Ringkasan performa & data seluruh sistem</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 min-w-0 xl:justify-end">
          {/* DATE RANGE FILTER — mobile: dropdown (md:hidden) */}
          <div className="md:hidden w-full">
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="h-11 rounded-xl bg-card border-none shadow-sm w-full px-4 text-[10px] font-black uppercase tracking-widest text-primary">
                <span className="flex items-center gap-2 min-w-0"><CalendarDays size={14} className="text-primary/30 shrink-0" /> <SelectValue placeholder="Periode" /></span>
              </SelectTrigger>
              <SelectContent align="start">
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-black uppercase tracking-widest">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* DATE RANGE FILTER — desktop: segmented pills */}
          <div className="hidden md:flex items-center gap-1.5 bg-card rounded-xl p-1 border border-border/60 shadow-sm shrink-0 max-w-full overflow-x-auto no-scrollbar">
            <CalendarDays size={14} className="text-primary/30 ml-2" />
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={cn(
                  "px-4 h-9 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shrink-0",
                  dateRange === opt.value
                    ? "bg-primary text-white shadow-md"
                    : "text-primary/40 hover:text-primary hover:bg-primary/5"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-3 min-w-0">
          {role === 'developer' && (
            <Button asChild variant="outline" className="rounded-xl h-11 px-4 xl:px-5 font-bold text-[10px] uppercase tracking-widest border-primary/10 text-primary hover:bg-primary/5 transition-all w-full lg:w-auto min-w-0">
              <Link href="/admin/developer" className="flex items-center justify-center gap-2"><Terminal size={14} /> Pengembang</Link>
            </Button>
          )}
          <Button variant="outline" asChild className="rounded-xl h-11 px-5 xl:px-6 font-bold text-[10px] uppercase tracking-widest border-primary/10 hover:bg-primary/5 text-primary transition-all w-full lg:w-auto min-w-0">
            <Link href="/" target="_blank" className="flex items-center justify-center">Lihat Situs</Link>
          </Button>
          <Button asChild className="bg-primary hover:opacity-90 text-white rounded-xl h-11 px-6 xl:px-8 text-[10px] font-bold uppercase tracking-widest shadow-xl border-none active:scale-95 transition-all w-full sm:col-span-2 lg:col-span-1 lg:w-auto min-w-0">
            <Link href="/admin/karya" className="flex items-center justify-center">Terbitkan Karya</Link>
          </Button>
        </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl bg-card group overflow-hidden hover:shadow-md transition-all">
            <CardContent className="p-5 md:p-8 flex flex-col sm:flex-row items-center sm:items-center gap-4 text-center sm:text-left">
              <div className="p-4 rounded-2xl bg-primary/[0.03] group-hover:bg-primary/10 transition-colors shrink-0">
                <stat.icon size={22} className={cn("md:w-6 md:h-6", stat.color)} />
              </div>
              <div className="space-y-1 min-w-0 w-full">
                <p className="text-[8px] md:text-[10px] font-black uppercase text-primary/30 tracking-[0.2em] break-words">{stat.label}</p>
                <h3 className="text-xl md:text-2xl font-bold text-primary">{loading ? (
                  <div className="h-7 w-16 rounded-lg bg-primary/[0.04] animate-pulse" />
                ) : stat.value}</h3>
                <p className="text-[8px] text-primary/20 font-bold uppercase tracking-wider">{stat.detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ROW 1: POPULAR WORKS + CATEGORY DISTRIBUTION */}
      <div className="grid lg:grid-cols-5 gap-8">

        {/* POPULAR WORKS BAR CHART */}
        <Card className="lg:col-span-3 border-none shadow-sm rounded-[3rem] bg-card overflow-hidden">
          <CardHeader className="p-8 md:p-10 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingUp className="text-primary" size={22} />
                <CardTitle className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">Produk Terpopuler</CardTitle>
              </div>
              <Link href="/admin/karya" className="text-[9px] font-bold text-primary/30 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
                Lihat Semua <ArrowUpRight size={10} />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-10 h-[340px]">
            {loading ? (
              <div className="h-full flex items-end justify-around gap-4 px-10">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-t-lg bg-primary/[0.04] animate-pulse" style={{ height: `${30 + Math.random() * 60}%`, width: 40 }} />
                ))}
              </div>
            ) : popularWorks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                <BarChart3 size={40} className="text-primary/10" />
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30">Belum Ada Data</p>
                  <p className="text-[9px] text-primary/20 font-medium italic">Terbitkan karya untuk melihat grafik.</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularWorks} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff1f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#a78bfa' }} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: '#fff9fb' }}
                    contentStyle={{ borderRadius: '1.2rem', border: 'none', fontSize: '10px', boxShadow: '0 10px 30px rgba(139,92,246,0.15)' }}
                    formatter={(value: number) => [`${value.toLocaleString()} tayangan`, 'Views']}
                    labelFormatter={(label: string, payload) => {
                      const item = payload?.[0]?.payload;
                      return item?.fullName || label;
                    }}
                  />
                  <Bar dataKey="views" radius={[8, 8, 0, 0]} barSize={36}>
                    {popularWorks.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#8B5CF6' : index < 3 ? '#A78BFA' : '#C4B5FD'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* CATEGORY DISTRIBUTION PIE */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-[3rem] bg-card overflow-hidden">
          <CardHeader className="p-8 md:p-10 border-b border-border/60">
            <div className="flex items-center gap-4">
              <PieChartIcon className="text-primary" size={22} />
              <CardTitle className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">Distribusi Kategori</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-10 h-[340px]">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-primary/[0.04] animate-pulse" />
              </div>
            ) : categoryDistribution.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                <Layers size={40} className="text-primary/10" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30">Belum Ada Kategori</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                    stroke="none"
                  >
                    {categoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '1.2rem', border: 'none', fontSize: '10px', boxShadow: '0 10px 30px rgba(139,92,246,0.15)' }}
                    formatter={(value: number) => [`${value} karya`]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: VIEWS TREND + RATING DISTRIBUTION + STATUS BREAKDOWN */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* VIEWS TREND LINE CHART */}
        <Card className="lg:col-span-1 border-none shadow-sm rounded-[3rem] bg-card overflow-hidden">
          <CardHeader className="p-8 border-b border-border/60">
            <div className="flex items-center gap-4">
              <Eye className="text-primary" size={22} />
              <CardTitle className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Tren Tayangan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 h-[280px]">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/[0.04] animate-pulse" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={viewsTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff1f5" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#a78bfa' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#c4b5fd' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '1.2rem', border: 'none', fontSize: '10px', boxShadow: '0 10px 30px rgba(139,92,246,0.15)' }}
                    formatter={(value: number) => [`${value.toLocaleString()} tayangan`]}
                  />
                  <Line type="monotone" dataKey="views" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#8B5CF6' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* TESTIMONIAL RATINGS */}
        <Card className="lg:col-span-1 border-none shadow-sm rounded-[3rem] bg-card overflow-hidden">
          <CardHeader className="p-8 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Star className="text-primary" size={22} />
                <CardTitle className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Rating Testimoni</CardTitle>
              </div>
              <div className="flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-xl">
                <Star size={12} className="text-warning/70 fill-warning/70" />
                <span className="text-[10px] font-black text-primary">{avgRating.toFixed(1)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 h-[280px]">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/[0.04] animate-pulse" />
              </div>
            ) : filteredTestimonials.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                <Star size={40} className="text-primary/10" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30">Belum Ada Testimoni</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fff1f5" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#c4b5fd' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#a78bfa' }} width={30} />
                  <Tooltip
                    contentStyle={{ borderRadius: '1.2rem', border: 'none', fontSize: '10px', boxShadow: '0 10px 30px rgba(139,92,246,0.15)' }}
                    formatter={(value: number) => [`${value} testimoni`]}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
                    {ratingDistribution.map((entry) => (
                      <Cell key={`rating-${entry.rating}`} fill={RATING_COLORS[entry.rating] || '#FDA4AF'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* STATUS BREAKDOWN + AVG PRICE */}
        <div className="space-y-8 lg:col-span-1">
          {/* STATUS DONUT */}
          <Card className="border-none shadow-sm rounded-[3rem] bg-card overflow-hidden">
            <CardHeader className="p-8 border-b border-border/60">
              <div className="flex items-center gap-4">
                <Layers className="text-primary" size={22} />
                <CardTitle className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Status Karya</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 h-[160px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/[0.04] animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center justify-around h-full">
                  {statusBreakdown.map((stat, i) => (
                    <div key={stat.name} className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <svg width="64" height="64" viewBox="0 0 36 36" className="transform -rotate-90">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#fff1f5" strokeWidth="4" />
                          <circle
                            cx="18" cy="18" r="14" fill="none"
                            stroke={STATUS_COLORS[i]}
                            strokeWidth="4"
                            strokeDasharray={`${filteredPosts.length > 0 ? (stat.value / filteredPosts.length) * 88 : 0} 88`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[11px] font-black text-primary">{stat.value}</span>
                        </div>
                      </div>
                      <span className="text-[8px] font-bold text-primary/40 uppercase tracking-wider">{stat.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AVG PRICE BY CATEGORY */}
          <Card className="border-none shadow-sm rounded-[3rem] bg-card overflow-hidden">
            <CardHeader className="p-8 border-b border-border/60">
              <div className="flex items-center gap-4">
                <DollarSign className="text-primary" size={22} />
                <CardTitle className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Harga Rata-rata</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-6 rounded-lg bg-primary/[0.04] animate-pulse" />
                  ))}
                </div>
              ) : avgPriceByCategory.length === 0 ? (
                <p className="text-center text-[9px] text-primary/20 font-bold uppercase tracking-widest py-6">Belum ada data harga</p>
              ) : (
                <div className="space-y-3">
                  {avgPriceByCategory.slice(0, 4).map((cat, i) => (
                    <div key={cat.name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                        <span className="text-[9px] font-bold text-primary/50 uppercase tracking-wider truncate">{cat.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-primary shrink-0">{formatPrice(cat.avgPrice)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ROW 3: RECENT WORKS LIST */}
      <Card className="border-none shadow-sm rounded-[3rem] bg-card overflow-hidden">
        <CardHeader className="p-8 md:p-10 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Clock className="text-primary" size={22} />
              <CardTitle className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">Produk Terbaru</CardTitle>
            </div>
            <Link href="/admin/karya" className="text-[9px] font-bold text-primary/30 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
              Kelola <ArrowUpRight size={10} />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-primary/[0.04] animate-pulse" />
              ))}
            </div>
          ) : recentWorks.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30">Belum Ada Karya</p>
            </div>
          ) : (
            <div className="divide-y divide-primary/5">
              {recentWorks.map((work) => (
                <div key={work.id} className="flex items-center gap-4 px-8 md:px-10 py-4 hover:bg-primary/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-foreground uppercase tracking-wider truncate">{work.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[8px] text-primary/30 font-bold uppercase tracking-wider">{work.categoryNames}</span>
                      <span className="text-primary/10">•</span>
                      <span className="text-[8px] text-primary/20 font-mono">
                        {work.created_at ? new Date(work.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[9px] text-primary/40 font-bold flex items-center gap-1">
                      <Eye size={10} /> {work.views.toLocaleString()}
                    </span>
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border",
                      work.is_active
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-warning/10 text-warning border-warning/20"
                    )}>
                      {work.is_active ? 'Aktif' : 'Draf'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ROW 3.5: COMPREHENSIVE ANALYTICS DETAIL */}
      <Card className="border-none shadow-sm rounded-[3rem] bg-card overflow-hidden">
        <CardHeader className="p-8 md:p-10 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BarChart3 className="text-primary" size={22} />
              <div>
                <CardTitle className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">Analitik Detail</CardTitle>
                <p className="text-[9px] text-primary/30 font-bold uppercase tracking-widest mt-1">Insight komprehensif performa karya & testimoni</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 md:p-10">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 w-20 rounded-lg bg-primary/[0.04] animate-pulse" />
                  <div className="h-7 w-28 rounded-lg bg-primary/[0.04] animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {/* Avg Views Per Post */}
              <div className="space-y-2 p-4 rounded-2xl bg-primary/[0.02] hover:bg-primary/[0.04] transition-colors">
                <p className="text-[8px] font-black uppercase text-primary/30 tracking-[0.2em]">Rata-rata Tayangan/Karya</p>
                <p className="text-lg font-bold text-primary">{formatCompactNumber(avgViewsPerPost)}</p>
                <p className="text-[8px] text-primary/20 font-medium">dari {filteredPosts.length} karya</p>
              </div>

              {/* Top Category By Views */}
              <div className="space-y-2 p-4 rounded-2xl bg-primary/[0.02] hover:bg-primary/[0.04] transition-colors">
                <p className="text-[8px] font-black uppercase text-primary/30 tracking-[0.2em]">Kategori Terlaris</p>
                <p className="text-lg font-bold text-primary truncate" title={topCategoryByViews?.name || '—'}>
                  {topCategoryByViews ? (topCategoryByViews.name.length > 12 ? topCategoryByViews.name.substring(0, 12) + '…' : topCategoryByViews.name) : '—'}
                </p>
                <p className="text-[8px] text-primary/20 font-medium">{topCategoryByViews ? `${formatCompactNumber(topCategoryByViews.views)} tayangan` : 'Belum ada data'}</p>
              </div>

              {/* Total Revenue Potential */}
              <div className="space-y-2 p-4 rounded-2xl bg-primary/[0.02] hover:bg-primary/[0.04] transition-colors">
                <p className="text-[8px] font-black uppercase text-primary/30 tracking-[0.2em]">Potensi Pendapatan</p>
                <p className="text-lg font-bold text-primary truncate" title={formatPrice(totalRevenuePotential)}>
                  {totalRevenuePotential > 0 ? formatPrice(totalRevenuePotential) : '—'}
                </p>
                <p className="text-[8px] text-primary/20 font-medium">{formatPrice(priceRange.min)} – {formatPrice(priceRange.max)}</p>
              </div>

              {/* 5-Star Percentage */}
              <div className="space-y-2 p-4 rounded-2xl bg-primary/[0.02] hover:bg-primary/[0.04] transition-colors">
                <p className="text-[8px] font-black uppercase text-primary/30 tracking-[0.2em]">Rating Bintang 5</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-bold text-primary">{fiveStarPercentage}%</p>
                  <div className="flex-1 h-1.5 bg-primary/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-success to-success rounded-full transition-all" style={{ width: `${fiveStarPercentage}%` }} />
                  </div>
                </div>
                <p className="text-[8px] text-primary/20 font-medium">dari {filteredTestimonials.length} testimoni</p>
              </div>

              {/* Posts With Gallery */}
              <div className="space-y-2 p-4 rounded-2xl bg-primary/[0.02] hover:bg-primary/[0.04] transition-colors">
                <p className="text-[8px] font-black uppercase text-primary/30 tracking-[0.2em]">Karya Bergambar</p>
                <p className="text-lg font-bold text-primary">{postsWithImages}</p>
                <p className="text-[8px] text-primary/20 font-medium">dari {filteredPosts.length} total karya</p>
              </div>

              {/* Total Gallery Images */}
              <div className="space-y-2 p-4 rounded-2xl bg-primary/[0.02] hover:bg-primary/[0.04] transition-colors">
                <p className="text-[8px] font-black uppercase text-primary/30 tracking-[0.2em]">Total Gambar Galeri</p>
                <p className="text-lg font-bold text-primary">{filteredPosts.reduce((acc, p) => acc + (p.images?.length || 0), 0)}</p>
                <p className="text-[8px] text-primary/20 font-medium">rata-rata {postsWithImages > 0 ? Math.round(filteredPosts.reduce((acc, p) => acc + (p.images?.length || 0), 0) / postsWithImages) : 0} gambar/karya</p>
              </div>

              {/* Active Categories */}
              <div className="space-y-2 p-4 rounded-2xl bg-primary/[0.02] hover:bg-primary/[0.04] transition-colors">
                <p className="text-[8px] font-black uppercase text-primary/30 tracking-[0.2em]">Kategori Aktif</p>
                <p className="text-lg font-bold text-primary">{activeCategoryCount}</p>
                <p className="text-[8px] text-primary/20 font-medium">dari {categories.length} total kategori</p>
              </div>

              {/* Draft Posts */}
              <div className="space-y-2 p-4 rounded-2xl bg-primary/[0.02] hover:bg-primary/[0.04] transition-colors">
                <p className="text-[8px] font-black uppercase text-primary/30 tracking-[0.2em]">Karya Draf</p>
                <p className="text-lg font-bold text-primary">{draftPosts.length}</p>
                <p className="text-[8px] text-primary/20 font-medium">belum diterbitkan</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ROW 4: QUICK ACTIONS + INFO */}
      <div className="space-y-4">
        {/* QUICK TOOLS LIST */}
        <div className="bg-card rounded-3xl border-none shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-border/60">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-primary" size={18} />
              <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">Aksi Cepat</h3>
            </div>
          </div>
          <div className="divide-y divide-primary/5">
            {role === 'developer' && (
              <Link href="/admin/developer" className="flex items-center gap-4 px-8 py-4 hover:bg-primary/[0.02] transition-colors group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-fuchsia-600 text-white flex items-center justify-center shrink-0">
                  <Terminal size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Konsol Sistem</p>
                  <p className="text-[8px] text-primary/30 uppercase tracking-wider">Pemeliharaan & Audit</p>
                </div>
                <ArrowRight size={14} className="text-primary/20 group-hover:text-primary/50 transition-colors shrink-0" />
              </Link>
            )}
            <Link href="/admin/karya" className="flex items-center gap-4 px-8 py-4 hover:bg-primary/[0.02] transition-colors group">
              <div className="w-10 h-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                <ImageIcon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Terbitkan Produk</p>
                <p className="text-[8px] text-primary/30 uppercase tracking-wider">Unggah produk & galeri baru</p>
              </div>
              <ArrowRight size={14} className="text-primary/20 group-hover:text-primary/50 transition-colors shrink-0" />
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-4 px-8 py-4 hover:bg-primary/[0.02] transition-colors group">
              <div className="w-10 h-10 rounded-2xl bg-card border border-primary/10 text-primary flex items-center justify-center shrink-0">
                <Settings size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Pengaturan</p>
                <p className="text-[8px] text-primary/30 uppercase tracking-wider">Konfigurasi sistem & keamanan</p>
              </div>
              <ArrowRight size={14} className="text-primary/20 group-hover:text-primary/50 transition-colors shrink-0" />
            </Link>
            <a href="/" target="_blank" className="flex items-center gap-4 px-8 py-4 hover:bg-primary/[0.02] transition-colors group">
              <div className="w-10 h-10 rounded-2xl bg-card border border-primary/10 text-primary flex items-center justify-center shrink-0">
                <Eye size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Lihat Situs</p>
                <p className="text-[8px] text-primary/30 uppercase tracking-wider">Pratinjau halaman publik</p>
              </div>
              <ArrowRight size={14} className="text-primary/20 group-hover:text-primary/50 transition-colors shrink-0" />
            </a>
          </div>
        </div>

        {/* QUICK STATS LIST */}
        <div className="bg-card rounded-3xl border-none shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-border/60">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-primary" size={18} />
              <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">Ringkasan Cepat</h3>
            </div>
          </div>
          <div className="divide-y divide-primary/5">
            {[
              { label: 'Total gambar galeri', value: filteredPosts.reduce((acc, p) => acc + (p.images?.length || 0), 0).toLocaleString(), icon: ImageIcon },
              { label: 'Kategori aktif', value: `${activeCategoryCount} / ${categories.length}`, icon: Layers },
              { label: 'Rata-rata harga', value: filteredPosts.filter(p => p.price > 0).length > 0
                ? formatPrice(Math.round(filteredPosts.filter(p => p.price > 0).reduce((acc, p) => acc + p.price, 0) / filteredPosts.filter(p => p.price > 0).length))
                : '—', icon: DollarSign },
              { label: 'Tayangan tertinggi', value: filteredPosts.length > 0 ? `${Math.max(...filteredPosts.map(p => p.views || 0)).toLocaleString()}` : '—', icon: Eye },
              { label: 'Testimoni 5★', value: filteredTestimonials.length > 0 ? `${fiveStarPercentage}%` : '—', icon: Star },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4 px-8 py-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/[0.03] text-primary/40 flex items-center justify-center shrink-0">
                  <item.icon size={16} />
                </div>
                <span className="flex-1 text-[9px] font-bold text-primary/40 uppercase tracking-wider">{item.label}</span>
                <span className="text-[11px] font-black text-primary shrink-0">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="px-8 py-4 bg-primary/[0.02]">
            <p className="text-[8px] text-primary/25 leading-relaxed italic font-medium">
              <Info size={11} className="inline mr-1.5 -mt-0.5" />
              Angka tayangan diperbarui secara real-time oleh RPC server-side.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
