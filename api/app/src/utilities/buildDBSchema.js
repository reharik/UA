const pgasync = require('pg-async');
const config = require('config');
const promiseretry = require('promise-retry');
const ping = async function() {
  const pg = new pgasync.default(config.postgres.config);
  let result = await pg.query(`select relname as table from pg_stat_user_tables where schemaname = 'public'`);

  if (result && result.rowCount > 0) {
    return;
  } else if (result && result.rowCount === 0) {
    let sql = `
    GRANT ALL ON SCHEMA public TO ua;
    GRANT ALL ON SCHEMA public TO public;
    COMMENT ON SCHEMA public
    IS 'standard public schema';

    -- Table: client

    DROP TABLE IF EXISTS "client";

    CREATE TABLE client
    (
      userName text PRIMARY KEY,
      document jsonb
    )
    WITH (
      OIDS=FALSE
    );
    ALTER TABLE client
    OWNER TO ua;
`;
    return await pg.query(sql);
  }
  return Promise.reject();
};

module.exports = () => {
  return promiseretry(function(retry, number) {
    console.log('attempt number', number);
    return ping().catch(retry);
  }, {retries: 4});
};

