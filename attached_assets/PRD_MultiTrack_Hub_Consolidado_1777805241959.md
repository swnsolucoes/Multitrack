# PRD Consolidado — MultiTrack Hub

**Produto:** MultiTrack Hub  
**Tipo:** E-commerce + plataforma de membros + rateio coletivo de multitracks  
**Versão:** 1.1 consolidada  
**Status:** Rascunho estratégico para validação  
**Data:** Maio/2026  
**Idioma:** PT-BR

---

## 1. Resumo executivo

O **MultiTrack Hub** é uma plataforma para músicos, bandas, ministérios de louvor, produtores e estudantes comprarem, baixarem e organizarem multitracks de forma prática, econômica e segura.

A proposta consolidada une os dois PRDs em um produto híbrido com três pilares principais:

1. **Catálogo próprio de multitracks autorizadas** com compra avulsa.
2. **Assinatura Premium** com quantidade mensal de downloads/créditos.
3. **Rateio coletivo** para aquisição colaborativa de multitracks sob demanda, desde que juridicamente permitido.

A recomendação para lançamento é começar com um **MVP mais simples e comercialmente validável**: catálogo + compra avulsa + área do cliente + painel administrativo + downloads protegidos. A assinatura e o rateio entram em etapas seguintes, evitando complexidade técnica, jurídica e operacional logo no início.

---

## 2. Problema a resolver

Músicos precisam de multitracks para ensaios, apresentações ao vivo, estudo, produção e repertório, mas enfrentam dificuldades como:

- Multitracks de qualidade são caras quando compradas individualmente.
- Muitos títulos não estão disponíveis em português ou com boa curadoria para o público brasileiro.
- O músico perde tempo procurando arquivos confiáveis em várias fontes.
- Há risco de arquivos sem qualidade, incompletos, ilegais ou mal organizados.
- Bandas, igrejas e grupos muitas vezes gostariam de dividir custos, mas não possuem um fluxo seguro e organizado para isso.

---

## 3. Solução proposta

Criar uma plataforma centralizada com:

- Catálogo pesquisável de multitracks.
- Página de produto com preview, detalhes técnicos e opções claras de compra.
- Compra avulsa com checkout simples.
- Assinatura com downloads mensais ou sistema de créditos.
- Rateio coletivo com fluxo controlado pelo administrador.
- Área do cliente com histórico, downloads, compras e participação em rateios.
- Painel administrativo para gestão de produtos, vendas, membros, pagamentos, cupons, rateios e relatórios.

### Proposta de valor revisada

> “Multitracks de qualidade para músicos, com compra simples, acesso organizado e opções econômicas por assinatura ou rateio coletivo autorizado.”

Observação importante: evitar promessas como “acesso ilimitado” se o plano possui limite de downloads. Também evitar promessa de “economia de até 80%” sem validação comercial real.

---

## 4. Público-alvo e personas

### Persona 1 — Pedro, músico de banda cover

- Toca em bares, eventos e festas.
- Precisa de repertório variado mensalmente.
- Busca rapidez, organização e preço acessível.
- Melhor oferta: assinatura Premium ou pacotes/bundles.

### Persona 2 — Ministério de louvor

- Grupo de igreja com repertório recorrente.
- Precisa de tracks específicas de gospel/louvor.
- Pode dividir custos entre membros.
- Melhor oferta: assinatura + rateio autorizado.

### Persona 3 — Carlos, produtor iniciante

- Estuda mixagem e produção musical.
- Compra poucas tracks, mas quer qualidade.
- Não quer assumir assinatura mensal no início.
- Melhor oferta: compra avulsa e bundles promocionais.

### Persona 4 — Comprador casual

- Chega pelo Google, YouTube, Instagram ou indicação.
- Precisa de uma multitrack específica com urgência.
- Não quer plano mensal.
- Melhor oferta: compra avulsa com checkout rápido.

### Persona 5 — Administrador/curador

- Cadastra e organiza o catálogo.
- Garante qualidade técnica e autorização de uso/revenda.
- Gerencia vendas, rateios, clientes, suporte e relatórios.

---

## 5. Modelo de negócio consolidado

A plataforma terá quatro fontes potenciais de receita:

| Canal | Descrição | Prioridade |
|---|---|---|
| Compra avulsa | Venda direta de uma multitrack individual | Alta para MVP |
| Assinatura Premium | Plano mensal com downloads/créditos | Média/alta |
| Bundles/pacotes | Pacotes por gênero, artista, repertório ou campanha | Média |
| Rateio coletivo | Compra colaborativa, com taxa administrativa se juridicamente permitido | Média, com validação legal |

### 5.1 Compra avulsa

Permite que qualquer visitante compre uma multitrack sem assinar plano.

Características:

- Preço por produto.
- Checkout com Pix e cartão.
- Conta criada automaticamente ou login durante a compra.
- Link de download imediato após confirmação do pagamento.
- Histórico permanente em “Minhas Compras”.
- Link técnico de download com validade curta, mas acesso reemitido pela área do cliente.

### 5.2 Assinatura Premium

Plano mensal sugerido inicialmente:

- **R$ 9,90/mês** como preço de inauguração.
- 3 downloads ou 3 créditos mensais.
- Desconto em compras avulsas.
- Participação e abertura de rateios.
- Histórico completo de downloads.

Melhoria recomendada: usar **sistema de créditos** em vez de apenas “3 downloads fixos”. Exemplo: o usuário recebe 3 créditos por mês e pode acumular até 6 créditos. Isso aumenta percepção de valor e reduz frustração de quem não usou todos os downloads no mês.

### 5.3 Membro Rateio

Usuário cadastrado que não possui assinatura Premium, mas pode participar de rateios.

Recomendação para MVP:

- Cadastro gratuito.
- Paga apenas a cota do rateio.
- Pode comprar avulso com desconto menor, se desejado.
- Pode abrir sugestão de rateio, mas sujeito à aprovação do admin.

### 5.4 Bundles e pacotes

Pacotes podem aumentar ticket médio:

- Pacote Iniciante: 5 multitracks.
- Pacote Banda Cover: 10 músicas populares.
- Pacote Gospel Top: repertório por tema/culto.
- Pacote Black Friday ou lançamento.

### 5.5 Cupons e promoções

Recursos desejáveis:

- Cupom percentual.
- Cupom de valor fixo.
- Cupom de primeira compra.
- Cupom por campanha.
- Cupom exclusivo para membros.
- Limite de uso por usuário.
- Validade configurável.
- Relatório de uso.

---

## 6. Tipos de usuários e permissões

| Perfil | Permissões principais |
|---|---|
| Visitante | Navegar, buscar produtos, ver previews, ver planos e comprar avulso |
| Comprador Avulso | Acessar área do cliente, baixar compras, ver notas/recibos e suporte |
| Membro Rateio | Participar de rateios, sugerir novos rateios e comprar avulso |
| Membro Premium | Usar créditos/downloads, comprar com desconto e participar de rateios |
| Administrador | Gerenciar catálogo, preços, vendas, usuários, rateios, cupons e relatórios |
| Suporte/Operador | Atender clientes, consultar pedidos e resolver problemas sem acesso financeiro sensível |

Melhoria adicionada: separar **Administrador** de **Suporte/Operador** para reduzir risco de acesso excessivo no painel.

---

## 7. Requisitos funcionais

## Módulo A — Painel administrativo

### A.1 Cadastro de produtos

Campos obrigatórios:

- Nome da música.
- Artista/banda.
- Gênero musical.
- Tonalidade original.
- BPM.
- Duração.
- Descrição.
- Lista de faixas inclusas.
- Formato dos arquivos: WAV, MP3, STEMs etc.
- Tamanho aproximado do arquivo.
- Imagem de capa.
- Link de vídeo/YouTube.
- Preview de áudio.
- Tags/palavras-chave.
- Status: ativo, inativo, rascunho, destaque.
- Data de cadastro.

Campos de precificação:

- Preço avulso.
- Preço promocional.
- Data de início e fim da promoção.
- Disponível para compra avulsa: sim/não.
- Disponível para assinatura: sim/não.
- Quantidade de créditos necessários.
- Desconto para Premium.
- Desconto para Membro Rateio.
- Categoria de qualidade: Premium, Padrão, Backing Track, Demo.

Campos jurídicos/operacionais recomendados:

- Origem/licença do arquivo.
- Comprovante de autorização/licenciamento.
- Restrições de uso.
- Pode entrar no catálogo público: sim/não.
- Pode ser usado em bundle: sim/não.

### A.2 Gestão de membros

- Listar usuários por tipo, status e data de cadastro.
- Ver histórico de compras e downloads.
- Ver histórico de pagamentos.
- Alterar plano.
- Bloquear/desbloquear conta.
- Resetar acesso com segurança.
- Visualizar consentimentos LGPD.
- Registrar observações internas de suporte.

### A.3 Gestão de vendas avulsas

- Lista de pedidos.
- Status: aguardando pagamento, pago, cancelado, reembolsado, chargeback.
- Valor bruto, descontos, taxa do gateway e valor líquido.
- Produtos comprados.
- Cliente vinculado.
- Reenvio de e-mail de compra.
- Reemissão de link de download.
- Exportação CSV/Excel.

### A.4 Gestão de assinaturas

- Planos ativos.
- Próxima cobrança.
- Créditos disponíveis.
- Histórico de uso de créditos.
- Upgrade/downgrade.
- Cancelamento.
- Falha de cobrança.
- Recuperação de inadimplência.

### A.5 Gestão de rateios

- Aprovar/rejeitar sugestões.
- Inserir cotação.
- Definir valor total.
- Definir número mínimo de participantes.
- Definir percentual mínimo de corte.
- Definir prazo do rateio.
- Controlar participantes.
- Confirmar pagamentos.
- Liberar download.
- Cancelar rateio.
- Registrar motivo de cancelamento.
- Gerenciar reembolsos.

### A.6 Gestão de cupons

- Criar cupom percentual ou valor fixo.
- Definir validade.
- Definir limite total de uso.
- Definir limite por usuário.
- Aplicar cupom a produto, categoria, plano ou bundle.
- Ativar/desativar cupom.
- Relatório de conversão por cupom.

### A.7 Dashboard administrativo

Métricas principais:

- Receita total por período.
- Receita por canal: avulsa, assinatura, bundle, rateio.
- MRR.
- Churn.
- Ticket médio.
- Conversão visitante → comprador.
- Conversão comprador avulso → assinante.
- Produtos mais vendidos.
- Produtos mais baixados por assinatura.
- Rateios abertos/concluídos/cancelados.
- Tempo médio para fechar rateio.
- Inadimplência.
- Reembolsos e chargebacks.

---

## Módulo B — Área pública e catálogo

### B.1 Home page

Elementos recomendados:

- Proposta de valor clara.
- Busca em destaque.
- Multitracks em destaque.
- Lançamentos.
- Mais vendidos.
- Benefícios da assinatura.
- Explicação simples do rateio.
- Depoimentos.
- CTA para comprar, assinar ou conhecer o catálogo.

### B.2 Catálogo

Recursos:

- Busca por música, artista, gênero ou tag.
- Filtros por gênero, BPM, tonalidade, formato, preço e qualidade.
- Ordenação por recentes, mais vendidos, mais baixados, preço e A-Z.
- Cards com imagem, nome, artista, preço, selo de qualidade e botão de ação.

### B.3 Página de produto

Deve mostrar:

- Nome da multitrack.
- Artista/banda.
- Imagem.
- Preview de áudio.
- Vídeo incorporado.
- BPM, tonalidade, duração e formato.
- Lista de faixas inclusas.
- Tamanho aproximado.
- Licença/resumo de uso permitido.
- Avaliações, quando disponível.
- Produtos relacionados.

Opções de aquisição:

1. **Comprar agora** — preço avulso.
2. **Assinar Premium** — usar créditos/downloads mensais.
3. **Abrir ou participar de rateio** — quando não houver o produto ou quando aplicável.

### B.4 Página de planos

- Comparativo entre compra avulsa, Membro Rateio e Premium.
- Explicação de créditos/downloads.
- Benefícios reais, sem exagero.
- FAQ sobre cancelamento, downloads, uso permitido e suporte.

### B.5 Páginas estratégicas de SEO

Criar páginas indexáveis para:

- Gêneros: gospel, rock, sertanejo, MPB, pop, forró etc.
- Artistas, se juridicamente permitido.
- Tipos: multitrack para ensaio, playback, stems para estudo, backing track etc.
- Blog com conteúdos úteis para músicos.

---

## Módulo C — E-commerce e checkout

### C.1 Carrinho

- Adicionar múltiplas multitracks.
- Remover item.
- Aplicar cupom.
- Mostrar subtotal, desconto e total.
- Indicar economia ao assinar, sem forçar o usuário.

### C.2 Checkout

Etapas:

1. Identificação: login ou cadastro rápido.
2. Dados mínimos: nome, e-mail e CPF quando necessário para pagamento/nota.
3. Pagamento: Pix e cartão no MVP; boleto opcional.
4. Revisão: itens, preço, termos e política de uso.
5. Sucesso: confirmação, instruções e link para área do cliente.

Melhoria técnica recomendada: usar checkout hospedado ou componentes seguros do gateway para reduzir exposição a dados sensíveis de cartão.

### C.3 Pós-compra

- E-mail de confirmação.
- Link para “Minhas Compras”.
- Link de download temporário.
- Oferta de assinatura ou pacote relacionado.
- Pedido de avaliação após alguns dias.

### C.4 Minhas Compras

- Histórico completo.
- Status de cada pedido.
- Botão de baixar novamente.
- Emissão de novo link seguro.
- Recibos/notas, se aplicável.
- Solicitação de suporte por pedido.

---

## Módulo D — Assinatura e créditos

### D.1 Plano Premium

- Usuário assina mensalmente.
- Recebe créditos/downloads mensais.
- Pode usar créditos em produtos elegíveis.
- Produtos exclusivos podem exigir compra avulsa ou créditos extras.
- Créditos podem expirar ou acumular até limite configurável.

### D.2 Regras de créditos

Configurações sugeridas:

- 3 créditos por mês no plano inicial.
- Acúmulo máximo: 6 créditos.
- Crédito consumido apenas quando o download for confirmado.
- Estorno de crédito pelo admin em caso de problema no arquivo.
- Produtos Premium podem custar mais de 1 crédito.

### D.3 Cancelamento

- Usuário pode cancelar pelo painel.
- Acesso Premium continua até o fim do ciclo pago.
- Compras avulsas permanecem na área do cliente.
- Downloads obtidos por assinatura devem seguir a política definida nos termos.

---

## Módulo E — Rateio coletivo

### E.1 Abrir sugestão de rateio

Fluxo:

1. Usuário clica em “Sugerir/Abrir Rateio”.
2. Preenche nome da música, artista, referência e justificativa.
3. Status inicial: “Aguardando análise”.
4. Admin verifica viabilidade, disponibilidade, custo e autorização.
5. Admin aprova, recusa ou solicita informações.

### E.2 Participação em rateio

- Usuário visualiza rateios abertos.
- Filtros por gênero, valor, prazo e percentual atingido.
- Botão “Quero participar”.
- Exibição de participantes, meta, valor estimado e prazo.
- Termos específicos antes de entrar.

### E.3 Estados do rateio

1. **Sugerido** — aguardando análise do admin.
2. **Em cotação** — admin pesquisando custo/autorização.
3. **Aberto** — aceitando participantes.
4. **Meta atingida** — atingiu mínimo configurado.
5. **Aguardando pagamento** — participantes devem pagar.
6. **Pagamento confirmado** — cotas confirmadas.
7. **Em execução** — admin está providenciando aquisição/liberação.
8. **Concluído** — download disponível.
9. **Cancelado** — não atingiu meta, prazo expirou ou houve impedimento legal/operacional.
10. **Reembolsado** — valores devolvidos quando aplicável.

### E.4 Pagamento no rateio

- Preferência por Pix.
- Upload de comprovante apenas se o gateway não confirmar automaticamente.
- Status individual: pendente, pago, atrasado, reembolsado.
- Notificações automáticas.
- Execução somente quando a regra definida for cumprida.

### E.5 Percentual de corte

Regra configurável por rateio:

- Percentual mínimo arrecadado.
- Número mínimo de participantes.
- Valor mínimo por participante.
- Prazo máximo.

Recomendação: permitir configuração por rateio, pois cada produto pode ter custo e risco diferentes.

### E.6 Sala do rateio

MVP:

- Comentários simples.
- Atualizações do admin.
- Linha do tempo.
- Status do rateio.

Fase futura:

- Chat em tempo real.
- Posts fixos.
- Notificações push.
- Enquetes e votação de prioridades.

### E.7 Distribuição após rateio

- Download privado para participantes.
- Arquivo não entra automaticamente no catálogo público.
- Admin decide se poderá entrar no catálogo depois, conforme autorização/licença.

---

## Módulo F — Marketing, retenção e comunidade

### F.1 Upsell pós-compra

Após compra avulsa, mostrar oferta contextual:

> “Você comprou uma multitrack. Com o plano Premium, poderia receber créditos mensais e descontos em novas compras.”

Evitar mensagem agressiva como “por que pagar R$ 29,90 se...”, pois pode gerar sensação de arrependimento. Prefira uma abordagem educativa e simpática.

### F.2 Wishlist

- Usuário salva produtos favoritos.
- Recebe alerta de promoção.
- Recebe alerta quando produto volta ao catálogo.

### F.3 Avaliações

- Apenas compradores podem avaliar.
- Nota de 1 a 5 estrelas.
- Comentário opcional.
- Moderação pelo admin.

### F.4 Programa de indicação

- Usuário indica amigo.
- Ganha crédito, cupom ou desconto quando o amigo compra/assina.
- Prevenção contra abuso.

### F.5 Comunidade

Fase futura:

- Fórum ou área de discussão.
- Lives de demonstração.
- Conteúdo educacional.
- Parcerias com músicos, professores e canais do YouTube.

---

## 8. Requisitos não funcionais

### 8.1 Performance

Metas recomendadas:

- LCP até 2,5s nas páginas principais.
- INP até 200ms.
- CLS até 0,1.
- Página de produto carregando rapidamente mesmo com mídia.
- Preview de áudio otimizado.
- CDN para imagens, previews e arquivos.
- Downloads grandes via storage/CDN, não pelo servidor da aplicação.

### 8.2 Segurança

Requisitos:

- HTTPS obrigatório.
- Senhas com hash forte.
- MFA obrigatório para admin.
- Controle de acesso por perfil.
- Links de download assinados e temporários.
- Proteção contra força bruta.
- Rate limiting em login, checkout e downloads.
- Logs de auditoria para ações administrativas.
- Backup diário.
- Política de restauração testada.
- Proteção contra XSS, CSRF, SQL injection e upload malicioso.
- Antivírus/verificação de arquivos enviados ao storage.

### 8.3 LGPD e privacidade

Requisitos:

- Coletar apenas dados necessários.
- Informar finalidade de uso dos dados.
- Ter política de privacidade clara.
- Permitir solicitação de exclusão/anonimização quando aplicável.
- Registrar consentimento para marketing.
- Separar consentimento de termos obrigatórios.
- Ter gestão de cookies quando houver cookies não essenciais.
- Definir bases legais para pagamento, suporte, marketing e segurança.

### 8.4 Acessibilidade

Meta mínima recomendada:

- Conformidade WCAG 2.2 nível AA nas telas públicas e fluxos principais.
- Contraste adequado.
- Navegação por teclado.
- Foco visível.
- Formulários com labels e mensagens de erro claras.
- Botões com área de toque adequada no mobile.
- Player de áudio acessível.
- Evitar autenticação que dependa apenas de desafios cognitivos difíceis.

### 8.5 Escalabilidade

- Arquitetura cloud.
- Banco relacional para pedidos, usuários, assinaturas e permissões.
- Storage S3-compatible para arquivos grandes.
- CDN para entrega de assets e downloads.
- Processamento assíncrono para envio de e-mails, geração de links e relatórios.
- Filas para tarefas demoradas.

### 8.6 Compatibilidade

- Responsivo a partir de 320px.
- Compatível com Chrome, Edge, Firefox, Safari e mobile.
- Testes em Android e iOS.

---

## 9. Integrações

| Integração | Função | Prioridade |
|---|---|---|
| Gateway de pagamento: Mercado Pago, Pagar.me, Stripe ou similar | Pix, cartão, assinatura, reembolso | Alta |
| Storage S3-compatible: AWS S3, Cloudflare R2, Backblaze B2 ou similar | Armazenar arquivos grandes | Alta |
| CDN: Cloudflare, CloudFront ou similar | Performance e proteção | Alta |
| E-mail transacional: Resend, SendGrid, Mailgun etc. | Confirmações, links e recuperação | Alta |
| Analytics: GA4, Plausible ou similar | Métricas de conversão | Média |
| Tag Manager/Pixels | Campanhas pagas | Média |
| Antifraude | Transações de maior risco | Média |
| Emissão fiscal | Nota/recibo conforme modelo jurídico-contábil | Média |
| WhatsApp Business API | Notificações e suporte | Futuro |

---

## 10. Dados principais do sistema

Entidades recomendadas:

- User
- Role
- CustomerProfile
- Product
- ProductAsset
- ProductLicense
- Category
- Tag
- Cart
- Order
- OrderItem
- Payment
- Coupon
- Subscription
- CreditLedger
- DownloadGrant
- DownloadLog
- Rateio
- RateioParticipant
- RateioPayment
- Review
- Wishlist
- SupportTicket
- AuditLog

Observação: usar um **CreditLedger** ajuda a rastrear entrada, uso, estorno e expiração de créditos de forma auditável.

---

## 11. Fluxos principais

### 11.1 Compra avulsa

```text
Visitante → Produto → Comprar → Login/cadastro rápido → Checkout → Pagamento aprovado → Pedido pago → Link seguro → Minhas Compras
```

### 11.2 Assinatura Premium

```text
Visitante → Planos → Assinar → Checkout recorrente → Conta Premium → Créditos liberados → Produto elegível → Usar crédito → Download seguro
```

### 11.3 Rateio

```text
Usuário → Sugere rateio → Admin analisa → Admin cota → Rateio aberto → Participantes entram → Meta atingida → Pagamento → Admin executa → Download liberado
```

### 11.4 Cadastro de produto pelo admin

```text
Admin → Novo produto → Dados técnicos → Preço/licença → Upload/links → Preview → Revisão → Publicar
```

---

## 12. User stories essenciais

### Compra avulsa

- Como visitante, quero comprar uma multitrack sem assinar plano para resolver uma necessidade imediata.
- Como comprador, quero acessar minhas compras depois para baixar novamente quando precisar.
- Como admin, quero ver pedidos pagos e pendentes para acompanhar a receita.

### Assinatura

- Como membro Premium, quero ver meus créditos disponíveis para controlar meus downloads.
- Como membro Premium, quero usar crédito em uma multitrack elegível para não pagar avulso.
- Como admin, quero configurar quantos créditos cada plano oferece.

### Rateio

- Como membro, quero sugerir uma música para rateio para dividir o custo com outras pessoas.
- Como participante, quero acompanhar o status do rateio para saber quando pagar e quando baixar.
- Como admin, quero configurar meta, prazo e valor por participante.

### Segurança e suporte

- Como cliente, quero links de download protegidos para manter meu acesso seguro.
- Como suporte, quero consultar pedidos sem acessar dados sensíveis de pagamento.
- Como admin, quero logs de auditoria para investigar problemas.

---

## 13. Critérios de aceite por módulo

### Catálogo

- Busca retorna resultados por nome, artista e tags.
- Filtros funcionam em desktop e mobile.
- Produto inativo não aparece publicamente.
- Produto sem preço não pode ser comprado.

### Checkout

- Pedido só muda para “pago” via confirmação confiável do gateway.
- Cliente recebe e-mail após pagamento aprovado.
- Cupom inválido mostra erro claro.
- Pedido cancelado não libera download.

### Downloads

- Link de download expira após prazo configurado.
- Usuário autenticado pode gerar novo link para compra válida.
- Download é registrado com usuário, produto, IP e data.
- Limites de abuso bloqueiam tentativas suspeitas.

### Assinatura/créditos

- Créditos são adicionados após confirmação da assinatura.
- Crédito só é debitado após confirmação de uso.
- Admin pode estornar crédito com registro no histórico.
- Usuário vê saldo e extrato.

### Rateio

- Usuário não acessa sala de rateio sem participar.
- Rateio cancelado não aceita novos pagamentos.
- Participante pago recebe acesso quando o rateio é concluído.
- Admin consegue exportar relatório do rateio.

### Admin

- Apenas usuários autorizados acessam o painel.
- Ações críticas geram log.
- Admin pode criar, editar, ativar e inativar produtos.
- Admin pode visualizar receita por canal.

---

## 14. MVP recomendado

### Fase 0 — Validação e preparação

Antes de construir tudo:

- Validar demanda com 20 a 30 músicos.
- Definir nicho inicial, por exemplo: gospel/louvor ou bandas cover.
- Resolver a estratégia jurídica de licenciamento.
- Definir modelo contábil/fiscal.
- Definir gateway de pagamento.
- Montar catálogo inicial autorizado.

### Fase 1 — MVP comercial

Objetivo: vender com segurança e validar demanda.

Inclui:

- Home simples.
- Catálogo.
- Página de produto.
- Compra avulsa.
- Carrinho simples.
- Checkout via gateway.
- Área “Minhas Compras”.
- Downloads protegidos.
- Painel admin básico.
- E-mails transacionais.
- Política de privacidade, termos de uso e política de reembolso.
- Analytics básico.

Não incluir ainda:

- Chat em tempo real.
- App mobile.
- Marketplace P2P.
- IA de recomendação.
- Fórum completo.

### Fase 2 — Assinatura

- Planos Premium.
- Créditos mensais.
- Descontos para membros.
- Gestão de assinatura.
- Recuperação de inadimplência.
- Upsell pós-compra.

### Fase 3 — Rateio controlado

- Sugestão de rateio.
- Cotação pelo admin.
- Participação.
- Controle de pagamentos.
- Sala simples com comentários/status.
- Distribuição para participantes.

### Fase 4 — Crescimento

- Cupons avançados.
- Bundles.
- Avaliações.
- Wishlist.
- Indicação.
- Ranking de mais vendidos.
- Blog/SEO.
- Automações de e-mail.

### Fase 5 — Expansão

- App mobile.
- Comunidade/fórum.
- Marketplace P2P autorizado.
- Programa de afiliados.
- Recomendações personalizadas.

---

## 15. Fora do escopo da primeira versão

- App nativo iOS/Android.
- Marketplace entre usuários.
- Upload livre por qualquer membro.
- IA de recomendação.
- Chat em tempo real completo.
- Sistema de afiliados robusto.
- Multi-idioma.
- Integração complexa com várias formas de nota fiscal.

---

## 16. Métricas de sucesso

### Métrica norte

- **Receita líquida por cliente ativo** e **quantidade de downloads pagos/autorizados por mês**.

### KPIs do MVP

| Métrica | Meta inicial sugerida |
|---|---|
| Conversão visitante → compra | 1% a 3% |
| Ticket médio | R$ 25 a R$ 60 |
| Taxa de reembolso | < 5% |
| Tempo até primeiro download | < 2 minutos após pagamento confirmado |
| Produtos com pelo menos 1 venda | > 30% do catálogo inicial |
| Reclamações por arquivo | < 3% dos pedidos |

### KPIs da assinatura

| Métrica | Meta sugerida |
|---|---|
| MRR | R$ 5.000 em 6 meses após lançamento da assinatura |
| Churn mensal | < 10% no início; buscar < 5% depois |
| Conversão comprador → assinante | > 5% |
| Uso de créditos | > 60% dos assinantes ativos |

### KPIs do rateio

| Métrica | Meta sugerida |
|---|---|
| Rateios concluídos/abertos | > 50% no início; buscar > 60% |
| Tempo médio para fechar rateio | < 15 dias |
| Inadimplência em rateio | < 10% |
| Participantes recorrentes | > 30% |

---

## 17. Pontos jurídicos críticos

Este produto depende fortemente de direitos autorais e licenciamento. Antes do lançamento, validar com advogado especializado.

Pontos mínimos:

- Comprar uma multitrack de terceiros não significa automaticamente poder revender, distribuir ou ratear.
- O catálogo deve conter apenas arquivos próprios, licenciados, autorizados para revenda/distribuição ou com licença compatível.
- Rateios precisam de estrutura jurídica clara para não caracterizar distribuição irregular.
- Termos de uso devem proibir redistribuição, compartilhamento público e revenda por usuários.
- Política de privacidade deve atender à LGPD.
- Definir regras de reembolso, cancelamento e suporte.
- Definir emissão de nota/recibo com contador.

---

## 18. Stack tecnológica sugerida

Uma stack viável para MVP:

- Front-end: Next.js/React.
- Back-end: Node.js/NestJS ou Next.js API/server actions, conforme equipe.
- Banco: PostgreSQL.
- ORM: Prisma ou Drizzle.
- Storage: S3-compatible.
- CDN/WAF: Cloudflare ou equivalente.
- Pagamentos: Mercado Pago, Pagar.me, Stripe ou gateway com bom suporte a Pix, cartão e assinatura.
- E-mail: Resend, SendGrid ou Mailgun.
- Autenticação: solução própria segura ou provedor como Clerk/Auth.js/Supabase Auth, conforme custo e necessidade.
- Observabilidade: Sentry + logs estruturados.
- Analytics: GA4/Plausible.

Recomendação: priorizar simplicidade operacional, checkout seguro hospedado, storage externo e CDN desde o primeiro MVP.

---

## 19. Melhorias e correções aplicadas na consolidação

1. **Unificação dos modelos de receita**: assinatura, compra avulsa, bundles e rateio ficaram no mesmo funil.
2. **Correção da ambiguidade de acesso vitalício**: o cliente tem acesso permanente ao histórico da compra, mas links técnicos devem expirar por segurança.
3. **Separação de MVP e futuro**: chat em tempo real, app, IA e marketplace foram movidos para fases futuras.
4. **Adição de compliance**: LGPD, segurança, acessibilidade e performance foram transformadas em requisitos claros.
5. **Ajuste do rateio**: incluído status de cotação, reembolso e bloqueio por impedimento legal.
6. **Melhoria no plano Premium**: recomendação de créditos acumuláveis com limite.
7. **Melhoria administrativa**: incluídos papéis de suporte/operador e logs de auditoria.
8. **Melhoria de SEO e conversão**: páginas por gênero, produto, blog, avaliações e wishlist.
9. **Melhoria de pagamentos**: recomendação de checkout hospedado para reduzir exposição a dados de cartão.
10. **Melhoria jurídica**: destaque para licenciamento musical como pré-requisito de lançamento.

---

## 20. Decisões pendentes

Antes de iniciar desenvolvimento, decidir:

1. Nome definitivo da plataforma.
2. Nicho inicial: gospel, cover, estudo/produção ou catálogo geral.
3. Modelo jurídico de licenciamento.
4. Gateway de pagamento principal.
5. Política de créditos da assinatura.
6. Preço inicial dos produtos.
7. Se o rateio entra no lançamento ou em beta fechado.
8. Quem será responsável por suporte e curadoria.
9. Política de reembolso.
10. Stack final conforme orçamento e equipe.

---

## 21. Recomendação final

A melhor ordem de execução é:

1. **Validar juridicamente e comercialmente.**
2. **Lançar catálogo + compra avulsa.**
3. **Adicionar assinatura com créditos.**
4. **Liberar rateio em beta controlado.**
5. **Expandir com comunidade, bundles, afiliados e marketplace autorizado.**

Essa abordagem reduz risco, gera receita mais cedo e permite aprender com clientes reais antes de investir em funcionalidades complexas.

