import { createFileRoute } from "@tanstack/react-router";
import { AccountLayout } from "@/pages/account/layout";

export const Route = createFileRoute('/_app/account')({
  head: () => ({
    meta: [
      {
        title: 'Account',
      },
    ],
  }),
  component: AccountLayout,
})
