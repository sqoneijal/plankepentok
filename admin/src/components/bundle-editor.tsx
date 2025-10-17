import { Editor } from "@tinymce/tinymce-react";

export default function BundledEditor(props: Readonly<React.ComponentProps<typeof Editor>>) {
   return (
      <Editor
         tinymceScriptSrc="/tinymce/tinymce.min.js"
         licenseKey="gpl"
         init={{
            height: 500,
            menubar: false,
            plugins: [
               "advlist",
               "autolink",
               "lists",
               "link",
               "image",
               "charmap",
               "anchor",
               "searchreplace",
               "visualblocks",
               "code",
               "fullscreen",
               "insertdatetime",
               "media",
               "table",
               "preview",
               "help",
               "wordcount",
            ],
            toolbar:
               "undo redo | blocks | " +
               "bold italic forecolor | alignleft aligncenter " +
               "alignright alignjustify | bullist numlist outdent indent | " +
               "removeformat | help",
            content_style: 'body { font-family:"Geist", "Geist Fallback"; font-size:14px }',
         }}
         {...props}
      />
   );
}
