const abdmHprService = require("../services/abdmHprIngestion.service");

const getSyncStatus = async (req, res, next) => {
  try {
    const result = await abdmHprService.getRegistrySyncStatus();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const triggerSync = async (req, res, next) => {
  try {
    const result = await abdmHprService.triggerStatewideIngestion(req.user, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const searchHpr = async (req, res, next) => {
  try {
    const result = await abdmHprService.searchAbdmHpr(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSyncStatus,
  triggerSync,
  searchHpr,
};
