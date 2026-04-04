"use client";

interface Props {
  twitterPostUrl?: string | null;
  instagramPostUrl?: string | null;
  tiktokPostUrl?: string | null;
}

function extractTweetId(url: string): string | null {
  const m = url.match(/\/status\/(\d+)/);
  return m ? m[1] : null;
}

function extractInstagramId(url: string): string | null {
  const m = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[2] : null;
}

function extractTikTokId(url: string): string | null {
  const m = url.match(/\/video\/(\d+)/);
  return m ? m[1] : null;
}

export default function SnsPostEmbed({ twitterPostUrl, instagramPostUrl, tiktokPostUrl }: Props) {
  const tweetId = twitterPostUrl ? extractTweetId(twitterPostUrl) : null;
  const igId    = instagramPostUrl ? extractInstagramId(instagramPostUrl) : null;
  const ttId    = tiktokPostUrl ? extractTikTokId(tiktokPostUrl) : null;

  if (!tweetId && !igId && !ttId) return null;

  return (
    <div className="mt-8">
      <h2 className="text-base font-semibold text-gray-800 mb-4">SNS最新投稿</h2>
      <div className="space-y-4">
        {tweetId && (
          <div>
            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/x.png" alt="X" className="w-4 h-4" /> X (Twitter)
            </p>
            <iframe
              src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&lang=ja&theme=light`}
              className="w-full rounded-xl border border-gray-200"
              style={{ height: 320 }}
              loading="lazy"
              scrolling="no"
            />
          </div>
        )}

        {igId && (
          <div>
            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/instagram.svg" alt="Instagram" className="w-4 h-4" /> Instagram
            </p>
            <iframe
              src={`https://www.instagram.com/p/${igId}/embed/?cr=1&v=14`}
              className="w-full rounded-xl border border-gray-200"
              style={{ height: 540 }}
              loading="lazy"
              scrolling="no"
              allowTransparency
            />
          </div>
        )}

        {ttId && (
          <div>
            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/tiktok.png" alt="TikTok" className="w-4 h-4" /> TikTok
            </p>
            <iframe
              src={`https://www.tiktok.com/embed/v2/${ttId}?lang=ja`}
              className="w-full rounded-xl border border-gray-200"
              style={{ height: 740 }}
              loading="lazy"
              scrolling="no"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            />
          </div>
        )}
      </div>
    </div>
  );
}
