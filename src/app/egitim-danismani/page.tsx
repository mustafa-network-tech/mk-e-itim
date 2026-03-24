import { redirect } from "next/navigation";

/** Eski bağlantılar ana sayfaya yönlendirilir; danışman artık sağ alttaki sohbet balonundadır. */
export default function EgitimDanismaniRedirectPage() {
  redirect("/");
}
