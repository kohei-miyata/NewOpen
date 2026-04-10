"use client";

import { useState, useEffect, useActionState, useRef } from "react";
import ImageUpload from "@/components/ImageUpload";
import SnsPostEmbed from "@/components/SnsPostEmbed";
import type { Store } from "@/types";
import { CATEGORIES } from "@/lib/categories";

const INPUT = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors";
const INPUT_NORMAL = `${INPUT} border-gray-300 focus:border-orange-400`;
const INPUT_ERROR  = `${INPUT} border-red-400 focus:border-red-400 bg-red-50`;

const SNS_FIELDS = [
  { name: "sns_website",     icon: "/icons/website.svg",   placeholder: "公式サイト URL" },
  { name: "sns_instagram",   icon: "/icons/instagram.svg", placeholder: "Instagram URL" },
  { name: "sns_twitter",     icon: "/icons/x.png",         placeholder: "X (Twitter) URL" },
  { name: "sns_tiktok",      icon: "/icons/tiktok.png",    placeholder: "TikTok URL" },
  { name: "sns_line",        icon: "/icons/LINE.png",      placeholder: "LINE 公式アカウント URL" },
  { name: "sns_google_maps", icon: "/icons/maps.svg",      placeholder: "Google マップ URL" },
];

type Errors = Partial<Record<"name" | "address" | "openDate" | "description", string>>;
type ActionState = { error?: string } | null;
type StoreAction = (prevState: ActionState, formData: FormData) => Promise<ActionState>;

interface Props {
  action: StoreAction;
  defaultValues?: Partial<Store>;
  submitLabel?: string;
  serverError?: string;
  isEdit?: boolean;
}

interface PreviewData {
  name: string;
  category: string;
  address: string;
  openDate: string;
  hoursText: string;
  description: string;
  imageUrl: string;
  status: string;
  tags: string;
  photos: (string | undefined)[];
  sns: Record<string, string>;
  postTwitterUrl: string;
  postInstagramUrl: string;
  postTiktokUrl: string;
}

const STATUS_LABEL: Record<string, string> = {
  active:             "営業中",
  temporarily_closed: "休業中",
  closed:             "閉店",
};

export default function OwnerStoreForm({ action, defaultValues, submitLabel = "保存する", serverError, isEdit = false }: Props) {
  const [state, formAction] = useActionState(action, null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<(string | undefined)[]>(
    [0, 1, 2, 3, 4].map((i) => defaultValues?.photos?.[i])
  );
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const defaultSns = defaultValues?.snsLinks as Record<string, string> | undefined;
  const [snsValues, setSnsValues] = useState<Record<string, string>>(
    Object.fromEntries(SNS_FIELDS.map((f) => [f.name, defaultSns?.[f.name.replace("sns_", "")] ?? ""]))
  );
  const [postTwitterUrl, setPostTwitterUrl]     = useState(defaultValues?.twitterPostUrl   ?? "");
  const [postInstagramUrl, setPostInstagramUrl] = useState(defaultValues?.instagramPostUrl ?? "");
  const [postTiktokUrl, setPostTiktokUrl]       = useState(defaultValues?.tiktokPostUrl    ?? "");

  function movePhoto(from: number, to: number) {
    setPhotos((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }

  useEffect(() => {
    const firstErrorKey = (["name", "address", "openDate", "description"] as const).find(
      (k) => errors[k]
    );
    if (!firstErrorKey) return;
    const el = document.querySelector(`[data-field="${firstErrorKey}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [errors]);

  function validate(fd: FormData): boolean {
    const e: Errors = {};
    const name        = (fd.get("name")        as string).trim();
    const address     = (fd.get("address")     as string).trim();
    const openDate    =  fd.get("openDate")    as string;
    const description = (fd.get("description") as string).trim();

    if (!name || name.length < 2)      e.name        = "店舗名は2文字以上で入力してください";
    if (name.length > 50)              e.name        = "店舗名は50文字以内で入力してください";
    if (!address) {
      e.address = "住所を入力してください";
    } else if (!/[都道府県]/.test(address)) {
      e.address = "都道府県から入力してください（例: 東京都渋谷区〇〇1-2-3）";
    } else if (!/[市区町村郡]/.test(address)) {
      e.address = "市区町村まで入力してください（例: 東京都渋谷区〇〇1-2-3）";
    }
    if (!isEdit && !openDate)                     e.openDate    = "オープン日を選択してください";
    if (!description || description.length < 10) e.description = "説明は10文字以上で入力してください";
    if (description.length > 500)     e.description = "説明は500文字以内で入力してください";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function field(key: keyof Errors) {
    return errors[key] ? INPUT_ERROR : INPUT_NORMAL;
  }

  function handlePreview(e: React.MouseEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    if (!validate(fd)) return;

    setPreviewData({
      name:        (fd.get("name")        as string).trim(),
      category:    (fd.get("category")    as string),
      address:     (fd.get("address")     as string).trim(),
      openDate:    (fd.get("openDate")    as string) || defaultValues?.openDate || "",
      hoursText:   (fd.get("hoursText")   as string).trim(),
      description: (fd.get("description") as string).trim(),
      imageUrl:    (fd.get("imageUrl")    as string) || defaultValues?.imageUrl || "",
      status:           (fd.get("status")             as string) || "active",
      tags:             (fd.get("tags")               as string).trim(),
      photos,
      sns: Object.fromEntries(
        SNS_FIELDS.map((f) => [f.name.replace("sns_", ""), snsValues[f.name].trim()])
          .filter(([, v]) => v)
      ),
      postTwitterUrl:   postTwitterUrl.trim(),
      postInstagramUrl: postInstagramUrl.trim(),
      postTiktokUrl:    postTiktokUrl.trim(),
    });
    setShowPreview(true);
  }

  const actionError = state?.error ?? serverError;

  useEffect(() => {
    if (state?.error) setSubmitting(false);
  }, [state]);

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={(e) => {
          const fd = new FormData(e.currentTarget);
          if (!validate(fd)) { e.preventDefault(); return; }
          setSubmitting(true);
        }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5"
      >
        {actionError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{actionError}</p>
        )}
        {!isEdit && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-xs text-orange-800 leading-relaxed">
            <p className="font-bold mb-1">掲載期間について</p>
            <p>オープン日から<strong>3年間</strong>、店舗情報が一般公開されます。3年経過後は自動的に一般公開が終了しますが、マイページからは引き続き確認・管理できます。</p>
          </div>
        )}
        {!isEdit && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-800 leading-relaxed">
            <p className="font-bold mb-1">審査について</p>
            <p>店舗情報は登録後、<strong>3営業日以内</strong>に審査を行います。承認後に一般公開されます。結果はご登録メールアドレスにお送りします。</p>
          </div>
        )}
        {/* 店舗名 */}
        <div data-field="name">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            店舗名 <span className="text-red-500">*</span>
          </label>
          <input
            name="name" defaultValue={defaultValues?.name}
            className={field("name")} placeholder="例: カフェ〇〇"
            onChange={() => setErrors((p) => ({ ...p, name: undefined }))}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* カテゴリ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ <span className="text-red-500">*</span>
          </label>
          <select name="category" defaultValue={defaultValues?.category} className={INPUT_NORMAL}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* 住所 */}
        <div data-field="address">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            住所 <span className="text-red-500">*</span>
          </label>
          <input
            name="address" defaultValue={defaultValues?.address}
            className={field("address")} placeholder="例: 東京都渋谷区〇〇1-2-3"
            onChange={() => setErrors((p) => ({ ...p, address: undefined }))}
          />
          {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
        </div>

        {/* オープン日 */}
        <div data-field="openDate">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            オープン日 <span className="text-red-500">*</span>
          </label>
          {isEdit ? (
            <>
              <input
                type="date" value={defaultValues?.openDate ?? ""}
                readOnly disabled
                className={`${INPUT} border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed`}
              />
              <p className="text-xs text-gray-400 mt-1">一度登録したオープン日は変更できません</p>
            </>
          ) : (
            <>
              <input
                name="openDate" type="date" defaultValue={defaultValues?.openDate}
                className={field("openDate")}
                onChange={() => setErrors((p) => ({ ...p, openDate: undefined }))}
              />
              <p className="text-xs text-gray-400 mt-1">一度登録すると変更できません。正確に入力してください。</p>
              {errors.openDate && <p className="text-xs text-red-500 mt-1">{errors.openDate}</p>}
            </>
          )}
        </div>

        {/* 営業時間 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">営業時間</label>
          <input
            name="hoursText" defaultValue={defaultValues?.hoursText ?? ""}
            className={INPUT_NORMAL} placeholder="例: 11:00〜22:00（水曜定休）"
          />
        </div>

        {/* 説明 */}
        <div data-field="description">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description" rows={3} defaultValue={defaultValues?.description}
            className={`${field("description")} resize-none`}
            placeholder="お店の特徴や魅力を教えてください（10〜500文字）"
            onChange={() => setErrors((p) => ({ ...p, description: undefined }))}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* メイン画像 */}
        <ImageUpload name="imageUrl" label="メイン画像" defaultValue={defaultValues?.imageUrl} />

        {/* サブ写真（並び替え対応） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">写真（最大5枚）</label>
          <p className="text-xs text-gray-400 mb-3">↑↓ で順番を変更できます。1枚目が店舗ページの先頭に表示されます。</p>
          <div className="space-y-3">
            {photos.map((url, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex flex-col gap-1 pt-2">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => movePhoto(i, i - 1)}
                    className="text-gray-400 hover:text-orange-500 disabled:opacity-20 disabled:cursor-not-allowed text-xs leading-none p-0.5"
                    aria-label="上へ"
                  >▲</button>
                  <button
                    type="button"
                    disabled={i === photos.length - 1}
                    onClick={() => movePhoto(i, i + 1)}
                    className="text-gray-400 hover:text-orange-500 disabled:opacity-20 disabled:cursor-not-allowed text-xs leading-none p-0.5"
                    aria-label="下へ"
                  >▼</button>
                </div>
                <div className="flex-1">
                  <ImageUpload
                    key={`${i}-${url ?? ""}`}
                    name={`photo${i + 1}`}
                    defaultValue={url}
                    onUpload={(newUrl) =>
                      setPhotos((prev) => {
                        const next = [...prev];
                        next[i] = newUrl;
                        return next;
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ステータス */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
          <select name="status" defaultValue={defaultValues?.status ?? "active"} className={INPUT_NORMAL}>
            <option value="active">営業中</option>
            <option value="temporarily_closed">休業中</option>
            <option value="closed">閉店</option>
          </select>
        </div>

        {/* タグ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
          <input
            name="tags" className={INPUT_NORMAL}
            defaultValue={defaultValues?.tags?.join(", ")}
            placeholder="例: ランチ, 個室, テラス席（カンマ区切り）"
          />
        </div>

        {/* SNS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SNS・公式サイト</label>
          <div className="space-y-2">
            {SNS_FIELDS.map((f) => (
              <div key={f.name} className="flex items-center gap-2 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.icon} alt="" className="w-5 h-5 shrink-0" />
                <input
                  name={f.name}
                  value={snsValues[f.name]}
                  onChange={(e) => setSnsValues((p) => ({ ...p, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                  className={`${INPUT_NORMAL} flex-1`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SNS 最新投稿 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SNS最新投稿（埋め込み表示）</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/x.png" alt="" className="w-5 h-5 shrink-0" />
              <input
                name="post_twitter_url"
                value={postTwitterUrl}
                onChange={(e) => setPostTwitterUrl(e.target.value)}
                placeholder="X (Twitter) 投稿URL 例: https://x.com/user/status/..."
                className={`${INPUT_NORMAL} flex-1`}
              />
            </div>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/instagram.svg" alt="" className="w-5 h-5 shrink-0" />
              <input
                name="post_instagram_url"
                value={postInstagramUrl}
                onChange={(e) => setPostInstagramUrl(e.target.value)}
                placeholder="Instagram 投稿URL 例: https://www.instagram.com/p/..."
                className={`${INPUT_NORMAL} flex-1`}
              />
            </div>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/tiktok.png" alt="" className="w-5 h-5 shrink-0" />
              <input
                name="post_tiktok_url"
                value={postTiktokUrl}
                onChange={(e) => setPostTiktokUrl(e.target.value)}
                placeholder="TikTok 投稿URL 例: https://www.tiktok.com/@user/video/..."
                className={`${INPUT_NORMAL} flex-1`}
              />
            </div>
          </div>
        </div>

        {/* ボタン群 */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handlePreview}
            className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
          >
            保存前にプレビューを確認する
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                保存中...
              </span>
            ) : submitLabel}
          </button>
        </div>
      </form>

      {/* プレビューモーダル */}
      {showPreview && previewData && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPreview(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">店舗情報プレビュー</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors text-xl font-light leading-none"
                aria-label="閉じる"
              >✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* メイン画像 */}
              {previewData.imageUrl && (
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewData.imageUrl}
                    alt={previewData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* 基本情報 */}
              <div>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{previewData.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{previewData.category}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    previewData.status === "active"             ? "bg-green-100 text-green-700" :
                    previewData.status === "temporarily_closed" ? "bg-yellow-100 text-yellow-700" :
                                                                  "bg-gray-100 text-gray-500"
                  }`}>
                    {STATUS_LABEL[previewData.status] ?? previewData.status}
                  </span>
                </div>
              </div>

              {/* 詳細情報 */}
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex gap-2">
                  <span className="text-gray-400 w-20 shrink-0">住所</span>
                  <span>{previewData.address}</span>
                </div>
                {previewData.openDate && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-20 shrink-0">オープン日</span>
                    <span>{previewData.openDate}</span>
                  </div>
                )}
                {previewData.hoursText && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-20 shrink-0">営業時間</span>
                    <span>{previewData.hoursText}</span>
                  </div>
                )}
              </div>

              {/* 説明 */}
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{previewData.description}</p>
              </div>

              {/* サブ写真 */}
              {previewData.photos.some(Boolean) && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">写真</p>
                  <div className="grid grid-cols-3 gap-2">
                    {previewData.photos.filter(Boolean).map((url, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`写真${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* タグ */}
              {previewData.tags && (
                <div className="flex flex-wrap gap-2">
                  {previewData.tags.split(/[,、]/).map((t) => t.trim()).filter(Boolean).map((tag) => (
                    <span key={tag} className="bg-orange-50 text-orange-600 text-xs font-medium px-2.5 py-1 rounded-full border border-orange-100">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* SNSリンク */}
              {Object.keys(previewData.sns).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">SNS・公式サイト</p>
                  <div className="flex flex-wrap gap-2">
                    {SNS_FIELDS.filter((f) => previewData.sns[f.name.replace("sns_", "")]).map((f) => (
                      <a
                        key={f.name}
                        href={previewData.sns[f.name.replace("sns_", "")]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:shadow-sm transition-shadow text-gray-700"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.icon} alt="" className="w-4 h-4" />
                        <span>{f.placeholder.replace(" URL", "")}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* 地図（住所ベース） */}
              {previewData.address && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">アクセス</p>
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(previewData.address)}&output=embed&hl=ja`}
                    className="w-full rounded-xl border border-gray-200"
                    style={{ height: 240 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}

              {/* SNS最新投稿 */}
              {(previewData.postTwitterUrl || previewData.postInstagramUrl || previewData.postTiktokUrl) && (
                <SnsPostEmbed
                  twitterPostUrl={previewData.postTwitterUrl || null}
                  instagramPostUrl={previewData.postInstagramUrl || null}
                  tiktokPostUrl={previewData.postTiktokUrl || null}
                />
              )}

              {/* 審査メモ */}
              {!isEdit && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
                  このプレビューは登録後の表示イメージです。実際の公開には審査（3営業日以内）が必要です。
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                修正する
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSubmitting(true);
                  formRef.current?.requestSubmit();
                }}
                className="flex-1 bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
