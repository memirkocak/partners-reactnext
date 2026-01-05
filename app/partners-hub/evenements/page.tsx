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

type LiveEvent = {
  id: string;
  title: string;
  description: string;
  speaker: string;
  speakerAvatar: string;
  tags: string[];
  viewers: number;
  startedAgo: string;
};

type UpcomingEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  speaker: string;
  speakerAvatar: string;
  tags: string[];
  registrants: number;
  icon: string;
};

type Replay = {
  id: string;
  title: string;
  speaker: string;
  speakerAvatar: string;
  views: string;
  duration: string;
  thumbnail: string;
};

export default function EvenementsPage() {
  const router = useRouter();
  const { user, getUser, signOut } = useAuth();
  const { profile, fetchProfile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [joinLiveModal, setJoinLiveModal] = useState<LiveEvent | null>(null);
  const [registerModal, setRegisterModal] = useState<UpcomingEvent | null>(null);
  const [watchReplayModal, setWatchReplayModal] = useState<Replay | null>(null);
  const { success } = useNotification();

  // Lives en direct
  const liveEvents: LiveEvent[] = [
    {
      id: "1",
      title: "Optimisation Fiscale LLC 2024",
      description: "Découvrez les stratégies fiscales essentielles pour maximiser vos déductions et optimiser votre structure LLC.",
      speaker: "Alexander Petit",
      speakerAvatar: "/api/placeholder/40/40",
      tags: ["Formation", "Expert"],
      viewers: 327,
      startedAgo: "il y a 24 min",
    },
    {
      id: "2",
      title: "Networking Session Entrepreneurs",
      description: "Rendez-vous de networking en direct pour connecter avec d'autres entrepreneurs et partager vos expériences.",
      speaker: "Sophie Martin",
      speakerAvatar: "/api/placeholder/40/40",
      tags: ["Networking", "Premium"],
      viewers: 189,
      startedAgo: "il y a 8 min",
    },
  ];

  // Événements à venir
  const upcomingEvents: UpcomingEvent[] = [
    {
      id: "1",
      title: "Compte Bancaire US pour Non-Résidents",
      description: "Guide complet pour ouvrir et gérer un compte bancaire professionnel aux États-Unis.",
      date: "18 Janvier 2024",
      time: "14:00 - 15:30 (CET)",
      speaker: "Thomas Leroy",
      speakerAvatar: "/api/placeholder/40/40",
      tags: ["Banque", "Live"],
      registrants: 124,
      icon: "globe",
    },
    {
      id: "2",
      title: "Stratégies E-commerce 2024",
      description: "Découvrez nos meilleures stratégies de vente en ligne pour boutiques en ligne.",
      date: "19 Janvier 2024",
      time: "16:00 - 18:00 (CET)",
      speaker: "Lucas Moreau",
      speakerAvatar: "/api/placeholder/40/40",
      tags: ["E-commerce", "Workshop"],
      registrants: 89,
      icon: "shopping",
    },
    {
      id: "3",
      title: "Marketing Digital : Les Fondamentaux",
      description: "Formation complète sur les bases du marketing digital pour entrepreneurs.",
      date: "20 Janvier 2024",
      time: "10:00 - 12:30 (CET)",
      speaker: "Camille Bernard",
      speakerAvatar: "/api/placeholder/40/40",
      tags: ["Marketing", "Formation"],
      registrants: 158,
      icon: "megaphone",
    },
    {
      id: "4",
      title: "Blockchain & Crypto pour Entrepreneurs",
      description: "Webinaire sur l'intégration de la blockchain dans votre business model.",
      date: "23 Janvier 2024",
      time: "15:00 - 17:00 (CET)",
      speaker: "Pierre Leblanc",
      speakerAvatar: "/api/placeholder/40/40",
      tags: ["Crypto", "Webinaire"],
      registrants: 87,
      icon: "blockchain",
    },
    {
      id: "5",
      title: "Investissement Immobilier US",
      description: "Networking exclusif avec des investisseurs immobiliers expérimentés.",
      date: "25 Janvier 2024",
      time: "18:30 - 20:00 (CET)",
      speaker: "Antoine Duval",
      speakerAvatar: "/api/placeholder/40/40",
      tags: ["Immobilier", "Formation"],
      registrants: 45,
      icon: "building",
    },
    {
      id: "6",
      title: "Création de Contenu Viral",
      description: "Webinaire sur les techniques de création de contenu qui engage sur les réseaux sociaux.",
      date: "28 Janvier 2024",
      time: "13:00 - 14:30 (CET)",
      speaker: "Léa Rousseau",
      speakerAvatar: "/api/placeholder/40/40",
      tags: ["Contenu", "Webinaire"],
      registrants: 203,
      icon: "video",
    },
  ];

  // Replays populaires
  const popularReplays: Replay[] = [
    {
      id: "1",
      title: "Les Fondamentaux de la LLC",
      speaker: "Alexander Petit",
      speakerAvatar: "/api/placeholder/40/40",
      views: "5.2k vues",
      duration: "1h 30min",
      thumbnail: "/api/placeholder/300/200",
    },
    {
      id: "2",
      title: "Growth Hacking Avancé",
      speaker: "Camille Bernard",
      speakerAvatar: "/api/placeholder/40/40",
      views: "3.8k vues",
      duration: "1h 15min",
      thumbnail: "/api/placeholder/300/200",
    },
    {
      id: "3",
      title: "Business Model Excel",
      speaker: "Sophie Martin",
      speakerAvatar: "/api/placeholder/40/40",
      views: "2.1k vues",
      duration: "45min",
      thumbnail: "/api/placeholder/300/200",
    },
    {
      id: "4",
      title: "Conformité Légale Startup",
      speaker: "Thomas Leroy",
      speakerAvatar: "/api/placeholder/40/40",
      views: "1.5k vues",
      duration: "1h 05min",
      thumbnail: "/api/placeholder/300/200",
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
      case "globe":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "shopping":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case "megaphone":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
      case "blockchain":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case "building":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case "video":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Dates avec événements pour le calendrier
  const eventDates = [18, 20, 25, 28];

  // Générer le calendrier pour janvier 2024
  const generateCalendar = () => {
    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const daysInMonth = 31;

    return (
      <div>
        <div className="grid grid-cols-7 gap-0.5 mb-1.5">
          {days.map((day) => (
            <div key={day} className="text-center text-[10px] font-semibold text-neutral-500 py-0.5">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
            <div
              key={day}
              className={`h-6 rounded flex items-center justify-center text-[10px] ${
                eventDates.includes(day)
                  ? "bg-green-500/20 text-green-400 font-semibold"
                  : "text-neutral-400 hover:bg-neutral-800"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    );
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
                className="flex items-center gap-3 rounded-lg bg-green-500/20 px-3 py-2.5 text-green-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-medium">Événements & Lives</span>
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
                  placeholder="Rechercher événements, webinaires, lives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="ml-4 flex items-center gap-3">
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
              <h1 className="text-3xl lg:text-4xl font-bold">Événements & Lives</h1>
              <p className="mt-2 text-sm lg:text-base text-neutral-400">
                Participer à nos webinaires exclusifs, formations en direct et événements de networking.
              </p>
            </div>

            {/* En Direct Maintenant */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-lg font-semibold text-red-400">En Direct Maintenant</span>
                </div>
                <span className="text-sm text-neutral-400">{liveEvents.length} lives actifs</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {liveEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border-2 border-red-500 bg-neutral-950 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="rounded-lg bg-red-500 px-3 py-1 text-xs font-bold text-white">
                            EN DIRECT
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {event.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg bg-neutral-800 px-2 py-1 text-xs text-neutral-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                        <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{event.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-red-400">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-semibold">{event.viewers}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={event.speakerAvatar}
                          alt={event.speaker}
                          className="h-8 w-8 rounded-full border border-neutral-700"
                        />
                        <span className="text-sm text-neutral-300">{event.speaker}</span>
                      </div>
                      <span className="text-xs text-neutral-500">Commencé {event.startedAgo}</span>
                    </div>
                    <button
                      onClick={() => setJoinLiveModal(event)}
                      className="w-full rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Rejoindre le Live
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {["all", "webinaires", "formations", "networking", "replays"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? "bg-green-500/20 text-green-400"
                      : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800"
                  }`}
                >
                  {filter === "all" ? "Tous" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
              <select className="ml-auto rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500">
                <option>Date</option>
                <option>Plus récents</option>
                <option>Plus anciens</option>
              </select>
            </div>

            {/* Événements à Venir */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-semibold">Événements à Venir</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="rounded-lg bg-green-500/20 p-3 text-green-400">
                          {getIconSVG(event.icon, "h-6 w-6")}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {event.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="rounded-lg bg-neutral-800 px-2 py-1 text-xs text-neutral-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                          <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{event.description}</p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                          <img
                            src={event.speakerAvatar}
                            alt={event.speaker}
                            className="h-6 w-6 rounded-full border border-neutral-700"
                          />
                          <span>{event.speaker}</span>
                        </div>
                        <div className="text-sm text-neutral-500">
                          {event.registrants} inscrits
                        </div>
                      </div>
                      <button
                        onClick={() => setRegisterModal(event)}
                        className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                      >
                        S'inscrire
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Replays Populaires */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl lg:text-2xl font-semibold">Replays Populaires</h2>
                <button 
                  onClick={() => {
                    success("Information", "Tous les replays seront bientôt disponibles !");
                  }}
                  className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  Voir tous les replays
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularReplays.map((replay) => (
                  <div
                    key={replay.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden cursor-pointer group"
                    onClick={() => setWatchReplayModal(replay)}
                  >
                    <div className="relative h-40 bg-neutral-900">
                      <img
                        src={replay.thumbnail}
                        alt={replay.title}
                        className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-white/20 backdrop-blur-sm p-4">
                          <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold mb-2 line-clamp-2">{replay.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={replay.speakerAvatar}
                          alt={replay.speaker}
                          className="h-6 w-6 rounded-full border border-neutral-700"
                        />
                        <span className="text-xs text-neutral-400">{replay.speaker}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>{replay.views}</span>
                        <span>{replay.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendrier du Mois */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-semibold">Calendrier du Mois</h2>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold">Janvier 2024</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        success("Navigation", "Mois précédent");
                      }}
                      className="rounded-lg border border-neutral-700 bg-neutral-900 p-1.5 text-neutral-400 hover:text-white transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => {
                        success("Navigation", "Mois suivant");
                      }}
                      className="rounded-lg border border-neutral-700 bg-neutral-900 p-1.5 text-neutral-400 hover:text-white transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                {generateCalendar()}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Rejoindre le Live */}
      {joinLiveModal && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-lg font-semibold text-red-400">EN DIRECT</span>
                </div>
                <h3 className="text-xl font-semibold">{joinLiveModal.title}</h3>
                <p className="text-sm text-neutral-400">{joinLiveModal.speaker}</p>
              </div>
              <button
                className="text-neutral-400 transition-colors hover:text-white"
                onClick={() => setJoinLiveModal(null)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <p className="text-sm text-neutral-300 mb-4">{joinLiveModal.description}</p>
                <div className="flex items-center gap-4 text-sm text-neutral-400">
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span>{joinLiveModal.viewers} spectateurs</span>
                  </div>
                  <span>Commencé {joinLiveModal.startedAgo}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    success("Live rejoint", `Vous rejoignez le live "${joinLiveModal.title}" !`);
                    setJoinLiveModal(null);
                  }}
                  className="flex-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Rejoindre le Live
                </button>
                <button
                  onClick={() => setJoinLiveModal(null)}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal S'inscrire */}
      {registerModal && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">S'inscrire à l'événement</h3>
                <p className="text-sm text-neutral-400">{registerModal.title}</p>
              </div>
              <button
                className="text-neutral-400 transition-colors hover:text-white"
                onClick={() => setRegisterModal(null)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{registerModal.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{registerModal.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <img
                      src={registerModal.speakerAvatar}
                      alt={registerModal.speaker}
                      className="h-6 w-6 rounded-full border border-neutral-700"
                    />
                    <span>{registerModal.speaker}</span>
                  </div>
                  <p className="text-sm text-neutral-300 mt-3">{registerModal.description}</p>
                  <p className="text-sm text-neutral-500">{registerModal.registrants} personnes déjà inscrites</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    success("Inscription confirmée", `Vous êtes inscrit à l'événement "${registerModal.title}" !`);
                    setRegisterModal(null);
                  }}
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Confirmer l'inscription
                </button>
                <button
                  onClick={() => setRegisterModal(null)}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Regarder le Replay */}
      {watchReplayModal && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Replay</h3>
                <p className="text-sm text-neutral-400">{watchReplayModal.title}</p>
              </div>
              <button
                className="text-neutral-400 transition-colors hover:text-white"
                onClick={() => setWatchReplayModal(null)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="relative h-64 bg-neutral-900 rounded-lg overflow-hidden">
                <img
                  src={watchReplayModal.thumbnail}
                  alt={watchReplayModal.title}
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-white/20 backdrop-blur-sm p-6 cursor-pointer hover:bg-white/30 transition-colors">
                    <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={watchReplayModal.speakerAvatar}
                    alt={watchReplayModal.speaker}
                    className="h-10 w-10 rounded-full border-2 border-neutral-700"
                  />
                  <div>
                    <p className="font-semibold">{watchReplayModal.speaker}</p>
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span>{watchReplayModal.views}</span>
                      <span>{watchReplayModal.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    success("Replay lancé", `Lecture du replay "${watchReplayModal.title}" !`);
                    setWatchReplayModal(null);
                  }}
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Regarder
                </button>
                <button
                  onClick={() => setWatchReplayModal(null)}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

