"use client";

import { useState } from "react";
import DatePicker from "@/components/DatePicker";
import SubmitButton from "@/components/SubmitButton";
import ImageUpload from "@/components/ImageUpload";

const INPUT = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors";

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    title?: string;
    description?: string;
    discount?: string;
    code?: string;
    expiryDate?: string;
    combinable?: boolean;
    imageUrl?: string;
  };
}

export default function CouponFormClient({ action, defaultValues }: Props) {
  const [combinable, setCombinable] = useState(defaultValues?.combinable ?? false);

  return (
    <form action={action} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label>
        <input name="title" required defaultValue={defaultValues?.title} className={INPUT} placeholder="例: オープン記念 10%OFF" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
        <input name="description" defaultValue={defaultValues?.description} className={INPUT} placeholder="例: ご来店のお客様全員に適用" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">割引内容 <span className="text-red-500">*</span></label>
          <input name="discount" required defaultValue={defaultValues?.discount} className={INPUT} placeholder="例: 10%OFF" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">クーポンコード <span className="text-red-500">*</span></label>
          <input name="code" required defaultValue={defaultValues?.code} className={INPUT} placeholder="例: OPEN2026" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">有効期限 <span className="text-red-500">*</span></label>
        <DatePicker name="expiryDate" defaultValue={defaultValues?.expiryDate} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">他のクーポンとの併用</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setCombinable(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
              !combinable
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            併用不可
          </button>
          <button
            type="button"
            onClick={() => setCombinable(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
              combinable
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-300"
            }`}
          >
            併用可
          </button>
        </div>
        <input type="hidden" name="combinable" value={String(combinable)} />
        <p className="text-xs text-gray-400 mt-1">
          {combinable ? "他のクーポンと同時に使用できます" : "他のクーポンとの同時使用はできません"}
        </p>
      </div>
      <div>
        <ImageUpload name="imageUrl" label="クーポン画像（任意）" defaultValue={defaultValues?.imageUrl} />
      </div>
      <SubmitButton label="追加する" loadingLabel="追加中..." />
    </form>
  );
}
