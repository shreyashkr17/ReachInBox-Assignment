import express from "express";
import dotenv from "dotenv";
import { GoogleOAuthService } from "./services/google.service";
import { startEmailProcessing } from "./redis.worker";
import path from "path";

dotenv.config();

const app = express();

const googleOAuth = new GoogleOAuthService(
  process.env.GOOGLE_CLIENT_ID ?? "",
  process.env.GOOGLE_CLIENT_SECRET ?? "",
  process.env.GOOGLE_REDIRECT_URI ?? ""
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "assets", "home.html"));
});

app.get("/auth/google", (req, res) => {
  const authUrl = googleOAuth.getAuthorizationUrl();
  res.redirect(authUrl);
});

app.get("/auth/google/callback", async (req, res) => {
  try {
    const code = req.query.code as string;
    const tokens = await googleOAuth.getTokensFromCode(code);
    const userInfo = await googleOAuth.getUserInfo(tokens.access_token);

    console.log(tokens.access_token);

    await startEmailProcessing(tokens);

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReachInBox - User Details</title>
    <style>
        /* Reset some default styles */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }

        .logo {
            text-align: center;
            margin-bottom: 40px;
        }

        .logo img {
            width: 60px;
            height: 60px;
        }

        .user-info {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            padding: 30px;
        }

        .user-info h1 {
            font-size: 24px;
            margin-bottom: 20px;
        }

        .user-info pre {
            background-color: #f5f5f5;
            border-radius: 4px;
            padding: 20px;
            font-size: 14px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgMjQgMjQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPSIjMWE3M2U4IiBkPSJNMjAgNEg0Yy0xLjEgMC0yIC45LTIgMnYxMmMwIDEuMS45IDIgMiAyaDE2YzEuMSAwIDItLjkgMi0yVjZjMC0xLjEtLjktMi0yLTJ6bTAgMTRINFY4bDggNSA4LTV2MTB6bS04LTdMNCA2aDE2bC04IDV6IiAvPgogICAgICAgICAgICA8L3N2Zz4=" alt="ReachInBox Logo">
        </div>
        <div class="user-info">
            <h1>User Details</h1>
            <pre id="user-details"></pre>
        </div>
    </div>

    <script>
        // Assuming the user information is available in a JavaScript object
        const userInfo = ${JSON.stringify(userInfo, null, 2)}

        // Display the user information in the pre element
        const userDetailsElement = document.getElementById('user-details');
        userDetailsElement.textContent = JSON.stringify(userInfo, null, 2);
    </script>
</body>
</html>
        `);
  } catch (error) {
    console.log(error);
    res.redirect("/error");
  }
});

const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
