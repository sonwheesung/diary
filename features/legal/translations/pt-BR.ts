import type { LegalDoc } from '@/features/legal/legal-text';

/**
 * Política de privacidade — português (Brasil).
 *
 * 🔴 **O texto em coreano é o original e prevalece.** Esta é uma tradução para facilitar a
 *   leitura; em caso de divergência, vale `legal-text.ts` (coreano).
 * ⚠ **A estrutura deve coincidir exatamente com a coreana** — mesmo número de seções e de
 *   linhas em cada uma. `npm run check:legal` verifica isso.
 */
export const PRIVACY_PT_BR: LegalDoc = {
  title: 'Política de Privacidade do Jogak',
  sourceFingerprint: '4b621b97',
  effective: '2026-08-09',
  updated: '2026-08-11',
  intro:
    'A Vivace Games (“a operadora”) cumpre a Lei de Proteção de Informações Pessoais e demais normas aplicáveis e trata os dados pessoais das pessoas usuárias do “Jogak” (“o serviço”) conforme descrito abaixo. O Jogak não envia a nenhum servidor os registros de diário que você escreve e, por princípio, coleta apenas as informações mínimas necessárias.',
  sections: [
    {
      h: '1. O que não coletamos (dizemos primeiro)',
      body: [
        'A operadora não coleta as informações a seguir nem as transmite para fora do seu dispositivo.',
        '• Títulos, texto, listas, fotos, tags e emoções dos registros — ficam somente no armazenamento interno do seu dispositivo.',
        '• O PIN, o padrão ou a resposta de dica do bloqueio do app — ficam no armazenamento seguro do dispositivo apenas em forma não recuperável (um hash); o original não é armazenado em lugar nenhum.',
        '• Seu nome, data de nascimento, telefone, endereço, lista de contatos, localização ou qualquer registro de acesso a toda a sua galeria de fotos.',
        'As fotos que você escolhe no app são apenas copiadas para a pasta do próprio app no seu dispositivo, para poderem ser inseridas em um registro; elas não são transmitidas a lugar algum.',
      ],
    },
    {
      h: '2. Dados pessoais que coletamos',
      body: [
        'a. Quando você usa “Contato” (exige login)',
        '• Obrigatório: o e-mail da sua conta Google e o identificador único da conta social (o “sub” do Google)',
        '  — Base legal: Lei de Proteção de Informações Pessoais, art. 15(1)4 (necessário para executar as medidas solicitadas pela pessoa usuária, ou seja, responder à sua mensagem)',
        '  — Finalidade: identificar quem escreveu, enviar a resposta e permitir que você consulte o próprio histórico',
        '• Categoria e conteúdo da mensagem',
        '• Tipo de dispositivo (Android/iOS) e versão do app — para entender em que ambiente o problema ocorreu',
        '※ O login só é necessário para “Contato”; escrever registros, o bloqueio do app e as demais funções não exigem login.',
        '※ Crianças menores de 14 anos não podem usar a função de login.',
        'b. Informações coletadas automaticamente durante a exibição de anúncios',
        '• Identificador de publicidade (ID de publicidade do Android), informações de dispositivo e rede, registros de exibição e cliques',
        '• O acima é coletado pelo Google (AdMob); os detalhes e como recusar estão na seção 7.',
      ],
    },
    {
      h: '3. Finalidades do tratamento',
      body: [
        '• Receber e tratar mensagens: verificar o que você enviou e identificar e corrigir falhas',
        '• Identificar quem escreveu e responder: entregar a resposta e permitir que você reveja seu próprio histórico',
        '• Exibir anúncios: oferecer publicidade a quem usa a versão gratuita e medir seu desempenho',
        'A operadora não usa os dados pessoais para finalidades diferentes das acima e, se a finalidade mudar, obterá consentimento previamente.',
      ],
    },
    {
      h: '4. Prazos de retenção e uso',
      body: [
        '• Dados da conta (e-mail, “sub” do Google): até você excluir sua conta. Ao excluí-la, destruímos sem demora ou deixamos em forma não rastreável.',
        '• Conteúdo das mensagens: 3 anos a contar do recebimento (Lei de Proteção ao Consumidor no Comércio Eletrônico — registros sobre reclamações ou solução de conflitos)',
        '• Dados comportamentais baseados no identificador de publicidade: até 1 ano a contar da coleta',
        'Decorrido o prazo ou cumprida a finalidade, destruímos os dados sem demora.',
      ],
    },
    {
      h: '5. Fornecimento a terceiros',
      body: [
        'A operadora não fornece a terceiros os dados pessoais das pessoas usuárias.',
        'Excetuam-se os casos em que haja disposição legal específica ou em que autoridade investigativa faça a solicitação seguindo os procedimentos e formas previstos em lei.',
      ],
    },
    {
      h: '6. Terceirização do tratamento e transferência internacional',
      body: [
        'Para prestar o serviço, a operadora terceiriza o tratamento conforme abaixo, e parte dele ocorre fora da Coreia.',
        '• Google LLC — País: Estados Unidos. Contato: https://support.google.com/policies/contact/general_privacy_form. Finalidade: exibir e medir anúncios (AdMob) e login com conta Google. Dados: identificador de publicidade, informações de dispositivo e rede e, no login, o e-mail e o identificador da conta. Quando e como: transmitidos pela rede ao solicitar um anúncio e ao fazer login. Retenção: conforme a política de privacidade do Google',
        '• Supabase Inc. — País: Estados Unidos (sede). Contato: privacy@supabase.com. Finalidade: armazenar em banco de dados as informações de mensagens e contas. Dados: os da seção 2(a). Quando e como: transmitidos pela rede ao enviar uma mensagem. Retenção: os prazos da seção 4. ※ O local físico de armazenamento é a República da Coreia (região de Seul), mas informamos como transferência internacional porque a empresa operadora fica fora da Coreia.',
        '• Vercel Inc. — País: Estados Unidos. Contato: privacy@vercel.com. Finalidade: operar o servidor que recebe as mensagens. Dados: os da seção 2(a). Quando e como: transmitidos pela rede ao enviar uma mensagem. Retenção: até o término do contrato de terceirização',
        'Você pode recusar a transferência internacional dos seus dados. Para recusar as transferências ligadas à publicidade, desative os anúncios personalizados conforme a seção 7; para recusar as ligadas às mensagens, basta não usar a função “Contato” (todas as demais funções, inclusive escrever registros, continuam disponíveis).',
      ],
    },
    {
      h: '7. Identificadores de publicidade e outros meios de coleta automática, e como recusar',
      body: [
        'O serviço usa o Google AdMob para exibir anúncios a quem usa a versão gratuita. O AdMob pode coletar e usar um identificador de publicidade para oferecer anúncios personalizados.',
        'Finalidade da coleta: oferecer anúncios personalizados, medir seu desempenho e evitar cliques fraudulentos',
        'Como recusar (Android): Configurações > Privacidade > Anúncios > “Excluir ID de publicidade” ou “Desativar a personalização de anúncios”',
        'Como recusar (iOS): Ajustes > Privacidade e Segurança > Rastreamento > desative “Permitir que os apps solicitem rastreamento”',
        'Mesmo se você recusar, anúncios ainda poderão aparecer, mas serão anúncios genéricos, não baseados nos seus interesses.',
        'Mais sobre como o Google trata dados pessoais para publicidade: https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Procedimento e método de destruição',
      body: [
        'Procedimento: dados pessoais cujo prazo tenha vencido ou cuja finalidade tenha sido cumprida são destruídos sem demora. Quando a lei exigir retenção, ficam armazenados separadamente dos demais durante esse prazo e depois são destruídos.',
        'Método: informações em formato de arquivo eletrônico são excluídas de forma permanente por meios técnicos que impedem recuperação ou reconstrução.',
        'Registros, fotos e informações de bloqueio guardados no seu dispositivo são removidos dele quando você usa a função “Redefinir tudo” do app ou o desinstala. A operadora não detém essas informações e, portanto, não pode excluí-las por você.',
      ],
    },
    {
      h: '9. Direitos do titular e do representante legal, e como exercê-los',
      body: [
        'Você pode exercer a qualquer momento os seguintes direitos.',
        '• Solicitar acesso aos seus dados • Solicitar correção em caso de erro • Solicitar exclusão • Solicitar suspensão do tratamento • Solicitar a portabilidade dos seus dados (Lei de Proteção de Informações Pessoais, art. 35-2)',
        'Você pode exercê-los por escrito ou por e-mail usando o contato da seção 11, e a operadora agirá sem demora.',
        'Se você solicitar a correção de um erro nos seus dados, não os usaremos nem os forneceremos até que a correção esteja concluída.',
        'O representante legal de uma criança menor de 14 anos pode exercer os direitos acima em nome dela.',
      ],
    },
    {
      h: '10. Medidas para garantir a segurança',
      body: [
        '• Administrativas: reduzir ao mínimo o número de pessoas que tratam dados pessoais e treiná-las periodicamente',
        '• Técnicas: controle de acesso ao sistema de tratamento, criptografia em trânsito (HTTPS), armazenamento do segredo do bloqueio como hash e uso do armazenamento seguro do dispositivo (Keystore/Keychain)',
        '• Físicas: os servidores que guardam dados pessoais ficam em data centers de provedores de nuvem nacionais e estrangeiros e seguem as políticas de controle de acesso físico desses provedores.',
        '⚠ A função de bloqueio impede o acesso à tela; ela não criptografa os arquivos de diário guardados no dispositivo. Se o dispositivo for perdido ou tomado e a segurança dele for quebrada, o conteúdo dos registros pode ser exposto.',
      ],
    },
    {
      h: '11. Encarregado de privacidade e departamento que recebe e trata pedidos de acesso',
      body: [
        'A operadora assume a responsabilidade geral pelo tratamento de dados pessoais e designa o encarregado de privacidade abaixo para tratar reclamações e pedidos de reparação relacionados a esse tratamento.',
        '• Encarregado de privacidade: Son Hwi-seong (cargo: representante)',
        '• Contato: support@vivace-games.com',
        '• Departamento que recebe e trata pedidos de acesso: o mesmo',
        'Você pode dirigir ao encarregado de privacidade qualquer dúvida, reclamação ou pedido de reparação sobre privacidade que surja ao usar o serviço. A operadora responderá e agirá sem demora.',
      ],
    },
    {
      h: '12. Como buscar reparação por violação de direitos',
      body: [
        'Para obter reparação por violação dos seus dados pessoais, você pode recorrer aos seguintes órgãos coreanos para mediação ou orientação.',
        '• Comitê de Mediação de Conflitos sobre Informações Pessoais: 1833-6972 (na Coreia) / www.kopico.go.kr',
        '• Central de Denúncias de Violação de Privacidade: 118 (na Coreia) / privacy.kisa.or.kr',
        '• Procuradoria-Geral, Divisão de Investigação Cibernética: 1301 (na Coreia) / www.spo.go.kr',
        '• Agência Nacional de Polícia, Departamento de Investigação Cibernética: 182 (na Coreia) / ecrm.police.go.kr',
        'Além disso, quem tiver direitos ou interesses violados por decisão ou omissão do responsável por órgão público quanto a pedido formulado nos termos dos arts. 35 (acesso), 36 (correção e exclusão) ou 37 (suspensão do tratamento) da Lei de Proteção de Informações Pessoais poderá interpor recurso administrativo conforme a Lei de Recursos Administrativos.',
      ],
    },
    {
      h: '13. Alterações desta política de privacidade',
      body: [
        'Esta política de privacidade se aplica a partir da sua data de vigência.',
        'Quando houver acréscimo, remoção ou alteração de conteúdo por mudanças na lei, na política ou na tecnologia de segurança, avisaremos por meio de comunicados no app a partir de 7 dias antes de a mudança entrar em vigor (30 dias antes, se a mudança for desfavorável às pessoas usuárias).',
        'As alterações previstas são publicadas com antecedência em “Alterações previstas”, ao final deste documento, em formato que permite comparar o antes e o depois.',
        'Histórico de alterações',
        '• 2026-08-09 primeira versão',
        '• 2026-08-11 publicação de alteração prevista — previsão de introduzir a assinatura mensal e o backup/restauração (o texto principal ainda não mudou)',
      ],
    },
  ],
  pending: [
    {
      appliesFrom:
        'A partir do dia em que for publicada a versão que inclui a assinatura mensal e o backup/restauração',
      summary:
        'Serão adicionados a assinatura mensal e o backup/restauração. Se você assinar, serão tratados o status da assinatura e o identificador da transação; e somente se você ativar o backup, uma cópia dos seus registros criptografada no seu dispositivo será guardada no servidor da operadora. A operadora não consegue descriptografar essa cópia.',
      sections: [
        {
          h: 'a. O que muda (antes → depois)',
          body: [
            'Antes: títulos, texto e fotos dos registros não são transmitidos para fora do seu dispositivo.',
            'Depois: **somente se você mesmo ativar o backup**, uma cópia dos seus registros criptografada no seu dispositivo será guardada no servidor da operadora. Se não ativar, nem um caractere é transmitido, exatamente como antes.',
            '⚠ Para ser preciso: a operadora **guarda essa cópia, mas não consegue lê-la.** A chave de descriptografia existe apenas no seu dispositivo e no código de recuperação que você guarda; a operadora não a possui.',
          ],
        },
        {
          h: 'b. Informações adicionais guardadas se você ativar o backup',
          body: [
            '• Uma cópia criptografada dos seus registros — em uma forma que a operadora não consegue descriptografar',
            '• Identificador do backup, horário do backup, número da geração e tamanho — **essas informações não são criptografadas.** A operadora consegue saber qual conta fez backup, quando e de que tamanho.',
            '• Base legal: seu consentimento específico (obtido na tela em que você ativa o backup)',
          ],
        },
        {
          h: 'c. Prazo de retenção',
          body: [
            '• Guardado enquanto o backup estiver ativado e por até 90 dias após o término da assinatura; depois é destruído automaticamente.',
            '• Se você desativar o backup, pedir a exclusão ou excluir sua conta, destruímos sem demora, sem esperar os 90 dias.',
            '• Backups sem acesso por 3 anos ou mais são destruídos. (É o caso de quem desinstalou o app sem excluir a conta.)',
            '• O registro da destruição (identificador do backup e horário) é mantido por 1 ano — para que você possa descobrir “por que a restauração não funciona”; o identificador da conta não é mantido junto.',
            '⚠ O aviso de que a assinatura expirou chega a você somente pela tela, ao abrir o app. Se você não abrir o app, esse aviso pode não chegar.',
          ],
        },
        {
          h: 'd. Limites do direito de acesso',
          body: [
            'Se você pedir acesso ao seu backup, tudo o que a operadora pode entregar é **o texto criptografado, que não pode ser descriptografado, e os metadados do item (b).** Não podemos fornecer seus registros em formato legível — a operadora não tem a chave.',
            'Você mesmo pode restaurar a qualquer momento no app usando seu código de recuperação.',
            '⚠ Se você perder o código de recuperação, não há como abrir o backup. A operadora também não consegue abri-lo para você.',
          ],
        },
        {
          h: 'e. Informações guardadas se você usar uma assinatura',
          body: [
            '• Status da assinatura — chave de direito, data de expiração, período de carência por falha de pagamento e se será renovada',
            '• O identificador de transação emitido pela loja, o identificador do produto e se a compra foi feita no ambiente de produção ou de teste',
            '• Os registros de mudança de status enviados pelo serviço de pagamento (compra, renovação, cancelamento, reembolso etc.) e seu conteúdo original',
            '⚠ Dados de pagamento, como números de cartão ou de conta, são tratados pelo Google Play e não são repassados à operadora. A operadora só consegue saber que você pagou e até quando a assinatura é válida.',
            '• Base legal: Lei de Proteção de Informações Pessoais, art. 15(1)4 (necessário para executar as medidas solicitadas pela pessoa usuária, ou seja, fornecer o direito de assinatura solicitado)',
            '• Finalidade: confirmar o direito de assinatura (remoção de anúncios, uso do backup) e tratar dúvidas de pagamento e reembolsos',
          ],
        },
        {
          h: 'f. Prazo de retenção das informações de assinatura',
          body: [
            '• Registros sobre contratos ou arrependimento e sobre pagamento e fornecimento de bens: 5 anos (Lei de Proteção ao Consumidor no Comércio Eletrônico, art. 6)',
            '• Se você excluir sua conta, os identificadores de conta (e-mail, “sub” do Google) são deixados sem demora em forma não rastreável, e os registros de transação acima são guardados separadamente e de forma não rastreável pelo prazo indicado e depois destruídos.',
            '⚠ Excluir sua conta não cancela automaticamente sua assinatura do Google Play. Você precisa cancelá-la em Google Play > Assinaturas; se não fizer isso, continuará sendo cobrado.',
          ],
        },
        {
          h: 'g. Terceirização e transferência internacional (adicional)',
          body: [
            '• Supabase Inc. — País: Estados Unidos (sede). Contato: privacy@supabase.com. Finalidade: armazenar a cópia de backup criptografada e o status da assinatura. Dados: os dos itens (b) e (e). Retenção: os prazos dos itens (c) e (f). ※ O local físico de armazenamento é a República da Coreia (região de Seul).',
            '• Vercel Inc. — País: Estados Unidos. Contato: privacy@vercel.com. Finalidade: operar o servidor de backup. ※ A cópia criptografada vai direto para o armazenamento, sem passar por esse servidor.',
            '• RevenueCat, Inc. — País: Estados Unidos. Contato: compliance@revenuecat.com. Finalidade: verificar os pagamentos da assinatura e conferir seu status. Dados: identificador de conta, identificadores de transação e produto da loja, informações de dispositivo e app. Quando e como: transmitidos pela rede ao abrir a tela de assinatura e ao pagar. Retenção: até o término do contrato de terceirização',
            '• Google LLC — além da transferência descrita na seção 6, dados de transação da loja são tratados para processar e verificar os pagamentos da assinatura.',
            'Você pode recusar a transferência internacional. Se não ativar o backup e não assinar, essas transferências não ocorrem, e todas as demais funções, inclusive escrever registros, continuam disponíveis.',
          ],
        },
      ],
    },
    {
      appliesFrom: 'A partir do dia em que a versão com os relatórios de resumo por IA for publicada',
      summary:
        'Os relatórios de resumo por IA estão sendo adicionados. Somente quando você cria um relatório, o conteúdo do diário daquele período passa sem criptografia pelo servidor do operador e é enviado ao provedor de IA. O operador não armazena o conteúdo do diário, mas mantém o resumo gerado por 90 dias para melhorar a qualidade dos relatórios. O provedor de IA o mantém por até 30 dias para monitoramento de abuso, depois o exclui, e não o usa para treinar modelos.',
      sections: [
        {
          h: 'a. O que muda (antes → depois)',
          body: [
            'Antes: os títulos e textos do diário não são transmitidos para fora do seu dispositivo. Mesmo com o backup ativado, eles são transmitidos apenas como texto cifrado que o operador não consegue ler.',
            'Depois: **somente quando você toca em Criar relatório**, o conteúdo do diário daquele período é enviado **sem criptografia** pelo servidor do operador ao provedor de IA, e um resumo é gerado.',
            '⚠ Para ser preciso: o operador **não armazena o conteúdo do diário em si**. No entanto, ① no momento em que o resumo é feito o conteúdo passa pelo servidor do operador, então não podemos dizer que "o operador não consegue ver", e ② **o resumo gerado é mantido por 90 dias** (veja o item d). Informamos isso de forma clara, sem suavizar.',
            'Se você não criar um relatório, essa transmissão não ocorre, e todos os outros recursos, inclusive escrever entradas, continuam totalmente disponíveis.',
          ],
        },
        {
          h: 'b. Consentimento separado para informações sensíveis',
          body: [
            'Um diário pode conter informações sensíveis, como estado de saúde ou psicológico, conforme o artigo 23 da Lei de Proteção de Informações Pessoais.',
            'Como os relatórios de resumo por IA processam esse conteúdo sem criptografia, coletamos um **consentimento separado para o tratamento de informações sensíveis** na primeira vez que você usa o recurso. Esse consentimento é **separado** do consentimento de transferência ao exterior no item (c), e você pode escolher cada um de forma independente.',
            'Se você não consentir, todos os recursos além dos relatórios por IA continuam totalmente disponíveis.',
          ],
        },
        {
          h: 'c. Consentimento separado para transferência ao exterior',
          body: [
            '• OpenAI OpCo, LLC — País: Estados Unidos (1455 Third Street, San Francisco, California 94158, USA). Contato: dpo@openai.com. As mesmas informações também são exibidas no aplicativo antes da coleta do consentimento.',
            '• Itens transferidos: o título, o texto, a emoção e a data das entradas do período para o qual você solicitou um relatório',
            '• Finalidade: gerar um relatório de resumo',
            '• Quando e como: transmitidos pela rede quando você toca em Criar relatório',
            '• Retenção: o servidor do operador **não armazena os itens transferidos (o conteúdo do diário)** — eles ficam em memória apenas enquanto o resumo é feito e depois são descartados. A retenção do resumo gerado é informada separadamente no item (d). O provedor de IA os mantém por **até 30 dias** para monitoramento de abuso e depois os exclui, e mesmo nesse período **não os usa para treinar modelos.**',
            'Você pode recusar a transferência ao exterior; se recusar, apenas os relatórios por IA ficam indisponíveis e todos os outros recursos continuam totalmente disponíveis.',
          ],
        },
        {
          h: 'd. O que o operador armazena',
          body: [
            'Não armazenamos o conteúdo do diário (títulos e textos). Armazenamos o seguinte.',
            '• **O resumo gerado pela IA** — mantido para verificar e melhorar a qualidade dos relatórios. Retenção: **90 dias a partir do dia em que foi criado**, após os quais é excluído automaticamente.',
            '• O identificador da conta que criou o relatório, o período, o número de vezes e a quantidade de tokens usados — utilizados para faturamento e prevenção de abuso. Retenção: até que a finalidade seja cumprida ou até você excluir sua conta',
            '⚠ O resumo é escrito com base no seu diário, portanto pode conter conteúdo do diário. Informamos isso de forma clara, sem suavizar.',
            'O relatório finalizado é armazenado **também no seu dispositivo** e é incluído criptografado no backup, caso você o tenha ativado.',
          ],
        },
        {
          h: 'e. Seus direitos',
          body: [
            '• Os relatórios são gerados somente quando você os cria; nunca são gerados automaticamente.',
            '• Você pode excluir a qualquer momento no aplicativo um relatório que tenha criado.',
            '• Ao excluí-lo no aplicativo, ele some do seu dispositivo; o resumo mantido no servidor do operador é excluído automaticamente após 90 dias. Se quiser que seja excluído antes, pode solicitar pelo Fale conosco.',
            '• Resumos gerados por IA podem divergir dos fatos e não constituem diagnóstico ou orientação médica ou psicológica. O aplicativo oferece uma forma de denunciar um resumo.',
          ],
        },
      ],
    },
  ],
};

/**
 * Como excluir sua conta — português (Brasil).
 *
 * 🔴 **O texto em coreano é o original e prevalece** (`legal-text.ts`). Mesma regra da política
 *   de privacidade: esta é uma tradução para facilitar a leitura.
 *
 * ⚠ Este documento tem uma URL pública própria porque o formulário de Segurança dos dados do
 *   Play exige uma via de exclusão **na web**: quem já desinstalou o app precisa continuar
 *   podendo pedir a exclusão. É essa URL que os revisores do Play abrem, então ela não pode
 *   ficar só em coreano.
 *
 * ⚠ A estrutura deve coincidir exatamente com a coreana — 5 seções (6/4/4/3/3 linhas) mais
 *   duas alterações previstas. `npm run check:legal` verifica isso.
 */
export const DELETE_ACCOUNT_PT_BR: LegalDoc = {
  title: 'Como excluir sua conta do Jogak',
  sourceFingerprint: 'a6b3a8b5',
  effective: '2026-08-10',
  updated: '2026-08-10',
  intro:
    'Esta página explica como excluir sua conta do Jogak e os dados associados a ela. Você também pode pedir a exclusão por e-mail caso já tenha desinstalado o app ou não consiga fazer login.',
  sections: [
    {
      h: '1. Excluir você mesmo no app',
      body: [
        'Siga estes passos no app Jogak e a exclusão vale imediatamente.',
        '① Abra o app → aba [Ajustes], na parte de baixo',
        '② Escolha [Fale conosco]',
        '③ Se você não estiver conectado, faça login com sua conta Google',
        '④ Escolha [Excluir conta] no fim da tela e confirme',
        'A exclusão da conta não pode ser desfeita.',
      ],
    },
    {
      h: '2. Pedir por e-mail (se você desinstalou o app ou não consegue fazer login)',
      body: [
        'Envie o seguinte para support@vivace-games.com.',
        '• Assunto: pedido de exclusão de conta do Jogak',
        '• Corpo: o e-mail da conta Google que você usou para entrar no Jogak',
        'O endereço de onde você escreve precisa ser o mesmo que usou no cadastro, para que possamos confirmar que é você. Vamos tratar o pedido e responder em até 7 dias úteis.',
      ],
    },
    {
      h: '3. Dados que são excluídos',
      body: [
        'Ao excluir sua conta, as informações a seguir são destruídas de imediato ou deixadas em forma não rastreável.',
        '• O identificador único da sua conta social (o “sub” do Google)',
        '• Seu endereço de e-mail',
        '• O vínculo entre suas mensagens e a conta de quem as escreveu',
      ],
    },
    {
      h: '4. Dados que são mantidos e por quanto tempo',
      body: [
        'As informações a seguir são mantidas conforme a lei e, mesmo durante esse prazo, permanecem apenas em uma forma que não permite rastrear quem as escreveu (pseudonimizada).',
        '• Conteúdo das mensagens: 3 anos (Lei de Proteção ao Consumidor no Comércio Eletrônico — registros sobre reclamações ou solução de conflitos)',
        'Decorrido o prazo de retenção, destruímos os dados sem demora.',
      ],
    },
    {
      h: '5. O que não é excluído — o diário que está no seu dispositivo',
      body: [
        'Os registros do Jogak (títulos, texto, fotos, tags e emoções) ficam guardados somente dentro do seu dispositivo e não são transmitidos aos servidores da operadora.',
        'Por isso, excluir sua conta deixa intactos os registros do seu dispositivo. Para apagá-los também, desinstale o app ou use a função “Redefinir tudo” nos [Ajustes] do app.',
        'Por outro lado, se você desinstalar o app, os registros do dispositivo não poderão ser recuperados.',
      ],
    },
  ],
  pending: [
    {
      appliesFrom:
        'A partir do dia em que for publicada a versão que inclui a assinatura mensal e o backup/restauração',
      summary:
        'Se você tiver ativado o backup, excluir sua conta também exclui o backup criptografado guardado no servidor. Os registros de transação da assinatura são mantidos conforme a lei, em forma pseudonimizada.',
      sections: [
        {
          h: 'a. Dados excluídos adicionalmente',
          body: [
            '• A cópia criptografada do seu diário guardada no servidor — excluída junto com sua conta. Não esperamos os 90 dias de carência.',
            '• O identificador do backup e os registros de backup (horário, tamanho, número da geração)',
            '⚠ Isso não pode ser desfeito. Mesmo que você ainda tenha seu código de recuperação, não será possível restaurar.',
            '⚠ Os registros do seu dispositivo permanecem intactos. Só a cópia do servidor é excluída.',
          ],
        },
        {
          h: 'b. Dados mantidos adicionalmente e por quanto tempo',
          body: [
            '• Registros de transação da assinatura (identificador da transação, produto, período de assinatura, histórico de mudanças do status de pagamento): 5 anos (Lei de Proteção ao Consumidor no Comércio Eletrônico, art. 6)',
            '• O registro de que um backup foi destruído (identificador do backup e horário da destruição): 1 ano — para que você possa descobrir “por que a restauração não funciona”. O identificador da sua conta não é mantido junto.',
            'Mesmo durante esses prazos, esses registros permanecem apenas em uma forma que não permite rastrear quem os escreveu.',
          ],
        },
        {
          h: 'c. A assinatura precisa ser cancelada separadamente',
          body: [
            'Excluir sua conta não cancela sua assinatura do Google Play. Se você não cancelá-la, continuará sendo cobrado.',
            'Para cancelar: app Google Play Store > perfil > Pagamentos e assinaturas > Assinaturas (https://play.google.com/store/account/subscriptions)',
            'O reembolso de valores já cobrados segue a política de reembolso do Google Play e a política de reembolso da operadora. Fale conosco pelo contato indicado abaixo.',
          ],
        },
      ],
    },
    {
      appliesFrom: 'A partir do dia em que a versão com os relatórios de resumo por IA for publicada',
      summary:
        'O texto dos relatórios de IA fica guardado no seu dispositivo. No servidor, os resumos dos relatórios são mantidos por até 90 dias para verificação de qualidade e são excluídos junto com seus registros de uso quando você exclui sua conta.',
      sections: [
        {
          h: 'a. O que é excluído nos relatórios por IA',
          body: [
            '• Os registros de uso mantidos no servidor (identificador da conta, período, número de vezes, quantidade de tokens) — excluídos junto com sua conta.',
            '• Os resumos dos relatórios mantidos no servidor (por até 90 dias) — excluídos junto com sua conta. O conteúdo do diário não é armazenado, portanto não há nada a apagar.',
            '⚠ O texto dos relatórios também fica guardado no seu dispositivo, então permanece lá mesmo depois de você excluir sua conta. Para apagá-lo, exclua os relatórios no app ou desinstale o app.',
            '• Se você tiver ativado o backup, os relatórios são incluídos nele de forma criptografada e são excluídos quando o backup é excluído.',
          ],
        },
      ],
    },
  ],
};

/**
 * Termos de uso — português do Brasil.
 *
 * 🔴 **O texto coreano é o original e prevalece** (`legal-text.ts`). Esta é uma tradução para
 *   facilitar a leitura; havendo divergência, rege o coreano. O próprio artigo 22 diz isso
 *   dentro do documento, e é o que torna seguro publicar a tradução.
 *
 * ⚠ **A estrutura deve coincidir exatamente com a coreana** — 22 artigos, o mesmo número de
 *   linhas em cada um e sem “alterações previstas”. `npm run check:legal` verifica isso.
 *   Dividir uma frase coreana em duas reprova a checagem, e juntar duas esconde uma cláusula perdida.
 *
 * ⚠ Este documento existe por causa do **art. 13(2) da Lei de Proteção ao Consumidor no
 *   Comércio Eletrônico**: informação antes do contrato e entrega por escrito das condições
 *   depois dele. Os itens 5 (arrependimento), 6 (reembolsos), 8 (reclamações e conflitos) e
 *   9 (os próprios termos e como consultá-los) não têm outro lugar onde caber. Cada artigo é
 *   o recipiente de um item específico, portanto **nenhum artigo pode perder seu conteúdo
 *   jurídico para ficar mais fácil de ler.** Os três mais delicados:
 *
 *   - O art. 12 reproduz em substância os arts. 17(2)5 e 17(6). “o fornecimento do conteúdo
 *     digital já foi iniciado”, “a parte ainda não fornecida de um conteúdo digital fornecido
 *     em partes” e “indicar esse fato **e, ao mesmo tempo**, oferecer ... como produto de
 *     experimentação” são requisitos legais: se forem suavizados, a restrição é nula.
 *   - A primeira linha do art. 20 é a proteção contra o art. 35 (contratos desfavoráveis ao
 *     consumidor). **Nunca acrescentar “na máxima extensão permitida por lei”** nem fórmula
 *     equivalente: isso inverte a frase e a transforma justamente no que ela veio recusar.
 *   - O art. 22 é o art. 36 (foro exclusivo): o domicílio **da pessoa usuária**, nunca o da
 *     operadora. Indicar o da operadora seria nulo nos termos do art. 35.
 *
 * ⚠ «청약철회» é traduzido como **“arrependimento”**, distinto do **“cancelamento”** da
 *   assinatura do artigo 14: o Jogak Pro *é* uma assinatura, e os dois remédios não podem se
 *   confundir dentro de um mesmo documento.
 */
export const TERMS_PT_BR: LegalDoc = {
  title: 'Termos de Uso do Jogak',
  sourceFingerprint: '898aa8d7',
  effective: '2026-08-17',
  updated: '2026-08-17',
  intro:
    'Estes termos definem os direitos, as obrigações e as responsabilidades entre a Hwiseong Games (marca: Vivace Games, “a operadora”) e as pessoas usuárias, quanto ao uso do aplicativo móvel “Jogak” (“o serviço”) oferecido pela operadora. Leia-os antes de usar o serviço.',
  sections: [
    {
      h: 'Artigo 1 (Finalidade e âmbito de aplicação)',
      body: [
        'Estes termos têm por finalidade estabelecer as condições e os procedimentos de uso do serviço e os direitos e obrigações da operadora e da pessoa usuária.',
        'Estes termos se aplicam a todas as pessoas que usam o serviço. Aplicam-se da mesma forma quando você apenas escreve registros sem fazer login.',
        'O que não estiver previsto nestes termos rege-se pela legislação aplicável, incluindo a Lei de Proteção ao Consumidor no Comércio Eletrônico, a Lei sobre a Regulação das Condições Gerais dos Contratos e a Lei de Promoção da Indústria de Conteúdos, e pelos usos comerciais.',
      ],
    },
    {
      h: 'Artigo 2 (Informações da operadora)',
      body: [
        'Razão social: Hwiseong Games (marca: Vivace Games)',
        // ⚠ É a grafia que a `PRIVACY_PT_BR` §11 já usa. Dois documentos não podem chamar a mesma pessoa de formas diferentes
        'Representante: Son Hwi-seong',
        'Endereço comercial: 204, 2F, 22 Seongan 5-gil, Jung-gu, Ulsan, 44421, Republic of Korea',
        'Telefone: +82 10-9926-0925',
        'E-mail: support@vivace-games.com',
        'Número de registro empresarial: 749-25-02260',
        'Número de registro de comércio a distância: 2026-Ulsan Jung-gu-0170 (órgão que recebeu o registro: Jung-gu, Cidade Metropolitana de Ulsan)',
      ],
    },
    {
      h: 'Artigo 3 (Definições)',
      body: [
        '“Peça” (“jogak”) é cada registro de diário que a pessoa usuária escreve no serviço.',
        '“Dispositivo” é o smartphone ou outro aparelho em que a pessoa usuária instala e usa o serviço.',
        '“Jogak Pro” é o produto pago de assinatura recorrente que oferece remoção de anúncios, backup e restauração e relatórios de resumo com IA.',
        '“Loja de aplicativos” é um mercado de aplicativos, como o Google Play, pelo qual o serviço é distribuído e os produtos pagos são pagos.',
      ],
    },
    {
      h: 'Artigo 4 (Publicação e alteração destes termos)',
      body: [
        'A operadora publica estes termos na tela [Ajustes] do serviço e no endereço abaixo, para que você possa consultá-los a qualquer momento.',
        'https://sonwheesung.github.io/diary/terms.html',
        'A operadora pode alterar estes termos desde que isso não infrinja a legislação aplicável.',
        'Ao alterá-los, a operadora informa a data de vigência e o motivo da alteração e avisa dentro do serviço a partir de 7 dias antes dessa data. Quando a alteração for desfavorável às pessoas usuárias, porém, o aviso é publicado a partir de 30 dias antes da data de vigência, mostrando lado a lado o conteúdo anterior e o posterior de forma fácil de entender.',
        'Se você não concordar com os termos alterados, pode cancelar o serviço pago e parar de usar o serviço antes da data de vigência. Se continuar usando o serviço depois da data anunciada, entende-se que você concordou com os termos alterados.',
      ],
    },
    {
      h: 'Artigo 5 (Conteúdo do serviço)',
      body: [
        'O nome do serviço oferecido pela operadora é “Jogak”, e seu tipo é um aplicativo móvel (conteúdo digital) para escrever e guardar um diário.',
        'Recursos oferecidos gratuitamente: escrever, editar, excluir e buscar registros, anexar fotos, tags, registro de emoções, visualização em calendário, bloqueio do aplicativo (PIN e padrão), modo escuro, vários idiomas, leitura de avisos e “Fale conosco”.',
        'Recursos oferecidos pelo produto pago “Jogak Pro”: remoção de anúncios, backup criptografado e restauração e relatórios de resumo com IA.',
        'Os títulos, o texto, as fotos, as tags e as emoções dos registros que você escreve ficam guardados somente dentro do seu dispositivo e não são transmitidos aos servidores da operadora, a menos que você ative o recurso de backup.',
        'Se o backup estiver ativado, os registros são criptografados no seu dispositivo antes de serem transmitidos, e a operadora não guarda a chave de descriptografia, portanto não consegue ler o conteúdo deles.',
        'Ao criar um relatório de resumo com IA, o texto do diário do período que você solicitou passa pelo servidor da operadora e é entregue ao provedor de inteligência artificial. A operadora não armazena esse texto. Os detalhes seguem a política de privacidade.',
      ],
    },
    {
      h: 'Artigo 6 (Formação do contrato e contas)',
      body: [
        'O contrato de uso do serviço se forma quando a pessoa usuária instala o serviço, concorda com estes termos e passa a usá-lo.',
        'Os recursos gratuitos, inclusive escrever registros, podem ser usados sem conta.',
        '“Fale conosco”, o pagamento de produtos pagos, o backup e a restauração e os relatórios de resumo com IA exigem login com uma conta Google.',
        'Você pode excluir sua conta a qualquer momento na tela [Ajustes] → [Fale conosco] do serviço. Como excluir a conta e quais informações são excluídas ou mantidas seguem o guia de exclusão de conta.',
      ],
    },
    {
      h: 'Artigo 7 (Preço dos produtos pagos e pagamento)',
      body: [
        'A tarifa do Jogak Pro é de 3.900 KRW por mês e 29.000 KRW por ano, valores que já incluem o imposto sobre valor agregado.',
        'A tarifa é cobrada automaticamente na forma de pagamento que você registrou na loja de aplicativos, no momento em que a assinatura começa e em cada renovação seguinte.',
        'Não há custo adicional além da tarifa. As tarifas de dados necessárias para usar o serviço, porém, seguem a política da operadora de telecomunicações que você contratou e são pagas por você.',
        'O valor efetivamente cobrado pode diferir dos valores acima conforme as políticas de câmbio e de taxas da loja de aplicativos ou seus preços por país. Nesse caso, prevalece o valor exibido na tela de pagamento.',
        'Se a operadora aumentar a tarifa, avisará com antecedência conforme o artigo 4, e o preço aumentado não se aplica a um período de assinatura já pago.',
      ],
    },
    {
      h: 'Artigo 8 (Limites das condições de venda)',
      body: [
        'O serviço só pode ser usado nos países em que a loja de aplicativos permite a distribuição, e a instalação e o pagamento só são possíveis nos países definidos pela operadora para distribuição.',
        'Uma assinatura paga fica vinculada a apenas uma conta por vez. Se você fizer login com outra conta Google no mesmo dispositivo, a assinatura é transferida para essa conta e deixa de poder ser usada na conta anterior.',
        'A operadora pode definir um limite máximo de usos na medida necessária para oferecer parte do serviço. A quantidade de relatórios de resumo com IA que podem ser gerados é limitada por período, e esse limite é exibido nas telas do serviço.',
      ],
    },
    {
      h: 'Artigo 9 (Momento e forma do fornecimento)',
      body: [
        'O Jogak Pro é aplicado à sua conta assim que o pagamento é concluído, sem qualquer processo de entrega separado.',
        'Se o pagamento tiver sido concluído mas o direito não tiver sido aplicado, você pode usar [Restaurar compras] na tela [Jogak Pro] do serviço ou procurar a operadora pela via do artigo 21.',
        'O período de assinatura vai da data do pagamento até o dia anterior à próxima renovação e é renovado automaticamente pelo mesmo período, salvo cancelamento.',
      ],
    },
    {
      h: 'Artigo 10 (Ambiente de uso)',
      body: [
        'O serviço pode ser usado em dispositivos Android e exige a versão do sistema operacional indicada na página da loja de aplicativos ou uma posterior.',
        'Os recursos básicos, como escrever, ver e buscar registros, podem ser usados sem conexão com a internet.',
        'A leitura de avisos, “Fale conosco”, o login, o pagamento, o backup e a restauração e os relatórios de resumo com IA exigem conexão com a internet.',
        'Se o seu dispositivo estiver com pouco espaço de armazenamento ou se o sistema operacional estiver fora da faixa suportada, alguns recursos podem não funcionar corretamente.',
      ],
    },
    {
      h: 'Artigo 11 (Teste gratuito e conversão em assinatura paga)',
      body: [
        'A operadora oferece um teste gratuito de 7 dias do Jogak Pro.',
        'Quando o período de teste gratuito termina, ele é convertido automaticamente em assinatura paga recorrente e a tarifa do artigo 7 é cobrada.',
        'Antes de a conversão ocorrer, a operadora exibe a data e a hora da conversão, o preço antes e depois da mudança e a forma de pagamento, e obtém o seu consentimento; sem esse consentimento, nenhum pagamento é feito.',
        'Se você não quiser ser cobrado ao fim do teste gratuito, cancele a assinatura pela via do artigo 14 antes de o período de teste terminar. Mesmo cancelando, você pode continuar usando o Jogak Pro até o fim desse período.',
      ],
    },
    {
      h: 'Artigo 12 (Direito de arrependimento)',
      body: [
        'Você pode exercer o arrependimento em até 7 dias contados da data do pagamento de um produto pago ou da data em que receber por escrito as condições do contrato.',
        'O arrependimento é exercido manifestando essa intenção ao canal de atendimento do artigo 21, e a operadora informa o resultado em até 3 dias úteis contados do recebimento.',
        'Exercido o arrependimento, a operadora reembolsa o valor conforme o artigo 13 e o seu direito ao Jogak Pro termina imediatamente.',
        'No entanto, nos termos do art. 17(2)5 da Lei de Proteção ao Consumidor no Comércio Eletrônico, o arrependimento fica restrito quando o fornecimento do conteúdo digital já foi iniciado. Mesmo nesse caso, o arrependimento continua possível quanto à parte ainda não fornecida de um conteúdo digital fornecido em partes.',
        'Para aplicar essa restrição, a operadora, nos termos do parágrafo 6 do mesmo artigo, indica esse fato e, ao mesmo tempo, oferece o teste gratuito de 7 dias do artigo 11 como produto de experimentação. Se a operadora não tiver adotado essas medidas, você pode exercer o arrependimento apesar da restrição acima.',
        'A operadora não cobra multa nem indenização pelo fato de você ter exercido o arrependimento.',
      ],
    },
    {
      h: 'Artigo 13 (Reembolsos)',
      body: [
        'Como o pagamento dos produtos pagos é feito pela loja de aplicativos, os reembolsos também são, em princípio, processados conforme o procedimento de reembolso dessa loja.',
        'Você pode pedir o reembolso diretamente à loja de aplicativos ou à operadora pelo canal de atendimento do artigo 21. Se o pedido for feito à operadora, ela o tratará em conjunto com a loja.',
        'A operadora reembolsa o valor em até 3 dias úteis contados da data em que recebe a manifestação de arrependimento ou equivalente. O crédito efetivo pode demorar mais, conforme o cronograma de processamento da loja de aplicativos.',
        'Se a operadora atrasar o reembolso além desse prazo sem motivo justificado, pagará também juros de mora referentes ao período de atraso, calculados pela taxa prevista no Decreto Regulamentar da Lei de Proteção ao Consumidor no Comércio Eletrônico.',
        'Se já houver período utilizado, a operadora pode deduzir o valor correspondente a esse período antes de reembolsar. Não se deduz, porém, o período em que você não pôde usar o serviço por motivo imputável à operadora.',
        'Não há taxa adicional para o reembolso.',
      ],
    },
    {
      h: 'Artigo 14 (Cancelamento da assinatura)',
      body: [
        'Você pode cancelar a assinatura a qualquer momento. O cancelamento precisa ser feito por você na tela de gerenciamento de assinaturas da loja de aplicativos; a operadora não pode cancelar por você.',
        'Google Play: app da loja > perfil > Pagamentos e assinaturas > Assinaturas (https://play.google.com/store/account/subscriptions)',
        'Mesmo depois de cancelar, você pode continuar usando o Jogak Pro até o fim do período de assinatura já pago; passado esse período, a renovação automática é interrompida.',
        'Excluir sua conta no serviço não cancela a assinatura na loja de aplicativos. Se você não cancelar pela via acima, separadamente da exclusão da conta, continuará sendo cobrado.',
      ],
    },
    {
      h: 'Artigo 15 (Contratos celebrados por menores)',
      body: [
        'Se uma pessoa menor de idade pagou por um produto pago sem o consentimento de seu representante legal, a própria pessoa menor ou seu representante legal podem anular esse contrato.',
        'Não cabe a anulação, porém, quando a pessoa menor pagou com bens cuja disposição seu representante legal havia autorizado, ou quando usou de artifício para fazer crer que era maior de idade.',
        'Se quiser anular, faça o pedido pelo canal de atendimento do artigo 21. A operadora pode solicitar documentos que comprovem a condição de representante legal.',
      ],
    },
    {
      h: 'Artigo 16 (Obrigações da pessoa usuária)',
      body: [
        'A pessoa usuária deve cumprir a legislação aplicável e estes termos ao usar o serviço.',
        'A pessoa usuária não deve usar indevidamente a conta de outra pessoa, atrapalhar o funcionamento normal do serviço, acessar ou tentar acessar o serviço por meios diferentes dos previstos pela operadora, nem manipular o processo de pagamento dos produtos pagos.',
        'A pessoa usuária deve cuidar por conta própria das informações de sua conta e do PIN ou padrão de bloqueio do aplicativo.',
        'A pessoa usuária deve guardar com segurança o código de recuperação emitido ao ativar o recurso de backup. Se o perder, nem a operadora consegue descriptografar o backup, e a restauração se torna impossível.',
      ],
    },
    {
      h: 'Artigo 17 (Guarda dos dados e backup)',
      body: [
        'O original dos registros que você escreve fica guardado no seu dispositivo. Se você desinstalar o aplicativo ou restaurar o dispositivo aos padrões de fábrica, os registros que estavam nele não poderão ser recuperados.',
        'Se o recurso de backup estiver ativado, a operadora guarda uma cópia criptografada, e você pode restaurá-la com o seu código de recuperação.',
        'Mesmo depois que a assinatura termina, a operadora guarda o backup criptografado por 90 dias, e a restauração continua disponível nesse período. Passados os 90 dias, o backup é excluído.',
        'A operadora não dispõe de canal de notificações push, portanto o aviso dessa exclusão programada é dado apenas na tela, quando você abre o aplicativo.',
        'Se você excluir sua conta, o backup criptografado guardado no servidor é excluído junto com a conta, sem os 90 dias de carência.',
      ],
    },
    {
      h: 'Artigo 18 (Propriedade intelectual)',
      body: [
        'Os direitos sobre os registros que você escreve no serviço e sobre as fotos que anexa são seus. A operadora não reivindica direito algum sobre eles.',
        'A operadora não usa os registros das pessoas usuárias para finalidade diversa da prestação do serviço, nem para publicidade, estatística ou treinamento de inteligência artificial.',
        'Os direitos sobre o próprio serviço e sobre os designs, as marcas e os programas nele incluídos pertencem à operadora ou aos seus legítimos titulares.',
        'A pessoa usuária não deve reproduzir, distribuir nem fazer engenharia reversa do serviço sem o consentimento prévio da operadora.',
      ],
    },
    {
      h: 'Artigo 19 (Alteração, suspensão e encerramento do serviço)',
      body: [
        'A operadora pode alterar o conteúdo do serviço para melhorar sua qualidade. Quando o conteúdo de um produto pago for alterado de forma desfavorável às pessoas usuárias, o aviso é dado com antecedência conforme o artigo 4.',
        'A operadora pode suspender temporariamente a prestação do serviço quando houver motivos inevitáveis, como inspeção, troca ou falha de equipamentos ou interrupção das comunicações, avisando com antecedência. Quando o motivo inevitável impedir o aviso prévio, o aviso é dado depois.',
        'Se a operadora encerrar o serviço, avisará por meio de comunicados dentro do serviço e na página da loja de aplicativos com pelo menos 30 dias de antecedência da data de encerramento, informando também o prazo em que será possível baixar ou restaurar o backup.',
        'No encerramento do serviço, a tarifa correspondente ao período já pago e não usufruído é reembolsada à pessoa usuária.',
      ],
    },
    {
      h: 'Artigo 20 (Responsabilidade)',
      body: [
        'A operadora responde, quanto à prestação do serviço, nos termos da legislação aplicável. Nenhuma cláusula destes termos exclui ou limita a responsabilidade da operadora prevista em lei.',
        'A operadora não responde por danos decorrentes de causas que não lhe sejam imputáveis, como caso fortuito ou força maior, falha, perda ou restauração do dispositivo da pessoa usuária, ou a perda, por ela, do código de recuperação ou do segredo de bloqueio do aplicativo.',
        'O relatório de resumo com IA é material de referência gerado por inteligência artificial e não é diagnóstico nem aconselhamento médico, psicológico ou jurídico. A operadora não garante a exatidão de seu conteúdo.',
        'Os danos ocorridos no processo de pagamento pela loja de aplicativos por causas imputáveis a ela seguem a política dessa loja. Ainda assim, a operadora prestará toda a cooperação necessária para a reparação do prejuízo da pessoa usuária.',
      ],
    },
    {
      h: 'Artigo 21 (Reclamações de consumo e solução de conflitos)',
      body: [
        'Para tratar opiniões e reclamações das pessoas usuárias, a operadora mantém o canal [Ajustes] → [Fale conosco] dentro do serviço e o canal de e-mail abaixo.',
        'E-mail: support@vivace-games.com',
        'Quando a operadora reconhecer que uma opinião ou reclamação é procedente, tratará dela sem demora; se o tratamento levar tempo, informará o motivo e o prazo previsto.',
        'Havendo conflito entre a operadora e uma pessoa usuária, esta pode pedir mediação aos seguintes órgãos.',
        '• Comitê de Mediação de Conflitos de Consumo (Agência Coreana do Consumidor): 1372 (na Coreia) · https://www.kca.go.kr',
        '• Comitê de Mediação de Conflitos sobre Conteúdos: 1588-2594 · https://www.kcdrc.kr',
        '• Comitê de Mediação de Conflitos do Comércio Eletrônico: 1661-5714 · https://www.ecmc.or.kr',
      ],
    },
    {
      h: 'Artigo 22 (Lei aplicável e foro)',
      body: [
        'A estes termos e ao uso do serviço aplica-se a lei da República da Coreia.',
        'A ação relativa a conflito surgido entre a operadora e uma pessoa usuária submete-se, nos termos do art. 36 da Lei de Proteção ao Consumidor no Comércio Eletrônico, ao foro exclusivo do tribunal distrital do domicílio da pessoa usuária no momento da propositura da ação. Não havendo domicílio, ao foro exclusivo do tribunal distrital de sua residência; e se, no momento da propositura, o domicílio ou a residência não estiverem claros, o foro competente é definido conforme a Lei de Processo Civil.',
        'A versão coreana destes termos é a versão autêntica. Havendo divergência de sentido com uma tradução para outro idioma, prevalece a versão coreana.',
        'Disposição final: estes termos entram em vigor em 17 de agosto de 2026.',
      ],
    },
  ],
};
