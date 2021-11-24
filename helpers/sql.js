/** @format */

const { BadRequestError } = require("../expressError");

/** When updating database, this function allows you to be selective on which values you wish to update. You need not update all values each time you wish to update.
 *
 * Two arguments are passed in.
 *    - dataToUpdate is an object with the keys/value pairs you would like modified.
 *        e.g. {name, description, numEmployees, logoUrl}
 *
 *    - jsToSql. Our SQL database columns are not always identical to the Javascript.
 *      When such a discrepancy occurs, this function turns the Javascript to SQL.
 *
 *  */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
