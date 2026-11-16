import { PageHeader } from "./PageHeader";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="rounded-sm border border-dashed border-beige-300 p-8 text-center">
        <p className="font-display text-xl">Esta área será liberada nas próximas etapas.</p>
        <p className="mt-2 text-sm text-ink-soft">A estrutura de dados e a navegação já estão prontas.</p>
      </div>
    </>
  );
}
