import { MOCK_USER_ID, MOCK_EMAIL, MOCK_PASSWORD, createMockDataStore, type MockDataStore } from './mockData'

type MockAuthChangeCallback = (event: string, session: any) => void

const RELATION_CONFIG: Record<string, Record<string, { table: string; localKey: string; foreignKey: string; isArray: boolean }>> = {
  appointments: {
    clients: { table: 'clients', localKey: 'client_id', foreignKey: 'id', isArray: false },
    services: { table: 'services', localKey: 'service_id', foreignKey: 'id', isArray: false },
    profiles: { table: 'profiles', localKey: 'employee_id', foreignKey: 'id', isArray: false },
  },
  profiles: {
    employee_schedules: { table: 'employee_schedules', localKey: 'id', foreignKey: 'employee_id', isArray: true },
  },
  employee_schedules: {
    profiles: { table: 'profiles', localKey: 'employee_id', foreignKey: 'id', isArray: false },
  },
}

function parseRelations(selectStr: string): { name: string; inner: boolean }[] {
  const relations: { name: string; inner: boolean }[] = []
  const regex = /(\w+)(?:!(\w+))?\(/g
  let match
  while ((match = regex.exec(selectStr)) !== null) {
    relations.push({ name: match[1], inner: match[2] === 'inner' })
  }
  return relations
}

function applyFilters(rows: any[], filters: any[]): any[] {
  return rows.filter(row => {
    for (const f of filters) {
      const val = row[f.field]
      switch (f.op) {
        case 'eq':
          if (val !== f.value) return false
          break
        case 'neq':
          if (val === f.value) return false
          break
        case 'gte':
          if (val < f.value) return false
          break
        case 'lte':
          if (val > f.value) return false
          break
        case 'in':
          if (!f.value.includes(val)) return false
          break
      }
    }
    return true
  })
}

function applyJoins(rows: any[], relations: { name: string; inner: boolean }[], table: string, store: MockDataStore): any[] {
  const configs = RELATION_CONFIG[table]
  if (!configs) return rows

  let result = rows.map(row => {
    const joined = { ...row }
    for (const rel of relations) {
      const cfg = configs[rel.name]
      if (!cfg) continue

      if (cfg.isArray) {
        const related = store[cfg.table].filter(r => r[cfg.foreignKey] === row[cfg.localKey])
        joined[rel.name] = related
      } else {
        const localVal = row[cfg.localKey]
        if (!localVal) { joined[rel.name] = null; continue }
        const match = store[cfg.table].find(r => r[cfg.foreignKey] === localVal)
        joined[rel.name] = match || null
      }
    }
    return joined
  })

  // Apply !inner joins: remove rows where the joined relation is null
  for (const rel of relations) {
    if (rel.inner) {
      result = result.filter(row => row[rel.name] != null)
    }
  }

  return result
}

class MockQueryBuilder {
  private table: string
  private filters: any[] = []
  private orderField: string | null = null
  private orderAsc = true
  private isSingle = false
  private isMaybeSingle = false
  private selectFields: string | null = null
  private store: MockDataStore
  private mutationPayload: any = null
  private mutationType: 'insert' | 'update' | 'upsert' | 'delete' | null = null
  private upsertOptions: any = null

  constructor(table: string, store: MockDataStore) {
    this.table = table
    this.store = store
  }

  select(fields: string): this {
    this.selectFields = fields
    return this
  }

  eq(field: string, value: any): this {
    this.filters.push({ field, op: 'eq', value })
    return this
  }

  neq(field: string, value: any): this {
    this.filters.push({ field, op: 'neq', value })
    return this
  }

  gte(field: string, value: any): this {
    this.filters.push({ field, op: 'gte', value })
    return this
  }

  lte(field: string, value: any): this {
    this.filters.push({ field, op: 'lte', value })
    return this
  }

  in(field: string, values: any[]): this {
    this.filters.push({ field, op: 'in', value: values })
    return this
  }

  order(field: string, opts?: { ascending?: boolean }): this {
    this.orderField = field
    this.orderAsc = opts?.ascending ?? true
    return this
  }

  single(): this {
    this.isSingle = true
    return this
  }

  maybeSingle(): this {
    this.isMaybeSingle = true
    return this
  }

  insert(payload: any): this {
    this.mutationType = 'insert'
    this.mutationPayload = payload
    return this
  }

  update(payload: any): this {
    this.mutationType = 'update'
    this.mutationPayload = payload
    return this
  }

  upsert(payload: any, options?: any): this {
    this.mutationType = 'upsert'
    this.mutationPayload = payload
    this.upsertOptions = options
    return this
  }

  delete(): this {
    this.mutationType = 'delete'
    return this
  }

  private async execute(): Promise<{ data: any; error: null } | { data: null; error: any }> {
    try {
      if (this.mutationType) {
        return this.executeMutation()
      }
      return this.executeQuery()
    } catch (e) {
      return { data: null, error: e }
    }
  }

  private executeQuery() {
    const table = this.table
    let data = [...this.store[table]]

    // Separate direct filters from joined filters (e.g., 'profiles.business_id')
    const directFilters = this.filters.filter(f => !f.field.includes('.'))
    const joinFilters = this.filters.filter(f => f.field.includes('.'))

    data = applyFilters(data, directFilters)

    let relations: { name: string; inner: boolean }[] = []
    if (this.selectFields) {
      relations = parseRelations(this.selectFields)
    }
    if (relations.length > 0) {
      data = applyJoins(data, relations, table, this.store)
    }

    // Apply filters on joined fields
    for (const f of joinFilters) {
      const [relName, fieldName] = f.field.split('.')
      data = data.filter(item => {
        const relObj = item[relName]
        if (!relObj) return false
        const val = relObj[fieldName]
        switch (f.op) {
          case 'eq': return val === f.value
          case 'neq': return val !== f.value
          default: return true
        }
      })
    }

    if (this.orderField) {
      data.sort((a, b) => {
        const aVal = a[this.orderField!]
        const bVal = b[this.orderField!]
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return this.orderAsc ? -1 : 1
        if (bVal == null) return this.orderAsc ? 1 : -1
        if (aVal < bVal) return this.orderAsc ? -1 : 1
        if (aVal > bVal) return this.orderAsc ? 1 : -1
        return 0
      })
    }

    if (this.isSingle) {
      if (data.length === 0) throw { message: 'No rows found', code: 'PGRST116', details: '', hint: '' }
      data = data[0]
    } else if (this.isMaybeSingle) {
      data = data[0] ?? null
    }

    return { data, error: null }
  }

  private executeMutation() {
    const table = this.table
    const now = new Date().toISOString()
    const arr = this.store[table]

    switch (this.mutationType) {
      case 'insert': {
        const payload = Array.isArray(this.mutationPayload) ? this.mutationPayload : [this.mutationPayload]
        const inserted = payload.map((item: any) => ({
          ...item,
          id: item.id || crypto.randomUUID?.() || `${table}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          created_at: now,
          updated_at: now,
        }))
        for (const item of inserted) {
          arr.push(item)
        }
        const result = inserted.length === 1 ? inserted[0] : inserted
        return { data: result, error: null }
      }
      case 'update': {
        let targets = applyFilters(arr, this.filters)
        for (const target of targets) {
          Object.assign(target, this.mutationPayload, { updated_at: now })
        }

        const relations = this.selectFields ? parseRelations(this.selectFields) : []
        let result = targets.length === 1 ? targets[0] : targets
        if (relations.length > 0 && !Array.isArray(result)) {
          result = applyJoins([result], relations, table, this.store)[0]
        } else if (relations.length > 0 && Array.isArray(result)) {
          result = applyJoins(result, relations, table, this.store)
        }
        return { data: result, error: null }
      }
      case 'upsert': {
        const payload = this.mutationPayload
        const conflictFields = this.upsertOptions?.onConflict?.split(',') || []
        const existingIdx = arr.findIndex((item: any) =>
          conflictFields.every((f: string) => item[f.trim()] === payload[f.trim()])
        )

        if (existingIdx >= 0) {
          Object.assign(arr[existingIdx], payload, { updated_at: now })
          return { data: arr[existingIdx], error: null }
        }

        const inserted = {
          ...payload,
          id: payload.id || crypto.randomUUID?.() || `${table}-${Date.now()}`,
          created_at: now,
          updated_at: now,
        }
        arr.push(inserted)
        return { data: inserted, error: null }
      }
      case 'delete': {
        const targets = applyFilters(arr, this.filters)
        for (const t of targets) {
          const idx = arr.indexOf(t)
          if (idx >= 0) arr.splice(idx, 1)
        }
        return { data: null, error: null }
      }
      default:
        return { data: null, error: { message: 'Unknown mutation' } }
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled as any, onrejected as any)
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<any> {
    return this.execute().catch(onrejected)
  }
}

export function createMockClient() {
  const store = createMockDataStore()

  const mockUser = {
    id: MOCK_USER_ID,
    email: MOCK_EMAIL,
    user_metadata: { full_name: 'Admin Demo' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  }

  let currentSession: any = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 36000,
    expires_at: Math.floor(Date.now() / 1000) + 36000,
    token_type: 'bearer',
    user: mockUser,
  }

  const authCallbacks: MockAuthChangeCallback[] = []

  const mockAuth = {
    getSession: async () => ({
      data: { session: currentSession },
      error: null,
    }),
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
        currentSession = {
          ...currentSession,
          user: { ...mockUser, email },
        }
        for (const cb of authCallbacks) cb('SIGNED_IN', currentSession)
        return {
          data: { user: currentSession.user, session: currentSession },
          error: null,
        }
      }
      return {
        data: { user: null, session: null },
        error: { message: 'Credenciales inválidas' },
      }
    },
    signOut: async () => {
      currentSession = null
      for (const cb of authCallbacks) cb('SIGNED_OUT', null)
      return { error: null }
    },
    onAuthStateChange: (callback: MockAuthChangeCallback) => {
      authCallbacks.push(callback)
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const idx = authCallbacks.indexOf(callback)
              if (idx >= 0) authCallbacks.splice(idx, 1)
            },
          },
        },
      }
    },
  }

  const mockRpc = {
    financial_summary: async (_args: any) => ({ data: [], error: null }),
    record_payment: async (_args: any) => ({ data: 'mock-txn-id', error: null }),
    public_business_info: async (_args: any) => ({ data: null, error: null }),
    public_list_services: async (_args: any) => ({ data: [], error: null }),
    public_list_employees_for_service: async (_args: any) => ({ data: [], error: null }),
    public_get_available_slots: async (_args: any) => ({ data: [], error: null }),
    public_book_appointment: async (_args: any) => ({ data: null, error: null }),
  }

  return {
    from: (table: string) => new MockQueryBuilder(table, store),
    auth: mockAuth,
    rpc: (fnName: string, args: any) => {
      const fn = (mockRpc as any)[fnName]
      if (fn) return fn(args)
      return Promise.resolve({ data: null, error: null })
    },
  } as any
}
