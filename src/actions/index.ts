import { defineAction, ActionError } from 'astro:actions';
import { newsletter } from './newsletter';
import {
  TURNSTILE_SECRET_KEY,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  CONTACT_EMAIL,
} from 'astro:env/server';
import { z } from 'astro:schema';
import { Resend } from 'resend';
import { checkRateLimit } from '../lib/rateLimit';

export const server = {
  // ── Newsletter ─────────────────────────────────────────────────────────────
  newsletter,
  // ── Likes ─────────────────────────────────────────────────────────────────
  incrementLike: defineAction({
    input: z.object({
      slug: z.string().min(1, 'El slug no puede estar vacío'),
    }),
    handler: async (input, context) => {
      const db = (context.locals as App.Locals).runtime.env.fabribau_db;

      // ── Rate limiting: 3 likes por IP por minuto ─────────────────────────
      const ip =
        context.request.headers.get('CF-Connecting-IP') ??
        context.request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ??
        'unknown';

      const { allowed } = await checkRateLimit({
        db,
        key: `likes_${ip}`,
        limit: 3,
        windowMs: 60_000, // 1 minuto
      });

      if (!allowed) {
        throw new ActionError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Demasiados intentos. Esperá un momento.',
        });
      }

      // ── Upsert de likes ──────────────────────────────────────────────────
      await db
        .prepare(
          `INSERT INTO metrics (slug, likes, views)
           VALUES (?1, 1, 0)
           ON CONFLICT(slug) DO UPDATE SET likes = likes + 1`
        )
        .bind(input.slug)
        .run();

      return { success: true };
    },
  }),

  // ── Contact form ───────────────────────────────────────────────────────────
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().max(120, 'El nombre no puede superar 120 caracteres'),
      email: z.string().email('El email no es válido'),
      subject: z.string().max(150, 'El asunto no puede superar 150 caracteres'),
      message: z.string().max(1000, 'El mensaje no puede superar 1000 caracteres'),
      // Honeypot field — bots fill this, humans don't see it
      website: z.string().optional(),
      // Cloudflare Turnstile response token
      'cf-turnstile-response': z.string().optional(),
    }),
    handler: async (input, context) => {
      // ── 1. Honeypot check ──────────────────────────────────────────────
      // If this field has a value, it's a bot — simulate success to avoid alerting it
      if (input.website && input.website.trim().length > 0) {
        console.warn('[contact] Honeypot triggered — bot submission rejected silently');
        return { success: true };
      }

      // ── 2. Cloudflare Turnstile verification ───────────────────────────
      const turnstileSecret = TURNSTILE_SECRET_KEY;
      const turnstileToken = input['cf-turnstile-response'];

      if (!turnstileSecret || !turnstileToken) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Verificación de seguridad requerida. Recargá la página e intentá de nuevo.'
        });
      }

      const verifyRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: turnstileSecret,
            response: turnstileToken,
          }),
        }
      );

      const verifyData = await verifyRes.json() as { success: boolean };

      if (!verifyData.success) {
        console.warn('[contact] Turnstile verification failed');
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'La verificación de seguridad falló. Recargá la página e intentá de nuevo.'
        });
      }

      // ── 3. Email setup ─────────────────────────────────────────────────
      const resendApiKey = RESEND_API_KEY;
      const resendFromEmail = RESEND_FROM_EMAIL;
      const contactEmail = CONTACT_EMAIL;

      if (!resendApiKey || !resendFromEmail || !contactEmail) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Configuración de email incompleta en el servidor'
        });
      }

      const resend = new Resend(resendApiKey);

      const escapeHtml = (text: string) =>
        text
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#39;');

      const escapedName = escapeHtml(input.name);
      const escapedEmail = escapeHtml(input.email);
      const escapedSubject = escapeHtml(input.subject);
      const escapedMessage = escapeHtml(input.message).replaceAll('\n', '<br />');

      try {
        // ── 4. Email to admin ──────────────────────────────────────────────
        const { error: adminError } = await resend.emails.send({
          from: resendFromEmail,
          to: [contactEmail],
          replyTo: input.email,
          subject: `[FabRiBau Contacto] ${input.subject}`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #1a1a2e; margin-bottom: 16px;">📬 Nuevo mensaje de contacto</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #555; width: 100px;">Nombre:</td>
                  <td style="padding: 8px 0; color: #1a1a2e;">${escapedName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #555;">Email:</td>
                  <td style="padding: 8px 0; color: #1a1a2e;">${escapedEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #555;">Asunto:</td>
                  <td style="padding: 8px 0; color: #1a1a2e;">${escapedSubject}</td>
                </tr>
              </table>
              <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
              <p style="font-weight: 600; color: #555; margin-bottom: 8px;">Mensaje:</p>
              <p style="color: #1a1a2e; line-height: 1.6; background: #f9f9f9; padding: 16px; border-radius: 6px;">${escapedMessage}</p>
            </div>
          `,
        });

        if (adminError) {
          console.error('[contact] Error enviando email al admin:', adminError);
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'No se pudo enviar el mensaje. Intentá de nuevo.'
          });
        }

        // ── 5. Confirmation email to sender ────────────────────────────────
        await resend.emails.send({
          from: resendFromEmail,
          to: [input.email],
          subject: `✅ Recibí tu mensaje, ${input.name.split(' ')[0]}!`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 24px; color: #1a1a2e; margin: 0;">FabRiBau</h1>
                <p style="color: #888; font-size: 14px; margin: 4px 0 0;">fabribau.tech</p>
              </div>

              <h2 style="color: #1a1a2e; font-size: 20px; margin-bottom: 12px;">¡Gracias por escribirme, ${escapedName}!</h2>

              <p style="color: #444; line-height: 1.7; margin-bottom: 16px;">
                Recibí tu mensaje y voy a responderte a la brevedad. Generalmente respondo dentro de las <strong>24–48 horas</strong>.
              </p>

              <div style="background: #f5f5f5; border-left: 3px solid #6366f1; padding: 16px 20px; border-radius: 0 6px 6px 0; margin-bottom: 24px;">
                <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Tu mensaje</p>
                <p style="margin: 0; color: #333; font-style: italic; line-height: 1.6;">"${escapedMessage}"</p>
              </div>

              <p style="color: #444; line-height: 1.7; margin-bottom: 24px;">
                Mientras tanto, podés visitar mi sitio para conocer más sobre mis proyectos y publicaciones.
              </p>

              <div style="text-align: center; margin-bottom: 32px;">
                <a href="https://fabribau.tech" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 15px;">
                  Ver mi sitio →
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="color: #aaa; font-size: 12px; text-align: center; margin: 0;">
                Este email fue enviado automáticamente porque completaste el formulario de contacto en fabribau.tech
              </p>
            </div>
          `,
        });

        return { success: true };
      } catch (err) {
        if (err instanceof ActionError) throw err;
        console.error('[contact] Error inesperado:', err);
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No se pudo enviar el mensaje. Intentá de nuevo.'
        });
      }
    }
  })
};
