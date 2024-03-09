# `lucia-adapter-unstorage`

**This package is unofficial**

[Unstorage](https://unstorage.unjs.io) adapter for Lucia v3.

[*Official Unstorage adapter has been deprecated in v3.*](https://github.com/lucia-auth/lucia/discussions/1272)

## Installation
```
npm install lucia-adapter-unstorage
```

## Example
### Initialize Unstorage
```ts
// db.ts
import { createStorage, prefixStorage } from 'unstorage'

export const storage = createStorage()
export const db = prefixStorage(storage, 'user')

export interface DatabaseUser {
  id: string;
  attributes: {
    fullname: string;
    password: string;
  }
}
```

### Initialize Lucia
```ts
// auth.ts
import { UnstorageAdapter } from 'lucia-adapter-unstorage'
import { storage, db } from './db.ts'

const adapter = new UnstorageAdapter(storage)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: { secure: !dev }
  },
  getUserAttributes: (attributes) => {
    return {
      fullname: attributes.fullname
    }
  }
})
```

### Create New User
```ts
import { db } from './db.ts'

const form = {
  userId: 'admin',
  fullname: 'User 01',
  password: 'passw0rd'
}

if (await db.hasItem(form.userId)) {
  throw new Error('User already exists')
}

await db.setItem(form.userId, {
  id: form.userId,
  attributes: {
    fullname: form.fullname,
    password: form.password,
  }
})

// See "Create Session" section
```

### Login
```ts
import { db } from './db.ts'

const form = {
  userId: 'admin',
  password: 'passw0rd'
}

const existingUser = await db.getItem(form.userId)

if (!existingUser) {
  throw new Error('User does not exist')
}
if (existingUser.attributes.password !== form.password) {
  throw new Error('Incorrect username or password')
}

// See "Create Session" section
```

### Create Session
```ts
import { lucia } from './auth.ts'

const session = await lucia.createSession(userId, {})
const sessionCookie = lucia.createSessionCookie(session.id)
setCookie(sessionCookie.name, sessionCookie.value, {
  path: '.',
  ...sessionCookie.attributes
})
```

## Testing
```
pnpm run test
```