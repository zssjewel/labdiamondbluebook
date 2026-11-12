import Link from "@/components/link";
import type { MDXComponents } from "mdx/types";
import { headingId } from "@/lib/heading";
import { CaratStory } from "@/components/carat-on-hand";
import { ShapeGrid } from "@/components/shape-grid";
import { CASES, categoryOf } from "@/config/cases";
import { imgProps } from "@/lib/images";

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

/** 文章內嵌工坊真實作品卡：<Works slugs={["作品slug"]} note="點解睇呢件" /> */
export function Works({ slugs, note }: { slugs: string[]; note?: string }) {
  const items = slugs.map((s) => CASES.find((c) => c.slug === s)).filter((c) => c && !c.demo);
  if (!items.length) return null;
  return (
    <aside className="bb-works-inline" aria-label="工坊真實作品">
      <p className="bb-works-inline__label">工坊真實作品{note ? `：${note}` : ""}</p>
      <ul>
        {items.map((c) => (
          <li key={c!.slug}>
            <Link href={`/cases/${c!.category}/${c!.slug}`}>
              <img {...imgProps(c!.images[0].src, "160px")} alt={c!.images[0].alt} width={1000} height={1000} loading="lazy" decoding="async" />
              <span>
                <small>{categoryOf(c!.category)?.name}</small>
                <strong>{c!.title}</strong>
                <em>{c!.stone}</em>
              </span>
            </Link>
          </li>
        ))}
      </ul>
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
    // 手機上表格闊過螢幕，可以左右掃；加 tabIndex 等鍵盤用家都掃得到
    <div className="bb-table" tabIndex={0} role="region" aria-label="表格（可以左右掃）">
      <table>{children}</table>
    </div>
  ),
  MasterNote,
  CaratStory,
  Works,
  ShapeGrid,
};

export function useMDXComponents(overrides: MDXComponents): MDXComponents {
  return { ...components, ...overrides };
}
