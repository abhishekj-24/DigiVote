const Config = require('../model/Config');

/**
 * Get current election config (public)
 */
async function getConfig(req, res) {
  try {
    const config = await Config.findOne().sort({ createdAt: -1 }).lean();
    if (!config) {
      return res.json({
        success: true,
        config: {
          electionStatus: 'registration',
          startTime: null,
          endTime: null,
          registrationDeadline: null,
        },
        serverTime: new Date().toISOString(),
      });
    }
    res.json({
      success: true,
      config: {
        electionStatus: config.electionStatus,
        startTime: config.startTime,
        endTime: config.endTime,
        registrationDeadline: config.registrationDeadline,
      },
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Update election config (admin only - add admin auth in route)
 */
async function updateConfig(req, res) {
  try {
    const { electionStatus, startTime, endTime, registrationDeadline } = req.body;
    const config = await Config.findOneAndUpdate(
      {},
      {
        $set: {
          ...(electionStatus && { electionStatus }),
          ...(startTime && { startTime: new Date(startTime) }),
          ...(endTime && { endTime: new Date(endTime) }),
          ...(registrationDeadline && {
            registrationDeadline: new Date(registrationDeadline),
          }),
        },
      },
      { upsert: true, new: true }
    );
    res.json({
      success: true,
      config: {
        electionStatus: config.electionStatus,
        startTime: config.startTime,
        endTime: config.endTime,
        registrationDeadline: config.registrationDeadline,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
}

module.exports = { getConfig, updateConfig };
