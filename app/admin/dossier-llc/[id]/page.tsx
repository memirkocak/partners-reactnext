'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useData } from '@/context/DataContext';

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

type DossierStep = {
  id: string;
  dossier_id: string;
  step_id: string;
  status: string;
  content: {
    client?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      llcName: string;
      structure: string;
    };
    associates?: Array<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
    }>;
  } | string[] | null; // Peut être un objet (step1) ou un tableau de strings (step2 images)
  completed_at: string | null;
};

export default function DossierLLCDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const dossierId = typeof params?.id === 'string' ? params.id : undefined;
  const { getUser, signOut } = useAuth();
  const { profile, fetchProfile } = useProfile();
  const data = useData();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [dossierStep1, setDossierStep1] = useState<DossierStep | null>(null);
  const [dossierStep2, setDossierStep2] = useState<DossierStep | null>(null);
  const [step2Images, setStep2Images] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dossierId) return;

    async function load() {
      const user = await getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const currentProfile = await fetchProfile(user.id);

      if (!currentProfile || currentProfile.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      const { data: dossierData, error: dossierError } = await data.getDossierById(dossierId);

      if (dossierError || !dossierData) {
        setLoading(false);
        return;
      }

      const typedDossier = dossierData as Dossier;
      setDossier(typedDossier);

      // Récupérer les IDs des étapes 1 et 2
      const { data: step1Info } = await data.getStepByNumber(1);

      const { data: step2Info } = await data.getStepByNumber(2);

      // Charger l'étape 1
      if (step1Info?.id) {
        const { data: step1Data } = await data.getDossierStep(typedDossier.id, step1Info.id);

        if (step1Data) {
          setDossierStep1(step1Data as DossierStep);
          
          // Utiliser les données depuis llc_dossier_steps pour les associés
          const step1Content = step1Data.content && typeof step1Data.content === 'object' && !Array.isArray(step1Data.content) ? step1Data.content : null;
          if (step1Content?.associates && step1Content.associates.length > 0) {
            const associatesFromStep = step1Content.associates.map((assoc: any, index: number) => ({
              id: `step-assoc-${index}`,
              first_name: assoc.firstName,
              last_name: assoc.lastName,
              email: assoc.email,
              phone: assoc.phone,
              address: assoc.address,
            }));
            setAssociates(associatesFromStep);
          }
        }
      }

      // Charger l'étape 2
      if (step2Info?.id) {
        const { data: step2Data } = await data.getDossierStep(typedDossier.id, step2Info.id);

        if (step2Data) {
          setDossierStep2(step2Data as DossierStep);

          // Charger les images depuis le content de l'étape 2
          // Le content peut être un objet avec une propriété "images" ou directement un tableau
          let images: string[] = [];
          
          if (step2Data.content) {
            if (Array.isArray(step2Data.content)) {
              images = step2Data.content as string[];
            } else if (typeof step2Data.content === 'object' && 'images' in step2Data.content) {
              const contentObj = step2Data.content as any;
              if (Array.isArray(contentObj.images)) {
                images = contentObj.images;
              }
            }
          }

          if (images.length > 0) {
            setStep2Images(images);
          } else {
            // Fallback : charger depuis llc_identity_images
            const { data: imagesData } = await data.getIdentityImagesByDossierId(typedDossier.id);

            if (imagesData && imagesData.length > 0) {
              setStep2Images(imagesData.map((img: any) => img.image_url));
            }
          }
        } else {
          // Fallback : charger depuis llc_identity_images même si pas de dossier_steps
          const { data: imagesData } = await data.getIdentityImagesByDossierId(typedDossier.id);

          if (imagesData && imagesData.length > 0) {
            setStep2Images(imagesData.map((img: any) => img.image_url));
          }
        }
      }

      // Fallback pour les associés si pas trouvé dans step1
      if (associates.length === 0) {
        const { data: assocData } = await data.getAssociatesByDossierId(typedDossier.id);

        if (assocData) {
          setAssociates(assocData as Associate[]);
        }
      }

      setLoading(false);
    }

    load();
  }, [dossierId, router, getUser, fetchProfile, data]);

  const getStepState = (index: number): 'A_FAIRE' | 'TERMINEE' | 'EN_COURS' => {
    if (!dossier) return 'A_FAIRE';

    // Étape 1 : vérifier depuis llc_dossier_steps
    if (index === 1) {
      if (dossierStep1) {
        if (dossierStep1.status === 'validated') return 'TERMINEE';
        if (dossierStep1.status === 'complete') return 'EN_COURS';
      }
      return 'A_FAIRE';
    }

    // Étape 2 : vérifier depuis llc_dossier_steps
    if (index === 2) {
      if (dossierStep2) {
        if (dossierStep2.status === 'validated') return 'TERMINEE';
        if (dossierStep2.status === 'complete') return 'EN_COURS';
      }
      // Si le dossier est accepté, considérer l'étape 2 comme terminée
      if (dossier.status === 'accepte') return 'TERMINEE';
      return 'A_FAIRE';
    }

    return 'A_FAIRE';
  };

  const renderStepBadge = (state: 'A_FAIRE' | 'TERMINEE' | 'EN_COURS') => {
    if (state === 'TERMINEE') {
      return (
        <span className="inline-flex items-center rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400 border border-green-500/60">
          ✓ Validée
        </span>
      );
    }
    if (state === 'EN_COURS') {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400 border border-amber-500/60">
          En cours
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-300">
        À faire
      </span>
    );
  };

  // Helper pour accéder au content de l'étape 1 de manière sécurisée
  const getStep1Content = () => {
    if (!dossierStep1?.content) return null;
    if (typeof dossierStep1.content === 'object' && !Array.isArray(dossierStep1.content)) {
      return dossierStep1.content;
    }
    return null;
  };

  const getProgress = () => {
    if (!dossier) return { done: 0, total: 2 };
    const total = 2;
    let done = 0;
    
    // Compter les étapes validées
    if (dossierStep1 && (dossierStep1.status === 'validated' || dossierStep1.status === 'complete')) {
      done++;
    }
    if (dossierStep2 && (dossierStep2.status === 'validated' || dossierStep2.status === 'complete')) {
      done++;
    }
    
    // Si le dossier est accepté, considérer toutes les étapes comme terminées
    if (dossier.status === 'accepte') {
      done = total;
    }
    
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
        <div className="mt-auto pt-6">
          <button
            onClick={async () => await signOut()}
            className="w-full rounded-md border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-300 transition-colors hover:border-red-500 hover:bg-red-500/10 hover:text-red-400"
          >
            Se déconnecter
          </button>
        </div>
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
          <div className={`flex items-center justify-between rounded-xl border p-4 ${
            getStepState(1) === 'TERMINEE' 
              ? 'border-green-500/50 bg-green-500/5' 
              : getStepState(1) === 'EN_COURS'
              ? 'border-amber-500/50 bg-amber-500/5'
              : 'border-neutral-800 bg-neutral-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ${
                getStepState(1) === 'TERMINEE'
                  ? 'bg-green-500 border-2 border-green-400'
                  : getStepState(1) === 'EN_COURS'
                  ? 'bg-amber-500'
                  : 'bg-neutral-700'
              }`}>
                {getStepState(1) === 'TERMINEE' ? '✓' : '1'}
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
          <div className={`flex items-center justify-between rounded-xl border p-4 ${
            getStepState(2) === 'TERMINEE' 
              ? 'border-green-500/50 bg-green-500/5' 
              : getStepState(2) === 'EN_COURS'
              ? 'border-amber-500/50 bg-amber-500/5'
              : 'border-neutral-800 bg-neutral-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ${
                getStepState(2) === 'TERMINEE'
                  ? 'bg-green-500 border-2 border-green-400'
                  : getStepState(2) === 'EN_COURS'
                  ? 'bg-amber-500'
                  : 'bg-neutral-700'
              }`}>
                {getStepState(2) === 'TERMINEE' ? '✓' : '2'}
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

          {/* Images de l'étape 2 */}
          {step2Images.length > 0 && (
            <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <h3 className="mb-4 text-lg font-semibold">Documents d&apos;identité (Étape 2)</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {step2Images.map((imageUrl, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                    <img
                      src={imageUrl}
                      alt={`Document d'identité ${index + 1}`}
                      className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-xs text-white">Document {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Informations complètes du dossier */}
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="mb-4 text-lg font-semibold">Informations du client</h2>
            <dl className="space-y-2 text-sm text-neutral-300">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Prénom</dt>
                <dd>{getStep1Content()?.client?.firstName || dossier.first_name || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Nom</dt>
                <dd>{getStep1Content()?.client?.lastName || dossier.last_name || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Email</dt>
                <dd>{getStep1Content()?.client?.email || dossier.email || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Téléphone</dt>
                <dd>{getStep1Content()?.client?.phone || dossier.phone || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Adresse</dt>
                <dd className="text-right">{getStep1Content()?.client?.address || dossier.address || '-'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="mb-4 text-lg font-semibold">Détails de la LLC</h2>
            <dl className="space-y-2 text-sm text-neutral-300">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Nom de la LLC</dt>
                <dd className="text-right">{getStep1Content()?.client?.llcName || dossier.llc_name || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Structure</dt>
                <dd className="text-right">{getStep1Content()?.client?.structure || dossier.structure || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Statut interne</dt>
                <dd className="text-right">{dossier.status || '-'}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Associates */}
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Associés</h2>

          {/* Cas 1 : plusieurs associés depuis llc_dossier_steps ou llc_associates */}
          {associates.length > 0 && (
            <div className="space-y-4">
              {associates.map((a, index) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"
                >
                  <h3 className="mb-3 text-sm font-semibold text-neutral-200">
                    Associé {index + 1}
                  </h3>
                  <dl className="space-y-2 text-sm text-neutral-300">
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-400">Prénom</dt>
                      <dd>{a.first_name || '-'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-400">Nom</dt>
                      <dd>{a.last_name || '-'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-400">Email</dt>
                      <dd>{a.email || '-'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-400">Téléphone</dt>
                      <dd>{a.phone || '-'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-400">Adresse</dt>
                      <dd className="text-right">{a.address || '-'}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          )}

          {/* Cas 2 : structure = 1 associé → on affiche le client comme associé unique */}
          {associates.length === 0 && (getStep1Content()?.client?.structure === '1 associé' || dossier.structure === '1 associé') && (
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
              <h3 className="mb-3 text-sm font-semibold text-neutral-200">
                Associé 1
              </h3>
              <dl className="space-y-2 text-sm text-neutral-300">
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-400">Prénom</dt>
                  <dd>{getStep1Content()?.client?.firstName || dossier.first_name || '-'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-400">Nom</dt>
                  <dd>{getStep1Content()?.client?.lastName || dossier.last_name || '-'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-400">Email</dt>
                  <dd>{getStep1Content()?.client?.email || dossier.email || '-'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-400">Téléphone</dt>
                  <dd>{getStep1Content()?.client?.phone || dossier.phone || '-'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-400">Adresse</dt>
                  <dd className="text-right">{getStep1Content()?.client?.address || dossier.address || '-'}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Cas 3 : aucun associé pour l'instant */}
          {associates.length === 0 && getStep1Content()?.client?.structure !== '1 associé' && dossier.structure !== '1 associé' && (
            <p className="text-sm text-neutral-500">Aucun associé enregistré.</p>
          )}
        </section>
      </div>
    </div>
  );
}


