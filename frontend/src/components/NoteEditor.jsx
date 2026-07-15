import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Toolbar config: bold, italic, highlight (background color), bullet list
const modules = {
  toolbar: [
    ['bold', 'italic'],
    [{ background: [] }], // acts as "highlight"
    [{ list: 'bullet' }],
    ['clean'], // clears formatting
  ],
};

const formats = ['bold', 'italic', 'background', 'list'];

export default function NoteEditor({ value, onChange, placeholder }) {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      placeholder={placeholder}
    />
  );
}