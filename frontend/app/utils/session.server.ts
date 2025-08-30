import { createCookieSessionStorage } from "react-router";
import type { User } from "./models/user";

type SessionData = {
  user: User;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      cookie: {
        name: "__session",
        httpOnly: true,
        secure: true
      },
    },
  );

export { getSession, commitSession, destroySession };
