import { Resend } from 'resend';

// Initialiser Resend avec la clé API depuis les variables d'environnement
// Vérifier si la clé API est disponible
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Envoyer un email via Resend
 */
export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  try {
    // Vérifier si Resend est configuré
    if (!resend || !resendApiKey) {
      const errorMsg = 'RESEND_API_KEY n\'est pas configurée. Veuillez ajouter votre clé API dans les variables d\'environnement.';
      console.error(errorMsg);
      return { success: false, error: { message: errorMsg } };
    }

    // Utiliser l'email par défaut ou celui configuré dans les variables d'environnement
    const fromEmail = from || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Templates d'emails prédéfinis
 */
export const emailTemplates = {
  /**
   * Email de notification de dossier accepté
   */
  dossierAccepted: (userName: string, dossierId: string) => ({
    subject: 'Votre dossier LLC a été accepté',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Dossier Accepté ✓</h1>
            </div>
            <div class="content">
              <p>Bonjour ${userName},</p>
              <p>Nous avons le plaisir de vous informer que votre dossier LLC (${dossierId}) a été accepté.</p>
              <p>Votre demande est maintenant en cours de traitement. Vous recevrez une notification dès que vos documents officiels seront prêts.</p>
              <p>Délai estimé : 48h (jours ouvrables)</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">Voir mon dossier</a>
              <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
                Cordialement,<br>
                L'équipe PARTNERS LLC
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Email de notification d'étape complétée
   */
  stepCompleted: (userName: string, stepName: string) => ({
    subject: `Étape "${stepName}" complétée`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Étape Complétée ✓</h1>
            </div>
            <div class="content">
              <p>Bonjour ${userName},</p>
              <p>L'étape "${stepName}" de votre dossier LLC a été complétée avec succès.</p>
              <p>Vous pouvez suivre l'avancement de votre dossier depuis votre tableau de bord.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Voir mon dossier</a>
              <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
                Cordialement,<br>
                L'équipe PARTNERS LLC
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Email de notification quand l'étape 3 (Enregistrement) est validée par l'admin
   */
  step3Validated: (userName: string) => ({
    subject: 'Votre dossier LLC a été accepté',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .highlight { background-color: #d1fae5; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Dossier Accepté ✓</h1>
            </div>
            <div class="content">
              <p>Bonjour ${userName},</p>
              <div class="highlight">
                <p style="margin: 0; font-weight: 600; color: #065f46;">Nous avons le plaisir de vous informer que PARTNERS LLC a bien accepté tous vos documents et que votre demande est maintenant en cours de traitement.</p>
              </div>
              <p>Votre dossier a été validé avec succès et notre équipe procède actuellement aux démarches nécessaires pour finaliser votre création de LLC.</p>
              <p>Vous serez notifié par email dès que vos documents officiels seront prêts. Le délai estimé est de 48 heures (jours ouvrables), sous réserve du traitement par le secrétaire d'État.</p>
              <p>Vous pouvez suivre l'avancement de votre dossier en temps réel depuis votre tableau de bord.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">Voir mon dossier</a>
              <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
                Cordialement,<br>
                L'équipe PARTNERS LLC
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Email de notification de document prêt
   */
  documentReady: (userName: string, documentName: string) => ({
    subject: 'Votre document est prêt',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Document Prêt ✓</h1>
            </div>
            <div class="content">
              <p>Bonjour ${userName},</p>
              <p>Votre document "${documentName}" est maintenant disponible dans votre espace.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/documents" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Voir mes documents</a>
              <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
                Cordialement,<br>
                L'équipe PARTNERS LLC
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

