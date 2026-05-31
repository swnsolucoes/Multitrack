---
name: Orval v8 React Query v5 queryKey required
description: Rules for correct hook usage with the generated API client in this codebase
---

**queryKey is mandatory** when passing `{ query: { ... } }` inline options to generated `useXxx` hooks. React Query v5 `UseQueryOptions` requires it.

Pattern:
```typescript
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
const { data } = useGetProduct(id, { query: { enabled: !!id, queryKey: getGetProductQueryKey(id) } });
```

**Mutation arg shapes** must match the generated hook exactly — check `lib/api-client-react/src/generated/api.ts` for the exact `Variables` type. Common gotchas:
- `useRemoveFromCart` → `{ itemId: number }` (NOT `{ data: { productId } }`)
- `useGenerateDownloadLink` → `{ grantId: number }`
- `useAddToWishlist` / `useRemoveFromWishlist` → `{ productId: number }`
- `usePayOrder` → `{ id: number, data: { paymentMethod } }`
- `useAdminUpdateProduct` / `useAdminDeleteProduct` → `{ id: number, ... }`
- `useAdminUpdateUser` → `{ id: number, ... }`
- `useAdminUpdateRateioStatus` → `{ id: number, ... }`
- `useRemoveCoupon` → void (call with `undefined`, NOT `{}`)

**How to apply:** Whenever editing a page that calls generated hooks, grep the hook name in `lib/api-client-react/src/generated/api.ts` to confirm the exact argument type before writing the call.
