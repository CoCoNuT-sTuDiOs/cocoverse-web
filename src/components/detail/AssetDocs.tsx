import { docFor } from "@/lib/docs";
import { LiquidGlass } from "./LiquidGlass";

function Code({ children }: { children: string }) {
  return (
    <pre className="carve -mx-4 overflow-x-auto px-4 py-3 text-sm leading-relaxed">
      <code>{children}</code>
    </pre>

  );
}

/** The written documentation, straight from docs.ts. Rendered on the server so robots read it. */
export function AssetDocs({ slug }: { slug: string }) {
  const doc = docFor(slug);
  if (!doc) {
    return <p className="text-ink-dim">The documentation for this effect is coming soon.</p>;
  }

  return (
    <div className="space-y-16">
      <section>
        <h2 className="carve text-3xl">Use cases</h2>
        <ul className="carve-body mt-5 list-disc space-y-2 pl-6">
          {doc.useCases.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </section>

      <section>
                  <h2 className="carve text-3xl">Parameters</h2>
        <LiquidGlass className="mt-5">
          <div className="paper p-5 md:p-10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="paper-head">
                    <th className="p-3 font-bold">Name</th>
                    <th className="p-3 font-bold">Type</th>
                    <th className="p-3 font-bold">Default</th>
                    <th className="p-3 font-bold">What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.params.map((p) => (
                    <tr key={p.name} className="paper-row align-top">
                      <td className="paper-name p-3 font-mono font-bold">{p.name}</td>
                      <td className="p-3 font-mono">{p.type}</td>
                      <td className="paper-dim p-3 font-mono">{p.def ?? "—"}</td>
                      <td className="p-3">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </LiquidGlass>

      </section>

      {doc.paramGroups?.map((g) => (
        <section key={g.name}>
          <h2 className="text-3xl">{g.name}</h2>
          <p className="mt-5 text-ink-dim">{g.desc}</p>
          <div className="clay-pressed mt-5 overflow-x-auto p-2">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="text-ink-dim">
                  <th className="p-3 font-bold">Name</th>
                  <th className="p-3 font-bold">Type</th>
                  <th className="p-3 font-bold">Default</th>
                  <th className="p-3 font-bold">What it does</th>
                </tr>
              </thead>
              <tbody>
                {g.params.map((p) => (
                  <tr key={p.name} className="border-t border-line align-top">
                    <td className="p-3 font-mono text-gold-text">{p.name}</td>
                    <td className="p-3 font-mono">{p.type}</td>
                    <td className="p-3 font-mono text-ink-dim">{p.def ?? "—"}</td>
                    <td className="p-3">{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {doc.enums?.length ? (
        <section>
          <h2 className="text-3xl">Options</h2>
          <div className="mt-5 space-y-8">
            {doc.enums.map((e) => (
              <div key={e.name}>
                <h3 className="text-xl">
                  <code className="text-gold-text">{e.name}</code>
                </h3>
                <p className="mt-2 text-ink-dim">{e.desc}</p>
                <ul className="mt-3 space-y-1.5">
                  {e.values.map((v) => (
                    <li key={v.name}>
                      <code className="text-gold-text">{v.name}</code> <span className="text-ink-dim">{v.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {doc.controller ? (           
        <section>
          <h2 className="carve text-3xl">Controller</h2>
          <p className="carve-body mt-5">
            <code className="carve-gold">{doc.controller.name}</code>: {doc.controller.desc}
          </p>
          <ul className="mt-4 space-y-2">
            {doc.controller.methods.map((m) => (
              <li key={m.name}>
                <code className="carve-gold">{m.name}</code> <span className="carve-body">{m.desc}</span>
              </li>

            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="carve text-3xl">Example</h2>
        <div className="mt-5">
          <Code>{doc.example}</Code>
        </div>
      </section>

      {doc.notes?.length ? (
        <section>
           <h2 className="carve text-3xl">Good to know</h2>
          <ul className="carve-body mt-5 list-disc space-y-2 pl-6">

            {doc.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}