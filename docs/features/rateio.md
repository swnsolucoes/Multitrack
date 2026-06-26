# Feature — Rateio

> **Estado atual:** Modo sugestão/interesse — sem cobrança real
> **Última atualização:** Junho/2026

---

## O que é o Rateio

O **Rateio** é um sistema de compra coletiva de multitracks de alto custo. A ideia é que vários usuários se unam para financiar coletivamente a aquisição de um produto musical que, individualmente, seria muito caro.

**Exemplos de uso:**
- Rateio para adquirir uma produção de orquestra completa
- Rateio para financiar um arranjo exclusivo de uma música gospel famosa
- Rateio para comprar licença de um multitrack premium internacional

---

## Estado atual

> ⚠️ **O rateio está em modo sugestão/interesse.**
> Nenhum pagamento real é processado. Nenhum download é liberado por rateio.
> O sistema permite apenas registrar interesse e acompanhar o progresso coletivo.

### Como está sendo usado agora

O rateio atual deve ser apresentado ao usuário como:

> _"Sugira uma música para um futuro rateio coletivo. Registre seu interesse e veja quantas pessoas também querem esse material."_

---

## Tabelas e estrutura de dados

### `rateios`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | serial | PK |
| `song_name` | text | Nome da música/produto |
| `artist` | text | Artista |
| `genre` | text | Gênero musical |
| `cover_url` | text | Capa |
| `description` | text | Descrição do rateio |
| `target_price` | decimal | Valor alvo para viabilizar o rateio |
| `price_per_participant` | decimal | Valor por participante |
| `goal_participants` | int | Número de participantes necessários |
| `current_participants` | int | Participantes atuais |
| `status` | enum | `open`, `in_quotation`, `suggested`, `completed`, `cancelled`, `refunded` |
| `deadline` | timestamp | Prazo para atingir a meta |
| `created_at` | timestamp | — |

### `rateio_participants`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | serial | PK |
| `rateio_id` | int | FK → rateios |
| `user_id` | int | FK → users |
| `status` | text | Status da participação |
| `created_at` | timestamp | — |

### `rateio_comments`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | serial | PK |
| `rateio_id` | int | FK → rateios |
| `user_id` | int | FK → users |
| `content` | text | Texto do comentário |
| `created_at` | timestamp | — |

---

## Fluxo atual (modo sugestão)

```
1. Admin cria um rateio com status "suggested" ou "open"
2. Usuário acessa /rateios e vê os rateios disponíveis
3. Usuário clica em "Participar" → registrado em rateio_participants
4. Usuário pode comentar no rateio
5. Admin acompanha o progresso de interesse no painel
6. ← PARA AQUI em staging → nenhuma cobrança, nenhum download
```

---

## Por que não liberar o financeiro agora

O rateio financeiro real exige **todas** as condições abaixo:

### Infraestrutura técnica

- [ ] Gateway de pagamento real (Pix, cartão ou boleto)
- [ ] Sistema de split de pagamento (dividir valor entre participantes)
- [ ] Webhook de confirmação de pagamento por participante
- [ ] Controle de status de pagamento individual por participante
- [ ] Storage real para armazenar o arquivo após aquisição
- [ ] URL assinada para download após conclusão do rateio
- [ ] Download grant criado automaticamente ao atingir meta e pagar

### Fluxos de negócio

- [ ] Fluxo de cancelamento com política clara:
  - O que acontece se a meta não for atingida no prazo?
  - Reembolso automático ou manual?
  - Prazo de reembolso?
- [ ] Fluxo de estorno:
  - Participante pode desistir antes de atingir a meta?
  - Participante pode desistir depois de pagar?
- [ ] Vinculação com produto final real:
  - O produto final precisa existir no storage
  - O rateio precisa apontar para o produto finalizado

### Jurídico e compliance

- [ ] Política de reembolso documentada e publicada
- [ ] Validação jurídica do modelo de rateio no Brasil
- [ ] Licenciamento musical claro para os participantes:
  - O que o participante pode fazer com o arquivo?
  - Pode usar comercialmente? Pode sincronizar?
- [ ] Audit logs de participação e pagamento (exigido pela LGPD)
- [ ] Conformidade LGPD (dados dos participantes, histórico)

---

## Checklist antes de ativar rateio financeiro

Preencha todos os itens antes de aceitar qualquer pagamento via rateio:

**Técnico:**
- [ ] Gateway de pagamento real configurado
- [ ] Split de pagamento funcionando
- [ ] Webhook de confirmação validado
- [ ] Storage e download real funcionando
- [ ] Audit logs implementados
- [ ] Fluxo de cancelamento e reembolso implementado

**Negócio:**
- [ ] Política de cancelamento publicada
- [ ] Política de reembolso publicada
- [ ] Meta e prazo claramente comunicados ao usuário
- [ ] Vinculação com produto final validada

**Jurídico:**
- [ ] Licenciamento musical dos arquivos validado
- [ ] Termos de uso do rateio revisados por assessoria jurídica
- [ ] LGPD: dados de participantes tratados conforme lei
- [ ] Responsabilidade em caso de não conclusão do rateio definida

---

## Roadmap do Rateio

| Fase | Descrição | Dependência |
|---|---|---|
| Atual | Modo sugestão/interesse — sem cobrança | — |
| Fase intermediária | Modo reserva — usuário "reserva" participação sem pagar | Gateway funcionando |
| Fase avançada | Rateio financeiro completo — cobrança ao atingir meta | Fases 1-4 do roadmap geral |

---

## APIs relacionadas

```
GET  /rateios              → listar rateios
GET  /rateios/:id          → detalhe do rateio com participantes e comentários
POST /rateios/:id/join     → registrar interesse (sem cobrança)
GET  /rateios/:id/comments → listar comentários
POST /rateios/:id/comments → adicionar comentário

# Admin
GET  /admin/rateios        → gerenciar rateios
POST /admin/rateios        → criar rateio
PUT  /admin/rateios/:id    → editar rateio
```

---

*Feature Doc — Rateio — MultiTrack Hub — Junho/2026*
