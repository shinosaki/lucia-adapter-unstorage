import { createStorage, prefixStorage } from 'unstorage'

export const storage = createStorage()
export const db = prefixStorage(storage, 'user')

export interface DatabaseUser {
    id: number;
    attributes: {
        github_id: number;
        username: string;
    }
}
