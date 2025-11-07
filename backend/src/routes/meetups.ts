// import {  } from 'express';
import { Request, Response, Router } from "express";
import db from "../db.js";
import auth from "../middleware/authMiddleware.js";
// import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get("/", async (req, res) => {
  try {
    // const q = req.query.q as string;
    const q =
      (req.query.q as string) ?? (req.query.searchQuery as string) ?? "";

    if (q) {
      // const term = `%${q}%`;
      const term = q.trim();
      if (term) {
        const like = `%${term}%`;
        const result = await db.query(
          `SELECT * FROM meetups
         WHERE name ILIKE $1 OR description ILIKE $1
         ORDER BY date ASC`,
          [like]
        );
        return res.json(result.rows);
      }

      // const result = await db.query(
      //   `SELECT * FROM meetups WHERE name ILIKE $1 OR description ILIKE $1`,
      //   [term]
      // );
      // return res.json(result.rows);
    }

    // const result = await db.query(
    //   `SELECT * FROM meetups WHERE date >= NOW() ORDER BY date ASC`
    // );

    // const result = await db.query(
    //   `SELECT *
    //    FROM meetups
    //    WHERE COALESCE(date::timestamp, "startAt") >= NOW()
    //       OR (date IS NULL AND "startAt" IS NULL) = FALSE
    //    ORDER BY date NULLS LAST, "startAt" NULLS LAST`
    // );

    const result = await db.query(
      `SELECT * FROM meetups
       WHERE date >= NOW()
       ORDER BY date ASC`
    );

    res.json(result.rows);
  } catch (e: any) {
    console.error("GET /meetups failed:", e?.code, e?.message, e?.detail);

    return res.status(500).json({ error: "Failed to fetch meetups" });
  }
});

router.get("/:id", async (req, res) => {
  const result = await db.query(`SELECT * FROM meetups WHERE id = $1`, [
    req.params.id,
  ]);
  res.json(result.rows[0]);
});

router.post("/:id/register", auth, async (req: Request, res: Response) => {
  const meetupId = req.params.id;
  const userId = req.userId;

  const capacityCheck = await db.query(
    `
    SELECT capacity, (
      SELECT COUNT(*) FROM registrations WHERE meetup_id = $1
    ) AS current FROM meetups WHERE id = $1
  `,
    [meetupId]
  );

  if (capacityCheck.rows[0].current >= capacityCheck.rows[0].capacity) {
    return res.status(400).json({ error: "Meetup is full" });
  }

  //   await db.query(
  //     `INSERT INTO registrations (id, user_id, meetup_id) VALUES ($1, $2, $3)`,
  //     [uuidv4(), req.userId, meetupId]
  //   );

  const { v4: uuidv4 } = await import("uuid"); // 👈 funkar i CJS
  await db.query(
    `INSERT INTO registrations (id, user_id, meetup_id)
   VALUES ($1, $2, $3)`,
    [uuidv4(), req.userId, meetupId]
  );

  res.status(201).json({ message: "Registered" });
});

router.delete("/:id/register", auth, async (req: Request, res: Response) => {
  const userId = req.userId;
  const result = await db.query(
    `DELETE FROM registrations WHERE meetup_id = $1 AND user_id = $2`,
    [req.params.id, userId]
  );
  if (result.rowCount === 0)
    return res.status(403).json({ error: "Not registered or not owner" });
  res.json({ message: "Unregistered" });
});

export default router;
