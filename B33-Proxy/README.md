# B33 Proxy

A dark purple/black B33-branded launcher based on [Chezburgar/Vela](https://github.com/Chezburgar/Vela). The deployment workflow fetches Vela's upstream proxy engines and runtime files, then overlays the B33 interface.

## Deploy to GitHub Pages

1. Create a **public** GitHub repository named `b33-proxy` (or another name).
2. Upload the contents of this ZIP to the repository root. Keep `.github/` and `.nojekyll`.
3. Open **Settings → Pages** and set **Source** to **GitHub Actions**.
4. Open the **Actions** tab. The workflow named **Deploy B33 Proxy to GitHub Pages** will run on the first push.
5. When it succeeds, open **Settings → Pages → Visit site**.

The site will be at `https://YOUR-USERNAME.github.io/REPOSITORY/`. GitHub Pages can take several minutes to publish.

## Important: proxy server requirement

GitHub Pages only serves static files. It cannot run the WISP server that carries proxied traffic. The launcher uses Vela's public demo WISP endpoint by default; it may be unavailable, rate-limited, or unsuitable for private use. For reliability and privacy, deploy your own compatible WISP server on a host that supports persistent WebSocket services, then click the gear icon on B33 and enter its `wss://` URL.

Do not send passwords, payment details, or other sensitive information through a public/shared proxy. A proxy operator may be able to observe traffic. Use HTTPS sites and follow your network rules and applicable law.

## Local preview

Service workers require HTTPS or localhost. From the project folder run:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080/`. The GitHub Actions deployment is what supplies Vela's engine folders.

## Upstream and licensing

- Base project: [Vela](https://github.com/Chezburgar/Vela)
- Proxy engines and transports are fetched from Vela's upstream repository during deployment.
- Review the upstream repository and its licenses before redistributing or modifying the deployed project.
