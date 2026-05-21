import Link from "next/link";
import { Brain } from "lucide-react";

export const metadata = { title: "Termos de Uso — ComplyOn" };

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      <header className="border-b border-green-600/20 bg-[#1e2438]">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[#dcfce7] font-[var(--font-sora)]">ComplyOn</span>
          </Link>
          <Link href="/login" className="text-xs text-green-400 hover:text-green-300">Acessar plataforma</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#dcfce7] font-[var(--font-sora)]">Termos de Uso</h1>
          <p className="text-[#9CA3AF] mt-2 text-sm">Última atualização: maio de 2026</p>
        </div>

        <Section title="1. Aceitação dos Termos">
          <p>
            Ao acessar ou utilizar a plataforma ComplyOn ("Serviço"), você ("Empresa" ou "Usuário") concorda com estes
            Termos de Uso. Se não concordar com qualquer disposição, não utilize o Serviço.
          </p>
        </Section>

        <Section title="2. Descrição do Serviço">
          <p>
            A ComplyOn é uma plataforma SaaS que oferece ferramentas para gestão de saúde mental organizacional, pesquisas
            de clima anônimas, canal de denúncias, planos de ação e monitoramento de conformidade com a NR-01 (Portaria MTE nº
            765/2025).
          </p>
          <p className="mt-3">
            O Serviço é contratado pela empresa ("Controladora de dados") para uso interno com seus colaboradores. A ComplyOn atua
            como Operadora de dados nos termos da LGPD.
          </p>
        </Section>

        <Section title="3. Acesso e Credenciais">
          <p>
            O acesso à plataforma é fornecido exclusivamente por credenciais criadas pela ComplyOn ou pelo administrador autorizado
            da empresa contratante. É proibido compartilhar credenciais de acesso. O usuário é responsável por manter o sigilo
            de sua senha.
          </p>
        </Section>

        <Section title="4. Uso Permitido">
          <p>O Serviço pode ser utilizado exclusivamente para:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Gestão de saúde mental e conformidade com a NR-01</li>
            <li>Aplicação de pesquisas de clima organizacional anônimas</li>
            <li>Recebimento e investigação de denúncias internas</li>
            <li>Elaboração de planos de ação preventivos</li>
          </ul>
        </Section>

        <Section title="5. Uso Proibido">
          <p>É expressamente proibido:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Tentar identificar respondentes de pesquisas ou denunciantes anônimos</li>
            <li>Utilizar os dados dos colaboradores para fins que não a gestão interna de saúde e conformidade</li>
            <li>Compartilhar dados de colaboradores com terceiros não autorizados</li>
            <li>Realizar engenharia reversa, copiar ou reproduzir qualquer parte do Serviço</li>
            <li>Utilizar o Serviço para qualquer finalidade ilegal ou prejudicial a terceiros</li>
          </ul>
        </Section>

        <Section title="6. Responsabilidades da Empresa Contratante">
          <p>A Empresa contratante é responsável por:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Informar seus colaboradores sobre o uso da plataforma e as pesquisas realizadas</li>
            <li>Garantir que a coleta e o uso dos dados dos colaboradores cumprirão a LGPD</li>
            <li>Designar um administrador responsável pela gestão da conta</li>
            <li>Responder a solicitações de direitos de titulares (Art. 18, LGPD) de seus próprios colaboradores</li>
            <li>Manter as credenciais de acesso em sigilo</li>
          </ul>
        </Section>

        <Section title="7. Faturamento e Pagamento">
          <p>
            O Serviço é cobrado mensalmente por colaborador ativo, conforme a tabela de preços vigente. O faturamento ocorre
            via Stripe. Em caso de inadimplência, o acesso será suspenso até regularização. Todos os preços são em Reais (BRL)
            e incluem os tributos legalmente aplicáveis.
          </p>
        </Section>

        <Section title="8. Propriedade Intelectual">
          <p>
            Todos os direitos sobre a plataforma, código-fonte, design e conteúdo pertencem à ComplyOn. Os dados inseridos
            pela Empresa contratante permanecem de sua propriedade. A ComplyOn não reivindica propriedade sobre dados dos
            colaboradores ou conteúdo inserido pelos usuários.
          </p>
        </Section>

        <Section title="9. Disponibilidade e Suporte">
          <p>
            A ComplyOn emprega esforços razoáveis para manter o Serviço disponível continuamente, mas não garante disponibilidade
            ininterrupta. Manutenções programadas serão comunicadas com antecedência sempre que possível.
          </p>
        </Section>

        <Section title="10. Limitação de Responsabilidade">
          <p>
            Na máxima extensão permitida pela lei, a ComplyOn não será responsável por danos indiretos, incidentais ou
            consequenciais decorrentes do uso ou da impossibilidade de uso do Serviço. A responsabilidade total da ComplyOn
            fica limitada ao valor pago pela Empresa nos últimos 3 meses.
          </p>
        </Section>

        <Section title="11. Vigência e Rescisão">
          <p>
            Estes Termos vigoram enquanto a Empresa utilizar o Serviço. Qualquer das partes pode rescindir o contrato mediante
            aviso prévio de 30 dias. Após rescisão, os dados da Empresa serão mantidos por até 90 dias para fins de exportação
            e, após esse prazo, eliminados definitivamente.
          </p>
        </Section>

        <Section title="12. Alterações">
          <p>
            A ComplyOn pode atualizar estes Termos periodicamente. Alterações relevantes serão comunicadas por e-mail ou por
            aviso na plataforma com antecedência mínima de 15 dias. O uso continuado do Serviço após a vigência das novas
            condições implica aceitação.
          </p>
        </Section>

        <Section title="13. Lei Aplicável e Foro">
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de
            [Cidade/Estado da ComplyOn] para resolução de quaisquer disputas, com renúncia a qualquer outro, por mais
            privilegiado que seja.
          </p>
        </Section>

        <div className="border-t border-green-600/10 pt-6 text-center">
          <Link href="/privacidade" className="text-xs text-green-400 hover:underline">Política de Privacidade</Link>
          <span className="text-[#6B7280] mx-2">·</span>
          <Link href="/" className="text-xs text-[#6B7280] hover:text-green-400">Página inicial</Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-[#dcfce7] border-b border-green-600/20 pb-2">{title}</h2>
      <div className="text-[#9CA3AF] text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
