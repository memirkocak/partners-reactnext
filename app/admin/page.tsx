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

export default function AdminPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"mois" | "annee">("mois");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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
        router.push("/login");
        return;
      }

      // Vérifier si l'utilisateur est admin
      if (data.role !== "admin") {
        router.push("/dashboard");
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

  const userName = profile?.full_name || profile?.email?.split("@")[0] || "Admin";

  // Données du graphique (simulation)
  const chartData = [
    { date: "1 Nov", created: 3, completed: 2 },
    { date: "8 Nov", created: 5, completed: 4 },
    { date: "15 Nov", created: 7, completed: 5 },
    { date: "22 Nov", created: 6, completed: 6 },
    { date: "29 Nov", created: 8, completed: 7 },
    { date: "6 Déc", created: 9, completed: 8 },
    { date: "15 Déc", created: 10, completed: 9 },
  ];

  const maxValue = 15;
  const chartHeight = 200;
  const chartWidth = 600;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-900 text-white">
      {/* Left Sidebar */}
      <aside className="w-[280px] border-r border-neutral-800 bg-neutral-950">
        <div className="flex h-full flex-col p-6">
          {/* Logo */}
          <div className="mb-8">
            <div className="mb-2 text-xl font-bold">PARTNERS</div>
            <div className="text-sm text-neutral-400">BACK-OFFICE</div>
          </div>

          {/* MENU Section */}
          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              MENU
            </p>
            <nav className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-lg bg-green-500/20 px-3 py-2.5 text-left text-green-400 transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                <span className="font-medium">Vue d&apos;ensemble</span>
              </button>
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
              <Link
                href="/admin/dossiers-llc"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span>Dossiers LLC</span>
              </Link>
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
            </nav>
          </div>

          {/* OUTILS Section */}
          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              OUTILS
            </p>
            <nav className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span>Notifications</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Rapports</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white">
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
              </button>
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
              <input
                type="text"
                placeholder="Rechercher un client, un dossier..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
                <div>
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-neutral-400">Administrateur</p>
                </div>
              </div>

              {/* New Dossier Button */}
              <button className="rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600">
                + Nouveau Dossier
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-900 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Vue d&apos;ensemble</h1>
            <p className="mt-2 text-neutral-400">Bienvenue sur le tableau de bord administrateur.</p>
          </div>

          {/* Key Metrics Cards */}
          <div className="mb-8 grid grid-cols-4 gap-6">
            {/* Nouveaux Clients */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-neutral-400">Nouveaux Clients (20)</span>
                <svg className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">42</span>
                <span className="text-sm text-green-400">+15.2%</span>
              </div>
            </div>

            {/* Dossiers en Cours */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-neutral-400">Dossiers en Cours</span>
                <svg className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">128</span>
                <span className="text-sm text-orange-400">5 en attente</span>
              </div>
            </div>

            {/* Dossiers Terminés */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-neutral-400">Dossiers Terminés</span>
                <svg className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">893</span>
                <span className="text-sm text-green-400">+34 ce mois</span>
              </div>
            </div>

            {/* Revenus */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-neutral-400">Revenus (200)</span>
                <svg className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">€25.6K</span>
                <span className="text-sm text-green-400">+2.5%</span>
              </div>
            </div>
          </div>

          {/* Middle Section */}
          <div className="mb-8 grid grid-cols-12 gap-6">
            {/* Activité des Dossiers */}
            <div className="col-span-8 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Activité des Dossiers</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimeframe("mois")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      timeframe === "mois"
                        ? "bg-green-500 text-white"
                        : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                    }`}
                  >
                    Mois
                  </button>
                  <button
                    onClick={() => setTimeframe("annee")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      timeframe === "annee"
                        ? "bg-green-500 text-white"
                        : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                    }`}
                  >
                    Année
                  </button>
                </div>
              </div>

              {/* Chart */}
              <div className="relative">
                <svg width={chartWidth} height={chartHeight} className="w-full">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((val) => (
                    <line
                      key={val}
                      x1="0"
                      y1={chartHeight - (val / maxValue) * chartHeight}
                      x2={chartWidth}
                      y2={chartHeight - (val / maxValue) * chartHeight}
                      stroke="#262626"
                      strokeWidth={1}
                    />
                  ))}

                  {/* X-axis labels */}
                  {chartData.map((item, index) => {
                    const x = (index / (chartData.length - 1)) * chartWidth;
                    return (
                      <text
                        key={index}
                        x={x}
                        y={chartHeight + 20}
                        textAnchor="middle"
                        className="fill-neutral-400 text-xs"
                      >
                        {item.date}
                      </text>
                    );
                  })}

                  {/* Y-axis labels */}
                  {[0, 5, 10, 15].map((val) => (
                    <text
                      key={val}
                      x={-10}
                      y={chartHeight - (val / maxValue) * chartHeight + 4}
                      textAnchor="end"
                      className="fill-neutral-400 text-xs"
                    >
                      {val}
                    </text>
                  ))}

                  {/* Dossiers Créés line (teal/green) */}
                  <polyline
                    points={chartData
                      .map(
                        (item, index) =>
                          `${(index / (chartData.length - 1)) * chartWidth},${
                            chartHeight - (item.created / maxValue) * chartHeight
                          }`
                      )
                      .join(" ")}
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Dossiers Terminés line (dashed gray) */}
                  <polyline
                    points={chartData
                      .map(
                        (item, index) =>
                          `${(index / (chartData.length - 1)) * chartWidth},${
                            chartHeight - (item.completed / maxValue) * chartHeight
                          }`
                      )
                      .join(" ")}
                    fill="none"
                    stroke="#737373"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Points for Dossiers Créés */}
                  {chartData.map((item, index) => {
                    const x = (index / (chartData.length - 1)) * chartWidth;
                    const y = chartHeight - (item.created / maxValue) * chartHeight;
                    return (
                      <circle key={`created-${index}`} cx={x} cy={y} r={4} fill="#14b8a6" />
                    );
                  })}

                  {/* Points for Dossiers Terminés */}
                  {chartData.map((item, index) => {
                    const x = (index / (chartData.length - 1)) * chartWidth;
                    const y = chartHeight - (item.completed / maxValue) * chartHeight;
                    return (
                      <circle key={`completed-${index}`} cx={x} cy={y} r={4} fill="#737373" />
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                    <span className="text-sm text-neutral-400">Dossiers Créés</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-neutral-500"></div>
                    <span className="text-sm text-neutral-400">Dossiers Terminés</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tâches Prioritaires */}
            <div className="col-span-4 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Tâches Prioritaires</h2>
                <button className="text-sm text-green-400 hover:text-green-300">Voir tout</button>
              </div>

              <div className="space-y-4">
                {/* Task 1 */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-green-500 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Valider documents - J. Dupont</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                </div>

                {/* Task 2 */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-green-500 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Relance paiement - A. Martin</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                </div>

                {/* Task 3 */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-green-500 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Préparer rapport annuel</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-neutral-500"></div>
                </div>

                {/* Task 4 */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-green-500 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-500 line-through">
                      Obtenir FEIN pour Global Exports
                    </p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Dossiers Récents */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Dossiers Récents</h2>
              <button className="text-sm text-green-400 hover:text-green-300">Voir tout</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      CLIENT
                    </th>
                    <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      ENTREPRISE
                    </th>
                    <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      DATE CRÉATION
                    </th>
                    <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      STATUT
                    </th>
                    <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {/* Row 1 */}
                  <tr>
                    <td className="py-4 text-sm font-medium">Marc Leblanc</td>
                    <td className="py-4 text-sm text-neutral-400">Innovatech Solutions LLC</td>
                    <td className="py-4 text-sm text-neutral-400">15 Déc 2025</td>
                    <td className="py-4">
                      <span className="inline-flex rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                        TERMINÉ
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-neutral-400 hover:text-white">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr>
                    <td className="py-4 text-sm font-medium">Chloé Dubois</td>
                    <td className="py-4 text-sm text-neutral-400">CréaHub Digital LLC</td>
                    <td className="py-4 text-sm text-neutral-400">12 Déc 2025</td>
                    <td className="py-4">
                      <span className="inline-flex rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-400">
                        VALIDATION EN
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-neutral-400 hover:text-white">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr>
                    <td className="py-4 text-sm font-medium">Lucas Moreau</td>
                    <td className="py-4 text-sm text-neutral-400">Quantum Leap LLC</td>
                    <td className="py-4 text-sm text-neutral-400">10 Déc 2025</td>
                    <td className="py-4">
                      <span className="inline-flex rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                        DOC. EN ATTENTE
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-neutral-400 hover:text-white">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
