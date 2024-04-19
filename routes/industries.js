/** Routes for industries. */

const express = require("express");
const ExpressError = require("../expressError");
const db = require("../db");

let router = new express.Router();

/** POST /industries - Add new industry */
router.post("/industries", async function (req, res, next) {
  try {
    const { code, industry } = req.body;
    const result = await db.query(
      `INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`,
      [code, industry]
    );
    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** GET /industries - List all industries with associated company codes */
router.get("/industries", async function (req, res, next) {
  try {
    const result = await db.query(
      `SELECT i.code, i.industry, array_agg(ci.company_code) AS company_codes
       FROM industries AS i
       LEFT JOIN company_industry AS ci ON (i.code = ci.industry_code)
       GROUP BY i.code, i.industry`
    );
    return res.json({ industries: result.rows });
  } catch (err) {
    return next(err);
  }
});

/** POST /companies/:companyCode/industries/:industryCode - Associate an industry to a company */
router.post("/companies/:companyCode/industries/:industryCode", async function (req, res, next) {
  try {
    const { companyCode, industryCode } = req.params;
    const result = await db.query(
      `INSERT INTO company_industry (company_code, industry_code) VALUES ($1, $2) RETURNING company_code, industry_code`,
      [companyCode, industryCode]
    );
    return res.status(201).json({ association: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
