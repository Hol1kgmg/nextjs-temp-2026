# フロントエンド実装例

アーキテクチャパターンがコードでどう表現されるかを示す実装例。

設計の思想・構造については [frontend.md](./frontend.md) を参照。

---

## ディレクトリ構成例

```
frontend/src/
  app/
    dashboard/
      page.tsx
    orders/
      page.tsx
      [id]/
        page.tsx

  widgets/
    order-list-panel/
      OrderListPanel.tsx
      OrderListHeader.tsx
      OrderListItem.tsx
    dashboard-summary/
      DashboardSummary.tsx

  features/
    create-order/
      CreateOrderForm.tsx
      CreateOrderButton.tsx
      useCreateOrder.ts
      actions.ts
      types.ts
    update-profile/
      ProfileEditForm.tsx
      actions.ts
    search-product/
      SearchProductInput.tsx

  entities/
    user/
      api/
        repository.ts
      ui/
        UserAvatar.tsx
        UserNameLabel.tsx
      model/
        types.ts
    order/
      api/
        repository.ts
      ui/
        OrderStatusBadge.tsx
      model/
        types.ts
    product/
      api/
        repository.ts
      ui/
        ProductCard.tsx
      model/
        types.ts

  shared/
    ui/
      Button.tsx
      Modal.tsx
      DataTable.tsx
    lib/
      formatDate.ts
    api/
      client.ts
```

---

## データフロー実装例

### Read パターン（Server Component によるデータ取得）

`app/` が repository を呼び出し、取得したデータを props で下位レイヤーに渡す。

```tsx
// app/dashboard/page.tsx
import { getUsers } from '@/entities/user/api/repository'
import { getOrders } from '@/entities/order/api/repository'
import { DashboardSummary } from '@/widgets/dashboard-summary/DashboardSummary'

export default async function DashboardPage() {
  const [users, orders] = await Promise.all([
    getUsers(),
    getOrders(),
  ])
  return <DashboardSummary users={users} orders={orders} />
}
```

### Mutation パターン（Server Action による書き込み）

`features/` の Server Action が repository を呼び出す。Client Component は Server Action のみを知り、repository を直接 import しない。

```tsx
// features/create-order/actions.ts
'use server'
import { createOrder } from '@/entities/order/api/repository'

export async function createOrderAction(formData: FormData) {
  await createOrder(/* ... */)
  // revalidatePath, redirect 等
}
```
