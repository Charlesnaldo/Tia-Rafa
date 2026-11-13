import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { contact } from "@/config/contact";

export const metadata: Metadata = { title: "Privacidade | Tia Rafa" };

export default function PrivacyPage() {
  return <LegalPage title="Política de privacidade">
    <section><h2>Quem é responsável pelos dados</h2>
      <p>A loja Tia Rafa, em tiarafaela.com.br, é operada por [PREENCHER: nome ou razão social, CPF/CNPJ e endereço]. Essa pessoa ou empresa é responsável pelas decisões sobre o tratamento de dados pessoais descrito nesta política.</p>
      <p>Para falar sobre seus dados, escreva para <a href={`mailto:${contact.email}`}>{contact.email}</a>. [PREENCHER: identificação e contato do encarregado, quando aplicável].</p>
    </section>
    <section><h2>Dados utilizados e finalidades</h2>
      <p>No atendimento e na compra, podemos tratar nome, e-mail, telefone, CPF, itens do pedido e identificadores e situação do pagamento. Esses dados permitem preparar a compra, processar o pagamento, entregar os materiais e prestar suporte. O tratamento necessário à compra se fundamenta na execução de contrato ou em procedimentos solicitados pelo cliente.</p>
      <p>Dados também podem ser conservados para cumprir obrigações legais e exercer direitos. [PREENCHER: obrigações aplicáveis e dados efetivamente utilizados para prevenção a fraudes, com a respectiva base legal].</p>
      <p>O serviço é destinado a responsáveis adultos e profissionais de educação. Evite enviar dados pessoais de crianças em mensagens ou pedidos.</p>
    </section>
    <section><h2>Prestadores e compartilhamento</h2>
      <p>Utilizamos serviços de infraestrutura e banco de dados, pagamento e envio de e-mails para operar a loja. O projeto utiliza Supabase, Mercado Pago e Resend; confirme em [PREENCHER: lista de operadores e serviços realmente ativos]. Dados são compartilhados conforme a necessidade de cada serviço e suas obrigações.</p>
      <p>Ao acessar links para WhatsApp, Instagram ou outros serviços externos, suas interações também seguem as políticas dessas plataformas. [PREENCHER: países envolvidos e mecanismos aplicáveis às transferências internacionais].</p>
    </section>
    <section><h2>Armazenamento no navegador e análise de acesso</h2>
      <p>O navegador armazena informações do carrinho e da sessão de compra para permitir a continuidade da navegação. Apagar esses dados pode esvaziar o carrinho ou encerrar funcionalidades de sessão.</p>
      <p>Quando o Google Analytics estiver configurado, ele poderá coletar informações de uso e identificadores conforme a configuração adotada. [PREENCHER: cookies, prazos, base legal, configuração de análise e mecanismo de escolha para recursos opcionais]. O carregamento tardio de um script não substitui a definição de sua base legal.</p>
    </section>
    <section><h2>Conservação e proteção</h2>
      <p>Os dados devem ser mantidos pelo tempo necessário às finalidades informadas e às obrigações aplicáveis. [PREENCHER: prazos de conservação por categoria, rotina de eliminação e medidas de segurança efetivamente adotadas]. Nenhum serviço eletrônico oferece garantia absoluta contra incidentes.</p>
    </section>
    <section><h2>Seus direitos</h2>
      <p>Nos termos da LGPD, você pode solicitar confirmação de tratamento, acesso, correção, informações sobre compartilhamento e, quando cabíveis, anonimização, bloqueio, eliminação, portabilidade, oposição e revogação do consentimento. Algumas informações poderão ser conservadas para cumprir obrigação legal ou exercer direitos.</p>
      <p>Envie sua solicitação para <a href={`mailto:${contact.email}`}>{contact.email}</a>. Podemos solicitar informações proporcionais para confirmar sua identidade. Você também pode recorrer à <a href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares">Autoridade Nacional de Proteção de Dados</a> e aos órgãos competentes.</p>
    </section>
    <section><h2>Atualizações</h2><p>Esta política deve ser atualizada quando houver mudanças no tratamento. [PREENCHER: forma de comunicar alterações relevantes]. Consulte também os <a href="/termos">termos de compra e uso</a>.</p></section>
  </LegalPage>;
}
