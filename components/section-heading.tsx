type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p className="section-label text-[0.68rem] font-semibold text-sand-200/70">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-sand-50 md:text-4xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-sand-100/78 md:text-base">{description}</p>
    </div>
  );
}
