import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = { title: string; href?: string; linkLabel?: string; kicker?: string };

export function SectionHeading({ title, href, linkLabel = "Ver tudo", kicker }: Props) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 sm:mb-12">
      <div>
        {kicker ? <p className="mb-2 font-display text-lg italic text-wine">{kicker}</p> : null}
        <h2 className="font-display text-4xl leading-[1.02] sm:text-6xl">{title}</h2>
      </div>
      {href ? (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-2 pb-1 text-sm">
          <span className="link-underline pb-0.5">{linkLabel}</span>
          <ArrowRight size={16} strokeWidth={1.4} className="transition-transform duration-300 ease-soft group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  );
}
