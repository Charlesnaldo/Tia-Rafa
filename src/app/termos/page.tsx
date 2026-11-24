import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { contact } from "@/config/contact";

export const metadata: Metadata = { title: "Termos de compra e uso" };

export default function TermsPage() {
  return <LegalPage title="Termos de compra e uso">
    <section><h2>Identificação e atendimento</h2>
      <p>A loja Tia Rafa é operada por [PREENCHER: nome ou razão social, CPF/CNPJ, endereço e demais dados de identificação]. Para dúvidas, entrega, cancelamento ou problemas de acesso, entre em contato pelo e-mail <a href={`mailto:${contact.email}`}>{contact.email}</a> ou pelo <a href={contact.whatsappUrl}>WhatsApp {contact.whatsappDisplay}</a>.</p>
    </section>
    <section><h2>Materiais e informações da oferta</h2>
      <p>A loja oferece materiais didáticos digitais, principalmente em PDF. Não há envio de material impresso quando o produto está identificado como digital. Caso haja item físico, prevalecem as informações específicas de entrega, frete e prazo exibidas na oferta.</p>
      <p>Confira descrição, arquivos incluídos, formato, preço e requisitos antes de comprar. Para usar os materiais digitais, é preciso um leitor de PDF (gratuito no computador e no celular) e, para imprimir, uma impressora comum em papel A4.</p>
    </section>
    <section><h2>Compra, pagamento e entrega</h2>
      <p>Os preços e condições são os apresentados na oferta e no checkout. O processamento do pagamento ocorre pelo Mercado Pago, conforme o meio escolhido e a confirmação recebida pela loja. Forneça dados corretos, especialmente o e-mail de entrega.</p>
      <p>Após a aprovação, o acesso digital é disponibilizado pelos canais informados na confirmação do pedido. Verifique também a pasta de spam. Se o material não chegar ou houver falha no arquivo, informe o número do pedido ao atendimento. O e-mail com o material é enviado automaticamente assim que o Mercado Pago confirma o pagamento, normalmente em poucos minutos no Pix. O arquivo vai anexado ao e-mail, para você guardar, e o link de download do e-mail vale por 7 dias. Depois disso, ou se perder o arquivo, peça o reenvio a qualquer momento pelo atendimento, informando o e-mail usado na compra.</p>
    </section>
    <section><h2>Direito de arrependimento e problemas no pedido</h2>
      <p>Nas compras realizadas pela internet, é assegurado o direito de arrependimento nos termos do artigo 49 do Código de Defesa do Consumidor, no prazo legal de sete dias contados da assinatura ou do recebimento, conforme o caso. Solicite o cancelamento pelo atendimento, informando os dados necessários para localizar a compra.</p>
      <p>O pedido será tratado conforme a legislação e as regras do meio de pagamento, sem prejuízo dos direitos do consumidor em caso de defeito, falha na entrega ou descumprimento da oferta. O acesso ou download, por si só, não é tratado aqui como renúncia automática aos direitos legais. Para cancelar, envie ao atendimento o e-mail usado na compra e o número do pedido em até 7 dias após o recebimento. O estorno é feito pelo Mercado Pago, no mesmo meio de pagamento usado (Pix ou cartão), e confirmamos o cancelamento por e-mail.</p>
    </section>
    <section><h2>Uso dos materiais e direitos autorais</h2>
      <p>A compra concede o direito de uso descrito na oferta, sem transferir a titularidade dos direitos autorais. A licença é pessoal: você pode imprimir o material quantas vezes quiser para usar com as suas turmas e alunos. Para uso por uma escola inteira ou por vários professores, consulte o atendimento.</p>
      <p>Revenda, redistribuição pública ou compartilhamento dos arquivos devem respeitar a licença e a legislação. Havendo dúvida sobre uma utilização, consulte o atendimento antes de publicar ou distribuir o material.</p>
    </section>
    <section><h2>Dados pessoais e continuidade do serviço</h2>
      <p>O tratamento dos dados é descrito na <a href="/privacidade">política de privacidade</a>. Guarde a confirmação da compra e evite compartilhar links de acesso que contenham dados do seu pedido.</p>
      <p>Problemas técnicos podem exigir correção ou reenvio de arquivos. Isso não afasta a responsabilidade pelo cumprimento da oferta e os direitos assegurados pela legislação brasileira.</p>
    </section>
    <section><h2>Atualizações e solução de dúvidas</h2>
      <p>As condições da oferta vigentes no momento da compra integram a contratação. Alterações posteriores destes termos não devem reduzir direitos já adquiridos. Buscaremos resolver dúvidas pelo atendimento, preservando o acesso aos órgãos de defesa do consumidor e ao Judiciário competente.</p>
      <p>Referência: <a href="https://www.procon.sp.gov.br/reclamacoes-de-compras-online/">orientações do Procon sobre compras pela internet</a>.</p>
    </section>
  </LegalPage>;
}
