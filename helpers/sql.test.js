/** @format */

const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("Pass faulty data, expect error", function () {
  test("pass empty object to dataToUpdate", function () {
    try {
      const dataToUpdate = {};
      const jsToSql = {};
      sqlForPartialUpdate(dataToUpdate, jsToSql);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("neglect to send jsToSql", function () {
    const dataToUpdate = { firstName: "Aliya", age: 32 };
    const jsToSql = {};
    const { setCols, values } = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(setCols).toEqual('"firstName"=$1, "age"=$2');
  });
});

describe("Pass working data", function () {
  test("jsToSql functional", function () {
    const dataToUpdate = { firstName: "Aliya", age: 32 };
    const jsToSql = {
      firstName: "first_name",
    };
    const { setCols, values } = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(setCols).toEqual('"first_name"=$1, "age"=$2');
  });
});
