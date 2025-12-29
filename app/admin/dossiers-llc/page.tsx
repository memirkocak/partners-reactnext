"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useData } from "@/context/DataContext";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
};

type Dossier = {
  id: string;
  companyName: string;
  clientName: string;
  dossierNumber: string;
  createdDate: string;
  state: string | null;
  status: "EN COURS" | "COMPLÉTÉ" | "ACTION REQUISE";
  progress: number;
  totalSteps: number;
  tags: string[];
  plan: "Premium" | "Standard";
};

export default function DossiersLLCPage() {
  const router = useRouter();
  const { getUser, signOut } = useAuth();
  const { profile, fetchProfile } = useProfile();
  const data = useData();
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("Tout");
  const [sortBy, setSortBy] = useState("Plus récent");
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [statusMenuOpenId, setStatusMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const user = await getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const profileData = await fetchProfile(user.id);

      if (!profileData) {
        console.error("Error fetching profile");
        router.push("/login");
        return;
      }

      // Vérifier si l'utilisateur est admin
      if (profileData.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      // Charger les dossiers LLC depuis la base
      const { data: dossiersData, error: dossiersError } = await data.getAllDossiers();

      if (dossiersError) {
        console.error("Error fetching dossiers:", dossiersError);
        setDossiers([]);
        setLoading(false);
        return;
      }

      // Récupérer les IDs des étapes depuis llc_steps
      const { data: stepsData } = await data.getAllSteps();

      const totalSteps = stepsData?.length || 2; // Par défaut 2 étapes si aucune étape n'existe

      // Pour chaque dossier, charger les étapes complétées/validées
      const dossiersWithSteps = await Promise.all(
        (dossiersData || []).map(async (d) => {
          let completedSteps = 0;

          if (stepsData && stepsData.length > 0) {
            // Charger les statuts des étapes pour ce dossier
            const dossierStepsPromises = stepsData.map((step) =>
              data.getDossierStep(d.id, step.id)
            );
            const dossierStepsResults = await Promise.all(dossierStepsPromises);
            const dossierStepsData = dossierStepsResults
              .map((result) => result.data)
              .filter((step) => step !== null);

            if (dossierStepsData) {
              // Compter les étapes validées ou complètes
              completedSteps = dossierStepsData.filter(
                (ds) => ds.status === "validated" || ds.status === "complete"
              ).length;
            }
          }

          return {
            dossier: d,
            completedSteps,
          };
        })
      );

      const mapStatus = (status: string | null): Dossier["status"] => {
        switch (status) {
          case "accepte":
            return "COMPLÉTÉ";
          case "refuse":
            return "ACTION REQUISE";
          case "en_cours":
          default:
            return "EN COURS";
        }
      };

      const mapped: Dossier[] = dossiersWithSteps.map(({ dossier: d, completedSteps }) => {
        const dbStatus = (d as any).status;
        const statusLabel = mapStatus(dbStatus);
          const created = d.created_at ? new Date(d.created_at as string) : null;
          const createdDate = created
            ? created.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—";

          const baseTags: string[] = [];
        if (statusLabel === "COMPLÉTÉ") {
          baseTags.push("Dossier accepté");
        } else if (statusLabel === "ACTION REQUISE") {
          baseTags.push("Action requise");
        } else {
          // Pour les dossiers en cours, afficher un tag selon le nombre d'étapes validées
          if (completedSteps === totalSteps) {
            baseTags.push("Étapes complétées");
          } else if (completedSteps > 0) {
            baseTags.push("En traitement");
          } else {
            baseTags.push("À démarrer");
          }
        }

        // Si le dossier est accepté, toutes les étapes sont considérées comme complètes
        // Sinon, utiliser le nombre réel d'étapes complétées
        const finalCompletedSteps = dbStatus === "accepte" ? totalSteps : completedSteps;

          return {
            id: d.id,
            companyName: (d as any).llc_name || "Nom LLC non défini",
            clientName: `${(d as any).first_name || ""} ${(d as any).last_name || ""}`.trim() || "Client",
            dossierNumber: `#LLC-${d.id.slice(0, 8).toUpperCase()}`,
            createdDate,
            state: null,
            status: statusLabel,
          progress: finalCompletedSteps,
          totalSteps: totalSteps,
            tags: baseTags.length ? baseTags : ["Dossier"],
            plan: "Premium",
          };
      });

      setDossiers(mapped);
      setLoading(false);
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900">
        <p className="text-neutral-500">Chargement...</p>
      </div>
    );
  }

  const userName = profile?.full_name || profile?.email?.split("@")[0] || "Admin";

  const handleLogout = async () => {
    await signOut();
  };

  const filters = [
    "Tout",
    "En traitement",
    "Documents manquants",
    "En attente validation",
    "Complétés",
    "Cette semaine",
    "Par État",
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "EN COURS":
        return (
          <span className="inline-flex rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
            EN COURS
          </span>
        );
      case "COMPLÉTÉ":
        return (
          <span className="inline-flex rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
            COMPLÉTÉ
          </span>
        );
      case "ACTION REQUISE":
        return (
          <span className="inline-flex rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
            ACTION REQUISE
          </span>
        );
      default:
        return null;
    }
  };

  const getProgressColor = (status: string, progress: number, total: number) => {
    if (status === "ACTION REQUISE") return "bg-red-500";
    if (status === "COMPLÉTÉ") return "bg-green-500";
    if (progress / total >= 0.8) return "bg-green-500";
    return "bg-green-500";
  };

  const handleStatusChange = async (dossierId: string, newStatus: "EN COURS" | "COMPLÉTÉ" | "ACTION REQUISE") => {
    // Mapper vers les valeurs de la BDD
    const mapToDb = (s: typeof newStatus) => {
      if (s === "COMPLÉTÉ") return "accepte";
      if (s === "ACTION REQUISE") return "refuse";
      return "en_cours";
    };

    const mapped = mapToDb(newStatus);

    const { error } = await data.updateDossier(dossierId, { status: mapped as "en_cours" | "accepte" | "refuse" });

    if (error) {
      console.error("Erreur lors du changement de statut:", error);
      return;
    }

    // Met à jour le state local pour refléter immédiatement le changement
    setDossiers((prev) =>
      prev.map((d) => (d.id === dossierId ? { ...d, status: newStatus } : d))
    );
    setStatusMenuOpenId(null);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-900 text-white">
      {/* Left Sidebar */}
      <aside className="w-[280px] border-r border-neutral-800 bg-neutral-950">
        <div className="flex h-full flex-col p-6">
          {/* Logo */}
          <Logo variant="admin" />

          {/* MENU Section */}
          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              MENU
            </p>
            <nav className="space-y-1">
              <Link
                href="/admin"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                <span>Vue d&apos;ensemble</span>
              </Link>
              <Link
                href="/admin/gestion-clients"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Gestion Clients</span>
              </Link>
              <button className="flex w-full items-center gap-3 rounded-lg bg-green-500/20 px-3 py-2.5 text-left text-green-400 transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span className="font-medium">Dossiers LLC</span>
              </button>
              <Link
                href="/admin/facturation"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span>Facturation</span>
              </Link>
              <Link
                href="/admin/agents"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>Agents</span>
              </Link>
            </nav>
          </div>

          {/* OUTILS Section */}
          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              OUTILS
            </p>
            <nav className="space-y-1">
              <Link
                href="/admin/notifications"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span>Notifications</span>
              </Link>
              <Link
                href="/admin/rapports"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Rapports</span>
              </Link>
              <Link
                href="/admin/parametres"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
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

          {/* Footer */}
          <div className="mt-auto text-xs text-neutral-500">
            <p>© 2025 PARTNERS LLC</p>
            <p>Tous droits réservés</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b border-neutral-800 bg-neutral-950 px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher un dossier, une entreprise..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="text-neutral-400 hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>

              {/* Settings */}
              <button className="text-neutral-400 hover:text-white">
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
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
                <div>
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-neutral-400">Administrateur</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-md border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-300 transition-colors hover:border-red-500 hover:bg-red-500/10 hover:text-red-400"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-900 p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dossiers LLC</h1>
              <p className="mt-2 text-neutral-400">Suivre et gérer tous les dossiers de création de LLC</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filtres avancés
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Exporter
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                + Nouveau Dossier
              </button>
            </div>
          </div>

          {/* Summary Statistics Cards */}
          <div className="mb-8 grid grid-cols-5 gap-6">
            {/* Total Dossiers */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-neutral-400">Total Dossiers</span>
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">1,089</span>
                <div className="flex items-center gap-1 text-sm text-green-400">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  +1%
                </div>
              </div>
            </div>

            {/* En Traitement */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-neutral-400">En Traitement</span>
                <svg className="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">247</span>
                <span className="text-sm text-yellow-400">En cours</span>
              </div>
            </div>

            {/* Dossiers Complétés */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-neutral-400">Dossiers Complétés</span>
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">789</span>
                <span className="text-sm text-green-400">Terminés</span>
              </div>
            </div>

            {/* Action Requise */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-neutral-400">Action Requise</span>
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">53</span>
                <span className="text-sm text-red-400">Urgent</span>
              </div>
            </div>

            {/* Délai Moyen */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-neutral-400">Délai Moyen</span>
                <svg className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">14j</span>
                <span className="text-sm text-neutral-400">Moyenne</span>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filtres rapides</h2>
              <button className="text-sm text-neutral-400 hover:text-white">Réinitialiser</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedFilter === filter
                      ? "bg-white text-black"
                      : "bg-neutral-950 text-neutral-400 hover:bg-neutral-900"
                  }`}
                >
                  {filter === "Par État" && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Dossiers List */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Liste des Dossiers</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">Trier par:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                  >
                    <option>Plus récent</option>
                    <option>Plus ancien</option>
                    <option>Par statut</option>
                    <option>Par progression</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 hover:bg-neutral-800">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                  <button className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 hover:bg-neutral-800">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Dossiers Cards */}
            <div className="space-y-4">
              {dossiers.map((dossier) => (
                <div
                  key={dossier.id}
                  onClick={() => router.push(`/admin/dossier-llc/${dossier.id}`)}
                  className="cursor-pointer rounded-lg border border-neutral-800 bg-neutral-900 p-6 hover:bg-neutral-900/80"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="mb-1 text-lg font-semibold">{dossier.companyName}</h3>
                          <p className="text-sm text-neutral-400">{dossier.clientName}</p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
                            <span>{dossier.dossierNumber}</span>
                            <span>•</span>
                            <span>Créé le {dossier.createdDate}</span>
                            <span>•</span>
                            <span>{dossier.state}</span>
                          </div>
                        </div>
                        <div className="relative flex items-center gap-3">
                          <button
                            type="button"
                            className="flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatusMenuOpenId(
                                statusMenuOpenId === dossier.id ? null : dossier.id
                              );
                            }}
                          >
                            {getStatusBadge(dossier.status)}
                            <svg
                              className="h-4 w-4 text-neutral-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>

                          {statusMenuOpenId === dossier.id && (
                            <div className="absolute right-0 top-8 z-20 w-44 rounded-lg border border-neutral-800 bg-neutral-950 p-1 shadow-xl">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(dossier.id, "EN COURS")}
                                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800"
                              >
                                <span>En cours</span>
                                {dossier.status === "EN COURS" && (
                                  <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(dossier.id, "COMPLÉTÉ")}
                                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800"
                              >
                                <span>Accepté</span>
                                {dossier.status === "COMPLÉTÉ" && (
                                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(dossier.id, "ACTION REQUISE")}
                                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800"
                              >
                                <span>Refusé / À refaire</span>
                                {dossier.status === "ACTION REQUISE" && (
                                  <span className="h-2 w-2 rounded-full bg-red-400"></span>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-neutral-400">
                            {dossier.progress}/{dossier.totalSteps} étapes
                          </span>
                          <span className="font-medium">
                            {Math.round((dossier.progress / dossier.totalSteps) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                          <div
                            className={`h-full ${getProgressColor(
                              dossier.status,
                              dossier.progress,
                              dossier.totalSteps
                            )}`}
                            style={{ width: `${(dossier.progress / dossier.totalSteps) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {dossier.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400"
                          >
                            {tag}
                          </span>
                        ))}
                        <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                          {dossier.plan}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between border-t border-neutral-800 pt-6">
              <p className="text-sm text-neutral-400">
                Affichage de 1 à 5 sur 1,089 dossiers
              </p>
              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800">
                  &lt;
                </button>
                <button className="rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white">
                  1
                </button>
                <button className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800">
                  2
                </button>
                <button className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800">
                  3
                </button>
                <span className="px-2 text-sm text-neutral-400">...</span>
                <button className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800">
                  218
                </button>
                <button className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800">
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

