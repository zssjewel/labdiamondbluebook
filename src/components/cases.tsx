import type { Case } from "@/config/cases";
import { isDemoCases } from "@/config/cases";
import { Demo } from "@/components/demo";
import { imgProps } from "@/lib/images";

/** 作品卡：相片、標題、規格。首頁同 /cases 共用 */
export function CaseCard({ item, sizes, i = 0 }: { item: Case; sizes: string; i?: number }) {
  const cover = item.images[0];
  return (
    <article className="bb-case" data-reveal style={{ "--i": i % 3 } as React.CSSProperties}>
      {cover && (
        <figure className="bb-case__fig">
          <img {...imgProps(cover.src, sizes)} alt={cover.alt} width={1000} height={1000} loading="lazy" decoding="async" />
        </figure>
      )}
      <div className="bb-case__body">
        <p className="bb-case__type">
          {item.type}
          <Demo show={isDemoCases} />
        </p>
        <h3>{item.title}</h3>
        <dl>
          <div>
            <dt>主石</dt>
            <dd>{item.stone}</dd>
          </div>
          <div>
            <dt>金屬</dt>
            <dd>{item.metal}</dd>
          </div>
          {item.priceRange && (
            <div>
              <dt>價錢</dt>
              <dd>{item.priceRange}</dd>
            </div>
          )}
          {item.duration && (
            <div>
              <dt>工期</dt>
              <dd>{item.duration}</dd>
            </div>
          )}
        </dl>
        <p className="bb-case__story">{item.story}</p>
      </div>
    </article>
  );
}
