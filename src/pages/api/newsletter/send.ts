import type { APIRoute } from 'astro';
import {
  NEWSLETTER_SEND_SECRET,
  NEWSLETTER_SEND_SECRET_2,
  NEWSLETTER_SITE_URL,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  CONTACT_EMAIL,
} from 'astro:env/server';
import { Resend } from 'resend';

export const prerender = false;

const BATCH_SIZE = 100;

interface SendBody {
  secret: string;
  secret2: string;
  slug: string;
  title: string;
  excerpt?: string;
  preview?: boolean;
}

interface SubscriberRow {
  email: string;
  token: string;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

const buildHtml = ({
  title,
  excerpt,
  postUrl,
  unsubscribeUrl,
  preview,
}: {
  title: string;
  excerpt: string;
  postUrl: string;
  unsubscribeUrl: string;
  preview: boolean;
}) => /* html */ `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:system-ui,-apple-system,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f0d0b 0%,#1a1714 100%);padding:28px 36px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:800;color:#f0ebe3;letter-spacing:-0.3px;">FabRiBau</p>
              <p style="margin:4px 0 0;font-size:12px;color:#9c9080;letter-spacing:0.5px;">fabribau.tech</p>
            </td>
          </tr>

          ${preview ? /* html */ `
          <!-- Preview banner -->
          <tr>
            <td style="background:#fef3c7;padding:10px 36px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#92400e;">
                ⚠️ <strong>PREVIEW</strong> — Este email no fue enviado a suscriptores reales.
              </p>
            </td>
          </tr>` : ''}

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px;">

              <!-- Hook -->
              <p style="margin:0 0 24px;font-size:14px;font-weight:600;color:#e8854a;text-transform:uppercase;letter-spacing:0.08em;">
                Nuevo artículo
              </p>

              <!-- Intro -->
              <p style="margin:0 0 20px;font-size:16px;color:#374151;line-height:1.65;">
                Acabo de publicar algo nuevo en el blog y quería que fueras de los primeros en leerlo. 👇
              </p>

              <!-- Post title -->
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#1a1a2e;line-height:1.25;letter-spacing:-0.4px;">
                ${title}
              </h1>

              ${excerpt ? /* html */ `
              <!-- Excerpt -->
              <p style="margin:0 0 28px;font-size:15px;color:#9c9080;line-height:1.7;border-left:3px solid #e8854a;padding-left:16px;">
                ${excerpt}
              </p>` : '<div style="margin-bottom:28px;"></div>'}

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${postUrl}"
                       style="display:inline-block;background:#e8854a;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:0.2px;">
                      Leer el artículo →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Secondary link -->
              <p style="margin:20px 0 0;text-align:center;font-size:13px;color:#9c9080;">
                O copiá el link:
                <a href="${postUrl}" style="color:#e8854a;text-decoration:none;">${postUrl}</a>
              </p>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 36px;">
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px 28px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.8;">
                Recibís este email porque te suscribiste a mi newsletter.<br />
                <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Darme de baja</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;

export const POST: APIRoute = async ({ request, locals }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data, null, 2), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  // ── 1. Parsear body JSON ─────────────────────────────────────────────────────
  let body: SendBody;
  try {
    body = await request.json() as SendBody;
  } catch {
    return json({ error: 'El body debe ser JSON válido.' }, 400);
  }

  const { secret, secret2, slug, title, excerpt = '', preview = false } = body;

  // -- 2. Autenticación (ambos secrets requeridos) ----------------------------
  if (secret !== NEWSLETTER_SEND_SECRET || secret2 !== NEWSLETTER_SEND_SECRET_2) {
    return json({ error: 'No autorizado.' }, 401);
  }


  // -- 3. Validar campos obligatorios ----------------------------------------
  if (!slug?.trim() || !title?.trim()) {
    return json({ error: '"slug" y "title" son obligatorios.' }, 400);
  }

  const db = (locals as App.Locals).runtime.env.fabribau_db;

  // ── 4. Anti double-send ─────────────────────────────────────────────────────
  if (!preview) {
    const alreadySent = await db
      .prepare('SELECT slug FROM sent_posts WHERE slug = ?1')
      .bind(slug)
      .first<{ slug: string }>();

    if (alreadySent) {
      return json({
        error: `El post "${slug}" ya fue enviado anteriormente.`,
        hint: 'Para re-enviarlo, eliminá el registro de sent_posts en D1.',
      }, 409);
    }
  }

  // ── 5. Obtener destinatarios ────────────────────────────────────────────────
  const siteUrl = NEWSLETTER_SITE_URL;
  const postUrl = `${siteUrl}/blog/${slug}`;

  let recipients: SubscriberRow[];

  if (preview) {
    recipients = [{ email: CONTACT_EMAIL, token: 'preview' }];
  } else {
    const { results } = await db
      .prepare("SELECT email, token FROM subscribers WHERE status = 'confirmed'")
      .all<SubscriberRow>();
    recipients = results;
  }

  if (recipients.length === 0) {
    return json({ message: 'No hay suscriptores confirmados.', sent: 0 });
  }

  // ── 6. Envío en batches ─────────────────────────────────────────────────────
  const resend    = new Resend(RESEND_API_KEY);
  const batches   = chunk(recipients, BATCH_SIZE);
  let totalSent   = 0;
  let totalErrors = 0;

  for (const batch of batches) {
    const emails = batch.map(({ email, token }) => {
      const unsubscribeUrl = token === 'preview'
        ? `${siteUrl}/newsletter/goodbye`
        : `${siteUrl}/api/newsletter/unsubscribe?token=${token}`;

      return {
        from:    RESEND_FROM_EMAIL,
        to:      [email],
        subject: `✍️ ${title}`,
        html:    buildHtml({ title, excerpt, postUrl, unsubscribeUrl, preview }),
      };
    });

    try {
      const { data, error } = await resend.batch.send(emails);
      if (error) {
        console.error('[newsletter/send] Error en batch:', error);
        totalErrors += batch.length;
      } else {
        totalSent += data?.data?.length ?? batch.length;
      }
    } catch (err) {
      console.error('[newsletter/send] Excepción en batch:', err);
      totalErrors += batch.length;
    }
  }

  // ── 7. Registrar en D1 ──────────────────────────────────────────────────────
  if (!preview && totalSent > 0) {
    await db
      .prepare('INSERT INTO sent_posts (slug, title, recipients) VALUES (?1, ?2, ?3)')
      .bind(slug, title, totalSent)
      .run();
  }

  // ── 8. Respuesta ─────────────────────────────────────────────────────────────
  return json({
    preview,
    slug,
    title,
    sent: totalSent,
    errors: totalErrors,
    ...(preview
      ? { note: 'Preview enviado a tu email. No se registró en sent_posts.' }
      : {}),
  });
};
