"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ContactButton } from "@/components/ui/ContactButton";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useNotification } from "@/hooks/useNotification";
import { createPortal } from "react-dom";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
};

type ActiveGroup = {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  type: "public" | "private";
  members: number;
  messages: string;
  description: string;
  lastActive: string;
};

type SuggestedGroup = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "public" | "private";
  members: number;
  messages: string;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  groupsCount: number;
};

type RecentActivity = {
  id: string;
  author: string;
  authorAvatar: string;
  group: string;
  timeAgo: string;
  content: string;
  replies: number;
  likes: number;
};

export default function GroupesPage() {
  const router = useRouter();
  const { user, getUser, signOut } = useAuth();
  const { profile, fetchProfile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("mes-groupes");
  const [createGroupModal, setCreateGroupModal] = useState(false);
  const { success } = useNotification();

  // Groupes actifs
  const activeGroups: ActiveGroup[] = [
    {
      id: "1",
      name: "Entrepreneurs Tech",
      icon: "rocket",
      gradient: "from-purple-500 to-blue-500",
      type: "public",
      members: 342,
      messages: "1.2K",
      description: "Échanges sur les dernières technologies, startups et innovations dans le secteur tech.",
      lastActive: "il y a 2 min",
    },
    {
      id: "2",
      name: "Investisseurs",
      icon: "chart",
      gradient: "from-green-500 to-green-400",
      type: "private",
      members: 189,
      messages: "856",
      description: "Stratégies d'investissement, analyse de marché et opportunités financières.",
      lastActive: "il y a 3 min",
    },
    {
      id: "3",
      name: "Marketing Digital",
      icon: "megaphone",
      gradient: "from-red-500 to-orange-500",
      type: "public",
      members: 567,
      messages: "2.1K",
      description: "Stratégies marketing, SEO, réseaux sociaux et growth hacking.",
      lastActive: "il y a 1 min",
    },
    {
      id: "4",
      name: "Créatifs & Design",
      icon: "star",
      gradient: "from-purple-500 to-pink-500",
      type: "public",
      members: 423,
      messages: "1.5K",
      description: "UI/UX design, branding, graphisme et tendances créatives.",
      lastActive: "il y a 4 min",
    },
    {
      id: "5",
      name: "Juridique & Fiscal",
      icon: "scales",
      gradient: "from-blue-500 to-cyan-500",
      type: "private",
      members: 234,
      messages: "623",
      description: "Conseils juridiques, optimisation fiscale et conformité réglementaire.",
      lastActive: "il y a 5 min",
    },
    {
      id: "6",
      name: "E-commerce",
      icon: "shopping",
      gradient: "from-orange-500 to-amber-600",
      type: "public",
      members: 678,
      messages: "3.2K",
      description: "Stratégies de vente en ligne, dropshipping et marketplaces.",
      lastActive: "il y a 6 min",
    },
  ];

  // Groupes suggérés
  const suggestedGroups: SuggestedGroup[] = [
    {
      id: "1",
      name: "M.A. & Automation",
      icon: "automation",
      color: "blue",
      type: "public",
      members: 450,
      messages: "1.6K",
    },
    {
      id: "2",
      name: "Business Durable",
      icon: "leaf",
      color: "green",
      type: "public",
      members: 321,
      messages: "1.4K",
    },
    {
      id: "3",
      name: "Bien-être Pro",
      icon: "heart",
      color: "red",
      type: "public",
      members: 287,
      messages: "987",
    },
    {
      id: "4",
      name: "Crypto & Web3",
      icon: "diamond",
      color: "orange",
      type: "public",
      members: 724,
      messages: "4.2K",
    },
  ];

  // Catégories
  const categories: Category[] = [
    { id: "1", name: "Tech", icon: "rocket", color: "blue", groupsCount: 23 },
    { id: "2", name: "Finance", icon: "chart", color: "green", groupsCount: 18 },
    { id: "3", name: "Marketing", icon: "megaphone", color: "orange", groupsCount: 31 },
    { id: "4", name: "Design", icon: "star", color: "purple", groupsCount: 15 },
    { id: "5", name: "Juridique", icon: "scales", color: "blue", groupsCount: 17 },
    { id: "6", name: "Commerce", icon: "shopping", color: "amber", groupsCount: 26 },
  ];

  // Activité récente
  const recentActivity: RecentActivity[] = [
    {
      id: "1",
      author: "Alexandre Petit",
      authorAvatar: "/api/placeholder/40/40",
      group: "Entrepreneurs Tech",
      timeAgo: "il y a 5 min",
      content: "Quelqu'un a testé les nouveaux outils d'I.A. pour la génération de code ? Je cherche des retours d'expérience...",
      replies: 17,
      likes: 24,
    },
    {
      id: "2",
      author: "Léa Rousseau",
      authorAvatar: "/api/placeholder/40/40",
      group: "Marketing Digital",
      timeAgo: "il y a 10 min",
      content: "Je partage mon étude de cas d'une pub sur une campagne TikTok qui a généré 200K impressions en 48h.",
      replies: 15,
      likes: 27,
    },
    {
      id: "3",
      author: "Thomas Leroy",
      authorAvatar: "/api/placeholder/40/40",
      group: "Investisseurs",
      timeAgo: "il y a 1h",
      content: "Analyse du marché immobilier UK pour Q1 2024. Des opportunités intéressantes se dessinent...",
      replies: 17,
      likes: 34,
    },
    {
      id: "4",
      author: "Marie Dubois",
      authorAvatar: "/api/placeholder/40/40",
      group: "Créatifs & Design",
      timeAgo: "il y a 2h",
      content: "Nouveau portfolio en ligne ! J'ai utilisé Figma pour créer une expérience utilisateur unique.",
      replies: 19,
      likes: 52,
    },
  ];

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const currentUser = await getUser();

      if (!currentUser) {
        router.push("/login");
        return;
      }

      const profileData = await fetchProfile(currentUser.id);

      if (!profileData || !isMounted) {
        if (!profileData) {
          console.error("Error fetching profile");
        }
        return;
      }

      if (profileData.role === "admin") {
        router.push("/admin");
        return;
      }

      setLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [router, getUser, fetchProfile]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900">
        <p className="text-neutral-500">Chargement...</p>
      </div>
    );
  }

  const userName = profile?.full_name || profile?.email?.split("@")[0] || "Utilisateur";
  const userAvatar = profile?.avatar_url || "/api/placeholder/40/40";

  const handleLogout = async () => {
    await signOut();
  };

  const getIconSVG = (icon: string, className: string = "h-6 w-6") => {
    switch (icon) {
      case "rocket":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "chart":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case "megaphone":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
      case "star":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case "scales":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        );
      case "shopping":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case "automation":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case "leaf":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case "heart":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case "diamond":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-900 text-white">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] border-r border-neutral-800 bg-neutral-950 transition-transform duration-300 lg:static lg:z-auto ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col p-4 lg:p-6">
          {/* Mobile Close Button */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <Logo variant="sidebar" brand="partnershub" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-neutral-400 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Logo - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <Logo variant="sidebar" brand="partnershub" />
          </div>

          {/* NAVIGATION Section */}
          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              NAVIGATION
            </p>
            <nav className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span>PARTNERS LLC</span>
              </Link>
              <Link
                href="/partners-hub"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Dashboard</span>
              </Link>
              <Link
                href="/partners-hub/evenements"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Événements & Lives</span>
              </Link>
              <Link
                href="/partners-hub/carte"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Carte des Membres</span>
              </Link>
              <Link
                href="/partners-hub/marketplace"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span>Marketplace</span>
              </Link>
              <Link
                href="/partners-hub/expat-community"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>Expat Community</span>
              </Link>
              <Link
                href="/partners-hub/groupes"
                className="flex items-center gap-3 rounded-lg bg-green-500/20 px-3 py-2.5 text-green-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="font-medium">Groupes</span>
              </Link>
            </nav>
          </div>

          {/* COMPTE Section */}
          <div className="mb-6 border-t border-neutral-800 pt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              COMPTE
            </p>
            <nav className="space-y-1">
              <Link
                href="/partners-hub/mon-profil"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Mon Profil</span>
              </Link>
              <Link
                href="/partners-hub/parametres"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Paramètres</span>
              </Link>
            </nav>
          </div>

          {/* Help Section */}
          <div className="mt-auto rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <p className="mb-1 text-sm font-semibold">Besoin d&apos;aide ?</p>
            <p className="mb-4 text-xs leading-relaxed text-neutral-400">
              Contactez votre conseiller dédié pour toute question.
            </p>
            <ContactButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-neutral-900">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950 px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden text-neutral-400 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="relative flex-1 max-w-2xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher des groupes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="ml-4 flex items-center gap-3">
              {/* Notifications */}
              <button className="relative text-neutral-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              {/* Settings */}
              <button className="relative text-neutral-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              {/* User Profile */}
              <div className="flex items-center gap-2">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-10 w-10 rounded-full border-2 border-neutral-700"
                />
                <div className="hidden lg:block">
                  <div className="text-sm font-medium">{userName}</div>
                  <div className="text-xs text-green-400">Membre Premium</div>
                </div>
                <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Mes Groupes Header */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">Mes Groupes</h1>
              <p className="mt-2 text-sm lg:text-base text-neutral-400">
                Rejoignez des communautés thématiques et échangez avec des entrepreneurs partageant vos centres d'intérêt
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Groupes Disponibles</p>
                    <p className="text-2xl font-bold">127</p>
                    <p className="text-xs text-green-400 mt-1">+14%</p>
                  </div>
                  <div className="rounded-lg bg-green-500/20 p-3">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Groupes Rejoints</p>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-green-400 mt-1">+1%</p>
                  </div>
                  <div className="rounded-lg bg-green-500/20 p-3">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Messages Aujourd'hui</p>
                    <p className="text-2xl font-bold">2,847</p>
                    <p className="text-xs text-green-400 mt-1">+8%</p>
                  </div>
                  <div className="rounded-lg bg-purple-500/20 p-3">
                    <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Groupes Actifs</p>
                    <p className="text-2xl font-bold">89</p>
                    <p className="text-xs text-green-400 mt-1">+1%</p>
                  </div>
                  <div className="rounded-lg bg-yellow-500/20 p-3">
                    <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs and Create Button */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab("mes-groupes")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "mes-groupes"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800"
                }`}
              >
                Mes Groupes
              </button>
              <button
                onClick={() => setActiveTab("decouvrir")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "decouvrir"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800"
                }`}
              >
                Découvrir
              </button>
              <button
                onClick={() => setActiveTab("populaires")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "populaires"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800"
                }`}
              >
                Populaires
              </button>
              <button
                onClick={() => setActiveTab("recommandes")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "recommandes"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800"
                }`}
              >
                Recommandés
              </button>
              <button
                onClick={() => setCreateGroupModal(true)}
                className="ml-auto flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer un Groupe
              </button>
            </div>

            {/* Groupes Actifs */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl lg:text-2xl font-semibold">Groupes Actifs</h2>
                <select className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500">
                  <option>Mouvement actifs</option>
                  <option>Plus récents</option>
                  <option>Plus populaires</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeGroups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden"
                  >
                    <div className={`h-2 bg-gradient-to-r ${group.gradient}`} />
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`rounded-lg bg-gradient-to-r ${group.gradient} p-3 text-white`}>
                          {getIconSVG(group.icon, "h-6 w-6")}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{group.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              group.type === "public" 
                                ? "bg-green-500/20 text-green-400" 
                                : "bg-purple-500/20 text-purple-400"
                            }`}>
                              Groupe {group.type === "public" ? "public" : "privé"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-400 mb-4">
                        <span>{group.members} Membres</span>
                        <span>{group.messages} Messages</span>
                      </div>
                      <p className="text-sm text-neutral-300 mb-4 line-clamp-2">{group.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-neutral-500">Actif {group.lastActive}</span>
                      </div>
                      <button className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
                        Ouvrir le Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Groupes Suggérés */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl lg:text-2xl font-semibold">Groupes Suggérés</h2>
                <button className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors">
                  Voir tous
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {suggestedGroups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 p-6"
                  >
                    <div className={`rounded-lg p-3 mb-4 inline-block ${
                      group.color === "blue" ? "bg-blue-500/20" :
                      group.color === "green" ? "bg-green-500/20" :
                      group.color === "red" ? "bg-red-500/20" :
                      "bg-orange-500/20"
                    }`}>
                      {getIconSVG(group.icon, `h-6 w-6 ${
                        group.color === "blue" ? "text-blue-400" :
                        group.color === "green" ? "text-green-400" :
                        group.color === "red" ? "text-red-400" :
                        "text-orange-400"
                      }`)}
                    </div>
                    <h3 className="font-bold mb-2">{group.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                        {group.type === "public" ? "Public" : "Privé"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-400 mb-4">
                      <span>{group.members} Membres</span>
                      <span>{group.messages} Messages</span>
                    </div>
                    <button className="w-full rounded-lg border border-green-500 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20">
                      Rejoindre
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Explorer par Catégorie */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-semibold">Explorer par Catégorie</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 hover:bg-neutral-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`rounded-lg p-3 ${
                        category.color === "blue" ? "bg-blue-500/20" :
                        category.color === "green" ? "bg-green-500/20" :
                        category.color === "orange" ? "bg-orange-500/20" :
                        category.color === "purple" ? "bg-purple-500/20" :
                        "bg-amber-600/20"
                      }`}>
                        {getIconSVG(category.icon, `h-6 w-6 ${
                          category.color === "blue" ? "text-blue-400" :
                          category.color === "green" ? "text-green-400" :
                          category.color === "orange" ? "text-orange-400" :
                          category.color === "purple" ? "text-purple-400" :
                          "text-amber-400"
                        }`)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                        <p className="text-sm text-neutral-400">{category.groupsCount} groupes</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activité Récente */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-semibold">Activité Récente</h2>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 p-6"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={activity.authorAvatar}
                        alt={activity.author}
                        className="h-10 w-10 rounded-full border-2 border-neutral-700 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{activity.author}</span>
                          <span className="text-sm text-neutral-500">dans</span>
                          <span className="text-sm font-medium text-green-400">{activity.group}</span>
                          <span className="text-sm text-neutral-500">•</span>
                          <span className="text-sm text-neutral-500">{activity.timeAgo}</span>
                        </div>
                        <p className="text-sm text-neutral-300 mb-3">{activity.content}</p>
                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                          <div className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{activity.replies} réponses</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{activity.likes} likes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Créer un Groupe */}
      {createGroupModal && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Créer un Groupe</h3>
                <p className="text-sm text-neutral-400">Créez votre propre communauté thématique</p>
              </div>
              <button
                className="text-neutral-400 transition-colors hover:text-white"
                onClick={() => setCreateGroupModal(false)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              success("Groupe créé", "Groupe créé avec succès !");
              setCreateGroupModal(false);
            }}>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">Nom du groupe</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Ex: Entrepreneurs Tech"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">Description</label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Décrivez votre groupe..."
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">Type de groupe</label>
                <select
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Privé</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Créer le Groupe
                </button>
                <button
                  type="button"
                  onClick={() => setCreateGroupModal(false)}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

