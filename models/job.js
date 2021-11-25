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

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(
      `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle`,
      [title, salary, equity, company_handle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
      `SELECT id, 
            title, 
            salary, 
            equity, 
            company_handle
           FROM jobs
           ORDER BY id`
    );
    return jobsRes.rows;
  }

  /** Find jobs with filter
   *
   * accepts 1 arugment, the req.query data
   *
   * Returns [{ id, title, salary, equity, company_handle } of filtered jobs
   */

  static async findFilter(reqQueryObj) {
    // pull the 3 query objects
    const { title, minSalary, hasEquity } = reqQueryObj;

    // ensure you only have the 3 valid query possibities.
    const queryArr = Object.keys(reqQueryObj);
    let validQuerys = queryArr.filter((query) => {
      return (
        query === "title" || query === "minSalary" || query === "hasEquity"
      );
    });
    if (validQuerys.length != queryArr.length) {
      throw new ExpressError("You have an invalid query.");
    }

    // prep the filter to be placed directly into SQL
    let SQLFilter = "";

    // BIG logic to create the SQL filter...
    if (title) {
      SQLFilter += `title ILIKE '%${title}%'`;
    }
    if (title && minSalary) {
      SQLFilter += `AND `;
    }
    if (minSalary) {
      SQLFilter += `salary >= ${minSalary}`;
    }
    if ((minSalary && hasEquity) || (hasEquity && title)) {
      SQLFilter += `AND `;
    }
    if (hasEquity) {
      SQLFilter += `equity != 0`;
    }

    // make the SQL request
    const jobsRes = await db.query(
      `SELECT   id, 
                title, 
                salary, 
                equity, 
                company_handle
          FROM jobs
          WHERE ${SQLFilter}
          ORDER BY id`
    );
    return jobsRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
      `SELECT   id, 
                title, 
                salary, 
                equity, 
                company_handle
           FROM jobs
           WHERE id = $1`,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity }
   *
   * Returns: {id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    let invalidQuerys = Object.keys(data).filter((query) => {
      return query === "id" || query === "company_handle";
    });
    if (invalidQuerys.length != 0) {
      throw new BadRequestError();
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      companyHandle: "company_handle",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job;
