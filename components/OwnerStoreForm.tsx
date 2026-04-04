"use client";

import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import type { Store } from "@/types";

const CATEGORIES = [
  "レストラン", "カフェ", "スイーツ", "居酒屋", "ラーメン", "美容院", "ジム", "ショップ", "その他",
] as const;

const INPUT = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors";
const INPUT_NORMAL = `${INPUT} border-gray-300 focus:border-orange-400`;
const INPUT_ERROR  = `${INPUT} border-red-400 focus:border-red-400 bg-red-50`;

const SNS_FIELDS = [
  { name: "sns_website",   icon: "/icons/website.svg",   placeholder: "公式サイト URL" },
  { name: "sns_instagram", icon: "/icons/instagram.svg", placeholder: "Instagram URL" },
  { name: "sns_twitter",   icon: "/icons/x.png",         placeholder: "X (Twitter) URL" },
  { name: "sns_tiktok",    icon: "/icons/tiktok.png",    placeholder: "TikTok URL" },
  { name: "sns_line",      icon: "/icons/line.png",       placeholder: "LINE 公式アカウント URL" },
];

type Errors = Partial<Record<"name" | "address" | "openDate" | "description", string>>;

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<Store>;
  submitLabel?: string;
}

export default function OwnerStoreForm({ action, defaultValues, submitLabel = "保存する" }: Props) {
  const [errors, setErrors] = useState<Errors>({});

  function validate(fd: FormData): boolean {
    const e: Errors = {};
    const name        = (fd.get("name")        as string).trim();
    const address     = (fd.get("address")     as string).trim();
    const openDate    =  fd.get("openDate")    as string;
    const description = (fd.get("description") as string).trim();

    if (!name || name.length < 2)      e.name        = "店舗名は2文字以上で入力してください";
    if (name.length > 50)              e.name        = "店舗名は50文字以内で入力してください";
    if (!address || address.length < 5) e.address    = "正確な住所を入力してください";
    if (!openDate)                     e.openDate    = "オープン日を選択してください";
    if (!description || description.length < 10) e.description = "説明は10文字以上で入力してください";
    if (description.length > 500)     e.description = "説明は500文字以内で入力してください";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function field(key: keyof Errors) {
    return errors[key] ? INPUT_ERROR : INPUT_NORMAL;
  }

  const sns = defaultValues?.snsLinks ?? {};

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);
        if (!validate(fd)) e.preventDefault();
      }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5"
    >
      {/* 店舗名 */}
      <div>
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
      <div>
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          オープン日 <span className="text-red-500">*</span>
        </label>
        <input
          name="openDate" type="date" defaultValue={defaultValues?.openDate}
          className={field("openDate")}
          onChange={() => setErrors((p) => ({ ...p, openDate: undefined }))}
        />
        {errors.openDate && <p className="text-xs text-red-500 mt-1">{errors.openDate}</p>}
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
      <div>
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

      {/* サブ写真 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">写真（最大5枚）</label>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <ImageUpload key={i} name={`photo${i + 1}`} defaultValue={defaultValues?.photos?.[i]} />
          ))}
        </div>
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
                defaultValue={(sns as Record<string, string>)[f.name.replace("sns_", "")] ?? ""}
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
              defaultValue={defaultValues?.twitterPostUrl ?? ""}
              placeholder="X (Twitter) 投稿URL 例: https://x.com/user/status/..."
              className={`${INPUT_NORMAL} flex-1`}
            />
          </div>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/instagram.svg" alt="" className="w-5 h-5 shrink-0" />
            <input
              name="post_instagram_url"
              defaultValue={defaultValues?.instagramPostUrl ?? ""}
              placeholder="Instagram 投稿URL 例: https://www.instagram.com/p/..."
              className={`${INPUT_NORMAL} flex-1`}
            />
          </div>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/tiktok.png" alt="" className="w-5 h-5 shrink-0" />
            <input
              name="post_tiktok_url"
              defaultValue={defaultValues?.tiktokPostUrl ?? ""}
              placeholder="TikTok 投稿URL 例: https://www.tiktok.com/@user/video/..."
              className={`${INPUT_NORMAL} flex-1`}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  );
}
