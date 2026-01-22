const adminService = require("../services/adminService");

const listRequests = async (req, res, next) => {
  try {
    const { history } = req.query;
    let result;
    if (history === "true") {
      // List everything except PENDING, or just list everything sorted by date
      // adminRepository.listAllRequests handles filtering if status passed, or all if not.
      // Let's rely on service or repo. adminService doesn't have listAll exposed? Checked repo.
      // Direct repo call or add service wrapper? adminService has generic pass-through typically?
      // Let's check adminService.
      result = await adminService.listHistoryRequests();
    } else {
      result = await adminService.listPendingRequests();
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const approve = async (req, res, next) => {
  try {
    const result = await adminService.approveRequest({
      adminUserId: req.user.userId,
      requestId: req.params.id,
      remarks: req.body.remarks,
      ipAddress: req.ip
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const reject = async (req, res, next) => {
  try {
    const result = await adminService.rejectRequest({
      adminUserId: req.user.userId,
      requestId: req.params.id,
      remarks: req.body.remarks,
      ipAddress: req.ip
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const listPermits = async (req, res, next) => {
  try {
    const result = await adminService.listPermits();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const listAuditLogs = async (req, res, next) => {
  try {
    const result = await adminService.listAuditLogs();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const result = await adminService.getDashboardStats();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const listVendors = async (req, res, next) => {
  try {
    const result = await adminService.listVendors();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listRequests,
  approve,
  reject,
  listPermits,
  listPermits,
  listAuditLogs,
  getStats,
  listVendors
};

