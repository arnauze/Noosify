import type { Document } from "./document";

export type User = {
    username: string;
    password: string;
    documents: Array<Document>
};