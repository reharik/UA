const pgasync = require('pg-async');
const config = require('config');
const winston = require('winston');

module.exports = function() {
  const pg = new pgasync.default(config.postgres.config);

  return {
    async getByName(userName, table) {
      try {
        let query = (`SELECT * from "${table}" where "username" = '${userName}'`);
        winston.debug(query);

        return await pg.query(query)
          .then(result => {
            const row = result.rows[0];
            return row && row.document ? row.document : {};
          });
      } catch (err) {
        let errorMessage = `error retrieving document(s) from table: ${table}, username: ${userName}`;
        winston.error(errorMessage);
        winston.error(err);
        throw new Error(`${errorMessage} -- ${err.message}`);
      }
    },

    async save(table, document) {
      try {
        let query = `INSERT INTO "${table}" ("username", "document")
        SELECT '${document.userName}','${JSON.stringify(document)}'
        ON CONFLICT (username)
        DO UPDATE SET document = '${JSON.stringify(document)}'`;
        winston.debug(query);
        return await pg.query(query);
      } catch (err) {
        let errorMessage = `error saving document: ${JSON.stringify(document)},
 table: ${table}, username: ${document.userName}`;
        winston.error(errorMessage);
        winston.error(err);
        throw new Error(`${errorMessage} -- ${err.message}`);
      }
    }
  };
};
