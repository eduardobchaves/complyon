import { Resend } from "resend";
import nodemailer from "nodemailer";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || "noreply@complyon.com.br";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// If GMAIL_USER + GMAIL_APP_PASSWORD are set, use Gmail SMTP instead of Resend
function getTransport() {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return null;
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const transport = getTransport();
  if (transport) {
    const from = process.env.GMAIL_USER ? `ComplyOn <${process.env.GMAIL_USER}>` : FROM;
    await transport.sendMail({ from, to, subject, html });
    return;
  }
  const result = await resend.emails.send({ from: FROM, to, subject, html });
  if (result.error) throw new Error(result.error.message);
}

export async function sendInviteEmail({
  to,
  name,
  companyName,
  token,
}: {
  to: string;
  name: string;
  companyName: string;
  token: string;
}) {
  const link = `${APP_URL}/aceitar-convite?token=${token}`;
  return sendEmail({
    to,
    subject: `Você foi convidado para o ComplyOn na ${companyName}`,
    html: `
      <h2>Olá, ${name}!</h2>
      <p>Você foi convidado para acessar a plataforma ComplyOn da empresa <strong>${companyName}</strong>.</p>
      <p>Clique no link abaixo para criar sua senha. O link expira em 7 dias.</p>
      <a href="${link}" style="background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0;">Aceitar Convite</a>
      <p>Se não esperava este email, ignore-o.</p>
    `,
  });
}

export async function sendSurveyOpenEmail({
  to,
  companyName,
  surveyLink,
}: {
  to: string;
  companyName: string;
  surveyLink: string;
}) {
  return sendEmail({
    to,
    subject: `Uma nova pesquisa de clima está disponível para você`,
    html: `
      <h2>Pesquisa de Clima Organizacional</h2>
      <p>A empresa <strong>${companyName}</strong> abriu uma nova pesquisa de clima.</p>
      <p>Sua participação é anônima e leva apenas 5 minutos.</p>
      <a href="${surveyLink}" style="background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0;">Responder Pesquisa</a>
      <p style="color:#6B7280;font-size:12px;">Suas respostas são 100% anônimas. Nenhum dado identificador é armazenado.</p>
    `,
  });
}

export async function sendSurveyTokenEmail({
  to,
  companyName,
  surveyTitle,
  surveyLink,
}: {
  to: string;
  companyName: string;
  surveyTitle: string;
  surveyLink: string;
}) {
  return sendEmail({
    to,
    subject: `Pesquisa de clima: ${surveyTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
        <div style="background:#16a34a;border-radius:12px 12px 0 0;padding:24px;text-align:center">
          <h1 style="color:white;margin:0;font-size:20px">ComplyOn</h1>
          <p style="color:#bbf7d0;margin:4px 0 0;font-size:13px">Pesquisa de Clima Organizacional</p>
        </div>
        <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:28px">
          <h2 style="margin:0 0 12px;font-size:16px">${surveyTitle}</h2>
          <p style="color:#374151;line-height:1.6">
            A empresa <strong>${companyName}</strong> disponibilizou uma pesquisa de bem-estar e clima organizacional.
            Sua participação é voluntária e <strong>100% anônima</strong> — este link é de uso único e suas respostas não podem ser rastreadas até você.
          </p>
          <div style="text-align:center;margin:24px 0">
            <a href="${surveyLink}" style="background:#16a34a;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:600;font-size:15px">
              Responder Pesquisa
            </a>
          </div>
          <div style="background:#dcfce7;border-radius:8px;padding:12px 16px;font-size:12px;color:#166534">
            🔒 <strong>Privacidade garantida:</strong> este link é válido para uma única resposta. Nenhum dado que possa identificar você é armazenado.
          </div>
          <p style="margin-top:20px;font-size:12px;color:#9CA3AF;text-align:center">
            Se não esperava este email, ignore-o. Ele foi enviado pelo ComplyOn em nome de ${companyName}.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendSurveyReminderEmail({
  to,
  companyName,
  surveyLink,
  daysLeft,
}: {
  to: string;
  companyName: string;
  surveyLink: string;
  daysLeft: number;
}) {
  return sendEmail({
    to,
    subject: `Últimos ${daysLeft} dias para responder a pesquisa de clima`,
    html: `
      <h2>Lembrete: Pesquisa de Clima</h2>
      <p>A pesquisa de clima da <strong>${companyName}</strong> encerra em <strong>${daysLeft} dias</strong>.</p>
      <p>Sua voz importa! Responda agora de forma anônima.</p>
      <a href="${surveyLink}" style="background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0;">Responder Agora</a>
    `,
  });
}

export async function sendSurveyClosedEmail({
  to,
  companyName,
  responseRate,
  resultsLink,
}: {
  to: string;
  companyName: string;
  responseRate: number;
  resultsLink: string;
}) {
  return sendEmail({
    to,
    subject: `Pesquisa encerrada — ${responseRate}% de participação`,
    html: `
      <h2>Pesquisa Encerrada</h2>
      <p>A pesquisa de clima da <strong>${companyName}</strong> foi encerrada com <strong>${responseRate}%</strong> de participação.</p>
      <a href="${resultsLink}" style="background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0;">Ver Resultados</a>
    `,
  });
}

export async function sendComplaintReceivedEmail({
  to,
  protocol,
  complaintsLink,
}: {
  to: string;
  protocol: string;
  complaintsLink: string;
}) {
  return sendEmail({
    to,
    subject: `Nova denúncia recebida — Protocolo ${protocol}`,
    html: `
      <h2>Nova Denúncia Recebida</h2>
      <p>Uma nova denúncia foi registrada com o protocolo <strong style="font-family:monospace;">${protocol}</strong>.</p>
      <p>Acesse o painel para visualizar e tomar as providências necessárias.</p>
      <a href="${complaintsLink}" style="background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0;">Ver Denúncia</a>
      <p style="color:#6B7280;font-size:12px;">Os detalhes da denúncia estão disponíveis apenas no painel seguro.</p>
    `,
  });
}
