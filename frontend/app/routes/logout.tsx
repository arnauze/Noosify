import { redirect } from "react-router";
import {
    getSession,
    destroySession,
} from  "~/utils/session.server";
import type { Route } from "./+types/logout";

export async function loader({ request }: Route.LoaderArgs) {
    const session = await getSession(
        request.headers.get("Cookie"),
    );
    return redirect("/", {
        headers: {
            "Set-Cookie": await destroySession(session),
        },
    });
}
  
export default function LogoutRoute() {
    return (
      <>
      </>
    );
}