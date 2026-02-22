const express = require('express');
const PolicyService = require('../services/PolicyService');

const router = express.Router();

/**
 * GET /api/policies/search
 * Search policies by username (firstname)
 * Query params: username (required)
 */
router.get('/search', async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Username query parameter is required' });
    }

    const result = await PolicyService.searchPoliciesByUsername(username);
    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/policies/aggregated
 * Get aggregated policies by each user
 */
router.get('/aggregated', async (req, res) => {
  try {
    const result = await PolicyService.getAggregatedPoliciesByUser();
    res.json(result);
  } catch (error) {
    console.error('Aggregation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
