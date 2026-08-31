const { sendSuccess } = require("../utils/response");
const campaignsService = require("../services/campaigns.service");

const getCampaigns = async (req, res, next) => {
  try {
    const { district, taluka, village, phc_id, language } = req.query;
    const campaigns = await campaignsService.getCampaigns({
      district,
      taluka,
      village,
      phc_id,
      language,
    });
    return sendSuccess(res, {
      statusCode: 200,
      data: campaigns,
    });
  } catch (err) {
    next(err);
  }
};

const createCampaign = async (req, res, next) => {
  try {
    const campaign = await campaignsService.createCampaign(req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Health campaign published successfully",
      data: campaign,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
};
