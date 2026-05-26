import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { getComplianceData, type ComplianceItem } from "@/lib/compliance-data";

const PURPLE = "#7C3AED";
const DARK = "#111827";
const MUTED = "#6B7280";
const LIGHT = "#F3F4F6";
const WHITE = "#FFFFFF";
const GREEN = "#10B981";
const AMBER = "#F59E0B";
const RED = "#EF4444";

const s = StyleSheet.create({
  page: {
    backgroundColor: WHITE,
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: DARK,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 28,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: PURPLE,
  },
  brand: { fontSize: 16, fontFamily: "Helvetica-Bold", color: PURPLE },
  headerMeta: { alignItems: "flex-end" },
  headerSub: { fontSize: 8, color: MUTED },
  reportType: {
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginBottom: 3,
  },
  subtitle: { fontSize: 11, color: MUTED, marginBottom: 24 },
  metricsRow: { flexDirection: "row", marginBottom: 28 },
  metricBox: {
    flex: 1,
    backgroundColor: LIGHT,
    padding: 12,
    marginRight: 8,
    borderTopWidth: 3,
  },
  metricLabel: {
    fontSize: 7,
    color: MUTED,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  metricValue: { fontSize: 20, fontFamily: "Helvetica-Bold", color: DARK },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    color: DARK,
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    backgroundColor: LIGHT,
    borderLeftWidth: 3,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
    marginRight: 10,
  },
  itemBody: { flex: 1 },
  itemTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 2 },
  itemRef: { fontSize: 7, color: PURPLE, marginBottom: 3 },
  itemDetail: { fontSize: 8, color: MUTED, lineHeight: 1.4 },
  statusLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerText: { fontSize: 7, color: MUTED },
  disclaimer: {
    marginTop: 24,
    padding: 10,
    backgroundColor: "#F5F3FF",
    borderLeftWidth: 2,
    borderLeftColor: PURPLE,
  },
  disclaimerText: { fontSize: 7, color: MUTED, lineHeight: 1.5 },
});

function statusColor(status: ComplianceItem["status"]) {
  if (status === "ok") return GREEN;
  if (status === "pending") return AMBER;
  return RED;
}

function statusText(status: ComplianceItem["status"]) {
  if (status === "ok") return "Conforme";
  if (status === "pending") return "Pendente";
  return "Crítico";
}

function CompliancePDF({
  companyName,
  compliancePct,
  okCount,
  attentionCount,
  total,
  items,
  generatedAt,
}: {
  companyName: string;
  compliancePct: number;
  okCount: number;
  attentionCount: number;
  total: number;
  items: ComplianceItem[];
  generatedAt: string;
}) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.brand}>ComplyOn</Text>
          <View style={s.headerMeta}>
            <Text style={s.headerSub}>{companyName}</Text>
            <Text style={s.headerSub}>Gerado em {generatedAt}</Text>
          </View>
        </View>

        <Text style={s.reportType}>Relatório de Conformidade NR-01</Text>
        <Text style={s.title}>Conformidade NR-01</Text>
        <Text style={s.subtitle}>{companyName}</Text>

        <View style={s.metricsRow}>
          <View style={[s.metricBox, { borderTopColor: GREEN }]}>
            <Text style={s.metricLabel}>Conformidade</Text>
            <Text style={[s.metricValue, { color: compliancePct >= 70 ? GREEN : compliancePct >= 40 ? AMBER : RED }]}>
              {compliancePct}%
            </Text>
          </View>
          <View style={[s.metricBox, { borderTopColor: GREEN }]}>
            <Text style={s.metricLabel}>Itens Conformes</Text>
            <Text style={[s.metricValue, { color: GREEN }]}>{okCount}/{total}</Text>
          </View>
          <View style={[s.metricBox, { borderTopColor: RED, marginRight: 0 }]}>
            <Text style={s.metricLabel}>Itens Críticos</Text>
            <Text style={[s.metricValue, { color: attentionCount > 0 ? RED : GREEN }]}>{attentionCount}</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Lista de Verificação NR-01</Text>

        {items.map((item) => {
          const color = statusColor(item.status);
          return (
            <View key={item.id} style={[s.itemRow, { borderLeftColor: color }]}>
              <View style={[s.itemDot, { backgroundColor: color }]} />
              <View style={s.itemBody}>
                <Text style={[s.statusLabel, { color }]}>{statusText(item.status)}</Text>
                <Text style={s.itemTitle}>{item.title}</Text>
                <Text style={s.itemRef}>{item.legalRef}</Text>
                {item.detail ? <Text style={s.itemDetail}>{item.detail}</Text> : null}
              </View>
            </View>
          );
        })}

        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            Nota legal: Esta análise é baseada nos dados da plataforma ComplyOn e serve como orientação.
            Consulte um especialista em segurança do trabalho para uma avaliação completa de conformidade com a NR-01.
            Vigência: conforme portaria MTE publicada em 2024.
          </Text>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>ComplyOn — Gestão de Saúde Mental NR-01</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyId = (session.user as { companyId: string }).companyId;

  try {
    const { companyName, items, okCount, attentionCount, compliancePct } =
      await getComplianceData(companyId);

    const generatedAt = new Date().toLocaleDateString("pt-BR");

    const pdfBuffer = await renderToBuffer(
      <CompliancePDF
        companyName={companyName}
        compliancePct={compliancePct}
        okCount={okCount}
        attentionCount={attentionCount}
        total={items.length}
        items={items}
        generatedAt={generatedAt}
      />
    );

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="conformidade-nr01.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Compliance PDF generation error:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
