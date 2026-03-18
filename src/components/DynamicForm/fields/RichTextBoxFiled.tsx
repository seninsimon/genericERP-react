import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export default function RichTextField({ column, value, isView, onChange }: any) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editable: !isView,
    onUpdate: ({ editor }) => {
      onChange(column.name, editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // VIEW MODE
  if (isView) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#1F2937]">
          {column.label}
        </label>

        <div
          className="border border-gray-300 rounded-lg p-3 bg-[#F9FAFB]"
          dangerouslySetInnerHTML={{ __html: value || "-" }}
        />
      </div>
    );
  }

  // EDIT MODE
  if (!editor) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#1F2937]">
        {column.label}
      </label>

      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Link />
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content style={{ minHeight: 150 }} />
      </RichTextEditor>
    </div>
  );
}