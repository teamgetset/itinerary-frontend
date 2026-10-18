import { Children, type ReactNode } from "react";
import { Document, Font, Image as PdfImage, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Currency, TimelineItem, TourPackage } from "@/types";
import { formatClock, formatCurrencyCode, formatDuration, formatPlace } from "@/lib/format";
import { TRAVELLER_TYPES } from "@/lib/pricing";

/*
 * The itinerary PDF generated from the package page's content, for packages without an uploaded PDF
 * (served by app/packages/[slug]/itinerary.pdf). Same data and same rules as the page: a section without
 * content is left out, nothing is invented.
 */

export interface PdfPicture {
  data: Buffer;
  format: "jpg" | "png";
}

// Words are kept whole at line ends (no hyphenation).
Font.registerHyphenationCallback((word) => [word]);

// ponytail: the PDF's built-in Helvetica draws Latin-1 and common punctuation (all live content today) with no font
// to embed; anything else is swapped or dropped rather than printed as garbage. Embed a Unicode font for other scripts.
const WIN_ANSI_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
const printable = (text: string) =>
  text
    .replace(/\s*[→⇒➔]\s*/g, " to ")
    .replace(/₹\s?/g, "INR ")
    .replace(/[^\n\x20-\x7e -ÿ]/g, (char) => (WIN_ANSI_EXTRA.includes(char) ? char : ""));

const C = { navy: "#00386c", night: "#002142", cobalt: "#005894", sun: "#fccc50", ink: "#0e2238", muted: "#4f6276", line: "#d6e0ea", frost: "#e6edf4" };
/** The site's "leaf" shape: only the top-right and bottom-left corners are rounded. */
const leaf = (radius: number) => ({ borderTopRightRadius: radius, borderBottomLeftRadius: radius });
const INDENT = 46;

const s = StyleSheet.create({
  // Line height is set on each text style, always with its font size (react-pdf 4.9 otherwise scales it from its own
  // default size); inherited from the page or a view, it misplaces page breaks and hides the fixed footer.
  page: { paddingTop: 34, paddingBottom: 54, paddingHorizontal: 40, fontFamily: "Helvetica", fontSize: 9.5, color: C.ink },
  body: { fontSize: 9.5, lineHeight: 1.45 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  logo: { width: 110, height: 34 },
  tag: { backgroundColor: C.sun, color: C.night, paddingVertical: 4, paddingHorizontal: 9, fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 1, ...leaf(7) },
  place: { marginTop: 18, color: C.cobalt, fontFamily: "Helvetica-Bold", fontSize: 10 },
  title: { marginTop: 4, fontSize: 26, lineHeight: 1.15, fontFamily: "Helvetica-Bold", color: C.navy },
  tagline: { marginTop: 6, fontSize: 11.5, lineHeight: 1.35, color: C.muted },
  hero: { marginTop: 16, width: "100%", height: 210, objectFit: "cover", ...leaf(16) },
  pass: { marginTop: 16, flexDirection: "row", borderWidth: 1, borderColor: C.line, ...leaf(14) },
  passCell: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderLeftWidth: 1, borderLeftColor: C.line, borderLeftStyle: "dashed" },
  label: { fontSize: 6.8, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: C.muted, textTransform: "uppercase" },
  code: { marginTop: 4, fontSize: 15, lineHeight: 1.2, fontFamily: "Helvetica-Bold", color: C.navy },
  value: { marginTop: 3, fontSize: 9.5, lineHeight: 1.35, fontFamily: "Helvetica-Bold", color: C.navy },
  small: { fontSize: 8.2, lineHeight: 1.45, color: C.muted },
  h2: { marginTop: 24, marginBottom: 9, fontSize: 15, fontFamily: "Helvetica-Bold", color: C.navy },
  paragraph: { marginBottom: 6, fontSize: 10, lineHeight: 1.5 },
  pair: { flexDirection: "row", columnGap: 18 },
  half: { width: "47%" },
  bullet: { flexDirection: "row", marginBottom: 4 },
  bulletMark: { width: 6, height: 6, marginTop: 3.5, marginRight: 7, backgroundColor: C.sun, ...leaf(2.5) },
  dayHead: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  badge: { width: 34, height: 34, marginRight: 12, backgroundColor: C.navy, color: "#ffffff", alignItems: "center", justifyContent: "center", ...leaf(8) },
  badgeWord: { fontSize: 5.6, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: C.sun },
  badgeNumber: { fontSize: 12, lineHeight: 1.1, fontFamily: "Helvetica-Bold" },
  dayTitle: { flex: 1, fontSize: 11.5, fontFamily: "Helvetica-Bold", color: C.navy },
  dayText: { marginTop: 4, fontSize: 9.5, lineHeight: 1.45 },
  dayPhoto: { marginTop: 6, width: 170, height: 100, objectFit: "cover", ...leaf(8) },
  dayEnd: { marginLeft: INDENT, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.frost },
  step: { flexDirection: "row", marginTop: 5 },
  stepTime: { width: 50, fontFamily: "Helvetica-Bold", color: C.cobalt },
  bold: { fontFamily: "Helvetica-Bold" },
  meta: { marginTop: 6, fontSize: 8.4, lineHeight: 1.4, color: C.muted },
  card: { marginBottom: 8, padding: 10, borderWidth: 1, borderColor: C.line, ...leaf(10) },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.frost, paddingVertical: 6 },
  cell: { flex: 1, paddingRight: 8 },
  amount: { flex: 1, fontFamily: "Helvetica-Bold", color: C.navy, fontSize: 10.5 },
  fact: { width: "47%", marginBottom: 9, paddingLeft: 9, borderLeftWidth: 2, borderLeftColor: C.sun },
  contact: { marginTop: 26, padding: 16, flexDirection: "row", columnGap: 18, backgroundColor: C.night, color: "#ffffff", ...leaf(14) },
  contactLabel: { fontSize: 6.8, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: C.sun, marginBottom: 4 },
  link: { color: "#ffffff", textDecoration: "none", fontSize: 9.5, lineHeight: 1.45 },
  footer: { position: "absolute", left: 40, right: 40, bottom: 24, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: C.muted },
});

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** A section whose heading stays on the same page as its first block (never alone at the bottom of a page). */
function Section({ title, children }: { title: string; children: ReactNode }) {
  const [first, ...rest] = Children.toArray(children);
  return (
    <View>
      <View wrap={false}>
        <Text style={s.h2}>{title}</Text>
        {first}
      </View>
      {rest}
    </View>
  );
}

/** Two-column rows; a row is never split across pages. */
const pairs = (cells: ReactNode[]) =>
  Array.from({ length: Math.ceil(cells.length / 2) }, (_, row) => (
    <View key={row} style={s.pair} wrap={false}>
      {cells.slice(row * 2, row * 2 + 2)}
    </View>
  ));

const bullets = (items: string[], style = {}) =>
  items.map((item, index) => (
    <View key={index} style={[s.bullet, style]} wrap={false}>
      <View style={s.bulletMark} />
      <Text style={[s.body, { flex: 1 }]}>{item}</Text>
    </View>
  ));

function Step({ item }: { item: TimelineItem }) {
  const description = item.description ?? item.activity?.description;
  return (
    <View style={s.step} wrap={false}>
      <Text style={s.stepTime}>{item.time ? formatClock(item.time) : ""}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.body}>
          <Text style={s.bold}>{item.title}</Text>
          {item.location ? <Text style={{ color: C.muted }}>{`, ${item.location}`}</Text> : null}
        </Text>
        {description && <Text style={s.small}>{description}</Text>}
      </View>
    </View>
  );
}

export function ItineraryDocument({
  pkg: source,
  currencies,
  logo,
  hero,
  dayPhotos,
  pageUrl,
  asOf,
}: {
  pkg: TourPackage;
  /** The site's currencies, in its order: one price column each. */
  currencies: Currency[];
  logo: PdfPicture;
  hero: PdfPicture | null;
  /** By itinerary day, in order; null where a day has no photo or it could not be loaded. */
  dayPhotos: (PdfPicture | null)[];
  pageUrl: string;
  /** When this PDF was made, e.g. "18 Oct 2026". */
  asOf: string;
}) {
  // Every text in the package, made printable with the built-in font.
  const pkg: TourPackage = JSON.parse(JSON.stringify(source), (_key, value) => (typeof value === "string" ? printable(value) : value));
  const { branch } = pkg;
  const from = pkg.route.from;
  const adultFrom = currencies.filter((c) => pkg.prices.ADULT[c.code] !== undefined).map((c) => formatCurrencyCode(pkg.prices.ADULT[c.code]!, c));
  const anyPrice = TRAVELLER_TYPES.some(({ priceType }) => currencies.some((c) => pkg.prices[priceType][c.code] !== undefined));
  const stays = pkg.hotels ?? [];
  const goodToKnow = [...pkg.destination.facts.map((f) => ({ title: f.label, description: f.value })), ...pkg.goodToKnow];
  const contact = [branch.whatsapp && `WhatsApp +${branch.whatsapp}`, branch.phone && `Phone ${branch.phone}`, branch.email].filter(Boolean) as string[];

  /** A day as page-breakable blocks: its heading, then its parts; the last part keeps the overnight and meals line. */
  const dayBlocks = (day: TourPackage["itinerary"][number], index: number) => {
    const photo = dayPhotos[index];
    const overnight = day.hotel ? `Overnight at ${day.hotel.name}` : day.stay ? `Overnight in ${day.stay}` : null;
    const meta = [overnight, day.meals?.length ? `Meals: ${day.meals.join(", ")}` : null].filter(Boolean).join("   ·   ");
    const parts = [
      day.description ? <Text style={s.dayText}>{day.description}</Text> : null,
      photo ? <PdfImage src={photo} style={s.dayPhoto} /> : null,
      ...day.timeline.map((item, i) => <Step key={i} item={item} />),
    ].filter(Boolean);
    const last = parts.pop();
    return [
      <View key={`head-${day.day}`} style={s.dayHead} wrap={false} minPresenceAhead={40}>
        <View style={s.badge}>
          <Text style={s.badgeWord}>DAY</Text>
          <Text style={s.badgeNumber}>{String(day.day).padStart(2, "0")}</Text>
        </View>
        <Text style={s.dayTitle}>{day.title}</Text>
      </View>,
      ...parts.map((part, i) => (
        <View key={`part-${day.day}-${i}`} style={{ marginLeft: INDENT }}>
          {part}
        </View>
      )),
      <View key={`end-${day.day}`} style={s.dayEnd} wrap={false}>
        {last}
        {meta && <Text style={s.meta}>{meta}</Text>}
      </View>,
    ];
  };

  return (
    <Document title={`${pkg.title} itinerary`} author="GETSET Tours & Travels" subject={pkg.tagline} creator="GETSET Tours & Travels" language="en">
      <Page size="A4" style={s.page}>
        <>
          <View style={s.head}>
            <PdfImage src={logo} style={s.logo} />
            <Text style={s.tag}>{`${branch.name.toUpperCase()} BRANCH ITINERARY`}</Text>
          </View>

          <Text style={s.place}>{[formatPlace(pkg.destination), pkg.category].filter(Boolean).join(" · ")}</Text>
          <Text style={s.title}>{pkg.title}</Text>
          {pkg.tagline && <Text style={s.tagline}>{pkg.tagline}</Text>}
          {hero && <PdfImage src={hero} style={s.hero} />}

          <View style={s.pass} wrap={false}>
            <View style={[s.passCell, { borderLeftWidth: 0 }]}>
              <Text style={s.label}>Route</Text>
              <Text style={s.code}>{[from.map((a) => a.code).join(" / ") || branch.name, pkg.route.to.code].filter(Boolean).join(" – ")}</Text>
              <Text style={[s.small, { marginTop: 2 }]}>{[from.map((a) => a.city).join(" or "), pkg.route.to.city].filter(Boolean).join(" to ")}</Text>
            </View>
            <View style={s.passCell}>
              <Text style={s.label}>Duration</Text>
              <Text style={s.value}>{formatDuration(pkg.duration)}</Text>
            </View>
            {pkg.bestTime && (
              <View style={s.passCell}>
                <Text style={s.label}>Best time</Text>
                <Text style={s.value}>{pkg.bestTime}</Text>
              </View>
            )}
            <View style={s.passCell}>
              <Text style={s.label}>{adultFrom.length ? "Per adult, from" : "Price"}</Text>
              {adultFrom.length ? (
                adultFrom.map((price) => (
                  <Text key={price} style={s.value}>
                    {price}
                  </Text>
                ))
              ) : (
                <Text style={s.value}>On request</Text>
              )}
            </View>
          </View>

          {(pkg.overview.length > 0 || pkg.highlights.length > 0) && (
            <Section title="Overview">
              {pkg.overview.map((paragraph, index) => (
                <Text key={index} style={s.paragraph}>
                  {paragraph}
                </Text>
              ))}
              {pairs(bullets(pkg.highlights, s.half))}
            </Section>
          )}

          {pkg.itinerary.length > 0 && <Section title="Day by day">{pkg.itinerary.flatMap(dayBlocks)}</Section>}

          {stays.length > 0 && (
            <Section title="Where you stay">
              {pairs(
                stays.map((stay, index) => {
                  const details = [stay.city, stay.nights && plural(stay.nights, "night"), stay.category, stay.roomType, stay.mealPlan].filter(Boolean);
                  return (
                    <View key={index} style={[s.card, s.half]}>
                      <Text style={[s.bold, { color: C.navy }]}>{stay.name}</Text>
                      {details.length > 0 && <Text style={s.small}>{details.join(", ")}</Text>}
                    </View>
                  );
                }),
              )}
            </Section>
          )}

          {pkg.activities.length > 0 && (
            <Section title="Experiences included">
              {pkg.activities.map((activity, index) => (
                <View key={index} style={s.card} wrap={false}>
                  <Text style={[s.bold, { color: C.navy }]}>{activity.name}</Text>
                  {activity.location && <Text style={s.small}>{activity.location}</Text>}
                  {activity.description && <Text style={[s.body, { marginTop: 3 }]}>{activity.description}</Text>}
                </View>
              ))}
            </Section>
          )}

          <View wrap={false}>
            <Text style={s.h2}>Prices</Text>
            {anyPrice ? (
              <>
                <View style={[s.row, { paddingTop: 0 }]}>
                  <Text style={[s.cell, s.label]}>Per person</Text>
                  {currencies.map((currency) => (
                    <Text key={currency.code} style={[s.cell, s.label]}>
                      {currency.code}
                    </Text>
                  ))}
                </View>
                {TRAVELLER_TYPES.map(({ priceType, one, ages }) => (
                  <View key={priceType} style={s.row}>
                    <Text style={s.cell}>
                      <Text style={s.bold}>{one.charAt(0).toUpperCase() + one.slice(1)}</Text>
                      <Text style={{ color: C.muted }}>{`  ${ages}`}</Text>
                    </Text>
                    {currencies.map((currency) => {
                      const amount = pkg.prices[priceType][currency.code];
                      return (
                        <Text key={currency.code} style={amount === undefined ? [s.cell, { color: C.muted }] : s.amount}>
                          {amount === undefined ? "On request" : formatCurrencyCode(amount, currency)}
                        </Text>
                      );
                    })}
                  </View>
                ))}
                <Text style={[s.small, { marginTop: 6 }]}>Prices depend on travel dates and availability, and are confirmed when you book.</Text>
              </>
            ) : (
              <Text style={s.body}>Prices on request: contact us for a quote for your dates.</Text>
            )}
          </View>

          {(pkg.inclusions.length > 0 || pkg.exclusions.length > 0) && (
            <Section title="What's included">
              <View style={s.pair}>
                {pkg.inclusions.length > 0 && (
                  <View style={[s.card, s.half]}>
                    <Text style={[s.bold, { color: C.navy, marginBottom: 5 }]}>Included</Text>
                    {bullets(pkg.inclusions)}
                  </View>
                )}
                {pkg.exclusions.length > 0 && (
                  <View style={[s.card, s.half]}>
                    <Text style={[s.bold, { color: C.navy, marginBottom: 5 }]}>Not included</Text>
                    {bullets(pkg.exclusions)}
                  </View>
                )}
              </View>
            </Section>
          )}

          {goodToKnow.length > 0 && (
            <Section title="Good to know">
              {pairs(
                goodToKnow.map((tip, index) => (
                  <View key={index} style={s.fact}>
                    {tip.description ? (
                      <>
                        <Text style={s.label}>{tip.title}</Text>
                        <Text style={[s.body, { marginTop: 2 }]}>{tip.description}</Text>
                      </>
                    ) : (
                      <Text style={s.body}>{tip.title}</Text>
                    )}
                  </View>
                )),
              )}
            </Section>
          )}

          {pkg.importantInfo.length > 0 && <Section title="Important information">{bullets(pkg.importantInfo)}</Section>}

          {pkg.terms.length > 0 && (
            <Section title="Terms and conditions">
              {pkg.terms.map((term, index) => (
                <Text key={index} style={[s.small, { marginBottom: 3 }]}>
                  {`${index + 1}. ${term}`}
                </Text>
              ))}
            </Section>
          )}

          <View style={s.contact} wrap={false}>
            <View style={{ flex: 1 }}>
              <Text style={s.contactLabel}>BOOK THIS TRIP</Text>
              {contact.map((line) => (
                <Text key={line} style={s.body}>
                  {line}
                </Text>
              ))}
              <Link src={pageUrl} style={s.link}>
                {pageUrl.replace(/^https?:\/\//, "")}
              </Link>
            </View>
            {branch.addressLines.length > 0 && (
              <View style={{ flex: 1 }}>
                <Text style={s.contactLabel}>{`${branch.name.toUpperCase()} OFFICE`}</Text>
                {branch.addressLines.map((line) => (
                  <Text key={line} style={s.body}>
                    {line}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </>

        <View style={s.footer} fixed>
          <Text>{`GETSET Tours & Travels  ·  ${pkg.title}  ·  Details as of ${asOf}`}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
