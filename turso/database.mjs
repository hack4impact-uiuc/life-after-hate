// Small SQL adapter shared by the authenticated API and migration checks.
// A batch is one write transaction: application changes and audit entries commit together.
export function database(client) {
  const prepare = (sql, args = []) => ({
    sql, args,
    bind(...values) { return prepare(sql, values); },
    async first() { return (await client.execute({ sql, args })).rows[0] ?? null; },
    async all() { return { results: (await client.execute({ sql, args })).rows }; },
    async run() { return client.execute({ sql, args }); },
  });
  return {
    prepare,
    batch(statements) {
      return client.batch(statements.map(({sql,args}) => ({sql,args})), 'write');
    },
  };
}
