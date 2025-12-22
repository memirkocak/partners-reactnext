"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
};

export default function PartnersHubPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [createPostError, setCreatePostError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data);
      setLoading(false);
    }

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900">
        <p className="text-neutral-500">Chargement...</p>
      </div>
    );
  }

  const userName = profile?.full_name || profile?.email?.split("@")[0] || "Utilisateur";

  const handleOpenCreatePost = () => {
    setCreatePostError(null);
    setIsCreatePostOpen(true);
  };

  const handleCloseCreatePost = () => {
    if (creatingPost) return;
    setIsCreatePostOpen(false);
  };

  const handleCreatePostSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatePostError(null);
    setCreatingPost(true);

    // Ici on pourra connecter la création réelle d'une publication (Supabase) plus tard.
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsCreatePostOpen(false);
    } catch (error) {
      setCreatePostError("Une erreur est survenue lors de la création de la publication.");
    } finally {
      setCreatingPost(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-900 text-white">
      {/* Left Sidebar */}
      <aside className="w-[280px] border-r border-neutral-800 bg-neutral-950">
        <div className="flex h-full flex-col p-6">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold">PARTNERS</span>
          </div>

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
                className="flex items-center gap-3 rounded-lg bg-green-500/20 px-3 py-2.5 text-green-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5V4H2v16h5m10 0v-6a3 3 0 00-3-3H9a3 3 0 00-3 3v6m11 0H6"
                  />
                </svg>
                <span className="font-medium">PARTNERS Hub</span>
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
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
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
                placeholder="Q Rechercher dans le Hub..."
                className="mx-auto block w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Right Side - Company Selector, Notifications and Profile */}
            <div className="flex items-center gap-6">
              <button
                onClick={handleOpenCreatePost}
                className="rounded-lg bg-green-500 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-green-600"
              >
                + Créer une publication
              </button>
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
            {/* Left Column - Feed */}
            <div className="col-span-8 space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Bienvenue sur le PARTNERS Hub</h1>
                <p className="mt-2 text-sm text-neutral-400">
                  L&apos;espace d&apos;échange pour les entrepreneurs du réseau.
                </p>
              </div>

              {/* Event Card */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex gap-4">
                  <div className="h-32 w-48 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                    {/* Placeholder for event image */}
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                      Image événement
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-green-400">
                        Événement à venir
                      </span>
                      <button className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] font-medium text-neutral-300 hover:border-neutral-500">
                        S&apos;inscrire
                      </button>
                    </div>
                    <h2 className="text-sm font-semibold text-white">
                      Masterclass : Fiscalité US 2026
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-400">
                      Rejoignez notre expert, John Smith, pour une session exclusive sur les nouvelles règles
                      fiscales pour les non-résidents. Préparez votre année sereinement.
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-[11px] text-neutral-500">
                      <span>📅 28 Janvier 2026, 18:00 CET</span>
                      <span>•</span>
                      <span>En ligne</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post 1 */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-neutral-700"></div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Marie Dubois</p>
                        <p className="text-[11px] text-neutral-500">
                          Il y a 2 heures • Posté dans <span className="text-green-400">#marketing</span>
                        </p>
                      </div>
                      <button className="text-neutral-500 hover:text-white">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-neutral-200">
                      Bonjour à tous ! Est-ce que vous auriez des recommandations pour un bon outil de CRM
                      simple et efficace pour une activité de e-commerce qui démarre. Des suggestions ? Merci
                      d&apos;avance ! 🙌
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                      <button className="flex items-center gap-1 text-neutral-400 hover:text-white">
                        <span>👍</span>
                        <span>12</span>
                      </button>
                      <button className="flex items-center gap-1 text-neutral-400 hover:text-white">
                        <span>💬</span>
                        <span>8 Commentaires</span>
                      </button>
                      <button className="text-neutral-400 hover:text-white">Partager</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post 2 */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-neutral-700"></div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Thomas Leroy</p>
                        <p className="text-[11px] text-neutral-500">
                          Il y a 5 heures • Posté dans <span className="text-green-400">#général</span>
                        </p>
                      </div>
                      <button className="text-neutral-500 hover:text-white">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-neutral-200">
                      Je suis ravi de vous annoncer le lancement de mon SaaS après 8 mois de travail acharné !
                      Un grand merci à l&apos;équipe PARTNERS pour leur accompagnement au top durant la création de
                      la LLC. C&apos;est le début d&apos;une grande aventure ! 🚀
                    </p>
                    <div className="mt-3 rounded-lg bg-neutral-900 p-3">
                      <p className="text-xs font-medium text-neutral-100">LaunchFast.io</p>
                      <p className="mt-1 text-[11px] text-neutral-400">
                        La boîte à outils complète pour lancer et scaler vos projets SaaS plus rapidement.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                      <button className="flex items-center gap-1 text-neutral-400 hover:text-white">
                        <span>👍</span>
                        <span>42</span>
                      </button>
                      <button className="flex items-center gap-1 text-neutral-400 hover:text-white">
                        <span>💬</span>
                        <span>18 Commentaires</span>
                      </button>
                      <button className="text-neutral-400 hover:text-white">Partager</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Side Widgets */}
            <div className="col-span-4 space-y-4">
              {/* Membres dans le monde */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Membres dans le monde</h2>
                  <span className="text-[11px] text-neutral-500">+1 254 membres</span>
                </div>
                <div className="h-40 overflow-hidden rounded-lg bg-neutral-900">
                  {/* Placeholder for world map image */}
                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                    Carte du monde
                  </div>
                </div>
              </div>

              {/* Nouveaux membres */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <h2 className="mb-4 text-sm font-semibold">Nouveaux membres</h2>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-neutral-700"></div>
                      <div>
                        <p className="font-medium">Laura Martin</p>
                        <p className="text-[11px] text-neutral-500">Paris, France</p>
                      </div>
                    </div>
                    <button className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] font-medium text-neutral-200 hover:border-neutral-500">
                      Connecter
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-neutral-700"></div>
                      <div>
                        <p className="font-medium">Alexandra Petit</p>
                        <p className="text-[11px] text-neutral-500">Montréal, Canada</p>
                      </div>
                    </div>
                    <button className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] font-medium text-neutral-200 hover:border-neutral-500">
                      Connecter
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-neutral-700"></div>
                      <div>
                        <p className="font-medium">Chloé Bernard</p>
                        <p className="text-[11px] text-neutral-500">Bruxelles, Belgique</p>
                      </div>
                    </div>
                    <button className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] font-medium text-neutral-200 hover:border-neutral-500">
                      Connecter
                    </button>
                  </div>
                </div>
              </div>

              {/* Canaux populaires */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <h2 className="mb-3 text-sm font-semibold">Canaux populaires</h2>
                <div className="space-y-2 text-xs text-neutral-300">
                  <button className="flex w-full items-center justify-between rounded-md bg-neutral-900 px-3 py-2 text-left hover:bg-neutral-800">
                    <span># marketing</span>
                    <span className="text-[11px] text-neutral-500">254 membres</span>
                  </button>
                  <button className="flex w-full items-center justify-between rounded-md bg-neutral-900 px-3 py-2 text-left hover:bg-neutral-800">
                    <span># e-commerce</span>
                    <span className="text-[11px] text-neutral-500">198 membres</span>
                  </button>
                  <button className="flex w-full items-center justify-between rounded-md bg-neutral-900 px-3 py-2 text-left hover:bg-neutral-800">
                    <span># SaaS</span>
                    <span className="text-[11px] text-neutral-500">176 membres</span>
                  </button>
                  <button className="flex w-full items-center justify-between rounded-md bg-neutral-900 px-3 py-2 text-left hover:bg-neutral-800">
                    <span># investissement</span>
                    <span className="text-[11px] text-neutral-500">142 membres</span>
                  </button>
                  <button className="flex w-full items-center justify-between rounded-md bg-neutral-900 px-3 py-2 text-left hover:bg-neutral-800">
                    <span># freelancing</span>
                    <span className="text-[11px] text-neutral-500">96 membres</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Créer une publication */}
      {isCreatePostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Créer une publication</h2>
                <p className="mt-1 text-xs text-neutral-400">
                  Partagez une question, une ressource ou une mise à jour avec la communauté PARTNERS.
                </p>
              </div>
              <button
                onClick={handleCloseCreatePost}
                className="text-neutral-500 hover:text-neutral-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {createPostError && (
              <div className="mb-3 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {createPostError}
              </div>
            )}

            <form onSubmit={handleCreatePostSubmit} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-medium text-neutral-300">Titre</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Ex : Besoin de conseils sur la fiscalité US"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-medium text-neutral-300">Canal</label>
                <select
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  defaultValue="general"
                >
                  <option value="general"># général</option>
                  <option value="marketing"># marketing</option>
                  <option value="ecommerce"># e-commerce</option>
                  <option value="saas"># SaaS</option>
                  <option value="investissement"># investissement</option>
                </select>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-medium text-neutral-300">Contenu</label>
                <textarea
                  required
                  rows={4}
                  className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Écrivez votre message pour la communauté..."
                />
                <p className="mt-1 text-[11px] text-neutral-500">
                  Soyez clair et précis. Évitez de partager des informations sensibles (données bancaires,
                  identifiants, etc.).
                </p>
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseCreatePost}
                  disabled={creatingPost}
                  className="rounded-lg border border-neutral-700 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 disabled:opacity-60"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingPost}
                  className="rounded-lg bg-green-500 px-4 py-2 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-60"
                >
                  {creatingPost ? "Publication..." : "Publier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
