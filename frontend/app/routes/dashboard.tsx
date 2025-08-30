import * as React from "react";
import { User2, Lock, ArrowRight } from "lucide-react";
import { redirect, useLoaderData } from "react-router";
import { getSession } from "~/utils/session.server";
import type { Route } from "./+types/dashboard";
import {
  type FileUpload,
  parseFormData,
} from "@remix-run/form-data-parser";
import type { User } from "~/models/user";
import type { Document } from "~/models/document";

export async function loader({ request }: Route.LoaderArgs) {
    const session = await getSession(
        request.headers.get("Cookie"),
    );

    console.log("session:", session)

    if (!session.has('userId')) {
        return redirect("/")
    }

    const userId = session.get("userId")

    const res = await fetch(`${process.env.BACKEND_URL}/users/${userId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch user documents");
    }

    const data = await res.json();
    const user: User = data["user"]
    return user;
  
}

export async function action({
  request,
}: Route.ActionArgs) {

  const session = await getSession(
      request.headers.get("Cookie"),
  );
  const username = session.get("userId") as string

  const uploadHandler = async (fileUpload: FileUpload) => {
    return fileUpload
  };

  const formData = await parseFormData(
    request,
    uploadHandler,
  );

  formData.append("username", username)

  const res = await fetch(process.env.BACKEND_URL + "/upload", {
    method: "POST",
    body: formData,
  });

  if (res.ok) {
    // Query the user informations and update the session
  }

}

export default function Dashboard() {

  const [files, setFiles] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const { username, documents } = useLoaderData<{
    username: string;
    documents: Array<Document>;
  }>();

  console.log("DOCUMENTS:")
  console.log(documents)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-50">
      {/* Nav / Brand */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <a href="/dashboard" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm">★</span>
          <span className="text-lg font-semibold tracking-tight text-neutral-800">Noosify</span>
        </a>
      </header>

      {/* Main card */}
      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-10 px-6 pb-16 pt-4">

        {/* Upload Card */}
        <div className="relative mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white/80 p-8 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-x-0 -top-1 mx-auto h-1 w-40 rounded-full" />
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">Upload tes fichiers</h2>

          <form method="post" encType="multipart/form-data" className="space-y-4" onSubmit={() => setIsLoading(true)}>
            {/* Upload area */}
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-40 px-6 transition bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:bg-neutral-100 hover:border-rose-400"
            >
              <svg
                className="w-10 h-10 text-rose-400 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12l8-8m0 0l8 8m-8-8v12" />
              </svg>
              <span className="text-sm font-medium text-neutral-700">Clique pour upload tes fichiers</span>
              <span className="text-xs text-neutral-500">PDF, DOCX ou TXT</span>
              <input
                id="file-upload"
                type="file"
                name="files"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-neutral-700">Files selected:</h3>
                <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-neutral-50/60">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between px-3 py-2 text-sm text-neutral-700">
                      <span className="truncate">{f.name}</span>
                      <span className="text-xs text-neutral-500">{(f.size / 1024).toFixed(1)} KB</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upload button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 inline-flex items-center justify-center rounded-lg bg-rose-500 px-4 py-2 text-white font-semibold shadow-sm 
                        hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1 transition
                        disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    />
                  </svg>
                  Synthétisation des documents...
                </span>
              ) : (
                "Upload"
              )}
            </button>
          </form>
        </div>

        {/* Documents List */}
        <div className="grid w-full max-w-6xl grid-cols-1 gap-6">
          {documents.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <p className="font-bold text-sm text-neutral-600 mb-2">
                Filename: {doc.filename}
              </p>
              <p className="text-sm text-neutral-600 mb-2">
                Updated at: {new Date(doc.updated_at).toLocaleString()}
              </p>
              <p className="text-neutral-800 text-base whitespace-pre-wrap">
                {doc.summary}
              </p>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
