import React, { useEffect, useRef } from "react";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/xml/xml";
import "codemirror/mode/css/css";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";
import ACTIONS from "../Actions";
import { toast } from "react-hot-toast";

const LANGUAGE_MODES = {
  'python3': { name: 'python' },
  'javascript': { name: 'javascript', json: true },
  'java': { name: 'text/x-java' },
  'cpp': { name: 'text/x-c++src' },
  'nodejs': { name: 'javascript' },
  'c': { name: 'text/x-csrc' },
  'ruby': { name: 'ruby' },
  'go': { name: 'go' },
  'scala': { name: 'text/x-scala' },
  'bash': { name: 'shell' },
  'sql': { name: 'sql' },
  'pascal': { name: 'pascal' },
  'csharp': { name: 'text/x-csharp' },
  'php': { name: 'php' },
  'swift': { name: 'swift' },
  'rust': { name: 'rust' },
  'r': { name: 'r' }
};

function Editor({ socketRef, roomId, onCodeChange, isAdmin, isHost, language, code ,username }) {
  const editorRef = useRef(null);

  // Initialize editor
  useEffect(() => {
    async function init() {
      const canEdit = isAdmin || isHost;
      editorRef.current = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: LANGUAGE_MODES[language]?.name || 'javascript',
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          readOnly: !canEdit,
          cursorBlinkRate: !canEdit ? -1 : 530,
          direction: "ltr",
          inputStyle: "contenteditable",
          lineWrapping: true,
          indentUnit: 2,
          smartIndent: true,
          tabSize: 2,
          matchBrackets: true,
          autofocus: canEdit,
          dragDrop: false,
          keyMap: "default",
          viewportMargin: 10,
          copyWithEmptySelection: true
        }
      );

      // Set editor size after initialization
      if (editorRef.current) {
        editorRef.current.setSize("100%", "100%");
editorRef.current.getWrapperElement().style.overflow = "auto"; // ✅ Enables scrolling

        editorRef.current.setValue(code || '');
        editorRef.current.refresh();

        let typingTimeout = null;
let lastCode = "";

editorRef.current.on("change", (instance, changes) => {
    const { origin } = changes;
    const newCode = instance.getValue();

    if (origin !== "setValue" && origin !== "remote") {
        if (canEdit) {
            onCodeChange(newCode);

            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                if (newCode !== lastCode && Math.abs(newCode.length - lastCode.length) >= 10) {
                    lastCode = newCode;
                    socketRef.current?.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code: newCode,
                        username: localStorage.getItem("username") || "Guest",
                    });
                }
            }, 1000); // Only log changes after 1 second of inactivity
        } else {
            instance.setValue(code || '');
            toast.error("You are in view-only mode");
        }
    }
});

      }
    }

    init();

    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
        editorRef.current = null;
      }
    };

  }, [isAdmin, isHost]); // Reinitialize when role changes

  // Update code when it changes externally
  useEffect(() => {
    if (editorRef.current && code !== undefined) {
      const currentValue = editorRef.current.getValue();
      if (code !== currentValue) {
        const cursor = editorRef.current.getCursor();
        editorRef.current.setValue(code);
        if (isAdmin || isHost) {
          editorRef.current.setCursor(cursor);
        }
      }
    }
  }, [code,isAdmin,isHost]);

  // Update editor mode when language changes
  useEffect(() => {
    if (editorRef.current && language) {
      try {
        const mode = LANGUAGE_MODES[language]?.name || 'javascript';
        editorRef.current.setOption("mode", mode);
        editorRef.current.refresh();
      } catch (err) {
        console.error("Error updating language mode:", err);
      }
    }
  }, [language]);
  return (
    <div className="editor-wrapper">
      {!(isAdmin || isHost) && (
        <div className="viewer-overlay">
          View Only Mode - You can view and copy the code, but cannot edit it
        </div>
      )}
      <textarea id="realtimeEditor"></textarea>
      <style jsx>{`
        .editor-wrapper {
          position: relative;
          height: 100%;
          width: 100%;
        }

        .viewer-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 10px;
          background: #1d1e22;
          color: #fff;
          text-align: center;
          border-bottom: 1px solid #333;
          z-index: 1000;
          font-size: 14px;
        }

       .CodeMirror {
  height: 100% !important;
  overflow: hidden !important; /* ✅ Prevents extra scrollbar */
  max-height: calc(100vh - 50px);
          padding-top: ${!(isAdmin || isHost) ? '40px' : '0'};
        }
.CodeMirror-scroll {
  overflow-y: auto !important; /* ✅ Only one scrollbar remains */
  max-height: calc(100vh - 100px);
}
        .CodeMirror-selected {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
.CodeMirror::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.CodeMirror::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.CodeMirror::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}
  .CodeMirror::-webkit-scrollbar-thumb:hover {
  background: #555;
}
        .CodeMirror-cursor {
          border-left: 2px solid #fff !important;
        }

        /* Make sure viewers can see and select text */
        .CodeMirror.cm-s-dracula {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }

        /* Hide cursor for viewers */
        .CodeMirror-readonly .CodeMirror-cursor {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

export default Editor;