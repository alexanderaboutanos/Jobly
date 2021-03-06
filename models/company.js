/** @format */

"use strict";

const { query } = require("express");
const db = require("../db");
const {
  BadRequestError,
  NotFoundError,
  ExpressError,
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`
    );
    return companiesRes.rows;
  }

  /** Find companies with filter
   *
   * accepts 1 arugment, the req.query data
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl } of filtered companies
   */

  static async findFilter(reqQueryObj) {
    // pull the 3 query objects
    const { minEmployees, maxEmployees, nameLike } = reqQueryObj;

    // ensure you only have the 3 valid query possibities.
    const queryArr = Object.keys(reqQueryObj);
    let validQuerys = queryArr.filter((query) => {
      return (
        query === "nameLike" ||
        query === "minEmployees" ||
        query === "maxEmployees"
      );
    });
    if (validQuerys.length != queryArr.length) {
      throw new ExpressError("You have an invalid query.");
    }

    // prep the filter to be placed directly into SQL
    let SQLFilter = "";

    // BIG logic to create the SQL filter...
    if (nameLike) {
      SQLFilter += `name ILIKE '%${nameLike}%'`;
    }
    if (nameLike && (minEmployees || maxEmployees)) {
      SQLFilter += `AND `;
    }
    if (maxEmployees && !minEmployees) {
      SQLFilter += `num_employees < ${maxEmployees}`;
    }
    if (minEmployees && !maxEmployees) {
      SQLFilter += `num_employees > ${minEmployees}`;
    }
    if (maxEmployees && minEmployees) {
      if (minEmployees > maxEmployees) {
        throw new ExpressError(
          "Query String: Min value is greater than Max value!"
        );
      }
      SQLFilter += `num_employees BETWEEN ${minEmployees} AND ${maxEmployees}`;
    }

    // make the SQL request
    const companiesRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
          FROM companies
          WHERE ${SQLFilter}
          ORDER BY name`
    );
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity}, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT   handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    let company = companyRes.rows[0];
    if (!company) throw new NotFoundError(`No company: ${handle}`);

    const jobsRes = await db.query(
      `SELECT   id,
                title,
                salary,
                equity
          FROM jobs
          WHERE company_handle = $1`,
      [handle]
    );

    // add the jobs onto the object
    company.jobs = jobsRes.rows;

    return company;
  }

  // THOUGHT TO USE THIS METHOD ABOVE,
  // DECIDED AGAINST IT BECAUSE PULLING MULTIPLE JOBS
  // const companyRes = await db.query(
  //   `SELECT     c.handle,
  //               c.name,
  //               c.description,
  //               c.num_employees AS "numEmployees",
  //               c.logo_url AS "logoUrl",
  //               j.id,
  //               j.title,
  //               j.salary,
  //               j.equity
  //        FROM companies AS c
  //           JOIN jobs AS j ON c.handle = j.company_handle
  //        WHERE handle = $1`,
  //   [handle]
  // );

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
