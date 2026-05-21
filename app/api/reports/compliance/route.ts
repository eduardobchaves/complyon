import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BASE_ITEMS } from "@/lib/compliance";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = { ok: "Conforme", pending: "Pendente", attention: "Atenção" };
const STATUS_COLOR: Record<string, string> = { ok: "#10B981", pending: "#9CA3AF", attention: "#EF4444" };
const STATUS_BG: Record<string, string> = { ok: "#D1FAE5", pending: "#F3F4F6", attention: "#FEE2E2" };

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = (session.user as { companyId: string }).companyId;

  const [company, overrides, surveys, complaintCount] = await Promise.all([
    prisma.company.findUnique({ where: { id: companyId }, select: { name: true, cnpj: true } }),
    prisma.complianceOverride.findMany({ where: { companyId } }),
    prisma.survey.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { title: true, status: true, createdAt: true, responses: { select: { id: true } } },
    }),
    prisma.complaint.count({ where: { companyId } }),
  ]);

  const overrideMap = Object.fromEntries(overrides.map(o => [o.itemId, { status: o.status, comment: o.comment }]));

  const effectiveItems = BASE_ITEMS.map(item => ({
    ...item,
    effectiveStatus: (overrideMap[item.id]?.status ?? item.status) as "ok" | "pending" | "attention",
    comment: overrideMap[item.id]?.comment ?? null,
    isManual: !!overrideMap[item.id],
  }));

  const okCount = effectiveItems.filter(i => i.effectiveStatus === "ok").length;
  const pendingCount = effectiveItems.filter(i => i.effectiveStatus === "pending").length;
  const attentionCount = effectiveItems.filter(i => i.effectiveStatus === "attention").length;
  const compliancePct = Math.round((okCount / effectiveItems.length) * 100);

  const scoreColor = compliancePct >= 75 ? "#10B981" : compliancePct >= 50 ? "#F59E0B" : "#EF4444";

  const dateStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const surveyRows = surveys.map(s => {
    const statusLabel = s.status === "ACTIVE" ? "Ativa" : s.status === "CLOSED" ? "Encerrada" : s.status === "DRAFT" ? "Rascunho" : "Arquivada";
    return `<tr>
      <td>${s.title}</td>
      <td>${statusLabel}</td>
      <td>${s.responses.length}</td>
      <td>${new Date(s.createdAt).toLocaleDateString("pt-BR")}</td>
    </tr>`;
  }).join("");

  const itemRows = effectiveItems.map(item => `
    <tr>
      <td style="font-weight:700;color:#16a34a;white-space:nowrap">${item.id}</td>
      <td>
        <div style="font-weight:600;margin-bottom:3px">${item.title}${item.isManual ? ' <span style="font-size:10px;color:#16a34a;border:1px solid #16a34a;border-radius:3px;padding:1px 4px">manual</span>' : ""}</div>
        <div style="color:#6B7280;font-size:11px">${item.description}</div>
        ${item.comment ? `<div style="margin-top:4px;font-size:11px;color:#6B7280;font-style:italic">💬 ${item.comment}</div>` : ""}
      </td>
      <td style="font-size:11px;color:#16a34a;font-weight:500;white-space:nowrap">${item.legalRef}</td>
      <td><span style="display:inline-block;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;background:${STATUS_BG[item.effectiveStatus]};color:${STATUS_COLOR[item.effectiveStatus]}">${STATUS_LABEL[item.effectiveStatus]}</span></td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Conformidade NR-01 — ${company?.name ?? ""}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; background: #fff; font-size: 13px; }
    @media print {
      .no-print { display: none !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    .container { max-width: 900px; margin: 0 auto; padding: 32px; }
    .header { border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 24px; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-icon { width: 40px; height: 40px; background: #16a34a; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 20px; }
    .brand-name { font-size: 18px; font-weight: 800; color: #16a34a; letter-spacing: 0.05em; }
    .brand-sub { font-size: 11px; color: #6B7280; }
    .report-meta { text-align: right; font-size: 11px; color: #6B7280; line-height: 1.8; }
    .company-name { font-size: 22px; font-weight: 700; color: #111; margin-top: 16px; }
    .company-cnpj { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
    .stat-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 14px; text-align: center; }
    .stat-label { font-size: 11px; color: #6B7280; margin-bottom: 4px; }
    .stat-value { font-size: 28px; font-weight: 700; font-family: monospace; }
    .stat-sub { font-size: 10px; color: #9CA3AF; margin-top: 2px; }
    .progress-bg { background: #E5E7EB; border-radius: 4px; height: 6px; overflow: hidden; margin-top: 6px; }
    .progress-fill { height: 6px; border-radius: 4px; }
    .section-title { font-size: 14px; font-weight: 700; color: #111; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 14px; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 8px; }
    th { background: #F9FAFB; text-align: left; padding: 9px 10px; border-bottom: 2px solid #E5E7EB; font-weight: 600; color: #374151; }
    td { padding: 9px 10px; border-bottom: 1px solid #F3F4F6; vertical-align: top; color: #374151; }
    .footer { margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 16px; font-size: 11px; color: #9CA3AF; text-align: center; line-height: 1.8; }
    .print-btn { position: fixed; bottom: 24px; right: 24px; background: #16a34a; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(22,163,74,0.4); }
    .print-btn:hover { background: #15803d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-top">
        <div class="brand">
          <div class="brand-icon">S</div>
          <div>
            <div class="brand-name">COMPLYON</div>
            <div class="brand-sub">NR-01 — Gestão de Saúde Mental</div>
          </div>
        </div>
        <div class="report-meta">
          <div><strong>Relatório de Conformidade NR-01</strong></div>
          <div>Gerado em: ${dateStr}</div>
          <div>Documento não substitui parecer jurídico</div>
        </div>
      </div>
      <div class="company-name">${company?.name ?? ""}</div>
      ${company?.cnpj ? `<div class="company-cnpj">CNPJ: ${company.cnpj}</div>` : ""}
    </div>

    <div class="summary">
      <div class="stat-card" style="border-color:#16a34a">
        <div class="stat-label">Conformidade Geral</div>
        <div class="stat-value" style="color:${scoreColor}">${compliancePct}%</div>
        <div class="progress-bg"><div class="progress-fill" style="width:${compliancePct}%;background:${scoreColor}"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Itens Conformes</div>
        <div class="stat-value" style="color:#10B981">${okCount}</div>
        <div class="stat-sub">de ${BASE_ITEMS.length} itens</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Pendentes</div>
        <div class="stat-value" style="color:#9CA3AF">${pendingCount}</div>
        <div class="stat-sub">requerem ação</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Críticos</div>
        <div class="stat-value" style="color:#EF4444">${attentionCount}</div>
        <div class="stat-sub">ação imediata</div>
      </div>
    </div>

    <div class="section-title">📋 Histórico de Pesquisas de Clima</div>
    ${surveys.length === 0
      ? `<p style="color:#9CA3AF;margin-bottom:16px;font-size:12px">Nenhuma pesquisa realizada ainda.</p>`
      : `<table>
          <thead><tr><th>Pesquisa</th><th>Status</th><th>Respostas</th><th>Data</th></tr></thead>
          <tbody>${surveyRows}</tbody>
        </table>`
    }

    <div class="section-title">🔒 Canal de Denúncias</div>
    <p style="font-size:12px;color:#374151;margin-bottom:8px">Canal anônimo ativo. Total de denúncias recebidas: <strong>${complaintCount}</strong>.</p>

    <div class="section-title">✅ Lista de Verificação NR-01 — Itens Detalhados</div>
    <table>
      <thead>
        <tr>
          <th style="width:45px">Item</th>
          <th>Requisito</th>
          <th style="width:120px">Referência</th>
          <th style="width:100px">Status</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="footer">
      <p><strong>ComplyOn</strong> — Plataforma de Gestão de Saúde Mental e Conformidade</p>
      <p>Este relatório é gerado automaticamente com base nos dados cadastrados na plataforma na data de emissão.</p>
      <p>Não substitui parecer jurídico ou avaliação técnica especializada. Vigência NR-01: conforme portaria MTE/2024.</p>
    </div>
  </div>

  <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
