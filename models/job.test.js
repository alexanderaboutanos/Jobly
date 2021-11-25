/** @format */

"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newjob = {
    title: "test job title",
    salary: 123456,
    equity: 0,
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newjob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "test job title",
      salary: 123456,
      equity: "0",
      company_handle: "c1",
    });

    const result = await db.query(
      `SELECT   id, 
                title, 
                salary, 
                equity, 
                company_handle
           FROM jobs
           WHERE id = ${job.id}`
    );
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "test job title",
        salary: 123456,
        equity: "0",
        company_handle: "c1",
      },
    ]);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "job1",
        salary: 10000,
        equity: "0",
        company_handle: "c1",
      },
      {
        id: expect.any(Number),
        title: "job2",
        salary: 20000,
        equity: "0.02",
        company_handle: "c2",
      },
      {
        id: expect.any(Number),
        title: "job3",
        salary: 30000,
        equity: "0.03",
        company_handle: "c3",
      },
    ]);
  });
});

/************************************** findFilter */

describe("findFilter", function () {
  test("works: filter for min salary", async function () {
    let reqQueryObj = {
      minSalary: 20001,
    };
    let jobs = await Job.findFilter(reqQueryObj);
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "job3",
        salary: 30000,
        equity: "0.03",
        company_handle: "c3",
      },
    ]);
  });

  test("works: filter for hasEquity", async function () {
    let reqQueryObj = {
      hasEquity: true,
    };
    let jobs = await Job.findFilter(reqQueryObj);
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "job2",
        salary: 20000,
        equity: "0.02",
        company_handle: "c2",
      },
      {
        id: expect.any(Number),
        title: "job3",
        salary: 30000,
        equity: "0.03",
        company_handle: "c3",
      },
    ]);
  });

  test("works: filter for title", async function () {
    let reqQueryObj = {
      title: "job1",
    };
    let jobs = await Job.findFilter(reqQueryObj);
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "job1",
        salary: 10000,
        equity: "0",
        company_handle: "c1",
      },
    ]);
  });

  test("works: filter for hasEquity, title, and minSalary", async function () {
    let reqQueryObj = {
      hasEquity: true,
      title: "job3",
      minSalary: 20001,
    };
    let jobs = await Job.findFilter(reqQueryObj);
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "job3",
        salary: 30000,
        equity: "0.03",
        company_handle: "c3",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "job1",
      salary: 10000,
      equity: "0",
      company_handle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** update */

describe("update", function () {
  const updateData = {
    title: "New Job Title",
    salary: 10001,
    equity: 0.01,
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      title: "New Job Title",
      salary: 10001,
      equity: "0.01",
      company_handle: "c1",
    });

    const result = await db.query(
      `SELECT   id, 
                title, 
                salary, 
                equity, 
                company_handle
           FROM jobs
           WHERE id = 1`
    );
    expect(result.rows).toEqual([
      {
        id: 1,
        title: "New Job Title",
        salary: 10001,
        equity: "0.01",
        company_handle: "c1",
      },
    ]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New Job Title",
      salary: null,
      equity: null,
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      title: "New Job Title",
      salary: null,
      equity: null,
      company_handle: "c1",
    });

    const result = await db.query(
      `SELECT   id, 
                title, 
                salary, 
                equity, 
                company_handle
          FROM jobs
           WHERE id = 1`
    );
    expect(result.rows).toEqual([
      {
        id: 1,
        title: "New Job Title",
        salary: null,
        equity: null,
        company_handle: "c1",
      },
    ]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(9999, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query("SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
