// submit-quote Edge Function (Deno). Wires the real database, Turnstile and Gmail SMTP into handler.ts.
// Secrets come from environment variables only; see supabase/functions/.env.example.
import { createClient } from 'npm:@supabase/supabase-js@2.117.3'
import nodemailer from 'npm:nodemailer@10.0.16'
import { buildEmail } from './email.ts'
import { handle, MAX_PER_IP_PER_HOUR, type SaveResult } from './handler.ts'
import { verifyTurnstile } from './turnstile.ts'

function env(name: string, fallback?: string): string {
  const value = Deno.env.get(name) ?? fallback
  if (!value) throw new Error(`Missing environment variable ${name}`)
  return value
}

const config = {
  supabaseUrl: env('SUPABASE_URL'),
  serviceRoleKey: env('SUPABASE_SERVICE_ROLE_KEY'),
  turnstileSecret: env('TURNSTILE_SECRET_KEY'),
  ipHashSalt: env('IP_HASH_SALT'),
  allowedOrigins: env('ALLOWED_ORIGINS')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  smtpHost: env('SMTP_HOST', 'smtp.gmail.com'),
  smtpPort: Number(env('SMTP_PORT', '465')),
  smtpSecure: env('SMTP_SECURE', 'true') === 'true',
  smtpUser: Deno.env.get('GMAIL_SMTP_USER') ?? '',
  smtpPass: Deno.env.get('GMAIL_SMTP_APP_PASSWORD') ?? '',
  recipient: env('ENQUIRY_RECIPIENT_EMAIL'),
}

const db = createClient(config.supabaseUrl, config.serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const mailer = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpSecure,
  ...(config.smtpUser ? { auth: { user: config.smtpUser, pass: config.smtpPass } } : {}),
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
})

Deno.serve((req) =>
  handle(req, {
    now: () => new Date(),
    allowedOrigins: config.allowedOrigins,
    ipHashSalt: config.ipHashSalt,
    verifyTurnstile: (token, ip) => verifyTurnstile(config.turnstileSecret, token, ip),

    async saveQuote(quote, ipHash, dedupeKey) {
      const { data, error } = await db.rpc('submit_quote', {
        p_quote: quote,
        p_ip_hash: ipHash,
        p_dedupe_key: dedupeKey,
        p_max_per_hour: MAX_PER_IP_PER_HOUR,
      })
      if (error) throw new Error(`submit_quote failed: ${error.code}`)
      return data as SaveResult
    },

    async notify(quote, requestNo) {
      const { subject, text } = buildEmail(quote, requestNo)
      try {
        await mailer.sendMail({
          from: { name: "Kim's & Cargo's website", address: config.smtpUser || config.recipient },
          to: config.recipient,
          ...(quote.email ? { replyTo: quote.email } : {}),
          subject,
          text,
        })
        return true
      } catch (err) {
        // Error class and SMTP code only: the message can echo addresses.
        const code = (err as { code?: string; responseCode?: number }) ?? {}
        console.error(`email failed for request ${requestNo}: ${code.code ?? ''} ${code.responseCode ?? ''}`)
        return false
      }
    },

    async markEmail(id, sent) {
      const { error } = await db
        .from('quote_requests')
        .update({ email_status: sent ? 'sent' : 'failed' })
        .eq('id', id)
      if (error) throw new Error(`markEmail failed: ${error.code}`)
    },

    log: (message) => console.log(message),
  }),
)
