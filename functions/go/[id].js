/*
  Four-link server-side fallback redirect for Cloudflare Pages Functions.

  Replace the 8 example URLs below with your real URLs.
  Each button uses /go/1, /go/2, /go/3 or /go/4.
*/

const LINKS = {
  "1": {
    primary: "https://skyindex.vercel.app/index.html",
    fallback: "https://example.com/one-fallback"
  },
  "2": {
    primary: "https://github.com/kanharaghuwanshi/SkyIndex",
    fallback: "git@github.com:kanharaghuwanshi/SkyIndex.git"
  },
  "3": {
    primary: "https://example.com/three",
    fallback: "https://example.com/three-fallback"
  },
  "4": {
    primary: "https://example.com/four",
    fallback: "https://example.com/four-fallback"
  }
};

// Maximum time spent checking the primary destination.
const TIMEOUT_MS = 2500;

function isUsableUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function checkPrimary(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal
    });

    // Some websites do not implement HEAD. Retry with GET in that case.
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        cache: "no-store",
        signal: controller.signal
      });

      // We only needed the status, not the page body.
      await response.body?.cancel();
    }

    // A final 2xx response means the destination responded successfully.
    return response.status >= 200 && response.status < 300;
  } catch {
    // Timeout, DNS failure, connection failure, etc.
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function onRequestGet(context) {
  const id = String(context.params.id ?? "");
  const link = LINKS[id];

  if (!link || !isUsableUrl(link.primary) || !isUsableUrl(link.fallback)) {
    return new Response("Link configuration error", { status: 500 });
  }

  const primaryAvailable = await checkPrimary(link.primary);
  const destination = primaryAvailable ? link.primary : link.fallback;

  return Response.redirect(destination, 302);
}
