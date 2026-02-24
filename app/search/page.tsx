import { searchUsers, searchItems } from "./queries";
import SearchClient from "./client";

type Props = {
  searchParams: Promise<{ q?: string; tab?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, tab } = await searchParams;
  const query = q ?? "";
  const activeTab = tab === "items" ? "items" : "users";

  const [users, items] = query
    ? await Promise.all([searchUsers(query), searchItems(query)])
    : [[], []];

  return (
    <SearchClient
      query={query}
      activeTab={activeTab}
      users={users}
      items={items}
    />
  );
}
