const express = require('express');
const middleware = require('@blocklet/sdk/lib/middlewares');
const Project = require('../states/projects');

const router = express.Router();
const auth = middleware.auth();
const user = middleware.user();

router.post('/save', user, auth, async (req, res) => {
  const project = await Project.insert({
    author: { name: req.user.fullName, avatar: req.body.avatar, did: req.user.did },
    participant: [{ did: req.user.did, name: req.user.fullName, records: [] }],
    unitPrice: req.body.price,
    title: req.body.title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startAt: req.body.startTime,
    endAt: req.body.endTime,
  });

  res.json({ ...project });
});

// 报名
router.post('/apply', user, auth, async (req, res) => {
  const project = await Project.update(
    {
      _id: req.body.id,
    },
    { $push: { participant: { name: req.user.fullName, did: req.user.did, records: [] } } }
  );
  res.json({ ...project });
});

// 打卡
router.post('/addRecord', user, auth, async (req, res) => {
  const project = await Project.findOne({ _id: req.body.id });
  const currentParticipant = project.participant.find((i) => i.did === req.user.did);
  currentParticipant.records.push(new Date().toISOString());

  const newProject = await Project.update(
    { _id: req.body.id },
    {
      ...project,
      updatedAt: new Date().toISOString(),
    }
  );
  res.json({ ...newProject });
});

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

router.get('/lists', auth, async (req, res) => {
  let page = Number(req.query.page || 1);
  let pageSize = Number(req.query.pageSize || DEFAULT_PAGE_SIZE);

  page = Number.isNaN(page) ? 1 : page;
  pageSize = Number.isNaN(pageSize) ? DEFAULT_PAGE_SIZE : pageSize;
  pageSize = pageSize > MAX_PAGE_SIZE ? MAX_PAGE_SIZE : pageSize;

  const conditions = {};
  const docs = await Project.find(conditions).sort({ updatedAt: -1 }).paginate(page, pageSize);
  const total = await Project.count(conditions);
  res.json({ docs, total, page, pageSize, pageCount: Math.ceil(total / pageSize) });
});

router.get('/myLists', user, auth, async (req, res) => {
  let page = Number(req.query.page || 1);
  let pageSize = Number(req.query.pageSize || DEFAULT_PAGE_SIZE);

  page = Number.isNaN(page) ? 1 : page;
  pageSize = Number.isNaN(pageSize) ? DEFAULT_PAGE_SIZE : pageSize;
  pageSize = pageSize > MAX_PAGE_SIZE ? MAX_PAGE_SIZE : pageSize;

  const conditions = { participant: { $elemMatch: { did: req.user.did } } };
  const docs = await Project.find(conditions).sort({ updatedAt: -1 }).paginate(page, pageSize);
  const total = await Project.count(conditions);
  res.json({ docs, total, page, pageSize, pageCount: Math.ceil(total / pageSize) });
});

module.exports = router;
