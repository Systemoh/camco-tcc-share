# CAMCO TCC browser sharing

A static HTTPS page that receives a TCC notification and optional ASP code from Power Apps. It loads the corresponding GIF and uses the browser’s share menu. Each user taps Share to WhatsApp on the page, selects WhatsApp in the menu, chooses the chat and sends.

## Deployment status

Prepared on 6 November 2026, Riyadh time. Published with explicit user approval for public source and all 60 ASP GIFs: https://systemoh.github.io/camco-tcc-share/ . Source revision d9c4235 deployed successfully. The handoff formula now contains the published URL.

## Hosting and confidentiality

The ASP media carries a LIMITED SHARING marking. Ordinary GitHub Pages sites are public, even when the source repository is private. Publish these files only to an approved audience. For restricted access, use an approved host with authentication, or an appropriately configured enterprise Pages site. A hidden URL, a private source repository, URL fragments and JavaScript checks do not provide access control.

All 60 GIFs in dist/media were copied from the user's Android package without changing their content. There are 46 Line 1 files and 14 Line 2 files.

## GitHub Pages setup after publication approval

1. Create a dedicated repository, for example camco-tcc-share. Avoid reusing an unrelated application repository.
2. Upload the CONTENTS of dist/ to the repository root. index.html, share.css, share.js, .nojekyll and media/ should be at the root.
3. Open Settings → Pages. Select Deploy from a branch, then main and /(root). Save and enable HTTPS.
4. Copy the actual page URL shown by GitHub. Test it with a synthetic message first.
5. In PowerApps_TCC_Web_OnSelect.txt, replace PASTE_PUBLISHED_HTTPS_PAGE_URL_HERE with that exact HTTPS URL. Use the root URL ending in / with no existing fragment or query string.
6. In Power Apps Studio → TCC Notification → Image15_3.OnSelect, paste the complete formula. Save and publish.
7. Open SD&O Kit on the phone, select a partial disruption and ASP, confirm the date/time and tap the WhatsApp icon. Wait for the GIF to load, then tap Share to WhatsApp and choose WhatsApp from the phone’s share menu.

For internal hosting, serve the contents of dist/ over HTTPS and use the actual internal HTTPS URL in the same formula.

## Supported behaviour and limits

The page checks file-sharing support with navigator.canShare({files}). It preloads the actual GIF before the user’s Share click so the share call can run within the browser’s required user activation. The webpage cannot select WhatsApp on behalf of the user. A Power Apps click opening another page does not reliably satisfy this activation requirement, so the page requires its own Share click.

Use a compatible browser on the same phone as WhatsApp. Android Chrome is the primary target. Web Share and GIF support vary by browser, operating system and installed WhatsApp version. Desktop/in-app browsers may need the fallback. On unsupported browsers the page offers Download GIF and Copy message. WhatsApp may discard supplied caption text, in which case the user copies and pastes it. A resolved Web Share promise does not establish that a WhatsApp message was sent or delivered.

Files must be served as GIFs, with HTTPS enabled. A Content-Security-Policy in the page allows only same-origin scripts, styles and files, and disables remote scripts and form submission. Any host-level web-share Permissions-Policy must allow this top-level page. Do not embed the page in an iframe without appropriate permissions.

Message data is passed in a URL fragment, read into memory and removed from the visible address with history.replaceState. The page has no analytics, external script dependencies, server API, CAMCO login, localStorage or message database. The share text is provided only to the share target selected by the user. Clipboard writes happen only after the user presses Copy message. The host still sees ordinary file requests, including the selected ASP filename. Browser or corporate tooling may observe URLs. Refreshing the page requires opening the notification from Power Apps again.

## Verification and security review

Scope: static page, Power Fx handoff formula and bundled media. No native APK or CAMCO tenant changes are included.

Completed checks: loading a synthetic notification and L2-14 in a browser, animation display, unsupported-browser fallback and rejection of invalid ASP paths. Automated JavaScript tests verified exact Unicode text and file payloads, text-only sharing, clipboard handling, file-share fallback, cancellation, GIF load failure, invalid ASP/path input and the 12,000-character message limit. All 60 files are included. No credentials, Microsoft connection tokens or staff-list exports are bundled.

HTTPS is enforced in GitHub Pages. Source review and automated checks passed; no confirmed high-severity issue was identified. Public media publication was explicitly approved. Live Android-to-WhatsApp delivery, account MFA, host-level security headers and the final Power Apps launch remain unverified. The formula must be tested in Power Apps Studio and on the target phone. Retain the existing app formula as a rollback before publishing the change.

Primary documentation:
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
