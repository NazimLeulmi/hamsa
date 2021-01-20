// // ACTIVATE ACCOUNT GET ROUTE
app.get('/activate/:token', [
  param('token').notEmpty().withMessage("The token is required to activate the account")
    .isAlphanumeric().withMessage("The token must be alphanumeric")
    .isLength({ min: 96, max: 96 }).withMessage("Invalid token"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ error: errors.array()[0].msg });
  }
  let q = 'SELECT * FROM users WHERE activision_token=?';
  db.query(q, req.params.token, async (err, results) => {
    if (err) throw err;
    if (results.length === 0) return res.json({ error: "User doesn't exist" })
    let q = 'UPDATE users SET activated=1,activision_token=NULL WHERE activision_token=?';
    db.query(q, req.params.token, async (err, updateResults) => {
      if (err) throw err;
      console.log(updateResults, "Activated")
      let s1 = "display:flex;align-items:center;justify-content:center;";
      let s2 = "background:#F3E9DC;height:100%;flex-direction:column;";
      let style = s1 + s2;
      return res.send(`
      <html>
      <body style="margin:0;height:100%;">
      <div style=${style} >
      <img src="/whisper.png" height="150"/>
      <h1 style="font-size:3rem;">Activated</h1>
      </div>
      </body>
      </html> 
      `);
    })
  });
})