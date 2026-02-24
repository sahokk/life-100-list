import { getMyList } from "./queries";
import MyListClient from "./client";

export default async function MyListPage() {
  const { list, items, likes, userId } = await getMyList();

  return <MyListClient list={list} items={items} likes={likes} userId={userId} />;
}
