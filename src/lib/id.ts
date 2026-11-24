export function newId(): string {
    // crypto.randomUUID поддерживается во всех современных браузерах
    return crypto.randomUUID()
  }