import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    route("/", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
    route("logout", "routes/logout.tsx")
] satisfies RouteConfig;
