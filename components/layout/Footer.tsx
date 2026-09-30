import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import { groupOpeningHours } from "@/lib/booking/opening-hours";
import { formatDayRange } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { siteInfo } from "@/lib/site";

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-espresso text-espuma">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-extrabold">{siteInfo.name}</p>
          <h2 className="mt-6 font-display text-lg font-bold">{dict.footer.visit}</h2>
          <address className="mt-2 not-italic text-espuma/85">
            {siteInfo.streetAddress}
            <br />
            {siteInfo.locality} {siteInfo.postalCode}
          </address>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">{dict.footer.hoursTitle}</h2>
          <dl className="mt-2 max-w-64 space-y-1 text-espuma/85">
            {groupOpeningHours().map((group) => (
              <div key={group.days.join("-")} className="flex justify-between gap-4">
                <dt>{formatDayRange(group.days, lang)}</dt>
                <dd>{group.open} – {group.close}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">{dict.footer.phoneLabel}</h2>
          <p className="mt-2 text-espuma/85">
            <a href={`tel:${siteInfo.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">
              {siteInfo.phone}
            </a>
          </p>
        </div>
      </Container>
      <div className="border-t border-white/15">
        <Container className="py-4 text-sm text-espuma/75">{dict.footer.rights.replace("{year}", String(year))}</Container>
      </div>
    </footer>
  );
}
