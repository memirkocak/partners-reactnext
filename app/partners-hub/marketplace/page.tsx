"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ContactButton } from "@/components/ui/ContactButton";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
};

type Service = {
  id: string;
  title: string;
  category: string;
  price: string;
  description: string;
  provider: {
    name: string;
    avatar: string;
    rating: number;
    evaluations: number;
  };
  duration: string;
  image: string;
  totalEvaluations?: number;
};

type Provider = {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  servicesCount: number;
  views: number;
};

export default function MarketplacePage() {
  const router = useRouter();
  const { user, getUser, signOut } = useAuth();
  const { profile, fetchProfile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Services en vedette
  const featuredServices: Service[] = [
    {
      id: "1",
      title: "Stratégie Marketing Complète",
      category: "Marketing",
      price: "À partir de 500€",
      description: "Élaboration d'une stratégie marketing sur-mesure pour votre entreprise avec un plan d'action détaillé.",
      provider: {
        name: "Camille Bernard",
        avatar: "/api/placeholder/40/40",
        rating: 4.9,
        evaluations: 87,
      },
      duration: "2-3 semaines",
      image: "/api/placeholder/400/250",
      totalEvaluations: 47,
    },
    {
      id: "2",
      title: "Développement Web sur-mesure",
      category: "Développement",
      price: "À partir de 2000€",
      description: "Création de sites web et applications professionnelles avec les dernières technologies.",
      provider: {
        name: "Lucas Moreau",
        avatar: "/api/placeholder/40/40",
        rating: 4.8,
        evaluations: 104,
      },
      duration: "4-6 semaines",
      image: "/api/placeholder/400/250",
      totalEvaluations: 67,
    },
    {
      id: "3",
      title: "Identité Visuelle Complète",
      category: "Design",
      price: "À partir de 800€",
      description: "Création de votre identité de marque : logo, charte graphique, supports de communication.",
      provider: {
        name: "Léa Rousseau",
        avatar: "/api/placeholder/40/40",
        rating: 4.9,
        evaluations: 84,
      },
      duration: "3-5 semaines",
      image: "/api/placeholder/400/250",
      totalEvaluations: 54,
    },
  ];

  // Tous les services
  const allServices: Service[] = [
    {
      id: "4",
      title: "Gestion Réseaux Sociaux",
      category: "Marketing",
      price: "À partir de 300€",
      description: "Gestion complète de vos réseaux sociaux avec contenu et stratégie.",
      provider: {
        name: "Sophie Martin",
        avatar: "/api/placeholder/40/40",
        rating: 4.7,
        evaluations: 56,
      },
      duration: "Mensuel",
      image: "/api/placeholder/300/200",
    },
    {
      id: "5",
      title: "Conseil Juridique LLC",
      category: "Juridique",
      price: "À partir de 150€",
      description: "Conseil juridique spécialisé pour la création et gestion de LLC.",
      provider: {
        name: "Thomas Leroy",
        avatar: "/api/placeholder/40/40",
        rating: 4.9,
        evaluations: 92,
      },
      duration: "À la demande",
      image: "/api/placeholder/300/200",
    },
    {
      id: "6",
      title: "Production Vidéo Pro",
      category: "Vidéo",
      price: "À partir de 1200€",
      description: "Production vidéo professionnelle pour votre entreprise.",
      provider: {
        name: "Florian Lefebvre",
        avatar: "/api/placeholder/40/40",
        rating: 4.8,
        evaluations: 73,
      },
      duration: "1-2 semaines",
      image: "/api/placeholder/300/200",
    },
    {
      id: "7",
      title: "Audit Business Complet",
      category: "Consulting",
      price: "À partir de 1000€",
      description: "Audit complet de votre business avec recommandations stratégiques.",
      provider: {
        name: "Alexandre Petit",
        avatar: "/api/placeholder/40/40",
        rating: 4.9,
        evaluations: 118,
      },
      duration: "2-4 semaines",
      image: "/api/placeholder/300/200",
    },
    {
      id: "8",
      title: "Rédaction Web SEO",
      category: "Rédaction",
      price: "À partir de 50€",
      description: "Rédaction de contenu web optimisé SEO pour votre site.",
      provider: {
        name: "Martin Dubois",
        avatar: "/api/placeholder/40/40",
        rating: 4.6,
        evaluations: 45,
      },
      duration: "Par article",
      image: "/api/placeholder/300/200",
    },
    {
      id: "9",
      title: "Gestion Comptable LLC",
      category: "Comptabilité",
      price: "À partir de 200€",
      description: "Gestion comptable complète pour votre LLC aux États-Unis.",
      provider: {
        name: "Jessica Girard",
        avatar: "/api/placeholder/40/40",
        rating: 4.8,
        evaluations: 67,
      },
      duration: "Mensuel",
      image: "/api/placeholder/300/200",
    },
    {
      id: "10",
      title: "Shooting Photo Produits",
      category: "Photo",
      price: "À partir de 400€",
      description: "Photographie professionnelle de vos produits pour e-commerce.",
      provider: {
        name: "Julien Mendes",
        avatar: "/api/placeholder/40/40",
        rating: 4.7,
        evaluations: 52,
      },
      duration: "1 jour",
      image: "/api/placeholder/300/200",
    },
    {
      id: "11",
      title: "Traduction Professionnelle",
      category: "Traduction",
      price: "À partir de 80€",
      description: "Traduction professionnelle multilingue pour vos documents.",
      provider: {
        name: "Claire Fontaine",
        avatar: "/api/placeholder/40/40",
        rating: 4.9,
        evaluations: 89,
      },
      duration: "Par document",
      image: "/api/placeholder/300/200",
    },
  ];

  // Prestataires top notés
  const topProviders: Provider[] = [
    {
      id: "1",
      name: "Camille Bernard",
      title: "Expert Marketing",
      avatar: "/api/placeholder/80/80",
      rating: 4.9,
      servicesCount: 12,
      views: 1240,
    },
    {
      id: "2",
      name: "Lucas Moreau",
      title: "Développeur Full Stack",
      avatar: "/api/placeholder/80/80",
      rating: 4.8,
      servicesCount: 8,
      views: 1890,
    },
    {
      id: "3",
      name: "Léa Rousseau",
      title: "Designer UI/UX",
      avatar: "/api/placeholder/80/80",
      rating: 5.0,
      servicesCount: 15,
      views: 2100,
    },
    {
      id: "4",
      name: "Alexandre Petit",
      title: "Consultant Business",
      avatar: "/api/placeholder/80/80",
      rating: 4.9,
      servicesCount: 10,
      views: 1560,
    },
    {
      id: "5",
      name: "Thomas Leroy",
      title: "Avocat d'affaires",
      avatar: "/api/placeholder/80/80",
      rating: 4.8,
      servicesCount: 6,
      views: 980,
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

  // Filtrer les services
  const filteredServices = allServices.filter((service) => {
    const matchesCategory = selectedCategory === "all" || service.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.provider.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["all", "Marketing", "Design", "Développement", "Consulting", "Juridique"];

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

          {/* Search Bar in Sidebar */}
          <div className="mb-6 mt-6">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher services, prestataires, catégories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
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
                className="flex items-center gap-3 rounded-lg bg-green-500/20 px-3 py-2.5 text-green-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span className="font-medium">Marketplace</span>
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
            {/* Marketplace Header */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">Marketplace</h1>
              <p className="mt-2 text-sm lg:text-base text-neutral-400">
                Découvre et propose des services entre membres de la communauté PARTNERS
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Services Audits</p>
                    <p className="text-2xl font-bold">247</p>
                    <p className="text-xs text-green-400 mt-1">+10%</p>
                  </div>
                  <div className="rounded-lg bg-green-500/20 p-3">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Prestataires</p>
                    <p className="text-2xl font-bold">1,842</p>
                    <p className="text-xs text-green-400 mt-1">+8%</p>
                  </div>
                  <div className="rounded-lg bg-blue-500/20 p-3">
                    <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Collaborations</p>
                    <p className="text-2xl font-bold">3,156</p>
                    <p className="text-xs text-green-400 mt-1">+14%</p>
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
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-green-500/20 text-green-400"
                      : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800"
                  }`}
                >
                  {category === "all" ? "Tous les Services" : category}
                </button>
              ))}
              <button className="ml-auto flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Proposer un Service
              </button>
            </div>

            {/* Services en Vedette */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl lg:text-2xl font-semibold">Services en Vedette</h2>
                <button className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors">
                  Voir tous
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredServices.map((service) => (
                  <div
                    key={service.id}
                    className="group rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden transition-all hover:shadow-lg hover:shadow-green-500/10"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="rounded-lg bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                          {service.category}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="rounded-lg bg-neutral-900/90 px-3 py-1 text-sm font-semibold text-white">
                          {service.price}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                      <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{service.description}</p>
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={service.provider.avatar}
                          alt={service.provider.name}
                          className="h-10 w-10 rounded-full border-2 border-neutral-700"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{service.provider.name}</p>
                          <div className="flex items-center gap-1">
                            <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm text-neutral-300">{service.provider.rating}</span>
                            <span className="text-xs text-neutral-500">({service.provider.evaluations} évaluations)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {service.duration}
                        </div>
                        {service.totalEvaluations && (
                          <span className="text-sm text-neutral-400">{service.totalEvaluations} évaluations</span>
                        )}
                      </div>
                      <button className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
                        Voir le Service
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tous les Services */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl lg:text-2xl font-semibold">Tous les Services</h2>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="recent">Plus récents</option>
                  <option value="rating">Meilleures notes</option>
                  <option value="price-low">Prix croissant</option>
                  <option value="price-high">Prix décroissant</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="group rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden transition-all hover:shadow-lg hover:shadow-green-500/10"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="rounded-lg bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                          {service.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-bold mb-2 line-clamp-2">{service.title}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <img
                          src={service.provider.avatar}
                          alt={service.provider.name}
                          className="h-8 w-8 rounded-full border border-neutral-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{service.provider.name}</p>
                          <div className="flex items-center gap-1">
                            <svg className="h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs text-neutral-300">{service.provider.rating}</span>
                          </div>
                        </div>
                      </div>
                      <button className="w-full rounded-lg border border-green-500 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20">
                        Voir Détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <button className="rounded-lg border border-neutral-700 bg-neutral-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:border-green-500 hover:bg-neutral-800">
                  Charger plus de services
                </button>
              </div>
            </div>

            {/* Prestataires Top Notés */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-semibold">Prestataires Top Notés</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {topProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-center"
                  >
                    <img
                      src={provider.avatar}
                      alt={provider.name}
                      className="h-20 w-20 rounded-full border-2 border-neutral-700 mx-auto mb-4"
                    />
                    <h3 className="font-bold mb-1">{provider.name}</h3>
                    <p className="text-sm text-neutral-400 mb-3">{provider.title}</p>
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-semibold">{provider.rating}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mb-4">
                      {provider.servicesCount} services • {provider.views} vues
                    </p>
                    <button className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
                      Voir Profil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

