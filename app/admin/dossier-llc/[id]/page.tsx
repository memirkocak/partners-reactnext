'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Logo } from '@/components/Logo';

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
};

type Dossier = {
  id: string;
  llc_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  structure: string | null;
  status: string | null;
  created_at: string | null;
};

type Associate = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export default function DossierLLCDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const dossierId = typeof params?.id === 'string' ? params.id : undefined;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dossierId) return;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', user.id)
        .single();

      if (profileError || !currentProfile || currentProfile.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setProfile(currentProfile as Profile);

      const { data: dossierData, error: dossierError } = await supabase
        .from('llc_dossiers')
        .select('id, llc_name, first_name, last_name, email, phone, address, structure, status, created_at')
        .eq('id', dossierId)
        .maybeSingle();

      if (dossierError || !dossierData) {
        setLoading(false);
        return;
      }

      const typedDossier = dossierData as Dossier;
      setDossier(typedDossier);

      const { data: assocData, error: assocError } = await supabase
        .from('llc_associates')
        .select('id, first_name, last_name, email, phone, address')
        .eq('dossier_id', typedDossier.id);

      if (!assocError && assocData) {
        setAssociates(assocData as Associate[]);
      }

      setLoading(false);
    }

    load();
  }, [dossierId, router]);

  const getStepState = (index: number): 'A_FAIRE' | 'TERMINEE' | 'REFUSEE' => {
    if (!dossier) return 'A_FAIRE';

    const status = dossier.status;

    // Étape 1 : toujours considérée comme faite si le dossier existe
    if (index === 1) {
      return 'TERMINEE';
    }

    if (status === 'accepte') return 'TERMINEE';
    if (status === 'refuse') return 'REFUSEE';
    return 'A_FAIRE';
  };

  const renderStepBadge = (state: 'A_FAIRE' | 'TERMINEE' | 'REFUSEE') => {
    if (state === 'TERMINEE') {
      return (
        <span className="inline-flex items-center rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
          Terminée
        </span>
      );
    }
    if (state === 'REFUSEE') {
      return (
        <span className="inline-flex items-center rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
          Refusée
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-300">
        À faire
      </span>
    );
  };

  const getProgress = () => {
    if (!dossier) return { done: 0, total: 2 };
    const total = 2;
    let done = 0;
    if (dossier.status === 'en_cours') done = 1;
    if (dossier.status === 'accepte') done = 2;
    if (dossier.status === 'refuse') done = 1;
    return { done, total };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-white">
        Chargement...
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="flex min-h-screen flex-col bg-neutral-900 text-white">
        <div className="mx-auto mt-24 max-w-md text-center">
          <p className="mb-4 text-lg font-semibold">Dossier introuvable.</p>
          <button
            onClick={() => router.push('/admin/dossiers-llc')}
            className="mt-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
          >
            Retour aux dossiers
          </button>
        </div>
      </div>
    );
  }

  const { done, total } = getProgress();

  return (
    <div className="flex min-h-screen bg-neutral-900 text-white">
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 p-6 lg:flex">
        <Logo variant="admin" />
        <nav className="mt-6 space-y-1">
          <Link
            href="/admin"
            className="block rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            Tableau de bord
          </Link>
          <Link
            href="/admin/dossiers-llc"
            className="block rounded-lg bg-green-500/20 px-3 py-2 text-sm text-green-400"
          >
            Dossiers LLC
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-y-auto p-8">
        <header className="mb-6 flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">{dossier.llc_name || 'LLC'}</h1>
            <p className="mt-1 text-sm text-neutral-300">
              {dossier.first_name} {dossier.last_name} • {dossier.email}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              #{dossier.id.slice(0, 8).toUpperCase()} •{' '}
              {dossier.created_at
                ? new Date(dossier.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Date inconnue'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-medium">
              {dossier.status === 'accepte'
                ? 'Dossier accepté'
                : dossier.status === 'refuse'
                ? 'Dossier à revoir'
                : 'En cours de validation'}
            </span>
          </div>
        </header>

        {/* Global progress */}
        <section className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-neutral-400">
              {done}/{total} étapes complétées
            </span>
            <span className="font-medium">
              {Math.round((done / total) * 100)}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
        </section>

        {/* Steps detail */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Étapes du dossier</h2>

          {/* Étape 1 */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-semibold">
                1
              </div>
              <div>
                <p className="font-semibold">Étape 1 : Informations de base</p>
                <p className="text-xs text-neutral-400">
                  Coordonnées du client et nom de la LLC.
                </p>
              </div>
            </div>
            {renderStepBadge(getStepState(1))}
          </div>

          {/* Étape 2 */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold">
                2
              </div>
              <div>
                <p className="font-semibold">Étape 2 : Vérification d&apos;identité</p>
                <p className="text-xs text-neutral-400">
                  Contrôle et validation des documents d&apos;identité.
                </p>
              </div>
            </div>
            {renderStepBadge(getStepState(2))}
          </div>
        </section>

        {/* Informations complètes du dossier */}
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="mb-4 text-lg font-semibold">Informations du client</h2>
            <dl className="space-y-2 text-sm text-neutral-300">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Prénom</dt>
                <dd>{dossier.first_name || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Nom</dt>
                <dd>{dossier.last_name || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Email</dt>
                <dd>{dossier.email || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Téléphone</dt>
                <dd>{dossier.phone || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Adresse</dt>
                <dd className="text-right">{dossier.address || '-'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="mb-4 text-lg font-semibold">Détails de la LLC</h2>
            <dl className="space-y-2 text-sm text-neutral-300">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Nom de la LLC</dt>
                <dd className="text-right">{dossier.llc_name || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Structure</dt>
                <dd className="text-right">{dossier.structure || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Statut interne</dt>
                <dd className="text-right">{dossier.status || '-'}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Associates */}
        {associates.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Associés</h2>
            <div className="space-y-3">
              {associates.map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"
                >
                  <p className="font-medium">
                    {a.first_name} {a.last_name}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {a.email && <span>{a.email}</span>}
                    {a.phone && <span> • {a.phone}</span>}
                    {a.address && <span> • {a.address}</span>}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}


