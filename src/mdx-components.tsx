import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { headingId } from "@/lib/heading";

/** 從 React children 抽出純文字，用來生成標題錨點 */
function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (typeof node === "object" && "props" in node) return textOf((node as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  return "";
}

/** 師傅提醒：工坊視角的行內提示 */
export function MasterNote({ children }: { children: React.ReactNode }) {
  return (
    <aside className="bb-note">
      <span className="bb-note__label">師傅提醒：</span>
      {children}
    </aside>
  );
}

const components: MDXComponents = {
  h2: ({ children, id }) => <h2 id={id || headingId(textOf(children))}>{children}</h2>,
  h3: ({ children, id }) => <h3 id={id || headingId(textOf(children))}>{children}</h3>,
  a: ({ href = "", children }) =>
    href.startsWith("http") ? (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <Link href={href}>{children}</Link>
    ),
  table: ({ children }) => (
    <div className="bb-table">
      <table>{children}</table>
    </div>
  ),
  MasterNote,
};

export function useMDXComponents(overrides: MDXComponents): MDXComponents {
  return { ...components, ...overrides };
}
