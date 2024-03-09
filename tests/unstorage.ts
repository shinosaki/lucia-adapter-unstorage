import { databaseUser, testAdapter } from "@lucia-auth/adapter-test"
import { createStorage, prefixStorage } from 'unstorage'
import { UnstorageAdapter } from '../src/index.js'

const storage = createStorage()
const userStorage = prefixStorage(storage, 'user')

await userStorage.setItem(databaseUser.id, databaseUser)

const adapter = new UnstorageAdapter(storage)
await testAdapter(adapter)

process.exit(0)
