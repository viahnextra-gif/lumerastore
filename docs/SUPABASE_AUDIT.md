# Auditoria Supabase — Lumera Store

> Última atualização: 2026-06-16

## 1. Visão geral

Lumera Store usa **Lovable Cloud** (Supabase gerenciado) com:
- Auth: email/senha + Google (recomendado habilitar).
- Storage: 3 buckets (`product-images`, `product-videos`, `social-media`).
- RLS habilitado em todas as tabelas públicas.
- Roles: `admin`, `moderator`, `user` na tabela `user_roles` com helper `has_role`/`is_admin_or_moderator` (security definer).

## 2. Tabelas existentes (24)

| Tabela | RLS | Notas |
|---|---|---|
| `api_credentials` | ✅ | Admin-only. Contém chaves de marketplaces. |
| `automation_executions` | ✅ | Logs de fluxos. Admin-only. |
| `automation_flows` | ✅ | Admin-only. |
| `campaigns` | ✅ | Admin-only. |
| `categories` | ✅ | Leitura pública / escrita admin. |
| `chat_messages` | ✅ | Restrito ao próprio usuário + admin. |
| `favorites` | ✅ | Restrito ao próprio usuário. |
| `leads` | ✅ | Admin-only para leitura; insert público para captação. |
| `marketplace_*` | ✅ | Admin-only (8 tabelas). |
| `order_items` | ✅ | Restrito ao dono do pedido + admin. |
| `order_notifications` | ✅ | Restrito ao admin/moderator. |
| `orders` | ✅ | Restrito ao dono + admin. |
| `pages` | ✅ | Leitura pública para `is_published=true`; escrita admin. |
| `products` | ✅ | Leitura pública `is_active=true`; escrita admin. Possui `slug` único. |
| `profiles` | ✅ | Auto-leitura. |
| `scheduled_posts` | ✅ | Admin-only. |
| `seo_alerts` | ✅ | Admin-only. |
| `settings` | ✅ | Leitura authenticated quando `is_secret=false`; escrita admin. |
| `social_accounts` | ✅ | Admin-only. |
| `subcategories` | ✅ | Leitura pública / escrita admin. |
| `user_roles` | ✅ | Leitura authenticated (necessária para `has_role`); escrita só service_role/admin. |

## 3. Tabelas que serão criadas na migração desta entrega

- **`coupons`** — códigos promocionais (BELEZA10 etc.) com `discount_type`, `discount_value`, `min_purchase`, `valid_until`, `usage_limit`, `usage_count`, `is_active`. RLS: leitura authenticated (para validar no checkout) + escrita admin.

## 4. Colunas adicionadas

- `products.meta_title TEXT` — title de SEO por produto.
- `products.meta_description TEXT` — meta description por produto.

`products.slug` **já existia** (UNIQUE NOT NULL), portanto a URL canónica `/produto/:slug` funciona imediatamente.

## 5. Tabelas recomendadas (não criadas — aguardar decisão)

| Tabela sugerida | Motivo |
|---|---|
| `addresses` | Persistir endereços do cliente para checkout one-click. Hoje endereço fica embutido em `orders.shipping_address`. |
| `payment_transactions` | Registrar tentativas, status e webhooks do Mercado Pago (PIX/Cartão/Boleto). Necessária quando MP for habilitado. |
| `shipping_quotes` | Cache de cotações Melhor Envio por CEP+SKU para reduzir custo de API. |
| `coupon_redemptions` | Histórico de uso de cupom por usuário (anti-fraude). |
| `inventory_movements` | Trilha de auditoria para estoque (entrada/saída/ajuste). |

## 6. Segurança — pontos resolvidos nesta entrega

- ✅ Buckets `product-images`/`product-videos`/`social-media` revisados; listing público removido em entregas anteriores.
- ✅ `chat_messages` sem leitura pública.
- ✅ `settings` exige `authenticated` + `is_secret=false`.
- ✅ `EXECUTE` revogado em helpers internos (`generate_order_number`, `set_order_number`, `update_updated_at_column`, `notify_automation_on_new_order`).
- ✅ Helpers `has_role`/`is_admin_or_moderator` mantidos executáveis por `anon`/`authenticated` por necessidade das policies.

## 7. Pendências para produção

| Item | Status | Ação |
|---|---|---|
| Email auth: HIBP password check | ⚠️ | Ativar em Cloud → Users → Auth Settings. |
| Google OAuth provider | ⚠️ | Conectar em Cloud → Users → Auth → Providers. |
| Senha mínima 8 chars | ⚠️ | Ajustar em Cloud → Users → Auth Settings. |
| Email confirmation OFF em dev / ON em prod | ⚠️ | Manter ON em produção. |
| Backups automáticos | ✅ | Já incluído no plano Lovable Cloud. |
| Secrets MP/Melhor Envio | ⏳ | `MERCADO_PAGO_ACCESS_TOKEN`, `MELHOR_ENVIO_TOKEN`, `LUMERA_ORIGIN_CEP`. |
| Rate-limit em edge functions públicas | ⚠️ | Adicionar em `create-payment`, `melhor-envio-quote`, `chatbot`. |
| Custom domain + HTTPS | ⏳ | Configurar em Project Settings quando o domínio for adquirido. |
| Webhook MP para confirmação de pagamento | ⏳ | Edge function `mp-webhook` (a criar). |

## 8. Performance — checklist Lighthouse

- ✅ Code splitting em rotas admin (`React.lazy` + `Suspense`).
- ✅ Imagens de produto via Supabase Storage com `loading="lazy"` recomendado.
- ⚠️ Converter assets estáticos (`/public/*.png`) para WebP/AVIF.
- ⚠️ Adicionar `<link rel="preload" as="image">` para LCP do hero.
- ⚠️ Configurar `vite-imagetools` para variantes automáticas.

## 9. Próximos passos sugeridos

1. Adicionar os secrets `MERCADO_PAGO_ACCESS_TOKEN` e `MELHOR_ENVIO_TOKEN`.
2. Implementar as edge functions `create-payment`, `mp-webhook`, `melhor-envio-quote`.
3. Criar tabela `addresses` para checkout one-click.
4. Backfill de `meta_title`/`meta_description` nos produtos existentes via /admin/produtos.
5. Auditoria semanal automatizada via /admin/seo.
