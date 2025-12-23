"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
};

type AssociateInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

export default function DossierLLCPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [step1Complete, setStep1Complete] = useState(false);
  const [isStep1ModalOpen, setIsStep1ModalOpen] = useState(false);
  const [submittingStep1, setSubmittingStep1] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [dossierStatus, setDossierStatus] = useState<"en_cours" | "accepte" | "refuse" | null>(null);
  const [dossierName, setDossierName] = useState<string | null>(null);
  const [step1Form, setStep1Form] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    llcName: string;
    associates: AssociateInput[];
  }>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    llcName: "",
    associates: [
      { firstName: "", lastName: "", email: "", phone: "", address: "" },
    ],
  });

  useEffect(() => {
    async function fetchProfileAndDossier() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      setProfile(profileData);

      // Charger le dossier existant pour ce user (si présent)
      const { data: dossierData, error: dossierError } = await supabase
        .from("llc_dossiers")
        .select("id, llc_name, status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!dossierError && dossierData) {
        setStep1Complete(true);
        setCurrentStep(2);
        setDossierStatus((dossierData as any).status ?? "en_cours");
        setDossierName((dossierData as any).llc_name || null);
      } else {
        setStep1Complete(false);
        setCurrentStep(1);
        setDossierStatus(null);
        setDossierName(null);
      }

      setLoading(false);
    }

    fetchProfileAndDossier();
  }, [router]);

  const handleStep1Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep1Error(null);

    if (!profile) {
      setStep1Error("Utilisateur non authentifié.");
      return;
    }

    const filledAssociates = step1Form.associates.filter(
      (a) =>
        a.firstName.trim() ||
        a.lastName.trim() ||
        a.email.trim() ||
        a.phone.trim() ||
        a.address.trim()
    );
    if (filledAssociates.length > 0) {
      const hasIncomplete = filledAssociates.some(
        (a) =>
          !a.firstName.trim() ||
          !a.lastName.trim() ||
          !a.email.trim() ||
          !a.phone.trim() ||
          !a.address.trim()
      );
      if (hasIncomplete) {
        setStep1Error("Tous les champs des associés sont obligatoires.");
        return;
      }
    }

    setSubmittingStep1(true);
    try {
      const dossierStructure = filledAssociates.length > 1 ? "Plusieurs associés" : "1 associé";

      const { data: dossier, error: dossierError } = await supabase
        .from("llc_dossiers")
        .upsert(
          {
            user_id: profile.id,
            first_name: step1Form.firstName.trim(),
            last_name: step1Form.lastName.trim(),
            email: step1Form.email.trim(),
            phone: step1Form.phone.trim(),
            address: step1Form.address.trim(),
            llc_name: step1Form.llcName.trim(),
            structure: dossierStructure,
            status: "en_cours",
          },
          { onConflict: "user_id" }
        )
        .select("id")
        .single();

      if (dossierError || !dossier?.id) {
        setStep1Error(dossierError?.message || "Impossible d'enregistrer le dossier.");
        return;
      }

      const dossierId = dossier.id;

      // Nettoie et réinsère les associés si nécessaire
      await supabase.from("llc_associates").delete().eq("dossier_id", dossierId);

      if (filledAssociates.length > 0) {
        const associatesPayload = filledAssociates.map((assoc) => ({
          dossier_id: dossierId,
          first_name: assoc.firstName.trim(),
          last_name: assoc.lastName.trim(),
          email: assoc.email.trim(),
          phone: assoc.phone.trim(),
          address: assoc.address.trim(),
        }));

        const { error: associatesError } = await supabase.from("llc_associates").insert(associatesPayload);
        if (associatesError) {
          setStep1Error(associatesError.message || "Erreur lors de l'enregistrement des associés.");
          return;
        }
      }

      setStep1Complete(true);
      setCurrentStep(2);
      setDossierStatus("en_cours");
      setDossierName(step1Form.llcName.trim());
      setIsStep1ModalOpen(false);
    } catch (err) {
      setStep1Error("Une erreur est survenue.");
    } finally {
      setSubmittingStep1(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900">
        <p className="text-neutral-500">Chargement...</p>
      </div>
    );
  }

  const userName = profile?.full_name || profile?.email?.split("@")[0] || "Utilisateur";

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
                <span>Tableau de bord</span>
              </Link>
              <Link
                href="/dossier-llc"
                className="flex items-center gap-3 rounded-lg bg-green-500/20 px-3 py-2.5 text-green-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span className="font-medium">Mon dossier LLC</span>
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
                <button className="text-neutral-400 transition-colors hover:text-white">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-900 p-8">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Steps */}
            <div className="col-span-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Création de votre LLC</h1>
                <p className="mt-2 text-neutral-400">
                  Suivez les étapes ci-dessous pour finaliser la création de votre entreprise.
                </p>
              </div>

              <div className="space-y-4">
                {/* Étape 1 */}
                <div
                  className={`rounded-xl bg-neutral-950 p-6 border ${
                    step1Complete ? "border-amber-400" : "border-neutral-800"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        step1Complete ? "bg-amber-500" : "bg-neutral-700"
                      }`}
                    >
                      <span className="text-sm font-semibold text-white">1</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Étape 1: Informations de base</h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            step1Complete
                              ? "bg-amber-500/20 text-amber-300 border border-amber-400/60"
                              : "bg-neutral-800 text-neutral-200"
                          }`}
                        >
                          {step1Complete ? "En cours de validation" : "À faire"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-neutral-400">
                        Renseignez vos informations pour lancer la création de votre LLC.
                      </p>
                      {!step1Complete && (
                        <button
                          className="mt-4 rounded-lg bg-green-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
                          onClick={() => setIsStep1ModalOpen(true)}
                        >
                          Continuer
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Étape 2 */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 border border-neutral-700">
                      <span className="text-sm font-semibold text-white">2</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Étape 2: Validation d&apos;identité</h3>
                        <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-200">
                          À faire
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-neutral-400">
                        Vérifiez votre identité (KYC). Disponible une fois l&apos;étape précédente validée.
                      </p>
                      <button
                        className="mt-4 rounded-lg bg-green-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
                        disabled={!step1Complete}
                      >
                        Continuer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Étape 3 - supprimée (non utilisée) */}
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="col-span-4 space-y-6">
              {/* Votre Dossier */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <h3 className="mb-2 text-lg font-semibold">Votre Dossier</h3>
                <p className="mb-1 text-sm font-medium">
                  {dossierName || "Aucun dossier créé pour le moment"}
                </p>
                <p className="mb-4 text-xs text-neutral-400">
                  Statut :{" "}
                  <span className="font-medium">
                    {dossierStatus === "accepte"
                      ? "Dossier accepté"
                      : dossierStatus === "refuse"
                      ? "Dossier refusé"
                      : step1Complete
                      ? "En cours de validation"
                      : "À faire"}
                  </span>
                </p>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Progression globale</span>
                    <span className="font-semibold">
                      {dossierStatus === "accepte"
                        ? "100%"
                        : step1Complete
                        ? "50%"
                        : "0%"}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className={`h-full rounded-full ${
                        dossierStatus === "refuse"
                          ? "bg-red-500"
                          : dossierStatus === "accepte"
                          ? "bg-green-500"
                          : "bg-amber-400"
                      }`}
                      style={{
                        width:
                          dossierStatus === "accepte"
                            ? "100%"
                            : step1Complete
                            ? "50%"
                            : "0%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Progression */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <h3 className="mb-4 text-lg font-semibold">Votre progression</h3>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Étape courante</span>
                  <span className="font-semibold">Étape {currentStep} / 2</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: step1Complete ? "100%" : "50%" }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  {step1Complete ? "50% complété" : "0% complété"}
                </p>
              </div>

              {/* Conseiller dédié */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <h3 className="mb-3 text-lg font-semibold">Conseiller dédié</h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
                  <div>
                    <p className="text-sm font-medium">Alex Johnson</p>
                    <p className="text-xs text-neutral-400">Spécialiste LLC</p>
                  </div>
                </div>
                <button className="mt-4 w-full rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600">
                  Programmer un appel
                </button>
              </div>

              {/* Ressources */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <h3 className="mb-3 text-lg font-semibold">Ressources utiles</h3>
                <ul className="space-y-2 text-sm text-neutral-400">
                  <li>
                    <a className="text-green-400 hover:underline" href="#">
                      Guide complet de création LLC
                    </a>
                  </li>
                  <li>
                    <a className="text-green-400 hover:underline" href="#">
                      Choisir l&apos;État optimal
                    </a>
                  </li>
                  <li>
                    <a className="text-green-400 hover:underline" href="#">
                      Checklist des documents
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {isStep1ModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Étape 1 : Informations de base</h3>
                    <p className="text-sm text-neutral-400">Renseignez les informations requises.</p>
                  </div>
                  <button
                    className="text-neutral-400 transition-colors hover:text-white"
                    onClick={() => setIsStep1ModalOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                <form className="space-y-4" onSubmit={handleStep1Submit}>
                  {step1Error && (
                    <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {step1Error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-300">Prénom</label>
                      <input
                        required
                        value={step1Form.firstName}
                        onChange={(e) => setStep1Form((prev) => ({ ...prev, firstName: e.target.value }))}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-300">Nom</label>
                      <input
                        required
                        value={step1Form.lastName}
                        onChange={(e) => setStep1Form((prev) => ({ ...prev, lastName: e.target.value }))}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-300">Email</label>
                      <input
                        type="email"
                        required
                        value={step1Form.email}
                        onChange={(e) => setStep1Form((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-300">Téléphone</label>
                      <input
                        required
                        value={step1Form.phone}
                        onChange={(e) => setStep1Form((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-neutral-300">Adresse</label>
                    <input
                      required
                      value={step1Form.address}
                      onChange={(e) => setStep1Form((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-neutral-300">Nom de la LLC souhaité</label>
                    <input
                      required
                      value={step1Form.llcName}
                      onChange={(e) => setStep1Form((prev) => ({ ...prev, llcName: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-white">Associés</p>
                    <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">Liste des associés</p>
                        <button
                          type="button"
                          className="text-sm font-medium text-green-400 hover:text-green-300"
                          onClick={() =>
                            setStep1Form((prev) => ({
                              ...prev,
                              associates: [
                                ...prev.associates,
                                {
                                  firstName: "",
                                  lastName: "",
                                  email: "",
                                  phone: "",
                                  address: "",
                                },
                              ],
                            }))
                          }
                        >
                          + Ajouter un associé
                        </button>
                      </div>
                      <div className="space-y-4">
                        {step1Form.associates.map((assoc, idx) => (
                          <div
                            key={idx}
                            className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-white">Associé {idx + 1}</p>
                              <button
                                type="button"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-300 transition-colors hover:border-red-500 hover:text-red-400"
                                onClick={() =>
                                  setStep1Form((prev) => {
                                    const updated = [...prev.associates];
                                    updated.splice(idx, 1);
                                    return { ...prev, associates: updated };
                                  })
                                }
                                aria-label={`Supprimer l'associé ${idx + 1}`}
                              >
                                ×
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-sm text-neutral-300">Prénom de l&apos;associé</label>
                                <input
                                  required
                                  value={assoc.firstName}
                                  onChange={(e) =>
                                    setStep1Form((prev) => {
                                      const updated = [...prev.associates];
                                      updated[idx] = { ...updated[idx], firstName: e.target.value };
                                      return { ...prev, associates: updated };
                                    })
                                  }
                                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm text-neutral-300">Nom de l&apos;associé</label>
                                <input
                                  required
                                  value={assoc.lastName}
                                  onChange={(e) =>
                                    setStep1Form((prev) => {
                                      const updated = [...prev.associates];
                                      updated[idx] = { ...updated[idx], lastName: e.target.value };
                                      return { ...prev, associates: updated };
                                    })
                                  }
                                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-sm text-neutral-300">Email de l&apos;associé</label>
                                <input
                                  type="email"
                                  required
                                  value={assoc.email}
                                  onChange={(e) =>
                                    setStep1Form((prev) => {
                                      const updated = [...prev.associates];
                                      updated[idx] = { ...updated[idx], email: e.target.value };
                                      return { ...prev, associates: updated };
                                    })
                                  }
                                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm text-neutral-300">Téléphone de l&apos;associé</label>
                                <input
                                  required
                                  value={assoc.phone}
                                  onChange={(e) =>
                                    setStep1Form((prev) => {
                                      const updated = [...prev.associates];
                                      updated[idx] = { ...updated[idx], phone: e.target.value };
                                      return { ...prev, associates: updated };
                                    })
                                  }
                                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm text-neutral-300">Adresse de l&apos;associé</label>
                              <input
                                required
                                value={assoc.address}
                                onChange={(e) =>
                                  setStep1Form((prev) => {
                                    const updated = [...prev.associates];
                                    updated[idx] = { ...updated[idx], address: e.target.value };
                                    return { ...prev, associates: updated };
                                  })
                                }
                                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-500"
                      onClick={() => setIsStep1ModalOpen(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submittingStep1}
                      className="rounded-lg bg-green-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
                    >
                      {submittingStep1 ? "Enregistrement..." : "Valider et passer à l'étape 2"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

