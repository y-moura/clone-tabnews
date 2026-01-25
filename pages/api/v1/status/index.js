import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseName = process.env.POSTGRES_DB;

  const databaseVersion = await database.query("SHOW server_version;");
  const databaseMaxConnections = await database.query("SHOW max_connections;");
  const databaseOpenConnections = await database.query({
    text: "SELECT COUNT(*)::INT FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const databaseVersionValue = databaseVersion.rows[0].server_version;
  const maxConnValue = databaseMaxConnections.rows[0].max_connections;
  const openConnValue = databaseOpenConnections.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(maxConnValue),
        open_connections: openConnValue,
      },
    },
  });
}

export default status;
