import type {
  Adapter,
  DatabaseSession,
  RegisteredDatabaseSessionAttributes,
  DatabaseUser,
  RegisteredDatabaseUserAttributes
} from 'lucia';
import { prefixStorage, Storage } from 'unstorage';

export class UnstorageAdapter implements Adapter {
  private storage;
  private sessionStorage;
  private userStorage;

  constructor(storage: Storage) {
    this.storage = storage;
    this.sessionStorage = prefixStorage(this.storage, 'session');
    this.userStorage = prefixStorage(this.storage, 'user');
  }

  public async setSession(session: DatabaseSession): Promise<void> {
    const key = `${session.userId}:${session.id}`
    await this.sessionStorage.setItem(key, session)
  }

  public async getUserSessions(userId: string): Promise<DatabaseSession[]> {
    const keys = await this.sessionStorage.getKeys(userId)
    return await Promise.all(
      keys.map((key) =>
        this.sessionStorage.getItem(key)
          .then((session) => {
            session.expiresAt = new Date(session.expiresAt)
            return session
          })
      )
    )
  }

  public async getSessionAndUser(
    sessionId: string
  ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const key = await this.getSessionKeyWithSessionId(sessionId)
    const session = key && await this.sessionStorage.getItem(key)
    if (!session) return [null, null]

    session.expiresAt = new Date(session.expiresAt)
    const user = await this.userStorage.getItem(session.userId)
    return [session, user]
  }

  public async deleteSession(sessionId: string): Promise<void> {
    const key = await this.getSessionKeyWithSessionId(sessionId)
    await this.sessionStorage.removeItem(key)
  }

  public async deleteUserSessions(userId: string): Promise<void> {
    const keys = await this.sessionStorage.getKeys(userId)
    await Promise.all(
      keys.map(key => this.sessionStorage.removeItem(key))
    )
  }

  public async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    const key = await this.getSessionKeyWithSessionId(sessionId)
    const session = await this.sessionStorage.getItem(key)
    session.expiresAt = expiresAt
    await this.sessionStorage.setItem(key, session)
  }

  public async deleteExpiredSessions(): Promise<void> {
    const keys = await this.sessionStorage.getKeys()
    for (const key of keys) {
      const session = await this.sessionStorage.getItem(key)
      if (new Date(session.expiresAt) <= new Date()) {
        await this.sessionStorage.removeItem(key)
      }
    }
  }

  private async getSessionKeyWithSessionId(sessionId: string): Promise<string|null> {
    const keys = await this.sessionStorage.getKeys()
    return keys.find(key => key.includes(sessionId)) ?? null
  }
}