const _ = require("lodash");
const mysql = require("mysql");
const { mysql_config } = require("../config");

var crtl = {
  connection: {
    exec_sql: (req) =>
      new Promise((resolve, reject) => {
        var connection = mysql.createConnection(mysql_config.collect);
        connection.connect(function (err) {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            connection.query(req, (err_sql, result_sql) => {
              connection.end();

              if (err_sql) {
                console.error(err_sql);
              } else {
                resolve(result_sql);
              }
            });
          }
        });
      }),
  },

  getters: {
    getCrypto: () => {
      return new Promise((resolve, reject) => {
        crtl.connection
          .exec_sql("SELECT * FROM crypto_test")
          .then((res) => {
            console.log("las==========>", res);
            resolve(res);
          })
          .catch((err) => {
            console.err(err);
          });
      });
    },
  },

  setters: {
    supprTable: (i) => {
      var sql_delete = `DELETE FROM consumer.collect_table_name WHERE id=${i};`;
      return new Promise(async (resolve, reject) => {
        await crtl.connection.exec_sql(sql_delete);
      });
    },
    editDataTag: (name, id) => {
      return new Promise((resolve, reject) => {
        crtl.connection
          .exec_sql(
            `UPDATE  consumer.collect_table_name SET name_tag = "${name}" WHERE id=${id}`
          )
          .then((response) => {
            // const results = response.data
            console.log(response);
            resolve(response);
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
  },
};
module.exports = crtl;
