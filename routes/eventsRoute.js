import { Router } from "express";

const eventsRouter = Router();

eventsRouter.get("/", async (req, res) => {
  console.log(req.headers, "events");
});

eventsRouter.get("/:id", async (req, res) => {
  const e_id = req.params.id;
  console.log(req.headers, e_id);
});

export default eventsRouter;
