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

export default function DashboardPage() {
  const router = useRouter();
  const { user, getUser, signOut } = useAuth();
  const { profile, fetchProfile } = useProfile();
  const data = useData();
  const [loading, setLoading] = useState(true);
  const [dossierStatus, setDossierStatus] = useState<"en_cours" | "accepte" | "refuse" | null>(null);
  const [dossierComplete, setDossierComplete] = useState(false);
  const [dossierId, setDossierId] = useState<string | null>(null);
  const [step1Status, setStep1Status] = useState<"complete" | "validated" | null>(null);
  const [step2Status, setStep2Status] = useState<"complete" | "validated" | null>(null);
  const [totalSteps, setTotalSteps] = useState(4); // 4 étapes : Informations de base, Documents d'identité, Enregistrement, Obtention EIN
  const [completedStepsCount, setCompletedStepsCount] = useState(0);
  const [step1CompletedAt, setStep1CompletedAt] = useState<string | null>(null);
  const [step2CompletedAt, setStep2CompletedAt] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut();
  };

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

      // Si l'utilisateur est admin, rediriger vers /admin
      if (profileData.role === "admin") {
        router.push("/admin");
        return;
      }

      // Charger le statut du dossier LLC pour ce user
      const dossier = await data.getDossierByUserId(currentUser.id);

      if (!isMounted) return;

      if (dossier) {
        setDossierId(dossier.id);
        const dossierStatusValue = dossier.status ?? "en_cours";
        setDossierStatus(dossierStatusValue);
        
        // Charger toutes les étapes disponibles pour le rôle "user"
        const { data: allSteps } = await data.getAllSteps("user");
        const totalStepsCount = allSteps?.length || 2;
        setTotalSteps(totalStepsCount);

        // Si le dossier est accepté, toutes les étapes sont considérées comme validées (y compris l'enregistrement)
        if (dossierStatusValue === "accepte") {
          setStep1Status("validated");
          setStep2Status("validated");
          // 3 étapes complétées : step1, step2, et enregistrement (EIN en cours)
          setCompletedStepsCount(3);
          // Utiliser created_at comme date de complétion si accepté
          setStep1CompletedAt(dossier.created_at || null);
          setStep2CompletedAt(dossier.created_at || null);
        } else {
          // Charger les statuts des étapes 1 et 2
          const { data: step1Info } = await data.getStepByNumber(1);
          const { data: step2Info } = await data.getStepByNumber(2);

          let step1StatusValue: "complete" | "validated" | null = null;
          let step2StatusValue: "complete" | "validated" | null = null;
          let step1Date: string | null = null;
          let step2Date: string | null = null;
          let completedCount = 0;

          if (step1Info?.id) {
            const { data: step1Data } = await data.getDossierStep(dossier.id, step1Info.id);
            if (step1Data) {
              if (step1Data.status === "validated" || step1Data.status === "complete") {
                step1StatusValue = step1Data.status as "complete" | "validated";
                completedCount++;
              }
              step1Date = step1Data.completed_at || step1Data.created_at || null;
            }
          }

          if (step2Info?.id) {
            const { data: step2Data } = await data.getDossierStep(dossier.id, step2Info.id);
            if (step2Data) {
              if (step2Data.status === "validated" || step2Data.status === "complete") {
                step2StatusValue = step2Data.status as "complete" | "validated";
                completedCount++;
              }
              step2Date = step2Data.completed_at || step2Data.created_at || null;
            }
          }

          if (!isMounted) return;

          setStep1Status(step1StatusValue);
          setStep2Status(step2StatusValue);
          setStep1CompletedAt(step1Date);
          setStep2CompletedAt(step2Date);
          setCompletedStepsCount(completedCount);
        }
        
        // Vérifier si le dossier est complet (step1 rempli + step2 validé)
        const hasStep1 = !!(dossier.first_name && dossier.last_name && dossier.email && dossier.phone && dossier.address && dossier.llc_name);
        const hasStep2 = !!(dossier.identity_verified === true);
        setDossierComplete(hasStep1 && hasStep2);
      } else {
        setDossierStatus(null);
        setDossierComplete(false);
        setStep1Status(null);
        setStep2Status(null);
        setCompletedStepsCount(0);
        setTotalSteps(4); // 4 étapes : Informations de base, Documents d'identité, Enregistrement, Obtention EIN
      }

      setLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900">
        <p className="text-neutral-500">Chargement...</p>
      </div>
    );
  }

  const userName = profile?.full_name || profile?.email?.split("@")[0] || "Utilisateur";
  const firstName = userName.split(" ")[0];

  // Progression dynamique basée sur les données réelles de la BDD
  // Si le dossier est accepté, progression à 100%
  const progressPercent = dossierStatus === "accepte" 
    ? 100
    : totalSteps > 0 
    ? Math.round((completedStepsCount / totalSteps) * 100) 
    : 0;
  
  // Statuts des étapes basés sur les données réelles
  // Si le dossier est accepté, toutes les étapes sont validées
  const baseStepStatus: "À faire" | "En cours" | "Validé" = 
    dossierStatus === "accepte" ? "Validé"
    : step1Status === "validated" ? "Validé" 
    : step1Status === "complete" ? "En cours"
    : "À faire";
  
  const docsStepStatus: "À faire" | "En cours" | "Validé" = 
    dossierStatus === "accepte" ? "Validé"
    : step2Status === "validated" ? "Validé"
    : step2Status === "complete" ? "En cours"
    : "À faire";

  // Formater les dates pour l'affichage
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-900 text-white">
      {/* Left Sidebar */}
      <aside className="w-[280px] border-r border-neutral-800 bg-neutral-950">
        <div className="flex h-full flex-col p-6">
          {/* Logo */}
          <Logo variant="sidebar" />

          {/* MENU Section */}
          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              MENU
            </p>
            <nav className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg bg-green-500/20 px-3 py-2.5 text-green-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="font-medium">Tableau de bord</span>
              </Link>
              <Link
                href="/dossier-llc"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span>Mon dossier LLC</span>
              </Link>
              <Link
                href="/documents"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Documents</span>
              </Link>
              <Link
                href="/mon-entreprise"
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
                <span>Mon entreprise</span>
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
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <span>PARTNERS Hub</span>
              </Link>
              <Link
                href="/formation"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span>Formation</span>
              </Link>
            </nav>
          </div>

          {/* SUPPORT Section */}
          <div className="mb-6 border-t border-neutral-800 pt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              SUPPORT
            </p>
            <nav className="space-y-1">
              <Link
                href="/support"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span>Support</span>
              </Link>
              <Link
                href="/parametres"
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
          <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <p className="mb-1 text-sm font-semibold">Besoin d&apos;aide ?</p>
            <p className="mb-4 text-xs leading-relaxed text-neutral-400">
              Contactez votre conseiller dédié pour toute question.
            </p>
            <button className="w-full rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600">
              Contacter
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b border-neutral-800 bg-neutral-950 px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Search Bar - Centered */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Q Rechercher dans votre dossier..."
                className="mx-auto block w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Right Side - Notifications and Profile */}
            <div className="flex items-center gap-6">
              <button className="text-neutral-400 transition-colors hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
                <div>
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-neutral-400">Client Premium</p>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Bonjour, {firstName} 👋
            </h1>
            <p className="mt-2 text-neutral-400">
              Voici le récapitulatif de la création de votre LLC.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Progression Widget - Left */}
            <div className="col-span-8 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Création de votre LLC</h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Suivez l&apos;avancement de votre dossier étape par étape.
                  </p>
                </div>
                <span className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                  dossierStatus === "accepte"
                    ? "bg-green-500/20 text-green-300 border border-green-500/50"
                    : dossierStatus === "refuse"
                    ? "bg-red-500/20 text-red-300 border border-red-500/50"
                    : dossierStatus === "en_cours"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                    : "bg-neutral-800 text-neutral-400"
                }`}>
                  {dossierStatus === "accepte"
                    ? "✅ Dossier accepté par l'admin"
                    : dossierStatus === "refuse"
                    ? "❌ Dossier refusé"
                    : dossierStatus === "en_cours"
                    ? "En cours"
                    : "À démarrer"}
                </span>
              </div>

              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Progression globale</span>
                  <span className="font-semibold">
                    {dossierStatus === "accepte" 
                      ? `${totalSteps} / ${totalSteps} étapes (100%)`
                      : `${completedStepsCount} / ${totalSteps} étapes (${progressPercent}%)`}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      dossierStatus === "refuse"
                        ? "bg-red-500"
                        : dossierStatus === "accepte"
                        ? "bg-green-500"
                        : completedStepsCount > 0
                        ? "bg-amber-400"
                        : "bg-neutral-700"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {/* Informations de base */}
                <div className={`rounded-lg border p-4 ${
                  baseStepStatus === "Validé" 
                    ? "border-green-500/40 bg-green-500/10"
                    : baseStepStatus === "En cours"
                    ? "border-amber-500/40 bg-amber-500/10"
                    : "border-neutral-700/40 bg-neutral-800/10"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">
                      Informations de base
                    </span>
                    {baseStepStatus === "Validé" && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-neutral-400">
                    {baseStepStatus === "Validé" && step1CompletedAt
                      ? `Complété le ${formatDate(step1CompletedAt)}`
                      : baseStepStatus === "En cours"
                      ? "En cours de validation"
                      : "Coordonnées et nom de la LLC à saisir."}
                  </p>
                </div>

                {/* Documents d'identité */}
                <div className={`rounded-lg border p-4 ${
                  docsStepStatus === "Validé"
                    ? "border-green-500/40 bg-green-500/10"
                    : docsStepStatus === "En cours"
                    ? "border-amber-500/40 bg-amber-500/10"
                    : "border-neutral-700/40 bg-neutral-800/10"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">
                      Documents d&apos;identité
                    </span>
                    {docsStepStatus === "Validé" && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-neutral-400">
                    {docsStepStatus === "Validé" && step2CompletedAt
                      ? `Complété le ${formatDate(step2CompletedAt)}`
                      : docsStepStatus === "En cours"
                      ? "En cours de validation"
                      : "Pièces d'identité à téléverser."}
                  </p>
                </div>

                {/* Enregistrement */}
                <div className={`rounded-lg border p-4 ${
                  dossierStatus === "accepte"
                    ? "border-green-500/40 bg-green-500/10"
                    : "border-amber-500/40 bg-amber-500/10"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">
                      Enregistrement
                    </span>
                    {dossierStatus === "accepte" ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-neutral-400">
                    {dossierStatus === "accepte"
                      ? "Dossier enregistré et validé"
                      : "En attente de validation par l'admin"}
                  </p>
                </div>

                {/* Obtention EIN */}
                <div className={`rounded-lg border p-4 ${
                  dossierStatus === "accepte"
                    ? "border-amber-500/40 bg-amber-500/10"
                    : "border-neutral-700/40 bg-neutral-800/10"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">
                      Obtention EIN
                    </span>
                    {dossierStatus === "accepte" ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-neutral-400"></div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-neutral-400">
                    {dossierStatus === "accepte"
                      ? "En cours de traitement"
                      : "À venir après l'enregistrement"}
                  </p>
                </div>
              </div>

              {/* Bouton Voir mes documents - affiché uniquement si le dossier est accepté */}
              {dossierStatus === "accepte" && (
                <div className="mt-6">
                  <Link
                    href="/documents"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Voir mes documents
                  </Link>
                </div>
              )}
            </div>

            {/* Right Sidebar Widgets */}
            <div className="col-span-4 space-y-6">
              {/* Conseiller */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <h3 className="mb-4 text-sm font-semibold">Votre conseiller</h3>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                  <div>
                    <p className="font-medium">Sophie Martin</p>
                    <p className="text-xs text-neutral-400">Spécialiste LLC</p>
                  </div>
                </div>
              </div>

              {/* Achievement estimé */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <h3 className="mb-3 text-sm font-semibold">Achèvement estimé</h3>
                {dossierStatus === "accepte" ? (
                  <>
                    <p className="text-3xl font-bold text-green-400">48h</p>
                    <p className="mt-2 text-xs text-green-300/90">Délai estimé en jours ouvrables</p>
                    <p className="mt-1 text-xs text-neutral-400">Le traitement final dépend du secrétaire d'État et peut varier selon leur charge de travail. Vous serez notifié dès réception de vos documents officiels.</p>
                  </>
                ) : dossierComplete ? (
                  <>
                    <p className="text-3xl font-bold">72h</p>
                    <p className="mt-2 text-xs text-neutral-400">Temps estimé de traitement</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium text-neutral-300">En cours</p>
                    <p className="mt-2 text-xs text-neutral-400">Votre dossier est en cours de finalisation</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-12 gap-6">
            {/* Timeline Widget */}
            <div className="col-span-12 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <h3 className="mb-6 text-xl font-semibold">Timeline détaillée</h3>
              <div className="space-y-6">
                {/* Étape 1 - Informations de base */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      dossierStatus === "accepte" || step1Status === "validated" || step1Status === "complete"
                        ? "bg-green-500"
                        : "bg-neutral-700"
                    }`}>
                      {(dossierStatus === "accepte" || step1Status === "validated" || step1Status === "complete") ? (
                        <svg
                          className="h-5 w-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full bg-neutral-400"></div>
                      )}
                    </div>
                    <div className="mt-2 h-16 w-0.5 bg-neutral-800"></div>
                  </div>
                  <div className="flex-1 pb-2">
                    <h4 className="font-semibold">Informations de base</h4>
                    <p className="mt-1 text-sm text-neutral-400">
                      {dossierStatus === "accepte"
                        ? "Dossier accepté et validé par l'administrateur."
                        : step1Status === "validated" && step1CompletedAt
                        ? `Complété le ${formatDate(step1CompletedAt)}`
                        : step1Status === "complete"
                        ? "En cours de validation par notre équipe."
                        : "Coordonnées et nom de la LLC à saisir."}
                    </p>
                  </div>
                </div>

                {/* Étape 2 - Documents d'identité */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      dossierStatus === "accepte" || step2Status === "validated" || step2Status === "complete"
                        ? "bg-green-500"
                        : step1Status === "validated" || step1Status === "complete"
                        ? "bg-yellow-500"
                        : "bg-neutral-700"
                    }`}>
                      {(dossierStatus === "accepte" || step2Status === "validated" || step2Status === "complete") ? (
                        <svg
                          className="h-5 w-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (step1Status === "validated" || step1Status === "complete") ? (
                        <svg
                          className="h-5 w-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full bg-neutral-400"></div>
                      )}
                    </div>
                    <div className="mt-2 h-16 w-0.5 bg-neutral-800"></div>
                  </div>
                  <div className="flex-1 pb-2">
                    <h4 className="font-semibold">Documents d&apos;identité</h4>
                    <p className="mt-1 text-sm text-neutral-400">
                      {dossierStatus === "accepte"
                        ? "Dossier accepté et validé par l'administrateur."
                        : step2Status === "validated" && step2CompletedAt
                        ? `Complété le ${formatDate(step2CompletedAt)}`
                        : step2Status === "complete"
                        ? "En cours de validation par notre équipe."
                        : step1Status === "validated" || step1Status === "complete"
                        ? "Pièces d'identité à téléverser."
                        : "À venir après la saisie des informations de base."}
                    </p>
                  </div>
                </div>

                {/* Étape 3 - Enregistrement */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      dossierStatus === "accepte"
                        ? "bg-green-500"
                        : (step2Status === "validated" || step2Status === "complete")
                        ? "bg-amber-500"
                        : "bg-neutral-700"
                    }`}>
                      {dossierStatus === "accepte" ? (
                        <svg
                          className="h-5 w-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (step2Status === "validated" || step2Status === "complete") ? (
                        <svg
                          className="h-5 w-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full bg-neutral-400"></div>
                      )}
                    </div>
                    <div className="mt-2 h-16 w-0.5 bg-neutral-800"></div>
                  </div>
                  <div className="flex-1 pb-2">
                    <h4 className="font-semibold">Enregistrement</h4>
                    <p className="mt-1 text-sm text-neutral-400">
                      {dossierStatus === "accepte"
                        ? "Dossier enregistré et validé par l'administrateur."
                        : (step2Status === "validated" || step2Status === "complete")
                        ? "En attente de validation par l'administrateur."
                        : "Cette étape sera automatiquement validée une fois le dossier accepté."}
                    </p>
                  </div>
                </div>

                {/* Étape suivante - Dépôt au New Mexico (si les 2 premières sont validées ou dossier accepté) */}
                {(dossierStatus === "accepte" || (step1Status === "validated" && step2Status === "validated")) && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        dossierStatus === "accepte" ? "bg-green-500" : "bg-yellow-500"
                      }`}>
                        {dossierStatus === "accepte" ? (
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="mt-2 h-16 w-0.5 bg-neutral-800"></div>
                    </div>
                    <div className="flex-1 pb-2">
                      <h4 className="font-semibold">Dépôt au New Mexico</h4>
                      <p className="mt-1 text-sm text-neutral-400">
                        {dossierStatus === "accepte"
                          ? "Certificate of Formation en cours de traitement."
                          : "En attente de validation par l'administrateur."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Étape 5 - Obtention EIN */}
                {(dossierStatus === "accepte" || (step1Status === "validated" && step2Status === "validated")) && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        dossierStatus === "accepte"
                          ? "bg-amber-500"
                          : "bg-neutral-700"
                      }`}>
                        {dossierStatus === "accepte" ? (
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        ) : (
                          <div className="h-2.5 w-2.5 rounded-full bg-neutral-400"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 pb-2">
                      <h4 className="font-semibold">Obtention EIN</h4>
                      <p className="mt-1 text-sm text-neutral-400">
                        {dossierStatus === "accepte"
                          ? "En cours de traitement par notre équipe."
                          : "Cette étape sera disponible après le dépôt au New Mexico."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
