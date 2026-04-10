"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const BTN = "p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 disabled:opacity-40";
const ACTIVE = "bg-orange-100 text-orange-600";

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-[240px] px-4 py-3 text-sm text-gray-800 focus:outline-none leading-relaxed",
      },
    },
  });

  // 外から value がリセットされたとき（送信後クリア）
  useEffect(() => {
    if (!editor) return;
    if (value === "" && editor.getHTML() !== "<p></p>") {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  if (!editor) return null;

  function setLink() {
    const url = window.prompt("URLを入力してください", "https://");
    if (!url) { editor!.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-orange-400 transition-colors">
      {/* ツールバー */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${BTN} ${editor.isActive("bold") ? ACTIVE : ""} font-bold text-xs w-7 h-7`}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${BTN} ${editor.isActive("italic") ? ACTIVE : ""} italic text-xs w-7 h-7`}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${BTN} ${editor.isActive("underline") ? ACTIVE : ""} underline text-xs w-7 h-7`}>U</button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${BTN} ${editor.isActive("heading", { level: 2 }) ? ACTIVE : ""} text-xs px-2 h-7`}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`${BTN} ${editor.isActive("heading", { level: 3 }) ? ACTIVE : ""} text-xs px-2 h-7`}>H3</button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${BTN} ${editor.isActive("bulletList") ? ACTIVE : ""} text-xs w-7 h-7`}>≡</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${BTN} ${editor.isActive("orderedList") ? ACTIVE : ""} text-xs w-7 h-7`}>1.</button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`${BTN} ${editor.isActive({ textAlign: "left" }) ? ACTIVE : ""} text-xs w-7 h-7`}>←</button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`${BTN} ${editor.isActive({ textAlign: "center" }) ? ACTIVE : ""} text-xs w-7 h-7`}>↔</button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`${BTN} ${editor.isActive({ textAlign: "right" }) ? ACTIVE : ""} text-xs w-7 h-7`}>→</button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button type="button" onClick={setLink}
          className={`${BTN} ${editor.isActive("link") ? ACTIVE : ""} text-xs px-2 h-7`}>
          {editor.isActive("link") ? "リンク解除" : "リンク"}
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={`${BTN} text-xs w-7 h-7`}>↩</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={`${BTN} text-xs w-7 h-7`}>↪</button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
