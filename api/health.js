module.exports = (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'grok-automation',
    timestamp: new Date().toISOString()
  });
};
