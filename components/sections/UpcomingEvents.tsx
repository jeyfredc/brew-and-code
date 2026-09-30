import { BookingDialog } from "@/components/booking/BookingDialog";
import { Container } from "@/components/ui/Container";
import type { EventOccurrence } from "@/data/events";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import { formatEventDate, formatEventTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

export function UpcomingEvents({ lang, dict, events }: { lang: Locale; dict: Dictionary; events: EventOccurrence[] }) {
  return (
    <section aria-labelledby="events-title" className="py-16 lg:py-24">
      <Container>
        <h2 id="events-title" className="font-display text-4xl font-extrabold">{dict.events.title}</h2>
        <p className="mt-3 max-w-[40ch] text-lg text-muted">{dict.events.intro}</p>
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {events.map((event) => {
            const copy = dict.events.items[event.id];
            return (
              <li key={event.startsAt.toISOString()} className="rounded-md border border-line bg-surface p-6">
                <time dateTime={event.startsAt.toISOString()} className="font-display text-xl font-bold">
                  {formatEventDate(event.startsAt, lang)}
                </time>
                <p className="mt-1 text-sm font-semibold text-muted">{formatEventTime(event.startsAt, event.endsAt, lang)}</p>
                <h3 className="mt-4 font-display text-2xl font-bold">{copy.title}</h3>
                <p className="mt-2 max-w-[45ch] text-muted">{copy.description}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-10">
          <BookingDialog labels={dict.booking} lang={lang} variant="primary" />
        </div>
      </Container>
    </section>
  );
}
