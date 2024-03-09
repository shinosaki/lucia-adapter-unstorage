import { Lucia } from "lucia";
import { dev } from "$app/environment";
import { UnstorageAdapter } from 'lucia-adapter-unstorage'
import { db, storage } from "./db";

import type { DatabaseUser } from "./db";

const adapter = new UnstorageAdapter(storage)

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username
		};
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: Omit<DatabaseUser, "id">;
	}
}
