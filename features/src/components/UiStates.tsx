import type { ReactNode } from "react";

type Props = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
  children: ReactNode;
};

export function UiStates({
  loading,
  error,
  empty,
  emptyText = "Veri yok.",
  children,
}: Props) {
  if (loading) {
    return (
      <p className="text-sm text-ink-muted" role="status">
        Yükleniyor…
      </p>
    );
  }
  if (error) {
    return (
      <p
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
        role="alert"
      >
        {error}
      </p>
    );
  }
  if (empty) {
    return <p className="text-sm text-ink-muted">{emptyText}</p>;
  }
  return <>{children}</>;
}

export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm border border-black/[0.03]">
      <h2 className="text-xl font-serif font-bold tracking-tight text-ink">{title}</h2>
      {subtitle ? (
        <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
