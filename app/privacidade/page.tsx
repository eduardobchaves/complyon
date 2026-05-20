import Link from "next/link";
import { Brain } from "lucide-react";

export const metadata = { title: "Política de Privacidade — SafeMind NR-01" };

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#0F0A1A] text-white">
      <header className="border-b border-purple-500/20 bg-[#1A1030]">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[#E9D5FF] font-[var(--font-sora)]">SafeMind NR-01</span>
          </Link>
          <Link href="/login" className="text-xs text-purple-400 hover:text-purple-300">Acessar plataforma</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#E9D5FF] font-[var(--font-sora)]">Política de Privacidade</h1>
          <p className="text-[#9CA3AF] mt-2 text-sm">Última atualização: maio de 2026 — em conformidade com a LGPD (Lei 13.709/2018)</p>
        </div>

        <Section title="1. Quem somos">
          <p>
            A <strong>SafeMind</strong> ("Operador") é a empresa responsável pela plataforma SafeMind NR-01, que oferece ferramentas de
            gestão de saúde mental e conformidade trabalhista às empresas clientes ("Controladores"). Cada empresa contratante é o
            Controlador dos dados de seus próprios colaboradores; a SafeMind atua como Operador no tratamento desses dados.
          </p>
          <p className="mt-3">
            <strong>Encarregado de Dados (DPO):</strong> [Nome do responsável]<br />
            <strong>E-mail:</strong> privacidade@safemind.com.br<br />
            <strong>Endereço:</strong> [Endereço completo da SafeMind]
          </p>
        </Section>

        <Section title="2. Quais dados tratamos e por quê">
          <Table
            headers={["Categoria de dado", "Finalidade", "Base legal (LGPD)", "Retenção"]}
            rows={[
              ["Nome e e-mail do colaborador", "Identificação na plataforma e envio de pesquisas", "Execução de contrato (Art. 7º, V)", "Durante o vínculo + 5 anos"],
              ["Respostas às pesquisas de bem-estar", "Avaliação de riscos psicossociais (NR-01)", "Obrigação legal (Art. 7º, II) + Consentimento do titular (Art. 11, II, a)", "5 anos"],
              ["Descrição de denúncias", "Investigação interna de irregularidades", "Obrigação legal (Art. 7º, II) + Legítimo interesse (Art. 7º, IX)", "5 anos"],
              ["Dados de acesso e sessão", "Autenticação segura na plataforma", "Execução de contrato (Art. 7º, V)", "Duração da sessão"],
              ["Nome, e-mail e CNPJ do administrador", "Gestão da conta e faturamento", "Execução de contrato (Art. 7º, V)", "Duração do contrato + 5 anos"],
            ]}
          />
          <p className="mt-4 text-sm text-[#9CA3AF]">
            <strong className="text-[#E9D5FF]">Dados de saúde (dados sensíveis):</strong> As respostas às pesquisas de bem-estar
            mental são classificadas como dados sensíveis nos termos do Art. 5º, II da LGPD. O seu tratamento ocorre com base na
            obrigação legal da NR-01 e, quando exigido pelo Art. 11, no consentimento explícito do titular obtido antes do início
            de cada pesquisa.
          </p>
        </Section>

        <Section title="3. Anonimato nas pesquisas e denúncias">
          <p>
            As respostas às pesquisas de saúde mental são <strong>completamente anônimas</strong>. Nenhum dado que permita
            identificar o respondente é armazenado junto às respostas. O e-mail de convite utilizado para envio do link de pesquisa
            é apagado do sistema no momento em que o link é utilizado.
          </p>
          <p className="mt-3">
            As denúncias submetidas pelo Canal de Denúncias também são anônimas. Não são registrados endereço IP, dispositivo,
            localização ou qualquer outro dado técnico do denunciante.
          </p>
        </Section>

        <Section title="4. Compartilhamento com terceiros">
          <p>A SafeMind utiliza os seguintes suboperadores para prestação do serviço:</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><strong className="text-[#E9D5FF]">Stripe Inc. (EUA)</strong> — processamento de pagamentos. Dados compartilhados: nome e e-mail do administrador da empresa. Transferência internacional coberta por Cláusulas Contratuais Padrão.</li>
            <li><strong className="text-[#E9D5FF]">Resend Inc. (EUA)</strong> — envio de e-mails transacionais. Dados compartilhados: e-mail dos colaboradores (somente para envio de convite de pesquisa). Transferência internacional coberta por Cláusulas Contratuais Padrão.</li>
            <li><strong className="text-[#E9D5FF]">Provedor de infraestrutura (banco de dados e hospedagem)</strong> — armazenamento de todos os dados da plataforma. O provedor contratado e sua localização são informados sob solicitação ao DPO.</li>
          </ul>
          <p className="mt-3 text-sm text-[#9CA3AF]">
            Não vendemos, alugamos ou compartilhamos dados pessoais com terceiros para fins comerciais ou de marketing.
          </p>
        </Section>

        <Section title="5. Transferências internacionais">
          <p>
            Alguns suboperadores listados na seção 4 estão localizados fora do Brasil. As transferências internacionais de dados são
            realizadas com base em Cláusulas Contratuais Padrão aprovadas pela ANPD ou por mecanismos equivalentes que garantam nível
            de proteção adequado (Art. 33 da LGPD).
          </p>
        </Section>

        <Section title="6. Seus direitos como titular (Art. 18 da LGPD)">
          <p>Você tem os seguintes direitos em relação aos seus dados pessoais:</p>
          <ul className="mt-3 space-y-1.5 text-sm list-disc pl-5">
            <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e obter uma cópia.</li>
            <li><strong>Correção:</strong> solicitar a correção de dados incompletos ou inexatos.</li>
            <li><strong>Anonimização, bloqueio ou eliminação:</strong> quando os dados forem desnecessários, excessivos ou tratados em desconformidade com a LGPD.</li>
            <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado e interoperável.</li>
            <li><strong>Revogação do consentimento:</strong> retirar o consentimento a qualquer momento (sem efeito retroativo).</li>
            <li><strong>Oposição:</strong> se opor ao tratamento realizado com base em legítimo interesse.</li>
            <li><strong>Informação sobre compartilhamento:</strong> saber com quem seus dados são compartilhados.</li>
            <li><strong>Revisão de decisões automatizadas:</strong> solicitar revisão de decisões tomadas exclusivamente por meios automatizados.</li>
          </ul>
          <p className="mt-4 text-sm">
            Para exercer qualquer desses direitos, entre em contato com:{" "}
            <a href="mailto:privacidade@safemind.com.br" className="text-purple-400 underline">privacidade@safemind.com.br</a>.
            Responderemos em até 15 dias corridos (Art. 19, §3º).
          </p>
        </Section>

        <Section title="7. Segurança dos dados">
          <p>
            Adotamos medidas técnicas e administrativas para proteger os dados pessoais contra acesso não autorizado, destruição,
            perda, alteração ou divulgação indevida, incluindo: autenticação segura com senha criptografada (bcrypt), comunicação
            cifrada via HTTPS, controle de acesso por perfil de usuário e isolamento de dados por empresa (CNPJ).
          </p>
          <p className="mt-3">
            Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, notificaremos a ANPD e os
            titulares afetados em prazo razoável, conforme Art. 48 da LGPD.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            Utilizamos apenas cookies estritamente necessários para o funcionamento da plataforma (sessão de autenticação). Não
            utilizamos cookies de rastreamento, publicidade ou análise de comportamento.
          </p>
        </Section>

        <Section title="9. Retenção e exclusão">
          <p>
            Os dados são mantidos pelo prazo necessário à finalidade que motivou sua coleta ou pelo prazo legal aplicável. Ao
            término do prazo, os dados são eliminados ou anonimizados de forma irreversível. Administradores podem solicitar a
            exclusão antecipada dos dados de colaboradores a qualquer momento pelo painel de administração.
          </p>
        </Section>

        <Section title="10. Contato e reclamações">
          <p>
            Para dúvidas, solicitações ou reclamações sobre o tratamento de dados, entre em contato com nosso Encarregado de Dados:
          </p>
          <p className="mt-2">
            📧{" "}
            <a href="mailto:privacidade@safemind.com.br" className="text-purple-400 underline">
              privacidade@safemind.com.br
            </a>
          </p>
          <p className="mt-3 text-sm text-[#9CA3AF]">
            Você também tem o direito de peticionar à Autoridade Nacional de Proteção de Dados (ANPD) em caso de descumprimento
            desta política:{" "}
            <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer" className="text-purple-400 underline">
              www.gov.br/anpd
            </a>.
          </p>
        </Section>

        <div className="border-t border-purple-500/10 pt-6 text-center">
          <Link href="/termos" className="text-xs text-purple-400 hover:underline">Termos de Uso</Link>
          <span className="text-[#6B7280] mx-2">·</span>
          <Link href="/" className="text-xs text-[#6B7280] hover:text-purple-400">Página inicial</Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-[#E9D5FF] border-b border-purple-500/20 pb-2">{title}</h2>
      <div className="text-[#9CA3AF] text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-purple-500/20">
      <table className="w-full text-xs">
        <thead className="bg-[#221540]">
          <tr>
            {headers.map(h => (
              <th key={h} className="px-3 py-2 text-left text-[#C4B5FD] font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-purple-500/10">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-[#9CA3AF]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
