import { defineAction, ActionError } from 'astro:actions';
import {
  TURNSTILE_SECRET_KEY,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  NEWSLETTER_SITE_URL,
} from 'astro:env/server';
import { z } from 'astro:schema';
import { Resend } from 'resend';
import { checkRateLimit } from '../lib/rateLimit';

export const newsletter = {
  subscribe: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email('El email no es válido'),
      // Honeypot — los bots lo completan, los humanos no lo ven
      b_name: z.string().optional(),
      // Cloudflare Turnstile token
      'cf-turnstile-response': z.string().optional(),
    }),
    handler: async (input, context) => {
      // ── Capa 1: Honeypot ────────────────────────────────────────────────────
      if (input.b_name && input.b_name.trim().length > 0) {
        console.warn('[newsletter] Honeypot activado — envío de bot rechazado silenciosamente');
        return { success: true };
      }

      // ── Capa 2: Cloudflare Turnstile ────────────────────────────────────────
      const turnstileToken = input['cf-turnstile-response'];
      if (!turnstileToken) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Verificación de seguridad requerida. Recargá la página e intentá de nuevo.',
        });
      }

      const verifyRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: TURNSTILE_SECRET_KEY,
            response: turnstileToken,
          }),
        }
      );
      const verifyData = await verifyRes.json() as { success: boolean };

      if (!verifyData.success) {
        console.warn('[newsletter] Turnstile falló');
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'La verificación de seguridad falló. Recargá la página e intentá de nuevo.',
        });
      }

      // ── Capa 3: Rate Limiting ───────────────────────────────────────────────
      const db = (context.locals as App.Locals).runtime.env.blog_metrics;

      const ip =
        context.request.headers.get('CF-Connecting-IP') ??
        context.request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ??
        'unknown';

      const { allowed } = await checkRateLimit({
        db,
        key: `newsletter_${ip}`,
        limit: 1,          // 1 intento por ventana — evita emails duplicados en circulación
        windowMs: 300_000, // 5 minutos
      });

      if (!allowed) {
        throw new ActionError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
        });
      }

      // ── Capa 4: Zod ya validó el email en el `input` schema arriba ──────────

      // ── Upsert en D1 ───────────────────────────────────────────────────────
      // Estrategia por estado:
      //   - 'pending'      → preservar el token existente (el link ya emitido sigue válido)
      //   - 'unsubscribed' → nuevo token (re-suscripción legítima)
      //   - 'confirmed'    → WHERE lo bloquea, no se toca nada
      const newToken = crypto.randomUUID();

      await db
        .prepare(
          `INSERT INTO subscribers (email, status, token, source)
           VALUES (?1, 'pending', ?2, 'website')
           ON CONFLICT(email) DO UPDATE SET
             token      = CASE WHEN status = 'unsubscribed' THEN excluded.token ELSE token END,
             status     = CASE WHEN status = 'unsubscribed' THEN 'pending'      ELSE status END,
             updated_at = datetime('now')
           WHERE status != 'confirmed'`
        )
        .bind(input.email, newToken)
        .run();

      // Recuperar el estado real tras el upsert
      const row = await db
        .prepare('SELECT token, status FROM subscribers WHERE email = ?1')
        .bind(input.email)
        .first<{ token: string; status: string }>();

      // Si el email ya está confirmado → éxito silencioso, sin email
      if (!row || row.status === 'confirmed') {
        console.info('[newsletter] Email ya confirmado — suscripción ignorada silenciosamente');
        return { success: true };
      }

      // El token real a usar en el email (puede ser el preservado de un pending anterior)
      const token = row.token;

      // ── Email de confirmación via Resend ────────────────────────────────────
      const resend = new Resend(RESEND_API_KEY);
      const siteUrl = NEWSLETTER_SITE_URL;
      const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${token}`;
      const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${token}`;

      const { error: emailError } = await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: [input.email],
        subject: '✉️ Confirmá tu suscripción a mi newsletter',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 24px; color: #1a1a2e; margin: 0;">FabRiBau</h1>
              <p style="color: #888; font-size: 14px; margin: 4px 0 0;">fabribau.tech</p>
            </div>

            <h2 style="color: #1a1a2e; font-size: 20px; margin-bottom: 12px;">Un paso más: confirmá tu suscripción</h2>

            <p style="color: #444; line-height: 1.7; margin-bottom: 24px;">
              Recibí tu solicitud para unirte a mi newsletter. Para completar la suscripción
              y empezar a recibir mis artículos sobre desarrollo, tecnología y proyectos,
              hacé clic en el botón de abajo.
            </p>

            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${confirmUrl}" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                ✅ Confirmar suscripción
              </a>
            </div>

            <p style="color: #888; font-size: 13px; line-height: 1.6; margin-bottom: 8px;">
              Si no podés hacer clic en el botón, copiá y pegá este link en tu navegador:
            </p>
            <p style="color: #6366f1; font-size: 12px; word-break: break-all; margin-bottom: 24px;">
              ${confirmUrl}
            </p>

            <p style="color: #aaa; font-size: 12px; line-height: 1.6; margin-bottom: 0;">
              Si no pediste suscribirte, podés ignorar este email.
              <br />
              Si lo recibiste por error:
              <a href="${unsubscribeUrl}" style="color: #aaa;">dar de baja</a>.
            </p>
          </div>
        `,
      });

      if (emailError) {
        console.error('[newsletter] Error enviando email de confirmación:', emailError);
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No se pudo enviar el email de confirmación. Intentá de nuevo.',
        });
      }

      return { success: true };
    },
  }),
};
