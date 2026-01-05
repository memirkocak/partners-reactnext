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

type Destination = {
  id: string;
  city: string;
  country: string;
  image: string;
  members: number;
  discussions: number;
  memberAvatars: string[];
  description: string;
  isPopular?: boolean;
};

type CountryGroup = {
  id: string;
  city: string;
  country: string;
  image: string;
  members: number;
  discussions: number;
};

type Guide = {
  id: string;
  title: string;
  author: string;
  icon: string;
  iconColor: string;
  views: number;
  saves: number;
};

type Discussion = {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  tag: string;
  tagColor: string;
  timeAgo: string;
  replies: number;
};

export default function ExpatCommunityPage() {
  const router = useRouter();
  const { user, getUser, signOut } = useAuth();
  const { profile, fetchProfile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const { success, info } = useNotification();
  
  // Modals
  const [joinGroupModal, setJoinGroupModal] = useState<Destination | null>(null);
  const [viewGroupModal, setViewGroupModal] = useState<CountryGroup | null>(null);
  const [readGuideModal, setReadGuideModal] = useState<Guide | null>(null);
  const [createGroupModal, setCreateGroupModal] = useState(false);

  // Destinations populaires
  const popularDestinations: Destination[] = [
    {
      id: "1",
      city: "Dubai",
      country: "EAU",
      image: "/api/placeholder/400/250",
      members: 487,
      discussions: 892,
      memberAvatars: ["/api/placeholder/32/32", "/api/placeholder/32/32", "/api/placeholder/32/32", "/api/placeholder/32/32"],
      description: "Hub international pour les entrepreneurs et investisseurs. Écosystème dynamique et opportunités d'affaires.",
      isPopular: true,
    },
    {
      id: "2",
      city: "Lisbonne",
      country: "Portugal",
      image: "/api/placeholder/400/250",
      members: 623,
      discussions: 1047,
      memberAvatars: ["/api/placeholder/32/32", "/api/placeholder/32/32", "/api/placeholder/32/32", "/api/placeholder/32/32"],
      description: "Destination prisée pour les entrepreneurs avec un coût de la vie attractif et une qualité de vie exceptionnelle.",
      isPopular: true,
    },
    {
      id: "3",
      city: "Bali",
      country: "Indonésie",
      image: "/api/placeholder/400/250",
      members: 541,
      discussions: 738,
      memberAvatars: ["/api/placeholder/32/32", "/api/placeholder/32/32", "/api/placeholder/32/32", "/api/placeholder/32/32"],
      description: "Paradis des nomades digitaux avec une communauté entrepreneuriale en pleine croissance.",
      isPopular: true,
    },
  ];

  // Tous les groupes pays
  const countryGroups: CountryGroup[] = [
    { id: "1", city: "Miami", country: "USA", image: "/api/placeholder/300/200", members: 342, discussions: 567 },
    { id: "2", city: "Bangkok", country: "Thaïlande", image: "/api/placeholder/300/200", members: 289, discussions: 432 },
    { id: "3", city: "Barcelone", country: "Espagne", image: "/api/placeholder/300/200", members: 456, discussions: 678 },
    { id: "4", city: "Montréal", country: "Canada", image: "/api/placeholder/300/200", members: 378, discussions: 543 },
    { id: "5", city: "Singapour", country: "Singapour", image: "/api/placeholder/300/200", members: 234, discussions: 389 },
    { id: "6", city: "Londres", country: "UK", image: "/api/placeholder/300/200", members: 567, discussions: 890 },
    { id: "7", city: "Mexico", country: "Mexique", image: "/api/placeholder/300/200", members: 198, discussions: 321 },
    { id: "8", city: "Istanbul", country: "Turquie", image: "/api/placeholder/300/200", members: 156, discussions: 234 },
  ];

  // Guides expat populaires
  const popularGuides: Guide[] = [
    {
      id: "1",
      title: "Guide Fiscal Dubai",
      author: "Alexandre Petit",
      icon: "document-dollar",
      iconColor: "green",
      views: 1247,
      saves: 547,
    },
    {
      id: "2",
      title: "Se Loger à Lisbonne",
      author: "Léa Rousseau",
      icon: "house",
      iconColor: "purple",
      views: 2847,
      saves: 1047,
    },
    {
      id: "3",
      title: "Travailler à Bali",
      author: "Lucas Moreau",
      icon: "briefcase",
      iconColor: "green",
      views: 1842,
      saves: 647,
    },
  ];

  // Discussions récentes
  const recentDiscussions: Discussion[] = [
    {
      id: "1",
      title: "Meilleurs quartiers pour entrepreneurs à Dubai ?",
      description: "Je cherche des recommandations sur les meilleurs quartiers pour créer une entreprise à Dubai...",
      author: "Sophie Martin",
      authorAvatar: "/api/placeholder/40/40",
      tag: "Dubai",
      tagColor: "green",
      timeAgo: "Il y a 2h",
      replies: 23,
    },
    {
      id: "2",
      title: "Coût de la vie à Lisbonne en 2024",
      description: "Partagez vos expériences sur le coût de la vie actuel à Lisbonne pour un expatrié...",
      author: "Thomas Bernard",
      authorAvatar: "/api/placeholder/40/40",
      tag: "Lisbonne",
      tagColor: "purple",
      timeAgo: "Il y a 5h",
      replies: 45,
    },
    {
      id: "3",
      title: "Visa et papiers pour travailler à Bali",
      description: "Quelqu'un peut m'aider avec les démarches pour obtenir un visa de travail à Bali ?",
      author: "Emma Laurent",
      authorAvatar: "/api/placeholder/40/40",
      tag: "Bali",
      tagColor: "green",
      timeAgo: "Il y a 8h",
      replies: 18,
    },
    {
      id: "4",
      title: "Réseau d'entraide expatriés - Partagez vos contacts",
      description: "Créons un réseau solide d'entraide entre expatriés. Partagez vos contacts et expériences...",
      author: "Lucas Moreau",
      authorAvatar: "/api/placeholder/40/40",
      tag: "Global",
      tagColor: "green",
      timeAgo: "Il y a 12h",
      replies: 67,
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

  const regions = ["all", "Europe", "Amérique", "Asie", "Afrique"];

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
                <span className="font-medium">Expat Community</span>
              </Link>
              <Link
                href="/partners-hub/groupes"
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
                <span>Groupes</span>
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
                  placeholder="Rechercher pays, villes, guides..."
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
            {/* Page Header */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">Expat Community</h1>
              <p className="mt-2 text-sm lg:text-base text-neutral-400">
                Connectez-vous avec des expatriés du monde entier, partagez vos expériences et trouvez les meilleures adresses
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Pays Couverts</p>
                    <p className="text-2xl font-bold">87</p>
                    <p className="text-xs text-green-400 mt-1">+10%</p>
                  </div>
                  <div className="rounded-lg bg-green-500/20 p-3">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Expatriés Actifs</p>
                    <p className="text-2xl font-bold">2,847</p>
                    <p className="text-xs text-green-400 mt-1">+20%</p>
                  </div>
                  <div className="rounded-lg bg-purple-500/20 p-3">
                    <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Services Adhérents</p>
                    <p className="text-2xl font-bold">5,293</p>
                    <p className="text-xs text-green-400 mt-1">+15%</p>
                  </div>
                  <div className="rounded-lg bg-green-500/20 p-3">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Note Moyenne</p>
                    <p className="text-2xl font-bold">4.8</p>
                  </div>
                  <div className="rounded-lg bg-yellow-500/20 p-3">
                    <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedRegion === region
                      ? "bg-green-500/20 text-green-400"
                      : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800"
                  }`}
                >
                  {region === "all" ? "Tous les Pays" : region}
                </button>
              ))}
              <button 
                onClick={() => setCreateGroupModal(true)}
                className="ml-auto flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer un Groupe Pays
              </button>
            </div>

            {/* Destinations Populaires */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl lg:text-2xl font-semibold">Destinations Populaires</h2>
                <button 
                  onClick={() => info("Destinations populaires", "Affichage de toutes les destinations populaires...")}
                  className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  Voir tout
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularDestinations.map((destination) => (
                  <div
                    key={destination.id}
                    className="group rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden transition-all hover:shadow-lg hover:shadow-green-500/10"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={destination.image}
                        alt={`${destination.city}, ${destination.country}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {destination.isPopular && (
                        <div className="absolute top-4 left-4">
                          <span className="rounded-lg bg-green-500 px-3 py-1 text-xs font-bold text-white">
                            POPULAIRE
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4">
                        <p className="text-white font-semibold text-lg drop-shadow-lg">
                          {destination.city}, {destination.country}
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-neutral-400">{destination.members} Membres</p>
                          <p className="text-sm text-neutral-400">{destination.discussions} Discussions</p>
                        </div>
                        <div className="flex -space-x-2">
                          {destination.memberAvatars.map((avatar, idx) => (
                            <img
                              key={idx}
                              src={avatar}
                              alt="Member"
                              className="h-8 w-8 rounded-full border-2 border-neutral-800"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-neutral-300 mb-4 line-clamp-2">{destination.description}</p>
                      <button 
                        onClick={() => setJoinGroupModal(destination)}
                        className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                      >
                        Rejoindre le Groupe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tous les Groupes Pays */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl lg:text-2xl font-semibold">Tous les Groupes Pays</h2>
                <button 
                  onClick={() => info("Chargement", "Chargement de plus de groupes...")}
                  className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  Charger plus de groupes
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {countryGroups.map((group) => (
                  <div
                    key={group.id}
                    className="group rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden transition-all hover:shadow-lg hover:shadow-green-500/10"
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={group.image}
                        alt={`${group.city}, ${group.country}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold mb-2">{group.city}, {group.country}</h3>
                      <div className="flex items-center justify-between text-sm text-neutral-400 mb-4">
                        <span>{group.members} membres</span>
                        <span>{group.discussions} discussions</span>
                      </div>
                      <button 
                        onClick={() => setViewGroupModal(group)}
                        className="w-full rounded-lg border border-green-500 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
                      >
                        Voir le Groupe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guides Expat Populaires */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-semibold">Guides Expat Populaires</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {popularGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg p-3 ${
                        guide.iconColor === "green" ? "bg-green-500/20" :
                        guide.iconColor === "purple" ? "bg-purple-500/20" :
                        "bg-green-500/20"
                      }`}>
                        {guide.icon === "document-dollar" && (
                          <svg className={`h-6 w-6 ${
                            guide.iconColor === "green" ? "text-green-400" :
                            guide.iconColor === "purple" ? "text-purple-400" :
                            "text-green-400"
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        {guide.icon === "house" && (
                          <svg className={`h-6 w-6 ${
                            guide.iconColor === "green" ? "text-green-400" :
                            guide.iconColor === "purple" ? "text-purple-400" :
                            "text-green-400"
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        )}
                        {guide.icon === "briefcase" && (
                          <svg className={`h-6 w-6 ${
                            guide.iconColor === "green" ? "text-green-400" :
                            guide.iconColor === "purple" ? "text-purple-400" :
                            "text-green-400"
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{guide.title}</h3>
                        <p className="text-sm text-neutral-400 mb-3">Par {guide.author}</p>
                        <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                          <span>{guide.views} vues</span>
                          <span>{guide.saves} sauvegardes</span>
                        </div>
                        <button 
                          onClick={() => setReadGuideModal(guide)}
                          className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                        >
                          Lire le Guide
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discussions Récentes */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-semibold">Discussions Récentes</h2>
              </div>
              <div className="space-y-4">
                {recentDiscussions.map((discussion) => (
                  <div
                    key={discussion.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 p-6"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={discussion.authorAvatar}
                        alt={discussion.author}
                        className="h-10 w-10 rounded-full border-2 border-neutral-700 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold">{discussion.title}</h3>
                          <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                            discussion.tagColor === "green" ? "bg-green-500/20 text-green-400" :
                            discussion.tagColor === "purple" ? "bg-purple-500/20 text-purple-400" :
                            "bg-green-500/20 text-green-400"
                          }`}>
                            {discussion.tag}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{discussion.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-neutral-500">
                            <span>{discussion.author}</span>
                            <span>•</span>
                            <span>{discussion.timeAgo}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-neutral-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{discussion.replies} réponses</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button 
                  onClick={() => info("Discussions", "Affichage de toutes les discussions...")}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:border-green-500 hover:bg-neutral-800"
                >
                  Voir toutes les discussions
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Rejoindre le Groupe */}
      {joinGroupModal && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Rejoindre le Groupe</h3>
                <p className="text-sm text-neutral-400">{joinGroupModal.city}, {joinGroupModal.country}</p>
              </div>
              <button
                className="text-neutral-400 transition-colors hover:text-white"
                onClick={() => setJoinGroupModal(null)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-neutral-400">{joinGroupModal.members} Membres</p>
                    <p className="text-sm text-neutral-400">{joinGroupModal.discussions} Discussions</p>
                  </div>
                  <div className="flex -space-x-2">
                    {joinGroupModal.memberAvatars.map((avatar, idx) => (
                      <img
                        key={idx}
                        src={avatar}
                        alt="Member"
                        className="h-8 w-8 rounded-full border-2 border-neutral-800"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-neutral-300">{joinGroupModal.description}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    success("Groupe rejoint", `Vous avez rejoint le groupe ${joinGroupModal.city}, ${joinGroupModal.country} !`);
                    setJoinGroupModal(null);
                  }}
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setJoinGroupModal(null)}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Voir le Groupe */}
      {viewGroupModal && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Groupe Pays</h3>
                <p className="text-sm text-neutral-400">{viewGroupModal.city}, {viewGroupModal.country}</p>
              </div>
              <button
                className="text-neutral-400 transition-colors hover:text-white"
                onClick={() => setViewGroupModal(null)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="relative h-48 rounded-lg overflow-hidden">
                <img
                  src={viewGroupModal.image}
                  alt={`${viewGroupModal.city}, ${viewGroupModal.country}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-neutral-400">{viewGroupModal.members} membres</p>
                    <p className="text-sm text-neutral-400">{viewGroupModal.discussions} discussions</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-300">
                  Rejoignez la communauté des expatriés à {viewGroupModal.city}, {viewGroupModal.country}. 
                  Partagez vos expériences, posez vos questions et connectez-vous avec d'autres membres.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    success("Groupe rejoint", `Vous avez rejoint le groupe ${viewGroupModal.city}, ${viewGroupModal.country} !`);
                    setViewGroupModal(null);
                  }}
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Rejoindre le Groupe
                </button>
                <button
                  onClick={() => setViewGroupModal(null)}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Lire le Guide */}
      {readGuideModal && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-xl my-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${
                  readGuideModal.iconColor === "green" ? "bg-green-500/20" :
                  readGuideModal.iconColor === "purple" ? "bg-purple-500/20" :
                  "bg-green-500/20"
                }`}>
                  {readGuideModal.icon === "document-dollar" && (
                    <svg className={`h-6 w-6 ${
                      readGuideModal.iconColor === "green" ? "text-green-400" :
                      readGuideModal.iconColor === "purple" ? "text-purple-400" :
                      "text-green-400"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {readGuideModal.icon === "house" && (
                    <svg className={`h-6 w-6 ${
                      readGuideModal.iconColor === "green" ? "text-green-400" :
                      readGuideModal.iconColor === "purple" ? "text-purple-400" :
                      "text-green-400"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )}
                  {readGuideModal.icon === "briefcase" && (
                    <svg className={`h-6 w-6 ${
                      readGuideModal.iconColor === "green" ? "text-green-400" :
                      readGuideModal.iconColor === "purple" ? "text-purple-400" :
                      "text-green-400"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{readGuideModal.title}</h3>
                  <p className="text-sm text-neutral-400">Par {readGuideModal.author}</p>
                </div>
              </div>
              <button
                className="text-neutral-400 transition-colors hover:text-white"
                onClick={() => setReadGuideModal(null)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                  <span>{readGuideModal.views} vues</span>
                  <span>{readGuideModal.saves} sauvegardes</span>
                </div>
                <div className="prose prose-invert max-w-none">
                  {readGuideModal.title === "Guide Fiscal Dubai" && (
                    <div className="text-neutral-300 leading-relaxed">
                      <p className="mb-4">
                        Ce guide complet vous accompagne dans toutes les démarches fiscales pour créer et gérer votre entreprise à Dubai. 
                        Vous y trouverez des informations détaillées sur :
                      </p>
                      <ul className="mt-4 space-y-2 list-disc list-inside text-neutral-400">
                        <li>Les différents types de structures d'entreprise (Free Zone, Mainland, etc.)</li>
                        <li>Les obligations fiscales et les avantages</li>
                        <li>Les procédures d'enregistrement</li>
                        <li>Les conseils pour optimiser votre fiscalité</li>
                      </ul>
                    </div>
                  )}
                  {readGuideModal.title === "Se Loger à Lisbonne" && (
                    <div className="text-neutral-300 leading-relaxed">
                      <p className="mb-4">
                        Découvrez tous les secrets pour trouver le logement idéal à Lisbonne en tant qu'expatrié. 
                        Ce guide couvre :
                      </p>
                      <ul className="mt-4 space-y-2 list-disc list-inside text-neutral-400">
                        <li>Les meilleurs quartiers pour expatriés</li>
                        <li>Les prix du marché immobilier</li>
                        <li>Les démarches administratives</li>
                        <li>Les pièges à éviter</li>
                      </ul>
                    </div>
                  )}
                  {readGuideModal.title === "Travailler à Bali" && (
                    <div className="text-neutral-300 leading-relaxed">
                      <p className="mb-4">
                        Tout ce que vous devez savoir pour travailler légalement à Bali en tant que nomade digital ou entrepreneur. 
                        Ce guide inclut :
                      </p>
                      <ul className="mt-4 space-y-2 list-disc list-inside text-neutral-400">
                        <li>Les différents types de visas de travail</li>
                        <li>Les opportunités d'emploi et de business</li>
                        <li>Les coûts de la vie</li>
                        <li>Les meilleures zones pour s'installer</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setReadGuideModal(null)}
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Créer un Groupe Pays */}
      {createGroupModal && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Créer un Groupe Pays</h3>
                <p className="text-sm text-neutral-400">Créez un nouveau groupe pour une destination</p>
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
                <label className="mb-2 block text-sm font-medium text-neutral-300">Ville</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Ex: Paris"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">Pays</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Ex: France"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">Description</label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Décrivez le groupe et sa destination..."
                />
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

