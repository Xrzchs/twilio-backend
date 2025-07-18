const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { jwt } = require("twilio");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/token", (req, res) => {
  const AccessToken = jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWIML_APP_SID,
    incomingAllow: true,
  });

  const token = new AccessToken(
    process.env.ACCOUNT_SID,
    process.env.API_KEY_SID,
    process.env.API_KEY_SECRET,
    { identity: "user" }
  );

  token.addGrant(voiceGrant);
  res.send({ token: token.toJwt() });
});

app.post("/sms", (req, res) => {
  const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

  client.messages
    .create({
      body: req.body.message,
      from: process.env.TWILIO_PHONE,
      to: req.body.to,
    })
    .then((message) => res.send({ sid: message.sid }))
    .catch((err) => {
      console.error(err);
      res.status(500).send({ error: "Failed to send SMS" });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
