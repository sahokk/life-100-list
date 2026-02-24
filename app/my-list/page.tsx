import { getMyList } from "./actions";
import MyListClient from "./client";

export default async function MyListPage() {
  const { list, items, userId } = await getMyList();

  return <MyListClient list={list} items={items} userId={userId} />;
}
