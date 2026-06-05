import Image from "next/image";
import { CO_PRESIDENTS, EXEC_BOARD } from "@/lib/content";

export default function Team() {
  return (
    <section id="team" className="border-t border-hairline">
      <div className="mx-auto max-w-content px-5 py-24 md:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Our team</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            The people running Helix
          </h2>
        </div>

        {/* Co-Presidents keep photos */}
        <div className="mt-12 grid gap-6 sm:max-w-md sm:grid-cols-2">
          {CO_PRESIDENTS.map((person) => (
            <div key={person.name}>
              <div className="relative aspect-square overflow-hidden rounded-xl border border-hairline bg-bg-elev">
                <Image
                  src={person.image}
                  alt={person.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 220px"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 font-display text-lg font-medium">{person.name}</p>
              <p className="text-sm text-accent">Co-President</p>
            </div>
          ))}
        </div>

        {/* Executive board as a text roster */}
        <div className="mt-16">
          <h3 className="font-display text-sm font-medium uppercase tracking-[0.18em] text-text-muted">
            Executive board
          </h3>
          <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {EXEC_BOARD.map((name) => (
              <li key={name} className="flex items-center gap-3 border-t border-hairline pt-3 text-text">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
